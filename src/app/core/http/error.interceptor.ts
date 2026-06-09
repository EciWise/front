import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AppError, httpErrorToKey } from '../errors/app-error';
import { AuthService } from '../auth/auth.service';
import { isOwnApiUrl, ownApiHosts } from '../config/api-hosts';

/** Endpoints de autenticación: un 401/403 aquí es parte del flujo, no caducidad. */
function isAuthEndpoint(url: string): boolean {
  return url.includes('/auth/');
}

/**
 * Normaliza todos los errores HTTP a un {@link AppError} con una clave de
 * traducción. Además, ante un 401/403 de uno de nuestros servicios cuando la
 * sesión ya está caduca (token vencido o ausente), cierra la sesión y redirige
 * al login. NO cierra la sesión por un 403 con un token aún válido (eso es una
 * denegación de permiso puntual, no una sesión muerta).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  const auth = inject(AuthService);
  const router = inject(Router);
  const hosts = ownApiHosts();

  return next(req).pipe(
    catchError((err: unknown) => {
      if (
        isBrowser &&
        err instanceof HttpErrorResponse &&
        (err.status === 401 || err.status === 403) &&
        isOwnApiUrl(req.url, hosts) &&
        !isAuthEndpoint(req.url) &&
        auth.isAuthenticated() &&
        auth.sessionExpired()
      ) {
        auth.logout();
        const current = router.url;
        router.navigate(['/auth/login'], {
          queryParams: current && current !== '/' ? { redirect: current } : {},
        });
      }
      return throwError(() => new AppError(httpErrorToKey(err)));
    }),
  );
};
