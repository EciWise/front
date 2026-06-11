# Routes et roles

Public routes load landing, login, register and OAuth callback.

## Ce que couvre cette page

- Public routes load landing, login, register and OAuth callback.
- Authenticated areas use AppShellComponent and roleGuard.
- Student, tutor and admin sidebars are declared in shared/layout/nav-items.ts.

## Fichiers principaux

- `src/app/app.routes.ts`
- `src/app/features/*/*.routes.ts`
- `src/app/shared/layout/nav-items.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
