import { Injectable, computed, inject, signal } from '@angular/core';
import { NotificationsService } from '../../core/notifications/notifications.service';
import {
  AcademicSubject,
  AttendanceStatus,
  CreateAvailabilityPayload,
  HistoryEntry,
  MonitorReputation,
  Recommendation,
  ReserveTutoringPayload,
  StudentParticipationRating,
  StudentProfile,
  StudentReputation,
  TutorProfile,
  TutorRating,
  TutoringActionResult,
  TutoringAvailability,
  TutoringReservation,
  TutoringSearchFilters,
  TutoringSlot,
  TutoringStats,
} from './tutor.models';

const CURRENT_STUDENT_ID = 'student-1';
const CURRENT_TUTOR_ID = 'tutor-1';
const CANCEL_WINDOW_HOURS = 2;

const SUBJECTS: readonly AcademicSubject[] = [
  { id: 'calc', name: 'Calculo Diferencial' },
  { id: 'algebra', name: 'Algebra Lineal' },
  { id: 'programming', name: 'Programacion' },
  { id: 'physics', name: 'Fisica Mecanica' },
];

const TUTORS: readonly TutorProfile[] = [
  {
    id: CURRENT_TUTOR_ID,
    name: 'Carlos Tutor',
    career: 'Ingenieria de Sistemas',
    authorized: true,
    subjectIds: ['calc', 'algebra', 'programming'],
    reputation: {
      averageRating: 4.7,
      completedSessions: 28,
      attendanceRate: 96,
      comments: ['Explica con claridad los pasos clave.', 'Buen manejo de ejercicios.'],
    },
  },
  {
    id: 'tutor-2',
    name: 'Laura Mendez',
    career: 'Ingenieria Industrial',
    authorized: true,
    subjectIds: ['programming', 'physics'],
    reputation: {
      averageRating: 4.5,
      completedSessions: 19,
      attendanceRate: 92,
      comments: ['Muy puntual y organizada.'],
    },
  },
  {
    id: 'tutor-3',
    name: 'Andres Gomez',
    career: 'Ingenieria Civil',
    authorized: true,
    subjectIds: ['physics', 'calc'],
    reputation: {
      averageRating: 4.8,
      completedSessions: 34,
      attendanceRate: 98,
      comments: ['Conecta teoria y practica con buenos ejemplos.'],
    },
  },
];

const STUDENTS: readonly StudentProfile[] = [
  {
    id: CURRENT_STUDENT_ID,
    name: 'Ana Estudiante',
    career: 'Ingenieria de Sistemas',
    active: true,
    reputation: {
      averageRating: 4.6,
      attendedSessions: 9,
      attendanceRate: 94,
      cancellationRate: 8,
      noShows: 1,
      comments: ['Llega preparada con preguntas concretas.'],
    },
  },
  {
    id: 'student-2',
    name: 'Diego Ruiz',
    career: 'Ingenieria Industrial',
    active: true,
    reputation: {
      averageRating: 4.2,
      attendedSessions: 7,
      attendanceRate: 88,
      cancellationRate: 12,
      noShows: 1,
      comments: ['Participa cuando se le proponen ejercicios.'],
    },
  },
  {
    id: 'student-3',
    name: 'Maria Paez',
    career: 'Ingenieria Civil',
    active: true,
    reputation: {
      averageRating: 4.9,
      attendedSessions: 12,
      attendanceRate: 100,
      cancellationRate: 0,
      noShows: 0,
      comments: ['Excelente preparacion previa.'],
    },
  },
];

