import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { CensoredWord } from '../chat.models';
import { ChatService } from '../chat.service';
import { CensoredWordsComponent } from './censored-words';

interface ChatStub {
  readonly censoredWords: ReturnType<typeof signal<CensoredWord[]>>;
  readonly error: ReturnType<typeof signal<string | null>>;
  readonly showList: ReturnType<typeof vi.fn>;
  readonly addCensoredWord: ReturnType<typeof vi.fn>;
  readonly removeCensoredWord: ReturnType<typeof vi.fn>;
}

interface CensoredWordsInternals {
  readonly draft: { set: (value: string) => void };
  readonly add: () => void;
}

function word(id: string, active = true): CensoredWord {
  return {
    id,
    word: id === 'w1' ? 'spam' : 'oculto',
    addedByName: 'Admin',
    active,
    createdAt: '2026-01-01T00:00:00Z',
  };
}

describe('CensoredWordsComponent', () => {
  let chat: ChatStub;
  let fixture: ComponentFixture<CensoredWordsComponent>;

  beforeEach(async () => {
    chat = {
      censoredWords: signal<CensoredWord[]>([]),
      error: signal<string | null>(null),
      showList: vi.fn(),
      addCensoredWord: vi.fn(),
      removeCensoredWord: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CensoredWordsComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CensoredWordsComponent);
  });

  it('muestra estado vacio, valida draft y agrega palabra recortada', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('.cwords__input')!;
    const component = fixture.componentInstance as unknown as CensoredWordsInternals;

    expect(el.querySelector('.cwords__empty')?.textContent).toContain('palabras');
    expect(el.querySelector<HTMLButtonElement>('.cwords__add button')?.disabled).toBe(true);

    component.draft.set('  fraude  ');
    fixture.detectChanges();
    component.add();
    fixture.detectChanges();

    expect(chat.addCensoredWord).toHaveBeenCalledWith('fraude');
    expect(input.value).toBe('');
  });

  it('lista solo palabras activas, permite borrar, volver y mostrar errores', () => {
    chat.censoredWords.set([word('w1'), word('w2', false)]);
    chat.error.set('errors.server');

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.cwords__item')).toHaveLength(1);
    expect(el.querySelector('.cwords__word')?.textContent).toContain('spam');
    expect(el.querySelector('.cwords__error')?.textContent).toContain('servidor');

    el.querySelector<HTMLButtonElement>('.cwords__item button')?.click();
    expect(chat.removeCensoredWord).toHaveBeenCalledWith('w1');

    el.querySelector<HTMLButtonElement>('.cwords__header button')?.click();
    expect(chat.showList).toHaveBeenCalled();
  });
});
