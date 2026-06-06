import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import {
  CensoredWord,
  Conversation,
  ConversationType,
  DirectoryUser,
  Message,
  WsMessageEvent,
  WsTypingEvent,
} from './chat.models';
import { TalkApiService } from './talk-api.service';
import { TalkRealtimeService } from './talk-realtime.service';

/** Vistas internas del panel flotante de chat. */
export type ChatView = 'list' | 'thread' | 'new' | 'moderation';

/**
 * Orquesta el estado del chat (conversaciones, conversación activa, mensajes,
 * typing) combinando la API REST y la capa de tiempo real. La UI solo lee
 * signals y llama métodos — no contiene lógica de negocio ni HttpClient.
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = inject(TalkApiService);
  private readonly realtime = inject(TalkRealtimeService);
  private readonly auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _conversations = signal<Conversation[]>([]);
  private readonly _activeId = signal<string | null>(null);
  private readonly _messages = signal<Message[]>([]);
  private readonly _typingUsers = signal<Record<string, string>>({});
  private readonly _view = signal<ChatView>('list');
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _censoredWords = signal<CensoredWord[]>([]);
  readonly censoredWords = this._censoredWords.asReadonly();
  private readonly _replyingTo = signal<Message | null>(null);
  /** Mensaje al que se está respondiendo (null = no hay respuesta en curso). */
  readonly replyingTo = this._replyingTo.asReadonly();

  /** Conversaciones ocultas localmente por el usuario (persistido en localStorage). */
  private readonly _hiddenIds = signal<ReadonlySet<string>>(new Set());
  private readonly _showHidden = signal(false);
  /** Mostrar también las conversaciones ocultas en la lista. */
  readonly showHidden = this._showHidden.asReadonly();
  /** Última vez que el usuario abrió cada conversación (ISO), para "no leídos". */
  private readonly _lastSeen = signal<Record<string, string>>({});

  readonly conversations = this._conversations.asReadonly();
  readonly activeId = this._activeId.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly view = this._view.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly activeConversation = computed(
    () => this._conversations().find((c) => c.id === this._activeId()) ?? null,
  );
  readonly typingNames = computed(() => Object.values(this._typingUsers()));

  /** Conversaciones visibles (oculta las marcadas, salvo que se pidan ver). */
  private readonly _visible = computed(() => {
    const hidden = this._hiddenIds();
    const showHidden = this._showHidden();
    return this._conversations().filter((c) => showHidden || !hidden.has(c.id));
  });
  /** Chats individuales visibles, separados de los grupos. */
  readonly directChats = computed(() => this._visible().filter((c) => c.type === 'INDIVIDUAL'));
  /** Grupos visibles. */
  readonly groupChats = computed(() => this._visible().filter((c) => c.type === 'GROUP'));
  /** Hay al menos una conversación oculta (para mostrar el toggle). */
  readonly hasHidden = computed(() => this._hiddenIds().size > 0);

  /** Solo tutores y admin pueden censurar / fijar / borrar mensajes ajenos. */
  readonly canModerate = computed(
    () => this.auth.role() === Role.Tutor || this.auth.role() === Role.Admin,
  );
  readonly isAdmin = computed(() => this.auth.role() === Role.Admin);

  // El back estampa senderId con el `sub` del JWT, así que tomamos el id del
  // usuario actual del MISMO origen para que `mine()` siempre coincida (el
  // `auth.user().id` persistido podía no alinearse y los mensajes propios se
  // renderizaban como ajenos). Fallback al usuario en sesión si el token no es
  // decodificable (p.ej. en tests).
  readonly currentUserId = computed(() => {
    const token = this.auth.token;
    if (token) {
      try {
        const { sub } = jwtDecode<{ sub?: string }>(token);
        if (sub) {
          return sub;
        }
      } catch {
        /* token no decodificable: cae al fallback */
      }
    }
    return this.auth.user()?.id ?? null;
  });

  private readonly typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor() {
    this.realtime.events$.subscribe((e) => this.applyEvent(e));
    this.realtime.typing$.subscribe((e) => this.applyTyping(e));
    this.realtime.notifications$.subscribe(() => this.loadConversations());
  }

  // ─── Navegación del panel ─────────────────────────────────────────────────────

  showList(): void {
    this._view.set('list');
  }

  showNew(): void {
    this._error.set(null);
    this._view.set('new');
  }

  // ─── Moderación: lista negra del filtro automático (solo admin) ────────────────

  showModeration(): void {
    this._error.set(null);
    this._view.set('moderation');
    this.loadCensoredWords();
  }

  loadCensoredWords(): void {
    if (!this.isAdmin()) {
      return;
    }
    this.api.listCensoredWords().subscribe({
      next: (words) => this._censoredWords.set(words),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  addCensoredWord(word: string): void {
    const value = word.trim();
    if (!value) {
      return;
    }
    this.api.addCensoredWord(value).subscribe({
      next: (w) => this._censoredWords.update((list) => [w, ...list]),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  removeCensoredWord(id: string): void {
    this.api.deactivateCensoredWord(id).subscribe({
      next: () => this._censoredWords.update((list) => list.filter((w) => w.id !== id)),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  // ─── Conversaciones ─────────────────────────────────────────────────────────

  loadConversations(): void {
    this.hydrateLocalState();
    this.realtime.connect();
    this.api.listConversations().subscribe({
      next: (list) => this._conversations.set(list),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  openConversation(id: string): void {
    this.markSeen(id);
    this._activeId.set(id);
    this._view.set('thread');
    this._messages.set([]);
    this._typingUsers.set({});
    this._replyingTo.set(null);
    this._loading.set(true);
    this.realtime.openConversation(id);
    this.api.listMessages(id).subscribe({
      next: (page) => {
        this._messages.set([...page.content].sort(this.byCreatedAt));
        this._loading.set(false);
        this.markVisibleAsRead();
      },
      error: (err) => {
        this._error.set(err.messageKey);
        this._loading.set(false);
      },
    });
  }

  closeThread(): void {
    const id = this._activeId();
    if (id) {
      // Al salir, sella la conversación como vista para que no quede "no leída".
      this.markSeen(id);
    }
    this.realtime.closeConversation();
    this._activeId.set(null);
    this._messages.set([]);
    this._replyingTo.set(null);
    this._view.set('list');
  }

  // ─── Ocultar / eliminar / no leídos (gestión de la lista) ──────────────────────

  /** Oculta localmente una conversación (no afecta a los demás participantes). */
  hideConversation(id: string): void {
    this._hiddenIds.update((s) => new Set(s).add(id));
    this.persistHidden();
  }

  /** Vuelve a mostrar una conversación oculta. */
  unhideConversation(id: string): void {
    this._hiddenIds.update((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
    this.persistHidden();
  }

  toggleShowHidden(): void {
    this._showHidden.update((v) => !v);
  }

  /** ¿Está oculta esta conversación? */
  isHidden(id: string): boolean {
    return this._hiddenIds().has(id);
  }

  /** Solo el creador puede borrar definitivamente (hard delete) la conversación. */
  isCreator(conv: Conversation): boolean {
    return conv.createdBy === this.currentUserId();
  }

  /** Hay actividad posterior a la última vez que el usuario la abrió. */
  hasUnread(conv: Conversation): boolean {
    if (conv.id === this._activeId()) {
      return false;
    }
    const seen = this._lastSeen()[conv.id];
    return !seen || conv.updatedAt > seen;
  }

  /** Hard delete: solo el creador; el backend revalida el permiso. */
  deleteConversation(id: string): void {
    const conv = this._conversations().find((c) => c.id === id);
    if (!conv || !this.isCreator(conv)) {
      return;
    }
    this.api.deleteConversation(id).subscribe({
      next: () => {
        this._conversations.update((list) => list.filter((c) => c.id !== id));
        this.unhideConversation(id);
        if (this._activeId() === id) {
          this.closeThread();
        }
      },
      error: (err) => this._error.set(err.messageKey),
    });
  }

  private markSeen(id: string): void {
    this._lastSeen.update((m) => ({ ...m, [id]: new Date().toISOString() }));
    this.persistLastSeen();
  }

  private storageKey(prefix: string): string {
    return `eci.chat.${prefix}.${this.currentUserId() ?? 'anon'}`;
  }

  private hydrateLocalState(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      const hidden = localStorage.getItem(this.storageKey('hidden'));
      this._hiddenIds.set(new Set(hidden ? (JSON.parse(hidden) as string[]) : []));
      const seen = localStorage.getItem(this.storageKey('seen'));
      this._lastSeen.set(seen ? (JSON.parse(seen) as Record<string, string>) : {});
    } catch {
      /* almacenamiento corrupto: se parte de estado vacío */
    }
  }

  private persistHidden(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey('hidden'), JSON.stringify([...this._hiddenIds()]));
    }
  }

  private persistLastSeen(): void {
    if (this.isBrowser) {
      localStorage.setItem(this.storageKey('seen'), JSON.stringify(this._lastSeen()));
    }
  }

  /** Marca un mensaje para responderlo (lo muestra el composer). */
  startReply(message: Message): void {
    this._replyingTo.set(message);
  }

  cancelReply(): void {
    this._replyingTo.set(null);
  }

  createIndividual(other: DirectoryUser): void {
    this.create('INDIVIDUAL', null, [other], false);
  }

  createGroup(name: string, members: DirectoryUser[], anonymous = false): void {
    this.create('GROUP', name, members, anonymous);
  }

  // ─── Mensajes ────────────────────────────────────────────────────────────────

  sendText(content: string): void {
    const id = this._activeId();
    const text = content.trim();
    if (!id || !text) {
      return;
    }
    const req = { content: text, replyToMessageId: this._replyingTo()?.id ?? null };
    if (this.realtime.connected()) {
      // El backend re-emite el mensaje por WS; el propio emisor lo recibe y se
      // agrega vía applyEvent (dedupe por id).
      this.realtime.sendMessage(id, req);
    } else {
      this.api.sendMessage(id, req).subscribe({
        next: (msg) => this.upsertMessage(msg),
        error: (err) => this._error.set(err.messageKey),
      });
    }
    this._replyingTo.set(null);
  }

  sendWithFile(file: File, content?: string): void {
    const id = this._activeId();
    if (!id) {
      return;
    }
    const req = { content: content?.trim() || null, replyToMessageId: this._replyingTo()?.id ?? null };
    this.api.sendMessageWithAttachment(id, req, file).subscribe({
      next: (msg) => this.upsertMessage(msg),
      error: (err) => this._error.set(err.messageKey),
    });
    this._replyingTo.set(null);
  }

  editMessage(messageId: string, content: string): void {
    const id = this._activeId();
    if (!id || !content.trim()) {
      return;
    }
    this.api.editMessage(id, messageId, content.trim()).subscribe({
      next: (msg) => this.upsertMessage(msg),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  deleteMessage(messageId: string): void {
    const id = this._activeId();
    if (!id) {
      return;
    }
    this.api.deleteMessage(id, messageId).subscribe({ error: (err) => this._error.set(err.messageKey) });
  }

  /** Censura manual (solo tutor/admin; el backend revalida el rol). */
  censorMessage(messageId: string): void {
    const id = this._activeId();
    if (!id) {
      return;
    }
    this.api.censorMessage(id, messageId).subscribe({
      next: (msg) => this.upsertMessage(msg),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  togglePin(messageId: string): void {
    const id = this._activeId();
    if (!id) {
      return;
    }
    this.api.togglePin(id, messageId).subscribe({
      next: (msg) => this.upsertMessage(msg),
      error: (err) => this._error.set(err.messageKey),
    });
  }

  toggleReaction(messageId: string, emoji: string): void {
    const id = this._activeId();
    const me = this.currentUserId();
    if (!id || !me) {
      return;
    }
    const msg = this._messages().find((m) => m.id === messageId);
    const reacted = msg?.reactions.some((g) => g.emoji === emoji && g.userIds.includes(me));
    const call = reacted
      ? this.api.removeReaction(id, messageId, emoji)
      : this.api.addReaction(id, messageId, emoji);
    call.subscribe({ error: (err) => this._error.set(err.messageKey) });
  }

  /** Marca como leídos los mensajes visibles que no son míos ni están ya leídos. */
  markVisibleAsRead(): void {
    const id = this._activeId();
    const me = this.currentUserId();
    if (!id || !me) {
      return;
    }
    const unread = this._messages()
      .filter((m) => m.senderId !== me && !m.readBy.some((r) => r.userId === me))
      .map((m) => m.id);
    if (unread.length) {
      this.api.markAsRead(id, unread).subscribe({ error: () => undefined });
    }
  }

  notifyTyping(typing: boolean): void {
    const id = this._activeId();
    if (id) {
      this.realtime.sendTyping(id, typing);
    }
  }

  // ─── Internos ─────────────────────────────────────────────────────────────────

  private create(
    type: ConversationType,
    name: string | null,
    members: DirectoryUser[],
    anonymous: boolean,
  ): void {
    this._error.set(null);
    this.api
      .createConversation({
        type,
        name,
        participants: members.map((u) => ({
          userId: u.id,
          userName: u.name,
          userRol: u.rol,
        })),
        anonymous,
      })
      .subscribe({
        next: (conv) => {
          this._conversations.update((list) => [conv, ...list.filter((c) => c.id !== conv.id)]);
          this.openConversation(conv.id);
        },
        error: (err) => this._error.set(err.messageKey),
      });
  }

  private applyEvent(e: WsMessageEvent): void {
    if (e.conversationId !== this._activeId()) {
      // Conversación no abierta: refrescamos la lista para reordenar/avisar.
      this.loadConversations();
      return;
    }
    switch (e.type) {
      case 'MESSAGE':
      case 'MESSAGE_UPDATED':
      case 'MESSAGE_DELETED':
        if (e.message) {
          this.upsertMessage(e.message);
        }
        break;
      case 'MESSAGE_PINNED':
      case 'MESSAGE_UNPINNED':
        this.patchMessage(e.messageId, (m) => ({ ...m, pinned: e.pinned ?? false }));
        break;
      case 'REACTION_ADDED':
        this.patchMessage(e.messageId, (m) => this.withReaction(m, e, true));
        break;
      case 'REACTION_REMOVED':
        this.patchMessage(e.messageId, (m) => this.withReaction(m, e, false));
        break;
      case 'MESSAGE_READ':
        this.applyRead(e);
        break;
    }
  }

  private applyTyping(e: WsTypingEvent): void {
    if (e.conversationId !== this._activeId() || e.userId === this.currentUserId()) {
      return;
    }
    const prev = this.typingTimers.get(e.userId);
    if (prev) {
      clearTimeout(prev);
    }
    if (e.typing) {
      this._typingUsers.update((m) => ({ ...m, [e.userId]: e.userName }));
      this.typingTimers.set(
        e.userId,
        setTimeout(() => this.clearTyping(e.userId), 4000),
      );
    } else {
      this.clearTyping(e.userId);
    }
  }

  private clearTyping(userId: string): void {
    this.typingTimers.delete(userId);
    this._typingUsers.update((m) => {
      const next = { ...m };
      delete next[userId];
      return next;
    });
  }

  private upsertMessage(msg: Message): void {
    this._messages.update((list) => {
      const exists = list.some((m) => m.id === msg.id);
      const next = exists ? list.map((m) => (m.id === msg.id ? msg : m)) : [...list, msg];
      return next.sort(this.byCreatedAt);
    });
  }

  private patchMessage(messageId: string | null, fn: (m: Message) => Message): void {
    if (!messageId) {
      return;
    }
    this._messages.update((list) => list.map((m) => (m.id === messageId ? fn(m) : m)));
  }

  private withReaction(m: Message, e: WsMessageEvent, add: boolean): Message {
    if (!e.emoji || !e.userId) {
      return m;
    }
    const groups = m.reactions.filter((g) => g.emoji !== e.emoji);
    const current = m.reactions.find((g) => g.emoji === e.emoji);
    if (add) {
      const userIds = current?.userIds.includes(e.userId)
        ? current.userIds
        : [...(current?.userIds ?? []), e.userId];
      const userNames = current?.userIds.includes(e.userId)
        ? (current?.userNames ?? [])
        : [...(current?.userNames ?? []), e.userName ?? ''];
      return { ...m, reactions: [...groups, { emoji: e.emoji, count: userIds.length, userIds, userNames }] };
    }
    const userIds = (current?.userIds ?? []).filter((id) => id !== e.userId);
    if (!userIds.length) {
      return { ...m, reactions: groups };
    }
    const userNames = (current?.userNames ?? []).slice(0, userIds.length);
    return { ...m, reactions: [...groups, { emoji: e.emoji, count: userIds.length, userIds, userNames }] };
  }

  private applyRead(e: WsMessageEvent): void {
    if (!e.messageIds || !e.userId) {
      return;
    }
    const ids = new Set(e.messageIds);
    this._messages.update((list) =>
      list.map((m) => {
        if (!ids.has(m.id) || m.readBy.some((r) => r.userId === e.userId)) {
          return m;
        }
        return {
          ...m,
          readBy: [
            ...m.readBy,
            { userId: e.userId!, userName: e.userName ?? '', readAt: e.timestamp ?? '' },
          ],
        };
      }),
    );
  }

  private readonly byCreatedAt = (a: Message, b: Message): number =>
    a.createdAt.localeCompare(b.createdAt);
}
