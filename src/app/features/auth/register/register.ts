import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { ROLE_HOME } from '../../../core/models/role.enum';
import { DatosIaRegistro, RegisterRequest, User } from '../../../core/models/user.model';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { LogoComponent } from '../../../shared/ui/logo/logo';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';
import { ThemeToggleComponent } from '../../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../../core/a11y/a11y-toggle';

/** Registro de un nuevo estudiante (correo + datos básicos para la IA). */
@Component({
  selector: 'eci-register',
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
  templateUrl: './register.html',
  styleUrl: '../auth.css',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly errorKey = signal<string | null>(null);
  /** Paso actual del asistente (1: datos personales, 2: datos para la IA). */
  protected readonly step = signal<1 | 2>(1);

  /** Campos que se validan antes de avanzar al segundo paso. */
  private readonly step1Controls = ['nombre', 'apellido', 'email', 'telefono', 'password'] as const;

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/),
      ],
    ],
    datosIa: this.fb.nonNullable.group({
      studyTimeWeekly: [null as number | null, [Validators.min(0), Validators.max(20)]],
      absences: [null as number | null, [Validators.min(0), Validators.max(30)]],
      parentalSupport: [null as number | null, [Validators.min(0), Validators.max(4)]],
      tutoring: [false],
      extracurricular: [false],
      sports: [false],
      music: [false],
      volunteering: [false],
    }),
  });

  /** Avanza al paso de datos de IA si los datos personales son válidos. */
  next(): void {
    const ok = this.step1Controls.every((name) => this.form.controls[name].valid);
    if (!ok) {
      this.step1Controls.forEach((name) => this.form.controls[name].markAsTouched());
      return;
    }
    this.errorKey.set(null);
    this.step.set(2);
  }

  /** Regresa al paso de datos personales. */
  back(): void {
    this.step.set(1);
  }

  submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorKey.set(null);
    this.auth.register(this.buildRequest()).subscribe({
      next: (user: User) => void this.router.navigateByUrl(ROLE_HOME[user.role]),
      error: (err: unknown) => this.fail(err),
    });
  }

  private fail(err: unknown): void {
    this.loading.set(false);
    const key = err instanceof AuthError ? err.messageKey : 'errors.unknown';
    this.errorKey.set(key);
    // El correo se edita en el primer paso: si está en uso, regresamos allí.
    if (key === 'auth.emailTaken') {
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
      telefono: value.telefono.trim() || undefined,
      datosIa: this.buildDatosIa(value.datosIa),
    };
  }

  private buildDatosIa(d: ReturnType<typeof this.form.getRawValue>['datosIa']): DatosIaRegistro {
    const datos: DatosIaRegistro = {
      tutoring: d.tutoring ? 1 : 0,
      extracurricular: d.extracurricular ? 1 : 0,
      sports: d.sports ? 1 : 0,
      music: d.music ? 1 : 0,
      volunteering: d.volunteering ? 1 : 0,
    };
    if (d.studyTimeWeekly !== null) {
      datos.studyTimeWeekly = d.studyTimeWeekly;
    }
    if (d.absences !== null) {
      datos.absences = d.absences;
    }
    if (d.parentalSupport !== null) {
      datos.parentalSupport = d.parentalSupport;
    }
    return datos;
  }
}
