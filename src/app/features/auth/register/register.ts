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
  buildDatosIaGroup,
  buildDatosIaPayload,
  markPageTouchedAndValidate,
} from '../datos-ia-form';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent, IconName } from '../../../shared/ui/icon/icon';
import { PasswordStrengthInputComponent } from '../../../shared/ui/password-strength-input/password-strength-input';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { AuroraBackgroundComponent } from '../../../shared/ui/aurora-background/aurora-background';
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

/**
 * Pasos del asistente de registro:
 * 1 datos básicos · 2 seguridad · 3-6 datos del modelo de IA.
 */
type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

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
    SelectComponent,
    InfoTooltipComponent,
    LogoComponent,
    AuroraBackgroundComponent,
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
  protected readonly step2Submitted = signal(false);

  /**
   * Paso actual: 1 datos básicos, 2 seguridad,
   * 3 género/etnia, 4 familia, 5 estudios, 6 actividades.
   */
  protected readonly step = signal<WizardStep>(1);
  /** Dirección del último cambio de paso (para la animación de slide). */
  protected readonly direction = signal<'forward' | 'back'>('forward');

  /** Campos del paso 1: identificación básica. */
  private readonly step1Controls = ['nombre', 'apellido', 'email'] as const;
  /** Campos del paso 2: teléfono y credenciales. */
  private readonly step2Controls = ['telefono', 'password', 'confirmPassword'] as const;

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
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
      datosIa: buildDatosIaGroup(this.fb),
    },
    { validators: passwordsMatchValidator },
  );

  /** Grupo de datos de IA (acceso directo al sub-grupo). */
  protected get datosIaGroup(): FormGroup {
    return this.form.controls.datosIa;
  }

  // ── Opciones de selects para los pasos 3 y 4 ────────────────────────────
  protected readonly genderOptions: readonly SelectOption[] = [
    { value: 0, labelKey: 'datosIa.options.gender.male' },
    { value: 1, labelKey: 'datosIa.options.gender.female' },
  ];
  protected readonly ethnicityOptions: readonly SelectOption[] = [
    { value: 0, labelKey: 'datosIa.options.ethnicity.caucasian' },
    { value: 1, labelKey: 'datosIa.options.ethnicity.african' },
    { value: 2, labelKey: 'datosIa.options.ethnicity.asian' },
    { value: 3, labelKey: 'datosIa.options.ethnicity.other' },
  ];
  protected readonly parentalEducationOptions: readonly SelectOption[] = [
    { value: 0, labelKey: 'datosIa.options.parentalEducation.none' },
    { value: 1, labelKey: 'datosIa.options.parentalEducation.highschool' },
    { value: 2, labelKey: 'datosIa.options.parentalEducation.somecollege' },
    { value: 3, labelKey: 'datosIa.options.parentalEducation.bachelor' },
    { value: 4, labelKey: 'datosIa.options.parentalEducation.higher' },
  ];
  protected readonly parentalSupportOptions: readonly SelectOption[] = [
    { value: 0, labelKey: 'datosIa.options.parentalSupport.none' },
    { value: 1, labelKey: 'datosIa.options.parentalSupport.low' },
    { value: 2, labelKey: 'datosIa.options.parentalSupport.moderate' },
    { value: 3, labelKey: 'datosIa.options.parentalSupport.high' },
    { value: 4, labelKey: 'datosIa.options.parentalSupport.veryhigh' },
  ];

  /** Icono representativo de cada paso (índice 0 = paso 1). */
  protected readonly stepIcons: readonly IconName[] = [
    'add-user',  // paso 1: datos básicos
    'ethics',    // paso 2: seguridad
    'profile',   // paso 3: perfil personal
    'users',     // paso 4: familia
    'materials', // paso 5: hábitos de estudio
    'trophy',    // paso 6: actividades
  ];

  /** Checkboxes de actividades para el paso 6. */
  protected readonly checks = [
    'tutoring',
    'volunteering',
    'sports',
    'music',
    'extracurricular',
  ] as const;

  // ── Error display ────────────────────────────────────────────────────────

  /** Clave i18n del error a mostrar bajo un campo de los pasos 1-2 (o null si válido). */
  errorKeyFor(name: string): string | null {
    const control = this.form.get(name);
    const step1Fields: readonly string[] = this.step1Controls;
    const submitted = step1Fields.includes(name) ? this.step1Submitted() : this.step2Submitted();
    if (!submitted || !control || control.valid) {
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
    if (!this.step2Submitted()) {
      return null;
    }
    if (control.hasError('required')) {
      return 'register.errors.required';
    }
    return this.form.hasError('passwordMismatch') ? 'register.errors.passwordMismatch' : null;
  }

  /** Clave i18n del error a mostrar bajo un campo de datos IA (pasos 3-5). */
  iaErrorKeyFor(name: string): string | null {
    const control = this.datosIaGroup.get(name);
    if (!control || control.valid || !control.touched) {
      return null;
    }
    return control.hasError('required') ? 'datosIa.errors.required' : 'datosIa.errors.range';
  }

  phoneInput(value: string): void {
    this.form.controls.telefono.setValue(this.formatPhone(value), { emitEvent: false });
  }

  /** Avanza al siguiente paso validando la página actual. */
  next(): void {
    const current = this.step();

    if (current === 1) {
      this.step1Submitted.set(true);
      const ok = this.step1Controls.every((name) => this.form.controls[name].valid);
      if (!ok) {
        this.step1Controls.forEach((name) => this.form.controls[name].markAsTouched());
        return;
      }
      this.step1Submitted.set(false);
    } else if (current === 2) {
      this.step2Submitted.set(true);
      const ok =
        this.step2Controls.every((name) => this.form.controls[name].valid) &&
        !this.form.hasError('passwordMismatch');
      if (!ok) {
        this.step2Controls.forEach((name) => this.form.controls[name].markAsTouched());
        return;
      }
      this.step2Submitted.set(false);
    } else if (current === 3) {
      if (!markPageTouchedAndValidate(this.datosIaGroup, ['gender', 'ethnicity'])) {
        return;
      }
    } else if (current === 4) {
      if (
        !markPageTouchedAndValidate(this.datosIaGroup, ['parentalEducation', 'parentalSupport'])
      ) {
        return;
      }
    } else if (current === 5) {
      if (!markPageTouchedAndValidate(this.datosIaGroup, ['studyTimeWeekly', 'absences'])) {
        return;
      }
    }

    this.errorKey.set(null);
    this.direction.set('forward');
    this.step.update((s) => Math.min(6, s + 1) as WizardStep);
  }

  /** Regresa al paso anterior. */
  back(): void {
    this.direction.set('back');
    this.step.update((s) => Math.max(1, s - 1) as WizardStep);
  }

  submit(): void {
    if (!this.beginSubmit(this.form)) {
      this.step1Submitted.set(this.step() === 1);
      this.step2Submitted.set(this.step() === 2);
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
    // El correo se edita en el paso 1: si está en uso o su dominio no se
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
