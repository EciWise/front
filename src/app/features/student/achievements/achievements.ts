import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { Achievement, AchievementType, StatsResponse } from '../tasks/task.model';
import { TasksService } from '../tasks/tasks.service';

interface NextMilestone {
  readonly type: AchievementType;
  readonly current: number;
  readonly target: number;
}

const MILESTONES = [5, 10, 25, 50, 100, 250] as const;

@Component({
  selector: 'eci-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})
export class AchievementsComponent {
  private readonly tasksService = inject(TasksService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly achievements = signal<Achievement[]>([]);
  protected readonly stats = signal<StatsResponse | null>(null);

  protected readonly nextMilestones = computed<readonly NextMilestone[]>(() => {
    const stats = this.stats();
    if (!stats) {
      return [];
    }
    return [
      {
        type: 'TASKS_COMPLETED',
        current: stats.done,
        target: this.nextTarget(stats.done),
      },
      {
        type: 'TASKS_PLANNED',
        current: stats.totalTasks,
        target: this.nextTarget(stats.totalTasks),
      },
    ];
  });

  constructor() {
    this.load();
  }

  protected labelKey(type: AchievementType): string {
    return type === 'TASKS_COMPLETED'
      ? 'achievements.completed'
      : 'achievements.planned';
  }

  protected progress(milestone: NextMilestone): number {
    return Math.min(100, Math.round((milestone.current / milestone.target) * 100));
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(false);
    forkJoin({
      achievements: this.tasksService.achievements(),
      stats: this.tasksService.stats(),
    }).subscribe({
      next: ({ achievements, stats }) => {
        this.achievements.set(achievements);
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private nextTarget(current: number): number {
    return MILESTONES.find((milestone) => milestone > current) ?? current + 100;
  }
}