const AVAILABILITIES: readonly TutoringAvailability[] = [
  {
    id: 'av-1',
    tutorId: CURRENT_TUTOR_ID,
    subjectId: 'calc',
    date: '2026-06-17',
    startTime: '14:00',
    endTime: '15:30',
    mode: 'virtual',
    capacity: 5,
    status: 'active',
    virtualUrl: 'https://meet.eciwise.local/tutorias/calculo-diferencial',
  },
  {
    id: 'av-2',
    tutorId: CURRENT_TUTOR_ID,
    subjectId: 'algebra',
    date: '2026-06-18',
    startTime: '10:00',
    endTime: '11:30',
    mode: 'presential',
    capacity: 2,
    status: 'active',
    room: 'Sala de estudio B-204',
  },
  {
    id: 'av-3',
    tutorId: 'tutor-2',
    subjectId: 'programming',
    date: '2026-06-19',
    startTime: '16:00',
    endTime: '17:30',
    mode: 'virtual',
    capacity: 3,
    status: 'active',
    virtualUrl: 'https://meet.eciwise.local/tutorias/programacion',
  },
  {
    id: 'av-4',
    tutorId: 'tutor-3',
    subjectId: 'physics',
    date: '2026-06-20',
    startTime: '08:00',
    endTime: '09:30',
    mode: 'presential',
    capacity: 4,
    status: 'active',
    room: 'Laboratorio F-101',
  },
  {
    id: 'av-5',
    tutorId: CURRENT_TUTOR_ID,
    subjectId: 'programming',
    date: '2026-06-23',
    startTime: '08:00',
    endTime: '09:30',
    mode: 'virtual',
    capacity: 1,
    status: 'active',
    virtualUrl: 'https://meet.eciwise.local/tutorias/programacion-carlos',
  },
];

const RESERVATIONS: readonly TutoringReservation[] = [
  {
    id: 'res-1',
    availabilityId: 'av-1',
    studentId: 'student-2',
    subjectId: 'calc',
    specificTopic: 'Regla de la cadena',
    description: 'Resolver dudas sobre derivadas compuestas.',
    mode: 'virtual',
    status: 'confirmed',
    createdAt: '2026-06-08T10:30:00Z',
  },
  {
    id: 'res-2',
    availabilityId: 'av-2',
    studentId: CURRENT_STUDENT_ID,
    subjectId: 'algebra',
    specificTopic: 'Espacios vectoriales',
    description: 'Preparar parcial con ejercicios de bases y dimension.',
    mode: 'presential',
    status: 'confirmed',
    createdAt: '2026-06-09T15:20:00Z',
  },
  {
    id: 'res-3',
    availabilityId: 'av-3',
    studentId: CURRENT_STUDENT_ID,
    subjectId: 'programming',
    specificTopic: 'Recursion',
    description: 'Practica de casos base y llamadas recursivas.',
    mode: 'virtual',
    status: 'completed',
    createdAt: '2026-05-25T14:10:00Z',
    tutorObservation: 'La estudiante resolvio ejercicios guiados con autonomia.',
    tutorRating: {
      topicMastery: 5,
      clarity: 5,
      usefulness: 4,
      punctuality: 5,
      comment: 'Sesion muy util para aclarar recursion.',
    },
    studentParticipation: {
      punctuality: 5,
      participation: 5,
      preparation: 4,
      respect: 5,
      assignments: 4,
      comment: 'Llego con dudas puntuales y avanzo rapido.',
    },
  },
  {
    id: 'res-4',
    availabilityId: 'av-4',
    studentId: 'student-3',
    subjectId: 'physics',
    specificTopic: 'Dinamica',
    description: 'Revisar diagramas de cuerpo libre.',
    mode: 'presential',
    status: 'completed',
    createdAt: '2026-05-20T08:00:00Z',
    tutorRating: {
      topicMastery: 5,
      clarity: 4,
      usefulness: 5,
      punctuality: 5,
      comment: 'Excelente sesion presencial.',
    },
    studentParticipation: {
      punctuality: 5,
      participation: 5,
      preparation: 5,
      respect: 5,
      assignments: 5,
      comment: 'Participacion sobresaliente.',
    },
  },
];

function startIso(availability: TutoringAvailability): string {
  return `${availability.date}T${availability.startTime}`;
}

