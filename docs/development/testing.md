# Pruebas

El frontend ejecuta pruebas unitarias con el builder `@angular/build:unit-test`, que corre Vitest dentro del flujo de Angular. Los comandos del proyecto deben pasar por `ng test` para que Angular cargue `tsconfig.spec.json`, los globals de Vitest, `TestBed`, los componentes standalone y los reportes de cobertura configurados en `angular.json`.

## Scripts

| Comando | Uso |
| --- | --- |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm run test:ci` | Ejecuta todos los specs una vez, sin modo watch. |
| `npm run test:unit` | Ejecuta specs con patrón `src/**/*.unit.spec.ts`. |
| `npm run test:integration` | Ejecuta specs con patrón `src/**/*.integration.spec.ts`. |
| `npm run test:coverage` | Ejecuta pruebas con cobertura `lcov` y `text-summary`. |
| `npm run e2e` | Ejecuta pruebas end-to-end con Playwright. |

## Unitarias

Los specs viven junto al código. Los archivos `*.spec.ts` se ejecutan con `npm run test:ci`; usa `*.unit.spec.ts` cuando necesites que el spec entre también en el comando unitario acotado.

```text
feature.service.ts
feature.service.spec.ts
feature.service.unit.spec.ts
component.ts
component.spec.ts
```

Vitest está disponible por globals desde `tsconfig.spec.json`, así que los specs pueden usar `describe`, `it`, `expect`, `beforeEach` y utilidades como `vi.fn()` o `vi.spyOn()` sin imports adicionales. Para piezas Angular, conserva `TestBed` como punto de entrada de servicios, guards, interceptores, componentes standalone, pipes y formularios.

## Integración

Los specs de integración usan sufijo `*.integration.spec.ts` y deben cubrir flujos entre componentes, servicios y formularios cuando el comportamiento no queda protegido con una prueba unitaria simple.

```text
*.integration.spec.ts
```

## Vitest y Angular

- No agregues configuración paralela de Karma o Jasmine.
- Evita correr `vitest` directamente salvo para depuración puntual; el flujo soportado es `ng test` mediante los scripts de `package.json`.
- Usa `vi.mock`, `vi.spyOn`, `vi.useFakeTimers` y `vi.restoreAllMocks` cuando el spec necesite aislar dependencias o tiempo.
- Restaura mocks, timers y estado global en `afterEach` si el spec los modifica.
- Mantén los asserts sobre DOM con selectores semánticos o estado visible estable; evita acoplarlos a texto traducido cuando pueda cambiar.

## E2E

Playwright está configurado en `playwright.config.ts` y los tests están en `e2e/`.

## Cobertura relevante

Áreas con cobertura destacada:

- Auth service, guards e interceptor.
- i18n y language switch.
- A11y y theme.
- UI compartida: button, select, modal, date/time picker, tabs, tooltip.
- Chat services y componentes.
- Tareas.
- Aprendizaje.
- Reglas de negocio de tutorías mockeadas en `tutoring.service.spec.ts`.

## Criterios para agregar pruebas

Agregar pruebas cuando:

- Se modifique una regla de negocio.
- Se agregue un servicio HTTP.
- Se cambie un guard o interceptor.
- Se toque un componente compartido.
- Se cambie un flujo de formulario.
- Se conecte un backend real a una vista actualmente mockeada.
