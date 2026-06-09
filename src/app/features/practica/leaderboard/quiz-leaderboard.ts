import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PracticaService } from '../practica.service';
import { LeaderboardResponse } from '../practica.models';

const PAGE_SIZE = 20;

/** Ranking público del modo Supervivencia, con el puesto del usuario. */
@Component({
  selector: 'eci-practica-leaderboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent],
  templateUrl: './quiz-leaderboard.html',
  styleUrl: '../practica.css',
})
export class QuizLeaderboardComponent {
  private readonly service = inject(PracticaService);

  protected readonly data = signal<LeaderboardResponse | null>(null);
  protected readonly loading = signal(false);
  protected readonly page = signal(0);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.survivalLeaderboard(this.page(), PAGE_SIZE).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected prev(): void {
    if (this.page() > 0) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  protected next(): void {
    const table = this.data()?.table;
    if (table && this.page() + 1 < table.totalPages) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }
}
