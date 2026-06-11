# Routen und Rollen

Public routes load landing, login, register and OAuth callback.

## Was diese Seite abdeckt

- Public routes load landing, login, register and OAuth callback.
- Authenticated areas use AppShellComponent and roleGuard.
- Student, tutor and admin sidebars are declared in shared/layout/nav-items.ts.

## Wichtige Dateien

- `src/app/app.routes.ts`
- `src/app/features/*/*.routes.ts`
- `src/app/shared/layout/nav-items.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
