import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { AuthFormBase } from '../auth-form.base';
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
export class LoginComponent extends AuthFormBase {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (!this.beginSubmit(this.form)) {
      return;
    }
    this.auth.loginWithEmail(this.form.getRawValue()).subscribe({
      next: (user) => this.redirect(user),
      error: (err: unknown) => this.failWith(err),
    });
  }

  /** Redirige al backend para el flujo OAuth de Google (vuelve a /auth/callback). */
  loginWithGoogle(): void {
    this.auth.startGoogleLogin();
  }

  private redirect(user: User): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    this.router.navigateByUrl(redirect ?? ROLE_HOME[user.role]).catch((err: unknown) => {
      this.failWith(err);
    });
  }
}
