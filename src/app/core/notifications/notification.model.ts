import { NotificationCategory } from './notification-route';

export type NotificationKind = 'info' | 'success' | 'warning';

/** Notificacion mostrada en el panel de la campana. */
export interface AppNotification {
  readonly id: string;
  readonly titleKey: string;
  readonly body?: string;
  readonly bodyKey?: string;
  readonly bodyParams?: Record<string, string | number>;
  readonly kind: NotificationKind;
  /** Sección de la app a la que dirige la notificación al pulsarla. */
  readonly category: NotificationCategory;
  readonly createdAt: string;
  readonly read: boolean;
}
