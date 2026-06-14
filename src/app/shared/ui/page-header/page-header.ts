import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent, IconName } from '../icon/icon';

/** Encabezado de sección con icono y título traducible. */
@Component({
  selector: 'eci-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent],
  template: `
    <header class="page-header">
      @if (icon(); as ic) {
        <eci-icon [name]="ic" [size]="26" />
      }
      <h1 class="page-header__title">{{ titleKey() | translate }}</h1>
    </header>
  `,
  styles: [
    `
      .page-header {
        position: relative;
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        padding-bottom: var(--space-2);
        color: var(--text);
      }
      /* Ancla visual de marca: subrayado de acento bajo el encabezado. Posición
         absoluta para no alterar el layout; el acento lo fija el rol activo. */
      .page-header::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: 0;
        width: 6rem;
        max-width: 55%;
        height: 2px;
        border-radius: var(--radius-full);
        background: linear-gradient(to right, var(--accent), transparent);
      }
      /* El icono del encabezado adopta el color del rol. */
      .page-header eci-icon {
        display: inline-flex;
        color: var(--accent);
      }
      .page-header__title {
        margin: 0;
        font-size: 1.5rem;
      }
      @media (prefers-reduced-motion: no-preference) {
        .page-header::after {
          transition: background var(--transition-base);
        }
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly titleKey = input.required<string>();
  readonly icon = input<IconName | null>(null);
}
