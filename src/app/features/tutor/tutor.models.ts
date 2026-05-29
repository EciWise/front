/** Día hábil de la semana. */
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const WEEK_DAYS: readonly WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
export const TIME_BLOCKS: readonly string[] = ['08:00', '10:00', '14:00', '16:00'];

/** Sesión de tutoría creada por el tutor. */
export interface TutorSession {
  readonly id: string;
  readonly subject: string;
  readonly datetime: string;
  readonly seats: number;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

/** Solicitud de tutoría hecha por un estudiante. */
export interface TutoringRequest {
  readonly id: string;
  readonly student: string;
  readonly subject: string;
  readonly datetime: string;
  readonly status: RequestStatus;
}

export type HistoryStatus = 'completed' | 'cancelled';

/** Entrada del historial de tutorías. */
export interface HistoryEntry {
  readonly id: string;
  readonly subject: string;
  readonly student: string;
  readonly datetime: string;
  readonly status: HistoryStatus;
}
