import { FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { RegisterComponent } from './register';
import { AuroraBackgroundComponent } from '../../../shared/ui/aurora-background/aurora-background';
import { SymbolSceneService } from '../../../shared/ui/aurora-background/symbol-scene.service';

/** Evita inicializar WebGL (Three.js) en jsdom: el fondo solo decora. */
class SceneStub {
  init(): Promise<void> {
    return Promise.resolve();
  }
  readonly dispose = vi.fn();
}

interface RegisterHarness {
  readonly form: FormGroup;
  readonly datosIaGroup: FormGroup;
  readonly step: {
    (): 1 | 2 | 3 | 4 | 5 | 6;
    set(value: 1 | 2 | 3 | 4 | 5 | 6): void;
  };
  readonly loading: () => boolean;
  readonly errorKey: () => string | null;
  next(): void;
  back(): void;
  submit(): void;
  phoneInput(value: string): void;
  errorKeyFor(name: string): string | null;
  confirmPasswordErrorKey(): string | null;
  iaErrorKeyFor(name: string): string | null;
}

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let registerUser: ReturnType<typeof vi.fn>;
  let router: Router;

  const user: User = {
    id: 'u1',
    name: 'Ana Diaz',
    email: 'ana@gmail.com',
    role: Role.Student,
    active: true,
  };
  const cmp = (): RegisterHarness => fixture.componentInstance as unknown as RegisterHarness;

  /** Rellena los campos del paso 1 (datos básicos). */
  const fillStep1 = (): void => {
    cmp().form.patchValue({
      nombre: 'Ana',
      apellido: 'Diaz',
      email: 'ana@gmail.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
  };

  /** Rellena las credenciales del paso 2 (contraseña). */
  const fillStep2 = (): void => {
    cmp().form.patchValue({
      password: 'Password1!',
      confirmPassword: 'Password1!',
    });
  };

  /** Rellena todos los datos de IA (pasos 3-6). */
  const fillDatosIa = (): void => {
    cmp().datosIaGroup.patchValue({
      gender: 1,
      ethnicity: 2,
      parentalEducation: 3,
      studyTimeWeekly: 12,
      absences: 2,
      parentalSupport: 4,
      tutoring: true,
      extracurricular: false,
      sports: true,
      music: false,
      volunteering: true,
    });
  };

  beforeEach(async () => {
    registerUser = vi.fn(() => of(user));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: AuthService, useValue: { register: registerUser } },
      ],
    })
      .overrideComponent(AuroraBackgroundComponent, {
        set: { providers: [{ provide: SymbolSceneService, useClass: SceneStub }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  // ── Paso 1: datos básicos ────────────────────────────────────────────────

  it('permanece en paso 1 y expone errores cuando los campos básicos son inválidos', () => {
    cmp().form.patchValue({
      nombre: 'Ana',
      apellido: '',
      email: 'ana@universidad.test',
    });

    cmp().next();

    expect(cmp().step()).toBe(1);
    expect(cmp().errorKeyFor('apellido')).toBe('register.errors.required');
    expect(cmp().errorKeyFor('email')).toBe('register.errors.emailDomain');
  });

  it('avanza al paso 2 cuando los datos básicos son válidos', () => {
    fillStep1();
    cmp().next();
    expect(cmp().step()).toBe(2);
  });

  // ── Paso 2: seguridad ────────────────────────────────────────────────────

  it('permanece en paso 2 y expone errores de contraseña y confirmación', () => {
    fillStep1();
    cmp().next();

    cmp().form.patchValue({ password: 'short', confirmPassword: 'otra' });
    cmp().next();

    expect(cmp().step()).toBe(2);
    expect(cmp().errorKeyFor('password')).toBe('register.errors.password');
    expect(cmp().confirmPasswordErrorKey()).toBe('register.errors.passwordMismatch');
  });

  it('avanza al paso 3 cuando las credenciales son válidas', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();
    expect(cmp().step()).toBe(3);
  });

  // ── Paso 3: género y etnia ───────────────────────────────────────────────

  it('permanece en paso 3 y marca como tocados gender y ethnicity si están vacíos', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();

    cmp().next();

    expect(cmp().step()).toBe(3);
    expect(cmp().datosIaGroup.controls['gender'].touched).toBe(true);
    expect(cmp().datosIaGroup.controls['ethnicity'].touched).toBe(true);
    expect(cmp().iaErrorKeyFor('gender')).toBe('datosIa.errors.required');
  });

  it('avanza al paso 4 cuando género y etnia están completos', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();

    cmp().datosIaGroup.patchValue({ gender: 0, ethnicity: 1 });
    cmp().next();

    expect(cmp().step()).toBe(4);
  });

  // ── Paso 4: familia ──────────────────────────────────────────────────────

  it('permanece en paso 4 cuando educación parental o apoyo están vacíos', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();
    cmp().datosIaGroup.patchValue({ gender: 0, ethnicity: 1 });
    cmp().next();

    cmp().next();

    expect(cmp().step()).toBe(4);
    expect(cmp().datosIaGroup.controls['parentalEducation'].touched).toBe(true);
  });

  // ── Paso 5: estudio ──────────────────────────────────────────────────────

  it('avanza al paso 5 después de completar familia', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();
    cmp().datosIaGroup.patchValue({ gender: 0, ethnicity: 1 });
    cmp().next();
    cmp().datosIaGroup.patchValue({ parentalEducation: 2, parentalSupport: 3 });
    cmp().next();
    expect(cmp().step()).toBe(5);
  });

  // ── Paso 6: actividades ──────────────────────────────────────────────────

  it('avanza al paso 6 después de completar datos de estudio', () => {
    fillStep1();
    cmp().next();
    fillStep2();
    cmp().next();
    cmp().datosIaGroup.patchValue({ gender: 0, ethnicity: 1 });
    cmp().next();
    cmp().datosIaGroup.patchValue({ parentalEducation: 2, parentalSupport: 3 });
    cmp().next();
    cmp().datosIaGroup.patchValue({ studyTimeWeekly: 10, absences: 3 });
    cmp().next();
    expect(cmp().step()).toBe(6);
  });

  // ── Navegación retroceso ─────────────────────────────────────────────────

  it('retrocede al paso anterior con back()', () => {
    fillStep1();
    cmp().next();
    expect(cmp().step()).toBe(2);
    cmp().back();
    expect(cmp().step()).toBe(1);
  });

  it('no retrocede más allá del paso 1', () => {
    cmp().back();
    expect(cmp().step()).toBe(1);
  });

  // ── Submit ───────────────────────────────────────────────────────────────

  it('envía payload normalizado con teléfono de solo dígitos y datos IA numéricos', () => {
    fillStep1();
    cmp().phoneInput('300-123-4567 ext 99');
    fillStep2();
    fillDatosIa();

    cmp().submit();

    expect(registerUser).toHaveBeenCalledTimes(1);
    expect(registerUser.mock.calls[0][0]).toEqual({
      email: 'ana@gmail.com',
      password: 'Password1!',
      nombre: 'Ana',
      apellido: 'Diaz',
      telefono: '3001234567',
      datosIa: {
        gender: 1,
        ethnicity: 2,
        parentalEducation: 3,
        studyTimeWeekly: 12,
        absences: 2,
        parentalSupport: 4,
        tutoring: 1,
        extracurricular: 0,
        sports: 1,
        music: 0,
        volunteering: 1,
      },
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/student');
  });

  // ── Manejo de errores del backend ────────────────────────────────────────

  it('vuelve al paso 1 cuando el backend rechaza el correo', () => {
    registerUser.mockReturnValue(throwError(() => new AuthError('auth.emailTaken')));
    fillStep1();
    fillStep2();
    fillDatosIa();
    cmp().step.set(6);

    cmp().submit();

    expect(cmp().step()).toBe(1);
    expect(cmp().errorKey()).toBe('auth.emailTaken');
    expect(cmp().loading()).toBe(false);
  });
});
