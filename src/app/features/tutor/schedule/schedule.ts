import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import {
  AttendanceStatus,
  StudentParticipationRating,
  TutoringAvailability,
  TutoringReservation,
} from '../tutor.models';
import { TutoringMockService } from '../tutoring.service';

interface ObservationFormModel {
  observation: string;
}

interface ParticipationFormModel {
  punctuality: number;
  participation: number;
  preparation: number;
  respect: number;
  assignments: number;
  comment: string;
}

type ParticipationField = keyof Omit<ParticipationFormModel, 'comment'>;

/** Agenda operativa del monitor para realizar y cerrar tutorias. */
@Component({
  selector: 'eci-tutor-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    FormField,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class TutorScheduleComponent {
  private readonly tutoring = inject(TutoringMockService);

  protected readonly reservations = this.tutoring.tutorReservations;
  protected readonly upcomingReservations = computed(() =>
    this.reservations().filter((reservation) => reservation.status === 'confirmed'),
  );
  protected readonly closedReservations = computed(() =>
    this.reservations().filter((reservation) => reservation.status !== 'confirmed'),
  );
  protected readonly stars = [1, 2, 3, 4, 5] as const;
  protected readonly participationFields: readonly ParticipationField[] = [
    'punctuality',
    'participation',
    'preparation',
    'respect',
    'assignments',
  ];

  protected readonly selectedReservation = signal<TutoringReservation | null>(null);
  protected readonly observationOpen = signal(false);
  protected readonly participationOpen = signal(false);
  protected readonly actionError = signal('');
  protected readonly actionSuccess = signal('');

  protected readonly observationModel = signal<ObservationFormModel>({ observation: '' });
  protected readonly observationForm = form(this.observationModel, (schema) => {
    required(schema.observation, { message: 'tutor.schedule.validation.observation' });
  });

  protected readonly participationModel = signal<ParticipationFormModel>({
    punctuality: 0,
    participation: 0,
    preparation: 0,
    respect: 0,
    assignments: 0,
    comment: '',
  });
  protected readonly participationForm = form(this.participationModel, (schema) => {
    min(schema.punctuality, 1, { message: 'tutor.schedule.validation.rating' });
    max(schema.punctuality, 5);
    min(schema.participation, 1, { message: 'tutor.schedule.validation.rating' });
    max(schema.participation, 5);
    min(schema.preparation, 1, { message: 'tutor.schedule.validation.rating' });
    max(schema.preparation, 5);
    min(schema.respect, 1, { message: 'tutor.schedule.validation.rating' });
    max(schema.respect, 5);
    min(schema.assignments, 1, { message: 'tutor.schedule.validation.rating' });
    max(schema.assignments, 5);
    required(schema.comment, { message: 'tutor.schedule.validation.comment' });
  });

  markAttendance(reservation: TutoringReservation, status: AttendanceStatus): void {
    const result = this.tutoring.markAttendance(reservation.id, status);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set('tutor.schedule.feedback.attendance');
  }

  openObservation(reservation: TutoringReservation): void {
    this.selectedReservation.set(reservation);
    this.observationModel.set({ observation: reservation.tutorObservation ?? '' });
    this.actionError.set('');
    this.observationOpen.set(true);
  }

  submitObservation(event: Event): void {
    event.preventDefault();
    if (this.observationForm().invalid()) {
      this.actionError.set('tutor.schedule.validation.observation');
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    const result = this.tutoring.saveTutorObservation(
      reservation.id,
      this.observationModel().observation,
    );
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set('tutor.schedule.feedback.observation');
    this.observationOpen.set(false);
  }

  openParticipation(reservation: TutoringReservation): void {
    this.selectedReservation.set(reservation);
    this.participationModel.set({
      punctuality: reservation.studentParticipation?.punctuality ?? 0,
      participation: reservation.studentParticipation?.participation ?? 0,
      preparation: reservation.studentParticipation?.preparation ?? 0,
      respect: reservation.studentParticipation?.respect ?? 0,
      assignments: reservation.studentParticipation?.assignments ?? 0,
      comment: reservation.studentParticipation?.comment ?? '',
    });
    this.actionError.set('');
    this.participationOpen.set(true);
  }

  setParticipation(field: ParticipationField, value: number): void {
    this.participationModel.update((rating) => ({ ...rating, [field]: value }));
  }

  submitParticipation(event: Event): void {
    event.preventDefault();
    if (this.participationForm().invalid()) {
      this.actionError.set('tutor.schedule.validation.rating');
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    const rating: StudentParticipationRating = this.participationModel();
    const result = this.tutoring.evaluateStudent(reservation.id, rating);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set('tutor.schedule.feedback.participation');
    this.participationOpen.set(false);
  }

  availabilityFor(reservation: TutoringReservation): TutoringAvailability | null {
    return this.tutoring.availabilityById(reservation.availabilityId);
  }

  subjectName(subjectId: string): string {
    return this.tutoring.subjectName(subjectId);
  }

  studentName(reservation: TutoringReservation): string {
    return this.tutoring.studentById(reservation.studentId)?.name ?? reservation.studentId;
  }

  studentCareer(reservation: TutoringReservation): string {
    return this.tutoring.studentById(reservation.studentId)?.career ?? '';
  }

  studentRating(reservation: TutoringReservation): number {
    return this.tutoring.studentReputation(reservation.studentId).averageRating;
  }

  studentAttendance(reservation: TutoringReservation): number {
    return this.tutoring.studentReputation(reservation.studentId).attendanceRate;
  }

  studentCompleted(reservation: TutoringReservation): number {
    return this.tutoring.studentReputation(reservation.studentId).attendedSessions;
  }

  studentComments(reservation: TutoringReservation): readonly string[] {
    return this.tutoring.studentReputation(reservation.studentId).comments.slice(0, 2);
  }

  accessLabel(availability: TutoringAvailability): string {
    return availability.mode === 'virtual'
      ? (availability.virtualUrl ?? '')
      : (availability.room ?? '');
  }

  statusKey(status: AttendanceStatus): string {
    return `tutoring.status.${status}`;
  }

  modeKey(availability: TutoringAvailability): string {
    return `tutoring.modes.${availability.mode}`;
  }
}
