import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthError, AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import { User } from '../../core/models/user.model';
import { StaticTranslateLoader } from '../../core/i18n/static-translate.loader';
import { SpaceBackgroundComponent } from '../../shared/ui/space-background/space-background';
import { SpaceSceneService } from '../../shared/ui/space-background/space-scene.service';
import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';

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
  submit(): void;
}

const user = {
  id: 'u1',
  name: 'Ana Diaz',
  email: 'ana@gmail.com',
  role: Role.Student,
} as User;

describe('auth forms integration', () => {
  let loginWithEmail: ReturnType<typeof vi.fn>;
  let register: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(async () => {
    loginWithEmail = vi.fn(() => of(user));
    register = vi.fn(() => of(user));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RegisterComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: () => null },
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            loginWithEmail,
            register,
            startGoogleLogin: vi.fn(),
          },
        },
      ],
    })
      .overrideComponent(SpaceBackgroundComponent, {
        set: { providers: [{ provide: SpaceSceneService, useClass: SceneStub }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  it('login renderiza el error normalizado cuando el servicio rechaza credenciales', () => {
    loginWithEmail.mockReturnValue(throwError(() => new AuthError('auth.invalid')));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const [email, password] = el.querySelectorAll('input');
    email.value = 'ana@gmail.com';
    email.dispatchEvent(new Event('input', { bubbles: true }));
    password.value = 'bad-password';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    fixture.detectChanges();

    expect(loginWithEmail).toHaveBeenCalledWith({
      email: 'ana@gmail.com',
      password: 'bad-password',
    });
    expect(el.querySelector('.auth__error[role="alert"]')).not.toBeNull();
  });

  it('registro completo vuelve al paso de email si el backend reporta correo existente', () => {
    register.mockReturnValue(throwError(() => new AuthError('auth.emailTaken')));
    const fixture: ComponentFixture<RegisterComponent> = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
    const cmp = fixture.componentInstance as unknown as RegisterHarness;

    cmp.form.patchValue({
      nombre: 'Ana',
      apellido: 'Diaz',
      email: 'ana@gmail.com',
      telefono: '300 123 4567',
      password: 'Password1',
      confirmPassword: 'Password1',
    });
    cmp.datosIaGroup.patchValue({
      gender: 1,
      ethnicity: 2,
      parentalEducation: 3,
      studyTimeWeekly: 10,
      absences: 1,
      parentalSupport: 4,
      tutoring: true,
      extracurricular: false,
      sports: true,
      music: false,
      volunteering: true,
    });
    cmp.step.set(3);

    cmp.submit();
    fixture.detectChanges();

    expect(cmp.step()).toBe(1);
    expect(register).toHaveBeenCalledTimes(1);
    expect((fixture.nativeElement as HTMLElement).querySelector('.auth__error[role="alert"]')).not.toBeNull();
  });
});
