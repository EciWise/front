# Sistema UI

## Tokens globales

`src/styles.css` define los tokens de marca, superficies, texto, estados, espaciado, radios, sombras y transiciones.

Los componentes deben usar variables globales en vez de colores o espacios hardcodeados.

### Tipografía de marca

- `--font-sans` (**Inter**): cuerpo, títulos y chrome general. Se importa junto a Nunito.
- `--font-field` (**Nunito**): controles de formulario (inputs, selects, pickers).

Ambas familias se cargan desde un único `@import` de Google Fonts con `display=swap`.

### Acentos por rol

Cada comunidad tiene un acento propio, distinguible entre sí y accesible (AA) sobre superficies claras. `app-shell` mapea `data-role` → `--accent`:

| Rol | Token | Valor |
| --- | --- | --- |
| Estudiante | `--accent-student` | `#c2185b` (fucsia) |
| Tutor | `--accent-tutor` | `#c8102e` (rojo institucional) |
| Admin | `--accent-admin` | `#5a2a82` (púrpura) |

### Superficie pública (landing + auth)

El fondo rojo→vinotinto del tema claro vive en un solo token, `--public-surface`, compartido por `.landing` y `.auth` para que nunca se desincronicen. El vinotinto de marca (logo, iconos, chips sobre el rojo) es `--brand-wine`; la sombra de las tarjetas blancas, `--public-card-shadow`.

### Continuidad de marca en el panel

Para enlazar la entrada inmersiva (landing/auth) con la app autenticada **sin** restar
legibilidad ni densidad, el panel usa un lenguaje sutil:

- `--app-ambient`: glow radial muy tenue (por tema y rol) que el `app-shell` pinta tras
  `--surface-2` en su `:host`. En modo a11y se anula (`--app-ambient: none`).
- El acento de rol se hace más presente: subrayado bajo `eci-page-header`, icono del header en
  `var(--accent)`, franja izquierda en las stat-cards del tutor y en el ítem activo del menú.
- Glass ligero (`backdrop-filter`, dentro de `@supports`) solo en chrome clave (stat-cards), nunca
  en tarjetas de datos (que siguen sólidas vía `card-surface.css`).

El fondo 3D (`eci-space-background`, three.js) queda **solo** en las pantallas públicas.

### Espaciado y capas (z-index)

- Escala de espaciado: `--space-0_5`, `--space-1`, `--space-1_5`, `--space-2`, `--space-3`,
  `--space-4`, `--space-5`, `--space-6`, `--space-8`. (`--space-5` faltaba pese a usarse en el fade
  de `.eci-fit__body` y varios gaps.)
- Escala de z-index única (evita colisiones tipo menú-de-chat vs modal): `--z-base`, `--z-sticky`,
  `--z-nav-scrim`, `--z-nav`, `--z-fab`, `--z-header`, `--z-dropdown`, `--z-overlay`, `--z-modal`,
  `--z-popover`, `--z-toast`, `--z-tooltip`. Usar siempre el token, no números mágicos.

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

- Todo botón de icono necesita `aria-label` traducido.
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
| `eci-select` | Desplegables con opciones controladas por página |
| `eci-modal` | Diálogos y formularios secundarios |
| `eci-icon` | Iconografía Lucide centralizada |
| `eci-date-picker` | Fechas cuando se requiere picker custom |
| `eci-time-picker` | Horas cuando se requiere picker custom |
| `eci-pie-chart` | Gráficos de torta |
| `eci-histogram` | Histogramas |

## `eci-select`

El componente recibe opciones explícitas:

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

No debe depender de opciones por defecto compartidas. Cada página define su catálogo.
