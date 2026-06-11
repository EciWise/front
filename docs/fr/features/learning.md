# Apprentissage

AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.

## Ce que couvre cette page

- AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.
- The service builds endpoints from STUDY_CONFIG.
- Models live in study.models.ts and should be updated before template changes.

## Fichiers principaux

- `src/app/features/aprendizaje/aprendizaje.service.ts`
- `src/app/features/aprendizaje/study.models.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
