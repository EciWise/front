/** Modalidad de una tutoría. */
export type TutoringMode = 'virtual' | 'presential';

export interface AcademicSubject {
  readonly id: string;
  readonly name: string;
}

/** Perfil mínimo de un tutor, derivado de los datos reales de las tutorías. */
export interface TutorProfile {
  readonly id: string;
  readonly name: string;
}

/** Franja de tutoría disponible, mapeada desde el backend. */
export interface TutoringAvailability {
  readonly id: string;
  readonly tutorId: string;
  readonly subjectId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly mode: TutoringMode;
  readonly capacity: number;
  readonly room?: string;
  readonly virtualUrl?: string;
}

export interface TutoringSlot {
  readonly availability: TutoringAvailability;
  readonly tutor: TutorProfile;
  readonly subject: AcademicSubject;
  readonly reservedSeats: number;
  readonly availableSeats: number;
}

export interface TutoringSearchFilters {
  readonly subjectId: string;
  readonly tutorId: string;
  readonly mode: '' | TutoringMode;
  readonly date: string;
  readonly time: string;
}

export interface ReserveTutoringPayload {
  readonly specificTopic: string;
  readonly description: string;
  readonly mode: TutoringMode;
}

export interface TutoringActionResult<T = void> {
  readonly ok: boolean;
  readonly value?: T;
  readonly errorKey?: string;
}
