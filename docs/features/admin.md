# Administración

## Rutas

| Vista | Ruta |
| --- | --- |
| Dashboard | `/admin` |
| Usuarios | `/admin/users` |
| Estadísticas | `/admin/estadisticas` |
| Predicciones | `/admin/predicciones` |
| Asignaciones | `/admin/asignaciones` |
| Aprendizaje | `/admin/aprendizaje` |

## Gestión de usuarios

`features/admin/users` consume `UserAdminService`.

Permite:

- Listar usuarios.
- Cambiar rol.
- Activar o desactivar.
- Cargar CSV.
- Revisar resultado de carga masiva.

## Estadísticas

`features/admin/statistics` combina:

- Estadísticas de plataforma desde `IaAdminService.platformStats`.
- Estadísticas mockeadas del servicio de tutorías desde `TutoringMockService.stats`.

Las visualizaciones usan componentes compartidos:

- `eci-pie-chart`
- `eci-histogram`
- `eci-section-tabs`
- `eci-card`

## Predicciones y asignaciones

`IaAdminService` expone:

- `listStudents`
- `getStudent`
- `platformStats`
- `listAssignments`
- `createAssignment`
- `deleteAssignment`
- `listTutors`
- `listEstudiantes`

Los endpoints se construyen sobre `AUTH_CONFIG.apiBaseUrl`.

