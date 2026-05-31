import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../../core/a11y/a11y-toggle';

/** Pantalla de inicio de sesión (correo + Google vía redirección al backend). */
@Component({
  selector: 'eci-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    ButtonComponent,
    LogoComponent,
    SpaceBackgroundComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
  ],
  templateUrl: './login.html',
  styleUrl: '../auth.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    this.auth.loginWithEmail(this.form.getRawValue()).subscribe({
      next: (user) => this.redirect(user),
      error: (err: unknown) => this.fail(err),
    });
  }

  /** Redirige al backend para el flujo OAuth de Google (vuelve a /auth/callback). */
  loginWithGoogle(): void {
    this.auth.startGoogleLogin();
  }

  private fail(err: unknown): void {
    this.loading.set(false);
    this.errorKey.set(err instanceof AuthError ? err.messageKey : 'errors.unknown');
  }

  private redirect(user: User): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    void this.router.navigateByUrl(redirect ?? ROLE_HOME[user.role]);
  }
}
