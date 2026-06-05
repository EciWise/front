import { Role, ROLE_HOME, roleFromApi, roleToApi } from './role.enum';

describe('role enum unit', () => {
  it('mapea roles del backend a rutas principales del front', () => {
    expect(roleFromApi('estudiante')).toBe(Role.Student);
    expect(roleFromApi('tutor')).toBe(Role.Tutor);
    expect(roleFromApi('admin')).toBe(Role.Admin);
    expect(ROLE_HOME[Role.Student]).toBe('/student');
    expect(ROLE_HOME[Role.Tutor]).toBe('/tutor');
    expect(ROLE_HOME[Role.Admin]).toBe('/admin');
  });

  it('usa estudiante como fallback para roles desconocidos', () => {
    expect(roleFromApi('coordinador')).toBe(Role.Student);
  });

  it('convierte roles del front al contrato del backend', () => {
    expect(roleToApi(Role.Student)).toBe('estudiante');
    expect(roleToApi(Role.Tutor)).toBe('tutor');
    expect(roleToApi(Role.Admin)).toBe('admin');
  });
});
