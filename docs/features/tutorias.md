# Tutorias

El modulo de tutorias esta mockeado en frontend para dejar listo el contrato funcional antes de conectar el backend.

## Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `features/student/tutorias/tutorias.ts` | Vista del estudiante |
| `features/student/tutorias/tutorias.html` | Busqueda, reservas, recomendaciones e historial |
| `features/student/tutorias/tutorias.service.ts` | Adaptador compatible con listado rapido |
| `features/tutor/tutoring.service.ts` | Estado mock y reglas de negocio |
| `features/tutor/tutor.models.ts` | Modelos compartidos del dominio |
| `features/tutor/tutoring.service.spec.ts` | Cobertura de reglas de negocio |

## Casos de uso cubiertos

### Estudiante

- Buscar tutorias por materia, tutor, modalidad, fecha y horario.
- Reservar una tutoria con tema especifico, descripcion y modalidad.
- Cancelar una reserva con justificacion.
- Reprogramar una reserva a otro horario disponible.
- Consultar enlace virtual o sala presencial.
- Calificar tutoria realizada.
- Registrar comentario.
- Consultar historial.
- Ver reputacion resumida del tutor.
- Ver recomendaciones inteligentes mockeadas.

### Tutor

- Publicar disponibilidad.
- Modificar o eliminar disponibilidad sin reservas activas.
- Cancelar disponibilidad publicada con reservas activas.
- Consultar agenda.
- Registrar asistencia.
- Registrar observaciones.
- Evaluar participacion del estudiante.
- Consultar reputacion resumida del estudiante.

### Administrador

- Consultar estadisticas institucionales del servicio.
- Ver materias mas solicitadas, temas, horarios de demanda, tutores destacados, asistencia, completadas, canceladas y estudiantes atendidos.

## Reglas de negocio mockeadas

| Regla | Implementacion |
| --- | --- |
| Sin traslape de reservas del estudiante | `hasStudentOverlap` |
| Sin traslape de disponibilidad del tutor | `hasTutorOverlap` |
| Materia asignada al tutor | `validateAvailabilityPayload` |
| Estudiante activo para reservar | `reserve` |
| Tutor autorizado para publicar | `validateAvailabilityPayload` |
| Evaluacion solo si esta realizada | `rateTutor`, `evaluateStudent` |
| Calificacion unica por estudiante | `rateTutor` |
| Cancelacion con anticipacion y justificacion | `cancelReservation` |
| Cupos maximos en tutorias grupales | `availableSeats`, `activeReservationCount` |

## Estados

`AttendanceStatus` soporta:

- `confirmed`
- `completed`
- `cancelled`
- `no_show`

`TutoringMode` soporta:

- `virtual`
- `presential`

## UI

Los desplegables del modulo usan `eci-select` con opciones definidas por pagina:

- Filtros de estudiante: materias, tutores y modalidades.
- Reserva: modalidad del cupo seleccionado.
- Disponibilidad del tutor: materias asignadas al tutor y modalidades validas.

Esto evita que el selector compartido use opciones genericas de otros flujos como registro.

## Conexion futura con backend

Cuando exista el microservicio de tutorias:

1. Mantener `tutor.models.ts` como contrato base o mapear DTOs ahi.
2. Sustituir `TutoringMockService` por un servicio HTTP.
3. Conservar metodos publicos usados por componentes cuando sea posible.
4. Mover reglas finales al backend, dejando validaciones UX en frontend.
5. Mantener specs de casos borde y actualizar mocks con DTOs reales.

