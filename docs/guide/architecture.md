# Arquitectura

## Bootstrap

La aplicacion se configura en `src/app/app.config.ts`.

Responsabilidades principales:

- Registrar rutas con `provideRouter`.
- Habilitar `withInMemoryScrolling` y `withViewTransitions`.
- Habilitar hidratacion con `provideClientHydration(withEventReplay())`.
- Configurar `HttpClient` con `withFetch()` e interceptores.
- Configurar traducciones con `provideTranslateService`.
- Inicializar tema, idioma y accesibilidad con `provideAppInitializer`.
- Cargar configuracion runtime con `EnvService`.
- Proveer tokens de configuracion por servicio: auth, study, talk y todo.

## Capas

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Core | `src/app/core` | Auth, HTTP, i18n, tema, a11y, configuracion, IA, modelos transversales |
| Features | `src/app/features` | Vistas y servicios por dominio funcional |
| Shared layout | `src/app/shared/layout` | Shell, navegacion, top bar, acciones flotantes, notificaciones |
| Shared UI | `src/app/shared/ui` | Botones, cards, iconos, modales, selectores, charts, pickers |
| Shared util | `src/app/shared/util` | Utilidades reutilizables |

## Estado y datos

El estado local se maneja con signals en servicios y componentes:

- `AuthService` conserva usuario, rol y estado de autenticacion.
- `ThemeService`, `I18nService` y `A11yService` inicializan preferencias de UI.
- `ChatService` orquesta conversaciones, mensajes, typing y moderacion.
- `TutoringMockService` centraliza el mock de tutorias hasta que exista backend.
- Los servicios HTTP encapsulan contratos y endpoints por dominio.

## HTTP e interceptores

El front usa `HttpClient` con:

- `authInterceptor`: adjunta JWT a las solicitudes autenticadas.
- `errorInterceptor`: normaliza errores a claves traducibles.

Los componentes no deben llamar `HttpClient` directamente si ya existe un servicio del dominio.

## SSR

El proyecto usa `@angular/ssr` y `src/server.ts` como entrada server. El codigo que dependa de navegador debe protegerse con `isPlatformBrowser` o verificaciones equivalentes.

Ejemplos existentes:

- `AuthService` protege acceso a `localStorage`.
- `ChatService` protege persistencia local por navegador.

## UI shell

Las areas autenticadas usan `AppShellComponent`:

- Barra superior.
- Navegacion lateral segun rol.
- Acciones flotantes como chat/asistente.
- Region principal con transiciones de vista.

