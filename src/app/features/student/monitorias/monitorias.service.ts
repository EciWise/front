import { Injectable, signal } from '@angular/core';
import { Monitoria } from './monitoria.model';

const SEED: readonly Monitoria[] = [
  { id: 'm1', subject: 'Cálculo Diferencial', tutor: 'Carlos Tutor', datetime: '2026-06-01T14:00:00', seats: 5, status: 'available' },
  { id: 'm2', subject: 'Programación', tutor: 'Laura Méndez', datetime: '2026-06-02T10:00:00', seats: 3, status: 'available' },
  { id: 'm3', subject: 'Física Mecánica', tutor: 'Andrés Gómez', datetime: '2026-06-03T16:00:00', seats: 0, status: 'requested' },
];

/**
 * Catálogo mock de monitorías y solicitudes del estudiante. Reemplazable por
 * API real sin afectar a la UI.
 */
@Injectable({ providedIn: 'root' })
export class MonitoriasService {
  private readonly _items = signal<Monitoria[]>([...SEED]);
  readonly items = this._items.asReadonly();

  request(id: string): void {
    this._items.update((list) =>
      list.map((m) =>
        m.id === id && m.status === 'available'
          ? { ...m, status: 'requested', seats: Math.max(0, m.seats - 1) }
          : m,
      ),
    );
  }
}
