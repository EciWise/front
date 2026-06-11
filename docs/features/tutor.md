# Area de tutor

## Rutas

| Vista | Ruta |
| --- | --- |
| Dashboard | `/tutor` |
| Estudiantes asignados | `/tutor/estudiantes` |
| Agenda | `/tutor/schedule` |
| Disponibilidad | `/tutor/availability` |
| Solicitudes | `/tutor/requests` |
| Historial | `/tutor/history` |
| Aprendizaje | `/tutor/aprendizaje` |

## Agenda

`features/tutor/schedule` permite:

- Ver tutorias programadas.
- Marcar asistencia.
- Abrir enlace virtual o consultar sala presencial.
- Registrar observaciones.
- Cerrar sesiones.
- Evaluar participacion del estudiante.
- Consultar reputacion resumida del estudiante.

## Disponibilidad

`features/tutor/availability` permite:

- Crear bloques de disponibilidad.
- Editar o eliminar bloques sin reservas activas.
- Cancelar bloques con reservas activas y justificacion.
- Definir modalidad virtual o presencial.
- Definir cupos.
- Mostrar sala o enlace segun modalidad.

## Solicitudes e historial

`requests.service.ts`, `history.service.ts` y sus vistas mantienen compatibilidad con flujos previos del tutor. Al conectar backend de tutorias, revisar si deben consolidarse con `TutoringMockService` o con el nuevo cliente HTTP.

## Estudiantes asignados

La ruta `/tutor/estudiantes` reutiliza `StudentsPredictionsComponent` para consultar predicciones y detalle academico de estudiantes asignados.

