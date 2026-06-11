# Tutorships

Tutorship flows are mocked in TutoringMockService until the backend is ready.

## What this page covers

- Tutorship flows are mocked in TutoringMockService until the backend is ready.
- The mock covers availability, reservations, attendance, observations, ratings, reputation, recommendations and statistics.
- Dropdowns use eci-select with options owned by each page.

## Main files

- `src/app/features/student/tutorias`
- `src/app/features/tutor/tutoring.service.ts`
- `src/app/features/tutor/tutor.models.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
