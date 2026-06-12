# Testing

The frontend uses Angular's unit-test builder on Vitest plus Playwright for end-to-end checks. Tests should scale with risk: shared services, guards, interceptors, forms and shared UI require stronger coverage than static markup.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint over the project |
| `npm run lint:ci` | Lint ratchet used by hooks/CI |
| `npm run test:ci` | All tests once, no watch |
| `npm run test:unit` | Unit specs by include pattern |
| `npm run test:integration` | Integration specs by include pattern |
| `npm run test:coverage` | Coverage run |
| `npm run e2e` | Playwright tests |
| `npm run build` | SSR production build |
| `npm run docs:build` | Documentation build |

## What to test

| Change type | Expected coverage |
| --- | --- |
| Guard or interceptor | Unit test around allowed/blocked paths and side effects |
| Domain service | HTTP URL, method, payload, mapping and failure behavior |
| Shared UI component | Inputs, outputs, keyboard behavior, disabled state and positioning |
| Form helper | Validation, payload conversion and edge cases |
| Feature screen | User-visible state, delegation to services and critical interactions |
| Route/shell behavior | Smoke or e2e coverage when navigation or layout changes |

## Existing high-value specs

- Auth: session restore, token expiry, profile updates and guards.
- HTTP: token attachment only for first-party hosts and normalized errors.
- Chat: REST, realtime, permissions, typing, reactions, moderation and UI.
- Tutorships: capacity, overlap, reservation lifecycle and ratings.
- Tasks: CRUD, agenda, recurrence, filters, statistics and UI actions.
- Learning/practice: study queue, review flow, quiz sessions and service endpoints.
- Shared UI: select, modal, date/time pickers, password input, tooltip, button.

## E2E coverage

`e2e/auth-shell.spec.ts` currently covers:

- Login and registration rendering without backend.
- Mobile registration scroll behavior.
- Language menu and notification viewport behavior.
- IA tooltips alignment.
- Registration payload and redirect flow with mocked backend.

Add e2e tests for critical route-level regressions that cannot be trusted to unit tests alone.

## Test hygiene

- Prefer focused tests over broad snapshots.
- Mock domain services at component boundaries.
- Verify HTTP calls with expected URL, method and payload.
- Keep translated text assertions stable by using keys or semantic selectors where possible.
- Use deterministic utilities for random/visual effects.
- Run the narrow test first, then the broad command before handoff.
