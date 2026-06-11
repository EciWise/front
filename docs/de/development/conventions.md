# Entwicklungskonventionen

New Angular components should be standalone, OnPush and use inject().

## Was diese Seite abdeckt

- New Angular components should be standalone, OnPush and use inject().
- Prefer signals and modern control flow for new UI state.
- Keep text translated and styling based on global tokens.

## Wichtige Dateien

- `src/app/features`
- `src/app/shared/ui`
- `src/app/core/i18n/translations`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
