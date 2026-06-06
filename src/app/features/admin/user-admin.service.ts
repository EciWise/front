import { Injectable, inject, signal } from '@angular/core';
import { stripTrailingSlashes } from '../../core/config/url.util';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AUTH_CONFIG } from '../../core/auth/auth.config';
import { Role, roleFromApi } from '../../core/models/role.enum';
import { User } from '../../core/models/user.model';

/**
 * IDs de rol y estado tal como los siembra Prisma en el backend (wise_auth).
 * Coinciden con el orden de inserción de las tablas `Rol` y `EstadoUsuario`.
 */
const ROLE_ID: Record<Role, number> = {
  [Role.Student]: 1,
  [Role.Tutor]: 2,
  [Role.Admin]: 3,
};
const ESTADO_ACTIVO = 1;
const ESTADO_INACTIVO = 2;

/** Usuario tal como lo devuelve `GET /gestion-usuarios`. */
interface ApiUsuario {
  readonly id: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly rol: { readonly id: number; readonly nombre: string };
  readonly estado: { readonly id: number; readonly nombre: string };
  readonly avatar_url?: string | null;
}

interface PaginatedUsuarios {
  readonly data?: readonly ApiUsuario[];
  readonly meta: { readonly total: number };
}

/** Resultado de la carga masiva por CSV (`POST /gestion-usuarios/carga-masiva`). */
export interface BulkUploadResult {
  readonly total: number;
  readonly creados: number;
  readonly errores: readonly { fila: number; email: string; motivo: string }[];
  readonly usuarios: readonly {
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    passwordTemporal: string;
  }[];
}

/**
 * Administración de usuarios contra el backend wise_auth. Lista, carga masiva
 * por CSV, cambio de rol y activación/desactivación. El JWT lo añade el
 * `authInterceptor`; los errores los normaliza el `errorInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  private readonly _users = signal<User[]>([]);
  readonly users = this._users.asReadonly();

  private get base(): string {
    return stripTrailingSlashes(this.config.apiBaseUrl);
  }

  /** Carga la lista de usuarios desde el backend y la guarda en el signal. */
  load(): void {
    this.http
      .get<PaginatedUsuarios>(`${this.base}/gestion-usuarios?page=1&limit=100`)
      .subscribe({
        next: (res) => this._users.set((res.data ?? []).map((u) => this.toUser(u))),
        error: () => this._users.set([]),
      });
  }

  /** Sube un CSV de usuarios al backend. Refresca la tabla tras la respuesta. */
  bulkUploadCsv(file: File): Observable<BulkUploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<BulkUploadResult>(`${this.base}/gestion-usuarios/carga-masiva`, form)
      .pipe(tap(() => this.load()));
  }

  changeRole(id: string, role: Role): void {
    this.http
      .patch(`${this.base}/gestion-usuarios/${id}/rol`, { rolId: ROLE_ID[role] })
      .subscribe({ next: () => this.load() });
  }

  toggleActive(id: string): void {
    const user = this._users().find((u) => u.id === id);
    if (!user) {
      return;
    }
    const estadoId = user.active ? ESTADO_INACTIVO : ESTADO_ACTIVO;
    this.http
      .patch(`${this.base}/gestion-usuarios/${id}/estado`, { estadoId })
      .subscribe({ next: () => this.load() });
  }

  private toUser(u: ApiUsuario): User {
    return {
      id: u.id,
      name: `${u.nombre} ${u.apellido}`.trim(),
      email: u.email,
      role: roleFromApi(u.rol?.nombre ?? ''),
      active: u.estado?.nombre === 'activo',
      avatarUrl: u.avatar_url ?? undefined,
    };
  }
}
