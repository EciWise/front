import { DOCUMENT, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'eciwise.theme';

/**
 * Gestiona el tema claro/oscuro. Persiste la preferencia en localStorage,
 * respeta prefers-color-scheme por defecto y aplica el atributo data-theme
 * en el elemento <html>. Seguro en SSR.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _theme = signal<ThemeMode>('light');
  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  /** Lee la preferencia guardada o del sistema y la aplica. */
  init(): void {
    if (!this.isBrowser) {
      return;
    }
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    this.setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle(): void {
    this.setTheme(this._theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    this._theme.set(mode);
    this.document.documentElement.setAttribute('data-theme', mode);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  }
}
