# Tutorías

El módulo de tutorías está mockeado en frontend para dejar listo el contrato funcional antes de conectar el backend.

## Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `features/student/tutorias/tutorias.ts` | Vista del estudiante |
| `features/student/tutorias/tutorias.html` | Búsqueda, reservas, recomendaciones e historial |
| `features/student/tutorias/tutorias.service.ts` | Adaptador compatible con listado rápido |
| `features/tutor/tutoring.service.ts` | Estado mock y reglas de negocio |
| `features/tutor/tutor.models.ts` | Modelos compartidos del dominio |
| `features/tutor/tutoring.service.spec.ts` | Cobertura de reglas de negocio |

## Casos de uso cubiertos

### Estudiante

- Buscar tutorías por materia, tutor, modalidad, fecha y horario.
- Reservar una tutoría con tema especifico, descripción y modalidad.
- Cancelar una reserva con justificación.
- Reprogramar una reserva a otro horario disponible.
- Consultar enlace virtual o sala presencial.
- Calificar tutoría realizada.
- Registrar comentario.
- Consultar historial.
- Ver reputación resumida del tutor.
- Ver recomendaciones inteligentes mockeadas.

### Tutor

- Publicar disponibilidad.
- Modificar o eliminar disponibilidad sin reservas activas.
- Cancelar disponibilidad publicada con reservas activas.
- Consultar agenda.
- Registrar asistencia.
- Registrar observaciones.
- Evaluar participación del estudiante.
- Consultar reputación resumida del estudiante.

### Administrador

- Consultar estadísticas institucionales del servicio.
- Ver materias más solicitadas, temas, horarios de demanda, tutores destacados, asistencia, completadas, canceladas y estudiantes atendidos.

## Reglas de negocio mockeadas

| Regla | Implementación |
| --- | --- |
| Sin traslape de reservas del estudiante | `hasStudentOverlap` |
| Sin traslape de disponibilidad del tutor | `hasTutorOverlap` |
| Materia asignada al tutor | `validateAvailabilityPayload` |
| Estudiante activo para reservar | `reserve` |
| Tutor autorizado para publicar | `validateAvailabilityPayload` |
| Evaluación solo si está realizada | `rateTutor`, `evaluateStudent` |
| Calificación única por estudiante | `rateTutor` |
| Cancelación con anticipación y justificación | `cancelReservation` |
| Cupos maximos en tutorías grupales | `availableSeats`, `activeReservationCount` |

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

Los desplegables del módulo usan `eci-select` con opciones definidas por página:

- Filtros de estudiante: materias, tutores y modalidades.
- Reserva: modalidad del cupo seleccionado.
- Disponibilidad del tutor: materias asignadas al tutor y modalidades validas.

Esto evita que el selector compartido use opciones genéricas de otros flujos como registro.

## Conexion futura con backend

Cuando exista el microservicio de tutorías:

1. Mantener `tutor.models.ts` como contrato base o mapear DTOs ahí.
2. Sustituir `TutoringMockService` por un servicio HTTP.
3. Conservar métodos públicos usados por componentes cuando sea posible.
4. Mover reglas finales al backend, dejando validaciones UX en frontend.
5. Mantener specs de casos borde y actualizar mocks con DTOs reales.

