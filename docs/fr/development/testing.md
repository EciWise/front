# Tests

Use lint, unit, integration, coverage and e2e scripts before delivery.

## Ce que couvre cette page

- Use lint, unit, integration, coverage and e2e scripts before delivery.
- Add tests when changing business rules, guards, interceptors, shared UI or forms.
- Tutorship business rules are covered in tutoring.service.spec.ts.

## Fichiers principaux

- `*.spec.ts`
- `e2e`
- `playwright.config.ts`

## Notes d implementation

- Limiter les changements au domaine et reutiliser les composants UI partages avant de creer de nouveaux controles.
- Les textes visibles de l application vont dans les traductions; les textes de documentation restent dans Markdown.
