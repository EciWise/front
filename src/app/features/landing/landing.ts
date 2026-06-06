import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/ui/button/button';
import { LogoComponent } from '../../shared/ui/logo/logo';
import { IconComponent } from '../../shared/ui/icon/icon';
import { SectionTabsComponent, SectionTab } from '../../shared/ui/section-tabs/section-tabs';
import { ThemeToggleComponent } from '../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../core/a11y/a11y-toggle';
import { SpaceBackgroundComponent } from '../../shared/ui/space-background/space-background';

/**
 * Landing pública con escena espacial 3D interactiva. El fondo se delega al
 * componente reutilizable `eci-space-background`, que también usan el login y
 * el registro para mantener una estética coherente.
 */
@Component({
  selector: 'eci-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    ButtonComponent,
    LogoComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
    IconComponent,
    SectionTabsComponent,
    SpaceBackgroundComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  private readonly router = inject(Router);

  /** Secciones de la landing: cada una cabe en pantalla, sin scroll. */
  protected readonly sections: readonly SectionTab[] = [
    { id: 'home', labelKey: 'landing.tabHome', icon: 'dashboard' },
    { id: 'about', labelKey: 'landing.tabAbout', icon: 'ethics' },
  ];
  protected readonly section = signal('home');

  goToLogin(): void {
    this.router.navigate(['/auth/login']).catch(() => undefined);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']).catch(() => undefined);
  }
}
