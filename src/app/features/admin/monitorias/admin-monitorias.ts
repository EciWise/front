import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';
import {
  TutoriaResumenDto,
  TutoringApiService,
} from '../../../core/tutoring/tutoring-api.service';

@Component({
  selector: 'eci-admin-monitorias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, SelectComponent],
  templateUrl: './admin-monitorias.html',
  styleUrl: './admin-monitorias.css',
})
export class AdminMonitoriasComponent implements OnInit {
  private readonly api = inject(TutoringApiService);

  protected readonly sesiones = signal<TutoriaResumenDto[]>([]);
  protected readonly materias = signal<{ id: string; codigo: string; nombre: string; activa: boolean }[]>([]);
  protected readonly filterMateriaId = signal<string>('');
  protected readonly filterModalidad = signal<'VIRTUAL' | 'PRESENCIAL' | ''>('');
  protected readonly materiaOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'admin.monitorias.allMaterias' },
    ...this.materias().map((m) => ({ value: m.id, label: `${m.codigo} – ${m.nombre}` })),
  ]);

  protected readonly modalidadOptions: readonly SelectOption[] = [
    { value: '', labelKey: 'admin.monitorias.allModalidades' },
    { value: 'VIRTUAL', labelKey: 'admin.monitorias.virtual' },
    { value: 'PRESENCIAL', labelKey: 'admin.monitorias.presencial' },
  ];

  protected readonly sesionesVisible = computed(() => {
    const materia = this.filterMateriaId();
    const modalidad = this.filterModalidad();
    return this.sesiones().filter(
      (s) =>
        (!materia || s.materiaId === materia) &&
        (!modalidad || s.modalidad === modalidad),
    );
  });

  ngOnInit(): void {
    forkJoin({
      sesiones: this.api.buscarTutorias(),
      materias: this.api.listarMaterias(),
    }).subscribe({
      next: ({ sesiones, materias }) => {
        this.sesiones.set(sesiones);
        this.materias.set(materias);
      },
    });
  }

  setMateria(value: SelectValue): void {
    this.filterMateriaId.set(value ? String(value) : '');
  }

  setModalidad(value: SelectValue): void {
    const v = value ? String(value) : '';
    this.filterModalidad.set(v as 'VIRTUAL' | 'PRESENCIAL' | '');
  }

}
