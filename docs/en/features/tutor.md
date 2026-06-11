# Tutor area

The tutor area includes assigned students, schedule, availability, requests, history and learning.

## What this page covers

- The tutor area includes assigned students, schedule, availability, requests, history and learning.
- Schedule handles attendance, session observations and student participation evaluation.
- Availability enforces assigned subjects, capacity and no-overlap rules.

## Main files

- `src/app/features/tutor/tutor.routes.ts`
- `src/app/features/tutor/schedule`
- `src/app/features/tutor/availability`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
