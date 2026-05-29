import { Injectable, signal } from '@angular/core';
import { Role } from '../../core/models/role.enum';
import { User } from '../../core/models/user.model';
import { CsvUserRow, parseUsersCsv } from './parse-users-csv';

const SEED: readonly User[] = [
  { id: 'u-student', name: 'Ana Estudiante', email: 'estudiante@escuelaing.edu.co', role: Role.Student, active: true, program: 'Ingeniería de Sistemas' },
  { id: 'u-tutor', name: 'Carlos Tutor', email: 'tutor@escuelaing.edu.co', role: Role.Tutor, active: true, program: 'Matemáticas' },
  { id: 'u-admin', name: 'Admin General', email: 'admin@escuelaing.edu.co', role: Role.Admin, active: true },
  { id: 'u-4', name: 'Diego Ruiz', email: 'diego.ruiz@escuelaing.edu.co', role: Role.Student, active: false },
];

/**
 * Administración de usuarios (mock). Activar/desactivar, cambiar rol, alta
 * individual y carga masiva por CSV. Reemplazable por API real sin tocar la UI.
 */
@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly _users = signal<User[]>([...SEED]);
  readonly users = this._users.asReadonly();

  toggleActive(id: string): void {
    this._users.update((list) =>
      list.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
    );
  }

  changeRole(id: string, role: Role): void {
    this._users.update((list) => list.map((u) => (u.id === id ? { ...u, role } : u)));
  }

  create(name: string, email: string, role: Role): boolean {
    if (!name.trim() || !email.includes('@') || this.emailExists(email)) {
      return false;
    }
    this._users.update((list) => [...list, this.toUser({ name: name.trim(), email, role })]);
    return true;
  }

  /** Importa usuarios desde el contenido de un CSV. Devuelve cuántos se crearon. */
  importCsv(text: string): number {
    const rows = parseUsersCsv(text).filter((r) => !this.emailExists(r.email));
    if (rows.length === 0) {
      return 0;
    }
    this._users.update((list) => [...list, ...rows.map((r) => this.toUser(r))]);
    return rows.length;
  }

  private emailExists(email: string): boolean {
    return this._users().some((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  private toUser(row: CsvUserRow): User {
    return {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: row.name,
      email: row.email,
      role: row.role,
      active: true,
    };
  }
}
