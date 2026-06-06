import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { RegisterRequest, User } from '../../../core/models/user.model';
import { AuthFormBase } from '../auth-form.base';
import {
  DATOS_IA_PAGES,
  buildDatosIaGroup,
  buildDatosIaPayload,
  markPageTouchedAndValidate,
} from '../datos-ia-form';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { PasswordStrengthInputComponent } from '../../../shared/ui/password-strength-input/password-strength-input';
import { DatosIaFieldsComponent } from '../datos-ia-fields/datos-ia-fields';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../../core/a11y/a11y-toggle';

/** Dominios de correo permitidos para el registro (deben coincidir con el backend). */
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'escuelaing.edu.co', 'mail.escuelaing.edu.co'];

/** Validador que exige que el correo pertenezca a un dominio permitido. */
function allowedEmailDomainValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value as string | null)?.trim().toLowerCase();
  if (!value) {
    return null;
  }
  const domain = value.slice(value.lastIndexOf('@') + 1);
  return ALLOWED_EMAIL_DOMAINS.includes(domain) ? null : { emailDomain: true };
}

/** Paso del asistente de registro: 1 datos personales, 2-3 datos del modelo de IA. */
type WizardStep = 1 | 2 | 3;

/** Valida que la contraseña y su confirmación coincidan. */
function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value as string | null;
  const confirmPassword = group.get('confirmPassword')?.value as string | null;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

/** Registro de un nuevo estudiante (correo + datos básicos para la IA). */
@Component({
  selector: 'eci-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    PasswordStrengthInputComponent,
    DatosIaFieldsComponent,
    LogoComponent,
    SpaceBackgroundComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
  ],
  templateUrl: './register.html',
  styleUrl: '../auth.css',
})
export class RegisterComponent extends AuthFormBase {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly step1Submitted = signal(false);
  protected readonly datosIaSubmitted = signal(false);
  /**
   * Paso actual del asistente: 1 datos personales, 2 y 3 las dos páginas de
   * "Cuéntanos sobre ti" (datos del modelo de IA).
   */
  protected readonly step = signal<WizardStep>(1);
  /** Dirección del último cambio de paso (para la animación de slide). */
  protected readonly direction = signal<'forward' | 'back'>('forward');

  /** Campos que se validan antes de avanzar al segundo paso. */
  private readonly step1Controls = [
    'nombre',
    'apellido',
    'email',
    'telefono',
    'password',
    'confirmPassword',
  ] as const;

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, allowedEmailDomainValidator]],
      telefono: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      datosIa: buildDatosIaGroup(this.fb),
    },
    { validators: passwordsMatchValidator },
  );

  /** Grupo de datos de IA para el componente compartido de campos. */
  protected get datosIaGroup(): FormGroup {
    return this.form.controls.datosIa;
  }

  /** Clave i18n del error a mostrar bajo un campo del paso 1 (o null si es válido). */
  errorKeyFor(name: string): string | null {
    const control = this.form.get(name);
    if (!this.step1Submitted() || !control || control.valid) {
      return null;
    }
    if (control.hasError('email')) {
      return 'register.errors.email';
    }
    if (control.hasError('emailDomain')) {
      return 'register.errors.emailDomain';
    }
    if (name === 'password') {
      return 'register.errors.password';
    }
    if (name === 'confirmPassword') {
      return control.hasError('required')
        ? 'register.errors.required'
        : 'register.errors.passwordMismatch';
    }
    return 'register.errors.required';
  }

  confirmPasswordErrorKey(): string | null {
    const control = this.form.controls.confirmPassword;
    if (!this.step1Submitted()) {
      return null;
    }
    if (control.hasError('required')) {
      return 'register.errors.required';
    }
    return this.form.hasError('passwordMismatch') ? 'register.errors.passwordMismatch' : null;
  }

  phoneInput(value: string): void {
    this.form.controls.telefono.setValue(this.formatPhone(value), { emitEvent: false });
  }

  /** Avanza al siguiente paso validando la página actual. */
  next(): void {
    const current = this.step();
    if (current === 1) {
      this.step1Submitted.set(true);
      const ok =
        this.step1Controls.every((name) => this.form.controls[name].valid) &&
        !this.form.hasError('passwordMismatch');
      if (!ok) {
        this.step1Controls.forEach((name) => this.form.controls[name].markAsTouched());
        return;
      }
      this.step1Submitted.set(false);
    } else if (current === 2) {
      // La primera página de "Sobre ti" debe ser válida antes de avanzar.
      this.datosIaSubmitted.set(true);
      if (!markPageTouchedAndValidate(this.datosIaGroup, DATOS_IA_PAGES[0].controls)) {
        return;
      }
      this.datosIaSubmitted.set(false);
    }
    this.errorKey.set(null);
    this.direction.set('forward');
    this.step.update((s) => Math.min(3, s + 1) as WizardStep);
  }

  /** Regresa al paso anterior. */
  back(): void {
    this.direction.set('back');
    this.step.update((s) => Math.max(1, s - 1) as WizardStep);
  }

  submit(): void {
    if (!this.beginSubmit(this.form)) {
      this.step1Submitted.set(this.step() === 1);
      this.datosIaSubmitted.set(this.step() !== 1);
      return;
    }
    this.auth.register(this.buildRequest()).subscribe({
      next: (user: User) => {
        this.router.navigateByUrl(ROLE_HOME[user.role]).catch((err: unknown) => {
          this.failWith(err);
        });
      },
      error: (err: unknown) => this.fail(err),
    });
  }

  private fail(err: unknown): void {
    const key = this.failWith(err);
    // El correo se edita en el primer paso: si está en uso o su dominio no se
    // permite, regresamos allí para que el usuario pueda corregirlo.
    if (key === 'auth.emailTaken' || key === 'auth.emailDomainNotAllowed') {
      this.step.set(1);
    }
  }

  private buildRequest(): RegisterRequest {
    const value = this.form.getRawValue();
    return {
      email: value.email,
      password: value.password,
      nombre: value.nombre,
      apellido: value.apellido,
      telefono: this.phoneDigits(value.telefono) || undefined,
      datosIa: buildDatosIaPayload(value.datosIa),
    };
  }

  private formatPhone(value: string): string {
    const digits = this.phoneDigits(value).slice(0, 10);
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean);
    return parts.join(' ');
  }

  private phoneDigits(value: string): string {
    return value.replace(/\D/g, '');
  }
}
