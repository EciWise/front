import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideLogOut, LucideMenu } from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { LogoComponent } from '../../ui/logo/logo';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../../core/a11y/a11y-toggle';
import { NotificationsBellComponent } from '../notifications-bell/notifications-bell';
import { AvatarComponent } from '../../ui/avatar/avatar';
import { MathDecorComponent } from '../../ui/math-decor/math-decor';
import { GlobalSearchComponent } from '../global-search/global-search';

/** Barra superior: logo (vuelve al inicio), controles globales y perfil. */
@Component({
  selector: 'eci-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslatePipe,
    LucideMenu,
    LucideLogOut,
    LogoComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
    NotificationsBellComponent,
    AvatarComponent,
    MathDecorComponent,
    GlobalSearchComponent,
  ],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly menuToggle = output<void>();

  protected readonly user = this.auth.user;
  protected readonly home = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_HOME[role] : '/';
  });
  /** Acceso al perfil del rol activo (ya no vive en el menú lateral). */
  protected readonly profileLink = computed(() => {
    const role = this.auth.role();
    return role ? `${ROLE_HOME[role]}/profile` : '/';
  });

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']).catch(() => undefined);
  }
}
