import { inject } from '@angular/core';
import { AUTH_CONFIG } from '../auth/auth.config';
import { IA_CONFIG } from '../ia/ia.config';
import { STUDY_CONFIG } from '../study/study.config';
import { TALK_CONFIG } from '../talk/talk.config';
import { TODO_CONFIG } from '../todo/todo.config';
import { NOTIFICATIONS_CONFIG } from '../notifications/notifications.config';
import { TUTORING_CONFIG } from '../tutoring/tutoring.config';
import { GAMIFICATION_CONFIG } from '../gamification/gamification.config';
import { MATERIALS_CONFIG } from '../../features/student/materials/materials.config';
import { stripTrailingSlashes } from './url.util';

/**
 * Bases de URL de nuestros propios microservicios (auth, IA, study, talk, todo).
 * Debe llamarse dentro de un contexto de inyección (p. ej. un interceptor
 * funcional). Centraliza la lista para que el adjuntar-token y el manejo de
 * errores 401/403 compartan exactamente los mismos hosts.
 */
export function ownApiHosts(): string[] {
  const auth = inject(AUTH_CONFIG);
  const ia = inject(IA_CONFIG);
  const study = inject(STUDY_CONFIG);
  const talk = inject(TALK_CONFIG);
  const todo = inject(TODO_CONFIG);
  const notifications = inject(NOTIFICATIONS_CONFIG);
  const materials = inject(MATERIALS_CONFIG);
  const tutoring = inject(TUTORING_CONFIG);
  const gamification = inject(GAMIFICATION_CONFIG);
  return [
    auth.apiBaseUrl,
    ia.performanceApiUrl,
    ia.dropoutApiUrl,
    study.studyApiUrl,
    talk.talkApiUrl,
    todo.todoApiUrl,
    notifications.notificationsApiUrl,
    materials.materialsApiUrl,
    tutoring.tutoringApiUrl,
    gamification.gamificationApiUrl,
  ]
    .filter((host): host is string => !!host)
    .map((host) => stripTrailingSlashes(host));
}

/** ¿La URL apunta a alguno de nuestros servicios? */
export function isOwnApiUrl(url: string, hosts: readonly string[]): boolean {
  return hosts.some((host) => {
    const base = stripTrailingSlashes(host);
    return url === base || url.startsWith(`${base}/`);
  });
}
