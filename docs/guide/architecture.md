# Arquitectura

## Bootstrap

La aplicación se configura en `src/app/app.config.ts`.

Responsabilidades principales:

- Registrar rutas con `provideRouter`.
- Habilitar `withInMemoryScrolling` y `withViewTransitions`.
- Habilitar hidratación con `provideClientHydration(withEventReplay())`.
- Configurar `HttpClient` con `withFetch()` e interceptores.
- Configurar traducciones con `provideTranslateService`.
- Inicializar tema, idioma y accesibilidad con `provideAppInitializer`.
- Cargar configuración runtime con `EnvService`.
- Proveer tokens de configuración por servicio: auth, study, talk y todo.

## Capas

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Core | `src/app/core` | Auth, HTTP, i18n, tema, a11y, configuración, IA, modelos transversales |
| Features | `src/app/features` | Vistas y servicios por dominio funcional |
| Shared layout | `src/app/shared/layout` | Shell, navegación, top bar, acciones flotantes, notificaciones |
| Shared UI | `src/app/shared/ui` | Botones, cards, iconos, modales, selectores, charts, pickers |
| Shared util | `src/app/shared/util` | Utilidades reutilizables |

## Estado y datos

El estado local se maneja con signals en servicios y componentes:

- `AuthService` conserva usuario, rol y estado de autenticación.
- `ThemeService`, `I18nService` y `A11yService` inicializan preferencias de UI.
- `ChatService` orquesta conversaciones, mensajes, typing y moderación.
- `TutoringMockService` centraliza el mock de tutorías hasta que exista backend.
- Los servicios HTTP encapsulan contratos y endpoints por dominio.

## HTTP e interceptores

El front usa `HttpClient` con:

- `authInterceptor`: adjunta JWT a las solicitudes autenticadas.
- `errorInterceptor`: normaliza errores a claves traducibles.

Los componentes no deben llamar `HttpClient` directamente si ya existe un servicio del dominio.

## SSR

El proyecto usa `@angular/ssr` y `src/server.ts` como entrada server. El código que dependa de navegador debe protegerse con `isPlatformBrowser` o verificaciones equivalentes.

Ejemplos existentes:

- `AuthService` protege acceso a `localStorage`.
- `ChatService` protege persistencia local por navegador.

## UI shell

Las áreas autenticadas usan `AppShellComponent`:

- Barra superior.
- Navegación lateral según rol.
- Acciones flotantes como chat/asistente.
- Región principal con transiciones de vista.
