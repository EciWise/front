import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthError, AuthService } from './auth.service';
import { Role } from '../models/role.enum';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('inicia sesión con credenciales válidas y persiste la sesión', async () => {
    const user = await firstValueFrom(
      service.loginWithEmail({ email: 'estudiante@escuelaing.edu.co', password: 'eciwise' }),
    );

    expect(user.role).toBe(Role.Student);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('eciwise.session')).not.toBeNull();
  });

  it('rechaza credenciales inválidas con AuthError', async () => {
    let error: unknown;
    try {
      await firstValueFrom(
        service.loginWithEmail({ email: 'estudiante@escuelaing.edu.co', password: 'incorrecta' }),
      );
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(AuthError);
    expect((error as AuthError).messageKey).toBe('auth.invalid');
    expect(service.isAuthenticated()).toBe(false);
  });

  it('registra un estudiante nuevo y permite cerrar sesión', async () => {
    await firstValueFrom(
      service.register({ name: 'Nuevo', email: 'nuevo@escuelaing.edu.co', password: 'secreto' }),
    );
    expect(service.role()).toBe(Role.Student);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('eciwise.session')).toBeNull();
  });
});
