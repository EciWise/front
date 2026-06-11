import { Role, ROLE_HOME, roleApiName, roleFromApi, roleLabelKey, roleToApi } from './role.enum';

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

  it('devuelve claves i18n para roles del front y del backend', () => {
    expect(roleLabelKey(Role.Student)).toBe('roles.STUDENT');
    expect(roleLabelKey('STUDENT')).toBe('roles.STUDENT');
    expect(roleLabelKey('estudiante')).toBe('roles.STUDENT');
    expect(roleLabelKey('tutor')).toBe('roles.TUTOR');
    expect(roleLabelKey('admin')).toBe('roles.ADMIN');
  });

  it('devuelve nombres de API para clases visuales aunque llegue el enum del front', () => {
    expect(roleApiName('STUDENT')).toBe('estudiante');
    expect(roleApiName('TUTOR')).toBe('tutor');
    expect(roleApiName('ADMIN')).toBe('admin');
  });
});
