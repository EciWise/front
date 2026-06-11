# Projektstruktur

src/app/core contains auth, i18n, theme, a11y, config and shared models.

## Was diese Seite abdeckt

- src/app/core contains auth, i18n, theme, a11y, config and shared models.
- src/app/features contains business domains such as auth, student, tutor, admin, learning and chat.
- src/app/shared contains layout and reusable UI primitives.

## Wichtige Dateien

- `src/app/core`
- `src/app/features`
- `src/app/shared`
- `src/styles.css`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
