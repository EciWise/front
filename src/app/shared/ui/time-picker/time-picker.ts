import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

const MINUTES_PER_DAY = 24 * 60;

function pad(n: number): string {
  return `${n}`.padStart(2, '0');
}

/**
 * Selector de hora propio: campo que despliega una lista de horas en intervalos
 * de `step` minutos. Emite la hora en `HH:mm` (two-way: `[(value)]`). Se cierra
 * con `Escape` o al hacer clic fuera. Cómodo en táctil (lista con scroll-snap).
 */
@Component({
  selector: 'eci-time-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  host: {
    '(document:click)': 'onDocClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './time-picker.html',
  styleUrl: './time-picker.css',
})
export class TimePickerComponent {
  /** Hora seleccionada en formato `HH:mm` (two-way). */
  readonly value = model<string>('');
  /** Granularidad de la lista en minutos. */
  readonly step = input<number>(15);
  readonly placeholder = input<string>('');

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly field = viewChild.required<ElementRef<HTMLButtonElement>>('field');

  protected readonly open = signal(false);
  /** Coordenadas (fixed) del desplegable, calculadas al abrir. */
  protected readonly popTop = signal(0);
  protected readonly popLeft = signal(0);
  protected readonly popWidth = signal(0);

  protected readonly options = computed<readonly string[]>(() => {
    const step = Math.max(1, this.step());
    const out: string[] = [];
    for (let m = 0; m < MINUTES_PER_DAY; m += step) {
      out.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
    }
    return out;
  });

  constructor() {
    // Al abrir, centra la opción seleccionada en la lista visible.
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => {
          this.host.nativeElement
            .querySelector('.tp-opt--selected')
            ?.scrollIntoView({ block: 'center' });
        });
      }
    });
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.position();
    this.open.set(true);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected select(time: string): void {
    this.value.set(time);
    this.close();
  }

  protected isSelected(time: string): boolean {
    return time === this.value();
  }

  protected onDocClick(event: MouseEvent): void {
    const target = event.target;
    if (this.open() && (!(target instanceof Node) || !this.host.nativeElement.contains(target))) {
      this.close();
    }
  }

  /** Ancla el desplegable (fixed) bajo el campo, o encima si no hay sitio. */
  private position(): void {
    if (typeof globalThis.window === 'undefined') {
      return;
    }
    const rect = this.field().nativeElement.getBoundingClientRect();
    const height = 224;
    const margin = 8;
    const below =
      rect.bottom + height + margin <= globalThis.window.innerHeight || rect.top < height + margin;
    this.popTop.set(below ? rect.bottom + 4 : rect.top - height - 4);
    this.popLeft.set(rect.left);
    this.popWidth.set(rect.width);
  }
}
