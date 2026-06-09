import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { isOwnApiUrl, ownApiHosts } from '../config/api-hosts';

const TOKEN_KEY = 'eciwise.token';

/**
 * Adjunta el JWT (Authorization: Bearer) SOLO a las peticiones dirigidas a
 * nuestros propios servicios (wise_auth, IA, study, talk, todo). Restringir por
 * host evita filtrar el token a terceros. SSR-safe: en servidor no hay token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || !isOwnApiUrl(req.url, ownApiHosts())) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
