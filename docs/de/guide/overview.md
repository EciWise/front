# Ubersicht

ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.

## Was diese Seite abdeckt

- ECIWISE+ Front is an Angular 21 application with SSR, hydration and lazy role-based routes.
- The app groups public, student, tutor and administrator experiences.
- Cross-cutting services manage authentication, theme, accessibility, i18n, notifications and runtime configuration.

## Wichtige Dateien

- `src/app/app.config.ts`
- `src/app/app.routes.ts`
- `src/app/shared/layout/app-shell/app-shell.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
