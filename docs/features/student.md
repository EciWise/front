# Area de estudiante

## Rutas

La configuracion esta en `src/app/features/student/student.routes.ts`.

| Vista | Ruta |
| --- | --- |
| Dashboard | `/student` |
| Tutorias | `/student/tutorias` |
| Materiales | `/student/materials` |
| Juegos | `/student/games` |
| Centro de estudios | `/student/study` |
| Aprendizaje | `/student/aprendizaje` |
| Tareas | `/student/tasks` |
| Logros | `/student/logros` |
| Foros | `/student/foros` |
| Perfil | `/student/profile` |

## Dashboard

`student-dashboard.ts` presenta accesos a las funcionalidades principales del estudiante.

## Tareas

`features/student/tasks` incluye:

- Modelo `Task`.
- Servicio de tareas.
- Vista para crear, buscar y gestionar pendientes.

La configuracion del backend se toma de `TODO_CONFIG`.

## Perfil

`features/student/profile` permite editar datos personales de sesion. El guardado pasa por `AuthService.updateProfile`.

## Materiales, juegos, foros y logros

Estas vistas son modulos funcionales de experiencia estudiantil. Deben mantener el patron de pantalla funcional, no landing, y usar componentes compartidos.

