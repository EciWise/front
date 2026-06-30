import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, tap } from 'rxjs';
import {
  DisponibilidadDto,
  ResultadoCancelacionTutoria,
  TutorSesionParticipanteDto,
  TutoringApiService,
} from '../../core/tutoring/tutoring-api.service';

/**
 * Fuente única de datos reales del tutor: participantes de sus sesiones
 * (`/reservas/mis-sesiones`) y disponibilidades publicadas (`/disponibilidad`).
 * Reemplaza por completo al antiguo mock de tutorías.
 */
@Injectable({ providedIn: 'root' })
export class TutorSessionsService {
  private readonly api = inject(TutoringApiService);

  private readonly _sesiones = signal<readonly TutorSesionParticipanteDto[]>([]);
  private readonly _disponibilidades = signal<readonly DisponibilidadDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /** Participantes con reserva activa en próximas sesiones del tutor. */
  readonly upcomingParticipants = computed(() =>
    this._sesiones().filter((s) => s.estadoAsistencia === 'CONFIRMADA'),
  );

  /** Participaciones cerradas (asistida, inasistida o cancelada). */
  readonly pastSessions = computed(() =>
    this._sesiones().filter((s) => s.estadoAsistencia !== 'CONFIRMADA'),
  );

  readonly activeSlotsCount = computed(
    () => this._disponibilidades().filter((d) => d.activa).length,
  );

  /** Número de tutorías distintas con participantes confirmados. */
  readonly upcomingCount = computed(
    () => new Set(this.upcomingParticipants().map((s) => s.tutoriaId)).size,
  );

  readonly participantsCount = computed(() => this.upcomingParticipants().length);

  constructor() {
    this.load();
  }

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    forkJoin({
      sesiones: this.api.listarMisSesiones(),
      disponibilidades: this.api.listarDisponibilidades(),
    }).subscribe({
      next: ({ sesiones, disponibilidades }) => {
        this._sesiones.set(sesiones);
        this._disponibilidades.set(disponibilidades);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this._error.set('tutoring.errors.generic');
      },
    });
  }

  /** Cancela una tutoría completa (libera a todos los participantes) y recarga. */
  cancelarTutoria(tutoriaId: string, motivo: string): Observable<ResultadoCancelacionTutoria> {
    return this.api.cancelarTutoria({ tutoriaId, motivo }).pipe(tap(() => this.load()));
  }
}
