import { Routes } from '@angular/router';

/** Rutas del área de estudiante. */
export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./student-dashboard').then((m) => m.StudentDashboardComponent),
  },
  {
    path: 'tutorias',
    loadComponent: () => import('./tutorias/tutorias').then((m) => m.TutoriasComponent),
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
    path: 'practica',
    loadComponent: () => import('../practica/practica').then((m) => m.PracticaComponent),
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
    path: 'logros',
    loadComponent: () => import('./achievements/achievements').then((m) => m.AchievementsComponent),
  },
  {
    path: 'foros',
    loadComponent: () => import('./forums/forums').then((m) => m.ForumsComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.ProfileComponent),
  },
];
