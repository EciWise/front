import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { PracticaService } from '../practica.service';
import { PagedResponse, SessionSummary } from '../practica.models';

const PAGE_SIZE = 20;

/** Historial paginado de las sesiones de quiz del usuario. */
@Component({
  selector: 'eci-practica-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, ButtonComponent],
  templateUrl: './quiz-history.html',
  styleUrl: '../practica.css',
})
export class QuizHistoryComponent {
  private readonly service = inject(PracticaService);

  protected readonly data = signal<PagedResponse<SessionSummary> | null>(null);
  protected readonly loading = signal(false);
  protected readonly page = signal(0);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.service.history(this.page(), PAGE_SIZE).subscribe({
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
    const data = this.data();
    if (data && this.page() + 1 < data.totalPages) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  /** % de acierto redondeado a entero para mostrar. */
  protected accuracy(s: SessionSummary): number {
    return Math.round(s.accuracyPercent);
  }
}
