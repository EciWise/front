# UI-System

The UI system is based on global CSS tokens and shared eci-* components.

## Was diese Seite abdeckt

- The UI system is based on global CSS tokens and shared eci-* components.
- Theme and accessibility modes are global and must be respected by feature CSS.
- eci-select receives explicit options from each page.

## Wichtige Dateien

- `src/styles.css`
- `src/app/shared/ui`
- `src/app/shared/layout`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
