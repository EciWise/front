import { Injectable, computed, signal } from '@angular/core';
import { AppNotification } from './notification.model';

const MOCK_NOTIFICATIONS: readonly AppNotification[] = [
  {
    id: 'n1',
    titleKey: 'notifications.title',
    body: 'Tu solicitud de monitoría de Cálculo fue aceptada.',
    kind: 'success',
    createdAt: '2026-05-29T08:30:00Z',
    read: false,
  },
  {
    id: 'n2',
    titleKey: 'notifications.title',
    body: 'Nuevo material disponible en Programación.',
    kind: 'info',
    createdAt: '2026-05-28T15:00:00Z',
    read: false,
  },
];

/**
 * Fuente mock de notificaciones. Reemplazable por una llamada HTTP real
 * sin afectar a los componentes consumidores.
 */
@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _items = signal<AppNotification[]>([...MOCK_NOTIFICATIONS]);
  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  markAllRead(): void {
    this._items.update((items) => items.map((n) => ({ ...n, read: true })));
  }

  markRead(id: string): void {
    this._items.update((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }
}
