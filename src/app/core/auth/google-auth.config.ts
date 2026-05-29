import { InjectionToken } from '@angular/core';

/** Configuración del cliente de Google Identity Services. */
export interface GoogleAuthConfig {
  /** OAuth 2.0 Client ID. Vacío => se usa el inicio de sesión simulado. */
  readonly clientId: string;
}

export const GOOGLE_AUTH_CONFIG = new InjectionToken<GoogleAuthConfig>('GOOGLE_AUTH_CONFIG', {
  providedIn: 'root',
  // Reemplazar por el Client ID real al integrar con Google Cloud.
  factory: () => ({ clientId: '' }),
});
