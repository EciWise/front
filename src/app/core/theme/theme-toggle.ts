import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { ThemeService } from './theme.service';

/** Botón para alternar entre tema claro y oscuro. */
@Component({
  selector: 'eci-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideSun, LucideMoon],
  template: `
    <button
      type="button"
      class="icon-button"
      (click)="theme.toggle()"
      [attr.aria-label]="'theme.toggle' | translate"
      [attr.aria-pressed]="theme.isDark()"
    >
      @if (theme.isDark()) {
        <svg lucideSun [size]="20" aria-hidden="true"></svg>
      } @else {
        <svg lucideMoon [size]="20" aria-hidden="true"></svg>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}
