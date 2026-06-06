import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Conversation } from '../chat.models';
import { ChatService } from '../chat.service';
import { ConversationListComponent } from './conversation-list';

interface ChatStub {
  readonly conversations: ReturnType<typeof signal<Conversation[]>>;
  readonly error: ReturnType<typeof signal<string | null>>;
  readonly isAdmin: ReturnType<typeof signal<boolean>>;
  readonly currentUserId: ReturnType<typeof vi.fn>;
  readonly showNew: ReturnType<typeof vi.fn>;
  readonly showModeration: ReturnType<typeof vi.fn>;
  readonly openConversation: ReturnType<typeof vi.fn>;
}

function participant(userId: string, userName: string) {
  return { userId, userName, userRol: 'estudiante', joinedAt: '2026-01-01T00:00:00Z' };
}

function conversation(overrides: Partial<Conversation>): Conversation {
  return {
    id: 'c1',
    type: 'GROUP',
    name: 'Grupo',
    description: null,
    createdBy: 'me',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    anonymous: false,
    participants: [participant('me', 'Yo'), participant('u2', 'Ana')],
    ...overrides,
  };
}

describe('ConversationListComponent', () => {
  let chat: ChatStub;
  let fixture: ComponentFixture<ConversationListComponent>;

  beforeEach(async () => {
    chat = {
      conversations: signal<Conversation[]>([]),
      error: signal<string | null>(null),
      isAdmin: signal(false),
      currentUserId: vi.fn(() => 'me'),
      showNew: vi.fn(),
      showModeration: vi.fn(),
      openConversation: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ConversationListComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationListComponent);
  });

  it('muestra el estado vacio y permite abrir el formulario nuevo', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.conv-list__empty')).not.toBeNull();
    el.querySelector<HTMLButtonElement>('.conv-list__new')?.click();

    expect(chat.showNew).toHaveBeenCalled();
    expect(el.querySelector('[lucideShieldCheck]')).toBeNull();
  });

  it('renderiza grupos e individuales y abre la conversacion seleccionada', () => {
    chat.conversations.set([
      conversation({ id: 'g1', type: 'GROUP', name: 'Proyecto' }),
      conversation({
        id: 'i1',
        type: 'INDIVIDUAL',
        name: null,
        participants: [participant('me', 'Yo'), participant('u3', 'Luis')],
      }),
      conversation({
        id: 'i2',
        type: 'INDIVIDUAL',
        name: null,
        participants: [participant('solo', 'Sin par')],
      }),
    ]);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const titles = [...el.querySelectorAll('.conv-item__title')].map((node) =>
      node.textContent?.trim(),
    );

    expect(titles).toEqual(['Proyecto', 'Luis', 'Sin par']);
    expect(el.querySelector('.conv-item__meta')?.textContent).toContain('2');

    el.querySelector<HTMLButtonElement>('.conv-item')?.click();
    expect(chat.openConversation).toHaveBeenCalledWith('g1');
  });

  it('muestra error y acceso de moderacion para admin', () => {
    chat.error.set('errors.server');
    chat.isAdmin.set(true);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.conv-list__error')?.textContent).toContain('servidor');
    el.querySelectorAll<HTMLButtonElement>('button').item(1).click();
    expect(chat.showModeration).toHaveBeenCalled();
  });
});
