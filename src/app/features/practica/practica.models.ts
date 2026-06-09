/**
 * Modelos del sistema de quiz de ECIWISE-STUDY (asignaturas, banco de preguntas,
 * colecciones de repaso, sesiones de quiz, historial y ranking). Reflejan el JSON
 * del backend (camelCase, enums en MAYÚSCULAS). No usar `any`.
 */

/** Modos de juego del backend. */
export type QuizMode = 'PARCIAL' | 'REPASO' | 'SUPERVIVENCIA';

/** Estado de una sesión de quiz. */
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

/** Tipo de pregunta del banco. */
export type QuestionType = 'CLOSED' | 'OPEN' | 'TRUE_FALSE';

// ── Asignaturas ──

export interface Subject {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface SubjectRequest {
  readonly name: string;
  readonly description: string | null;
}

// ── Preguntas (vista admin/tutor: revela la respuesta correcta) ──

export interface OptionRequest {
  readonly text: string;
  readonly correct: boolean;
}

export interface OptionResponse {
  readonly id: number;
  readonly text: string;
  readonly correct: boolean;
  readonly position: number;
}

export interface QuestionRequest {
  readonly subjectId: number;
  readonly corte: number;
  readonly type: QuestionType;
  readonly statement: string;
  readonly explanation: string | null;
  readonly correctAnswer: string | null;
  readonly availableForSurvival: boolean;
  readonly timeLimitSeconds: number | null;
  readonly options: readonly OptionRequest[] | null;
}

export interface Question {
  readonly id: number;
  readonly subjectId: number;
  readonly subjectName: string | null;
  readonly corte: number;
  readonly type: QuestionType;
  readonly statement: string;
  readonly explanation: string | null;
  readonly correctAnswer: string | null;
  readonly availableForSurvival: boolean;
  readonly timeLimitSeconds: number;
  readonly options: readonly OptionResponse[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface QuestionStats {
  readonly questionId: number;
  readonly timesAnswered: number;
  readonly correct: number;
  readonly incorrect: number;
  readonly correctRate: number;
}

// ── Colecciones de preguntas (modo Repaso) ──

export interface QuestionCollectionRequest {
  readonly name: string;
  readonly description: string | null;
  readonly subjectId: number | null;
  readonly questionIds: readonly number[];
}

export interface QuestionCollection {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly subjectId: number | null;
  readonly subjectName: string | null;
  readonly questionCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ── Sesiones de quiz (vista del jugador: NO revela la respuesta correcta) ──

/** Parámetros del modo Parcial (preparedness 1-5, targetGrade 0-5). */
export interface ParcialParams {
  readonly daysUntilExam: number;
  readonly preparedness: number;
  readonly targetGrade: number;
}

export interface StartSessionRequest {
  readonly mode: QuizMode;
  readonly subjectId?: number | null;
  readonly corte?: number | null;
  readonly collectionId?: number | null;
  readonly parcial?: ParcialParams | null;
}

/** Opción tal como la ve el jugador: sin marca de correcta. */
export interface QuizOption {
  readonly id: number;
  readonly text: string;
  readonly position: number;
}

export interface QuizQuestion {
  readonly id: number;
  readonly type: QuestionType;
  readonly statement: string;
  readonly timeLimitSeconds: number;
  readonly options: readonly QuizOption[];
}

export interface SessionResponse {
  readonly id: number;
  readonly mode: QuizMode;
  readonly status: SessionStatus;
  readonly totalQuestions: number;
  readonly livesRemaining: number | null;
  readonly subjectId: number | null;
  readonly corte: number | null;
  readonly collectionId: number | null;
  readonly startedAt: string;
  readonly questions: readonly QuizQuestion[];
}

export interface AnswerRequest {
  readonly questionId: number;
  readonly selectedOptionId?: number | null;
  readonly givenAnswer?: string | null;
  readonly timeTakenMs: number;
}

/** Resultado de responder: aquí SÍ se revela la verdad y la explicación. */
export interface AnswerResult {
  readonly correct: boolean;
  readonly correctOptionId: number | null;
  readonly correctAnswer: string | null;
  readonly explanation: string | null;
  readonly pointsAwarded: number;
  readonly livesRemaining: number | null;
  readonly status: SessionStatus;
  readonly score: number;
  readonly correctCount: number;
  readonly incorrectCount: number;
  readonly totalAnswered: number;
}

export interface SessionSummary {
  readonly id: number;
  readonly mode: QuizMode;
  readonly status: SessionStatus;
  readonly subjectId: number | null;
  readonly corte: number | null;
  readonly collectionId: number | null;
  readonly totalQuestions: number;
  readonly correctCount: number;
  readonly incorrectCount: number;
  readonly score: number;
  readonly accuracyPercent: number;
  readonly livesRemaining: number | null;
  readonly startedAt: string;
  readonly finishedAt: string | null;
}

// ── Paginación y ranking ──

export interface PagedResponse<T> {
  readonly content: readonly T[];
  readonly page: number;
  readonly size: number;
  readonly totalElements: number;
  readonly totalPages: number;
}

export interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: number;
  readonly name: string;
  readonly bestScore: number;
}

export interface LeaderboardResponse {
  readonly table: PagedResponse<LeaderboardEntry>;
  readonly myRank: number | null;
  readonly myBestScore: number | null;
}
