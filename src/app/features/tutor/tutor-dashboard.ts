import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Role } from '../../core/models/role.enum';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { navItemsFor } from '../../shared/layout/nav-items';

/** Centro de control del tutor con acceso a su planeación. */
@Component({
  selector: 'eci-tutor-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DashboardGridComponent],
  template: `
    <eci-page-header titleKey="nav.controlCenter" icon="dashboard" />
    <eci-dashboard-grid [items]="items" />
  `,
})
export class TutorDashboardComponent {
  protected readonly items = navItemsFor(Role.Tutor).filter((i) => !i.exact);
}
