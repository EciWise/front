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
import { MathDecorComponent } from '../../ui/math-decor/math-decor';
import { AchievementToastComponent } from '../../ui/achievement-toast/achievement-toast';

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
    MathDecorComponent,
    AchievementToastComponent,
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
  /** Rutas inmersivas (juego): ocultan el FAB y quitan el padding/scroll del contenido. */
  protected readonly immersive = signal(this.isImmersive(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        this.closeNav();
        this.immersive.set(this.isImmersive(this.router.url));
      });
  }

  toggleNav(): void {
    this.navOpen.update((v) => !v);
  }

  closeNav(): void {
    this.navOpen.set(false);
  }

  /** El juego corre a pantalla completa dentro del área de contenido. */
  private isImmersive(url: string): boolean {
    return url.includes('/games/asclepio');
  }
}
