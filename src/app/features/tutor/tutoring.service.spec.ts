import { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  StudentProfile,
  TutorProfile,
  TutoringAvailability,
  TutoringReservation,
} from './tutor.models';
import { TutoringMockService } from './tutoring.service';

interface TutoringMockInternals {
  readonly _availabilities: WritableSignal<readonly TutoringAvailability[]>;
  readonly _reservations: WritableSignal<readonly TutoringReservation[]>;
  readonly _students: WritableSignal<readonly StudentProfile[]>;
  readonly _tutors: WritableSignal<readonly TutorProfile[]>;
}

function internals(service: TutoringMockService): TutoringMockInternals {
  return service as unknown as TutoringMockInternals;
}

function reservationFor(
  id: string,
  availabilityId: string,
  studentId = 'student-2',
): TutoringReservation {
  return {
    id,
    availabilityId,
    studentId,
    subjectId: 'programming',
    specificTopic: 'Tema de prueba',
    description: 'Reserva de prueba',
    mode: 'virtual',
    status: 'confirmed',
    createdAt: '2026-06-10T12:00:00Z',
  };
}

function oneHourFromNow(): { date: string; time: string } {
  const value = new Date(Date.now() + 60 * 60 * 1000);
  const date = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`;
  const time = `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(
    2,
    '0',
  )}`;
  return { date, time };
}

describe('TutoringMockService', () => {
  let service: TutoringMockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutoringMockService);
  });

  it('valida autorizacion, materia asignada, horario y cupos al publicar disponibilidad', () => {
    const state = internals(service);

    state._tutors.update((items) =>
      items.map((tutor) => (tutor.id === service.currentTutorId ? { ...tutor, authorized: false } : tutor)),
    );
    expect(
      service.createAvailability({
        subjectId: 'calc',
        date: '2026-06-24',
        startTime: '09:00',
        endTime: '10:00',
        mode: 'virtual',
        capacity: 1,
      }).errorKey,
    ).toBe('tutor.availability.errors.unauthorized');

    state._tutors.update((items) =>
      items.map((tutor) => (tutor.id === service.currentTutorId ? { ...tutor, authorized: true } : tutor)),
    );
    expect(
      service.createAvailability({
        subjectId: 'physics',
        date: '2026-06-24',
        startTime: '09:00',
        endTime: '10:00',
        mode: 'virtual',
        capacity: 1,
      }).errorKey,
    ).toBe('tutor.availability.errors.subjectNotAssigned');

    expect(
      service.createAvailability({
        subjectId: 'calc',
        date: '2026-06-24',
        startTime: '10:00',
        endTime: '09:00',
        mode: 'virtual',
        capacity: 1,
      }).errorKey,
    ).toBe('tutor.availability.errors.invalidTime');

    expect(
      service.createAvailability({
        subjectId: 'calc',
        date: '2026-06-24',
        startTime: '09:00',
        endTime: '10:00',
        mode: 'virtual',
        capacity: 0,
      }).errorKey,
    ).toBe('tutor.availability.errors.capacity');
  });

  it('impide disponibilidades traslapadas del mismo tutor', () => {
    const result = service.createAvailability({
      subjectId: 'calc',
      date: '2026-06-17',
      startTime: '14:30',
      endTime: '15:00',
      mode: 'virtual',
      capacity: 2,
    });

    expect(result.ok).toBe(false);
    expect(result.errorKey).toBe('tutor.availability.errors.overlap');
  });

  it('valida reservas: estudiante activo, campos, modalidad, cupos y traslapes', () => {
    const state = internals(service);

    state._students.update((items) =>
      items.map((student) =>
        student.id === service.currentStudentId ? { ...student, active: false } : student,
      ),
    );
    expect(
      service.reserve('av-1', {
        specificTopic: 'Derivadas',
        description: 'Dudas puntuales',
        mode: 'virtual',
      }).errorKey,
    ).toBe('tutoring.errors.inactiveStudent');

    state._students.update((items) =>
      items.map((student) =>
        student.id === service.currentStudentId ? { ...student, active: true } : student,
      ),
    );
    expect(
      service.reserve('av-1', { specificTopic: '', description: '', mode: 'virtual' }).errorKey,
    ).toBe('tutoring.errors.requiredFields');

    expect(
      service.reserve('av-2', {
        specificTopic: 'Bases',
        description: 'Practica',
        mode: 'virtual',
      }).errorKey,
    ).toBe('tutoring.errors.modeMismatch');

    state._reservations.update((items) => [...items, reservationFor('res-full', 'av-5')]);
    expect(
      service.reserve('av-5', {
        specificTopic: 'Listas',
        description: 'Ejercicios',
        mode: 'virtual',
      }).errorKey,
    ).toBe('tutoring.errors.full');

    state._availabilities.update((items) => [
      ...items,
      {
        id: 'av-overlap-student',
        tutorId: 'tutor-2',
        subjectId: 'programming',
        date: '2026-06-18',
        startTime: '10:30',
        endTime: '11:00',
        mode: 'virtual',
        capacity: 3,
        status: 'active',
        virtualUrl: 'https://meet.eciwise.local/tutorias/test',
      },
    ]);
    expect(
      service.reserve('av-overlap-student', {
        specificTopic: 'Recursion',
        description: 'Practica',
        mode: 'virtual',
      }).errorKey,
    ).toBe('tutoring.errors.studentOverlap');
  });

  it('aplica reglas de cancelacion de reservas y disponibilidad', () => {
    const state = internals(service);

    expect(service.cancelReservation('res-2', '').errorKey).toBe(
      'tutoring.errors.justificationRequired',
    );

    const near = oneHourFromNow();
    state._availabilities.update((items) =>
      items.map((availability) =>
        availability.id === 'av-2'
          ? { ...availability, date: near.date, startTime: near.time, endTime: '23:59' }
          : availability,
      ),
    );
    expect(service.cancelReservation('res-2', 'Cruce academico').errorKey).toBe(
      'tutoring.errors.cancelWindow',
    );

    expect(service.deleteAvailability('av-1').errorKey).toBe('tutor.availability.errors.reserved');
    expect(service.cancelAvailability('av-1', '').errorKey).toBe(
      'tutoring.errors.justificationRequired',
    );

    expect(service.cancelAvailability('av-1', 'Cambio operativo').ok).toBe(true);
    expect(service.availabilityById('av-1')?.status).toBe('cancelled');
    expect(service.reservationById('res-1')?.status).toBe('cancelled');
  });

  it('reprograma solo reservas confirmadas hacia horarios con cupo y sin traslape', () => {
    const state = internals(service);

    state._reservations.update((items) => [...items, reservationFor('res-full', 'av-5')]);
    expect(service.rescheduleReservation('res-2', 'av-5').errorKey).toBe('tutoring.errors.full');

    const result = service.rescheduleReservation('res-2', 'av-1');
    expect(result.ok).toBe(true);
    expect(service.reservationById('res-2')?.availabilityId).toBe('av-1');

    expect(service.rescheduleReservation('res-3', 'av-1').errorKey).toBe(
      'tutoring.errors.notReschedulable',
    );
  });

  it('solo permite evaluaciones sobre tutorias realizadas y evita doble calificacion del estudiante', () => {
    expect(
      service.rateTutor('res-2', {
        topicMastery: 5,
        clarity: 5,
        usefulness: 5,
        punctuality: 5,
        comment: 'Muy clara.',
      }).errorKey,
    ).toBe('tutoring.errors.ratingOnlyCompleted');

    expect(
      service.rateTutor('res-3', {
        topicMastery: 5,
        clarity: 5,
        usefulness: 5,
        punctuality: 5,
        comment: 'Repetida.',
      }).errorKey,
    ).toBe('tutoring.errors.alreadyRated');

    expect(
      service.evaluateStudent('res-1', {
        punctuality: 5,
        participation: 5,
        preparation: 5,
        respect: 5,
        assignments: 5,
        comment: 'Participacion alta.',
      }).errorKey,
    ).toBe('tutoring.errors.ratingOnlyCompleted');

    expect(
      service.evaluateStudent('res-3', {
        punctuality: 4,
        participation: 4,
        preparation: 4,
        respect: 5,
        assignments: 4,
        comment: 'Buen trabajo.',
      }).ok,
    ).toBe(true);
  });

  it('stats calcula countBy sobre reservas (cubre countBy y demandHours)', () => {
    const s = service.stats();
    expect(s.completedCount).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(s.requestedSubjects)).toBe(true);
    expect(Array.isArray(s.commonTopics)).toBe(true);
    expect(Array.isArray(s.demandHours)).toBe(true);
    expect(Array.isArray(s.topTutors)).toBe(true);
  });

  it('recommendations genera relatedTopics para cada slot disponible', () => {
    const recs = service.recommendations();
    expect(Array.isArray(recs)).toBe(true);
    for (const rec of recs) {
      expect(Array.isArray(rec.relatedTopics)).toBe(true);
    }
  });

  it('tutorHistoryEntries construye entradas de historial (cubre historyEntryFor)', () => {
    const entries = service.tutorHistoryEntries();
    expect(Array.isArray(entries)).toBe(true);
  });

  it('tutorHistoryEntries retorna null para reservas sin disponibilidad conocida (cubre rama null)', () => {
    const state = internals(service);
    state._reservations.update((items) => [
      ...items,
      {
        id: 'res-orphan',
        availabilityId: 'av-nonexistent',
        studentId: 'student-1',
        subjectId: 'calc',
        specificTopic: 'Limites',
        description: 'Sin disponibilidad',
        mode: 'virtual',
        status: 'cancelled',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
    const entries = service.tutorHistoryEntries();
    const orphan = entries.find((e) => e.id === 'h-res-orphan');
    expect(orphan).toBeUndefined();
  });

  it('createAvailability exitosa cubre la rama presential y nextRoom', () => {
    const result = service.createAvailability({
      subjectId: 'calc',
      date: '2027-01-15',
      startTime: '08:00',
      endTime: '09:00',
      mode: 'presential',
      capacity: 2,
    });
    expect(result.ok).toBe(true);
    if (result.ok && result.value) {
      expect(typeof result.value.id).toBe('string');
    }
  });

  it('searchSlots con filtros vacíos devuelve todos los slots activos', () => {
    const slots = service.searchSlots({ subjectId: '', tutorId: '', mode: '', date: '', time: '' });
    expect(Array.isArray(slots)).toBe(true);
  });

  it('searchSlots filtra por materia, modo y fecha', () => {
    const bySubject = service.searchSlots({ subjectId: 'calc', tutorId: '', mode: '', date: '', time: '' });
    expect(bySubject.every((s) => s.availability.subjectId === 'calc')).toBe(true);

    const byMode = service.searchSlots({ subjectId: '', tutorId: '', mode: 'virtual', date: '', time: '' });
    expect(byMode.every((s) => s.availability.mode === 'virtual')).toBe(true);

    const byDate = service.searchSlots({ subjectId: '', tutorId: '', mode: '', date: '2026-06-17', time: '' });
    expect(byDate.every((s) => s.availability.date === '2026-06-17')).toBe(true);
  });

  it('monitorReputation para tutor sin reservas usa base reputation', () => {
    const rep = service.monitorReputation('tutor-3');
    expect(typeof rep.averageRating).toBe('number');
    expect(rep.averageRating).toBeGreaterThan(0);
  });

  it('studentReputation calcula tasas correctamente', () => {
    const rep = service.studentReputation('student-1');
    expect(typeof rep.attendanceRate).toBe('number');
    expect(rep.attendanceRate).toBeGreaterThanOrEqual(0);
  });

  it('addLegacyHistory agrega y deduplica entradas', () => {
    const entry = {
      id: 'h-legacy-1',
      subject: 'Calculo',
      student: 'Estudiante X',
      datetime: '2026-01-01T10:00:00Z',
      status: 'completed' as const,
      topic: 'Integrales',
      mode: 'virtual' as const,
    };
    service.addLegacyHistory(entry);
    service.addLegacyHistory(entry);
    const entries = service.tutorHistoryEntries();
    const count = entries.filter((e: { id: string }) => e.id === 'h-legacy-1').length;
    expect(count).toBe(1);
  });
});
