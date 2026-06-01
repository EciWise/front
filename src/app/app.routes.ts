import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/auth/auth.guard';
import { Role } from './core/models/role.enum';
import { AppShellComponent } from './shared/layout/app-shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/callback/callback').then((m) => m.CallbackComponent),
  },
  {
    path: 'student',
    component: AppShellComponent,
    canActivate: [roleGuard],
    data: { role: Role.Student },
    loadChildren: () => import('./features/student/student.routes').then((m) => m.STUDENT_ROUTES),
  },
  {
    path: 'tutor',
    component: AppShellComponent,
    canActivate: [roleGuard],
    data: { role: Role.Tutor },
    loadChildren: () => import('./features/tutor/tutor.routes').then((m) => m.TUTOR_ROUTES),
  },
  {
    path: 'admin',
    component: AppShellComponent,
    canActivate: [roleGuard],
    data: { role: Role.Admin },
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'help',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/help/help').then((m) => m.HelpComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
