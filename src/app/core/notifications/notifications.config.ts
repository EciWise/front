import { InjectionToken } from '@angular/core';

export interface NotificationsConfig {
  readonly notificationsApiUrl: string;
}

export const NOTIFICATIONS_CONFIG = new InjectionToken<NotificationsConfig>('NOTIFICATIONS_CONFIG', {
  providedIn: 'root',
  factory: () => ({ notificationsApiUrl: 'http://localhost:3004' }),
});
