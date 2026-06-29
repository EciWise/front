import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { NOTIFICATIONS_CONFIG } from './notifications.config';
import { AppNotification, NotificationKind } from './notification.model';

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
    createdAt: String(n.fechaCreacion),
    read: n.visto,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(NOTIFICATIONS_CONFIG);

  private readonly _items = signal<AppNotification[]>([]);
  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  load(): void {
    this.http
      .get<ApiNotification[]>(`${this.config.notificationsApiUrl}/notificacion`)
      .subscribe({ next: (data) => this._items.set(data.map(fromApi)) });
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
      createdAt: new Date().toISOString(),
      read: false,
    };
    this._items.update((items) => [item, ...items]);
  }
}
