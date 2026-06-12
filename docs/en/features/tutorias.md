# Tutorships

Tutorships connect students and tutors through availability, reservation, scheduling, attendance, history, ratings and statistics. The current implementation is powered by `TutoringMockService` until a dedicated backend facade replaces it.

## Domain owner

| Area | Files |
| --- | --- |
| Student reservation UI | `src/app/features/student/tutorias` |
| Tutor workflows | `src/app/features/tutor/*` |
| Domain service | `src/app/features/tutor/tutoring.service.ts` |
| Domain models | `src/app/features/tutor/tutor.models.ts` and `student/tutorias/tutoria.model.ts` |

## Student flow

The student tutorship screen supports:

- Subject and tutor discovery.
- Mode selection.
- Slot availability.
- Reservation requests.
- Rescheduling.
- Cancellation.
- Rating completed sessions.

The student facade `TutoriasService` delegates to `TutoringMockService`.

## Tutor flow

Tutor screens support:

- Publishing availability.
- Reviewing reservation requests.
- Accepting/rejecting requests.
- Managing schedule.
- Recording attendance and observations.
- Tracking history and reputation.

Tutor-specific helper services (`schedule.service.ts`, `availability.service.ts`, `requests.service.ts`, `history.service.ts`) transform domain data for screens.

## Business rules

The mock service enforces rules that should be preserved when the backend is introduced:

- Tutors can only publish availability for assigned subjects.
- Availability cannot overlap for the same tutor.
- Reservations require available capacity.
- Student reservations cannot overlap.
- Cancel/reschedule operations depend on session status.
- Ratings apply only to completed tutorships and cannot be duplicated by the same student.

## Replacement strategy

When a real backend is added:

1. Keep the public service contract used by screens stable.
2. Replace mock storage with HTTP calls behind a tutorship API service.
3. Preserve current validation in tests, even if validation moves server-side.
4. Keep optimistic UI changes explicit and reversible.
5. Update docs, route-level smoke tests and service specs.

## Quality coverage

Relevant specs:

- `features/tutor/tutoring.service.spec.ts`
- `features/student/tutorias/tutorias.service.spec.ts`
- `features/tutor/requests.service.spec.ts`

## Extension rules

- Do not duplicate tutorship rules in components.
- Add new status values to models first.
- Update both student and tutor views when changing reservation lifecycle.
- Keep labels translated and selects owned by each page.
