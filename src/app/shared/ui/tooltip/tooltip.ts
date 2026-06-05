import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Icono de información con un tooltip accesible que aparece al pasar el cursor o
 * al enfocar con el teclado. Se usa junto a funciones poco intuitivas.
 * El texto debe llegar ya traducido: `[text]="'clave' | translate"`.
 *
 * La burbuja se posiciona con `position: fixed` calculado al abrir, de modo que
 * nunca la recorte un ancestro con `overflow: hidden/auto` (estadísticas,
 * agenda, etc.). Además se ajusta para no salirse de los bordes de la pantalla.
 */
@Component({
  selector: 'eci-info-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="tip">
      <button
        #trigger
        type="button"
        class="tip__trigger"
        [attr.aria-label]="label()"
        (mouseenter)="open()"
        (mouseleave)="close()"
        (focus)="open()"
        (blur)="close()"
      >
        <eci-icon name="info" [size]="size()" />
      </button>
      <span
        class="tip__bubble"
        [class.tip__bubble--open]="visible()"
        [class.tip__bubble--below]="below()"
        [style.top.px]="top()"
        [style.left.px]="left()"
        role="tooltip"
        >{{ text() }}</span
      >
    </span>
  `,
  styleUrl: './tooltip.css',
})
export class InfoTooltipComponent {
  /** Texto (ya traducido) que se muestra en el tooltip. */
  readonly text = input.required<string>();
  /** Etiqueta accesible del botón; por defecto el propio texto. */
  readonly ariaLabel = input<string>('');
  readonly size = input(16);
  /**
   * Posición de la burbuja: `'auto'` decide según el espacio disponible;
   * `'below'`/`'above'` la fuerzan (útil cerca de tarjetas que no debe tapar).
   */
  readonly placement = input<'auto' | 'above' | 'below'>('auto');

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly visible = signal(false);
  protected readonly below = signal(false);
  protected readonly top = signal(0);
  protected readonly left = signal(0);

  protected label(): string {
    return this.ariaLabel() || this.text();
  }

  protected open(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const rect = this.trigger().nativeElement.getBoundingClientRect();
    const margin = 8;
    const maxWidth = Math.min(256, window.innerWidth - margin * 2);
    // Estimación de alto: si no cabe encima, se muestra debajo.
    const estimatedHeight = 96;
    const placement = this.placement();
    const showBelow =
      placement === 'below' ||
      (placement === 'auto' && rect.top < estimatedHeight + margin);
    this.below.set(showBelow);

    // Centrado horizontal sobre el disparador, ajustado a los bordes.
    let left = rect.left + rect.width / 2 - maxWidth / 2;
    left = Math.max(margin, Math.min(left, window.innerWidth - maxWidth - margin));
    this.left.set(left);

    this.top.set(showBelow ? rect.bottom + margin : rect.top - margin);
    this.visible.set(true);
  }

  protected close(): void {
    this.visible.set(false);
  }
}
