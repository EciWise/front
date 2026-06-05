import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DICTIONARIES } from './static-translate.loader';

export type AppLanguage = 'es' | 'en' | 'de' | 'pt' | 'fr';

const STORAGE_KEY = 'eciwise.lang';
export const SUPPORTED_LANGUAGES: readonly AppLanguage[] = ['es', 'en', 'de', 'pt', 'fr'];

/**
 * Gestiona el idioma activo. Persiste la preferencia y sincroniza
 * TranslateService. Seguro en SSR.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _lang = signal<AppLanguage>('es');
  readonly lang = this._lang.asReadonly();
  readonly supportedLanguages = SUPPORTED_LANGUAGES;

  init(): void {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    for (const lang of SUPPORTED_LANGUAGES) {
      this.translate.setTranslation(lang, DICTIONARIES[lang], false);
    }
    const stored = this.isBrowser
      ? (localStorage.getItem(STORAGE_KEY) as AppLanguage | null)
      : null;
    this.use(stored && SUPPORTED_LANGUAGES.includes(stored) ? stored : 'es');
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
    const current = SUPPORTED_LANGUAGES.indexOf(this._lang());
    this.use(SUPPORTED_LANGUAGES[(current + 1) % SUPPORTED_LANGUAGES.length] ?? 'es');
  }
}
