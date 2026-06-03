import { Routes } from '@angular/router';

/** Rutas del área de estudiante. */
export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-dashboard').then((m) => m.StudentDashboardComponent),
  },
  {
    path: 'monitorias',
    loadComponent: () => import('./monitorias/monitorias').then((m) => m.MonitoriasComponent),
  },
  {
    path: 'materials',
    loadComponent: () => import('./materials/materials').then((m) => m.MaterialsComponent),
  },
  {
    path: 'games',
    loadComponent: () => import('./games/games').then((m) => m.GamesComponent),
  },
  {
    path: 'study',
    loadComponent: () => import('./study/study').then((m) => m.StudyComponent),
  },
  {
    path: 'aprendizaje',
    loadComponent: () =>
      import('../aprendizaje/aprendizaje').then((m) => m.AprendizajeComponent),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks').then((m) => m.TasksComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
  },
];
