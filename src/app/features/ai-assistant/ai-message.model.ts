export type AiAuthor = 'user' | 'assistant';

export interface RelatedDoc {
  readonly docId: string;
  readonly fileName: string;
  readonly materia: string;
  readonly tema: string;
}

/** Mensaje dentro de la conversación con el asistente de IA. */
export interface AiMessage {
  readonly id: string;
  readonly author: AiAuthor;
  readonly text: string;
  readonly streaming?: boolean;
  readonly relatedDocuments?: readonly RelatedDoc[];
}

/** Entrada del historial para el modo socrático. */
export interface AiHistoryEntry {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}
