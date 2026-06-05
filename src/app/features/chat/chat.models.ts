/**
 * Modelos del dominio de chat (servicio talk). Las fechas llegan como cadenas
 * ISO-8601 desde el backend (Spring serializa LocalDateTime como string).
 */

export type ConversationType = 'INDIVIDUAL' | 'GROUP';

export interface Participant {
  readonly userId: string;
  readonly userName: string;
  readonly userRol: string | null;
  readonly joinedAt: string;
}

export interface Conversation {
  readonly id: string;
  readonly type: ConversationType;
  readonly name: string | null;
  readonly description: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly anonymous: boolean;
  readonly participants: Participant[];
}

export interface Attachment {
  readonly id: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly downloadUrl: string;
  readonly isImage: boolean;
}

export interface ReactionGroup {
  readonly emoji: string;
  readonly count: number;
  readonly userIds: string[];
  readonly userNames: string[];
}

export interface ReadReceipt {
  readonly userId: string;
  readonly userName: string;
  readonly readAt: string;
}

export interface ReplyPreview {
  readonly messageId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly snippet: string;
  readonly deleted: boolean;
}

export interface Message {
  readonly id: string;
  readonly conversationId: string;
  readonly senderId: string;
  readonly senderName: string;
  readonly contentDisplay: string;
  /** Solo presente para admin (auditoría). */
  readonly contentOriginal: string | null;
  readonly autoCensored: boolean;
  readonly manuallyCensored: boolean;
  readonly censoredByName: string | null;
  readonly censoredAt: string | null;
  readonly edited: boolean;
  readonly editedAt: string | null;
  readonly deleted: boolean;
  readonly createdAt: string;
  readonly replyTo: ReplyPreview | null;
  readonly pinned: boolean;
  readonly pinnedBy: string | null;
  readonly pinnedAt: string | null;
  readonly reactions: ReactionGroup[];
  readonly readBy: ReadReceipt[];
  readonly attachment: Attachment | null;
}

/** Página de mensajes (Spring Data Page). */
export interface MessagePage {
  readonly content: Message[];
  readonly totalElements: number;
  readonly number: number;
  readonly totalPages: number;
  readonly last: boolean;
}

export type WsEventType =
  | 'MESSAGE'
  | 'MESSAGE_UPDATED'
  | 'MESSAGE_DELETED'
  | 'MESSAGE_READ'
  | 'REACTION_ADDED'
  | 'REACTION_REMOVED'
  | 'MESSAGE_PINNED'
  | 'MESSAGE_UNPINNED';

export interface WsMessageEvent {
  readonly type: WsEventType;
  readonly conversationId: string;
  readonly message: Message | null;
  readonly messageId: string | null;
  readonly userId: string | null;
  readonly userName: string | null;
  readonly timestamp: string | null;
  readonly messageIds: string[] | null;
  readonly emoji: string | null;
  readonly pinned: boolean | null;
}

export interface WsTypingEvent {
  readonly type: 'TYPING';
  readonly conversationId: string;
  readonly userId: string;
  readonly userName: string;
  readonly typing: boolean;
}

export interface CensoredWord {
  readonly id: string;
  readonly word: string;
  readonly addedByName: string;
  readonly active: boolean;
  readonly createdAt: string;
}

/** Usuario del directorio (wise_auth) para el selector de participantes. */
export interface DirectoryUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly rol: string;
}

// ─── Payloads de petición ────────────────────────────────────────────────────

export interface ParticipantInput {
  readonly userId: string;
  readonly userName: string;
  readonly userRol: string;
}

export interface CreateConversationRequest {
  readonly type: ConversationType;
  readonly name?: string | null;
  readonly description?: string | null;
  readonly participants: ParticipantInput[];
  readonly anonymous: boolean;
}

export interface SendMessageRequest {
  readonly content?: string | null;
  readonly replyToMessageId?: string | null;
}
