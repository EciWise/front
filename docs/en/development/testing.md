# Testing

Use lint, unit, integration, coverage and e2e scripts before delivery.

## What this page covers

- Use lint, unit, integration, coverage and e2e scripts before delivery.
- Add tests when changing business rules, guards, interceptors, shared UI or forms.
- Tutorship business rules are covered in tutoring.service.spec.ts.

## Main files

- `*.spec.ts`
- `e2e`
- `playwright.config.ts`

## Implementation notes

- Keep changes scoped to the domain and reuse shared UI components before creating new controls.
- Visible UI text belongs in the app translation files; documentation text belongs in VitePress markdown.
