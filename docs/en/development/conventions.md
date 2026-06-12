# Development conventions

These conventions keep the frontend consistent with the current Angular architecture and reduce regressions across role-based screens.

## Component rules

Use by default:

- Standalone components.
- `ChangeDetectionStrategy.OnPush`.
- `inject()` for dependencies.
- Signals and computed values for local UI state.
- Modern Angular control flow in templates.
- Separate HTML/CSS files for screens with non-trivial markup.

Avoid:

- Direct `HttpClient` calls from screens.
- Business rules embedded in templates.
- New UI primitives when a shared `eci-*` component already exists.
- Visible strings outside translation files.
- Browser globals without SSR guards.

## Service rules

Domain services should:

- Own endpoint construction and DTO mapping.
- Inject configuration tokens instead of reading `.env` directly.
- Expose a stable API to components.
- Normalize errors or let interceptors normalize them consistently.
- Keep state in signals only when the state is shared across components.

## Styling rules

- Use tokens from `src/styles.css`.
- Prefer existing shared CSS utilities in `src/app/shared/styles`.
- Avoid raw hex values in feature CSS unless a new token is being introduced.
- Preserve light, dark and accessibility modes.
- Keep layout responsive with stable dimensions and no horizontal scroll.

## Form rules

- Use visible labels.
- Show field-level errors close to the field.
- Disable submit actions while saving.
- Mark required fields clearly.
- Use `role="alert"` or `aria-live` for important async feedback.
- Build payloads in helpers when form data needs conversion.

## Translation rules

- Add keys to all supported app languages: `es`, `en`, `fr`, `pt`, `de`.
- Prefer domain namespacing, for example `tasks.*`, `profile.*`, `chat.*`.
- Do not concatenate translated fragments when grammar may vary by language.
- Use `TranslatePipe` in templates and `TranslateService` in TypeScript.

## Git and PR rules

Before opening a PR:

```powershell
npm run lint
npm run test:ci
npm run build
```

If documentation changed:

```powershell
npm run docs:build
```

If a critical user journey changed:

```powershell
npm run e2e
```

The PR description should state the changed domain, user impact, tests run and remaining risks.
