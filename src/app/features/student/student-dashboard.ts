import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Role } from '../../core/models/role.enum';
import { DashboardGridComponent } from '../../shared/layout/dashboard-grid/dashboard-grid';
import { navItemsFor } from '../../shared/layout/nav-items';
import { IaProfileSectionComponent } from './ia-profile-section/ia-profile-section';
import { AuthService } from '../../core/auth/auth.service';
import { TasksService } from './tasks/tasks.service';

@Component({
  selector: 'eci-student-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, DashboardGridComponent, IaProfileSectionComponent],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly tasksService = inject(TasksService);

  protected readonly user = this.auth.user;
  protected readonly pendingCount = this.tasksService.pendingCount;
  protected readonly doneCount = computed(
    () => this.tasksService.tasks().filter((t) => t.status === 'DONE').length,
  );
  protected readonly tasksLoaded = signal(false);
  protected readonly items = navItemsFor(Role.Student).filter((i) => !i.exact);

  ngOnInit(): void {
    this.tasksService.load().subscribe({ next: () => this.tasksLoaded.set(true), error: () => undefined });
  }
}
