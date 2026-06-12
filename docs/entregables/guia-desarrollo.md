# Guia de desarrollo

## Objetivo

Esta guia define como trabajar sobre ECIWISE+ Front sin romper la arquitectura existente. Aplica para cambios de UI, integraciones backend, formularios, servicios, pruebas y documentacion.

## Preparacion local

Requisitos:

- Node.js compatible con Angular 21.
- npm 11, segun `packageManager`.
- Variables de entorno locales basadas en `.env.template`.

Instalacion:

```powershell
npm install
```

Copiar configuracion:

```powershell
Copy-Item .env.template .env
```

Levantar aplicacion:

```powershell
npm start
```

Documentacion:

```powershell
npm run docs:dev
```

## Flujo de trabajo recomendado

1. Actualizar la rama de trabajo desde `develop`.
2. Revisar el modulo afectado antes de editar.
3. Implementar cambios pequenos y enfocados.
4. Agregar o ajustar pruebas segun riesgo.
5. Ejecutar lint, tests y build.
6. Revisar `git diff` antes de abrir PR.

## Convenciones de Angular

Usar por defecto:

- Componentes standalone.
- `ChangeDetectionStrategy.OnPush`.
- `inject()` para dependencias.
- `signal()` y `computed()` para estado local.
- Servicios inyectables para logica de dominio.
- Lazy loading para rutas de feature.

Evitar:

- Componentes con demasiada logica en template.
- `HttpClient` directo desde componentes de pantalla.
- Estilos hardcodeados que dupliquen tokens globales.
- Textos visibles sin traduccion.
- Dependencias nuevas sin razon clara.

## Estructura por dominio

Cuando una funcionalidad crece, mantener esta separacion:

```text
feature/
  feature.ts
  feature.html
  feature.css
  feature.service.ts
  feature.models.ts
  feature.spec.ts
```

Para componentes pequenos e internos se permite template inline si el patron local ya lo usa. Para pantallas principales, preferir archivos separados.

## UI compartida

Antes de crear un componente visual nuevo, revisar `src/app/shared/ui`.

Componentes base:

| Componente | Uso |
| --- | --- |
| `eci-button` | Acciones primarias, secundarias y ghost |
| `eci-card` | Contenedores funcionales y elementos repetidos |
| `eci-select` | Seleccion controlada con opciones explicitas |
| `eci-modal` | Dialogos, confirmaciones y formularios secundarios |
| `eci-page-header` | Encabezados de pantalla |
| `eci-section-tabs` | Tabs de secciones internas |
| `eci-icon` | Iconografia centralizada |
| `eci-date-picker` | Seleccion de fechas |
| `eci-time-picker` | Seleccion de horas |

Reglas:

- Usar `buttonClick` en `eci-button` cuando se escucha la accion del boton.
- Los botones de icono deben tener `ariaLabel`.
- Mantener targets tactiles comodos y foco visible.
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
- En TypeScript, usar el servicio de traduccion cuando el texto dependa de logica.

## Formularios

Usar Reactive Forms o Signal Forms segun el patron del modulo.

Checklist:

- Labels visibles.
- Mensajes de error cerca del campo.
- `aria-live` o `role="alert"` para errores importantes.
- Boton de envio deshabilitado durante guardado.
- Validacion en cliente solo como soporte, no como unica barrera.
- Confirmacion antes de acciones irreversibles.

## Servicios e integracion backend

Los servicios deben:

- Recibir base URLs desde tokens de configuracion.
- Normalizar URLs antes de construir endpoints.
- Encapsular DTOs y transformaciones.
- Devolver observables o signals segun el patron existente.
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

Criterio practico:

- Cambio de servicio: prueba unitaria del servicio.
- Cambio de formulario: prueba de validacion y envio.
- Cambio de componente compartido: prueba del componente y al menos un caso de integracion.
- Cambio de ruta o guard: prueba de acceso o smoke test.
- Cambio visual critico: Playwright o revision manual documentada.

## PR checklist

Antes de abrir PR:

- `git status` limpio salvo cambios esperados.
- No hay archivos generados por build incluidos accidentalmente.
- Lint pasa.
- Tests relevantes pasan.
- Build pasa.
- Textos visibles traducidos.
- UI usa tokens y componentes compartidos.
- Accesibilidad basica revisada: foco, labels, contraste, teclado.
- La descripcion de PR explica impacto, pruebas y riesgos.

