/**
 * Modelos del servicio ECIWISE-STUDY (flashcards + repetición espaciada).
 * Reflejan el JSON del backend (camelCase). No usar `any`.
 */

export type Visibility = 'PUBLIC' | 'PRIVATE';

/** Estado de aprendizaje de una tarjeta para el usuario. */
export type ReviewState = 'EN_APRENDIZAJE' | 'REPETIR' | 'ACEPTABLE' | 'APRENDIDO';

/** Calificación que el usuario da al responder (los 3 botones). */
export type ReviewGrade = 'REPETIR' | 'ACEPTABLE' | 'APRENDIDO';

export interface Author {
  readonly externalId: string;
  readonly email: string | null;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly role: string;
}

export interface Collection {
  readonly id: number;
  readonly name: string;
  readonly visibility: Visibility;
  readonly author: Author;
  readonly flashcardCount: number;
  /** Marcada por el usuario para que aparezca primero (persistida en backend). */
  readonly favorite: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CollectionRequest {
  readonly name: string;
  readonly visibility: Visibility;
}

export interface Flashcard {
  readonly id: number;
  readonly collectionId: number;
  readonly title: string;
  readonly description: string | null;
  readonly question: string;
  readonly answer: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FlashcardRequest {
  readonly title: string;
  readonly description: string | null;
  readonly question: string;
  readonly answer: string;
}

export interface ReviewResponse {
  readonly flashcardId: number;
  readonly state: ReviewState;
  readonly repetitions: number;
  readonly intervalDays: number;
  readonly easeFactor: number;
  readonly lapses: number;
  readonly dueAt: string;
  readonly lastReviewedAt: string | null;
}

/** Tarjeta pendiente de estudiar: la flashcard + estado/agenda (null si es nueva). */
export interface StudyCard {
  readonly card: Flashcard;
  readonly state: ReviewState | null;
  readonly dueAt: string | null;
}

export interface ReviewSummary {
  readonly total: number;
  readonly enAprendizaje: number;
  readonly repetir: number;
  readonly aceptable: number;
  readonly aprendido: number;
  readonly vencidas: number;
}

export interface UsageItem {
  readonly flashcardId: number;
  readonly flashcardTitle: string;
  readonly usedAt: string;
}

export interface UsageSummary {
  readonly totalUsed: number;
  readonly history: readonly UsageItem[];
}
