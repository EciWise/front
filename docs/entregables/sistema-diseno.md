# Sistema de diseño

## Objetivo

El sistema de diseño de ECIWISE+ define reglas visuales y de interacción para construir pantallas consistentes, accesibles y mantenibles. El punto de verdad técnico está en `src/styles.css` y en los componentes compartidos de `src/app/shared/ui`.

## Principios

- Claridad antes que decoración.
- Accesibilidad por defecto.
- Coherencia entre roles.
- Componentes reutilizables antes que estilos aislados.
- Tokens globales antes que valores hardcodeados.
- Movimiento breve, funcional y respetuoso de `prefers-reduced-motion`.

## Tokens de color

### Marca

| Token | Valor | Uso |
| --- | --- | --- |
| `--brand-black` | `#08080a` | Marca, fondos sobrios, texto fuerte |
| `--brand-red` | `#c8102e` | Acciones primarias, logo, énfasis |
| `--brand-red-dark` | `#99000d` | Hover, estados activos |
| `--brand-red-soft` | `#e23a52` | Acento en tema oscuro |

### Temas

Tema claro:

| Token | Valor |
| --- | --- |
| `--surface` | `#ffffff` |
| `--surface-2` | `#f4f4f6` |
| `--surface-3` | `#e9e9ee` |
| `--text` | `#18181b` |
| `--text-muted` | `#5b5b66` |
| `--border` | `#d9d9e0` |

Tema oscuro:

| Token | Valor |
| --- | --- |
| `--surface` | `#16161a` |
| `--surface-2` | `#1e1e24` |
| `--surface-3` | `#2a2a32` |
| `--text` | `#f2f2f5` |
| `--text-muted` | `#a1a1ad` |
| `--border` | `#33333d` |

### Estados

| Token | Valor | Uso |
| --- | --- | --- |
| `--success` | `#1b873f` | Éxito |
| `--warning` | `#b45309` | Advertencia |
| `--danger` | `#c8102e` | Error |
| `--info` | `#1d4ed8` | Información |

## Tipografía

| Token | Uso |
| --- | --- |
| `--font-sans` | Lectura general, textos largos, headings |
| `--font-field` | Inputs, controles, labels y UI compacta |

Reglas:

- Body mínimo 16 px.
- Line-height entre 1.5 y 1.75 para contenido.
- Títulos con peso 700 u 800.
- Labels con peso 600 o 700.
- No usar letter-spacing negativo.

## Espaciado

| Token | Valor |
| --- | --- |
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-6` | `1.5rem` |
| `--space-8` | `2rem` |

Reglas:

- Usar escala 4/8 para padding y gaps.
- Separar secciones con `--space-6` o `--space-8`.
- Evitar margenes arbitrarios por pantalla.
- En mobile, priorizar densidad clara y scroll vertical.

## Radios, sombras y movimiento

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-sm` | `0.375rem` | Chips, elementos pequeños |
| `--radius-md` | `0.625rem` | Inputs, selects, botones |
| `--radius-lg` | `1rem` | Cards, modales, paneles |
| `--radius-full` | `9999px` | Pills, avatars, toggles |
| `--shadow-sm` | Sombra sutil | Cards base |
| `--shadow-md` | Sombra media | Hover, capas elevadas |
| `--shadow-lg` | Sombra alta | Modales, menus |
| `--transition-fast` | `120ms ease` | Hover, foco, microestado |
| `--transition-base` | `200ms ease` | Cambios de UI |

## Componentes base

| Componente | Patrón de uso |
| --- | --- |
| `eci-button` | Acciones. Variantes: `primary`, `secondary`, `ghost` |
| `eci-card` | Contenido agrupado y repetible |
| `eci-select` | Selección controlada, accesible y posicionada |
| `eci-modal` | Diálogos con cierre claro |
| `eci-section-tabs` | Cambio de vista dentro de una misma pantalla |
| `eci-page-header` | Título e icono de pantalla |
| `eci-icon` | Iconografía Lucide centralizada |
| `eci-avatar` | Identidad de usuario |
| `eci-tooltip` | Ayuda breve contextual |
| `eci-date-picker` / `eci-time-picker` | Selección de fecha/hora |

## Botones

Reglas:

- Una acción primaria visible por bloque.
- Usar `variant="secondary"` para acciones alternativas.
- Usar `variant="ghost"` para cancelar, limpiar o acciones menos prioritarias.
- Escuchar `(buttonClick)` en vez de `(click)` sobre el host.
- Botones deshabilitados deben usar `[disabled]`, no solo clase visual.

## Layout

Patrones:

- Shell autenticado con navegación lateral.
- Top bar persistente.
- Contenido principal con ancho contenido y scroll natural.
- Cards solo para unidades de información, no para envolver secciones completas sin necesidad.
- Grids responsive con `minmax` y `auto-fit` cuando haya colecciones.

Breakpoints de referencia:

| Viewport | Consideración |
| --- | --- |
| 375 px | Mobile pequeño, una columna |
| 768 px | Tablet, dos columnas si el contenido lo permite |
| 1024 px | Desktop pequeño, sidebar estable |
| 1440 px | Desktop amplio, controlar ancho de lectura |

## Accesibilidad

Checklist:

- Contraste mínimo 4.5:1 para texto normal.
- Foco visible en todos los controles.
- Labels persistentes para formularios.
- No comunicar estado solo por color.
- `aria-label` en botones de icono.
- `aria-live` para mensajes asíncronos importantes.
- Navegación por teclado completa.
- Respetar `prefers-reduced-motion`.

## Gráficos y datos

Reglas:

- Usar color con texto o leyenda, no color solo.
- Mostrar estado vacio cuando no hay datos.
- Mostrar estado de carga.
- Evitar pie charts con más de cinco categorías.
- Incluir resumen textual cuando el gráfico comunique una decisión.

## Antipatrones

- Crear una paleta nueva por feature.
- Usar sombras o gradientes solo decorativos.
- Meter cards dentro de cards.
- Crear controles custom si ya existe un `eci-*`.
- Usar textos en componentes sin pasar por i18n.
- Ocultar información critica detras de hover.

