export type NotificationKind = 'info' | 'success' | 'warning';

/** Notificación mostrada en el panel de la campana. */
export interface AppNotification {
  readonly id: string;
  readonly titleKey: string;
  readonly body: string;
  readonly kind: NotificationKind;
  readonly createdAt: string;
  readonly read: boolean;
}
