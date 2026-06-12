# Rutas y roles

## Rutas públicas

| Ruta | Componente |
| --- | --- |
| `/` | Landing |
| `/auth/login` | Login |
| `/auth/register` | Registro |
| `/auth/callback` | Callback OAuth |
| `/**` | Not found |

## Áreas autenticadas

Las rutas autenticadas usan `AppShellComponent`.

| Base | Guard | Rol |
| --- | --- | --- |
| `/student` | `roleGuard` | `Role.Student` |
| `/tutor` | `roleGuard` | `Role.Tutor` |
| `/admin` | `roleGuard` | `Role.Admin` |
| `/help` | `authGuard` | Cualquier usuario autenticado |

## Estudiante

| Ruta | Función |
| --- | --- |
| `/student` | Dashboard |
| `/student/tutorias` | Buscar, reservar, reprogramar y calificar tutorías |
| `/student/materials` | Materiales |
| `/student/games` | Centro de juegos |
| `/student/study` | Centro de estudios |
| `/student/aprendizaje` | Colecciones y flashcards |
| `/student/tasks` | Tareas |
| `/student/logros` | Logros |
| `/student/foros` | Foros |
| `/student/profile` | Perfil |

## Tutor

| Ruta | Función |
| --- | --- |
| `/tutor` | Dashboard |
| `/tutor/estudiantes` | Estudiantes asignados y predicciones |
| `/tutor/schedule` | Agenda, asistencia, observaciones y evaluación de estudiantes |
| `/tutor/availability` | Publicación y gestión de disponibilidad |
| `/tutor/requests` | Solicitudes |
| `/tutor/history` | Historial |
| `/tutor/aprendizaje` | Aprendizaje |

## Administrador

| Ruta | Función |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/users` | Gestión de usuarios y carga CSV |
| `/admin/estadisticas` | Estadísticas institucionales |
| `/admin/predicciones` | Predicciones de estudiantes |
| `/admin/asignaciones` | Asignación tutor-estudiante |
| `/admin/aprendizaje` | Aprendizaje |

## Navegación lateral

La navegación se declara en `src/app/shared/layout/nav-items.ts`. Cada item usa:

- `labelKey`: clave i18n.
- `route`: ruta absoluta.
- `icon`: nombre soportado por `eci-icon`.
- `exact`: coincidencia exacta para dashboards.

