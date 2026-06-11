# Administration

Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.

## What this page covers

- Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.
- Statistics combine platform IA data and tutorship service metrics.
- User administration consumes UserAdminService and role-aware select controls.

## Main files

- `src/app/features/admin/admin.routes.ts`
- `src/app/features/admin/users`
- `src/app/features/admin/statistics`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
