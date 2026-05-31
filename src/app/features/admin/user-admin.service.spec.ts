import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserAdminService } from './user-admin.service';
import { AUTH_CONFIG } from '../../core/auth/auth.config';
import { Role } from '../../core/models/role.enum';

const BASE = 'http://localhost:3001';

const apiUser = (over: Partial<Record<string, unknown>> = {}) => ({
  id: 'u-1',
  nombre: 'Ana',
  apellido: 'Díaz',
  email: 'ana@escuelaing.edu.co',
  rol: { id: 1, nombre: 'estudiante' },
  estado: { id: 1, nombre: 'activo' },
  ...over,
});

describe('UserAdminService', () => {
  let service: UserAdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: BASE } },
      ],
    });
    service = TestBed.inject(UserAdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga y mapea los usuarios del backend', () => {
    service.load();
    const req = http.expectOne(`${BASE}/gestion-usuarios?page=1&limit=100`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: [apiUser()], meta: { total: 1 } });

    const user = service.users()[0];
    expect(user.name).toBe('Ana Díaz');
    expect(user.role).toBe(Role.Student);
    expect(user.active).toBe(true);
  });

  it('sube el CSV como multipart y refresca la lista', () => {
    const file = new File(['nombre,apellido,email,rol\n'], 'users.csv', { type: 'text/csv' });
    service.bulkUploadCsv(file).subscribe();

    const upload = http.expectOne(`${BASE}/gestion-usuarios/carga-masiva`);
    expect(upload.request.method).toBe('POST');
    expect(upload.request.body instanceof FormData).toBe(true);
    upload.flush({ total: 0, creados: 0, errores: [], usuarios: [] });

    // tras subir, se recarga la lista
    http.expectOne(`${BASE}/gestion-usuarios?page=1&limit=100`).flush({ data: [], meta: { total: 0 } });
  });

  it('cambia el rol con el rolId correcto', () => {
    service.changeRole('u-1', Role.Tutor);
    const req = http.expectOne(`${BASE}/gestion-usuarios/u-1/rol`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rolId: 2 });
    req.flush({});
    http.expectOne(`${BASE}/gestion-usuarios?page=1&limit=100`).flush({ data: [], meta: { total: 0 } });
  });

  it('alterna el estado del usuario activo a inactivo', () => {
    service.load();
    http.expectOne(`${BASE}/gestion-usuarios?page=1&limit=100`).flush({ data: [apiUser()], meta: { total: 1 } });

    service.toggleActive('u-1');
    const req = http.expectOne(`${BASE}/gestion-usuarios/u-1/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ estadoId: 2 });
    req.flush({});
    http.expectOne(`${BASE}/gestion-usuarios?page=1&limit=100`).flush({ data: [], meta: { total: 0 } });
  });
});
