# Frontend inventory

This inventory maps the current frontend codebase by responsibility. Use it as the entry point when you need to locate a route, component, service, model or test.

## Root application

| File | Responsibility |
| --- | --- |
| `src/app/app.ts` | Root component with router outlet |
| `src/app/app.html` | Root template |
| `src/app/app.config.ts` | Browser/shared app providers |
| `src/app/app.config.server.ts` | SSR provider merge |
| `src/app/app.routes.ts` | Public and role route tree |
| `src/app/app.routes.server.ts` | Server render strategy |
| `src/main.ts` | Browser bootstrap |
| `src/main.server.ts` | Server bootstrap |
| `src/server.ts` | Express SSR server |
| `src/styles.css` | Global tokens, themes and base styles |

## Public routes

| Route | Component | Files |
| --- | --- | --- |
| `/` | `LandingComponent` | `features/landing` |
| `/auth/login` | `LoginComponent` | `features/auth/login` |
| `/auth/register` | `RegisterComponent` | `features/auth/register` |
| `/auth/callback` | `CallbackComponent` | `features/auth/callback` |
| `/help` | `HelpComponent` | `features/help` |
| `/**` | `NotFoundComponent` | `features/not-found` |

## Student routes

| Route | Component/module | Files |
| --- | --- | --- |
| `/student` | `StudentDashboardComponent` | `features/student/student-dashboard.ts` |
| `/student/tutorias` | `TutoriasComponent` | `features/student/tutorias` |
| `/student/materials` | `MaterialsComponent` | `features/student/materials` |
| `/student/games` | `GamesComponent` | `features/student/games` |
| `/student/practica` | `PracticaComponent` | `features/practica` |
| `/student/aprendizaje` | `AprendizajeComponent` | `features/aprendizaje` |
| `/student/tasks` | `TasksComponent` | `features/student/tasks` |
| `/student/logros` | `AchievementsComponent` | `features/student/achievements` |
| `/student/foros` | `ForumsComponent` | `features/student/forums` |
| `/student/profile` | `ProfileComponent` | `features/student/profile` |

## Tutor routes

| Route | Component/module | Files |
| --- | --- | --- |
| `/tutor` | `TutorDashboardComponent` | `features/tutor/tutor-dashboard.*` |
| `/tutor/estudiantes` | `StudentsPredictionsComponent` | `features/ia/students-predictions` |
| `/tutor/schedule` | `TutorScheduleComponent` | `features/tutor/schedule` |
| `/tutor/availability` | `TutorAvailabilityComponent` | `features/tutor/availability` |
| `/tutor/requests` | `TutorRequestsComponent` | `features/tutor/requests` |
| `/tutor/history` | `TutorHistoryComponent` | `features/tutor/history` |
| `/tutor/aprendizaje` | `AprendizajeComponent` | `features/aprendizaje` |
| `/tutor/practica` | `PracticaComponent` | `features/practica` |

## Admin routes

| Route | Component/module | Files |
| --- | --- | --- |
| `/admin` | `AdminDashboardComponent` | `features/admin/admin-dashboard.ts` |
| `/admin/users` | `AdminUsersComponent` | `features/admin/users` |
| `/admin/estadisticas` | `AdminStatisticsComponent` | `features/admin/statistics` |
| `/admin/predicciones` | `StudentsPredictionsComponent` | `features/ia/students-predictions` |
| `/admin/asignaciones` | `AdminAssignmentsComponent` | `features/admin/assignments` |
| `/admin/aprendizaje` | `AprendizajeComponent` | `features/aprendizaje` |
| `/admin/practica` | `PracticaComponent` | `features/practica` |

## Core inventory

| Folder | Main exports | Purpose |
| --- | --- | --- |
| `core/a11y` | `A11yService`, `A11yToggleComponent` | Accessibility mode |
| `core/auth` | `AuthService`, guards, interceptor, config token | Session and authorization |
| `core/config` | `EnvService`, URL utilities, own API hosts | Runtime configuration |
| `core/errors` | `AppError`, `httpErrorToKey` | Error normalization |
| `core/http` | `errorInterceptor` | Shared HTTP failure behavior |
| `core/i18n` | `I18nService`, loader, switcher, translations | Application languages |
| `core/ia` | IA config, data/admin/profile services, models | Academic IA |
| `core/models` | `Role`, `User` models | Cross-domain models |
| `core/notifications` | Notification model/service | Notification state |
| `core/study` | `STUDY_CONFIG` | Study service token |
| `core/talk` | `TALK_CONFIG` | Chat service token |
| `core/theme` | `ThemeService`, `ThemeToggleComponent` | Light/dark mode |
| `core/todo` | `TODO_CONFIG` | Todo service token |

