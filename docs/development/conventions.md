# Convenciones de desarrollo

## Angular

- Componentes standalone.
- `ChangeDetectionStrategy.OnPush` en componentes nuevos.
- Preferir `inject()` sobre constructores.
- Preferir `signal()` y `computed()` para estado local nuevo.
- Usar control flow moderno: `@if`, `@for`, `@switch`.
- Evitar `ngClass` y `ngStyle`; usar bindings directos.

## Archivos

Para componentes de pantalla nuevos:

```text
feature-name/
  feature-name.ts
  feature-name.html
  feature-name.css
```

Para servicios:

```text
feature-name.service.ts
feature-name.service.spec.ts
```

## Textos visibles

No hardcodear texto visible en HTML o TypeScript.

Usar:

```html
{{ 'clave.ruta' | translate }}
```

Para atributos:

```html
[placeholder]="'tasks.placeholder' | translate"
[attr.aria-label]="'common.close' | translate"
```

## UI

- Reutilizar `eci-button`, `eci-card`, `eci-page-header`, `eci-section-tabs`, `eci-select`, `eci-modal`.
- Usar iconos desde `eci-icon`.
- Mantener pantallas funcionales, no landing, dentro de áreas autenticadas.
- Mobile first.
- Evitar cards dentro de cards.
- Respetar tema claro, oscuro y modo accesibilidad.

## Estilos

Consumir tokens de `src/styles.css`:

- `--surface`
- `--surface-2`
- `--surface-3`
- `--text`
- `--text-muted`
- `--border`
- `--accent`
- `--brand-red`
- `--radius-*`
- `--space-*`
- `--shadow-*`
- `--transition-*`

## Git y cambios

- Mantener cambios acotados al dominio.
- No hacer refactors grandes durante una tarea funcional.
- No revertir cambios ajenos.
- Agregar pruebas según riesgo.

