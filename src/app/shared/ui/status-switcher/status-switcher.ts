import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent, IconName } from '../icon/icon';

type Status = 'PENDING' | 'IN_PROGRESS' | 'DONE';

interface StatusOption {
  readonly value: Status;
  readonly icon: IconName;
  readonly labelKey: string;
}

/**
 * Control segmentado para cambiar el estado de una tarea de forma directa e
 * intuitiva: tres opciones siempre visibles (pendiente, en curso, completada)
 * en lugar de un único botón que cicla entre estados. Al pulsar una opción se
 * fija ese estado; la activa se resalta con el color del estado.
 */
@Component({
  selector: 'eci-status-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, TranslatePipe],
  template: `
    <div
      class="status"
      [class.status--compact]="compact()"
      role="group"
      [attr.aria-label]="'tasks.changeStatus' | translate"
    >
      @for (opt of options; track opt.value) {
        <button
          type="button"
          class="status__btn"
          [class.status__btn--active]="status() === opt.value"
          [attr.data-status]="opt.value"
          [attr.aria-pressed]="status() === opt.value"
          [attr.aria-label]="opt.labelKey | translate"
          [title]="opt.labelKey | translate"
          (click)="pick(opt.value, $event)"
        >
          <eci-icon [name]="opt.icon" [size]="compact() ? 14 : 16" />
          @if (!compact()) {
            <span class="status__label">{{ opt.labelKey | translate }}</span>
          }
        </button>
      }
    </div>
  `,
  styleUrl: './status-switcher.css',
})
export class StatusSwitcherComponent {
  readonly status = input.required<Status>();
  /** Variante reducida (solo iconos) para tarjetas estrechas de la agenda. */
  readonly compact = input(false);
  readonly statusChange = output<Status>();

  protected readonly options: readonly StatusOption[] = [
    { value: 'PENDING', icon: 'circle', labelKey: 'tasks.pending' },
    { value: 'IN_PROGRESS', icon: 'circle-dot', labelKey: 'tasks.inProgress' },
    { value: 'DONE', icon: 'circle-check', labelKey: 'tasks.done' },
  ];

  protected pick(value: Status, event: Event): void {
    // Evita que el clic active el arrastre de la tarjeta o navegue.
    event.stopPropagation();
    if (value !== this.status()) {
      this.statusChange.emit(value);
    }
  }
}
