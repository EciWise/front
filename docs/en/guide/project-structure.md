# Project structure

The codebase separates cross-cutting infrastructure, business features, shared UI and documentation. New work should follow the existing ownership boundaries before adding new folders.

## Top-level folders

```text
.
|-- docs/                  VitePress documentation
|-- e2e/                   Playwright end-to-end tests
|-- public/assets/         Runtime assets, including env.json
|-- scripts/               Dev/build helpers such as write-env and serve
|-- src/
|   |-- app/               Angular application
|   |-- main.ts            Browser entry
|   |-- main.server.ts     Server entry
|   |-- server.ts          Express SSR server
|   `-- styles.css         Global tokens, themes and base styles
|-- angular.json           Angular build/test targets
|-- package.json           Scripts and dependencies
`-- playwright.config.ts   E2E configuration
```

## Application folders

```text
src/app/
|-- core/
|   |-- a11y/              Accessibility mode service and toggle
|   |-- auth/              Session, guards, interceptor and auth config
|   |-- config/            Runtime env and URL utilities
|   |-- errors/            AppError and error-key mapping
|   |-- http/              Shared HTTP error interceptor
|   |-- i18n/              Language service, switcher and translations
|   |-- ia/                IA models, config and services
|   |-- models/            Cross-domain models such as roles/users
|   |-- notifications/     Notification state and models
|   |-- study/             Study service config token
|   |-- talk/              Talk/chat service config token
|   |-- testing/           Test helpers
|   |-- theme/             Theme service and toggle
|   `-- todo/              Todo service config token
|-- features/
|   |-- admin/             Admin dashboard, users, statistics, assignments
|   |-- ai-assistant/      Floating assistant UI and mock service
|   |-- aprendizaje/       Collections, flashcards, study session and stats
|   |-- auth/              Login, register, callback and IA profile forms
|   |-- chat/              Chat panel, REST, realtime and chat UI
|   |-- help/              Help center
|   |-- ia/                Student prediction screens
|   |-- landing/           Public landing page
|   |-- not-found/         404 route
|   |-- practica/          Quiz practice, subjects, questions, sessions
|   |-- student/           Student role area
|   `-- tutor/             Tutor role area and tutorship service
`-- shared/
    |-- ethics/            Reusable ethics message
    |-- layout/            App shell, nav, top bar, floating actions
    |-- styles/            Shared CSS utilities
    |-- ui/                Reusable UI primitives
    `-- util/              Small pure utilities
```

## File patterns

Feature screens generally use:

```text
feature/
  feature.ts
  feature.html
  feature.css
  feature.spec.ts
```

Shared services and models use:

```text
feature.service.ts
feature.models.ts
feature.service.spec.ts
```

Inline templates are used for small shared components or simple dashboards. Larger screens keep template and styles in separate files.

## Ownership rules

- `core` should not depend on feature modules.
- `features` may depend on `core` and `shared`.
- `shared/ui` should stay generic and domain-neutral.
- `shared/layout` may depend on auth/session state because it renders the authenticated shell.
- Domain services should hide backend endpoints from components.
- Translation keys belong in `src/app/core/i18n/translations`.

## Main files

- `src/app/core`
- `src/app/features`
- `src/app/shared`
- `src/styles.css`
