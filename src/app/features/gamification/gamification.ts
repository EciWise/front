import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { CardComponent } from '../../shared/ui/card/card';
import { IconComponent } from '../../shared/ui/icon/icon';
import { AuthService } from '../../core/auth/auth.service';
import {
  GamificationAchievement,
  GamificationLevel,
  GamificationService,
  UserRanking,
  UserSummary,
} from '../../core/gamification/gamification.service';
import { LevelBadge, levelBadge } from './gamification-levels';

interface LadderItem {
  readonly name: string;
  readonly minPoints: number;
  readonly badge: LevelBadge;
  readonly unlocked: boolean;
  readonly current: boolean;
}

/** Página festiva de gamificación (estudiante y tutor): nivel, progreso e insignias. */
@Component({
  selector: 'eci-gamification',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './gamification.html',
  styleUrl: './gamification.css',
})
export class GamificationComponent {
  private readonly service = inject(GamificationService);
  private readonly auth = inject(AuthService);

  protected readonly loading = signal(true);
  protected readonly summary = signal<UserSummary | null>(null);
  protected readonly ranking = signal<UserRanking | null>(null);
  protected readonly achievements = signal<readonly GamificationAchievement[]>([]);
  protected readonly levels = signal<readonly GamificationLevel[]>([]);

  protected readonly badge = computed<LevelBadge>(() =>
    levelBadge(this.summary()?.levelName ?? 'Inicial'),
  );

  /** Progreso 0-100 hacia el siguiente nivel (máximo => 100). */
  protected readonly progress = computed(() => {
    const s = this.summary();
    if (!s) return 0;
    if (s.nextLevelMinPoints == null) return 100;
    const span = s.nextLevelMinPoints - s.currentLevelMinPoints;
    if (span <= 0) return 100;
    const done = s.totalPoints - s.currentLevelMinPoints;
    return Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  });

  protected readonly pointsToNext = computed(() => {
    const s = this.summary();
    if (!s || s.nextLevelMinPoints == null) return 0;
    return Math.max(0, s.nextLevelMinPoints - s.totalPoints);
  });

  protected readonly isMaxLevel = computed(
    () => this.summary()?.nextLevelMinPoints == null,
  );

  protected readonly ladder = computed<readonly LadderItem[]>(() => {
    const s = this.summary();
    const points = s?.totalPoints ?? 0;
    const currentName = s?.levelName;
    return this.levels().map((l) => ({
      name: l.name,
      minPoints: l.minPoints,
      badge: levelBadge(l.name),
      unlocked: points >= l.minPoints,
      current: l.name === currentName,
    }));
  });

  constructor() {
    this.load();
  }

  private load(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }
    this.service.getOverview(userId).subscribe((overview) => {
      this.summary.set(overview.summary);
      this.ranking.set(overview.ranking);
      this.achievements.set(overview.achievements);
      this.levels.set(overview.levels);
      this.loading.set(false);
    });
  }
}
