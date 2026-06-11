# Administration

Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.

## Ce que couvre cette page

- Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.
- Statistics combine platform IA data and tutorship service metrics.
- User administration consumes UserAdminService and role-aware select controls.

## Fichiers principaux

- `src/app/features/admin/admin.routes.ts`
- `src/app/features/admin/users`
- `src/app/features/admin/statistics`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
