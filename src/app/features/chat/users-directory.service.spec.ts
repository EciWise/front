import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_CONFIG } from '../../core/auth/auth.config';
import { AppError } from '../../core/errors/app-error';
import { UsersDirectoryService } from './users-directory.service';

const BASE = 'http://auth.test';

describe('UsersDirectoryService', () => {
  let service: UsersDirectoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: `${BASE}/` } },
      ],
    });
    service = TestBed.inject(UsersDirectoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca usuarios, recorta el termino y mapea el nombre completo', () => {
    let result: unknown;
    service.search('  ana  ', 10).subscribe((users) => (result = users));

    const req = http.expectOne((request) => request.url === `${BASE}/gestion-usuarios`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('search')).toBe('ana');
    req.flush({
      data: [
        {
          id: 'u1',
          nombre: 'Ana',
          apellido: 'Diaz',
          email: 'ana@escuelaing.edu.co',
          rol: { id: 1, nombre: 'estudiante' },
        },
      ],
      meta: { total: 1, totalPages: 1 },
    });

    expect(result).toEqual([
      {
        id: 'u1',
        name: 'Ana Diaz',
        email: 'ana@escuelaing.edu.co',
        rol: 'estudiante',
      },
    ]);
  });

  it('omite search cuando el termino queda vacio y usa el limite por defecto', () => {
    service.search('   ').subscribe();

    const req = http.expectOne((request) => request.url === `${BASE}/gestion-usuarios`);
    expect(req.request.params.get('limit')).toBe('50');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ data: [], meta: { total: 0, totalPages: 0 } });
  });

  it('recorta nombres incompletos y usa estudiante si no llega rol', () => {
    let result: unknown;
    service.search('solo').subscribe((users) => (result = users));

    http.expectOne((request) => request.url === `${BASE}/gestion-usuarios`).flush({
      data: [
        {
          id: 'u2',
          nombre: 'Solo',
          apellido: '',
          email: 'solo@escuelaing.edu.co',
          rol: null,
        },
      ],
      meta: { total: 1, totalPages: 1 },
    });

    expect(result).toEqual([
      {
        id: 'u2',
        name: 'Solo',
        email: 'solo@escuelaing.edu.co',
        rol: 'estudiante',
      },
    ]);
  });

  it('normaliza errores HTTP a AppError', () => {
    let error: unknown;
    service.search('ana').subscribe({ error: (err: unknown) => (error = err) });

    http
      .expectOne((request) => request.url === `${BASE}/gestion-usuarios`)
      .flush({ message: 'invalid_credentials' }, { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).messageKey).toBe('auth.invalid');
  });

  it('normaliza errores de red a AppError', () => {
    let error: unknown;
    service.search('ana').subscribe({ error: (err: unknown) => (error = err) });

    http
      .expectOne((request) => request.url === `${BASE}/gestion-usuarios`)
      .error(new ProgressEvent('network'));

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).messageKey).toBe('errors.network');
  });
});
