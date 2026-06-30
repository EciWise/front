import { InjectionToken } from '@angular/core';

export interface TutoringConfig {
  readonly tutoringApiUrl: string;
}

export const TUTORING_CONFIG = new InjectionToken<TutoringConfig>('TUTORING_CONFIG', {
  providedIn: 'root',
  factory: () => ({ tutoringApiUrl: 'http://localhost:3006' }),
});
