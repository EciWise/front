# Student area

The student area is the largest role experience. It is mounted at `/student`, uses `AppShellComponent`, and lazy-loads `STUDENT_ROUTES`.

## Route map

| Route | Feature | Main files |
| --- | --- | --- |
| `/student` | Dashboard | `student-dashboard.ts` |
| `/student/tutorias` | Tutorship discovery/reservation | `student/tutorias` |
| `/student/materials` | Study materials | `student/materials` |
| `/student/games` | Games center | `student/games` |
| `/student/practica` | Quiz practice | `features/practica` |
| `/student/aprendizaje` | Flashcards and spaced repetition | `features/aprendizaje` |
| `/student/tasks` | Task planner | `student/tasks` |
| `/student/logros` | Achievements | `student/achievements` |
| `/student/foros` | Forums | `student/forums` |
| `/student/profile` | Academic profile and IA profile | `student/profile` |

## Dashboard

The dashboard aggregates role-specific cards and entry points. It also includes the IA profile prompt through `ia-profile-section`, which asks students to complete missing dropout/profile data.

## Materials, games, forums and achievements

These modules are local student experiences:

- `materials`: material cards and service-owned material data.
- `games`: game center entry points.
- `forums`: forum-style student communication UI.
- `achievements`: achievement list and progress display.

They should remain student-owned unless a feature becomes cross-role.

## Tasks

`TasksService` integrates with `TODO_CONFIG.todoApiUrl` and exposes task state through signals. It covers:

- Task CRUD.
- Status changes.
- Scheduling and rescheduling.
- Search and filters.
- Agenda occurrences.
- Overdue and today lists.
- Categories.
- Achievements.
- Statistics.

The `TasksComponent` includes agenda/backlog views, recurrence expansion, creation modal, filtering, stats toggle and drag/drop style rescheduling behavior.

## Profile

The profile page handles two concerns:

- Academic program locking through `AuthService.updateProfile`.
- Dropout IA profile completion through `IaDataService` and `IaProfileStatusService`.

The IA section is intentionally progressive: it shows a summary when complete and prompts for missing data otherwise.

## Shared student dependencies

- `AuthService` for session/user state.
- `IaProfileStatusService` for IA profile completion.
- `TutoringMockService` and `TutoriasService` for tutorships.
- `TasksService` for planner data.
- `AprendizajeService` and `PracticaService` for study/practice modules.

## Quality coverage

Relevant specs:

- `features/student/tasks/tasks.spec.ts`
- `features/student/tasks/tasks.service.spec.ts`
- `features/student/tutorias/tutorias.service.spec.ts`
- `core/ia/ia-profile-status.service.spec.ts`

## Extension rules

- Put student-only screens under `features/student`.
- Put cross-role learning/practice code under shared feature folders (`features/aprendizaje`, `features/practica`).
- Use `shared/ui` controls for buttons, selects, modals, pickers and tabs.
- Keep route entries synchronized with `student.routes.ts` and `nav-items.ts`.
