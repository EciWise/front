import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../core/models/role.enum';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { IconComponent } from '../../shared/ui/icon/icon';
import { navItemsFor } from '../../shared/layout/nav-items';
import { TutorScheduleService } from './schedule.service';
import { AvailabilityService } from './availability.service';
import { TutoringRequestsService } from './requests.service';

/** Centro de control del tutor: resumen de planeación y accesos. */
@Component({
  selector: 'eci-tutor-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, DashboardGridComponent, IconComponent],
  templateUrl: './tutor-dashboard.html',
  styleUrls: ['./tutor-dashboard.css', '../../shared/styles/card-surface.css'],
})
export class TutorDashboardComponent {
  private readonly schedule = inject(TutorScheduleService);
  private readonly availability = inject(AvailabilityService);
  private readonly requests = inject(TutoringRequestsService);

  protected readonly items = navItemsFor(Role.Tutor).filter((i) => !i.exact);

  protected readonly stats = [
    { labelKey: 'tutor.control.upcoming', icon: 'schedule' as const, route: '/tutor/schedule', value: this.schedule.upcomingCount },
    { labelKey: 'tutor.control.pending', icon: 'requests' as const, route: '/tutor/requests', value: this.requests.pendingCount },
    { labelKey: 'tutor.control.slots', icon: 'availability' as const, route: '/tutor/availability', value: this.availability.count },
  ];
}
