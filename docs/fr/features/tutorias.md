# Tutorats

Tutorship flows are mocked in TutoringMockService until the backend is ready.

## Ce que couvre cette page

- Tutorship flows are mocked in TutoringMockService until the backend is ready.
- The mock covers availability, reservations, attendance, observations, ratings, reputation, recommendations and statistics.
- Dropdowns use eci-select with options owned by each page.

## Fichiers principaux

- `src/app/features/student/tutorias`
- `src/app/features/tutor/tutoring.service.ts`
- `src/app/features/tutor/tutor.models.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
