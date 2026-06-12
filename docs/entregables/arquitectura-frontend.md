# Arquitectura del frontend

## Resumen ejecutivo

ECIWISE+ Front es una aplicacion Angular 21 con SSR, hidratacion del cliente, componentes standalone, rutas lazy por rol, i18n, accesibilidad, chat, aprendizaje, tutorias, IA academica y administracion. La arquitectura busca separar responsabilidades por dominio, mantener una interfaz institucional consistente y facilitar la integracion progresiva con microservicios backend.

El frontend se organiza alrededor de tres capas principales:

- `core`: servicios transversales, configuracion, autenticacion, HTTP, i18n, tema, accesibilidad e IA.
- `features`: modulos funcionales por experiencia de usuario.
- `shared`: layout, navegacion, componentes UI y utilidades reutilizables.

## Stack principal

| Area | Tecnologia |
| --- | --- |
| Framework | Angular 21 |
| Rendering | Angular SSR con Express |
| Componentes | Standalone components |
| Estado | `signal`, `computed`, servicios inyectables |
| Formularios | Reactive Forms y Signal Forms segun modulo |
| Rutas | Angular Router con lazy loading |
| HTTP | `HttpClient` con interceptores |
| i18n | `@ngx-translate/core` con loader estatico |
| UI | CSS tokens globales, componentes `eci-*`, Lucide icons |
| Calidad | ESLint, Vitest via Angular test builder, Playwright |
| Documentacion | VitePress |

## Bootstrap de aplicacion

La entrada de configuracion vive en `src/app/app.config.ts`. Sus responsabilidades son:

- Registrar rutas con `provideRouter`.
- Activar scroll in-memory y view transitions.
- Habilitar hidratacion con event replay.
- Configurar `HttpClient` con `withFetch`.
- Registrar interceptores de autenticacion y errores.
- Inicializar idioma, tema y modo de accesibilidad.
- Cargar configuracion runtime desde `public/assets/env.json`.
- Proveer tokens de configuracion para auth, study, talk y todo.

## Capas y responsabilidades

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Core | `src/app/core` | Servicios transversales, tokens, guards, modelos y configuracion |
| Features | `src/app/features` | Pantallas, flujos y servicios por dominio funcional |
| Shared layout | `src/app/shared/layout` | Shell autenticado, side nav, top bar, acciones flotantes, notificaciones |
| Shared UI | `src/app/shared/ui` | Componentes visuales reutilizables |
| Shared util | `src/app/shared/util` | Utilidades comunes sin acoplar a UI |

## Dominios funcionales

| Dominio | Ruta base | Usuarios | Responsabilidad |
| --- | --- | --- | --- |
| Publico | `/`, `/auth/*` | Visitantes | Landing, login, registro, callback y 404 |
| Estudiante | `/student` | Estudiantes | Tutoraciones, materiales, juegos, practica, aprendizaje, tareas, logros, foros y perfil |
| Tutor | `/tutor` | Tutores | Agenda, disponibilidad, solicitudes, historial, estudiantes, aprendizaje y practica |
| Administracion | `/admin` | Administradores | Usuarios, estadisticas, predicciones, asignaciones, aprendizaje y practica |
| Ayuda | `/help` | Usuarios autenticados | Soporte y orientacion de uso |
| Transversal | N/A | Todos | Chat, asistente IA, notificaciones, tema, idioma y accesibilidad |

## Rutas y autorizacion

Las rutas principales se definen en `src/app/app.routes.ts`. Las areas autenticadas usan `AppShellComponent` y se protegen con guards:

- `authGuard`: exige sesion activa.
- `roleGuard`: valida que el usuario tenga el rol requerido.

Las rutas de rol se cargan de forma lazy:

```text
/student -> STUDENT_ROUTES
/tutor   -> TUTOR_ROUTES
/admin   -> ADMIN_ROUTES
```

La navegacion lateral se deriva del rol activo mediante `navItemsFor(role)` en `src/app/shared/layout/nav-items.ts`.

## Estado de aplicacion

El estado se maneja con primitives de Angular y servicios inyectables:

- `AuthService`: usuario, rol, token, sesion y actualizacion de perfil.
- `ThemeService`: tema claro/oscuro.
- `I18nService`: idioma activo.
- `A11yService`: modo de accesibilidad.
- Servicios de dominio: encapsulan HTTP, mocks, cache local y signals de datos.

Regla de arquitectura: los componentes no deben llamar APIs directamente si ya existe un servicio de dominio. El componente orquesta UI; el servicio encapsula contratos, URLs, transformaciones y persistencia.

## Integraciones backend

La aplicacion consume servicios configurables por runtime:

| Variable `.env` | Uso en frontend | Default local |
| --- | --- | --- |
| `AUTH_SERVICE` | Usuarios, login, roles, perfil, administracion e IA ligada a auth | `http://localhost:3001` |
| `STUDY_SERVICE` | Flashcards, colecciones, practica y aprendizaje | `http://localhost:8082` |
| `TALK_SERVICE` | Chat REST, grupos y mensajes | `http://localhost:3003` |
| `TALK_WS` | Eventos realtime de chat por WebSocket/STOMP | `ws://localhost:3003/ws/chat` |
| `TODO_SERVICE` | Tareas y planificador | `http://localhost:8083` |

El script `scripts/write-env.mjs` genera `public/assets/env.json` antes de `start` y `build`. En runtime, `EnvService` carga ese archivo y `app.config.ts` alimenta los tokens de configuracion.

## HTTP e interceptores

El frontend usa `HttpClient` con:

- Interceptor de autenticacion: adjunta JWT solo a hosts propios.
- Interceptor de errores: normaliza errores HTTP para tratarlos desde UI.
- Utilidades de host: evitan filtrar tokens a dominios externos.

Los servicios de dominio deben construir URLs con utilidades de normalizacion y no concatenar strings sin control.

## SSR y compatibilidad navegador

El proyecto genera salida SSR en `dist/ECIWISE-Front`. El codigo que dependa de APIs de navegador debe protegerse con condiciones seguras:

- `localStorage`, `document`, `window` y eventos globales deben usarse solo en navegador.
- La configuracion runtime debe existir tanto para SSR como para cliente.
- Los componentes compartidos deben evitar side effects durante render server.

## UI shell

Las areas autenticadas comparten `AppShellComponent`, que contiene:

- Top bar institucional.
- Navegacion lateral por rol.
- Region principal.
- Acciones flotantes como chat/asistente.
- Notificaciones y preferencias de UI.

Este shell evita duplicar estructura y mantiene coherencia entre estudiante, tutor y administrador.

## Calidad y mantenibilidad

Controles minimos antes de integrar cambios:

```powershell
npm run lint
npm run test:ci
npm run build
```

Para cambios visuales criticos:

```powershell
npm run e2e
```

Principios de mantenimiento:

- Preferir componentes `eci-*` existentes.
- Usar textos traducibles, no strings visibles hardcodeados.
- Mantener estilos con tokens de `src/styles.css`.
- Evitar nuevas dependencias si la plataforma ya resuelve el caso.
- Mantener cada feature dentro de su dominio.

