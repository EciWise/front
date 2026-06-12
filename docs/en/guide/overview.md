# Overview

ECIWISE+ Front is the institutional web application for ECIWISE+, the academic support platform of Escuela Colombiana de Ingenieria Julio Garavito. It combines public onboarding, authentication, student workflows, tutor workflows, administration, learning tools, practice quizzes, tasks, chat, AI support, notifications, accessibility preferences and multilingual UI.

## Product scope

The frontend exposes four primary experiences:

| Experience | Users | Main purpose |
| --- | --- | --- |
| Public | Visitors | Landing, login, register, OAuth callback and not-found routes |
| Student | Students | Tutorships, materials, games, practice, learning, tasks, achievements, forums and profile |
| Tutor | Tutors | Assigned students, schedule, availability, requests, history, learning and practice |
| Admin | Administrators | User management, CSV import, statistics, predictions, assignments, learning and practice |

Cross-cutting capabilities are available across roles through the authenticated shell: top navigation, role-aware side navigation, floating chat/assistant actions, notifications, theme, language and accessibility controls.

## Technical scope

| Area | Current implementation |
| --- | --- |
| Framework | Angular 21 |
| Rendering | Angular SSR with Express |
| Components | Standalone components with `ChangeDetectionStrategy.OnPush` |
| State | Angular `signal`, `computed` and injectable services |
| Forms | Reactive Forms and form helper modules |
| Routing | Angular Router with lazy role areas |
| HTTP | `HttpClient` with `withFetch()` and interceptors |
| Runtime config | `.env` -> `scripts/write-env.mjs` -> `public/assets/env.json` -> `EnvService` |
| i18n | `@ngx-translate/core` with static translation files |
| UI | Global CSS tokens, `shared/ui`, Lucide icons and role-aware layout |
| Testing | Angular unit-test builder on Vitest plus Playwright e2e |
| Docs | VitePress multi-locale documentation |

## Design principles

- Keep domain logic inside feature services, not page templates.
- Reuse shared `eci-*` components before creating new UI primitives.
- Use runtime configuration tokens for backend URLs.
- Keep browser-only APIs guarded for SSR.
- Treat visible app text as translation data.
- Use global CSS tokens instead of one-off colors, spacing or shadows.
- Add tests when changing guards, interceptors, services, forms, shared UI or business rules.

## Main files

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/app.routes.server.ts`
- `src/server.ts`
- `src/app/core`
- `src/app/features`
- `src/app/shared/layout/app-shell/app-shell.ts`
- `src/styles.css`

## Documentation map

- Use [Architecture](./architecture) for bootstrap, SSR and data flow.
- Use [Project structure](./project-structure) for folder ownership.
- Use [Routes and roles](./routing-and-roles) for navigation and access control.
- Use [Configuration](./configuration) for runtime environment and backend URLs.
- Use [Frontend inventory](/en/reference/frontend-inventory) for an exhaustive map of routes, modules and shared components.
