import { InjectionToken } from '@angular/core';

export interface MaterialsConfig {
  readonly materialsApiUrl: string;
}

export const MATERIALS_CONFIG = new InjectionToken<MaterialsConfig>('MATERIALS_CONFIG', {
  providedIn: 'root',
  factory: () => ({ materialsApiUrl: 'http://localhost:3005' }),
});
