import { TestBed } from '@angular/core/testing';
import { UserAdminService } from './user-admin.service';
import { Role } from '../../core/models/role.enum';

describe('UserAdminService', () => {
  let service: UserAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserAdminService);
  });

  it('alterna el estado activo de un usuario', () => {
    const user = service.users()[0];
    const before = user.active;
    service.toggleActive(user.id);
    expect(service.users().find((u) => u.id === user.id)?.active).toBe(!before);
  });

  it('cambia el rol de un usuario', () => {
    const user = service.users().find((u) => u.role === Role.Student)!;
    service.changeRole(user.id, Role.Tutor);
    expect(service.users().find((u) => u.id === user.id)?.role).toBe(Role.Tutor);
  });

  it('crea un usuario nuevo y evita correos duplicados', () => {
    const before = service.users().length;
    expect(service.create('Nueva Persona', 'nueva@escuelaing.edu.co', Role.Student)).toBe(true);
    expect(service.users().length).toBe(before + 1);

    expect(service.create('Otra', 'nueva@escuelaing.edu.co', Role.Tutor)).toBe(false);
    expect(service.users().length).toBe(before + 1);
  });

  it('importa usuarios desde CSV ignorando encabezado y filas inválidas', () => {
    const before = service.users().length;
    const csv = [
      'nombre,correo,rol',
      'Pedro Gómez,pedro@escuelaing.edu.co,STUDENT',
      'Lucía Díaz,lucia@escuelaing.edu.co,TUTOR',
      'Fila inválida,sin-correo,STUDENT',
      'Rol malo,malo@escuelaing.edu.co,SUPERVISOR',
    ].join('\n');

    const imported = service.importCsv(csv);

    expect(imported).toBe(2);
    expect(service.users().length).toBe(before + 2);
  });
});
