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
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-6);
        color: var(--text);
      }
      .page-header__title {
        margin: 0;
        font-size: 1.5rem;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly titleKey = input.required<string>();
  readonly icon = input<IconName | null>(null);
}
