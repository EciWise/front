import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { IconComponent, IconName } from '../../../shared/ui/icon/icon';
import { GameMode } from '../../../core/game/asclepio.protocol';

interface ModeOption {
  readonly id: GameMode;
  readonly icon: IconName;
  readonly nameKey: string;
  readonly descKey: string;
}

interface ComingSoonGame {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
}

/** Centro de juegos: juego destacado Asclepio (jugable) + próximos retos. */
@Component({
  selector: 'eci-games',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, PageHeaderComponent, IconComponent],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class GamesComponent {
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

  protected readonly comingSoon: readonly ComingSoonGame[] = [
    { id: 'g1', name: 'Reto de derivadas', subject: 'Cálculo' },
    { id: 'g2', name: 'Quiz de algoritmos', subject: 'Programación' },
    { id: 'g3', name: 'Trivia de física', subject: 'Física' },
  ];
}
