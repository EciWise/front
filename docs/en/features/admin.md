# Administration

The admin area is mounted at `/admin`, uses the shared app shell, and provides tools for user management, institutional statistics, predictions, tutor assignments, learning and practice administration.

## Route map

| Route | Screen | Purpose |
| --- | --- | --- |
| `/admin` | Admin dashboard | Administrative summary |
| `/admin/users` | Users | User list, role/status updates and CSV import |
| `/admin/estadisticas` | Statistics | IA and tutorship metrics |
| `/admin/predicciones` | Predictions | Student prediction screen |
| `/admin/asignaciones` | Assignments | Tutor/student assignment flow |
| `/admin/aprendizaje` | Learning | Cross-role learning module |
| `/admin/practica` | Practice | Practice administration |

## User management

`UserAdminService` consumes `AUTH_CONFIG.apiBaseUrl` and handles:

- User listing.
- CSV bulk upload.
- Role changes.
- Active/inactive status changes.

`AdminUsersComponent` uses tabs for user list/import and delegates CSV result display to `BulkResultDialogComponent`.

## Statistics

`AdminStatisticsComponent` combines:

- IA admin metrics from `IaAdminService`.
- Tutorship statistics from `TutoringMockService`.
- Translated labels through `TranslateService`.
- Shared chart components for visual summaries.

## Predictions

The predictions route reuses `StudentsPredictionsComponent` from `features/ia/students-predictions`. It relies on IA/admin services and should remain role-aware through routing rather than duplicated screens.

## Assignments

Assignments support tutor/student relationship workflows. Keep assignment contracts separate from user management contracts.

## Practice administration

Admin uses the cross-role `PracticaComponent`, which exposes administration views for subjects, questions and question collections when the role permits it.

## Quality coverage

Relevant specs:

- `features/admin/users/users.spec.ts`
- `features/admin/user-admin.service.spec.ts`
- `features/admin/bulk-result-dialog/bulk-result-dialog.spec.ts`
- `features/practica/practica.service.spec.ts`

## Extension rules

- Treat admin operations as high-impact: add tests around role/status changes and bulk imports.
- Keep CSV result UX explicit: created users, errors, generated passwords and copy actions.
- Use `AUTH_CONFIG` for user/admin backend calls.
- Do not embed IA prediction logic in admin components; keep it in IA services/screens.
