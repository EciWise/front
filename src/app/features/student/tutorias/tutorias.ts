import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { SectionTabsComponent, SectionTab } from '../../../shared/ui/section-tabs/section-tabs';
import {
  ReserveTutoringPayload,
  TutorRating,
  TutoringAvailability,
  TutoringMode,
  TutoringReservation,
  TutoringSearchFilters,
  TutoringSlot,
} from '../../tutor/tutor.models';
import { TutoringMockService } from '../../tutor/tutoring.service';

interface ReserveFormModel {
  specificTopic: string;
  description: string;
  mode: TutoringMode;
}

interface CancelFormModel {
  reason: string;
}

interface TutorRatingFormModel {
  topicMastery: number;
  clarity: number;
  usefulness: number;
  punctuality: number;
  comment: string;
}

type RatingField = keyof Omit<TutorRatingFormModel, 'comment'>;

/** Listado funcional de tutorias academicas para estudiantes. */
@Component({
  selector: 'eci-tutorias',
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
    SelectComponent,
    SectionTabsComponent,
  ],
  templateUrl: './tutorias.html',
  styleUrl: './tutorias.css',
})
export class TutoriasComponent {
  private readonly tutoring = inject(TutoringMockService);

  protected readonly sections: readonly SectionTab[] = [
    { id: 'search', labelKey: 'tutorias.tabs.search', icon: 'search' },
    { id: 'reservations', labelKey: 'tutorias.tabs.reservations', icon: 'calendar' },
    { id: 'recommendations', labelKey: 'tutorias.tabs.recommendations', icon: 'assistant' },
    { id: 'history', labelKey: 'tutorias.tabs.history', icon: 'history' },
  ];
  protected readonly section = signal('search');
  protected readonly subjects = this.tutoring.subjects;
  protected readonly tutors = this.tutoring.tutors;
  protected readonly recommendations = this.tutoring.recommendations;
  protected readonly subjectOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'tutorias.filters.allSubjects' },
    ...this.subjects().map((subject) => ({ value: subject.id, label: subject.name })),
  ]);
  protected readonly tutorOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'tutorias.filters.allTutors' },
    ...this.tutors().map((tutor) => ({ value: tutor.id, label: tutor.name })),
  ]);
  protected readonly filterModeOptions: readonly SelectOption[] = [
    { value: '', labelKey: 'tutorias.filters.allModes' },
    { value: 'virtual', labelKey: 'tutoring.modes.virtual' },
    { value: 'presential', labelKey: 'tutoring.modes.presential' },
  ];
  protected readonly reserveModeOptions = computed<readonly SelectOption[]>(() => {
    const mode = this.selectedSlot()?.availability.mode;
    return mode
      ? [{ value: mode, labelKey: `tutoring.modes.${mode}` }]
      : [
          { value: 'virtual', labelKey: 'tutoring.modes.virtual' },
          { value: 'presential', labelKey: 'tutoring.modes.presential' },
        ];
  });
  protected readonly stars = [1, 2, 3, 4, 5] as const;
  protected readonly ratingFields: readonly RatingField[] = [
    'topicMastery',
    'clarity',
    'usefulness',
    'punctuality',
  ];
  protected readonly actionError = signal('');
  protected readonly actionSuccess = signal('');

  protected readonly filters = signal<TutoringSearchFilters>({
    subjectId: '',
    tutorId: '',
    mode: '',
    date: '',
    time: '',
  });

  protected readonly slots = computed(() => this.tutoring.searchSlots(this.filters()));
  protected readonly activeReservations = computed(() => this.tutoring.activeStudentReservations());
  protected readonly history = computed(() =>
    this.tutoring.studentReservations().filter((reservation) => reservation.status !== 'confirmed'),
  );

  protected readonly reserveOpen = signal(false);
  protected readonly cancelOpen = signal(false);
  protected readonly rescheduleOpen = signal(false);
  protected readonly rateOpen = signal(false);
  protected readonly selectedSlot = signal<TutoringSlot | null>(null);
  protected readonly selectedReservation = signal<TutoringReservation | null>(null);

  protected readonly reserveModel = signal<ReserveFormModel>({
    specificTopic: '',
    description: '',
    mode: 'virtual',
  });
  protected readonly reserveForm = form(this.reserveModel, (schema) => {
    required(schema.specificTopic, { message: 'tutorias.validation.topic' });
    required(schema.description, { message: 'tutorias.validation.description' });
    required(schema.mode, { message: 'tutorias.validation.mode' });
  });

  protected readonly cancelModel = signal<CancelFormModel>({ reason: '' });
  protected readonly cancelForm = form(this.cancelModel, (schema) => {
    required(schema.reason, { message: 'tutorias.validation.cancelReason' });
  });

  protected readonly ratingModel = signal<TutorRatingFormModel>({
    topicMastery: 0,
    clarity: 0,
    usefulness: 0,
    punctuality: 0,
    comment: '',
  });
  protected readonly ratingForm = form(this.ratingModel, (schema) => {
    min(schema.topicMastery, 1, { message: 'tutorias.validation.rating' });
    max(schema.topicMastery, 5);
    min(schema.clarity, 1, { message: 'tutorias.validation.rating' });
    max(schema.clarity, 5);
    min(schema.usefulness, 1, { message: 'tutorias.validation.rating' });
    max(schema.usefulness, 5);
    min(schema.punctuality, 1, { message: 'tutorias.validation.rating' });
    max(schema.punctuality, 5);
    required(schema.comment, { message: 'tutorias.validation.comment' });
  });

  protected readonly rescheduleOptions = computed(() => {
    const reservation = this.selectedReservation();
    if (!reservation) {
      return [];
    }
    return this.tutoring
      .slots()
      .filter(
        (slot) =>
          slot.availability.id !== reservation.availabilityId &&
          slot.availableSeats > 0 &&
          !slot.userReservation,
      );
  });

  setFilter(key: keyof TutoringSearchFilters, value: string): void {
    this.filters.update((filters) => ({
      ...filters,
      [key]: key === 'mode' ? (value as '' | TutoringMode) : value,
    }));
  }

  setFilterFromSelect(key: keyof TutoringSearchFilters, value: SelectValue): void {
    this.setFilter(key, value === null ? '' : String(value));
  }

  clearFilters(): void {
    this.filters.set({ subjectId: '', tutorId: '', mode: '', date: '', time: '' });
  }

  openReserve(slot: TutoringSlot): void {
    this.actionError.set('');
    this.actionSuccess.set('');
    this.selectedSlot.set(slot);
    this.reserveModel.set({
      specificTopic: '',
      description: '',
      mode: slot.availability.mode,
    });
    this.reserveOpen.set(true);
  }

  submitReserve(event: Event): void {
    event.preventDefault();
    if (this.reserveForm().invalid()) {
      this.actionError.set('tutoring.errors.requiredFields');
      return;
    }
    const slot = this.selectedSlot();
    if (!slot) {
      return;
    }
    const payload: ReserveTutoringPayload = this.reserveModel();
    const result = this.tutoring.reserve(slot.availability.id, payload);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionSuccess.set('tutorias.feedback.reserved');
    this.reserveOpen.set(false);
  }

  openCancel(reservation: TutoringReservation): void {
    this.actionError.set('');
    this.selectedReservation.set(reservation);
    this.cancelModel.set({ reason: '' });
    this.cancelOpen.set(true);
  }

  submitCancel(event: Event): void {
    event.preventDefault();
    if (this.cancelForm().invalid()) {
      this.actionError.set('tutorias.validation.cancelReason');
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    const result = this.tutoring.cancelReservation(reservation.id, this.cancelModel().reason);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionSuccess.set('tutorias.feedback.cancelled');
    this.cancelOpen.set(false);
  }

  openReschedule(reservation: TutoringReservation): void {
    this.actionError.set('');
    this.selectedReservation.set(reservation);
    this.rescheduleOpen.set(true);
  }

  rescheduleTo(slot: TutoringSlot): void {
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    const result = this.tutoring.rescheduleReservation(reservation.id, slot.availability.id);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionSuccess.set('tutorias.feedback.rescheduled');
    this.rescheduleOpen.set(false);
  }

  openRate(reservation: TutoringReservation): void {
    this.actionError.set('');
    this.selectedReservation.set(reservation);
    this.ratingModel.set({
      topicMastery: 0,
      clarity: 0,
      usefulness: 0,
      punctuality: 0,
      comment: '',
    });
    this.rateOpen.set(true);
  }

  setRating(field: RatingField, value: number): void {
    this.ratingModel.update((rating) => ({ ...rating, [field]: value }));
  }

  setReserveMode(value: SelectValue): void {
    if (value === 'virtual' || value === 'presential') {
      this.reserveModel.update((model) => ({ ...model, mode: value }));
    }
  }

  submitRating(event: Event): void {
    event.preventDefault();
    if (this.ratingForm().invalid()) {
      this.actionError.set('tutorias.validation.rating');
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    const rating: TutorRating = this.ratingModel();
    const result = this.tutoring.rateTutor(reservation.id, rating);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionSuccess.set('tutorias.feedback.rated');
    this.rateOpen.set(false);
  }

  eventValue(event: Event): string {
    return event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement
      ? event.target.value
      : '';
  }

  availabilityFor(reservation: TutoringReservation): TutoringAvailability | null {
    return this.tutoring.availabilityById(reservation.availabilityId);
  }

  subjectName(subjectId: string): string {
    return this.tutoring.subjectName(subjectId);
  }

  tutorName(availability: TutoringAvailability): string {
    return this.tutoring.tutorById(availability.tutorId)?.name ?? availability.tutorId;
  }

  tutorCareer(availability: TutoringAvailability): string {
    return this.tutoring.tutorById(availability.tutorId)?.career ?? '';
  }

  studentAccess(availability: TutoringAvailability): string {
    return availability.mode === 'virtual'
      ? (availability.virtualUrl ?? '')
      : (availability.room ?? '');
  }

  monitorRating(availability: TutoringAvailability): number {
    return this.tutoring.monitorReputation(availability.tutorId).averageRating;
  }

  monitorSessions(availability: TutoringAvailability): number {
    return this.tutoring.monitorReputation(availability.tutorId).completedSessions;
  }

  monitorAttendance(availability: TutoringAvailability): number {
    return this.tutoring.monitorReputation(availability.tutorId).attendanceRate;
  }

  monitorComments(availability: TutoringAvailability): readonly string[] {
    return this.tutoring.monitorReputation(availability.tutorId).comments.slice(0, 2);
  }

  slotById(availabilityId: string): TutoringSlot | null {
    return this.tutoring.slots().find((slot) => slot.availability.id === availabilityId) ?? null;
  }

  tutorRatingAverage(reservation: TutoringReservation): number {
    const rating = reservation.tutorRating;
    if (!rating) {
      return 0;
    }
    return (
      Math.round(
        ((rating.topicMastery + rating.clarity + rating.usefulness + rating.punctuality) / 4) * 10,
      ) / 10
    );
  }

  statusKey(status: TutoringReservation['status']): string {
    return `tutoring.status.${status}`;
  }

  modeKey(mode: TutoringMode): string {
    return `tutoring.modes.${mode}`;
  }
}
