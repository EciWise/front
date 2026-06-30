import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DisponibilidadDto,
  FranjaDto,
  SalaDto,
  TutoringApiService,
} from '../../../core/tutoring/tutoring-api.service';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { SelectComponent, SelectOption, SelectValue } from '../../../shared/ui/select/select';

const PALETTE = [
  { color: '#c8102e', soft: '#fbeae9' },
  { color: '#1b873f', soft: '#e6f4ea' },
  { color: '#1d4ed8', soft: '#e8edfc' },
  { color: '#7c3aed', soft: '#ede9fb' },
  { color: '#b45309', soft: '#fef3e2' },
  { color: '#0e7490', soft: '#e0f5f9' },
] as const;

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function sixMonthsFromNow(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return toISODate(d);
}

function timeLabel(horaInicio: string, horaFin: string): string {
  const fmt = (t: string) => t.replace(/^0/, '').replace(':00', '');
  return `${fmt(horaInicio)}–${fmt(horaFin)}`;
}

export interface GridCell {
  readonly franjaId: string;
  readonly diaSemana: number;
  readonly filled: boolean;
  readonly disponibilidadId: string | null;
  readonly materiaId: string | null;
  readonly modalidad: 'VIRTUAL' | 'PRESENCIAL' | null;
  readonly cuposMaximos: number | null;
  readonly abbr: string;
  readonly meta: string;
  readonly color: string;
  readonly soft: string;
}

export interface GridRow {
  readonly blockLabel: string;
  readonly cells: readonly GridCell[];
}

export interface SubjectCard {
  readonly materiaId: string;
  readonly subjectName: string;
  readonly color: string;
  readonly soft: string;
  readonly modeLabel: string;
  readonly countLabel: string;
  readonly seats: number;
  readonly chips: readonly { readonly franjaId: string; readonly label: string }[];
}

@Component({
  selector: 'eci-tutor-availability',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ButtonComponent, IconComponent, ModalComponent, SelectComponent],
  templateUrl: './availability.html',
  styleUrl: './availability.css',
})
export class TutorAvailabilityComponent implements OnInit {
  private readonly api = inject(TutoringApiService);
  private readonly auth = inject(AuthService);

  protected readonly materias = signal<readonly { id: string; codigo: string; nombre: string }[]>([]);
  protected readonly franjas = signal<readonly FranjaDto[]>([]);
  protected readonly disponibilidades = signal<readonly DisponibilidadDto[]>([]);
  protected readonly salas = signal<readonly SalaDto[]>([]);

  protected readonly brushMateriaId = signal('');
  protected readonly brushMode = signal<'VIRTUAL' | 'PRESENCIAL'>('VIRTUAL');
  protected readonly brushSalaId = signal('');
  protected readonly brushCap = signal(4);
  private capVirtual = 4;
  private capPresencial = 4;
  protected readonly busy = signal(false);
  protected readonly clearOpen = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly brushSubjects = computed(() =>
    this.materias().map((m, i) => {
      const p = PALETTE[i % PALETTE.length];
      return {
        id: m.id,
        nombre: m.nombre,
        abbr: m.codigo.slice(0, 4).toUpperCase(),
        color: p.color,
        soft: p.soft,
        active: m.id === this.brushMateriaId(),
      };
    }),
  );

  private readonly activeDisps = computed(() => this.disponibilidades().filter((d) => d.activa));
  protected readonly activeSlots = computed(() => this.activeDisps().length);
  protected readonly totalSeats = computed(() =>
    this.activeDisps().reduce((s, d) => s + d.cuposMaximos, 0),
  );
  protected readonly subjectsCovered = computed(
    () => new Set(this.activeDisps().map((d) => d.materiaId)).size,
  );
  protected readonly hasAvail = computed(() => this.activeSlots() > 0);

  protected readonly salaOptions = computed<readonly SelectOption[]>(() =>
    this.salas()
      .filter((s) => s.activa)
      .map((s) => ({
        value: s.id,
        label: s.edificio ? `${s.codigo} – ${s.edificio}` : s.codigo,
      })),
  );

