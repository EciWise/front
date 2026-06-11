# Routes and roles

Public routes load landing, login, register and OAuth callback.

## What this page covers

- Public routes load landing, login, register and OAuth callback.
- Authenticated areas use AppShellComponent and roleGuard.
- Student, tutor and admin sidebars are declared in shared/layout/nav-items.ts.

## Main files

- `src/app/app.routes.ts`
- `src/app/features/*/*.routes.ts`
- `src/app/shared/layout/nav-items.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
