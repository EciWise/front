import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const SESSION_KEY = 'eciwise.session';

/**
 * Adjunta el token de sesión a las peticiones salientes. Preparado para la
 * futura API REST; hoy la app es frontend-only y no realiza llamadas autenticadas.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  if (!isBrowser) {
    return next(req);
  }
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'X-Eciwise-Session': '1' } }));
};
