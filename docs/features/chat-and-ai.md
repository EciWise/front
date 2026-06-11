# Chat e IA

## Chat

El chat esta compuesto por:

- `features/chat/chat.service.ts`: orquestacion de estado.
- `features/chat/talk-api.service.ts`: API REST.
- `features/chat/talk-realtime.service.ts`: WebSocket/STOMP.
- `features/chat/chat-panel.ts`: panel flotante.
- `features/chat/ui/*`: componentes de lista, hilo, item, composer, nueva conversacion y moderacion.

## Capacidades

- Conversaciones individuales.
- Grupos.
- Mensajes por REST o WebSocket.
- Adjuntos.
- Respuestas a mensajes.
- Edicion.
- Eliminacion.
- Reacciones.
- Fijar mensajes.
- Marcado como leido.
- Indicador typing.
- Ocultar conversaciones localmente.
- Moderacion y palabras censuradas para roles autorizados.

## Estado local

`ChatService` usa signals para:

- conversaciones
- conversacion activa
- mensajes
- usuarios escribiendo
- vista actual
- errores
- palabras censuradas
- respuesta activa
- conversaciones ocultas
- ultimas lecturas

## IA

El front tiene dos areas de IA:

- **Datos y predicciones academicas:** `core/ia`, `features/ia`.
- **Asistente flotante:** `features/ai-assistant`.

## Predicciones

`IaAdminService` consume endpoints de `wise_auth` para:

- listar estudiantes con prediccion
- ver detalle de estudiante
- consultar estadisticas
- gestionar asignaciones tutor-estudiante

## Asistente

`ai-assistant` mantiene el panel y servicio del asistente. Debe conservarse desacoplado del chat institucional para evitar mezclar conversaciones academicas con asistencia automatizada.

