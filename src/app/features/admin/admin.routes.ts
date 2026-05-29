import { Routes } from '@angular/router';

/** Rutas del área de administración. */
export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-dashboard').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users').then((m) => m.AdminUsersComponent),
  },
];
