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
  {
    path: 'estadisticas',
    loadComponent: () =>
      import('./statistics/statistics').then((m) => m.AdminStatisticsComponent),
  },
  {
    path: 'predicciones',
    loadComponent: () =>
      import('../ia/students-predictions/students-predictions').then(
        (m) => m.StudentsPredictionsComponent,
      ),
  },
  {
    path: 'asignaciones',
    loadComponent: () =>
      import('./assignments/assignments').then((m) => m.AdminAssignmentsComponent),
  },
  {
    path: 'aprendizaje',
    loadComponent: () =>
      import('../aprendizaje/aprendizaje').then((m) => m.AprendizajeComponent),
  },
  {
    path: 'practica',
    loadComponent: () => import('../practica/practica').then((m) => m.PracticaComponent),
  },
];
