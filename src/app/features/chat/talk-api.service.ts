import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AppError, httpErrorToKey } from '../../core/errors/app-error';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import {
  CensoredWord,
  Conversation,
  CreateConversationRequest,
  Message,
  MessagePage,
  ParticipantInput,
  SendMessageRequest,
} from './chat.models';

/**
 * Acceso REST al servicio talk. Toda la lógica de red vive aquí (la UI nunca
 * usa HttpClient directamente). Los errores se normalizan a `AppError` con una
 * clave de traducción, igual que el resto de servicios de la plataforma.
 */
@Injectable({ providedIn: 'root' })
export class TalkApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TALK_CONFIG);

  private get base(): string {
    return `${this.config.talkApiUrl.replace(/\/+$/, '')}/api/v1`;
  }

  // ─── Conversaciones ─────────────────────────────────────────────────────────

  listConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.base}/conversations`).pipe(this.handle());
  }

  getConversation(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.base}/conversations/${id}`).pipe(this.handle());
  }

  createConversation(req: CreateConversationRequest): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.base}/conversations`, req).pipe(this.handle());
  }

  updateConversation(
    id: string,
    body: { name?: string; description?: string },
  ): Observable<Conversation> {
    return this.http.put<Conversation>(`${this.base}/conversations/${id}`, body).pipe(this.handle());
  }

  deleteConversation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/conversations/${id}`).pipe(this.handle());
  }

  addParticipant(id: string, participant: ParticipantInput): Observable<Conversation> {
    return this.http
      .post<Conversation>(`${this.base}/conversations/${id}/participants`, participant)
      .pipe(this.handle());
  }

  removeParticipant(id: string, userId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/conversations/${id}/participants/${userId}`)
      .pipe(this.handle());
  }

  // ─── Mensajes ────────────────────────────────────────────────────────────────

  listMessages(conversationId: string, page = 0, size = 50): Observable<MessagePage> {
    return this.http
      .get<MessagePage>(`${this.msgBase(conversationId)}?page=${page}&size=${size}`)
      .pipe(this.handle());
  }

  sendMessage(conversationId: string, req: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(this.msgBase(conversationId), req).pipe(this.handle());
  }

  sendMessageWithAttachment(
    conversationId: string,
    req: SendMessageRequest,
    file: File,
  ): Observable<Message> {
    const form = new FormData();
    // `data` debe viajar como blob JSON para que el backend lo deserialice y
    // valide como SendMessageRequest (no como string plano).
    form.append('data', new Blob([JSON.stringify(req)], { type: 'application/json' }));
    form.append('file', file);
    return this.http
      .post<Message>(`${this.msgBase(conversationId)}/with-attachment`, form)
      .pipe(this.handle());
  }

  editMessage(conversationId: string, messageId: string, content: string): Observable<Message> {
    return this.http
      .put<Message>(`${this.msgBase(conversationId)}/${messageId}`, { content })
      .pipe(this.handle());
  }

  deleteMessage(conversationId: string, messageId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.msgBase(conversationId)}/${messageId}`)
      .pipe(this.handle());
  }

  /** Censura manual: solo tutores y admin (el backend valida el rol). */
  censorMessage(conversationId: string, messageId: string): Observable<Message> {
    return this.http
      .patch<Message>(`${this.msgBase(conversationId)}/${messageId}/censor`, {})
      .pipe(this.handle());
  }

  togglePin(conversationId: string, messageId: string): Observable<Message> {
    return this.http
      .patch<Message>(`${this.msgBase(conversationId)}/${messageId}/pin`, {})
      .pipe(this.handle());
  }

  getPinned(conversationId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.msgBase(conversationId)}/pinned`).pipe(this.handle());
  }

  markAsRead(conversationId: string, messageIds: string[]): Observable<void> {
    return this.http
      .post<void>(`${this.msgBase(conversationId)}/read`, { messageIds })
      .pipe(this.handle());
  }

  addReaction(conversationId: string, messageId: string, emoji: string): Observable<void> {
    return this.http
      .post<void>(`${this.msgBase(conversationId)}/${messageId}/reactions`, { emoji })
      .pipe(this.handle());
  }

  removeReaction(conversationId: string, messageId: string, emoji: string): Observable<void> {
    return this.http
      .delete<void>(
        `${this.msgBase(conversationId)}/${messageId}/reactions/${encodeURIComponent(emoji)}`,
      )
      .pipe(this.handle());
  }

  // ─── Lista negra de censura (solo admin) ──────────────────────────────────────

  listCensoredWords(): Observable<CensoredWord[]> {
    return this.http.get<CensoredWord[]>(`${this.base}/censorship/words`).pipe(this.handle());
  }

  addCensoredWord(word: string): Observable<CensoredWord> {
    return this.http
      .post<CensoredWord>(`${this.base}/censorship/words`, { word })
      .pipe(this.handle());
  }

  deactivateCensoredWord(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/censorship/words/${id}`).pipe(this.handle());
  }

  // ─── Internos ─────────────────────────────────────────────────────────────────

  private msgBase(conversationId: string): string {
    return `${this.base}/conversations/${conversationId}/messages`;
  }

  private handle<T>() {
    return catchError<T, Observable<never>>((err) =>
      throwError(() => new AppError(httpErrorToKey(err))),
    );
  }
}
