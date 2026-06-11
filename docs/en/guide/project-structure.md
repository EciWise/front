# Project structure

src/app/core contains auth, i18n, theme, a11y, config and shared models.

## What this page covers

- src/app/core contains auth, i18n, theme, a11y, config and shared models.
- src/app/features contains business domains such as auth, student, tutor, admin, learning and chat.
- src/app/shared contains layout and reusable UI primitives.

## Main files

- `src/app/core`
- `src/app/features`
- `src/app/shared`
- `src/styles.css`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
