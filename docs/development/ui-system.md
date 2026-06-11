# Sistema UI

## Tokens globales

`src/styles.css` define los tokens de marca, superficies, texto, estados, espaciado, radios, sombras y transiciones.

Los componentes deben usar variables globales en vez de colores o espacios hardcodeados.

## Tema

El tema se controla por atributo:

```html
<html data-theme="light">
<html data-theme="dark">
```

`ThemeService` inicializa y persiste la preferencia.

## Accesibilidad

`A11yService` activa una clase global `a11y-mode` que incrementa contraste, bordes y foco.

Reglas:

- Todo boton de icono necesita `aria-label` traducido.
- Mantener foco visible.
- Usar HTML semantico.
- Respetar `prefers-reduced-motion`.

## Componentes compartidos

| Componente | Uso |
| --- | --- |
| `eci-button` | Acciones primarias, secundarias y ghost |
| `eci-card` | Items repetidos, paneles y contenedores funcionales |
| `eci-page-header` | Encabezado de pantalla |
| `eci-section-tabs` | Secciones dentro de una pantalla funcional |
| `eci-select` | Desplegables con opciones controladas por pagina |
| `eci-modal` | Dialogos y formularios secundarios |
| `eci-icon` | Iconografia Lucide centralizada |
| `eci-date-picker` | Fechas cuando se requiere picker custom |
| `eci-time-picker` | Horas cuando se requiere picker custom |
| `eci-pie-chart` | Graficos de torta |
| `eci-histogram` | Histogramas |

## `eci-select`

El componente recibe opciones explicitas:

```ts
readonly options: readonly SelectOption[] = [
  { value: 'virtual', labelKey: 'tutoring.modes.virtual' },
  { value: 'presential', labelKey: 'tutoring.modes.presential' },
];
```

```html
<eci-select
  [value]="model().mode"
  [options]="options"
  [ariaLabel]="'tutorias.fields.mode' | translate"
  (valueChange)="setMode($event)"
/>
```

No debe depender de opciones por defecto compartidas. Cada pagina define su catalogo.

