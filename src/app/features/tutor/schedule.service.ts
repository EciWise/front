import { Injectable, computed, signal } from '@angular/core';
import { TutorSession } from './tutor.models';

const SEED: readonly TutorSession[] = [
  { id: 'ts1', subject: 'Cálculo Diferencial', datetime: '2026-06-01T14:00', seats: 5 },
  { id: 'ts2', subject: 'Álgebra Lineal', datetime: '2026-06-04T10:00', seats: 4 },
];

/** Horarios de tutoría creados por el tutor (mock con signals). */
@Injectable({ providedIn: 'root' })
export class TutorScheduleService {
  private readonly _sessions = signal<TutorSession[]>([...SEED]);
  readonly sessions = this._sessions.asReadonly();
  readonly upcomingCount = computed(() => this._sessions().length);

  create(subject: string, datetime: string, seats: number): void {
    if (!subject.trim() || !datetime) {
      return;
    }
    const session: TutorSession = {
      id: `ts-${Date.now()}`,
      subject: subject.trim(),
      datetime,
      seats: Math.max(1, seats),
    };
    this._sessions.update((list) =>
      [...list, session].sort((a, b) => a.datetime.localeCompare(b.datetime)),
    );
  }

  cancel(id: string): void {
    this._sessions.update((list) => list.filter((s) => s.id !== id));
  }
}
