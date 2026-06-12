# Authentication

The authentication area covers login, registration, OAuth callback, forced password change and session restoration. It is split between public screens under `src/app/features/auth` and cross-cutting session infrastructure under `src/app/core/auth`.

## Screens

| Screen | File | Purpose |
| --- | --- | --- |
| Login | `features/auth/login` | Email/password login and Google entry point |
| Register | `features/auth/register` | Multi-step registration with academic and IA profile data |
| Callback | `features/auth/callback` | OAuth callback processing |
| Force password change | `features/auth/force-password-change` | Required password update flow |
| Wizard chrome | `features/auth/wizard-chrome` | Shared multi-step registration layout |

## Core service

`AuthService` owns:

- Login and registration calls.
- Session completion and user mapping.
- JWT persistence and expiration checks.
- User role normalization.
- Logout and session clearing.
- Forced password change.
- Profile updates for academic program data.
- SSR-safe local storage access.

The service exposes signals for session state and keeps browser storage behind platform checks.

## Guards

| Guard | Purpose |
| --- | --- |
| `authGuard` | Allows only authenticated users |
| `roleGuard` | Allows only the role declared in route data |

Role helpers live in `src/app/core/models/role.enum.ts` and map backend roles to frontend routes, labels and CSS-safe names.

## IA profile forms

Registration and profile flows include academic/IA data:

- `datos-ia-form.ts`: performance model form helpers.
- `dropout-ia-form.ts`: dropout model form helpers.
- `datos-ia-fields`: registration wizard fields.
- `dropout-ia-fields`: profile completion fields.

Form payload builders convert nullable and boolean form state into the backend contract.

## Backend contract

Auth endpoints are built from `AUTH_CONFIG.apiBaseUrl`. Related admin and IA profile endpoints also use the auth base URL.

Do not access `HttpClient` from auth screens directly. Add methods to `AuthService` or a focused domain service.

## Quality coverage

Relevant specs:

- `core/auth/auth.service.spec.ts`
- `core/auth/auth.guard.spec.ts`
- `core/auth/auth.interceptor.spec.ts`
- `features/auth/auth-forms.integration.spec.ts`
- `features/auth/datos-ia-form.unit.spec.ts`
- `features/auth/dropout-ia-form.spec.ts`
- `features/auth/force-password-change/force-password-change.spec.ts`

## Extension rules

- Keep visible text in translation files.
- Keep browser storage guarded for SSR.
- Normalize backend roles through shared role helpers.
- Update tests when session mapping, token persistence or role routing changes.
