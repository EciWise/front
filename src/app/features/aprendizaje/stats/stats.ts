import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CardComponent } from '../../../shared/ui/card/card';
import { PieChartComponent, PieSlice } from '../../../shared/ui/charts/pie-chart';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { AprendizajeService } from '../aprendizaje.service';
import { ReviewSummary, UsageSummary } from '../study.models';

/** Panel de progreso: estados de repetición espaciada y uso del usuario. */
@Component({
  selector: 'eci-aprendizaje-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, CardComponent, PieChartComponent, InfoTooltipComponent],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class StatsComponent {
  private readonly service = inject(AprendizajeService);
  private readonly translate = inject(TranslateService);

  protected readonly reviews = signal<ReviewSummary | null>(null);
  protected readonly usage = signal<UsageSummary | null>(null);
  protected readonly loading = signal(true);

  protected readonly stateData = computed<PieSlice[]>(() => {
    const r = this.reviews();
    if (!r) {
      return [];
    }
    return [
      { label: this.label('EN_APRENDIZAJE'), value: r.enAprendizaje, color: 'var(--info)' },
      { label: this.label('REPETIR'), value: r.repetir, color: 'var(--danger)' },
      { label: this.label('ACEPTABLE'), value: r.aceptable, color: 'var(--warning)' },
      { label: this.label('APRENDIDO'), value: r.aprendido, color: 'var(--success)' },
    ];
  });

  constructor() {
    this.service.reviewsSummary().subscribe({
      next: (r) => {
        this.reviews.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.service.usageSummary().subscribe((u) => this.usage.set(u));
  }

  private label(state: string): string {
    return this.translate.instant(`aprendizaje.state.${state}`);
  }

  /** Fecha/hora corta localizada según el idioma activo. */
  protected formatDate(iso: string): string {
    return new Date(iso).toLocaleString(this.translate.currentLang, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
}
