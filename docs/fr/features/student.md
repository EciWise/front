# Espace etudiant

The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.

## Ce que couvre cette page

- The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.
- Student screens follow the app shell and shared navigation model.
- Tasks and learning integrate with their own backend configuration tokens.

## Fichiers principaux

- `src/app/features/student/student.routes.ts`
- `src/app/features/student`
- `src/app/shared/layout/nav-items.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
