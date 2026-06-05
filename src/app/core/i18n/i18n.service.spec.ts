import { TestBed } from '@angular/core/testing';
import { TranslateLoader, TranslateService, provideTranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { I18nService } from './i18n.service';
import { StaticTranslateLoader } from './static-translate.loader';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    });
    service = TestBed.inject(I18nService);
  });

  it('cambia el idioma y lo persiste', () => {
    service.use('en');
    expect(service.lang()).toBe('en');
    expect(localStorage.getItem('eciwise.lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('recorre los idiomas soportados', () => {
    service.use('es');
    service.toggle();
    expect(service.lang()).toBe('en');
    service.toggle();
    expect(service.lang()).toBe('de');
  });

  it('carga traducciones propias para los idiomas nuevos', async () => {
    const loader = TestBed.inject(TranslateLoader);
    const de = await firstValueFrom(loader.getTranslation('de'));
    const pt = await firstValueFrom(loader.getTranslation('pt'));
    const fr = await firstValueFrom(loader.getTranslation('fr'));

    expect(de['common']['login']).toBe('Anmelden');
    expect(pt['common']['login']).toBe('Entrar');
    expect(fr['common']['login']).toBe('Se connecter');
  });

  it('aplica los idiomas nuevos en TranslateService', () => {
    const translate = TestBed.inject(TranslateService);

    service.init();
    service.use('de');
    expect(translate.instant('common.login')).toBe('Anmelden');

    service.use('pt');
    expect(translate.instant('common.login')).toBe('Entrar');

    service.use('fr');
    expect(translate.instant('common.login')).toBe('Se connecter');
  });
});
