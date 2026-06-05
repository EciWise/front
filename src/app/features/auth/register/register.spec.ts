import { FormGroup } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';
import { SpaceSceneService } from '../../../shared/ui/space-background/space-scene.service';
import { RegisterComponent } from './register';

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
    (): 1 | 2 | 3;
    set(value: 1 | 2 | 3): void;
  };
  readonly loading: () => boolean;
  readonly errorKey: () => string | null;
  next(): void;
  submit(): void;
  phoneInput(value: string): void;
  errorKeyFor(name: string): string | null;
  confirmPasswordErrorKey(): string | null;
}

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let registerUser: ReturnType<typeof vi.fn>;
  let router: Router;

  const user = { id: 'u1', name: 'Ana Diaz', email: 'ana@gmail.com', role: Role.Student } as User;
  const cmp = (): RegisterHarness => fixture.componentInstance as unknown as RegisterHarness;

  const fillStep1 = (): void => {
    cmp().form.patchValue({
      nombre: 'Ana',
      apellido: 'Diaz',
      email: 'ana@gmail.com',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
  };

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
      .overrideComponent(SpaceBackgroundComponent, {
        set: { providers: [{ provide: SpaceSceneService, useClass: SceneStub }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  it('permanece en paso 1 y expone errores de email, password y confirmacion', () => {
    cmp().form.patchValue({
      nombre: 'Ana',
      apellido: '',
      email: 'ana@universidad.test',
      password: 'short',
      confirmPassword: 'otra',
    });

    cmp().next();

    expect(cmp().step()).toBe(1);
    expect(cmp().errorKeyFor('apellido')).toBe('register.errors.required');
    expect(cmp().errorKeyFor('email')).toBe('register.errors.emailDomain');
    expect(cmp().errorKeyFor('password')).toBe('register.errors.password');
    expect(cmp().confirmPasswordErrorKey()).toBe('register.errors.passwordMismatch');
  });

  it('valida la primera pagina de datos IA antes de avanzar al paso final', () => {
    fillStep1();

    cmp().next();
    expect(cmp().step()).toBe(2);

    cmp().next();
    expect(cmp().step()).toBe(2);
    expect(cmp().datosIaGroup.controls['gender'].touched).toBe(true);

    cmp().datosIaGroup.patchValue({
      gender: 1,
      ethnicity: 2,
      parentalEducation: 3,
      parentalSupport: 4,
    });
    cmp().next();

    expect(cmp().step()).toBe(3);
  });

  it('envia payload normalizado con telefono de solo digitos y datos IA numericos', () => {
    fillStep1();
    cmp().phoneInput('300-123-4567 ext 99');
    fillDatosIa();

    cmp().submit();

    expect(registerUser).toHaveBeenCalledTimes(1);
    expect(registerUser.mock.calls[0][0]).toEqual({
      email: 'ana@gmail.com',
      password: 'Password1',
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

  it('vuelve al paso 1 cuando el backend rechaza el correo', () => {
    registerUser.mockReturnValue(throwError(() => new AuthError('auth.emailTaken')));
    fillStep1();
    fillDatosIa();
    cmp().step.set(3);

    cmp().submit();

    expect(cmp().step()).toBe(1);
    expect(cmp().errorKey()).toBe('auth.emailTaken');
    expect(cmp().loading()).toBe(false);
  });
});
