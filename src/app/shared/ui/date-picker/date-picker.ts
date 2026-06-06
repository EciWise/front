import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/** Una celda de la rejilla del calendario. */
interface DayCell {
  readonly iso: string;
  readonly label: number;
  readonly inMonth: boolean;
  readonly disabled: boolean;
}

const ISO_LEN = 10;

/** Convierte una fecha local a `yyyy-MM-dd` sin desfase de zona horaria. */
function toIso(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Parsea `yyyy-MM-dd` a una fecha local (o null si no es válida). */
function fromIso(value: string): Date | null {
  if (value.length < ISO_LEN) {
    return null;
  }
  const [y, m, d] = value.slice(0, ISO_LEN).split('-').map(Number);
  return Number.isNaN(y) ? null : new Date(y, m - 1, d);
}

/**
 * Selector de fecha propio: campo que despliega un calendario mensual en un
 * popover. Emite la fecha en `yyyy-MM-dd` (two-way: `[(value)]`). Se cierra con
 * `Escape` o al hacer clic fuera. Reutilizable en formularios y barras de filtro.
 */
@Component({
  selector: 'eci-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    '(document:click)': 'onDocClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
})
export class DatePickerComponent {
  /** Fecha seleccionada en formato `yyyy-MM-dd` (two-way). */
  readonly value = model<string>('');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly placeholder = input<string>('');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly field = viewChild.required<ElementRef<HTMLButtonElement>>('field');
  private readonly todayIso = toIso(new Date());

  protected readonly open = signal(false);
  /** Coordenadas (fixed) del popover, calculadas al abrir para no recortarse. */
  protected readonly popTop = signal(0);
  protected readonly popLeft = signal(0);
  /** Primer día del mes mostrado en la rejilla. */
  protected readonly viewMonth = signal<Date>(this.initialMonth());

  protected readonly weekdays = computed(() => {
    const fmt = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    // 2024-01-01 fue lunes: genera etiquetas con la semana empezando en lunes.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + i)));
  });

  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(this.viewMonth()),
  );

  protected readonly displayValue = computed(() => {
    const d = fromIso(this.value());
    return d
      ? new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
      : '';
  });

  protected readonly days = computed<readonly DayCell[]>(() => {
    const first = this.viewMonth();
    const year = first.getFullYear();
    const month = first.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7; // lunes = 0
    const min = this.min();
    const max = this.max();
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(year, month, 1 - offset + i);
      const iso = toIso(d);
      return {
        iso,
        label: d.getDate(),
        inMonth: d.getMonth() === month,
        disabled: (!!min && iso < min) || (!!max && iso > max),
      };
    });
  });

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.viewMonth.set(this.initialMonth());
    this.position();
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected shiftMonth(delta: number): void {
    const m = this.viewMonth();
    this.viewMonth.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
  }

  protected select(cell: DayCell): void {
    if (cell.disabled) {
      return;
    }
    this.value.set(cell.iso);
    this.close();
  }

  protected isSelected(iso: string): boolean {
    return iso === this.value();
  }

  protected isToday(iso: string): boolean {
    return iso === this.todayIso;
  }

  protected onDocClick(event: MouseEvent): void {
    const target = event.target;
    if (this.open() && (!(target instanceof Node) || !this.host.nativeElement.contains(target))) {
      this.close();
    }
  }

  private initialMonth(): Date {
    const d = fromIso(this.value()) ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  /** Ancla el popover (fixed) bajo el campo, o encima si no hay sitio debajo. */
  private position(): void {
    if (typeof globalThis.window === 'undefined') {
      return;
    }
    const rect = this.field().nativeElement.getBoundingClientRect();
    const width = 288;
    const height = 320;
    const margin = 8;
    const below =
      rect.bottom + height + margin <= globalThis.window.innerHeight || rect.top < height + margin;
    this.popTop.set(below ? rect.bottom + 4 : rect.top - height - 4);
    this.popLeft.set(
      Math.max(margin, Math.min(rect.left, globalThis.window.innerWidth - width - margin)),
    );
  }
}
