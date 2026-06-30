import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../core/models/role.enum';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { IconComponent } from '../../shared/ui/icon/icon';
import { navItemsFor } from '../../shared/layout/nav-items';
import { TutorSessionsService } from './tutor-sessions.service';
import { AuthService } from '../../core/auth/auth.service';

/** Centro de control del tutor: resumen de planeación y accesos. */
@Component({
  selector: 'eci-tutor-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, DashboardGridComponent, IconComponent],
  templateUrl: './tutor-dashboard.html',
  styleUrls: ['./tutor-dashboard.css', '../../shared/styles/card-surface.css'],
})
export class TutorDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly sessions = inject(TutorSessionsService);

  protected readonly user = this.auth.user;

  protected readonly items = navItemsFor(Role.Tutor).filter((i) => !i.exact);

  protected readonly stats = [
    { labelKey: 'tutor.control.upcoming', icon: 'schedule' as const, route: '/tutor/schedule', value: this.sessions.upcomingCount },
    { labelKey: 'tutor.control.pending', icon: 'requests' as const, route: '/tutor/requests', value: this.sessions.participantsCount },
    { labelKey: 'tutor.control.slots', icon: 'availability' as const, route: '/tutor/availability', value: this.sessions.activeSlotsCount },
  ];
}
