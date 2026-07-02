import { Injectable, inject, signal } from '@angular/core';
import { UnlockedAchievement } from './gamification.service';
import { AchievementVisual, achievementVisual } from './achievement-visual';
import { NotificationsService } from '../notifications/notifications.service';

/** Un toast de logro en pantalla: datos del logro + su visual resuelto. */
export interface AchievementToast {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly visual: AchievementVisual;
}

/** Tiempo (ms) que un toast permanece visible antes de irse solo. */
const AUTO_DISMISS_MS = 6000;

/**
 * Cola de toasts de logros desbloqueados. Los componentes que registran acciones
 * (juego, práctica, estudio) empujan aquí los logros que devuelve el backend; el
 * componente `eci-achievement-toast` los renderiza. Cada toast se descarta solo
 * tras unos segundos, o manualmente con `dismiss`.
 */
@Injectable({ providedIn: 'root' })
export class AchievementToastService {
  private readonly notifications = inject(NotificationsService);

  private readonly _toasts = signal<AchievementToast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Muestra un toast por cada logro recién desbloqueado. */
  push(achievements: readonly UnlockedAchievement[] | null | undefined): void {
    if (!achievements?.length) {
      return;
    }
    // El logro también genera una notificación asíncrona en el backend: pedimos a
    // la campana que se refresque pronto para que aparezca sin recargar la página.
    this.notifications.refreshSoon();
    for (const a of achievements) {
      const id = this.nextId++;
      const toast: AchievementToast = {
        id,
        name: a.name,
        description: a.description,
        visual: achievementVisual(a.code),
      };
      this._toasts.update((list) => [...list, toast]);

      if (typeof setTimeout !== 'undefined') {
        this.timers.set(
          id,
          setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS),
        );
      }
    }
  }

  /** Descarta un toast (por auto-cierre o por acción del usuario). */
  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
