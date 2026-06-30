import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, max, min, required } from '@angular/forms/signals';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import { SectionTabsComponent, SectionTab } from '../../../shared/ui/section-tabs/section-tabs';
import {
  TutoringMode,
  TutoringSearchFilters,
  TutoringSlot,
} from '../../tutor/tutor.models';
import { TutoringSearchService } from './search.service';
import {
  ReservaEstudianteDto,
  TutoringApiService,
} from '../../../core/tutoring/tutoring-api.service';

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
export class TutoriasComponent implements OnInit {
  private readonly search = inject(TutoringSearchService);
  private readonly api = inject(TutoringApiService);
  private readonly i18n = inject(TranslateService);

  private readonly _reservas = signal<ReservaEstudianteDto[]>([]);

  protected readonly sections: readonly SectionTab[] = [
    { id: 'search', labelKey: 'tutorias.tabs.search', icon: 'search' },
    { id: 'reservations', labelKey: 'tutorias.tabs.reservations', icon: 'calendar' },
    { id: 'recommendations', labelKey: 'tutorias.tabs.recommendations', icon: 'assistant' },
    { id: 'history', labelKey: 'tutorias.tabs.history', icon: 'history' },
  ];
  protected readonly section = signal('search');
  protected readonly recommendations = this.search.recommendations;
  protected readonly subjectOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'tutorias.filters.allSubjects' },
    ...this.search.subjects().map((s) => ({ value: s.id, label: s.name })),
  ]);
  protected readonly tutorOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'tutorias.filters.allTutors' },
    ...this.search.tutors().map((t) => ({ value: t.id, label: t.name })),
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

  protected readonly slots = computed(() => this.search.searchSlots(this.filters()));
  protected readonly reservedIds = this.search.reservedIds;
  protected readonly activeReservations = computed(() =>
    this._reservas().filter((r) => r.estadoAsistencia === 'CONFIRMADA')
  );
  protected readonly history = computed(() =>
    this._reservas().filter((r) => r.estadoAsistencia !== 'CONFIRMADA')
  );

  protected readonly reserveOpen = signal(false);
  protected readonly cancelOpen = signal(false);
  protected readonly rateOpen = signal(false);
  protected readonly selectedSlot = signal<TutoringSlot | null>(null);
  protected readonly selectedReservation = signal<ReservaEstudianteDto | null>(null);

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

  ngOnInit(): void {
    this.search.reload();
    this.api.listarMisReservas().subscribe((data) => this._reservas.set(data));
  }

  private err(key: string): string {
    return this.i18n.instant(key);
  }

  private recargarReservas(): void {
    this.api.listarMisReservas().subscribe((data) => this._reservas.set(data));
  }

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
      this.actionError.set(this.err('tutoring.errors.requiredFields'));
      return;
    }
    const slot = this.selectedSlot();
    if (!slot) {
      return;
    }
    this.search.reserve(slot, this.reserveModel()).subscribe((result) => {
      if (!result.ok) {
        this.actionError.set(result.errorKey ?? this.err('tutoring.errors.generic'));
        return;
      }
      this.recargarReservas();
      this.actionSuccess.set('tutorias.feedback.reserved');
      this.reserveOpen.set(false);
    });
  }

  openCancel(reservation: ReservaEstudianteDto): void {
    this.actionError.set('');
    this.selectedReservation.set(reservation);
    this.cancelModel.set({ reason: '' });
    this.cancelOpen.set(true);
  }

  submitCancel(event: Event): void {
    event.preventDefault();
    if (this.cancelForm().invalid()) {
      this.actionError.set(this.err('tutorias.validation.cancelReason'));
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    this.api.cancelarReserva(reservation.tutoriaId, { motivo: this.cancelModel().reason }).subscribe({
      next: () => {
        this.recargarReservas();
        this.actionSuccess.set('tutorias.feedback.cancelled');
        this.cancelOpen.set(false);
      },
      error: (err: unknown) => {
        const backendMsg = (err as { error?: { message?: string } })?.error?.message;
        this.actionError.set(backendMsg ?? this.err('tutoring.errors.generic'));
      },
    });
  }

  openRate(reservation: ReservaEstudianteDto): void {
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
      this.actionError.set(this.err('tutorias.validation.rating'));
      return;
    }
    // Rating submission is a future feature; close modal optimistically
    this.actionSuccess.set('tutorias.feedback.rated');
    this.rateOpen.set(false);
  }

  eventValue(event: Event): string {
    return event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement
      ? event.target.value
      : '';
  }

  slotById(availabilityId: string): TutoringSlot | null {
    return this.search.slotById(availabilityId);
  }

  modeKey(mode: TutoringMode): string {
    return `tutoring.modes.${mode}`;
  }
}
