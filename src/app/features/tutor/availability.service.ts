import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TutoringApiService } from '../../core/tutoring/tutoring-api.service';
import { WeekDay } from './tutor.models';

const STORAGE_KEY = 'eciwise.availability';

/** Clave de un bloque de disponibilidad: `${día}-${hora}`. */
export type SlotKey = `${WeekDay}-${string}`;

const DAY_MAP: Record<number, WeekDay> = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' };

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly api = inject(TutoringApiService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _slots = signal<ReadonlySet<SlotKey>>(this.restore());
  readonly slots = this._slots.asReadonly();
  readonly count = computed(() => this._slots().size);

  constructor() {
    this.api.listarDisponibilidades().subscribe({
      next: (data) => {
        const keys = data
          .filter((d) => d.activa)
          .map((d): SlotKey => `${DAY_MAP[d.franjaDiaSemana] ?? 'mon'}-00:00`);
        this._slots.set(new Set(keys));
      },
    });
  }

  isActive(key: SlotKey): boolean {
    return this._slots().has(key);
  }

  toggle(key: SlotKey): void {
    const next = new Set(this._slots());
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    this._slots.set(next);
  }

  persist(): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._slots()]));
    }
  }

  private restore(): ReadonlySet<SlotKey> {
    if (!this.isBrowser) return new Set<SlotKey>();
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<SlotKey>();
    try {
      return new Set<SlotKey>(JSON.parse(raw) as SlotKey[]);
    } catch {
      return new Set<SlotKey>();
    }
  }
}
