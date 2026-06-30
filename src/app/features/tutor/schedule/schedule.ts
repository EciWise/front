import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import {
  TutorSesionParticipanteDto,
  TutoringApiService,
} from '../../../core/tutoring/tutoring-api.service';

interface ObservationFormModel {
  observation: string;
}

/** Agenda operativa del tutor: próximas sesiones y sesiones cerradas. */
@Component({
  selector: 'eci-tutor-schedule',
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
  ],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class TutorScheduleComponent implements OnInit {
  private readonly api = inject(TutoringApiService);
  private readonly i18n = inject(TranslateService);

  private readonly _sesiones = signal<TutorSesionParticipanteDto[]>([]);

  protected readonly upcomingReservations = computed(() =>
    this._sesiones().filter((s) => s.estadoAsistencia === 'CONFIRMADA'),
  );
  protected readonly closedReservations = computed(() =>
    this._sesiones().filter((s) => s.estadoAsistencia !== 'CONFIRMADA'),
  );

  protected readonly selectedReservation = signal<TutorSesionParticipanteDto | null>(null);
  protected readonly observationOpen = signal(false);
  protected readonly actionError = signal('');
  protected readonly actionSuccess = signal('');

  protected readonly observationModel = signal<ObservationFormModel>({ observation: '' });
  protected readonly observationForm = form(this.observationModel, (schema) => {
    required(schema.observation, { message: 'tutor.schedule.validation.observation' });
  });

  ngOnInit(): void {
    this.api.listarMisSesiones().subscribe({
      next: (data) => this._sesiones.set(data),
      error: () => this.actionError.set(this.i18n.instant('tutoring.errors.generic')),
    });
  }

  openObservation(reservation: TutorSesionParticipanteDto): void {
    this.selectedReservation.set(reservation);
    this.observationModel.set({ observation: '' });
    this.actionError.set('');
    this.observationOpen.set(true);
  }

  submitObservation(event: Event): void {
    event.preventDefault();
    if (this.observationForm().invalid()) {
      this.actionError.set(this.i18n.instant('tutor.schedule.validation.observation'));
      return;
    }
    // TODO: endpoint de observación del tutor (fase posterior)
    this.actionError.set('');
    this.actionSuccess.set('tutor.schedule.feedback.observation');
    this.observationOpen.set(false);
  }

  modeKey(modalidad: 'VIRTUAL' | 'PRESENCIAL'): string {
    return modalidad === 'VIRTUAL' ? 'tutoring.modes.virtual' : 'tutoring.modes.presential';
  }

  statusKey(estado: string): string {
    const map: Record<string, string> = {
      CONFIRMADA: 'tutoring.status.confirmed',
      ASISTIDA: 'tutoring.status.completed',
      INASISTIDA: 'tutoring.status.no_show',
      CANCELADA: 'tutoring.status.cancelled',
    };
    return map[estado] ?? estado;
  }

  statusCssValue(estado: string): string {
    const map: Record<string, string> = {
      CONFIRMADA: 'confirmed',
      ASISTIDA: 'completed',
      INASISTIDA: 'no_show',
      CANCELADA: 'cancelled',
    };
    return map[estado] ?? estado.toLowerCase();
  }
}
