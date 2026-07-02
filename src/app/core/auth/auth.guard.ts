import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role, ROLE_HOME } from '../models/role.enum';

/** Exige sesión activa; si no la hay, redirige a la landing con el login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/']);
};

/**
 * Exige un rol específico. Usar con `data: { role: Role.X }`.
 * Si el rol no coincide, redirige al inicio del rol del usuario.
 */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data['role'] as Role | undefined;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }
  const role = auth.role();
  if (required && role !== required) {
    return router.createUrlTree([role ? ROLE_HOME[role] : '/']);
  }
  return true;
};
