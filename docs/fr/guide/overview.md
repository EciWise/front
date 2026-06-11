# Vue generale

ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.

## Ce que couvre cette page

- ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.
- The app groups public, student, tutor and administrator experiences.
- Cross-cutting services manage authentication, theme, accessibility, i18n, notifications and runtime configuration.

## Fichiers principaux

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/shared/layout/app-shell/app-shell.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
