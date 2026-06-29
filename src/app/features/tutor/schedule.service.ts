import { Injectable, computed, inject, signal } from '@angular/core';
import { TutoringApiService, DisponibilidadDto } from '../../core/tutoring/tutoring-api.service';
import { TutorSession } from './tutor.models';

function toSession(d: DisponibilidadDto): TutorSession {
  return {
    id: d.id,
    subject: d.materiaId,
    datetime: `${d.vigenciaDesde}T00:00`,
    seats: d.cuposMaximos,
    mode: d.modalidad === 'VIRTUAL' ? 'virtual' : 'presential',
  };
}

@Injectable({ providedIn: 'root' })
export class TutorScheduleService {
  private readonly api = inject(TutoringApiService);

  private readonly _sessions = signal<TutorSession[]>([]);
  readonly sessions = this._sessions.asReadonly();
  readonly upcomingCount = computed(() => this._sessions().length);

  constructor() {
    this.load();
  }

  load(): void {
    this.api.listarDisponibilidades().subscribe({
      next: (data) => this._sessions.set(data.filter((d) => d.activa).map(toSession)),
    });
  }

  cancel(id: string): void {
    this.api.desactivarDisponibilidad(id).subscribe({
      next: () => this._sessions.update((items) => items.filter((s) => s.id !== id)),
    });
  }

  create(subject: string, datetime: string, seats: number): void {
    const [date = ''] = datetime.split('T');
    this.api
      .publicarDisponibilidad({
        franjaId: '',
        materiaId: subject,
        modalidad: 'VIRTUAL',
        cuposMaximos: seats,
        vigenciaDesde: date,
        vigenciaHasta: date,
      })
      .subscribe({ next: (d) => this._sessions.update((items) => [...items, toSession(d)]) });
  }
}
