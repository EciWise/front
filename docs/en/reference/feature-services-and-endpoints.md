# Feature services and endpoints

This page summarizes the frontend-facing API contracts. Exact backend DTOs live in service/model files and should be treated as authoritative.

## Auth and users

Base: `AUTH_CONFIG.apiBaseUrl`

| Service | Capabilities |
| --- | --- |
| `AuthService` | Login, register, forced password change, profile update |
| `UserAdminService` | User list, CSV upload, role change, status change |
| `UsersDirectoryService` | Search users for chat conversations |

Admin user endpoints include `gestion-usuarios` paths based on current tests.

## IA

Base: `AUTH_CONFIG.apiBaseUrl`

| Service | Capabilities |
| --- | --- |
| `IaDataService` | Get/save current user's IA data and prediction result |
| `IaAdminService` | Load admin statistics, student data and predictions |
| `IaProfileStatusService` | Merge session/backend IA data and check completeness |

## Learning

Base: `${STUDY_CONFIG.studyApiUrl}/api`

| Area | Endpoint pattern |
| --- | --- |
| Collections | `/collections`, `/collections/{id}` |
| Favorites | `/collections/{id}/favorite` |
| Flashcards | `/collections/{collectionId}/flashcards`, `/flashcards/{id}` |
| Study | `/collections/{collectionId}/study` |
| Reviews | `/flashcards/{flashcardId}/review`, `/reviews/me` |
| Usage | `/usage/me` |

## Practice

Base: `${STUDY_CONFIG.studyApiUrl}/api`

| Area | Endpoint pattern |
| --- | --- |
| Subjects | `/subjects`, `/subjects/{id}` |
| Questions | `/questions`, `/questions/{id}`, `/questions/{id}/stats` |
| Collections | `/question-collections`, `/question-collections/{id}` |
| Sessions | `/quiz/sessions`, `/quiz/sessions/{sessionId}` |
| Answers | `/quiz/sessions/{sessionId}/answers` |
| Finish | `/quiz/sessions/{sessionId}/finish` |
| History | `/quiz/history` |
| Leaderboard | `/quiz/survival/leaderboard` |

## Chat

Base REST: `${TALK_CONFIG.talkApiUrl}/api/v1`

Realtime: `TALK_CONFIG.talkWsUrl`

Capabilities:

- Conversations.
- Messages.
- Attachments.
- Read state.
- Reactions.
- Typing events.
- Pin/edit/delete/moderation.
- Censored words.
- Personal notifications.

## Tasks

Base: `${TODO_CONFIG.todoApiUrl}/api`

| Area | Endpoint pattern |
| --- | --- |
| Tasks | `/tasks`, `/tasks/{id}` |
| Status | `/tasks/{id}/status` |
| Schedule | `/tasks/{id}/schedule` |
| Search | `/tasks/search` |
| Agenda | `/tasks/agenda` |
| Lists | `/tasks/overdue`, `/tasks/today` |
| Aux data | `/categories`, `/achievements`, `/stats` |

## Tutorships

Current persistence is local in `TutoringMockService`. Keep these service-level rules documented and tested before replacing with HTTP:

- Assigned-subject validation.
- Availability overlap checks.
- Capacity checks.
- Reservation status transitions.
- Cancellation/rescheduling rules.
- Rating constraints.
