import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from './static-translate.loader';
import { AppLanguage, I18nService } from './i18n.service';
import { LanguageSwitchComponent } from './language-switch';

describe('LanguageSwitchComponent', () => {
  let fixture: ComponentFixture<LanguageSwitchComponent>;
  let use: ReturnType<typeof vi.fn>;

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const trigger = (): HTMLButtonElement =>
    el().querySelector('.lang-menu__trigger') as HTMLButtonElement;

  beforeEach(async () => {
    const lang = signal<AppLanguage>('es');
    use = vi.fn((next: AppLanguage) => lang.set(next));

    await TestBed.configureTestingModule({
      imports: [LanguageSwitchComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: I18nService,
          useValue: {
            lang: lang.asReadonly(),
            supportedLanguages: ['es', 'en', 'fr'] as readonly AppLanguage[],
            use,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSwitchComponent);
    fixture.detectChanges();
  });

  it('abre el listbox y selecciona un idioma cerrando el panel', () => {
    trigger().click();
    fixture.detectChanges();

    const options = el().querySelectorAll('.lang-menu__option');
    expect(options.length).toBe(3);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    (options[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(use).toHaveBeenCalledWith('en');
    expect(el().querySelector('.lang-menu__panel')).toBeNull();
    expect(trigger().textContent).toContain('EN');
  });

  it('cierra con Escape y con click fuera del host', () => {
    trigger().click();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(el().querySelector('.lang-menu__panel')).toBeNull();

    trigger().click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('.lang-menu__panel')).toBeNull();
  });
});