  protected readonly weekDays = computed(() => {
    const today = new Date();
    const mon = new Date(today);
    mon.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return DAY_LABELS.map((label, i) => {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      return { label, date: d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) };
    });
  });

  protected readonly gridRows = computed<readonly GridRow[]>(() => {
    const franjas = this.franjas().filter((f) => f.activa);
    const disps = this.activeDisps();
    const materias = this.materias();

    const seen = new Set<string>();
    const blocks: { horaInicio: string; horaFin: string; orden: number }[] = [];
    for (const f of franjas) {
      const key = `${f.horaInicio}-${f.horaFin}`;
      if (!seen.has(key)) {
        seen.add(key);
        blocks.push({ horaInicio: f.horaInicio, horaFin: f.horaFin, orden: f.orden });
      }
    }
    blocks.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

    return blocks.map((block) => {
      const cells: GridCell[] = [1, 2, 3, 4, 5].map((dia) => {
        const franja = franjas.find(
          (f) =>
            f.diaSemana === dia &&
            f.horaInicio === block.horaInicio &&
            f.horaFin === block.horaFin,
        );
        if (!franja) {
          return {
            franjaId: '',
            diaSemana: dia,
            filled: false,
            disponibilidadId: null,
            materiaId: null,
            modalidad: null,
            cuposMaximos: null,
            abbr: '',
            meta: '',
            color: '',
            soft: '',
          };
        }
        const disp = disps.find((d) => d.franjaId === franja.id);
        if (!disp) {
          return {
            franjaId: franja.id,
            diaSemana: dia,
            filled: false,
            disponibilidadId: null,
            materiaId: null,
            modalidad: null,
            cuposMaximos: null,
            abbr: '',
            meta: '',
            color: '',
            soft: '',
          };
        }
        const mIdx = materias.findIndex((m) => m.id === disp.materiaId);
        const p = PALETTE[(mIdx >= 0 ? mIdx : 0) % PALETTE.length];
        const materia = materias[mIdx];
        return {
          franjaId: franja.id,
          diaSemana: dia,
          filled: true,
          disponibilidadId: disp.id,
          materiaId: disp.materiaId,
          modalidad: disp.modalidad,
          cuposMaximos: disp.cuposMaximos,
          abbr: materia ? materia.codigo.slice(0, 4).toUpperCase() : '??',
          meta: `${disp.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'} · ${disp.cuposMaximos}`,
          color: p.color,
          soft: p.soft,
        };
      });
      return { blockLabel: timeLabel(block.horaInicio, block.horaFin), cells };
    });
  });

  protected readonly availCards = computed<readonly SubjectCard[]>(() => {
    const disps = this.activeDisps();
    const materias = this.materias();
    const franjas = this.franjas();

    const byMateria = new Map<string, DisponibilidadDto[]>();
    for (const d of disps) {
      const arr = byMateria.get(d.materiaId) ?? [];
      arr.push(d as DisponibilidadDto);
      byMateria.set(d.materiaId, arr);
    }

    return [...byMateria.entries()].map(([materiaId, group]) => {
      const mIdx = materias.findIndex((m) => m.id === materiaId);
      const materia = materias[mIdx];
      const p = PALETTE[(mIdx >= 0 ? mIdx : 0) % PALETTE.length];
      const modes = new Set(group.map((d) => d.modalidad));
      const modeLabel =
        modes.has('VIRTUAL') && modes.has('PRESENCIAL')
          ? 'Virtual + Presencial'
          : modes.has('VIRTUAL')
            ? 'Virtual'
            : 'Presencial';

      return {
        materiaId,
        subjectName: materia ? `${materia.codigo} – ${materia.nombre}` : materiaId,
        color: p.color,
        soft: p.soft,
        modeLabel,
        countLabel: `${group.length} franja${group.length !== 1 ? 's' : ''}`,
        seats: group.reduce((s, d) => s + d.cuposMaximos, 0),
        chips: group.map((d) => {
          const f = franjas.find((fr) => fr.id === d.franjaId);
          const label = f
            ? `${DAY_LABELS[f.diaSemana - 1]} ${timeLabel(f.horaInicio, f.horaFin)}`
            : '–';
          return { franjaId: d.franjaId, label };
        }),
      };
    });
  });

  ngOnInit(): void {
    this.loadAll();
  }

  protected pickMateria(id: string): void {
    this.brushMateriaId.set(id);
  }

  protected setMode(mode: 'VIRTUAL' | 'PRESENCIAL'): void {
    if (this.brushMode() === 'VIRTUAL') {
      this.capVirtual = this.brushCap();
    } else {
      this.capPresencial = this.brushCap();
    }
    this.brushMode.set(mode);
    this.brushCap.set(mode === 'PRESENCIAL' ? this.capPresencial : this.capVirtual);
    if (mode === 'VIRTUAL') {
      this.brushSalaId.set('');
    }
  }

  protected setSala(value: SelectValue): void {
    this.brushSalaId.set(value === null ? '' : String(value));
  }

  protected decCap(): void {
    if (this.brushCap() > 1) this.brushCap.update((v) => v - 1);
  }

  protected incCap(): void {
    this.brushCap.update((v) => v + 1);
  }

  protected clickCell(cell: GridCell): void {
    if (!cell.franjaId) return;
    this.error.set(null);
    if (cell.filled) {
      this.deactivate(cell.disponibilidadId!);
    } else {
      const brushMateria = this.brushMateriaId();
      if (!brushMateria) return;
      this.publish(cell.franjaId, brushMateria);
    }
  }

  protected openClear(): void {
    if (this.activeSlots() > 0) this.clearOpen.set(true);
  }

  protected confirmClear(): void {
    const active = this.activeDisps();
    if (active.length === 0) {
      this.clearOpen.set(false);
      return;
    }
    this.busy.set(true);
    forkJoin(active.map((d) => this.api.desactivarDisponibilidad(d.id))).subscribe({
      next: () => {
        this.busy.set(false);
        this.clearOpen.set(false);
        this.reload();
      },
      error: () => {
        this.busy.set(false);
        this.clearOpen.set(false);
        this.error.set('tutor.availability.errors.generic');
      },
    });
  }

  protected removeCard(materiaId: string): void {
    const toRemove = this.activeDisps().filter((d) => d.materiaId === materiaId);
    if (toRemove.length === 0) return;
    forkJoin(toRemove.map((d) => this.api.desactivarDisponibilidad(d.id))).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('tutor.availability.errors.generic'),
    });
  }

  protected removeChip(franjaId: string, materiaId: string): void {
    const disp = this.activeDisps().find(
      (d) => d.franjaId === franjaId && d.materiaId === materiaId,
    );
    if (disp) this.deactivate(disp.id);
  }

  private deactivate(id: string): void {
    this.api.desactivarDisponibilidad(id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('tutor.availability.errors.generic'),
    });
  }

  private publish(franjaId: string, materiaId: string): void {
    const mode = this.brushMode();
    const salaId = this.brushSalaId();
    if (mode === 'PRESENCIAL' && !salaId) {
      this.error.set('tutor.availability.errors.salaRequired');
      return;
    }
    this.api
      .publicarDisponibilidad({
        franjaId,
        materiaId,
        ...(mode === 'PRESENCIAL' ? { salaId } : {}),
        modalidad: mode,
        cuposMaximos: this.brushCap(),
        vigenciaDesde: toISODate(new Date()),
        vigenciaHasta: sixMonthsFromNow(),
      })
      .subscribe({
        next: () => this.reload(),
        error: () => this.error.set('tutor.availability.errors.generic'),
      });
  }

  private loadAll(): void {
    const userId = this.auth.user()?.id;
    if (!userId) return;
    forkJoin({
      materias: this.api.listarMateriasDelTutor(userId),
      franjas: this.api.listarFranjas(),
      disponibilidades: this.api.listarDisponibilidades(),
      salas: this.api.listarSalas(),
    }).subscribe({
      next: ({ materias, franjas, disponibilidades, salas }) => {
        this.materias.set(materias);
        this.franjas.set(franjas);
        this.disponibilidades.set(disponibilidades);
        this.salas.set(salas);
        if (materias.length > 0 && !this.brushMateriaId()) {
          this.brushMateriaId.set(materias[0].id);
        }
      },
    });
  }

  private reload(): void {
    this.api.listarDisponibilidades().subscribe({ next: (data) => this.disponibilidades.set(data) });
  }
}
