import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EMPTY, Observable, Subscription, timer } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { NOTIFICATIONS_CONFIG } from './notifications.config';
import { AppNotification, NotificationKind } from './notification.model';
import { categoryFromApi } from './notification-route';

interface ApiNotification {
  readonly id: number;
  readonly asunto: string;
  readonly resumen: string;
  readonly visto: boolean;
  readonly fechaCreacion: string;
  readonly type: string;
}

function kindFromType(type: string): NotificationKind {
  if (type === 'success') return 'success';
  if (type === 'warning') return 'warning';
  return 'info';
}

function fromApi(n: ApiNotification): AppNotification {
  return {
    id: String(n.id),
    titleKey: 'notifications.title',
    body: n.asunto,
    kind: kindFromType(n.type),
    category: categoryFromApi(n.asunto, n.type),
    createdAt: String(n.fechaCreacion),
    read: n.visto,
  };
}

/** Intervalo por defecto del sondeo de notificaciones (ms). */
const DEFAULT_POLL_INTERVAL_MS = 15_000;

/**
 * Instantes (ms) en los que refrescar tras una acción que genera notificación
 * asíncrona (p. ej. desbloquear un logro): cubre la latencia del pipeline
 * outbox → RabbitMQ → notifications sin esperar al siguiente ciclo del sondeo.
 */
const REFRESH_SOON_DELAYS_MS = [1500, 4000] as const;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(NOTIFICATIONS_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _items = signal<AppNotification[]>([]);
  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  private pollSub?: Subscription;
  private onVisible?: () => void;

  /** Petición al backend que refresca la lista de notificaciones. */
  private fetch(): Observable<ApiNotification[]> {
    return this.http.get<ApiNotification[]>(`${this.config.notificationsApiUrl}/notificacion`);
  }

  load(): void {
    this.fetch().subscribe({ next: (data) => this._items.set(data.map(fromApi)) });
  }

  /**
   * Refresca la lista un par de veces con pequeño retardo. Se usa justo después
   * de una acción que crea una notificación de forma asíncrona en el backend
   * (p. ej. desbloquear un logro), para que aparezca casi al instante en la
   * campana sin esperar al siguiente ciclo del sondeo.
   */
  refreshSoon(): void {
    if (!isPlatformBrowser(this.platformId) || typeof setTimeout === 'undefined') {
      return;
    }
    for (const ms of REFRESH_SOON_DELAYS_MS) {
      setTimeout(() => this.load(), ms);
    }
  }

  /**
   * Inicia el sondeo periódico para reflejar notificaciones nuevas sin recargar
   * la página. Es idempotente (no crea sondeos duplicados) y SSR-safe. Mientras
   * la pestaña está oculta se omiten las peticiones; al volver a ella se refresca
   * de inmediato para no esperar al siguiente ciclo.
   */
  startPolling(intervalMs = DEFAULT_POLL_INTERVAL_MS): void {
    if (!isPlatformBrowser(this.platformId) || this.pollSub) {
      return;
    }

    this.pollSub = timer(0, intervalMs)
      .pipe(
        filter(() => typeof document === 'undefined' || !document.hidden),
        switchMap(() => this.fetch().pipe(catchError(() => EMPTY))),
      )
      .subscribe((data) => this._items.set(data.map(fromApi)));

    if (typeof document !== 'undefined') {
      this.onVisible = () => {
        if (!document.hidden) this.load();
      };
      document.addEventListener('visibilitychange', this.onVisible);
    }
  }

  /** Detiene el sondeo y libera el listener de visibilidad. */
  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
    if (this.onVisible && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisible);
      this.onVisible = undefined;
    }
  }

  markAllRead(): void {
    this.http
      .patch(`${this.config.notificationsApiUrl}/notificacion/read-all`, {})
      .subscribe({ next: () => this._items.update((items) => items.map((n) => ({ ...n, read: true }))) });
  }

  markRead(id: string): void {
    this.http
      .patch(`${this.config.notificationsApiUrl}/notificacion/read/${id}`, {})
      .subscribe({ next: () => this._items.update((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n))) });
  }

  delete(id: string): void {
    this.http
      .delete(`${this.config.notificationsApiUrl}/notificacion/${id}`)
      .subscribe({ next: () => this._items.update((items) => items.filter((n) => n.id !== id)) });
  }

  deleteAll(): void {
    this.http
      .delete(`${this.config.notificationsApiUrl}/notificacion`)
      .subscribe({ next: () => this._items.set([]) });
  }

  add(
    bodyKey: string,
    kind: NotificationKind = 'info',
    bodyParams: Record<string, string | number> = {},
    titleKey = 'notifications.title',
  ): void {
    const item: AppNotification = {
      id: `local-${Date.now()}`,
      titleKey,
      bodyKey,
      bodyParams,
      kind,
      category: 'general',
      createdAt: new Date().toISOString(),
      read: false,
    };
    this._items.update((items) => [item, ...items]);
  }
}
