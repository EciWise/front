import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideBell } from '@lucide/angular';
import { NotificationsService } from '../../../core/notifications/notifications.service';

/** Campana de notificaciones con panel desplegable y contador de no leídas. */
@Component({
  selector: 'eci-notifications-bell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideBell],
  templateUrl: './notifications-bell.html',
  styleUrl: './notifications-bell.css',
})
export class NotificationsBellComponent {
  protected readonly notifications = inject(NotificationsService);
  protected readonly open = signal(false);

  constructor() {
    this.notifications.load();
  }

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  markAllRead(): void {
    this.notifications.markAllRead();
  }
}
