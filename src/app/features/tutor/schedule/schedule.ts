import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { TutorSesionParticipanteDto } from '../../../core/tutoring/tutoring-api.service';
import { TutorSessionsService } from '../tutor-sessions.service';

interface CancelFormModel {
  reason: string;
}

/** Agenda operativa del tutor: próximas sesiones, sesiones cerradas y cancelación. */
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
  private readonly sessions = inject(TutorSessionsService);

  protected readonly loading = this.sessions.loading;
  protected readonly upcomingReservations = this.sessions.upcomingParticipants;
  protected readonly closedReservations = this.sessions.pastSessions;

  protected readonly selectedReservation = signal<TutorSesionParticipanteDto | null>(null);
  protected readonly cancelOpen = signal(false);
  protected readonly busy = signal(false);
  protected readonly actionError = signal('');
  protected readonly actionSuccess = signal('');

  protected readonly loadError = computed(() => this.sessions.error());

  protected readonly cancelModel = signal<CancelFormModel>({ reason: '' });
  protected readonly cancelForm = form(this.cancelModel, (schema) => {
    required(schema.reason, { message: 'tutor.schedule.validation.cancelReason' });
  });

  ngOnInit(): void {
    this.sessions.load();
  }

  openCancel(reservation: TutorSesionParticipanteDto): void {
    this.selectedReservation.set(reservation);
    this.cancelModel.set({ reason: '' });
    this.actionError.set('');
    this.actionSuccess.set('');
    this.cancelOpen.set(true);
  }

  submitCancel(event: Event): void {
    event.preventDefault();
    if (this.cancelForm().invalid()) {
      this.actionError.set('tutor.schedule.validation.cancelReason');
      return;
    }
    const reservation = this.selectedReservation();
    if (!reservation) {
      return;
    }
    this.busy.set(true);
    this.actionError.set('');
    this.sessions.cancelarTutoria(reservation.tutoriaId, this.cancelModel().reason).subscribe({
      next: () => {
        this.busy.set(false);
        this.cancelOpen.set(false);
        this.actionSuccess.set('tutor.schedule.feedback.cancelled');
      },
      error: (err: unknown) => {
        this.busy.set(false);
        const backendMsg = (err as { error?: { message?: string } })?.error?.message;
        this.actionError.set(backendMsg ?? 'tutoring.errors.generic');
      },
    });
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
