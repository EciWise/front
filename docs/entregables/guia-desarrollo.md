# Guía de desarrollo

## Objetivo

Esta guía define cómo trabajar sobre ECIWISE+ Front sin romper la arquitectura existente. Aplica para cambios de UI, integraciones backend, formularios, servicios, pruebas y documentación.

## Preparación local

Requisitos:

- Node.js compatible con Angular 21.
- npm 11, según `packageManager`.
- Variables de entorno locales basadas en `.env.template`.

Instalación:

```powershell
npm install
```

Copiar configuración:

```powershell
Copy-Item .env.template .env
```

Levantar aplicación:

```powershell
npm start
```

Documentación:

```powershell
npm run docs:dev
```

## Flujo de trabajo recomendado

1. Actualizar la rama de trabajo desde `develop`.
2. Revisar el módulo afectado antes de editar.
3. Implementar cambios pequeños y enfocados.
4. Agregar o ajustar pruebas según riesgo.
5. Ejecutar lint, tests y build.
6. Revisar `git diff` antes de abrir PR.

## Convenciones de Angular

Usar por defecto:

- Componentes standalone.
- `ChangeDetectionStrategy.OnPush`.
- `inject()` para dependencias.
- `signal()` y `computed()` para estado local.
- Servicios inyectables para lógica de dominio.
- Lazy loading para rutas de feature.

Evitar:

- Componentes con demasiada lógica en template.
- `HttpClient` directo desde componentes de pantalla.
- Estilos hardcodeados que dupliquen tokens globales.
- Textos visibles sin traducción.
- Dependencias nuevas sin razón clara.

## Estructura por dominio

Cuando una funcionalidad crece, mantener esta separación:

```text
feature/
  feature.ts
  feature.html
  feature.css
  feature.service.ts
  feature.models.ts
  feature.spec.ts
```

Para componentes pequeños e internos se permite template inline si el patrón local ya lo usa. Para pantallas principales, preferir archivos separados.

## UI compartida

Antes de crear un componente visual nuevo, revisar `src/app/shared/ui`.

Componentes base:

| Componente | Uso |
| --- | --- |
| `eci-button` | Acciones primarias, secundarias y ghost |
| `eci-card` | Contenedores funcionales y elementos repetidos |
| `eci-select` | Selección controlada con opciones explícitas |
| `eci-modal` | Diálogos, confirmaciones y formularios secundarios |
| `eci-page-header` | Encabezados de pantalla |
| `eci-section-tabs` | Tabs de secciones internas |
| `eci-icon` | Iconografía centralizada |
| `eci-date-picker` | Selección de fechas |
| `eci-time-picker` | Selección de horas |

Reglas:

- Usar `buttonClick` en `eci-button` cuando se escucha la acción del botón.
- Los botones de icono deben tener `ariaLabel`.
- Mantener targets táctiles cómodos y foco visible.
- No usar iconos fuera del sistema centralizado si ya existe un nombre compatible.

## Estilos

Los estilos deben usar tokens de `src/styles.css`:

- Color: `--brand-red`, `--accent`, `--surface`, `--text`, `--border`.
- Espaciado: `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-6`, `--space-8`.
- Radios: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Movimiento: `--transition-fast`, `--transition-base`.

No introducir paletas por pantalla. Si se necesita un nuevo token, debe justificarse por uso transversal.

## i18n

Todo texto visible debe agregarse a `src/app/core/i18n/translations`.

Reglas:

- Usar keys estables por dominio.
- Evitar frases duplicadas con keys distintas.
- No concatenar traducciones con valores que puedan cambiar orden gramatical.
- En templates, usar `| translate`.
- En TypeScript, usar el servicio de traducción cuando el texto dependa de lógica.

## Formularios

Usar Reactive Forms o Signal Forms según el patrón del módulo.

Checklist:

- Labels visibles.
- Mensajes de error cerca del campo.
- `aria-live` o `role="alert"` para errores importantes.
- Botón de envío deshabilitado durante guardado.
- Validación en cliente solo como soporte, no como única barrera.
- Confirmación antes de acciones irreversibles.

## Servicios e integración backend

Los servicios deben:

- Recibir base URLs desde tokens de configuración.
- Normalizar URLs antes de construir endpoints.
- Encapsular DTOs y transformaciones.
- Devolver observables o signals según el patrón existente.
- Manejar errores de forma consistente.

No mezclar contratos de backend en componentes de UI.

## Pruebas

Comandos:

```powershell
npm run lint
npm run test:ci
npm run test:unit
npm run test:integration
npm run build
npm run e2e
```

Criterio práctico:

- Cambio de servicio: prueba unitaria del servicio.
- Cambio de formulario: prueba de validación y envío.
- Cambio de componente compartido: prueba del componente y al menos un caso de integración.
- Cambio de ruta o guard: prueba de acceso o smoke test.
- Cambio visual crítico: Playwright o revisión manual documentada.

## PR checklist

Antes de abrir PR:

- `git status` limpio salvo cambios esperados.
- No hay archivos generados por build incluidos accidentalmente.
- Lint pasa.
- Tests relevantes pasan.
- Build pasa.
- Textos visibles traducidos.
- UI usa tokens y componentes compartidos.
- Accesibilidad básica revisada: foco, labels, contraste, teclado.
- La descripción de PR explica impacto, pruebas y riesgos.
