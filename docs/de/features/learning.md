# Lernen

AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.

## Was diese Seite abdeckt

- AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.
- The service builds endpoints from STUDY_CONFIG.
- Models live in study.models.ts and should be updated before template changes.

## Wichtige Dateien

- `src/app/features/aprendizaje/aprendizaje.service.ts`
- `src/app/features/aprendizaje/study.models.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
