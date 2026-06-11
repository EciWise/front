# Vision general

ECIWISE+ Front es una aplicacion Angular 21 con componentes standalone, SSR, hidratacion del cliente, rutas lazy por rol y una capa visual compartida. El front agrupa experiencias para estudiantes, tutores y administradores.

## Objetivos del frontend

- Entregar una interfaz institucional, sobria y responsive para ECIWISE+.
- Centralizar autenticacion, autorizacion, tema, accesibilidad, i18n, notificaciones y configuracion runtime.
- Separar funcionalidades por dominios: auth, estudiante, tutor, admin, aprendizaje, chat, IA y ayuda.
- Facilitar integraciones backend mediante servicios Angular aislados por dominio.
- Mantener UI reutilizable con componentes compartidos y tokens CSS globales.

## Stack principal

| Area | Tecnologia |
| --- | --- |
| Framework | Angular 21 |
| Componentes | Standalone components con `ChangeDetectionStrategy.OnPush` |
| Estado UI | `signal`, `computed`, servicios inyectables |
| Formularios | Reactive Forms y Signal Forms segun modulo |
| Rutas | Angular Router con lazy loading |
| HTTP | `HttpClient` con interceptores |
| SSR | `@angular/ssr` con Express |
| i18n | `@ngx-translate/core` con loader estatico |
| UI | CSS global con tokens, componentes `shared/ui`, Lucide icons |
| Testing | Angular unit test builder sobre Vitest, Playwright para e2e |

## Dominios funcionales

- **Publico:** landing, login, registro, callback OAuth y pagina 404.
- **Estudiante:** dashboard, tutorias, materiales, juegos, estudio, aprendizaje, tareas, logros, foros y perfil.
- **Tutor:** dashboard, estudiantes asignados, agenda, disponibilidad, solicitudes, historial y aprendizaje.
- **Admin:** dashboard, usuarios, estadisticas, predicciones, asignaciones y aprendizaje.
- **Transversal:** chat flotante, asistente IA, notificaciones, tema, accesibilidad e idioma.

## Principios de implementacion

- Preferir componentes standalone con HTML y CSS separados cuando ya exista ese patron.
- Mantener la logica de negocio fuera de templates complejos y dentro de servicios o metodos protegidos.
- Usar `inject()` en lugar de constructores para servicios nuevos.
- Usar `eci-*` compartidos antes de crear controles visuales nuevos.
- No hardcodear textos visibles: todo texto debe pasar por las traducciones.
- Respetar los tokens globales de `src/styles.css`.

