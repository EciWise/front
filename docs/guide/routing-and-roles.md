# Rutas y roles

## Rutas publicas

| Ruta | Componente |
| --- | --- |
| `/` | Landing |
| `/auth/login` | Login |
| `/auth/register` | Registro |
| `/auth/callback` | Callback OAuth |
| `/**` | Not found |

## Areas autenticadas

Las rutas autenticadas usan `AppShellComponent`.

| Base | Guard | Rol |
| --- | --- | --- |
| `/student` | `roleGuard` | `Role.Student` |
| `/tutor` | `roleGuard` | `Role.Tutor` |
| `/admin` | `roleGuard` | `Role.Admin` |
| `/help` | `authGuard` | Cualquier usuario autenticado |

## Estudiante

| Ruta | Funcion |
| --- | --- |
| `/student` | Dashboard |
| `/student/tutorias` | Buscar, reservar, reprogramar y calificar tutorias |
| `/student/materials` | Materiales |
| `/student/games` | Centro de juegos |
| `/student/study` | Centro de estudios |
| `/student/aprendizaje` | Colecciones y flashcards |
| `/student/tasks` | Tareas |
| `/student/logros` | Logros |
| `/student/foros` | Foros |
| `/student/profile` | Perfil |

## Tutor

| Ruta | Funcion |
| --- | --- |
| `/tutor` | Dashboard |
| `/tutor/estudiantes` | Estudiantes asignados y predicciones |
| `/tutor/schedule` | Agenda, asistencia, observaciones y evaluacion de estudiantes |
| `/tutor/availability` | Publicacion y gestion de disponibilidad |
| `/tutor/requests` | Solicitudes |
| `/tutor/history` | Historial |
| `/tutor/aprendizaje` | Aprendizaje |

## Administrador

| Ruta | Funcion |
| --- | --- |
| `/admin` | Dashboard |
| `/admin/users` | Gestion de usuarios y carga CSV |
| `/admin/estadisticas` | Estadisticas institucionales |
| `/admin/predicciones` | Predicciones de estudiantes |
| `/admin/asignaciones` | Asignacion tutor-estudiante |
| `/admin/aprendizaje` | Aprendizaje |

## Navegacion lateral

La navegacion se declara en `src/app/shared/layout/nav-items.ts`. Cada item usa:

- `labelKey`: clave i18n.
- `route`: ruta absoluta.
- `icon`: nombre soportado por `eci-icon`.
- `exact`: coincidencia exacta para dashboards.

