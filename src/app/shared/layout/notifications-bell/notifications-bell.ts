import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import {
  LucideBell,
  LucideBellRing,
  LucideCheckCheck,
  LucideCircleCheck,
  LucideInfo,
  LucideSparkles,
  LucideTrash2,
  LucideTriangleAlert,
  LucideX,
} from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { AppNotification } from '../../../core/notifications/notification.model';
import { routeForNotification } from '../../../core/notifications/notification-route';

/** Campana de notificaciones con panel desplegable y contador de no leídas. */
@Component({
  selector: 'eci-notifications-bell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LucideBell,
    LucideBellRing,
    LucideCheckCheck,
    LucideCircleCheck,
    LucideInfo,
    LucideSparkles,
    LucideTrash2,
    LucideTriangleAlert,
    LucideX,
  ],
  templateUrl: './notifications-bell.html',
  styleUrl: './notifications-bell.css',
})
export class NotificationsBellComponent {
  protected readonly notifications = inject(NotificationsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly open = signal(false);

  constructor() {
    // Sondeo periódico: refleja notificaciones nuevas sin recargar la página.
    this.notifications.startPolling();
    this.destroyRef.onDestroy(() => this.notifications.stopPolling());
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

  /** Elimina todas las notificaciones del usuario. */
  deleteAll(): void {
    this.notifications.deleteAll();
  }

  /**
   * Al pulsar una notificación se marca como leída y se navega a su sección
   * respectiva (según categoría y rol). Si no hay destino, solo se marca leída.
   */
  select(item: AppNotification): void {
    if (!item.read) {
      this.notifications.markRead(item.id);
    }
    const route = routeForNotification(item.category, this.auth.role());
    if (route) {
      this.close();
      void this.router.navigate(route);
    }
  }

  /** Descarta la notificación sin propagar el click a la fila. */
  dismiss(id: string, event: Event): void {
    event.stopPropagation();
    this.notifications.delete(id);
  }
}
