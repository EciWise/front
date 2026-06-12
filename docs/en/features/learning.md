# Learning and practice

Learning and practice are cross-role modules. Students, tutors and administrators access them from their own sidebars, but the implementation lives in shared feature folders.

## Learning module

Main files:

- `src/app/features/aprendizaje/aprendizaje.ts`
- `src/app/features/aprendizaje/aprendizaje.service.ts`
- `src/app/features/aprendizaje/study.models.ts`
- `src/app/features/aprendizaje/collections`
- `src/app/features/aprendizaje/study`
- `src/app/features/aprendizaje/stats`

`AprendizajeService` builds endpoints from `STUDY_CONFIG.studyApiUrl` with `/api` appended.

## Learning capabilities

| Capability | Endpoint pattern |
| --- | --- |
| Collections | `/collections` |
| Favorite collections | `/collections/{id}/favorite` |
| Flashcards | `/collections/{collectionId}/flashcards`, `/flashcards/{id}` |
| Study queue | `/collections/{collectionId}/study` |
| Review answers | `/flashcards/{flashcardId}/review` |
| Review summary | `/reviews/me` |
| Usage summary | `/usage/me` |

## Study session behavior

The study session:

- Lists favorite collections.
- Loads a study queue for the selected collection.
- Reveals card answers progressively.
- Submits review quality.
- Advances until the queue is complete.
- Handles drag gestures for review decisions.
- Keeps failure states recoverable.

## Practice module

Main files:

- `src/app/features/practica/practica.ts`
- `src/app/features/practica/practica.service.ts`
- `src/app/features/practica/practica.models.ts`
- `src/app/features/practica/subjects`
- `src/app/features/practica/questions`
- `src/app/features/practica/collections`
- `src/app/features/practica/play`
- `src/app/features/practica/history`
- `src/app/features/practica/leaderboard`

`PracticaService` also uses `STUDY_CONFIG.studyApiUrl` with `/api`.

## Practice capabilities

| Capability | Endpoint pattern |
| --- | --- |
| Subjects | `/subjects` |
| Questions | `/questions`, `/questions/{id}` |
| Question statistics | `/questions/{id}/stats` |
| Question collections | `/question-collections` |
| Quiz sessions | `/quiz/sessions` |
| Answers | `/quiz/sessions/{sessionId}/answers` |
| Finish session | `/quiz/sessions/{sessionId}/finish` |
| History | `/quiz/history` |
| Survival leaderboard | `/quiz/survival/leaderboard` |

## Role behavior

- Students use practice primarily to play quizzes and review history/leaderboard.
- Tutors can access learning/practice as support tools.
- Admins can manage subjects, questions and collections when administration screens are exposed.

## Quality coverage

Relevant specs:

- `features/aprendizaje/aprendizaje.service.spec.ts`
- `features/aprendizaje/study/study-session.spec.ts`
- `features/practica/practica.service.spec.ts`

## Extension rules

- Update models before templates when backend contracts change.
- Keep learning and practice services independent, even though both use `STUDY_CONFIG`.
- Add tests for endpoint changes and study/quiz state transitions.
- Keep role-specific visibility in the shell/routing layer, not in duplicated modules.
