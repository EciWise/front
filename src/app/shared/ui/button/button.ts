import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/**
 * Botón institucional con un efecto de zoom sutil al presionar/seleccionar.
 * Respeta prefers-reduced-motion (gestionado en el CSS global).
 */
@Component({
  selector: 'eci-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="eci-button"
      [class.eci-button--primary]="variant() === 'primary'"
      [class.eci-button--secondary]="variant() === 'secondary'"
      [class.eci-button--ghost]="variant() === 'ghost'"
      [class.eci-button--block]="block()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel() || null"
      (click)="buttonClick.emit()"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './button.css',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly block = input(false);
  /** Etiqueta accesible; útil para botones que solo muestran un icono. */
  readonly ariaLabel = input<string>();
  /** Evento semántico emitido desde el `<button>` nativo interno. */
  readonly buttonClick = output<void>();
}
