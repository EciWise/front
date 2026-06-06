import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
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

/** Barra superior: logo (vuelve al inicio), controles globales y perfil. */
@Component({
  selector: 'eci-top-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    LucideMenu,
    LucideLogOut,
    LogoComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
    NotificationsBellComponent,
    AvatarComponent,
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

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']).catch(() => undefined);
  }
}
