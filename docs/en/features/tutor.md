# Tutor area

The tutor area is mounted at `/tutor`, uses the shared app shell, and exposes operational tools for tutoring management.

## Route map

| Route | Screen | Purpose |
| --- | --- | --- |
| `/tutor` | Tutor dashboard | Summary of tutor activity |
| `/tutor/estudiantes` | Students/predictions | Student prediction view reused from IA |
| `/tutor/schedule` | Schedule | Upcoming sessions, attendance and observations |
| `/tutor/availability` | Availability | Create/edit/cancel availability slots |
| `/tutor/requests` | Requests | Accept or reject pending requests |
| `/tutor/history` | History | Completed and cancelled session history |
| `/tutor/aprendizaje` | Learning | Cross-role flashcard module |
| `/tutor/practica` | Practice | Cross-role quiz module |

## Dashboard

`TutorDashboardComponent` summarizes active tutor work and links into the operational screens. It should remain lightweight and delegate detail to route screens.

## Schedule

The schedule screen manages:

- Upcoming confirmed sessions.
- Attendance.
- Observations.
- Student participation.
- Modal flows for observation and participation updates.

Schedule helper logic lives in `schedule.service.ts`.

## Availability

The availability screen manages:

- Slot creation.
- Slot editing.
- Capacity.
- Subject assignment checks.
- Cancellation flows.
- Time/date inputs through shared pickers/selects.

Validation should remain service-driven so UI and tests share the same business rules.

## Requests and history

Requests process pending reservations and write outcomes into history. History presents completed/cancelled flows for review.

## Shared dependencies

- `TutoringMockService` for domain state.
- `TutorScheduleService`, `TutorAvailabilityService`, `TutoringRequestsService` and `TutorHistoryService` for screen-specific projections.
- `StudentsPredictionsComponent` for assigned-student/prediction style views.
- `AprendizajeComponent` and `PracticaComponent` for cross-role learning tools.

## Quality coverage

Relevant specs:

- `features/tutor/tutoring.service.spec.ts`
- `features/tutor/requests.service.spec.ts`

## Extension rules

- Keep tutor business rules outside templates.
- Keep tutor routes synchronized with `TUTOR_ROUTES` and `TUTOR_NAV`.
- Reuse cross-role modules instead of duplicating learning or practice UI.
- Add tests when changing request, schedule or availability lifecycle rules.
