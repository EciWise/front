import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/ui/button/button';
import { LogoComponent } from '../../shared/ui/logo/logo';

/** Página 404. */
@Component({
  selector: 'eci-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, ButtonComponent, LogoComponent],
  template: `
    <main class="not-found" id="main-content" tabindex="-1">
      <eci-logo home="/" />
      <h1 class="not-found__code">404</h1>
      <a routerLink="/">
        <eci-button>{{ 'common.home' | translate }}</eci-button>
      </a>
    </main>
  `,
  styles: [
    `
      .not-found {
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-6);
        padding: var(--space-8);
      }
      .not-found__code {
        margin: 0;
        font-size: clamp(4rem, 18vw, 9rem);
        font-weight: 800;
        color: var(--brand-red);
      }
    `,
  ],
})
export class NotFoundComponent {}
