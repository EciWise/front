import { InjectionToken } from '@angular/core';

/** URL del microservicio ECIWISE-TODO (tareas y planificación). */
export interface TodoConfig {
  /** Base del servicio de tareas. Sin barra final. */
  readonly todoApiUrl: string;
}

export const TODO_CONFIG = new InjectionToken<TodoConfig>('TODO_CONFIG', {
  providedIn: 'root',
  factory: () => ({ todoApiUrl: 'http://localhost:8083' }),
});
