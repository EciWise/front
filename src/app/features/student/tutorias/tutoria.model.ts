export type TutoriaStatus = 'available' | 'requested' | 'accepted';

/** Tutoria ofrecida a los estudiantes. */
export interface Tutoria {
  readonly id: string;
  readonly tutorId?: string;
  readonly subjectId?: string;
  readonly subject: string;
  readonly tutor: string;
  readonly datetime: string;
  readonly seats: number;
  readonly status: TutoriaStatus;
  readonly mode?: 'virtual' | 'presential';
}
