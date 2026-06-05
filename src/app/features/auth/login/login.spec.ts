import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AuthError, AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { User } from '../../../core/models/user.model';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { SpaceBackgroundComponent } from '../../../shared/ui/space-background/space-background';
import { SpaceSceneService } from '../../../shared/ui/space-background/space-scene.service';
import { LoginComponent } from './login';

class SceneStub {
  init(): Promise<void> {
    return Promise.resolve();
  }
  readonly dispose = vi.fn();
}

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let loginWithEmail: ReturnType<typeof vi.fn>;
  let startGoogleLogin: ReturnType<typeof vi.fn>;
  let router: Router;

  const user = { id: 'u1', name: 'Ana', email: 'ana@test.com', role: Role.Student } as User;
  const formOf = () => (fixture.componentInstance as unknown as { form: FormGroup }).form;
  const stateOf = () =>
    fixture.componentInstance as unknown as {
      loading: () => boolean;
      errorKey: () => string | null;
    };

  beforeEach(async () => {
    loginWithEmail = vi.fn(() => of(user));
    startGoogleLogin = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
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
              queryParamMap: { get: (key: string) => (key === 'redirect' ? '/student/tasks' : null) },
            },
          },
        },
        { provide: AuthService, useValue: { loginWithEmail, startGoogleLogin } },
      ],
    })
      .overrideComponent(SpaceBackgroundComponent, {
        set: { providers: [{ provide: SpaceSceneService, useClass: SceneStub }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('no envia credenciales cuando el formulario es invalido', () => {
    fixture.componentInstance.submit();

    expect(loginWithEmail).not.toHaveBeenCalled();
    expect(formOf().touched).toBe(true);
  });

  it('envia credenciales validas y respeta el redirect de la URL', () => {
    formOf().patchValue({ email: 'ana@test.com', password: 'Secreto1' });

    fixture.componentInstance.submit();

    expect(loginWithEmail).toHaveBeenCalledWith({
      email: 'ana@test.com',
      password: 'Secreto1',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/student/tasks');
  });

  it('muestra el error normalizado y libera el estado de carga', () => {
    loginWithEmail.mockReturnValue(throwError(() => new AuthError('auth.invalid')));
    formOf().patchValue({ email: 'ana@test.com', password: 'mala' });

    fixture.componentInstance.submit();

    expect(stateOf().errorKey()).toBe('auth.invalid');
    expect(stateOf().loading()).toBe(false);
  });

  it('delega el login con Google al AuthService', () => {
    fixture.componentInstance.loginWithGoogle();

    expect(startGoogleLogin).toHaveBeenCalledTimes(1);
  });
});
