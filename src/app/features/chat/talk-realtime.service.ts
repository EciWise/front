import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import { SendMessageRequest, WsMessageEvent, WsTypingEvent } from './chat.models';

/**
 * Capa de tiempo real sobre STOMP/WebSocket contra el servicio talk. Mantiene
 * una sola conexión y una suscripción por conversación abierta. El JWT viaja en
 * la cabecera STOMP `Authorization` del CONNECT (el backend lo valida en el
 * handshake). SSR-safe: en servidor no hay WebSocket, así que no conecta.
 */
@Injectable({ providedIn: 'root' })
export class TalkRealtimeService {
  private readonly config = inject(TALK_CONFIG);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private client: Client | null = null;
  private convSub: StompSubscription | null = null;
  private notifSub: StompSubscription | null = null;
  private openConvId: string | null = null;

  readonly connected = signal(false);

  /** Eventos de mensaje (nuevo, editado, borrado, reacción, fijado, lectura). */
  readonly events$ = new Subject<WsMessageEvent>();
  /** Indicador de "está escribiendo". */
  readonly typing$ = new Subject<WsTypingEvent>();
  /** Notificación personal de nueva conversación (payload: ConversationResponse). */
  readonly notifications$ = new Subject<unknown>();

  /** Activa la conexión STOMP si aún no está activa. Idempotente. */
  connect(): void {
    if (!this.isBrowser || this.client?.active) {
      return;
    }
    const token = this.auth.token;
    if (!token) {
      return;
    }

    this.client = new Client({
      brokerURL: this.config.talkWsUrl,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connected.set(true);
        this.subscribeNotifications();
        // Re-suscribir la conversación abierta tras una reconexión.
        if (this.openConvId) {
          this.subscribeConversation(this.openConvId);
        }
      },
      onWebSocketClose: () => this.connected.set(false),
      onStompError: () => this.connected.set(false),
    });

    this.client.activate();
  }

  /** Abre (suscribe) una conversación y deja de escuchar la anterior. */
  openConversation(conversationId: string): void {
    this.openConvId = conversationId;
    this.connect();
    if (this.client?.connected) {
      this.subscribeConversation(conversationId);
    }
  }

  /** Deja de escuchar la conversación actual (al cerrar el hilo). */
  closeConversation(): void {
    this.convSub?.unsubscribe();
    this.convSub = null;
    this.openConvId = null;
  }

  sendMessage(conversationId: string, req: SendMessageRequest): void {
    this.publish(`/app/conversation/${conversationId}.send`, JSON.stringify(req));
  }

  sendTyping(conversationId: string, typing: boolean): void {
    this.publish(`/app/conversation/${conversationId}.typing`, JSON.stringify(typing));
  }

  disconnect(): void {
    this.convSub?.unsubscribe();
    this.notifSub?.unsubscribe();
    this.convSub = null;
    this.notifSub = null;
    this.openConvId = null;
    void this.client?.deactivate();
    this.client = null;
    this.connected.set(false);
  }

  // ─── Internos ─────────────────────────────────────────────────────────────────

  private subscribeConversation(conversationId: string): void {
    this.convSub?.unsubscribe();
    this.convSub = this.client?.subscribe(`/topic/conversation.${conversationId}`, (msg) =>
      this.routeConversationFrame(msg),
    ) ?? null;
  }

  private subscribeNotifications(): void {
    this.notifSub?.unsubscribe();
    this.notifSub = this.client?.subscribe('/user/queue/notifications', (msg) => {
      this.notifications$.next(this.parse(msg));
    }) ?? null;
  }

  /** El topic de la conversación transporta tanto eventos de mensaje como typing. */
  private routeConversationFrame(msg: IMessage): void {
    const payload = this.parse(msg) as { type?: string };
    if (!payload || typeof payload.type !== 'string') {
      return;
    }
    if (payload.type === 'TYPING') {
      this.typing$.next(payload as WsTypingEvent);
    } else {
      this.events$.next(payload as WsMessageEvent);
    }
  }

  private publish(destination: string, body: string): void {
    this.connect();
    // El content-type es necesario para que el back deserialice el @Payload
    // (SendMessageRequest / boolean) con el convertidor Jackson; sin él los
    // envíos por WS (incluida la respuesta citada) y el typing se descartan.
    this.client?.publish({
      destination,
      body,
      headers: { 'content-type': 'application/json' },
    });
  }

  private parse(msg: IMessage): unknown {
    try {
      return JSON.parse(msg.body);
    } catch {
      return null;
    }
  }
}
