import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Role } from '../../core/models/role.enum';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { navItemsFor } from '../../shared/layout/nav-items';
import { IaProfileSectionComponent } from './ia-profile-section/ia-profile-section';

/** Panel principal del estudiante con acceso a sus secciones. */
@Component({
  selector: 'eci-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, DashboardGridComponent, IaProfileSectionComponent],
  template: `
    <div class="eci-fit">
      <eci-page-header titleKey="nav.dashboard" icon="dashboard" />
      <eci-ia-profile-section class="eci-fit__chrome" />
      <div class="eci-fit__body">
        <eci-dashboard-grid [items]="items" />
      </div>
    </div>
  `,
})
export class StudentDashboardComponent {
  protected readonly items = navItemsFor(Role.Student).filter((i) => !i.exact);
}