## Feature service inventory

| Service | Folder | Backend/config |
| --- | --- | --- |
| `UserAdminService` | `features/admin` | `AUTH_CONFIG` |
| `AiAssistantService` | `features/ai-assistant` | Local simulated assistant |
| `AprendizajeService` | `features/aprendizaje` | `STUDY_CONFIG` |
| `PracticaService` | `features/practica` | `STUDY_CONFIG` |
| `ChatService` | `features/chat` | Orchestrates `TalkApiService` and `TalkRealtimeService` |
| `TalkApiService` | `features/chat` | `TALK_CONFIG.talkApiUrl` |
| `TalkRealtimeService` | `features/chat` | `TALK_CONFIG.talkWsUrl` |
| `UsersDirectoryService` | `features/chat` | `AUTH_CONFIG` |
| `TasksService` | `features/student/tasks` | `TODO_CONFIG` |
| `TutoriasService` | `features/student/tutorias` | Delegates to `TutoringMockService` |
| `TutoringMockService` | `features/tutor` | Local mock/domain rules |
| Tutor helper services | `features/tutor` | Projections over tutorship state |

## Shared layout inventory

| Component | Selector/file | Purpose |
| --- | --- | --- |
| `AppShellComponent` | `eci-app-shell` | Authenticated shell |
| `TopBarComponent` | `eci-top-bar` | Header, logo, user actions and preferences |
| `SideNavComponent` | `eci-side-nav` | Role-aware sidebar |
| `FloatingActionsComponent` | `eci-floating-actions` | Chat/assistant entry point |
| `NotificationsBellComponent` | `eci-notifications-bell` | Notification panel |
| `DashboardGridComponent` | `eci-dashboard-grid` | Dashboard layout helper |
| `navItemsFor` | `shared/layout/nav-items.ts` | Role navigation source |

## Shared UI inventory

| Component | Selector | Purpose |
| --- | --- | --- |
| `ButtonComponent` | `eci-button` | Buttons with variants and `buttonClick` |
| `CardComponent` | `eci-card` | Reusable surfaces |
| `IconComponent` | `eci-icon` | Central icon registry |
| `LogoComponent` | `eci-logo` | Brand logo/home link |
| `ModalComponent` | `eci-modal` | Dialogs |
| `SelectComponent` | `eci-select` | Custom select/CVA |
| `DatePickerComponent` | `eci-date-picker` | Date picker/CVA |
| `TimePickerComponent` | `eci-time-picker` | Time picker/CVA |
| `SectionTabsComponent` | `eci-section-tabs` | Segmented section tabs |
| `AvatarComponent` | `eci-avatar` | User avatar |
| `InfoTooltipComponent` | `eci-info-tooltip` | Contextual tooltip |
| `StatusSwitcherComponent` | `eci-status-switcher` | Status control |
| `PasswordStrengthInputComponent` | `eci-password-strength-input` | Password CVA |
| `PieChartComponent` | `eci-pie-chart` | Pie chart |
| `HistogramComponent` | `eci-histogram` | Histogram |
| `ConfettiComponent` | `eci-confetti` | Celebration effect |
| `SpaceBackgroundComponent` | `eci-space-background` | Landing/auth background |

## Scripts and tooling

| File/script | Purpose |
| --- | --- |
| `scripts/write-env.mjs` | Generates `public/assets/env.json` |
| `scripts/serve.mjs` | Starts development server with configured port |
| `scripts/lint-ratchet.mjs` | Lint baseline/ratchet workflow |
| `npm run build` | Angular SSR build |
| `npm run test:ci` | Test suite |
| `npm run e2e` | Playwright suite |
| `npm run docs:build` | VitePress build |

## Test inventory

Tests are colocated with source files. High-value suites cover:

- Auth, guards, interceptors and errors.
- Theme, i18n, accessibility and notifications.
- Chat REST/realtime/UI.
- Tutorship business rules.
- Tasks service and UI recurrence behavior.
- Learning/practice service contracts and study flow.
- Shared UI controls.
- Public auth shell e2e flows.
