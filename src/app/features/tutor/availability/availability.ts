import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormField, form, min, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import {
  CreateAvailabilityPayload,
  TutoringAvailability,
  TutoringMode,
} from '../tutor.models';
import { TutoringMockService } from '../tutoring.service';

interface AvailabilityFormModel {
  subjectId: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: TutoringMode;
  capacity: number;
  room: string;
}

interface CancelAvailabilityModel {
  reason: string;
}

/** Publicacion y gestion de disponibilidad del monitor. */
@Component({
  selector: 'eci-tutor-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormField,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    ButtonComponent,
    IconComponent,
    ModalComponent,
    SelectComponent,
  ],
  templateUrl: './availability.html',
  styleUrl: './availability.css',
})
export class TutorAvailabilityComponent {
  private readonly tutoring = inject(TutoringMockService);

  protected readonly availabilities = this.tutoring.tutorAvailabilities;
  protected readonly currentTutor = computed(() => this.tutoring.tutorById(this.tutoring.currentTutorId));
  protected readonly tutorSubjects = computed(() => {
    const tutor = this.currentTutor();
    return this.tutoring.subjects().filter((subject) => tutor?.subjectIds.includes(subject.id));
  });
  protected readonly subjectOptions = computed<readonly SelectOption[]>(() =>
    this.tutorSubjects().map((subject) => ({ value: subject.id, label: subject.name })),
  );
  protected readonly modeOptions: readonly SelectOption[] = [
    { value: 'virtual', labelKey: 'tutoring.modes.virtual' },
    { value: 'presential', labelKey: 'tutoring.modes.presential' },
  ];
  protected readonly selected = signal<TutoringAvailability | null>(null);
  protected readonly cancelTarget = signal<TutoringAvailability | null>(null);
  protected readonly cancelOpen = signal(false);
  protected readonly actionError = signal('');
  protected readonly actionSuccess = signal('');

  protected readonly model = signal<AvailabilityFormModel>({
    subjectId: 'calc',
    date: '2026-06-24',
    startTime: '10:00',
    endTime: '11:30',
    mode: 'virtual',
    capacity: 4,
    room: '',
  });
  protected readonly availabilityForm = form(this.model, (schema) => {
    required(schema.subjectId, { message: 'tutor.availability.validation.subject' });
    required(schema.date, { message: 'tutor.availability.validation.date' });
    required(schema.startTime, { message: 'tutor.availability.validation.start' });
    required(schema.endTime, { message: 'tutor.availability.validation.end' });
    required(schema.mode, { message: 'tutor.availability.validation.mode' });
    min(schema.capacity, 1, { message: 'tutor.availability.validation.capacity' });
  });

  protected readonly cancelModel = signal<CancelAvailabilityModel>({ reason: '' });
  protected readonly cancelForm = form(this.cancelModel, (schema) => {
    required(schema.reason, { message: 'tutor.availability.validation.cancelReason' });
  });

  submitAvailability(event: Event): void {
    event.preventDefault();
    if (this.availabilityForm().invalid()) {
      this.actionError.set('tutoring.errors.requiredFields');
      this.actionSuccess.set('');
      return;
    }
    const payload = this.payload();
    const selected = this.selected();
    const result = selected
      ? this.tutoring.updateAvailability(selected.id, payload)
      : this.tutoring.createAvailability(payload);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      this.actionSuccess.set('');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set(
      selected ? 'tutor.availability.feedback.updated' : 'tutor.availability.feedback.created',
    );
    this.resetForm();
  }

  edit(availability: TutoringAvailability): void {
    if (!this.canModify(availability)) {
      this.actionError.set('tutor.availability.errors.reserved');
      return;
    }
    this.selected.set(availability);
    this.actionError.set('');
    this.model.set({
      subjectId: availability.subjectId,
      date: availability.date,
      startTime: availability.startTime,
      endTime: availability.endTime,
      mode: availability.mode,
      capacity: availability.capacity,
      room: availability.room ?? '',
    });
  }

  remove(availability: TutoringAvailability): void {
    const result = this.tutoring.deleteAvailability(availability.id);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set('tutor.availability.feedback.deleted');
    if (this.selected()?.id === availability.id) {
      this.resetForm();
    }
  }

  openCancel(availability: TutoringAvailability): void {
    this.cancelTarget.set(availability);
    this.cancelModel.set({ reason: '' });
    this.actionError.set('');
    this.cancelOpen.set(true);
  }

  submitCancel(event: Event): void {
    event.preventDefault();
    if (this.cancelForm().invalid()) {
      this.actionError.set('tutor.availability.validation.cancelReason');
      return;
    }
    const target = this.cancelTarget();
    if (!target) {
      return;
    }
    const result = this.tutoring.cancelAvailability(target.id, this.cancelModel().reason);
    if (!result.ok) {
      this.actionError.set(result.errorKey ?? 'tutoring.errors.generic');
      return;
    }
    this.actionError.set('');
    this.actionSuccess.set('tutor.availability.feedback.cancelled');
    this.cancelOpen.set(false);
    if (this.selected()?.id === target.id) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.selected.set(null);
    this.model.set({
      subjectId: this.tutorSubjects()[0]?.id ?? '',
      date: '2026-06-24',
      startTime: '10:00',
      endTime: '11:30',
      mode: 'virtual',
      capacity: 4,
      room: '',
    });
  }

  canModify(availability: TutoringAvailability): boolean {
    return availability.status === 'active' && this.tutoring.activeReservationCount(availability.id) === 0;
  }

  reservationCount(availability: TutoringAvailability): number {
    return this.tutoring.activeReservationCount(availability.id);
  }

  availableSeats(availability: TutoringAvailability): number {
    return this.tutoring.availableSeats(availability.id);
  }

  subjectName(subjectId: string): string {
    return this.tutoring.subjectName(subjectId);
  }

  modeKey(mode: TutoringMode): string {
    return `tutoring.modes.${mode}`;
  }

  setSubject(value: SelectValue): void {
    this.model.update((model) => ({ ...model, subjectId: value === null ? '' : String(value) }));
  }

  setMode(value: SelectValue): void {
    if (value === 'virtual' || value === 'presential') {
      this.model.update((model) => ({ ...model, mode: value }));
    }
  }

  private payload(): CreateAvailabilityPayload {
    const value = this.model();
    return {
      subjectId: value.subjectId,
      date: value.date,
      startTime: value.startTime,
      endTime: value.endTime,
      mode: value.mode,
      capacity: Number(value.capacity),
      ...(value.room.trim() ? { room: value.room.trim() } : {}),
    };
  }
}
