import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { PieChartComponent, PieSlice } from '../../../shared/ui/charts/pie-chart';
import { HistogramComponent, HistogramBar } from '../../../shared/ui/charts/histogram';
import { SectionTabsComponent, SectionTab } from '../../../shared/ui/section-tabs/section-tabs';
import { IaAdminService, PlatformStats } from '../../../core/ia/ia-admin.service';
import { TutoringMockService } from '../../tutor/tutoring.service';

/** Color institucional por rol. */
const ROLE_COLORS: Record<string, string> = {
  estudiante: 'var(--accent-student)',
  tutor: 'var(--accent-tutor)',
  admin: 'var(--accent-admin)',
};

/** Clave de traducción por rol del backend. */
const ROLE_LABEL_KEY: Record<string, string> = {
  estudiante: 'roles.STUDENT',
  tutor: 'roles.TUTOR',
  admin: 'roles.ADMIN',
};

/** Estadísticas de la plataforma con gráficos de torta e histograma (solo admin). */
@Component({
  selector: 'eci-admin-statistics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    TranslatePipe,
    PageHeaderComponent,
    CardComponent,
    PieChartComponent,
    HistogramComponent,
    SectionTabsComponent,
  ],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class AdminStatisticsComponent implements OnInit {
  private readonly service = inject(IaAdminService);
  private readonly i18n = inject(TranslateService);
  private readonly tutoringService = inject(TutoringMockService);

  protected readonly stats = signal<PlatformStats | null>(null);
  protected readonly loading = signal(true);

  /** Secciones en que se divide la pantalla para caber sin scroll. */
  protected readonly sections: readonly SectionTab[] = [
    { id: 'summary', labelKey: 'admin.statistics.tabSummary', icon: 'trophy' },
    { id: 'platform', labelKey: 'admin.statistics.tabPlatform', icon: 'users' },
    { id: 'ia', labelKey: 'admin.statistics.tabIa', icon: 'assistant' },
    { id: 'tutoring', labelKey: 'admin.statistics.tabTutoring', icon: 'tutorias' },
  ];
  protected readonly section = signal('summary');
  protected readonly tutoringStats = this.tutoringService.stats;

  ngOnInit(): void {
    this.service.platformStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ── Registro / ingreso ──

  /** Distribución de usuarios por rol (torta). */
  protected readonly rolesPie = computed<PieSlice[]>(() =>
    (this.stats()?.distribucionRoles ?? []).map((r) => ({
      label: this.i18n.instant(ROLE_LABEL_KEY[r.rol] ?? r.rol),
      value: r.conteo,
      color: ROLE_COLORS[r.rol],
    })),
  );

  /** Registros por mes (histograma). */
  protected readonly registrosBars = computed<HistogramBar[]>(() =>
    this.monthBars(this.stats()?.registrosPorMes ?? []),
  );

  /** Ingresos por mes según último acceso (histograma). */
  protected readonly accesosBars = computed<HistogramBar[]>(() =>
    this.monthBars(this.stats()?.accesosPorMes ?? []),
  );

  /** Usuarios que han ingresado vs. los que nunca lo hicieron (torta). */
  protected readonly accesoPie = computed<PieSlice[]>(() => {
    const e = this.stats()?.accesoEstado;
    if (!e) return [];
    return [
      {
        label: this.i18n.instant('admin.statistics.loggedIn'),
        value: e.hanIngresado,
        color: 'var(--success)',
      },
      {
        label: this.i18n.instant('admin.statistics.neverLoggedIn'),
        value: e.nuncaIngresado,
        color: 'var(--text-muted)',
      },
    ];
  });

  // ── Predicciones de IA ──

  /** Rendimiento estimado (histograma). */
  protected readonly rendimientoBars = computed<HistogramBar[]>(() =>
    (this.stats()?.distribucionRendimiento ?? []).map((g) => ({
      label: this.gradeLabel(g.grado),
      value: g.conteo,
    })),
  );

  /** Etiqueta localizada de la calificación; cae al valor crudo si no hay traducción. */
  private gradeLabel(grade: string): string {
    const key = `admin.statistics.grades.${grade}`;
    const label = this.i18n.instant(key);
    return label === key ? grade : label;
  }

  /** Predicción de deserción (torta). */
  protected readonly desercionPie = computed<PieSlice[]>(() =>
    (this.stats()?.distribucionDesercion ?? []).map((d) => ({
      label: this.i18n.instant(`admin.statistics.dropout.${d.etiqueta}`),
      value: d.conteo,
      color: d.etiqueta === 'Dropout' ? 'var(--danger)' : 'var(--success)',
    })),
  );

  protected readonly tutoringSubjectsBars = computed<HistogramBar[]>(() => [
    ...this.tutoringStats().requestedSubjects,
  ]);

  protected readonly tutoringTopicsBars = computed<HistogramBar[]>(() => [
    ...this.tutoringStats().commonTopics,
  ]);

  protected readonly tutoringHoursBars = computed<HistogramBar[]>(() => [
    ...this.tutoringStats().demandHours,
  ]);

  protected readonly tutoringTopTutorsBars = computed<HistogramBar[]>(() => [
    ...this.tutoringStats().topTutors,
  ]);

  protected readonly tutoringOutcomePie = computed<PieSlice[]>(() => [
    {
      label: this.i18n.instant('admin.statistics.tutoringCompleted'),
      value: this.tutoringStats().completedCount,
      color: 'var(--success)',
    },
    {
      label: this.i18n.instant('admin.statistics.tutoringCancelled'),
      value: this.tutoringStats().cancelledCount,
      color: 'var(--danger)',
    },
  ]);

  /** Convierte claves `YYYY-MM` en barras con etiqueta de mes corta. */
  private monthBars(serie: { mes: string; conteo: number }[]): HistogramBar[] {
    return serie.map((m) => {
      const [year, month] = m.mes.split('-').map(Number);
      const label = new Date(year, month - 1, 1).toLocaleDateString(this.i18n.currentLang, {
        month: 'short',
      });
      return { label, value: m.conteo };
    });
  }
}
