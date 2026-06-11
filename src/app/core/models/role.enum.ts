/** Roles disponibles en la plataforma ECIWISE+. */
export enum Role {
  Student = 'STUDENT',
  Tutor = 'TUTOR',
  Admin = 'ADMIN',
}

/** Ruta base del área principal de cada rol. */
export const ROLE_HOME: Record<Role, string> = {
  [Role.Student]: '/student',
  [Role.Tutor]: '/tutor',
  [Role.Admin]: '/admin',
};

/** Nombres de rol tal como los expone el backend (wise_auth). */
export type ApiRole = 'estudiante' | 'tutor' | 'admin';

const API_TO_ROLE: Record<ApiRole, Role> = {
  estudiante: Role.Student,
  tutor: Role.Tutor,
  admin: Role.Admin,
};

const ROLE_TO_API: Record<Role, ApiRole> = {
  [Role.Student]: 'estudiante',
  [Role.Tutor]: 'tutor',
  [Role.Admin]: 'admin',
};

const ROLE_LABEL_KEYS: Record<Role, string> = {
  [Role.Student]: 'roles.STUDENT',
  [Role.Tutor]: 'roles.TUTOR',
  [Role.Admin]: 'roles.ADMIN',
};

const FRONT_ROLES = new Set<string>(Object.values(Role));

/** Traduce el rol del backend (es) al enum del front. Por defecto, estudiante. */
export function roleFromApi(rol: string): Role {
  return API_TO_ROLE[rol.trim().toLowerCase() as ApiRole] ?? Role.Student;
}

/** Traduce el enum del front al nombre de rol del backend (es). */
export function roleToApi(role: Role): ApiRole {
  return ROLE_TO_API[role];
}

/** Devuelve el nombre de rol del backend aceptando valores del front o del backend. */
export function roleApiName(role: Role | string | null | undefined): ApiRole {
  if (!role) {
    return ROLE_TO_API[Role.Student];
  }

  const normalized = role.trim();
  const frontRole = normalized.toUpperCase();
  if (FRONT_ROLES.has(frontRole)) {
    return ROLE_TO_API[frontRole as Role];
  }

  return ROLE_TO_API[roleFromApi(normalized)];
}

/** Devuelve la clave i18n del rol, aceptando valores del front o del backend. */
export function roleLabelKey(role: Role | string | null | undefined): string {
  if (!role) {
    return ROLE_LABEL_KEYS[Role.Student];
  }

  const normalized = role.trim();
  const frontRole = normalized.toUpperCase();
  if (FRONT_ROLES.has(frontRole)) {
    return ROLE_LABEL_KEYS[frontRole as Role];
  }

  return ROLE_LABEL_KEYS[roleFromApi(normalized)];
}
