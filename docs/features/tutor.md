# Área de tutor

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

- Ver tutorías programadas.
- Marcar asistencia.
- Abrir enlace virtual o consultar sala presencial.
- Registrar observaciones.
- Cerrar sesiones.
- Evaluar participación del estudiante.
- Consultar reputación resumida del estudiante.

## Disponibilidad

`features/tutor/availability` permite:

- Crear bloques de disponibilidad.
- Editar o eliminar bloques sin reservas activas.
- Cancelar bloques con reservas activas y justificación.
- Definir modalidad virtual o presencial.
- Definir cupos.
- Mostrar sala o enlace según modalidad.

## Solicitudes e historial

`requests.service.ts`, `history.service.ts` y sus vistas mantienen compatibilidad con flujos previos del tutor. Al conectar backend de tutorías, revisar si deben consolidarse con `TutoringMockService` o con el nuevo cliente HTTP.

## Estudiantes asignados

La ruta `/tutor/estudiantes` reutiliza `StudentsPredictionsComponent` para consultar predicciones y detalle académico de estudiantes asignados.

