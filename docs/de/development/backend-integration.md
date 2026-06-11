# Backend-Integration

New backends should expose models, config tokens and dedicated services.

## Was diese Seite abdeckt

- New backends should expose models, config tokens and dedicated services.
- Components should call domain services rather than HttpClient directly.
- Tutorships currently use a mock service designed to be replaced by an HTTP facade.

## Wichtige Dateien

- `src/app/app.config.ts`
- `src/app/core/config`
- `src/app/features/*/*.service.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
