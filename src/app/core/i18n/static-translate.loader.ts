import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { es } from './translations/es';
import { en } from './translations/en';
import { de } from './translations/de';
import { pt } from './translations/pt';
import { fr } from './translations/fr';

export const DICTIONARIES: Record<string, TranslationObject> = {
  es: es as unknown as TranslationObject,
  en: en as unknown as TranslationObject,
  de: de as unknown as TranslationObject,
  pt: pt as unknown as TranslationObject,
  fr: fr as unknown as TranslationObject,
};

/**
 * Loader de traducciones en-bundle. Evita peticiones HTTP, lo que lo hace
 * determinista y seguro durante el prerender de SSR.
 */
@Injectable()
export class StaticTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of(DICTIONARIES[lang] ?? DICTIONARIES['es']);
  }
}
