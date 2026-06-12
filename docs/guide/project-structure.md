# Estructura del proyecto

```text
src/
  app/
    core/
    features/
    shared/
    app.config.ts
    app.routes.ts
  main.ts
  main.server.ts
  server.ts
  styles.css
public/
  assets/env.json
scripts/
  write-env.mjs
  serve.mjs
docs/
  .vitepress/
  guide/
  features/
  development/
```

## `core/`

Contiene comportamiento transversal:

- `auth/`: sesión, guards, interceptor y configuración.
- `http/`: normalización de errores HTTP.
- `i18n/`: servicio de idioma, loader estático y traducciones.
- `theme/`: tema claro/oscuro.
- `a11y/`: modo de accesibilidad.
- `config/`: carga runtime de `assets/env.json`.
- `ia/`: modelos y clientes HTTP de predicciones/estadísticas.
- `models/`: roles y usuario.

## `features/`

Cada carpeta representa un dominio funcional:

- `auth`
- `student`
- `tutor`
- `admin`
- `aprendizaje`
- `chat`
- `ai-assistant`
- `help`
- `landing`
- `ia`
- `not-found`

El patrón preferido para componentes de pantalla es:

```text
feature/
  view/
    view.ts
    view.html
    view.css
```

Algunas pantallas historicas usan template inline. Para código nuevo, seguir el patrón local de la carpeta cercana.

## `shared/ui/`

Componentes visuales reutilizables:

- `button`
- `card`
- `modal`
- `icon`
- `select`
- `date-picker`
- `time-picker`
- `section-tabs`
- `page-header`
- `charts`
- `tooltip`

Antes de crear un control nuevo, revisar si existe uno en esta carpeta.

## `shared/layout/`

Componentes de composición:

- `app-shell`
- `side-nav`
- `top-bar`
- `floating-actions`
- `notifications-bell`
- `dashboard-grid`

## `styles.css`

Define tokens globales, temas, accesibilidad, scrollbar, formularios base y patrones compartidos. Los componentes deben consumir variables como `--surface`, `--text`, `--border`, `--accent`, `--brand-red`, radios y espacios.

