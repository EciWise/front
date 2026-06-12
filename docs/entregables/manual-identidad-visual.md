# Manual de identidad visual

## Propósito

Este manual resume cómo debe verse ECIWISE+ en interfaces, piezas de comunicación y presentaciones. Está pensado para mantener consistencia visual al crear diapositivas, piezas de lanzamiento, capturas del producto y material institucional.

## Idea visual central

ECIWISE+ combina tres atributos:

- Institucional: confianza, rigor académico y respaldo de la Escuela.
- Humano: acompañamiento, comunidad, tutores y colaboración.
- Inteligente: IA aplicada a aprendizaje, alertas, predicciones y apoyo personalizado.

La identidad debe sentirse sobria, clara y tecnológica, sin perder cercanía estudiantil.

## Logo

El sistema visual usa la marca `ECIWISE+`.

Componentes:

- Wordmark: `ECIWISE+`.
- Signo plus: representa valor agregado, acompañamiento y mejora continua.
- Rojo institucional: se usa como color de acción y reconocimiento.

Uso recomendado:

- Mantener el logo sobre fondos de alto contraste.
- Usar versiones con texto completo en portadas y cierres.
- Usar isotipo o marca reducida solo cuando el espacio sea limitado.
- No deformar, rotar, aplicar sombras decorativas ni cambiar proporciones.

## Paleta principal

La paleta actual sale de `src/styles.css`.

| Token | Hex | Uso |
| --- | --- | --- |
| `--brand-black` | `#08080a` | Texto fuerte, fondos institucionales, contraste |
| `--brand-red` | `#c8102e` | Marca, acciones primarias, puntos de énfasis |
| `--brand-red-dark` | `#99000d` | Hover, estados activos, fondos intensos |
| `--brand-red-soft` | `#e23a52` | Acento en tema oscuro y elementos destacados |
| `--surface` | Variable por tema | Superficie principal |
| `--surface-2` | Variable por tema | Fondo secundario |
| `--text` | Variable por tema | Texto principal |
| `--text-muted` | Variable por tema | Texto de apoyo |

## Paleta por rol

| Rol | Token | Hex | Intención |
| --- | --- | --- | --- |
| Estudiante | `--accent-student` | `#9a0d0d` | Progreso, foco académico, energia |
| Tutor | `--accent-tutor` | `#c8102e` | Guía, acompañamiento, acción |
| Admin | `--accent-admin` | `#5a2a82` | Gestión, analítica, supervisión |

## Estados

| Estado | Token | Hex | Uso |
| --- | --- | --- | --- |
| Éxito | `--success` | `#1b873f` | Confirmaciones, completado |
| Advertencia | `--warning` | `#b45309` | Riesgos, pendientes, atención |
| Error | `--danger` | `#c8102e` | Fallos, bloqueo, acción critica |
| Información | `--info` | `#1d4ed8` | Mensajes neutros, datos, ayuda |

## Tipografía

El producto define:

- `--font-sans`: Inter y fallbacks del sistema para lectura general.
- `--font-field`: Nunito y fuentes redondeadas para campos, controles y una sensación más amable.

Uso en presentaciones:

- Títulos: Inter, Segoe UI o una sans institucional de peso 700/800.
- Cuerpo: Inter, Segoe UI o Aptos, peso 400/500.
- Evitar tipografias decorativas, infantiles o excesivamente informales.

## Forma y composición

Rasgos visuales:

- Radios moderados: tarjetas de 8 a 16 px.
- Sombras suaves para separar capas, no para decorar.
- Espaciado basado en múltiples de 4 y 8.
- Fondos claros con superficies blancas o fondos oscuros sobrios.
- Acento rojo solo para acciones o puntos clave.

Tokens:

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-sm` | `0.375rem` | Chips, indicadores pequeños |
| `--radius-md` | `0.625rem` | Inputs, botones, selects |
| `--radius-lg` | `1rem` | Cards, modales, paneles |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.08)` | Separación sutil |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.12)` | Hover o panel elevado |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,0.18)` | Modales y overlays |

## Imagen y recursos gráficos

Usar:

- Capturas reales del producto.
- Diagramas simples con flujos por rol.
- Iconos lineales consistentes.
- Gráficos claros para datos de adopción, uso y retención.

Evitar:

- Ilustraciones genéricas que no muestren el producto.
- Iconos de estilos mezclados.
- Fondos saturados que compitan con el contenido.
- Gradientes decorativos sin función.

## Reglas para presentaciones

Estructura sugerida:

1. Portada: logo, frase corta y contexto académico.
2. Problema: dispersión de herramientas, baja visibilidad del progreso, dificultad para pedir apoyo.
3. Solución: ECIWISE+ como plataforma unificada.
4. Producto: capturas por rol.
5. Arquitectura: frontend, servicios, datos.
6. Valor: estudiantes, tutores, administradores.
7. Estrategia: adopción, marketing y escalamiento.
8. Cierre: impacto esperado y siguiente paso.

Recomendaciones visuales:

- Una idea por diapositiva.
- Título corto, máximo dos lineas.
- Usar rojo para una sola acción o dato clave por slide.
- Mantener margenes amplios.
- Usar tablas solo cuando haya comparación clara.
- Preferir screenshots limpios antes que mockups inventados.

## Dos and donts

| Hacer | Evitar |
| --- | --- |
| Usar `#c8102e` para CTA y énfasis | Usar rojo en todo el layout |
| Mostrar producto real | Usar imagenes genéricas de estudiantes sin contexto |
| Mantener contraste alto | Texto gris claro sobre fondo claro |
| Usar iconos consistentes | Mezclar emojis con iconos SVG |
| Explicar impacto académico | Centrar el discurso solo en tecnología |

