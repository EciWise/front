import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { DirectoryUser } from '../chat.models';
import { ChatService } from '../chat.service';
import { UsersDirectoryService } from '../users-directory.service';
import { NewConversationComponent } from './new-conversation';

interface ChatStub {
  readonly currentUserId: ReturnType<typeof vi.fn>;
  readonly showList: ReturnType<typeof vi.fn>;
  readonly createIndividual: ReturnType<typeof vi.fn>;
  readonly createGroup: ReturnType<typeof vi.fn>;
  readonly error: ReturnType<typeof signal<string | null>>;
}

const ana: DirectoryUser = {
  id: 'u2',
  name: 'Ana Diaz',
  email: 'ana@escuelaing.edu.co',
  rol: 'estudiante',
};

const me: DirectoryUser = {
  id: 'me',
  name: 'Yo',
  email: 'yo@escuelaing.edu.co',
  rol: 'estudiante',
};

describe('NewConversationComponent', () => {
  let chat: ChatStub;
  let directory: { readonly search: ReturnType<typeof vi.fn> };
  let fixture: ComponentFixture<NewConversationComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    chat = {
      currentUserId: vi.fn(() => 'me'),
      showList: vi.fn(),
      createIndividual: vi.fn(),
      createGroup: vi.fn(),
      error: signal<string | null>(null),
    };
    directory = { search: vi.fn(() => of([me, ana])) };

    await TestBed.configureTestingModule({
      imports: [NewConversationComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
        { provide: UsersDirectoryService, useValue: directory },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewConversationComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  async function search(term: string): Promise<HTMLElement> {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement>('.new-conv__search input')!;
    input.value = term;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await vi.advanceTimersByTimeAsync(300);
    fixture.detectChanges();
    return el;
  }

  it('busca usuarios, filtra al usuario actual y crea conversacion individual', async () => {
    const el = await search('ana');

    expect(directory.search).toHaveBeenCalledWith('ana');
    expect(el.querySelector('.new-conv__result-name')?.textContent).toContain('Ana Diaz');
    expect(el.textContent).not.toContain('Yo');

    el.querySelector<HTMLButtonElement>('.new-conv__result')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.new-conv__create')?.click();

    expect(chat.createIndividual).toHaveBeenCalledWith(ana);
  });

  it('crea grupo anonimo con nombre y varios seleccionados', async () => {
    const el = await search('ana');
    el.querySelectorAll<HTMLButtonElement>('.new-conv__type').item(1).click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.new-conv__result')?.click();
    const name = el.querySelector<HTMLInputElement>('.new-conv__field')!;
    name.value = 'Proyecto';
    name.dispatchEvent(new Event('input', { bubbles: true }));
    const anonymous = el.querySelector<HTMLInputElement>('.new-conv__check input')!;
    anonymous.click();
    fixture.detectChanges();

    el.querySelector<HTMLButtonElement>('.new-conv__create')?.click();

    expect(chat.createGroup).toHaveBeenCalledWith('Proyecto', [ana], true);
  });

  it('recorta seleccion al volver a individual, permite deseleccionar y maneja errores', async () => {
    directory.search.mockReturnValueOnce(throwError(() => new Error('boom')));
    let el = await search('x');
    expect(el.querySelector('.new-conv__result')).toBeNull();

    directory.search.mockReturnValueOnce(
      of([
        ana,
        { id: 'u3', name: 'Luis', email: 'luis@escuelaing.edu.co', rol: 'tutor' },
      ]),
    );
    el = await search('a');
    el.querySelectorAll<HTMLButtonElement>('.new-conv__type').item(1).click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.new-conv__result').item(0).click();
    el.querySelectorAll<HTMLButtonElement>('.new-conv__result').item(1).click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.new-conv__chip')).toHaveLength(2);

    el.querySelectorAll<HTMLButtonElement>('.new-conv__type').item(0).click();
    fixture.detectChanges();
    expect(el.querySelectorAll('.new-conv__chip')).toHaveLength(1);

    el.querySelector<HTMLButtonElement>('.new-conv__chip button')?.click();
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('.new-conv__create')?.disabled).toBe(true);

    chat.error.set('chat.createFailed');
    fixture.detectChanges();
    expect(el.querySelector('.new-conv__error')?.textContent).toContain('chat.createFailed');

    el.querySelector<HTMLButtonElement>('.new-conv__header button')?.click();
    expect(chat.showList).toHaveBeenCalled();
  });
});
