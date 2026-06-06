import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Conversation } from '../chat.models';
import { ChatService } from '../chat.service';
import { ConversationListComponent } from './conversation-list';

interface ChatStub {
  readonly directChats: ReturnType<typeof signal<Conversation[]>>;
  readonly groupChats: ReturnType<typeof signal<Conversation[]>>;
  readonly hasHidden: ReturnType<typeof signal<boolean>>;
  readonly showHidden: ReturnType<typeof signal<boolean>>;
  readonly error: ReturnType<typeof signal<string | null>>;
  readonly isAdmin: ReturnType<typeof signal<boolean>>;
  readonly currentUserId: ReturnType<typeof vi.fn>;
  readonly showNew: ReturnType<typeof vi.fn>;
  readonly showModeration: ReturnType<typeof vi.fn>;
  readonly openConversation: ReturnType<typeof vi.fn>;
  readonly toggleShowHidden: ReturnType<typeof vi.fn>;
  readonly hideConversation: ReturnType<typeof vi.fn>;
  readonly unhideConversation: ReturnType<typeof vi.fn>;
  readonly deleteConversation: ReturnType<typeof vi.fn>;
  readonly isHidden: ReturnType<typeof vi.fn>;
  readonly hasUnread: ReturnType<typeof vi.fn>;
  readonly isCreator: ReturnType<typeof vi.fn>;
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
      directChats: signal<Conversation[]>([]),
      groupChats: signal<Conversation[]>([]),
      hasHidden: signal(false),
      showHidden: signal(false),
      error: signal<string | null>(null),
      isAdmin: signal(false),
      currentUserId: vi.fn(() => 'me'),
      showNew: vi.fn(),
      showModeration: vi.fn(),
      openConversation: vi.fn(),
      toggleShowHidden: vi.fn(),
      hideConversation: vi.fn(),
      unhideConversation: vi.fn(),
      deleteConversation: vi.fn(),
      isHidden: vi.fn(() => false),
      hasUnread: vi.fn(() => false),
      isCreator: vi.fn(() => true),
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

  it('renderiza secciones separadas y abre la conversacion seleccionada', () => {
    chat.groupChats.set([conversation({ id: 'g1', type: 'GROUP', name: 'Proyecto' })]);
    chat.directChats.set([
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

    // Las secciones de chats directos se muestran antes que los grupos.
    expect(titles).toEqual(['Luis', 'Sin par', 'Proyecto']);
    expect(el.querySelectorAll('.conv-list__section').length).toBe(2);
    expect(el.querySelector('.conv-item__meta')?.textContent).toContain('2');

    el.querySelector<HTMLButtonElement>('.conv-item__open')?.click();
    expect(chat.openConversation).toHaveBeenCalledWith('i1');
  });

  it('permite ocultar y eliminar (creador) desde el menu de 3 puntos', () => {
    chat.groupChats.set([conversation({ id: 'g1', type: 'GROUP', name: 'Proyecto' })]);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('.conv-item__menu-wrap button[aria-haspopup]')?.click();
    fixture.detectChanges();

    const items = el.querySelectorAll<HTMLButtonElement>('.conv-item__menu-item');
    items.item(0).click(); // Ocultar
    expect(chat.hideConversation).toHaveBeenCalledWith('g1');

    el.querySelector<HTMLButtonElement>('.conv-item__menu-wrap button[aria-haspopup]')?.click();
    fixture.detectChanges();
    // Segundo ítem: Eliminar (visible por ser creador) → pide confirmación.
    el.querySelectorAll<HTMLButtonElement>('.conv-item__menu-item').item(1).click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.conv-item__confirm-yes')?.click();
    expect(chat.deleteConversation).toHaveBeenCalledWith('g1');
  });

  it('muestra error y acceso de moderacion para admin', () => {
    chat.error.set('errors.server');
    chat.isAdmin.set(true);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.conv-list__error')?.textContent).toContain('servidor');
    el.querySelectorAll<HTMLButtonElement>('.conv-list__bar-actions button').item(0).click();
    expect(chat.showModeration).toHaveBeenCalled();
  });
});
