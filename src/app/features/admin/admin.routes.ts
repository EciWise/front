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
    path: 'monitorias',
    loadComponent: () =>
      import('./monitorias/admin-monitorias').then((m) => m.AdminMonitoriasComponent),
  },
  {
    path: 'materiales',
    loadComponent: () =>
      import('./materiales/admin-materiales').then((m) => m.AdminMaterialesComponent),
  },
  {
    path: 'materias-tutores',
    loadComponent: () =>
      import('./materias-tutores/admin-materias-tutores').then(
        (m) => m.AdminMateriasTutoresComponent,
      ),
  },
  {
    path: 'materias',
    loadComponent: () =>
      import('./materias/admin-materias').then((m) => m.AdminMateriasComponent),
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
  {
    path: 'salas',
    loadComponent: () => import('./salas/admin-salas').then((m) => m.AdminSalasComponent),
  },
  {
    path: 'franjas',
    loadComponent: () => import('./franjas/admin-franjas').then((m) => m.AdminFranjasComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('../student/profile/profile').then((m) => m.ProfileComponent),
  },
];
