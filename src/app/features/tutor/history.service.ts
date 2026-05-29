import { Injectable, signal } from '@angular/core';
import { HistoryEntry } from './tutor.models';

const SEED: readonly HistoryEntry[] = [
  { id: 'h-seed1', subject: 'Cálculo', student: 'Sofía Lara', datetime: '2026-05-20T14:00', status: 'completed' },
  { id: 'h-seed2', subject: 'Programación', student: 'Juan Pérez', datetime: '2026-05-18T10:00', status: 'completed' },
];

/** Historial de tutorías del tutor (mock con signals). */
@Injectable({ providedIn: 'root' })
export class TutorHistoryService {
  private readonly _entries = signal<HistoryEntry[]>([...SEED]);
  readonly entries = this._entries.asReadonly();

  add(entry: HistoryEntry): void {
    this._entries.update((list) =>
      [entry, ...list.filter((e) => e.id !== entry.id)].sort((a, b) =>
        b.datetime.localeCompare(a.datetime),
      ),
    );
  }
}
