import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { es } from './translations/es';
import { en } from './translations/en';

const DICTIONARIES: Record<string, TranslationObject> = {
  es,
  en,
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
