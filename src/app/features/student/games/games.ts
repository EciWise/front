import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';

interface Game {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
}

/** Centro de juegos educativos (catálogo mock). */
@Component({
  selector: 'eci-games',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageHeaderComponent, ButtonComponent, IconComponent],
  template: `
    <eci-page-header titleKey="games.title" icon="games" />
    <ul class="games">
      @for (game of games; track game.id) {
        <li class="game">
          <span class="game__icon"><eci-icon name="trophy" [size]="26" /></span>
          <h2 class="game__name">{{ game.name }}</h2>
          <p class="game__subject">{{ game.subject }}</p>
          <eci-button variant="secondary">{{ 'games.play' | translate }}</eci-button>
        </li>
      }
    </ul>
  `,
  styleUrl: './games.css',
})
export class GamesComponent {
  protected readonly games: readonly Game[] = [
    { id: 'g1', name: 'Reto de derivadas', subject: 'Cálculo' },
    { id: 'g2', name: 'Quiz de algoritmos', subject: 'Programación' },
    { id: 'g3', name: 'Trivia de física', subject: 'Física' },
    { id: 'g4', name: 'Memoria de fórmulas', subject: 'Álgebra' },
  ];
}