function overlaps(a: TutoringAvailability, b: TutoringAvailability): boolean {
  return a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function ratingAverage(rating: TutorRating): number {
  return average([rating.topicMastery, rating.clarity, rating.usefulness, rating.punctuality]);
}

function participationAverage(rating: StudentParticipationRating): number {
  return average([
    rating.punctuality,
    rating.participation,
    rating.preparation,
    rating.respect,
    rating.assignments,
  ]);
}

@Injectable({ providedIn: 'root' })
export class TutoringMockService {
  private readonly notifications = inject(NotificationsService);

  private readonly _subjects = signal<readonly AcademicSubject[]>(SUBJECTS);
  private readonly _tutors = signal<readonly TutorProfile[]>(TUTORS);
  private readonly _students = signal<readonly StudentProfile[]>(STUDENTS);
  private readonly _availabilities = signal<readonly TutoringAvailability[]>(AVAILABILITIES);
  private readonly _reservations = signal<readonly TutoringReservation[]>(RESERVATIONS);
  private readonly _legacyHistory = signal<readonly HistoryEntry[]>([]);

  readonly currentStudentId = CURRENT_STUDENT_ID;
  readonly currentTutorId = CURRENT_TUTOR_ID;
  readonly subjects = this._subjects.asReadonly();
  readonly tutors = this._tutors.asReadonly();
  readonly students = this._students.asReadonly();
  readonly availabilities = this._availabilities.asReadonly();
  readonly reservations = this._reservations.asReadonly();

  readonly slots = computed<TutoringSlot[]>(() =>
    this._availabilities()
      .filter((availability) => availability.status === 'active')
      .map((availability) => this.slotFor(availability))
      .filter((slot): slot is TutoringSlot => slot !== null)
      .sort((a, b) => startIso(a.availability).localeCompare(startIso(b.availability))),
  );

  readonly studentReservations = computed(() =>
    this._reservations()
      .filter((reservation) => reservation.studentId === CURRENT_STUDENT_ID)
      .sort((a, b) =>
        this.availabilityStart(b.availabilityId).localeCompare(
          this.availabilityStart(a.availabilityId),
        ),
      ),
  );

  readonly activeStudentReservations = computed(() =>
    this.studentReservations().filter((reservation) => reservation.status === 'confirmed'),
  );

  readonly tutorAvailabilities = computed(() =>
    this._availabilities()
      .filter((availability) => availability.tutorId === CURRENT_TUTOR_ID)
      .sort((a, b) => startIso(a).localeCompare(startIso(b))),
  );

  readonly tutorReservations = computed(() => {
    const tutorAvailabilityIds = new Set(this.tutorAvailabilities().map((availability) => availability.id));
    return this._reservations()
      .filter((reservation) => tutorAvailabilityIds.has(reservation.availabilityId))
      .sort((a, b) =>
        this.availabilityStart(a.availabilityId).localeCompare(
          this.availabilityStart(b.availabilityId),
        ),
      );
  });

  readonly tutorPendingReservations = computed(() =>
    this.tutorReservations().filter((reservation) => reservation.status === 'confirmed'),
  );

  readonly tutorAvailabilityCount = computed(
    () =>
      this.tutorAvailabilities().filter((availability) => availability.status === 'active').length,
  );

  readonly tutorHistoryEntries = computed<HistoryEntry[]>(() => {
    const generated = this._reservations()
      .filter((reservation) => reservation.status !== 'confirmed')
      .map((reservation) => this.historyEntryFor(reservation))
      .filter((entry): entry is HistoryEntry => entry !== null);
    return [...generated, ...this._legacyHistory()].sort((a, b) =>
      b.datetime.localeCompare(a.datetime),
    );
  });

  readonly recommendations = computed<Recommendation[]>(() => {
    const reservedSubjects = new Set(
      this.studentReservations().map((reservation) => reservation.subjectId),
    );
    return this.slots()
      .filter((slot) => !slot.userReservation && slot.availableSeats > 0)
      .map((slot) => ({
        id: `rec-${slot.availability.id}`,
        availabilityId: slot.availability.id,
        tutorId: slot.tutor.id,
        subjectId: slot.subject.id,
        score:
          Math.round(
            (slot.tutor.reputation.averageRating * 18 +
              (reservedSubjects.has(slot.subject.id) ? 12 : 0) +
              Math.min(slot.availableSeats, 4) * 2) *
              10,
          ) / 10,
        reasonKey: reservedSubjects.has(slot.subject.id)
          ? 'tutorias.recommendations.reasonHistory'
          : 'tutorias.recommendations.reasonRating',
        relatedTopics: this.relatedTopics(slot.subject.id),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  });

  readonly stats = computed<TutoringStats>(() => {
    const reservations = this._reservations();
    const completed = reservations.filter((reservation) => reservation.status === 'completed');
    const cancelled = reservations.filter((reservation) => reservation.status === 'cancelled');
    const noShows = reservations.filter((reservation) => reservation.status === 'no_show');
    const attendedStudents = new Set(completed.map((reservation) => reservation.studentId)).size;
    const totalClosed = completed.length + cancelled.length + noShows.length;

    return {
      requestedSubjects: this.countBy(
        reservations,
        (reservation) => this.subjectName(reservation.subjectId),
      ),
      commonTopics: this.countBy(reservations, (reservation) => reservation.specificTopic),
      demandHours: this.countBy(reservations, (reservation) => {
        const availability = this.availabilityById(reservation.availabilityId);
        return availability?.startTime ?? '--:--';
      }),
      topTutors: this._tutors()
        .map((tutor) => ({
          label: tutor.name,
          value: Math.round(this.monitorReputation(tutor.id).averageRating * 20),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
      attendanceRate:
        totalClosed === 0 ? 0 : Math.round((completed.length / totalClosed) * 100),
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      attendedStudents,
    };
  });

  searchSlots(filters: TutoringSearchFilters): TutoringSlot[] {
    return this.slots().filter((slot) => {
      const availability = slot.availability;
      return (
        (!filters.subjectId || availability.subjectId === filters.subjectId) &&
        (!filters.tutorId || availability.tutorId === filters.tutorId) &&
        (!filters.mode || availability.mode === filters.mode) &&
        (!filters.date || availability.date === filters.date) &&
        (!filters.time ||
          availability.startTime <= filters.time && availability.endTime > filters.time)
      );
    });
  }

  createAvailability(payload: CreateAvailabilityPayload): TutoringActionResult<TutoringAvailability> {
    const tutor = this.tutorById(CURRENT_TUTOR_ID);
    const validation = this.validateAvailabilityPayload(payload, tutor);
    if (validation) {
      return { ok: false, errorKey: validation };
    }

    const availability: TutoringAvailability = {
      id: `av-${Date.now()}`,
      tutorId: CURRENT_TUTOR_ID,
      subjectId: payload.subjectId,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      mode: payload.mode,
      capacity: Math.max(1, Math.trunc(payload.capacity)),
      status: 'active',
      ...(payload.mode === 'virtual'
        ? { virtualUrl: `https://meet.eciwise.local/tutorias/${Date.now()}` }
        : { room: payload.room?.trim() || this.nextRoom() }),
    };

    if (this.hasTutorOverlap(availability)) {
      return { ok: false, errorKey: 'tutor.availability.errors.overlap' };
    }

    this._availabilities.update((items) =>
      [...items, availability].sort((a, b) => startIso(a).localeCompare(startIso(b))),
    );
    return { ok: true, value: availability };
  }

  updateAvailability(
    id: string,
    payload: CreateAvailabilityPayload,
  ): TutoringActionResult<TutoringAvailability> {
    const current = this.availabilityById(id);
    const tutor = this.tutorById(CURRENT_TUTOR_ID);
    if (!current) {
      return { ok: false, errorKey: 'tutor.availability.errors.notFound' };
    }
    if (this.activeReservationCount(id) > 0) {
      return { ok: false, errorKey: 'tutor.availability.errors.reserved' };
    }
    const validation = this.validateAvailabilityPayload(payload, tutor);
    if (validation) {
      return { ok: false, errorKey: validation };
    }

    const updated: TutoringAvailability = {
      ...current,
      subjectId: payload.subjectId,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      mode: payload.mode,
      capacity: Math.max(1, Math.trunc(payload.capacity)),
      ...(payload.mode === 'virtual'
        ? { virtualUrl: current.virtualUrl ?? `https://meet.eciwise.local/tutorias/${id}`, room: undefined }
        : { room: payload.room?.trim() || current.room || this.nextRoom(), virtualUrl: undefined }),
    };

    if (this.hasTutorOverlap(updated, id)) {
      return { ok: false, errorKey: 'tutor.availability.errors.overlap' };
    }

    this._availabilities.update((items) =>
      items.map((availability) => (availability.id === id ? updated : availability)),
    );
    this.notifications.add('notifications.tutoring.availabilityChanged', 'info', {
      subject: this.subjectName(updated.subjectId),
    });
    return { ok: true, value: updated };
  }

  deleteAvailability(id: string): TutoringActionResult {
    if (this.activeReservationCount(id) > 0) {
      return { ok: false, errorKey: 'tutor.availability.errors.reserved' };
    }
    this._availabilities.update((items) => items.filter((availability) => availability.id !== id));
    return { ok: true };
  }

  cancelAvailability(id: string, reason: string): TutoringActionResult {
    const availability = this.availabilityById(id);
    const trimmedReason = reason.trim();
    if (!availability) {
      return { ok: false, errorKey: 'tutor.availability.errors.notFound' };
    }
    if (!trimmedReason) {
      return { ok: false, errorKey: 'tutoring.errors.justificationRequired' };
    }

    this._availabilities.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', cancelReason: trimmedReason } : item,
      ),
    );
    this._reservations.update((items) =>
      items.map((reservation) =>
        reservation.availabilityId === id && reservation.status === 'confirmed'
          ? { ...reservation, status: 'cancelled', cancelReason: trimmedReason }
          : reservation,
      ),
    );
    this.notifications.add('notifications.tutoring.availabilityCancelled', 'warning', {
      subject: this.subjectName(availability.subjectId),
    });
    return { ok: true };
  }

  reserve(
    availabilityId: string,
    payload: ReserveTutoringPayload,
  ): TutoringActionResult<TutoringReservation> {
    const availability = this.availabilityById(availabilityId);
    const student = this.studentById(CURRENT_STUDENT_ID);
    if (!student?.active) {
      return { ok: false, errorKey: 'tutoring.errors.inactiveStudent' };
    }
    if (availability?.status !== 'active') {
      return { ok: false, errorKey: 'tutoring.errors.notAvailable' };
    }
    if (availability.mode !== payload.mode) {
      return { ok: false, errorKey: 'tutoring.errors.modeMismatch' };
    }
    if (!payload.specificTopic.trim() || !payload.description.trim()) {
      return { ok: false, errorKey: 'tutoring.errors.requiredFields' };
    }
    if (this.availableSeats(availability.id) <= 0) {
      return { ok: false, errorKey: 'tutoring.errors.full' };
    }
    if (this.hasStudentOverlap(availability)) {
      return { ok: false, errorKey: 'tutoring.errors.studentOverlap' };
    }

    const reservation: TutoringReservation = {
      id: `res-${Date.now()}`,
      availabilityId,
      studentId: CURRENT_STUDENT_ID,
      subjectId: availability.subjectId,
      specificTopic: payload.specificTopic.trim(),
      description: payload.description.trim(),
      mode: payload.mode,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    this._reservations.update((items) => [...items, reservation]);
    this.notifications.add('notifications.tutoring.reserved', 'success', {
      subject: this.subjectName(availability.subjectId),
    });
    return { ok: true, value: reservation };
  }

  cancelReservation(id: string, reason: string): TutoringActionResult {
    const reservation = this.reservationById(id);
    const availability = reservation ? this.availabilityById(reservation.availabilityId) : null;
    const trimmedReason = reason.trim();
    if (!reservation || !availability) {
      return { ok: false, errorKey: 'tutoring.errors.notFound' };
    }
    if (!trimmedReason) {
      return { ok: false, errorKey: 'tutoring.errors.justificationRequired' };
    }
    if (reservation.status !== 'confirmed') {
      return { ok: false, errorKey: 'tutoring.errors.notCancellable' };
    }
    if (!this.canCancelByWindow(availability)) {
      return { ok: false, errorKey: 'tutoring.errors.cancelWindow' };
    }
    this._reservations.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: 'cancelled', cancelReason: trimmedReason } : item,
      ),
    );
    this.notifications.add('notifications.tutoring.cancelled', 'warning', {
      subject: this.subjectName(reservation.subjectId),
    });
    return { ok: true };
  }

  rescheduleReservation(reservationId: string, availabilityId: string): TutoringActionResult {
    const reservation = this.reservationById(reservationId);
    const target = this.availabilityById(availabilityId);
    if (!reservation || target?.status !== 'active') {
      return { ok: false, errorKey: 'tutoring.errors.notAvailable' };
    }
    if (reservation.status !== 'confirmed') {
      return { ok: false, errorKey: 'tutoring.errors.notReschedulable' };
    }
    if (this.availableSeats(target.id) <= 0) {
      return { ok: false, errorKey: 'tutoring.errors.full' };
    }
    if (this.hasStudentOverlap(target, reservation.id)) {
      return { ok: false, errorKey: 'tutoring.errors.studentOverlap' };
    }
    this._reservations.update((items) =>
      items.map((item) =>
        item.id === reservationId
          ? {
              ...item,
              availabilityId,
              subjectId: target.subjectId,
              mode: target.mode,
              status: 'confirmed',
            }
          : item,
      ),
    );
    this.notifications.add('notifications.tutoring.rescheduled', 'info', {
      subject: this.subjectName(target.subjectId),
    });
    return { ok: true };
  }

  markAttendance(id: string, status: AttendanceStatus): TutoringActionResult {
    const reservation = this.reservationById(id);
    if (!reservation) {
      return { ok: false, errorKey: 'tutoring.errors.notFound' };
    }
    this._reservations.update((items) =>
      items.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    return { ok: true };
  }

  saveTutorObservation(id: string, observation: string): TutoringActionResult {
    const reservation = this.reservationById(id);
    if (!reservation) {
      return { ok: false, errorKey: 'tutoring.errors.notFound' };
    }
    this._reservations.update((items) =>
      items.map((item) =>
        item.id === id ? { ...item, tutorObservation: observation.trim() } : item,
      ),
    );
    return { ok: true };
  }

  rateTutor(id: string, rating: TutorRating): TutoringActionResult {
    const reservation = this.reservationById(id);
    if (!reservation) {
      return { ok: false, errorKey: 'tutoring.errors.notFound' };
    }
    if (reservation.status !== 'completed') {
      return { ok: false, errorKey: 'tutoring.errors.ratingOnlyCompleted' };
    }
    if (reservation.tutorRating) {
      return { ok: false, errorKey: 'tutoring.errors.alreadyRated' };
    }
    this._reservations.update((items) =>
      items.map((item) => (item.id === id ? { ...item, tutorRating: rating } : item)),
    );
    return { ok: true };
  }

  evaluateStudent(id: string, rating: StudentParticipationRating): TutoringActionResult {
    const reservation = this.reservationById(id);
    if (!reservation) {
      return { ok: false, errorKey: 'tutoring.errors.notFound' };
    }
    if (reservation.status !== 'completed') {
      return { ok: false, errorKey: 'tutoring.errors.ratingOnlyCompleted' };
    }
    this._reservations.update((items) =>
      items.map((item) => (item.id === id ? { ...item, studentParticipation: rating } : item)),
    );
    return { ok: true };
  }

  addLegacyHistory(entry: HistoryEntry): void {
    this._legacyHistory.update((items) => [entry, ...items.filter((item) => item.id !== entry.id)]);
  }

  availabilityById(id: string): TutoringAvailability | null {
    return this._availabilities().find((availability) => availability.id === id) ?? null;
  }

  reservationById(id: string): TutoringReservation | null {
    return this._reservations().find((reservation) => reservation.id === id) ?? null;
  }

  tutorById(id: string): TutorProfile | null {
    return this._tutors().find((tutor) => tutor.id === id) ?? null;
  }

  studentById(id: string): StudentProfile | null {
    return this._students().find((student) => student.id === id) ?? null;
  }

  subjectById(id: string): AcademicSubject | null {
    return this._subjects().find((subject) => subject.id === id) ?? null;
  }

  subjectName(id: string): string {
    return this.subjectById(id)?.name ?? id;
  }

  monitorReputation(tutorId: string): MonitorReputation {
    const tutor = this.tutorById(tutorId);
    const tutorAvailabilityIds = new Set(
      this._availabilities()
        .filter((availability) => availability.tutorId === tutorId)
        .map((availability) => availability.id),
    );
    const reservations = this._reservations().filter((reservation) =>
      tutorAvailabilityIds.has(reservation.availabilityId),
    );
    const ratings = reservations
      .map((reservation) => reservation.tutorRating)
      .filter((rating): rating is TutorRating => !!rating);
    const completed = reservations.filter((reservation) => reservation.status === 'completed').length;
    const noShows = reservations.filter((reservation) => reservation.status === 'no_show').length;
    const base = tutor?.reputation;
    const comments = [
      ...(base?.comments ?? []),
      ...ratings.map((rating) => rating.comment).filter(Boolean),
    ];
    return {
      averageRating:
        ratings.length > 0
          ? average([base?.averageRating ?? 0, ...ratings.map(ratingAverage)].filter(Boolean))
          : (base?.averageRating ?? 0),
      completedSessions: (base?.completedSessions ?? 0) + completed,
      attendanceRate:
        completed + noShows === 0
          ? (base?.attendanceRate ?? 0)
          : Math.round((completed / (completed + noShows)) * 100),
      comments,
    };
  }

  studentReputation(studentId: string): StudentReputation {
    const student = this.studentById(studentId);
    const reservations = this._reservations().filter(
      (reservation) => reservation.studentId === studentId,
    );
    const ratings = reservations
      .map((reservation) => reservation.studentParticipation)
      .filter((rating): rating is StudentParticipationRating => !!rating);
    const completed = reservations.filter((reservation) => reservation.status === 'completed').length;
    const cancelled = reservations.filter((reservation) => reservation.status === 'cancelled').length;
    const noShows = reservations.filter((reservation) => reservation.status === 'no_show').length;
    const total = completed + cancelled + noShows;
    const base = student?.reputation;
    return {
      averageRating:
        ratings.length > 0
          ? average([base?.averageRating ?? 0, ...ratings.map(participationAverage)].filter(Boolean))
          : (base?.averageRating ?? 0),
      attendedSessions: (base?.attendedSessions ?? 0) + completed,
      attendanceRate: total === 0 ? (base?.attendanceRate ?? 0) : Math.round((completed / total) * 100),
      cancellationRate:
        total === 0 ? (base?.cancellationRate ?? 0) : Math.round((cancelled / total) * 100),
      noShows: (base?.noShows ?? 0) + noShows,
      comments: [
        ...(base?.comments ?? []),
        ...ratings.map((rating) => rating.comment).filter(Boolean),
      ],
    };
  }

  activeReservationCount(availabilityId: string): number {
    return this._reservations().filter(
      (reservation) =>
        reservation.availabilityId === availabilityId && reservation.status === 'confirmed',
    ).length;
  }

  availableSeats(availabilityId: string): number {
    const availability = this.availabilityById(availabilityId);
    if (availability?.status !== 'active') {
      return 0;
    }
    return Math.max(0, availability.capacity - this.activeReservationCount(availabilityId));
  }

  private slotFor(availability: TutoringAvailability): TutoringSlot | null {
    const tutor = this.tutorById(availability.tutorId);
    const subject = this.subjectById(availability.subjectId);
    if (!tutor || !subject) {
      return null;
    }
    const userReservation = this._reservations().find(
      (reservation) =>
        reservation.availabilityId === availability.id &&
        reservation.studentId === CURRENT_STUDENT_ID &&
        reservation.status === 'confirmed',
    );
    const reservedSeats = this.activeReservationCount(availability.id);
    return {
      availability,
      tutor,
      subject,
      reservedSeats,
      availableSeats: Math.max(0, availability.capacity - reservedSeats),
      ...(userReservation ? { userReservation } : {}),
    };
  }

  private validateAvailabilityPayload(
    payload: CreateAvailabilityPayload,
    tutor: TutorProfile | null,
  ): string | null {
    if (!tutor?.authorized) {
      return 'tutor.availability.errors.unauthorized';
    }
    if (!payload.subjectId || !payload.date || !payload.startTime || !payload.endTime) {
      return 'tutoring.errors.requiredFields';
    }
    if (!tutor.subjectIds.includes(payload.subjectId)) {
      return 'tutor.availability.errors.subjectNotAssigned';
    }
    if (payload.startTime >= payload.endTime) {
      return 'tutor.availability.errors.invalidTime';
    }
    if (payload.capacity < 1) {
      return 'tutor.availability.errors.capacity';
    }
    return null;
  }

  private hasTutorOverlap(candidate: TutoringAvailability, ignoreId = ''): boolean {
    return this._availabilities().some(
      (availability) =>
        availability.id !== ignoreId &&
        availability.status === 'active' &&
        availability.tutorId === candidate.tutorId &&
        overlaps(availability, candidate),
    );
  }

  private hasStudentOverlap(candidate: TutoringAvailability, ignoreReservationId = ''): boolean {
    return this._reservations().some((reservation) => {
      if (
        reservation.id === ignoreReservationId ||
        reservation.studentId !== CURRENT_STUDENT_ID ||
        reservation.status !== 'confirmed'
      ) {
        return false;
      }
      const availability = this.availabilityById(reservation.availabilityId);
      return availability ? overlaps(availability, candidate) : false;
    });
  }

  private canCancelByWindow(availability: TutoringAvailability): boolean {
    const startsAt = new Date(startIso(availability)).getTime();
    const minimum = Date.now() + CANCEL_WINDOW_HOURS * 60 * 60 * 1000;
    return startsAt >= minimum;
  }

  private availabilityStart(availabilityId: string): string {
    const availability = this.availabilityById(availabilityId);
    return availability ? startIso(availability) : '';
  }

  private historyEntryFor(reservation: TutoringReservation): HistoryEntry | null {
    const availability = this.availabilityById(reservation.availabilityId);
    const student = this.studentById(reservation.studentId);
    if (!availability || !student) {
      return null;
    }
    return {
      id: `h-${reservation.id}`,
      subject: this.subjectName(reservation.subjectId),
      student: student.name,
      datetime: startIso(availability),
      status: reservation.status === 'completed' ? 'completed' : 'cancelled',
      topic: reservation.specificTopic,
      mode: reservation.mode,
      ...(reservation.tutorRating ? { rating: ratingAverage(reservation.tutorRating) } : {}),
    };
  }

  private nextRoom(): string {
    return `Sala de estudio B-${200 + this._availabilities().length}`;
  }

  private relatedTopics(subjectId: string): readonly string[] {
    const topics: Record<string, readonly string[]> = {
      calc: ['Limites', 'Derivadas', 'Aplicaciones de la derivada'],
      algebra: ['Matrices', 'Bases', 'Transformaciones lineales'],
      programming: ['Recursion', 'Estructuras de datos', 'Pruebas unitarias'],
      physics: ['Dinamica', 'Energia', 'Cantidad de movimiento'],
    };
    return topics[subjectId] ?? [];
  }

  private countBy<T>(items: readonly T[], getLabel: (item: T) => string): { label: string; value: number }[] {
    const counts = new Map<string, number>();
    for (const item of items) {
      const label = getLabel(item);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }
}
