# Public pages and help

Public pages introduce the platform, start authentication flows and handle fallback navigation. The help center is authenticated but documented here because it supports all roles.

## Landing

Main files:

- `src/app/features/landing/landing.ts`
- `src/app/features/landing/landing.html`
- `src/app/features/landing/landing.css`
- `src/app/shared/ui/space-background`

The landing page presents ECIWISE+, routes users to login/register and uses the shared logo, theme/language controls and animated space background.

## Login and registration entry

The auth pages are public routes under `/auth/*`. They are documented in [Authentication](./auth).

## Not found

`NotFoundComponent` handles unknown routes. It should remain simple, translated and safe for unauthenticated users.

## Help center

Main files:

- `src/app/features/help/help.ts`
- `src/app/features/help/help.html`
- `src/app/features/help/help.css`

The help route is mounted under `AppShellComponent` and protected by `authGuard`. It provides role-agnostic guidance and should avoid duplicating feature documentation inside the app UI.

## Quality coverage

Relevant specs:

- `features/landing/landing.spec.ts`
- `e2e/auth-shell.spec.ts`

## Extension rules

- Keep landing public and free from authenticated-only dependencies.
- Keep help content translated.
- Keep hero/landing visual assets inspectable and performance-aware.
- Preserve SSR safety for animated or browser-only visual code.
