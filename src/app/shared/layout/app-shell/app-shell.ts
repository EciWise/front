import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { SideNavComponent } from '../side-nav/side-nav';
import { FloatingActionsComponent } from '../floating-actions/floating-actions';
import { ForcePasswordChangeComponent } from '../../../features/auth/force-password-change/force-password-change';

/**
 * Estructura principal de las areas autenticadas: barra superior, navegacion
 * lateral, contenido enrutado y acciones flotantes.
 */
@Component({
  selector: 'eci-app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    TranslatePipe,
    TopBarComponent,
    SideNavComponent,
    FloatingActionsComponent,
    ForcePasswordChangeComponent,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  host: { '[attr.data-role]': 'role()' },
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly role = computed(() => this.auth.role());
  protected readonly mustChangePassword = computed(
    () => this.auth.user()?.mustChangePassword === true,
  );
  protected readonly navOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.closeNav());
  }

  toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }
}
