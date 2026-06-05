import { HttpErrorResponse } from '@angular/common/http';

/**
 * Error normalizado de la aplicación. Lleva una CLAVE de traducción (no texto),
 * de modo que la UI muestre el mensaje en el idioma activo (es/en) vía el pipe
 * `translate`. Nunca se propaga texto crudo del backend.
 */
export class AppError extends Error {
  constructor(readonly messageKey: string) {
    super(messageKey);
    this.name = 'AppError';
  }
}

/** Extrae el código de error del cuerpo de una respuesta de NestJS. */
function extractBackendCode(err: HttpErrorResponse): string | null {
  const body: unknown = err.error;
  if (typeof body === 'string') {
    return body;
  }
  if (body && typeof body === 'object' && 'message' in body) {
    const message = body.message;
    if (typeof message === 'string') {
      return message;
    }
  }
  return null;
}

/** Mapea cualquier error HTTP a una clave de traducción. */
export function httpErrorToKey(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) {
    return 'errors.unknown';
  }

  // Status 0 => sin respuesta del servidor (red caída, CORS, offline).
  if (err.status === 0) {
    return 'errors.network';
  }

  switch (extractBackendCode(err)) {
    case 'email_taken':
      return 'auth.emailTaken';
    case 'email_domain_not_allowed':
      return 'auth.emailDomainNotAllowed';
    case 'invalid_credentials':
      return 'auth.invalid';
    case 'account_suspended':
      return 'auth.suspended';
    case 'account_inactive':
      return 'auth.inactive';
    case 'google_no_user':
    case 'google_auth_failed':
      return 'auth.googleFailed';
    default:
      break;
  }

  if (err.status === 429) {
    return 'errors.tooMany';
  }
  if (err.status === 409) {
    return 'auth.emailTaken';
  }
  if (err.status === 401 || err.status === 403) {
    return 'auth.invalid';
  }
  if (err.status === 400 || err.status === 422) {
    return 'auth.invalidData';
  }
  if (err.status >= 500) {
    return 'errors.server';
  }
  return 'errors.unknown';
}
