# Structure du projet

src/app/core contains auth, i18n, theme, a11y, config and shared models.

## Ce que couvre cette page

- src/app/core contains auth, i18n, theme, a11y, config and shared models.
- src/app/features contains business domains such as auth, student, tutor, admin, learning and chat.
- src/app/shared contains layout and reusable UI primitives.

## Fichiers principaux

- `src/app/core`
- `src/app/features`
- `src/app/shared`
- `src/styles.css`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
