# Tests

Use lint, unit, integration, coverage and e2e scripts before delivery.

## Was diese Seite abdeckt

- Use lint, unit, integration, coverage and e2e scripts before delivery.
- Add tests when changing business rules, guards, interceptors, shared UI or forms.
- Tutorship business rules are covered in tutoring.service.spec.ts.

## Wichtige Dateien

- `*.spec.ts`
- `e2e`
- `playwright.config.ts`

## Implementierungshinweise

- Aenderungen auf die Domaene begrenzen und gemeinsame UI-Komponenten wiederverwenden, bevor neue Controls entstehen.
- Sichtbare App-Texte gehoeren in die Uebersetzungen; Dokumentationstexte bleiben in Markdown.
