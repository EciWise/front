import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'es' | 'en';

const STORAGE_KEY = 'eciwise.lang';
const SUPPORTED: readonly AppLanguage[] = ['es', 'en'];

/**
 * Gestiona el idioma activo (ES/EN). Persiste la preferencia y sincroniza
 * TranslateService. Seguro en SSR.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _lang = signal<AppLanguage>('es');
  readonly lang = this._lang.asReadonly();

  init(): void {
    this.translate.addLangs([...SUPPORTED]);
    const stored = this.isBrowser
      ? (localStorage.getItem(STORAGE_KEY) as AppLanguage | null)
      : null;
    this.use(stored && SUPPORTED.includes(stored) ? stored : 'es');
  }

  use(lang: AppLanguage): void {
    this._lang.set(lang);
    this.translate.use(lang);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  }

  toggle(): void {
    this.use(this._lang() === 'es' ? 'en' : 'es');
  }
}
