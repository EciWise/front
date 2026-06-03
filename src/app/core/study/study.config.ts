import { InjectionToken } from '@angular/core';

/** URL del microservicio ECIWISE-STUDY (flashcards y repetición espaciada). */
export interface StudyConfig {
  /** Base del servicio de estudio. Sin barra final. */
  readonly studyApiUrl: string;
}

export const STUDY_CONFIG = new InjectionToken<StudyConfig>('STUDY_CONFIG', {
  providedIn: 'root',
  factory: () => ({ studyApiUrl: 'http://localhost:8082' }),
});
