# Authentification

AuthService handles login, register, OAuth callback, forced password change and session persistence.

## Ce que couvre cette page

- AuthService handles login, register, OAuth callback, forced password change and session persistence.
- JWT and user data are persisted in localStorage only in browser context.
- Guards protect authenticated routes and role-specific areas.

## Fichiers principaux

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts`
- `src/app/features/auth`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
