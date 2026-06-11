export type MonitoriaStatus = 'available' | 'requested' | 'accepted';

/** Monitoria ofrecida a los estudiantes. */
export interface Monitoria {
  readonly id: string;
  readonly tutorId?: string;
  readonly subjectId?: string;
  readonly subject: string;
  readonly tutor: string;
  readonly datetime: string;
  readonly seats: number;
  readonly status: MonitoriaStatus;
  readonly mode?: 'virtual' | 'presential';
}
