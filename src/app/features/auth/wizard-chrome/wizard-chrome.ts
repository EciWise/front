import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';

/** Página mostrada en el indicador de pasos: solo necesita su título i18n. */
interface ChromePage {
  readonly titleKey: string;
}

/**
 * "Cromo" compartido de los asistentes de campos de IA (rendimiento y deserción):
 * el indicador de pasos arriba y la barra de navegación (Anterior/Siguiente/
 * Guardar) abajo, con el contenido de campos proyectado en medio. Antes este
 * markup estaba duplicado en `datos-ia-fields` y `dropout-ia-fields`.
 */
@Component({
  selector: 'eci-wizard-chrome',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  template: `
    @if (showChrome()) {
      <ol class="dia__steps" [attr.aria-label]="'register.stepsLabel' | translate">
        @for (p of pages(); track p.titleKey; let i = $index) {
          <li
            class="dia__step"
            [class.dia__step--active]="step() === i"
            [class.dia__step--done]="step() > i"
            [attr.aria-current]="step() === i ? 'step' : null"
          >
            <span class="dia__step-dot">{{ i + 1 }}</span>
            <span class="dia__step-label">{{ p.titleKey | translate }}</span>
          </li>
        }
      </ol>
    }

    <ng-content />

    @if (showChrome()) {
      @if (error(); as err) {
        <p class="dia__error" role="alert">{{ err | translate }}</p>
      }

      <div class="dia__nav">
        @if (!isFirst()) {
          <eci-button variant="secondary" [ariaLabel]="'common.back' | translate" (click)="back.emit()">
            <eci-icon name="arrow-left" [size]="18" />
          </eci-button>
        }
        @if (!isLast()) {
          <eci-button [ariaLabel]="'common.next' | translate" (click)="next.emit()">
            <eci-icon name="arrow-right" [size]="18" />
          </eci-button>
        } @else {
          <eci-button
            [ariaLabel]="'completeProfile.save' | translate"
            [disabled]="pending()"
            (click)="finished.emit()"
          >
            <eci-icon name="check" [size]="18" />
          </eci-button>
        }
      </div>
    }
  `,
  styleUrl: './wizard-chrome.css',
})
export class WizardChromeComponent {
  /** Páginas del asistente (para el indicador de pasos). */
  readonly pages = input.required<readonly ChromePage[]>();
  /** Paso actual (0-based). */
  readonly step = input.required<number>();
  /** Muestra indicador de pasos y barra de navegación (modo paginado). */
  readonly showChrome = input.required<boolean>();
  readonly isFirst = input(false);
  readonly isLast = input(false);
  readonly pending = input(false);
  /** Clave i18n de error a mostrar sobre la navegación. */
  readonly error = input<string | null>(null);

  readonly back = output<void>();
  readonly next = output<void>();
  readonly finished = output<void>();
}
