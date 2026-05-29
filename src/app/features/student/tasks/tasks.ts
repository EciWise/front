import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { TasksService } from './tasks.service';
import { Task } from './task.model';

/** Lista de tareas pendientes del estudiante con alta y cambio de estado. */
@Component({
  selector: 'eci-tasks',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslatePipe, PageHeaderComponent, CardComponent, ButtonComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class TasksComponent {
  private readonly tasksService = inject(TasksService);
  protected readonly tasks = this.tasksService.tasks;
  protected readonly pendingCount = this.tasksService.pendingCount;
  protected readonly draft = signal('');

  add(): void {
    this.tasksService.add(this.draft());
    this.draft.set('');
  }

  toggle(task: Task): void {
    this.tasksService.setStatus(task.id, task.status === 'done' ? 'pending' : 'done');
  }

  statusKey(task: Task): string {
    switch (task.status) {
      case 'done':
        return 'tasks.done';
      case 'in-progress':
        return 'tasks.inProgress';
      default:
        return 'tasks.pending';
    }
  }
}
