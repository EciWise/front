import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Role } from '../../core/models/role.enum';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { navItemsFor } from '../../shared/layout/nav-items';

/** Panel principal del estudiante con acceso a sus secciones. */
@Component({
  selector: 'eci-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DashboardGridComponent],
  template: `
    <eci-page-header titleKey="nav.dashboard" icon="dashboard" />
    <eci-dashboard-grid [items]="items" />
  `,
})
export class StudentDashboardComponent {
  protected readonly items = navItemsFor(Role.Student).filter((i) => !i.exact);
}
