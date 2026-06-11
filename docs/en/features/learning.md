# Learning

AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.

## What this page covers

- AprendizajeService wraps collections, flashcards, spaced repetition and usage statistics.
- The service builds endpoints from STUDY_CONFIG.
- Models live in study.models.ts and should be updated before template changes.

## Main files

- `src/app/features/aprendizaje/aprendizaje.service.ts`
- `src/app/features/aprendizaje/study.models.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
