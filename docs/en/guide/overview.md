# Overview

ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.

## What this page covers

- ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.
- The app groups public, student, tutor and administrator experiences.
- Cross-cutting services manage authentication, theme, accessibility, i18n, notifications and runtime configuration.

## Main files

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/shared/layout/app-shell/app-shell.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
