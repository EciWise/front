import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AUTH_CONFIG } from './auth.config';
import { IA_CONFIG } from '../ia/ia.config';
import { STUDY_CONFIG } from '../study/study.config';

const TOKEN_KEY = 'eciwise.token';

/**
 * Adjunta el JWT (Authorization: Bearer) SOLO a las peticiones dirigidas a
 * nuestros propios servicios (wise_auth y los servicios de IA). Restringir por
 * host evita filtrar el token a terceros. SSR-safe: en servidor no hay token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  const authConfig = inject(AUTH_CONFIG);
  const iaConfig = inject(IA_CONFIG);
  const studyConfig = inject(STUDY_CONFIG);
  const allowedHosts = [
    authConfig.apiBaseUrl,
    iaConfig.performanceApiUrl,
    iaConfig.dropoutApiUrl,
    studyConfig.studyApiUrl,
  ];

  const isOwnApi = allowedHosts.some((base) => base && req.url.startsWith(base));
  const token = localStorage.getItem(TOKEN_KEY);

  if (!isOwnApi || !token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
