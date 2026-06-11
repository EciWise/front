/** Dia habil de la semana. */
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export const WEEK_DAYS: readonly WeekDay[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
export const TIME_BLOCKS: readonly string[] = ['08:00', '10:00', '14:00', '16:00'];

export type TutoringMode = 'virtual' | 'presential';
export type AvailabilityStatus = 'active' | 'cancelled';
export type AttendanceStatus = 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export interface AcademicSubject {
  readonly id: string;
  readonly name: string;
}

export interface MonitorReputation {
  readonly averageRating: number;
  readonly completedSessions: number;
  readonly attendanceRate: number;
  readonly comments: readonly string[];
}

export interface StudentReputation {
  readonly averageRating: number;
  readonly attendedSessions: number;
  readonly attendanceRate: number;
  readonly cancellationRate: number;
  readonly noShows: number;
  readonly comments: readonly string[];
}

export interface TutorProfile {
  readonly id: string;
  readonly name: string;
  readonly career: string;
  readonly authorized: boolean;
  readonly subjectIds: readonly string[];
  readonly reputation: MonitorReputation;
}

export interface StudentProfile {
  readonly id: string;
  readonly name: string;
  readonly career: string;
  readonly active: boolean;
  readonly reputation: StudentReputation;
}

export interface TutoringAvailability {
  readonly id: string;
  readonly tutorId: string;
  readonly subjectId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly mode: TutoringMode;
  readonly capacity: number;
  readonly status: AvailabilityStatus;
  readonly room?: string;
  readonly virtualUrl?: string;
  readonly cancelReason?: string;
}

export interface TutorRating {
  readonly topicMastery: number;
  readonly clarity: number;
  readonly usefulness: number;
  readonly punctuality: number;
  readonly comment: string;
}

export interface StudentParticipationRating {
  readonly punctuality: number;
  readonly participation: number;
  readonly preparation: number;
  readonly respect: number;
  readonly assignments: number;
  readonly comment: string;
}

export interface TutoringReservation {
  readonly id: string;
  readonly availabilityId: string;
  readonly studentId: string;
  readonly subjectId: string;
  readonly specificTopic: string;
  readonly description: string;
  readonly mode: TutoringMode;
  readonly status: AttendanceStatus;
  readonly createdAt: string;
  readonly cancelReason?: string;
  readonly tutorObservation?: string;
  readonly tutorRating?: TutorRating;
  readonly studentParticipation?: StudentParticipationRating;
}

export interface TutoringSlot {
  readonly availability: TutoringAvailability;
  readonly tutor: TutorProfile;
  readonly subject: AcademicSubject;
  readonly reservedSeats: number;
  readonly availableSeats: number;
  readonly userReservation?: TutoringReservation;
}

export interface TutoringSearchFilters {
  readonly subjectId: string;
  readonly tutorId: string;
  readonly mode: '' | TutoringMode;
  readonly date: string;
  readonly time: string;
}

export interface CreateAvailabilityPayload {
  readonly subjectId: string;
  readonly date: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly mode: TutoringMode;
  readonly capacity: number;
  readonly room?: string;
}

export interface ReserveTutoringPayload {
  readonly specificTopic: string;
  readonly description: string;
  readonly mode: TutoringMode;
}

export interface Recommendation {
  readonly id: string;
  readonly availabilityId: string;
  readonly tutorId: string;
  readonly subjectId: string;
  readonly score: number;
  readonly reasonKey: string;
  readonly relatedTopics: readonly string[];
}

export interface TutoringStats {
  readonly requestedSubjects: readonly { label: string; value: number }[];
  readonly commonTopics: readonly { label: string; value: number }[];
  readonly demandHours: readonly { label: string; value: number }[];
  readonly topTutors: readonly { label: string; value: number }[];
  readonly attendanceRate: number;
  readonly completedCount: number;
  readonly cancelledCount: number;
  readonly attendedStudents: number;
}

export interface TutoringActionResult<T = void> {
  readonly ok: boolean;
  readonly value?: T;
  readonly errorKey?: string;
}

/** Sesion de tutoria creada por el tutor. Compatibilidad con vistas existentes. */
export interface TutorSession {
  readonly id: string;
  readonly subject: string;
  readonly datetime: string;
  readonly seats: number;
  readonly mode?: TutoringMode;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected';

/** Solicitud de tutoria hecha por un estudiante. Compatibilidad con tests existentes. */
export interface TutoringRequest {
  readonly id: string;
  readonly student: string;
  readonly subject: string;
  readonly datetime: string;
  readonly status: RequestStatus;
}

export type HistoryStatus = 'completed' | 'cancelled';

/** Entrada del historial de tutorias. Compatibilidad con tests existentes. */
export interface HistoryEntry {
  readonly id: string;
  readonly subject: string;
  readonly student: string;
  readonly datetime: string;
  readonly status: HistoryStatus;
  readonly topic?: string;
  readonly mode?: TutoringMode;
  readonly rating?: number;
}
