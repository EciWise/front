# Chat e IA

## Chat

El chat está compuesto por:

- `features/chat/chat.service.ts`: orquestación de estado.
- `features/chat/talk-api.service.ts`: API REST.
- `features/chat/talk-realtime.service.ts`: WebSocket/STOMP.
- `features/chat/chat-panel.ts`: panel flotante.
- `features/chat/ui/*`: componentes de lista, hilo, item, composer, nueva conversación y moderación.

## Capacidades

- Conversaciones individuales.
- Grupos.
- Mensajes por REST o WebSocket.
- Adjuntos.
- Respuestas a mensajes.
- Edición.
- Eliminación.
- Reacciones.
- Fijar mensajes.
- Marcado como leído.
- Indicador typing.
- Ocultar conversaciones localmente.
- Moderación y palabras censuradas para roles autorizados.

## Estado local

`ChatService` usa signals para:

- conversaciones
- conversación activa
- mensajes
- usuarios escribiendo
- vista actual
- errores
- palabras censuradas
- respuesta activa
- conversaciones ocultas
- últimas lecturas

## IA

El front tiene dos áreas de IA:

- **Datos y predicciones académicas:** `core/ia`, `features/ia`.
- **Asistente flotante:** `features/ai-assistant`.

## Predicciones

`IaAdminService` consume endpoints de `wise_auth` para:

- listar estudiantes con predicción
- ver detalle de estudiante
- consultar estadísticas
- gestionar asignaciones tutor-estudiante

## Asistente

`ai-assistant` mantiene el panel y servicio del asistente. Debe conservarse desacoplado del chat institucional para evitar mezclar conversaciones académicas con asistencia automatizada.

