import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { stripTrailingSlashes } from '../config/url.util';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable, map } from 'rxjs';
import { AUTH_CONFIG } from './auth.config';
import { Role, roleFromApi } from '../models/role.enum';
import {
  ApiUser,
  AuthResponse,
  DatosIaRegistro,
  EmailCredentials,
  RegisterRequest,
  User,
} from '../models/user.model';

// Reexportado para compatibilidad: los componentes capturan AppError vía su clave.
export { AppError, AppError as AuthError } from '../errors/app-error';

const SESSION_KEY = 'eciwise.session';
const TOKEN_KEY = 'eciwise.token';

/**
 * Servicio de autenticación real contra wise_auth. Mantiene la sesión en una
 * signal y persiste usuario + JWT en localStorage. Los errores se normalizan en
 * el `errorInterceptor` (clave de traducción), por lo que aquí no se capturan.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _user = signal<User | null>(this.restoreUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  hasRole(role: Role): boolean {
    return this._user()?.role === role;
  }

  /** JWT actual (para el interceptor / SSR-safe). */
  get token(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  loginWithEmail(credentials: EmailCredentials): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.base}/auth/login`, credentials)
      .pipe(map((res) => this.persist(res.access_token, res.user)));
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.base}/auth/register`, payload)
      .pipe(map((res) => this.persist(res.access_token, res.user)));
  }

  /**
   * Cambia la contraseña del usuario autenticado (flujo forzado de cuentas CSV).
   * Si llega `datosIa` (estudiantes), se persiste en el backend. Al completarse,
   * limpia el flag `mustChangePassword` en el estado local.
   */
  changePassword(newPassword: string, datosIa?: DatosIaRegistro): Observable<void> {
    return this.http
      .post<ApiUser>(`${this.base}/auth/cambiar-contrasena`, { newPassword, datosIa })
      .pipe(
        map(() => {
          const current = this._user();
          if (current) {
            const updated: User = { ...current, mustChangePassword: false };
            this._user.set(updated);
            if (this.isBrowser) {
              localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            }
          }
        }),
      );
  }

  /** Inicia Google OAuth mediante redirección de página completa al backend. */
  startGoogleLogin(): void {
    if (this.isBrowser) {
      window.location.href = `${this.base}/auth/google`;
    }
  }

  /** Completa la sesión con los datos recibidos en el callback de Google. */
  completeSession(token: string, apiUser: ApiUser): User {
    return this.persist(token, apiUser);
  }

  logout(): void {
    this._user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  /** Actualiza los datos editables del usuario en sesión. */
  updateProfile(changes: Pick<Partial<User>, 'name' | 'program' | 'avatarUrl'>): void {
    const current = this._user();
    if (!current) {
      return;
    }
    const updated: User = { ...current, ...changes };
    this._user.set(updated);
    if (this.isBrowser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
  }

  private get base(): string {
    return stripTrailingSlashes(this.config.apiBaseUrl);
  }

  private persist(token: string, apiUser: ApiUser): User {
    const user = this.toUser(apiUser);
    this._user.set(user);
    if (this.isBrowser) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return user;
  }

  private toUser(api: ApiUser): User {
    return {
      id: api.id,
      name: `${api.nombre} ${api.apellido}`.trim(),
      email: api.email,
      role: roleFromApi(api.rol),
      active: true,
      avatarUrl: api.avatarUrl ?? undefined,
      mustChangePassword: api.mustChangePassword ?? false,
    };
  }

  private restoreUser(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const raw = localStorage.getItem(SESSION_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    // Sesión rancia (sin token o JWT vencido): se limpia para que los guards
    // redirijan al login en vez de dejar una UI "logueada" con un token muerto.
    if (!raw || !token || this.isTokenExpired(token)) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  /**
   * true solo si el JWT trae `exp` y ya pasó (o el token está corrupto). Un token
   * sin `exp` se considera válido: no se fuerza el cierre de sesión por su ausencia.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const { exp } = jwtDecode<{ exp?: number }>(token);
      return exp != null && exp * 1000 <= Date.now();
    } catch {
      return true;
    }
  }

  /**
   * ¿La sesión está caduca? (sin token almacenado o JWT vencido). Lo usa el
   * errorInterceptor para distinguir un 401/403 por sesión muerta —donde sí hay
   * que sacar al usuario— de un 403 de permiso con un token aún válido.
   */
  sessionExpired(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    return !token || this.isTokenExpired(token);
  }
}
