import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WeekDay } from './tutor.models';

const STORAGE_KEY = 'eciwise.availability';

/** Clave de un bloque de disponibilidad: `${día}-${hora}`. */
export type SlotKey = `${WeekDay}-${string}`;

/**
 * Disponibilidad semanal del tutor como conjunto de bloques activos.
 * Persiste en localStorage. Reemplazable por API real sin tocar la UI.
 */
@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _slots = signal<ReadonlySet<SlotKey>>(this.restore());
  readonly slots = this._slots.asReadonly();
  readonly count = computed(() => this._slots().size);

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
    if (!this.isBrowser) {
      return new Set<SlotKey>(['mon-08:00', 'wed-10:00']);
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return new Set<SlotKey>(['mon-08:00', 'wed-10:00']);
    }
    try {
      return new Set<SlotKey>(JSON.parse(raw) as SlotKey[]);
    } catch {
      return new Set<SlotKey>();
    }
  }
}
