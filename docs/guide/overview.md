# Visión general

ECIWISE+ Front es una aplicación Angular 21 con componentes standalone, SSR, hidratación del cliente, rutas lazy por rol y una capa visual compartida. El front agrupa experiencias para estudiantes, tutores y administradores.

## Objetivos del frontend

- Entregar una interfaz institucional, sobria y responsive para ECIWISE+.
- Centralizar autenticación, autorización, tema, accesibilidad, i18n, notificaciones y configuración runtime.
- Separar funcionalidades por dominios: auth, estudiante, tutor, admin, aprendizaje, chat, IA y ayuda.
- Facilitar integraciones backend mediante servicios Angular aislados por dominio.
- Mantener UI reutilizable con componentes compartidos y tokens CSS globales.

## Stack principal

| Área | Tecnología |
| --- | --- |
| Framework | Angular 21 |
| Componentes | Standalone components con `ChangeDetectionStrategy.OnPush` |
| Estado UI | `signal`, `computed`, servicios inyectables |
| Formularios | Reactive Forms y Signal Forms según módulo |
| Rutas | Angular Router con lazy loading |
| HTTP | `HttpClient` con interceptores |
| SSR | `@angular/ssr` con Express |
| i18n | `@ngx-translate/core` con loader estático |
| UI | CSS global con tokens, componentes `shared/ui`, Lucide icons |
| Testing | Angular unit test builder sobre Vitest, Playwright para e2e |

## Dominios funcionales

- **Público:** landing, login, registro, callback OAuth y página 404.
- **Estudiante:** dashboard, tutorías, materiales, juegos, estudio, aprendizaje, tareas, logros, foros y perfil.
- **Tutor:** dashboard, estudiantes asignados, agenda, disponibilidad, solicitudes, historial y aprendizaje.
- **Admin:** dashboard, usuarios, estadísticas, predicciones, asignaciones y aprendizaje.
- **Transversal:** chat flotante, asistente IA, notificaciones, tema, accesibilidad e idioma.

## Principios de implementación

- Preferir componentes standalone con HTML y CSS separados cuando ya exista ese patrón.
- Mantener la lógica de negocio fuera de templates complejos y dentro de servicios o métodos protegidos.
- Usar `inject()` en lugar de constructores para servicios nuevos.
- Usar `eci-*` compartidos antes de crear controles visuales nuevos.
- No hardcodear textos visibles: todo texto debe pasar por las traducciones.
- Respetar los tokens globales de `src/styles.css`.

