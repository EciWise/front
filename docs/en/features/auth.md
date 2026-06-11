# Authentication

AuthService handles login, register, OAuth callback, forced password change and session persistence.

## What this page covers

- AuthService handles login, register, OAuth callback, forced password change and session persistence.
- JWT and user data are persisted in localStorage only in browser context.
- Guards protect authenticated routes and role-specific areas.

## Main files

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts`
- `src/app/features/auth`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
