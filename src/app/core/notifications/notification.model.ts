export type NotificationKind = 'info' | 'success' | 'warning';

/** Notificacion mostrada en el panel de la campana. */
export interface AppNotification {
  readonly id: string;
  readonly titleKey: string;
  readonly body?: string;
  readonly bodyKey?: string;
  readonly bodyParams?: Record<string, string | number>;
  readonly kind: NotificationKind;
  readonly createdAt: string;
  readonly read: boolean;
}
