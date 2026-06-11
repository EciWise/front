import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  model,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon';

/**
 * Diálogo modal centrado reutilizable. Se abre/cierra con el modelo `open`
 * (two-way: `[(open)]`). Cierra con `Escape`, clic en el fondo o el botón `X`.
 * El contenido (formulario, acciones, etc.) se proyecta con `<ng-content>`.
 *
 * Se posiciona por encima de cualquier otra capa (FAB/dock) mediante un
 * z-index alto, de modo que nunca queda recortado por otros componentes.
 */
@Component({
  selector: 'eci-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent],
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="close()" aria-hidden="true"></div>
      <div class="modal-anchor">
        <div
          #dialog
          class="modal"
          [class.modal--wide]="size() === 'wide'"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          [attr.aria-label]="titleKey() ? (titleKey() | translate) : null"
        >
          <header class="modal__header">
            @if (titleKey()) {
              <h2 class="modal__title">{{ titleKey() | translate }}</h2>
            }
            <button
              type="button"
              class="modal__close"
              (click)="close()"
              [attr.aria-label]="'common.cancel' | translate"
            >
              <eci-icon name="close" [size]="18" />
            </button>
          </header>
          <div class="modal__body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.css',
})
export class ModalComponent {
  /** Estado abierto/cerrado (two-way). */
  readonly open = model<boolean>(false);
  /** Clave i18n del título; si está vacía no se muestra cabecera de título. */
  readonly titleKey = input<string>('');
  /** Variante visual del modal. `wide` se usa para confirmaciones con resumen. */
  readonly size = input<'default' | 'wide'>('default');

  private readonly dialog = viewChild<ElementRef<HTMLDivElement>>('dialog');

  constructor() {
    // Al abrir, lleva el foco al diálogo para navegación accesible por teclado.
    effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.dialog()?.nativeElement.focus());
      }
    });
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onEscape(): void {
    if (this.open()) {
      this.close();
    }
  }
}
