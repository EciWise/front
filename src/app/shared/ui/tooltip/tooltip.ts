import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Icono de información con un tooltip accesible que aparece al pasar el cursor o
 * al enfocar con el teclado. Se usa junto a funciones poco intuitivas.
 * El texto debe llegar ya traducido: `[text]="'clave' | translate"`.
 */
@Component({
  selector: 'eci-info-tooltip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <span class="tip">
      <button type="button" class="tip__trigger" [attr.aria-label]="label()">
        <eci-icon name="info" [size]="size()" />
      </button>
      <span class="tip__bubble" role="tooltip">{{ text() }}</span>
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

  protected label(): string {
    return this.ariaLabel() || this.text();
  }
}
