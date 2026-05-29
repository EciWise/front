import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, delay, of, throwError } from 'rxjs';
import { Role } from '../models/role.enum';
import { EmailCredentials, RegisterPayload, User } from '../models/user.model';
import { GoogleJwtClaims } from '../models/google-credential.model';
import { MOCK_ACCOUNTS, MockAccount } from './mock-users';

const SESSION_KEY = 'eciwise.session';
const LATENCY = 350;

/** Error de autenticación con clave de traducción para la UI. */
export class AuthError extends Error {
  constructor(readonly messageKey: string) {
    super(messageKey);
  }
}

/**
 * Servicio de autenticación mock. Mantiene la sesión en una signal y la
 * persiste en localStorage. Diseñado para sustituirse por una API REST real
 * cambiando únicamente las fuentes de datos.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly accounts = [...MOCK_ACCOUNTS];

  private readonly _user = signal<User | null>(this.restore());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly role = computed(() => this._user()?.role ?? null);

  hasRole(role: Role): boolean {
    return this._user()?.role === role;
  }

  loginWithEmail({ email, password }: EmailCredentials): Observable<User> {
    const account = this.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!account || account.password !== password) {
      return throwError(() => new AuthError('auth.invalid')).pipe(delay(LATENCY));
    }
    if (!account.active) {
      return throwError(() => new AuthError('auth.disabled')).pipe(delay(LATENCY));
    }
    return this.persistAndEmit(account).pipe(delay(LATENCY));
  }

  loginWithGoogle(claims: GoogleJwtClaims): Observable<User> {
    const existing = this.accounts.find((a) => a.email.toLowerCase() === claims.email.toLowerCase());
    const user: User = existing
      ? this.toUser(existing)
      : {
          id: claims.sub,
          name: claims.name,
          email: claims.email,
          role: Role.Student,
          active: true,
          avatarUrl: claims.picture,
        };
    return this.persistAndEmit(user).pipe(delay(LATENCY));
  }

  register(payload: RegisterPayload): Observable<User> {
    if (this.accounts.some((a) => a.email.toLowerCase() === payload.email.toLowerCase())) {
      return throwError(() => new AuthError('auth.invalid')).pipe(delay(LATENCY));
    }
    const account: MockAccount = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: Role.Student,
      active: true,
      program: payload.program,
      password: payload.password,
    };
    this.accounts.push(account);
    return this.persistAndEmit(account).pipe(delay(LATENCY));
  }

  logout(): void {
    this._user.set(null);
    if (this.isBrowser) {
      localStorage.removeItem(SESSION_KEY);
    }
  }

  private persistAndEmit(source: User | MockAccount): Observable<User> {
    const user = this.toUser(source);
    this._user.set(user);
    if (this.isBrowser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return of(user);
  }

  private toUser(source: User | MockAccount): User {
    const { id, name, email, role, active, avatarUrl, program } = source;
    return { id, name, email, role, active, avatarUrl, program };
  }

  private restore(): User | null {
    if (!this.isBrowser) {
      return null;
    }
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
