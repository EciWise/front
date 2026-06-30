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

const PALETTE = [
  { color: '#c8102e', soft: '#fbeae9' },
  { color: '#1b873f', soft: '#e6f4ea' },
  { color: '#1d4ed8', soft: '#e8edfc' },
  { color: '#7c3aed', soft: '#ede9fb' },
  { color: '#b45309', soft: '#fef3e2' },
  { color: '#0e7490', soft: '#e0f5f9' },
] as const;

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function timeLabel(horaInicio: string, horaFin: string): string {
  const fmt = (t: string) => t.replace(/^0/, '').replace(':00', '');
  return `${fmt(horaInicio)}–${fmt(horaFin)}`;
}

interface MonChip {
  readonly id: string;
  readonly materiaCodigo: string;
  readonly tutorNombre: string;
  readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
  readonly cuposLabel: string;
  readonly color: string;
  readonly soft: string;
}

interface MonCell {
  readonly dia: number;
  readonly chips: readonly MonChip[];
}

interface MonRow {
  readonly blockLabel: string;
  readonly cells: readonly MonCell[];
}

@Component({
  selector: 'eci-admin-monitorias',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageHeaderComponent, CardComponent, SelectComponent],
  templateUrl: './admin-monitorias.html',
  styleUrl: './admin-monitorias.css',
})
export class AdminMonitoriasComponent implements OnInit {
  private readonly api = inject(TutoringApiService);

  protected readonly weekDays = DAY_LABELS;
  protected readonly sesiones = signal<TutoriaResumenDto[]>([]);
  protected readonly materias = signal<{ id: string; codigo: string; nombre: string; activa: boolean }[]>([]);
  protected readonly filterMateriaId = signal<string>('');
  protected readonly filterModalidad = signal<'VIRTUAL' | 'PRESENCIAL' | ''>('');
  protected readonly filterTutorId = signal<string>('');

  protected readonly materiaOptions = computed<readonly SelectOption[]>(() => [
    { value: '', labelKey: 'admin.monitorias.allMaterias' },
    ...this.materias().map((m) => ({ value: m.id, label: `${m.codigo} – ${m.nombre}` })),
  ]);

  protected readonly modalidadOptions: readonly SelectOption[] = [
    { value: '', labelKey: 'admin.monitorias.allModalidades' },
    { value: 'VIRTUAL', labelKey: 'admin.monitorias.virtual' },
    { value: 'PRESENCIAL', labelKey: 'admin.monitorias.presencial' },
  ];

  protected readonly tutorOptions = computed<readonly SelectOption[]>(() => {
    const vistos = new Map<string, string>();
    for (const s of this.sesiones()) {
      if (s.tutorNombre && !vistos.has(s.tutorUserId)) {
        vistos.set(s.tutorUserId, s.tutorNombre);
      }
    }
    return [
      { value: '', labelKey: 'admin.monitorias.allTutores' },
      ...[...vistos.entries()]
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([value, label]) => ({ value, label })),
    ];
  });

  /** Color estable por materia, según orden de aparición en el catálogo. */
  private readonly materiaColor = computed<Map<string, (typeof PALETTE)[number]>>(() => {
    const map = new Map<string, (typeof PALETTE)[number]>();
    this.materias().forEach((m, i) => map.set(m.id, PALETTE[i % PALETTE.length]));
    return map;
  });

  protected readonly sesionesVisible = computed(() => {
    const materia = this.filterMateriaId();
    const modalidad = this.filterModalidad();
    const tutor = this.filterTutorId();
    return this.sesiones().filter(
      (s) =>
        (!materia || s.materiaId === materia) &&
        (!modalidad || s.modalidad === modalidad) &&
        (!tutor || s.tutorUserId === tutor),
    );
  });

  protected readonly gridRows = computed<readonly MonRow[]>(() => {
    const sesiones = this.sesionesVisible();
    const colores = this.materiaColor();

    // 1. Bloques horarios distintos, ordenados por hora de inicio.
    const seen = new Set<string>();
    const blocks: { horaInicio: string; horaFin: string }[] = [];
    for (const s of sesiones) {
      const key = `${s.horaInicio}-${s.horaFin}`;
      if (!seen.has(key)) {
        seen.add(key);
        blocks.push({ horaInicio: s.horaInicio, horaFin: s.horaFin });
      }
    }
    blocks.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    // 2. Por cada bloque, una celda por día (Lun–Vie) con sus chips.
    return blocks.map((block) => {
      const cells: MonCell[] = [1, 2, 3, 4, 5].map((dia) => {
        const chips: MonChip[] = sesiones
          .filter(
            (s) =>
              s.diaSemana === dia &&
              s.horaInicio === block.horaInicio &&
              s.horaFin === block.horaFin,
          )
          .map((s) => {
            const palette = colores.get(s.materiaId) ?? PALETTE[0];
            return {
              id: s.id,
              materiaCodigo: s.materiaCodigo,
              tutorNombre: s.tutorNombre ?? '—',
              modalidad: s.modalidad,
              cuposLabel: `${s.cuposDisponibles}/${s.cuposMaximos}`,
              color: palette.color,
              soft: palette.soft,
            };
          });
        return { dia, chips };
      });
      return { blockLabel: timeLabel(block.horaInicio, block.horaFin), cells };
    });
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

  setTutor(value: SelectValue): void {
    this.filterTutorId.set(value ? String(value) : '');
  }
}
