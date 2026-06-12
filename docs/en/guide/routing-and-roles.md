# Routes and roles

Routing is split between public pages and three role-protected application areas. Authenticated routes share the same app shell and lazy-load their role modules.

## Public routes

| Path | Component | Guard | Purpose |
| --- | --- | --- | --- |
| `/` | `LandingComponent` | None | Public product entry |
| `/auth/login` | `LoginComponent` | None | Login |
| `/auth/register` | `RegisterComponent` | None | Registration wizard |
| `/auth/callback` | `CallbackComponent` | None | OAuth callback handling |
| `/help` | `HelpComponent` inside `AppShellComponent` | `authGuard` | Authenticated help center |
| `/**` | `NotFoundComponent` | None | 404 fallback |

## Role areas

| Path | Lazy routes | Guard | Role |
| --- | --- | --- | --- |
| `/student` | `STUDENT_ROUTES` | `roleGuard` | `Role.Student` |
| `/tutor` | `TUTOR_ROUTES` | `roleGuard` | `Role.Tutor` |
| `/admin` | `ADMIN_ROUTES` | `roleGuard` | `Role.Admin` |

The `roleGuard` redirects users away from areas that do not match their active session role. The role helpers live in `src/app/core/models/role.enum.ts`.

## Student route map

| Path | Screen |
| --- | --- |
| `/student` | Student dashboard |
| `/student/tutorias` | Tutorship search/reservation |
| `/student/materials` | Study materials |
| `/student/games` | Games center |
| `/student/practica` | Practice quiz |
| `/student/aprendizaje` | Flashcards and spaced repetition |
| `/student/tasks` | Task planner |
| `/student/logros` | Achievements |
| `/student/foros` | Forums |
| `/student/profile` | Academic profile and IA profile |

## Tutor route map

| Path | Screen |
| --- | --- |
| `/tutor` | Tutor dashboard |
| `/tutor/estudiantes` | Assigned/student predictions view |
| `/tutor/schedule` | Schedule, attendance and participation |
| `/tutor/availability` | Availability management |
| `/tutor/requests` | Tutorship requests |
| `/tutor/history` | Tutoring history |
| `/tutor/aprendizaje` | Learning module |
| `/tutor/practica` | Practice quiz module |

## Admin route map

| Path | Screen |
| --- | --- |
| `/admin` | Admin dashboard |
| `/admin/users` | User management and CSV import |
| `/admin/estadisticas` | Institutional statistics |
| `/admin/predicciones` | Student predictions |
| `/admin/asignaciones` | Tutor assignments |
| `/admin/aprendizaje` | Learning module |
| `/admin/practica` | Practice quiz administration |

## Navigation model

Side navigation is declared in `src/app/shared/layout/nav-items.ts`:

- `STUDENT_NAV`
- `TUTOR_NAV`
- `ADMIN_NAV`

Each item includes a translation key, route, icon name and optional exact matching. The sidebar computes items from `AuthService.role()`.

## Server route rendering

`src/app/app.routes.server.ts` currently uses:

- `RenderMode.Prerender` for `/`.
- `RenderMode.Client` for all other routes.

This avoids prerendering authenticated pages while keeping the landing route static-friendly.

## Main files

- `src/app/app.routes.ts`
- `src/app/features/*/*.routes.ts`
- `src/app/shared/layout/nav-items.ts`
- `src/app/core/auth/auth.guard.ts`
- `src/app/core/models/role.enum.ts`
- `src/app/app.routes.server.ts`
