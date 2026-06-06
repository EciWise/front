import { Injectable, computed, inject, signal } from '@angular/core';
import { RequestStatus, TutoringRequest } from './tutor.models';
import { TutorHistoryService } from './history.service';

const SEED: readonly TutoringRequest[] = [
  { id: 'r1', student: 'Ana Estudiante', subject: 'Cálculo', datetime: '2026-06-01T14:00', status: 'pending' },
  { id: 'r2', student: 'Diego Ruiz', subject: 'Álgebra Lineal', datetime: '2026-06-02T10:00', status: 'pending' },
  { id: 'r3', student: 'María Páez', subject: 'Física', datetime: '2026-06-03T16:00', status: 'pending' },
];

/**
 * Solicitudes de tutoría de los estudiantes. Al aceptar/rechazar, registra la
 * entrada correspondiente en el historial.
 */
@Injectable({ providedIn: 'root' })
export class TutoringRequestsService {
  private readonly history = inject(TutorHistoryService);

  private readonly _requests = signal<TutoringRequest[]>([...SEED]);
  readonly requests = this._requests.asReadonly();
  readonly pendingCount = computed(
    () => this._requests().filter((r) => r.status === 'pending').length,
  );

  accept(id: string): void {
    this.resolve(id, 'accepted');
  }

  reject(id: string): void {
    this.resolve(id, 'rejected');
  }

  private resolve(id: string, status: Exclude<RequestStatus, 'pending'>): void {
    const request = this._requests().find((r) => r.id === id);
    if (request?.status !== 'pending') {
      return;
    }
    this._requests.update((list) =>
      list.map((r) => (r.id === id ? { ...r, status } : r)),
    );
    this.history.add({
      id: `h-${request.id}`,
      subject: request.subject,
      student: request.student,
      datetime: request.datetime,
      status: status === 'accepted' ? 'completed' : 'cancelled',
    });
  }
}
