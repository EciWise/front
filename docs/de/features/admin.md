# Administration

Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.

## Was diese Seite abdeckt

- Admin manages users, CSV imports, institutional statistics, predictions, assignments and learning.
- Statistics combine platform IA data and tutorship service metrics.
- User administration consumes UserAdminService and role-aware select controls.

## Wichtige Dateien

- `src/app/features/admin/admin.routes.ts`
- `src/app/features/admin/users`
- `src/app/features/admin/statistics`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
