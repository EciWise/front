# Arquitectura del frontend

## Resumen ejecutivo

ECIWISE+ Front es una aplicación Angular 21 con SSR, hidratación del cliente, componentes standalone, rutas lazy por rol, i18n, accesibilidad, chat, aprendizaje, tutorías, IA académica y administración. La arquitectura busca separar responsabilidades por dominio, mantener una interfaz institucional consistente y facilitar la integración progresiva con microservicios backend.

El frontend se organiza alrededor de tres capas principales:

- `core`: servicios transversales, configuración, autenticación, HTTP, i18n, tema, accesibilidad e IA.
- `features`: módulos funcionales por experiencia de usuario.
- `shared`: layout, navegación, componentes UI y utilidades reutilizables.

## Stack principal

| Área | Tecnología |
| --- | --- |
| Framework | Angular 21 |
| Rendering | Angular SSR con Express |
| Componentes | Standalone components |
| Estado | `signal`, `computed`, servicios inyectables |
| Formularios | Reactive Forms y Signal Forms según módulo |
| Rutas | Angular Router con lazy loading |
| HTTP | `HttpClient` con interceptores |
| i18n | `@ngx-translate/core` con loader estático |
| UI | CSS tokens globales, componentes `eci-*`, Lucide icons |
| Calidad | ESLint, Vitest via Angular test builder, Playwright |
| Documentación | VitePress |

## Bootstrap de aplicación

La entrada de configuración vive en `src/app/app.config.ts`. Sus responsabilidades son:

- Registrar rutas con `provideRouter`.
- Activar scroll in-memory y view transitions.
- Habilitar hidratación con event replay.
- Configurar `HttpClient` con `withFetch`.
- Registrar interceptores de autenticación y errores.
- Inicializar idioma, tema y modo de accesibilidad.
- Cargar configuración runtime desde `public/assets/env.json`.
- Proveer tokens de configuración para auth, study, talk y todo.

## Capas y responsabilidades

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Core | `src/app/core` | Servicios transversales, tokens, guards, modelos y configuración |
| Features | `src/app/features` | Pantallas, flujos y servicios por dominio funcional |
| Shared layout | `src/app/shared/layout` | Shell autenticado, side nav, top bar, acciones flotantes, notificaciones |
| Shared UI | `src/app/shared/ui` | Componentes visuales reutilizables |
| Shared util | `src/app/shared/util` | Utilidades comunes sin acoplar a UI |

## Dominios funcionales

| Dominio | Ruta base | Usuarios | Responsabilidad |
| --- | --- | --- | --- |
| Público | `/`, `/auth/*` | Visitantes | Landing, login, registro, callback y 404 |
| Estudiante | `/student` | Estudiantes | Tutoraciones, materiales, juegos, práctica, aprendizaje, tareas, logros, foros y perfil |
| Tutor | `/tutor` | Tutores | Agenda, disponibilidad, solicitudes, historial, estudiantes, aprendizaje y práctica |
| Administración | `/admin` | Administradores | Usuarios, estadísticas, predicciones, asignaciones, aprendizaje y práctica |
| Ayuda | `/help` | Usuarios autenticados | Soporte y orientación de uso |
| Transversal | N/A | Todos | Chat, asistente IA, notificaciones, tema, idioma y accesibilidad |

## Rutas y autorización

Las rutas principales se definen en `src/app/app.routes.ts`. Las áreas autenticadas usan `AppShellComponent` y se protegen con guards:

- `authGuard`: exige sesión activa.
- `roleGuard`: valida que el usuario tenga el rol requerido.

Las rutas de rol se cargan de forma lazy:

```text
/student -> STUDENT_ROUTES
/tutor   -> TUTOR_ROUTES
/admin   -> ADMIN_ROUTES
```

La navegación lateral se deriva del rol activo mediante `navItemsFor(role)` en `src/app/shared/layout/nav-items.ts`.

## Estado de aplicación

El estado se maneja con primitives de Angular y servicios inyectables:

- `AuthService`: usuario, rol, token, sesión y actualización de perfil.
- `ThemeService`: tema claro/oscuro.
- `I18nService`: idioma activo.
- `A11yService`: modo de accesibilidad.
- Servicios de dominio: encapsulan HTTP, mocks, caché local y signals de datos.

Regla de arquitectura: los componentes no deben llamar APIs directamente si ya existe un servicio de dominio. El componente orquesta UI; el servicio encapsula contratos, URLs, transformaciones y persistencia.

## Integraciones backend

La aplicación consume servicios configurables por runtime:

| Variable `.env` | Uso en frontend | Default local |
| --- | --- | --- |
| `AUTH_SERVICE` | Usuarios, login, roles, perfil, administración e IA ligada a auth | `http://localhost:3001` |
| `STUDY_SERVICE` | Flashcards, colecciones, práctica y aprendizaje | `http://localhost:8082` |
| `TALK_SERVICE` | Chat REST, grupos y mensajes | `http://localhost:3003` |
| `TALK_WS` | Eventos realtime de chat por WebSocket/STOMP | `ws://localhost:3003/ws/chat` |
| `TODO_SERVICE` | Tareas y planificador | `http://localhost:8083` |

El script `scripts/write-env.mjs` genera `public/assets/env.json` antes de `start` y `build`. En runtime, `EnvService` carga ese archivo y `app.config.ts` alimenta los tokens de configuración.

## HTTP e interceptores

El frontend usa `HttpClient` con:

- Interceptor de autenticación: adjunta JWT solo a hosts propios.
- Interceptor de errores: normaliza errores HTTP para tratarlos desde UI.
- Utilidades de host: evitan filtrar tokens a dominios externos.

Los servicios de dominio deben construir URLs con utilidades de normalización y no concatenar strings sin control.

## SSR y compatibilidad navegador

El proyecto genera salida SSR en `dist/ECIWISE-Front`. El código que dependa de APIs de navegador debe protegerse con condiciones seguras:

- `localStorage`, `document`, `window` y eventos globales deben usarse solo en navegador.
- La configuración runtime debe existir tanto para SSR como para cliente.
- Los componentes compartidos deben evitar side effects durante render server.

## UI shell

Las áreas autenticadas comparten `AppShellComponent`, que contiene:

- Top bar institucional.
- Navegación lateral por rol.
- Región principal.
- Acciones flotantes como chat/asistente.
- Notificaciones y preferencias de UI.

Este shell evita duplicar estructura y mantiene coherencia entre estudiante, tutor y administrador.

## Calidad y mantenibilidad

Controles mínimos antes de integrar cambios:

```powershell
npm run lint
npm run test:ci
npm run build
```

Para cambios visuales críticos:

```powershell
npm run e2e
```

Principios de mantenimiento:

- Preferir componentes `eci-*` existentes.
- Usar textos traducibles, no strings visibles hardcodeados.
- Mantener estilos con tokens de `src/styles.css`.
- Evitar nuevas dependencias si la plataforma ya resuelve el caso.
- Mantener cada feature dentro de su dominio.
