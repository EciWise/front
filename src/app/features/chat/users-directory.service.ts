import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AUTH_CONFIG } from '../../core/auth/auth.config';
import { AppError, httpErrorToKey } from '../../core/errors/app-error';
import { DirectoryUser } from './chat.models';

/** Forma de un usuario tal como lo expone wise_auth en GET /gestion-usuarios. */
interface ApiDirectoryUser {
  readonly id: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly email: string;
  readonly rol: { readonly id: number; readonly nombre: string };
}

interface ApiDirectoryResponse {
  readonly data: ApiDirectoryUser[];
  readonly meta: { readonly total: number; readonly totalPages: number };
}

/**
 * Directorio de usuarios (wise_auth) usado como selector de participantes al
 * crear chats y grupos. El endpoint está abierto a cualquier usuario autenticado.
 */
@Injectable({ providedIn: 'root' })
export class UsersDirectoryService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  /** Busca usuarios por nombre/apellido/email. Devuelve hasta `limit` resultados. */
  search(term = '', limit = 50): Observable<DirectoryUser[]> {
    let params = new HttpParams().set('limit', limit).set('page', 1);
    if (term.trim()) {
      params = params.set('search', term.trim());
    }
    const base = this.config.apiBaseUrl.replace(/\/+$/, '');
    return this.http
      .get<ApiDirectoryResponse>(`${base}/gestion-usuarios`, { params })
      .pipe(
        map((res) => res.data.map((u) => this.toDirectoryUser(u))),
        catchError((err) => throwError(() => new AppError(httpErrorToKey(err)))),
      );
  }

  private toDirectoryUser(u: ApiDirectoryUser): DirectoryUser {
    return {
      id: u.id,
      name: `${u.nombre} ${u.apellido}`.trim(),
      email: u.email,
      rol: u.rol?.nombre ?? 'estudiante',
    };
  }
}
