import { InjectionToken } from '@angular/core';

export interface GamificationConfig {
  readonly gamificationApiUrl: string;
}

export const GAMIFICATION_CONFIG = new InjectionToken<GamificationConfig>('GAMIFICATION_CONFIG', {
  providedIn: 'root',
  factory: () => ({ gamificationApiUrl: 'http://localhost:8084' }),
});
