import { Injectable } from '@angular/core';

export interface AppEnv {
  apiBaseUrl?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class EnvService {
  private env: AppEnv = {};

  async load(): Promise<void> {
    try {
      const res = await fetch('/assets/env.json', { cache: 'no-cache' });
      if (res.ok) {
        this.env = await res.json();
      }
    } catch (e) {
      // ignore, keep defaults
    }
  }

  get(key: string, fallback?: string): string | undefined {
    const v = (this.env as any)[key] ?? (window as any)['__APP_ENV__']?.[key];
    return v ?? fallback;
  }
}
