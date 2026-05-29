export type MonitoriaStatus = 'available' | 'requested' | 'accepted';

/** Monitoría (sesión de tutoría) ofrecida a los estudiantes. */
export interface Monitoria {
  readonly id: string;
  readonly subject: string;
  readonly tutor: string;
  readonly datetime: string;
  readonly seats: number;
  readonly status: MonitoriaStatus;
}
