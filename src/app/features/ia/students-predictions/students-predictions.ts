import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { EstudianteIa, IaAdminService } from '../../../core/ia/ia-admin.service';

type RiskLevel = 'high' | 'med' | 'low' | null;
type RiskFilter = 'all' | 'low' | 'med' | 'high';

/**
 * Tabla de estudiantes con su predicción. La usan admin (ve a todos) y tutor (ve
 * a sus asignados): el alcance lo resuelve el backend según el rol del token.
 */
@Component({
  selector: 'eci-students-predictions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageHeaderComponent, CardComponent, DecimalPipe],
  templateUrl: './students-predictions.html',
  styleUrl: './students-predictions.css',
})
export class StudentsPredictionsComponent implements OnInit {
  private readonly service = inject(IaAdminService);

  protected readonly students = signal<EstudianteIa[]>([]);
  protected readonly loading = signal(true);
  protected readonly riskFilter = signal<RiskFilter>('all');

  protected riskLevel(s: EstudianteIa): RiskLevel {
    if (!s.datosIa?.prediccionDesercion) return null;
    if (s.datosIa.prediccionDesercion === 'Dropout') {
      const conf = s.datosIa.confianzaDesercion ?? 0;
      return conf >= 70 ? 'high' : conf >= 40 ? 'med' : 'low';
    }
    return 'low';
  }

  protected readonly filteredStudents = computed(() => {
    const f = this.riskFilter();
    if (f === 'all') return this.students();
    return this.students().filter((s) => this.riskLevel(s) === f);
  });

  protected readonly kpis = computed(() => {
    const list = this.students();
    const atRisk = list.filter((s) => s.datosIa?.prediccionDesercion === 'Dropout').length;
    const withPred = list.filter((s) => s.datosIa?.prediccionDesercion != null).length;
    const confValues = list
      .map((s) => s.datosIa?.confianzaDesercion)
      .filter((v): v is number => v != null);
    const avgConf = confValues.length
      ? Math.round(confValues.reduce((a, b) => a + b, 0) / confValues.length)
      : null;
    return { total: list.length, atRisk, withPred, avgConf };
  });

  ngOnInit(): void {
    this.service.listStudents().subscribe({
      next: (list) => {
        this.students.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
