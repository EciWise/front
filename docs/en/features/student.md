# Student area

The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.

## What this page covers

- The student area exposes dashboard, tutorships, materials, games, study center, learning, tasks, achievements, forums and profile.
- Student screens follow the app shell and shared navigation model.
- Tasks and learning integrate with their own backend configuration tokens.

## Main files

- `src/app/features/student/student.routes.ts`
- `src/app/features/student`
- `src/app/shared/layout/nav-items.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
