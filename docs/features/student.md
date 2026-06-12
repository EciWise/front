# Área de estudiante

## Rutas

La configuración está en `src/app/features/student/student.routes.ts`.

| Vista | Ruta |
| --- | --- |
| Dashboard | `/student` |
| Tutorías | `/student/tutorias` |
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

La configuración del backend se toma de `TODO_CONFIG`.

## Perfil

`features/student/profile` permite editar datos personales de sesión. El guardado pasa por `AuthService.updateProfile`.

## Materiales, juegos, foros y logros

Estas vistas son módulos funcionales de experiencia estudiantil. Deben mantener el patrón de pantalla funcional, no landing, y usar componentes compartidos.

