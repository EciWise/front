/**
 * Modelos del dominio de comunidad (foros, threads y reportes).
 * Las fechas llegan como cadenas ISO-8601 desde el backend.
 */

// ─── Materias ─────────────────────────────────────────────────────────────────

export interface Materia {
  readonly id: string;
  readonly nombre: string;
}

// ─── Foros ────────────────────────────────────────────────────────────────────

export interface Forum {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly materia: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly closed: boolean;
  readonly likesCount: number;
  readonly likedByMe: boolean;
  readonly threadsCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ForumDetail extends Forum {
  readonly threads: Thread[];
}

export interface CreateForumRequest {
  readonly title: string;
  readonly materia: string;
  readonly description?: string | null;
}

// ─── Threads ──────────────────────────────────────────────────────────────────

export interface Thread {
  readonly id: string;
  readonly forumId: string;
  readonly title: string;
  readonly content: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly likesCount: number;
  readonly likedByMe: boolean;
  readonly responsesCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ThreadResponse {
  readonly id: string;
  readonly threadId: string;
  readonly content: string;
  readonly authorId: string;
  readonly authorName: string;
  readonly likesCount: number;
  readonly likedByMe: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ThreadDetail extends Thread {
  readonly responses: ThreadResponse[];
}

export interface CreateThreadRequest {
  readonly title: string;
  readonly content: string;
}

export interface EditThreadRequest {
  readonly content: string;
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

export type ReportContentType = 'FORUM' | 'THREAD' | 'RESPONSE';
export type ReportStatus = 'PENDIENTE' | 'REVISADO' | 'DESCARTADO';

export interface Report {
  readonly id: string;
  readonly contentId: string;
  readonly contentType: ReportContentType;
  readonly reason: string;
  readonly reporterId: string;
  readonly reporterName: string;
  readonly status: ReportStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateReportRequest {
  readonly contentId: string;
  readonly contentType: ReportContentType;
  readonly reason: string;
}
