import { Injectable, inject, signal } from '@angular/core';
import { TutoringApiService } from '../../../core/tutoring/tutoring-api.service';
import { Tutoria } from './tutoria.model';

function fromDto(dto: {
  id: string;
  tutorNombre: string | null;
  materiaNombre: string;
  fecha: string;
  horaInicio: string;
  cuposDisponibles: number;
  modalidad: 'VIRTUAL' | 'PRESENCIAL';
}): Tutoria {
  return {
    id: dto.id,
    tutor: dto.tutorNombre ?? 'Monitor',
    subject: dto.materiaNombre,
    datetime: `${dto.fecha}T${dto.horaInicio}:00`,
    seats: dto.cuposDisponibles,
    status: 'available',
    mode: dto.modalidad === 'VIRTUAL' ? 'virtual' : 'presential',
  };
}

@Injectable({ providedIn: 'root' })
export class TutoriasService {
  private readonly api = inject(TutoringApiService);

  private readonly _items = signal<Tutoria[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    this.load();
  }

  load(): void {
    this.api.buscarTutorias().subscribe({ next: (data) => this._items.set(data.map(fromDto)) });
  }

  request(id: string): void {
    this.api
      .reservar({ tutoriaId: id, temaEspecifico: 'Tema por definir', descripcionDudas: 'Reserva desde el listado.' })
      .subscribe({
        next: () =>
          this._items.update((items) =>
            items.map((t) =>
              t.id === id ? { ...t, status: 'requested' as const, seats: Math.max(0, t.seats - 1) } : t,
            ),
          ),
      });
  }

  cancelar(id: string): void {
    this.api
      .cancelarReserva(id, { motivo: 'Cancelado por el estudiante.' })
      .subscribe({
        next: () =>
          this._items.update((items) =>
            items.map((t) => (t.id === id ? { ...t, status: 'available' as const } : t)),
          ),
      });
  }
}
