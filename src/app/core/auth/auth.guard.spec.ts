import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { authGuard, roleGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AUTH_CONFIG } from './auth.config';
import { Role } from '../models/role.enum';

const validJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1MSIsImV4cCI6NDEwMjQ0NDgwMH0.sig';

function runAuthGuard(url: string): boolean | UrlTree {
  const state = { url } as RouterStateSnapshot;
  const route = {} as ActivatedRouteSnapshot;
  return TestBed.runInInjectionContext(() => authGuard(route, state)) as boolean | UrlTree;
}

function runRoleGuard(role: Role): boolean | UrlTree {
  const route = { data: { role } } as unknown as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;
  return TestBed.runInInjectionContext(() => roleGuard(route, state)) as boolean | UrlTree;
}

describe('auth guards', () => {
  let auth: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: 'http://localhost:3001' } },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  /** Inicia sesión sin HTTP, sembrando la sesión directamente. */
  function signInStudent(): void {
    auth.completeSession(validJwt, {
      id: 'u1',
      email: 'estudiante@escuelaing.edu.co',
      nombre: 'Ana',
      apellido: 'Díaz',
      rol: 'estudiante',
    });
  }

  it('authGuard redirige al login cuando no hay sesión', () => {
    const result = runAuthGuard('/student');
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toContain('/auth/login');
    expect((result as UrlTree).toString()).toContain('redirect');
  });

  it('authGuard permite el acceso con sesión activa', () => {
    signInStudent();
    expect(runAuthGuard('/student')).toBe(true);
  });

  it('roleGuard bloquea un rol distinto y redirige al inicio del rol propio', () => {
    signInStudent();
    expect(runRoleGuard(Role.Student)).toBe(true);

    const denied = runRoleGuard(Role.Admin);
    expect(denied).toBeInstanceOf(UrlTree);
    expect((denied as UrlTree).toString()).toContain('/student');
  });
});
