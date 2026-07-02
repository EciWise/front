import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { IconComponent, IconName } from '../../../shared/ui/icon/icon';
import { GameMode } from '../../../core/game/asclepio.protocol';
import { AuthService } from '../../../core/auth/auth.service';
import { GamificationService } from '../../../core/gamification/gamification.service';
import { AchievementToastService } from '../../../core/gamification/achievement-toast.service';

interface ModeOption {
  readonly id: GameMode;
  readonly icon: IconName;
  readonly nameKey: string;
  readonly descKey: string;
}

interface MiniGame {
  readonly id: string;
  readonly icon: IconName;
  readonly route: string;
  readonly nameKey: string;
  readonly subjectKey: string;
  readonly taglineKey: string;
  readonly accentColor: string;
}

/** Centro de juegos: Asclepio (multijugador), Pomodoro Garden y mini-juegos sin backend. */
@Component({
  selector: 'eci-games',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class GamesComponent {
  private readonly auth = inject(AuthService);
  private readonly gamification = inject(GamificationService);
  private readonly toasts = inject(AchievementToastService);

  protected readonly modes: readonly ModeOption[] = [
    { id: 'classic', icon: 'games', nameKey: 'games.modes.classic', descKey: 'games.modes.classicDesc' },
    { id: 'pomodoro', icon: 'timer', nameKey: 'games.modes.pomodoro', descKey: 'games.modes.pomodoroDesc' },
    {
      id: 'battleroyale',
      icon: 'swords',
      nameKey: 'games.modes.battleroyale',
      descKey: 'games.modes.battleroyaleDesc',
    },
  ];

  protected readonly miniGames: readonly MiniGame[] = [
    {
      id: 'pomodoro',
      icon: 'timer',
      route: '/student/games/pomodoro',
      nameKey: 'games.pomodoro.name',
      subjectKey: 'games.pomodoro.subject',
      taglineKey: 'games.pomodoro.tagline',
      accentColor: '#c8102e',
    },
    {
      id: 'fiebre',
      icon: 'flame',
      route: '/student/games/fiebre',
      nameKey: 'games.fiebre.name',
      subjectKey: 'games.fiebre.subject',
      taglineKey: 'games.fiebre.tagline',
      accentColor: '#f59e0b',
    },
    {
      id: 'memoria',
      icon: 'repeat',
      route: '/student/games/memoria',
      nameKey: 'games.memoria.name',
      subjectKey: 'games.memoria.subject',
      taglineKey: 'games.memoria.tagline',
      accentColor: '#6366f1',
    },
    {
      id: 'serpiente',
      icon: 'zap',
      route: '/student/games/serpiente',
      nameKey: 'games.serpiente.name',
      subjectKey: 'games.serpiente.subject',
      taglineKey: 'games.serpiente.tagline',
      accentColor: '#10b981',
    },
  ];

  /**
   * Registra la jugada en gamificación. El backend otorga 10 puntos y desbloquea
   * "Buscador de aventuras" solo la primera vez (idempotente: las siguientes
   * jugadas devuelven `unlockedAchievements` vacío, así que no molesta). La
   * navegación (routerLink) sigue su curso: esto es un efecto secundario.
   */
  protected play(gameId: string): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      return;
    }
    this.gamification.registerGamePlayed(userId, gameId).subscribe({
      next: (res) => this.toasts.push(res.unlockedAchievements),
      error: () => {
        // Silencioso: no queremos romper la entrada al juego si gamificación falla.
      },
    });
  }
}
