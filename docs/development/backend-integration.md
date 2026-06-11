# Integracion backend

## Patron recomendado

Para integrar un backend nuevo:

1. Crear modelos TypeScript del dominio.
2. Crear token de configuracion si necesita URL propia.
3. Registrar el token en `app.config.ts` usando `EnvService`.
4. Crear servicio HTTP en `features/<dominio>` o `core/<dominio>` segun alcance.
5. Mantener componentes consumiendo metodos de servicio, no `HttpClient`.
6. Normalizar errores mediante `errorInterceptor`.
7. Agregar pruebas del servicio y casos borde.

## Servicios existentes

| Dominio | Servicio | Backend |
| --- | --- | --- |
| Auth | `AuthService` | `AUTH_SERVICE` |
| Usuarios admin | `UserAdminService` | `AUTH_SERVICE` |
| IA admin | `IaAdminService` | `AUTH_SERVICE` |
| Aprendizaje | `AprendizajeService` | `STUDY_SERVICE` |
| Chat REST | `TalkApiService` | `TALK_SERVICE` |
| Chat realtime | `TalkRealtimeService` | `TALK_WS` |
| Tareas | `TasksService` | `TODO_SERVICE` |
| Tutorias | `TutoringMockService` | Pendiente |

## Tutorias

El backend de tutorias debe poder reemplazar `TutoringMockService`.

Contrato funcional esperado:

- Disponibilidades.
- Reservas.
- Agenda.
- Asistencia.
- Observaciones.
- Evaluaciones.
- Reputacion.
- Recomendaciones.
- Estadisticas.

Recomendacion de migracion:

- Mantener los metodos publicos actuales como fachada.
- Crear DTOs si el backend no coincide con `tutor.models.ts`.
- Dejar validaciones de UX en frontend, pero hacer cumplir reglas de negocio en backend.
- Actualizar tests para cubrir errores HTTP y DTO mapping.

## Autenticacion

El `authInterceptor` adjunta JWT. Los servicios no deben duplicar esa logica.

## SSR

No usar APIs de navegador en servicios sin proteger con `isPlatformBrowser`.

