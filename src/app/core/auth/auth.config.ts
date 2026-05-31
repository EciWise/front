import { InjectionToken } from '@angular/core';

/** Configuración del cliente de autenticación. */
export interface AuthConfig {
  /**
   * URL base del API (wise_auth). En desarrollo apunta al servicio local; en
   * producción se sobrescribe proveyendo AUTH_CONFIG con la URL de Azure API
   * Management. No incluir barra final.
   */
  readonly apiBaseUrl: string;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
