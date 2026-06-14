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
import { Role } from '../../../core/models/role.enum';
import { IaProfileStatusService } from '../../../core/ia/ia-profile-status.service';
import { TopBarComponent } from '../top-bar/top-bar';
import { SideNavComponent } from '../side-nav/side-nav';
import { FloatingActionsComponent } from '../floating-actions/floating-actions';
import { ForcePasswordChangeComponent } from '../../../features/auth/force-password-change/force-password-change';
import { CompleteProfileDialogComponent } from '../../../features/auth/complete-profile-dialog/complete-profile-dialog';

/**
 * Estructura principal de las áreas autenticadas: barra superior, navegación
 * lateral, contenido enrutado y acciones flotantes (IA + chats).
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
    CompleteProfileDialogComponent,
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.css',
  host: { '[attr.data-role]': 'role()' },
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly iaStatus = inject(IaProfileStatusService);
  protected readonly role = computed(() => this.auth.role());
  /** Cuentas creadas por CSV: fuerzan el cambio de contraseña al ingresar. */
  protected readonly mustChangePassword = computed(
    () => this.auth.user()?.mustChangePassword === true,
  );
  /**
   * Estudiantes sin datos del modelo de rendimiento (p. ej. registro por Google):
   * se les pide completarlos antes de continuar. No se solapa con el cambio de
   * contraseña forzado.
   */
  protected readonly needsPerformanceProfile = computed(
    () =>
      this.role() === Role.Student &&
      this.iaStatus.loaded() &&
      !this.iaStatus.performanceComplete() &&
      !this.mustChangePassword(),
  );
  protected readonly navOpen = signal(false);
  /** Rutas inmersivas (juego): ocultan el FAB y quitan el padding/scroll del contenido. */
  protected readonly immersive = signal(this.isImmersive(this.router.url));

  constructor() {
    // Cierra el menú lateral y recalcula el modo inmersivo en cada navegación.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => {
        this.closeNav();
        this.immersive.set(this.isImmersive(this.router.url));
      });

    // Carga el estado del perfil de IA del estudiante (para el pop-up y la sección).
    if (this.auth.role() === Role.Student) {
      this.iaStatus.load();
    }
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
