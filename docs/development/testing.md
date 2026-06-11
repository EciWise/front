# Pruebas

## Scripts

```powershell
npm run lint
npm run test:ci
npm run test:unit
npm run test:integration
npm run test:coverage
npm run e2e
```

## Unitarias

Los specs viven junto al codigo:

```text
feature.service.ts
feature.service.spec.ts
component.ts
component.spec.ts
```

## Integracion

Los specs de integracion usan sufijo:

```text
*.integration.spec.ts
```

## E2E

Playwright esta configurado en `playwright.config.ts` y los tests estan en `e2e/`.

## Cobertura relevante

Areas con cobertura destacada:

- Auth service, guards e interceptor.
- i18n y language switch.
- A11y y theme.
- UI compartida: button, select, modal, date/time picker, tabs, tooltip.
- Chat services y componentes.
- Tareas.
- Aprendizaje.
- Reglas de negocio de tutorias mockeadas en `tutoring.service.spec.ts`.

## Criterios para agregar pruebas

Agregar pruebas cuando:

- Se modifique una regla de negocio.
- Se agregue un servicio HTTP.
- Se cambie un guard o interceptor.
- Se toque un componente compartido.
- Se cambie un flujo de formulario.
- Se conecte un backend real a una vista actualmente mockeada.
