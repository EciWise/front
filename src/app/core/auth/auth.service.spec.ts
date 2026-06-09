import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';
import { AppError } from '../errors/app-error';
import { Role } from '../models/role.enum';
import { ApiUser, AuthResponse, User } from '../models/user.model';
import { fakeJwt } from '../testing/fake-jwt';

const base = 'http://api.test';

const validToken = fakeJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });

const apiUser: ApiUser = {
  id: 'u1',
  email: 'ana@escuelaing.edu.co',
  nombre: 'Ana',
  apellido: 'Diaz',
  rol: 'estudiante',
  avatarUrl: null,
};

const apiResponse: AuthResponse = {
  access_token: 'jwt-123',
  user: apiUser,
};

describe('AuthService', () => {
  let post: ReturnType<typeof vi.fn>;

  function setup(platformId = 'browser'): AuthService {
    post = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: { post } },
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: `${base}/` } },
        { provide: PLATFORM_ID, useValue: platformId },
      ],
    });
    return TestBed.inject(AuthService);
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('inicia sesion y persiste usuario + token', async () => {
    const service = setup();
    post.mockReturnValue(of(apiResponse));

    const user = await firstValueFrom(
      service.loginWithEmail({ email: 'ana@escuelaing.edu.co', password: 'Secreto1' }),
    );

    expect(post).toHaveBeenCalledWith(`${base}/auth/login`, {
      email: 'ana@escuelaing.edu.co',
      password: 'Secreto1',
    });
    expect(user).toEqual({
      id: 'u1',
      name: 'Ana Diaz',
      email: 'ana@escuelaing.edu.co',
      role: Role.Student,
      active: true,
      avatarUrl: undefined,
      mustChangePassword: false,
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasRole(Role.Student)).toBe(true);
    expect(service.token).toBe('jwt-123');
    expect(JSON.parse(localStorage.getItem('eciwise.session') ?? '{}')).toMatchObject({
      email: 'ana@escuelaing.edu.co',
    });
  });

  it('propaga el AppError normalizado por el interceptor', async () => {
    const service = setup();
    post.mockReturnValue(throwError(() => new AppError('auth.invalid')));

    await expect(
      firstValueFrom(service.loginWithEmail({ email: 'ana@escuelaing.edu.co', password: 'mala' })),
    ).rejects.toMatchObject({ messageKey: 'auth.invalid' });
    expect(service.isAuthenticated()).toBe(false);
  });

  it('registra y luego cierra sesion limpiando el almacenamiento', async () => {
    const service = setup();
    post.mockReturnValue(of(apiResponse));

    await firstValueFrom(
      service.register({
        email: 'ana@escuelaing.edu.co',
        password: 'Secreto1',
        nombre: 'Ana',
        apellido: 'Diaz',
      }),
    );
    expect(post).toHaveBeenCalledWith(`${base}/auth/register`, {
      email: 'ana@escuelaing.edu.co',
      password: 'Secreto1',
      nombre: 'Ana',
      apellido: 'Diaz',
    });
    expect(service.role()).toBe(Role.Student);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('eciwise.token')).toBeNull();
    expect(localStorage.getItem('eciwise.session')).toBeNull();
  });

  it('restaura la sesion desde localStorage y descarta JSON invalido', () => {
    const stored: User = {
      id: 'u2',
      name: 'Tina Tutor',
      email: 'tina@escuelaing.edu.co',
      role: Role.Tutor,
      active: true,
    };
    localStorage.setItem('eciwise.session', JSON.stringify(stored));
    localStorage.setItem('eciwise.token', validToken);
    expect(setup().user()).toEqual(stored);

    TestBed.resetTestingModule();
    localStorage.setItem('eciwise.session', '{malformed');
    localStorage.setItem('eciwise.token', validToken);
    expect(setup().user()).toBeNull();
  });

  it('descarta la sesion si el token JWT esta vencido', () => {
    const stored: User = {
      id: 'u3',
      name: 'Vie Vencido',
      email: 'vie@escuelaing.edu.co',
      role: Role.Student,
      active: true,
    };
    localStorage.setItem('eciwise.session', JSON.stringify(stored));
    localStorage.setItem('eciwise.token', fakeJwt({ exp: Math.floor(Date.now() / 1000) - 10 }));

    const service = setup();
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('eciwise.token')).toBeNull();
    expect(localStorage.getItem('eciwise.session')).toBeNull();
  });

  it('completeSession mapea roles y persiste avatar cuando llega del backend', () => {
    const service = setup();
    const user = service.completeSession('tok', {
      id: 'a1',
      email: 'admin@escuelaing.edu.co',
      nombre: 'Ada',
      apellido: 'Admin',
      rol: 'admin',
      avatarUrl: 'https://cdn.test/a.png',
      mustChangePassword: true,
    });

    expect(user.role).toBe(Role.Admin);
    expect(user.avatarUrl).toBe('https://cdn.test/a.png');
    expect(user.mustChangePassword).toBe(true);
    expect(localStorage.getItem('eciwise.token')).toBe('tok');
  });

  it('cambia contrasena y limpia mustChangePassword en estado y storage', async () => {
    const service = setup();
    service.completeSession('tok', { ...apiUser, mustChangePassword: true });
    post.mockReturnValue(of(apiUser));

    await firstValueFrom(
      service.changePassword('Nueva123', {
        gender: 1,
        ethnicity: 1,
        parentalEducation: 1,
        studyTimeWeekly: 8,
        absences: 0,
        parentalSupport: 3,
        tutoring: 1,
        extracurricular: 0,
        sports: 1,
        music: 0,
        volunteering: 1,
      }),
    );

    expect(post).toHaveBeenCalledWith(`${base}/auth/cambiar-contrasena`, {
      newPassword: 'Nueva123',
      datosIa: expect.objectContaining({ studyTimeWeekly: 8 }),
    });
    expect(service.user()?.mustChangePassword).toBe(false);
    expect(JSON.parse(localStorage.getItem('eciwise.session') ?? '{}')).toMatchObject({
      mustChangePassword: false,
    });
  });

  it('permite cambiar contrasena sin usuario local autenticado', async () => {
    const service = setup();
    post.mockReturnValue(of(apiUser));

    await firstValueFrom(service.changePassword('Nueva123'));

    expect(service.user()).toBeNull();
    expect(localStorage.getItem('eciwise.session')).toBeNull();
  });

  it('actualiza perfil editable solo cuando hay usuario en sesion', () => {
    const service = setup();

    service.updateProfile({ name: 'Sin sesion' });
    expect(service.user()).toBeNull();

    service.completeSession('tok', apiUser);
    service.updateProfile({ name: 'Ana D.', program: 'Sistemas', avatarUrl: 'avatar.png' });

    expect(service.user()).toMatchObject({
      name: 'Ana D.',
      program: 'Sistemas',
      avatarUrl: 'avatar.png',
    });
    expect(JSON.parse(localStorage.getItem('eciwise.session') ?? '{}')).toMatchObject({
      program: 'Sistemas',
    });
  });

  it('es seguro en servidor: no restaura, no persiste y token es null', () => {
    localStorage.setItem('eciwise.session', JSON.stringify({ id: 'u1' }));
    const service = setup('server');

    expect(service.user()).toBeNull();
    expect(service.token).toBeNull();

    service.completeSession('tok-server', apiUser);
    service.logout();
    service.startGoogleLogin();

    expect(localStorage.getItem('eciwise.token')).toBeNull();
    expect(localStorage.getItem('eciwise.session')).not.toBeNull();
  });
});
