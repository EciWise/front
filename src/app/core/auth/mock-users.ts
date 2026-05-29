import { Role } from '../models/role.enum';
import { User } from '../models/user.model';

/** Usuario mock incluyendo su contraseña (solo para el login simulado). */
export interface MockAccount extends User {
  readonly password: string;
}

/**
 * Directorio de cuentas simuladas. En producción esto vendrá de la API.
 * Contraseña común para pruebas: "eciwise".
 */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'u-student',
    name: 'Ana Estudiante',
    email: 'estudiante@escuelaing.edu.co',
    role: Role.Student,
    active: true,
    program: 'Ingeniería de Sistemas',
    password: 'eciwise',
  },
  {
    id: 'u-tutor',
    name: 'Carlos Tutor',
    email: 'tutor@escuelaing.edu.co',
    role: Role.Tutor,
    active: true,
    program: 'Matemáticas',
    password: 'eciwise',
  },
  {
    id: 'u-admin',
    name: 'Admin General',
    email: 'admin@escuelaing.edu.co',
    role: Role.Admin,
    active: true,
    password: 'eciwise',
  },
];
