# Espace tuteur

The tutor area includes assigned students, schedule, availability, requests, history and learning.

## Ce que couvre cette page

- The tutor area includes assigned students, schedule, availability, requests, history and learning.
- Schedule handles attendance, session observations and student participation evaluation.
- Availability enforces assigned subjects, capacity and no-overlap rules.

## Fichiers principaux

- `src/app/features/tutor/tutor.routes.ts`
- `src/app/features/tutor/schedule`
- `src/app/features/tutor/availability`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
