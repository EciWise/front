import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppError } from '../errors/app-error';
import { AUTH_CONFIG } from '../auth/auth.config';
import { AuthService } from '../auth/auth.service';
import { fakeJwt } from '../testing/fake-jwt';
import { errorInterceptor } from './error.interceptor';

const TOKEN_KEY = 'eciwise.token';
const SESSION_KEY = 'eciwise.session';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  function configure(): void {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: 'http://own.test' } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('normaliza errores HTTP a AppError con clave i18n', async () => {
    localStorage.clear();
    configure();
    const response = firstValueFrom(http.get('/api/private'));
    const req = controller.expectOne('/api/private');
    req.flush({ code: 'invalid_credentials' }, { status: 401, statusText: 'Unauthorized' });

    let error: unknown;
    try {
      await response;
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).messageKey).toBe('auth.invalid');
  });

  /** Simula una sesión activa en localStorage (token con `exp` relativo en s). */
  function loginWith(expOffsetSeconds: number): void {
    localStorage.setItem(TOKEN_KEY, fakeJwt({ exp: Math.floor(Date.now() / 1000) + expOffsetSeconds }));
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id: '1', name: 'Admin', email: 'a@b.co', role: 'ADMIN', active: true }),
    );
  }

  it('cierra sesión y redirige cuando el token ya venció (401/403 propio)', async () => {
    loginWith(3600); // sesión válida al arrancar (restoreUser la conserva)
    configure();
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    expect(auth.isAuthenticated()).toBe(true);

    // El token caduca mientras la sesión sigue viva en memoria.
    localStorage.setItem(TOKEN_KEY, fakeJwt({ exp: Math.floor(Date.now() / 1000) - 10 }));

    const response = firstValueFrom(http.get('http://own.test/api/secure'));
    controller
      .expectOne('http://own.test/api/secure')
      .flush('nope', { status: 403, statusText: 'Forbidden' });
    try {
      await response;
    } catch {
      // se propaga como AppError; aquí interesa solo el efecto de sesión
    }

    expect(auth.isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/auth/login'], expect.anything());
  });

  it('NO cierra sesión ante un 403 con token válido (denegación de permiso)', async () => {
    loginWith(3600);
    configure();
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    expect(auth.isAuthenticated()).toBe(true);

    const response = firstValueFrom(http.get('http://own.test/api/secure'));
    controller
      .expectOne('http://own.test/api/secure')
      .flush('nope', { status: 403, statusText: 'Forbidden' });
    try {
      await response;
    } catch {
      // se propaga como AppError
    }

    expect(auth.isAuthenticated()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });
});
