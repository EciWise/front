import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Conversation, Message } from '../chat.models';
import { ChatService } from '../chat.service';
import { MessageThreadComponent } from './message-thread';

interface ChatStub {
  readonly activeConversation: ReturnType<typeof signal<Conversation | null>>;
  readonly currentUserId: ReturnType<typeof signal<string | null>>;
  readonly messages: ReturnType<typeof signal<Message[]>>;
  readonly loading: ReturnType<typeof signal<boolean>>;
  readonly typingNames: ReturnType<typeof signal<string[]>>;
  readonly error: ReturnType<typeof signal<string | null>>;
  readonly replyingTo: ReturnType<typeof signal<Message | null>>;
  readonly closeThread: ReturnType<typeof vi.fn>;
  readonly cancelReply: ReturnType<typeof vi.fn>;
  readonly notifyTyping: ReturnType<typeof vi.fn>;
  readonly sendText: ReturnType<typeof vi.fn>;
  readonly sendWithFile: ReturnType<typeof vi.fn>;
  readonly canModerate: ReturnType<typeof signal<boolean>>;
  readonly toggleReaction: ReturnType<typeof vi.fn>;
  readonly startReply: ReturnType<typeof vi.fn>;
  readonly editMessage: ReturnType<typeof vi.fn>;
  readonly togglePin: ReturnType<typeof vi.fn>;
  readonly censorMessage: ReturnType<typeof vi.fn>;
  readonly deleteMessage: ReturnType<typeof vi.fn>;
}

function conv(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'c1',
    type: 'GROUP',
    name: 'Proyecto',
    description: null,
    createdBy: 'me',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    anonymous: true,
    participants: [
      { userId: 'me', userName: 'Yo', userRol: 'estudiante', joinedAt: '2026-01-01T00:00:00Z' },
      { userId: 'u2', userName: 'Ana', userRol: 'tutor', joinedAt: '2026-01-01T00:00:00Z' },
    ],
    ...overrides,
  };
}

function msg(overrides: Partial<Message> = {}): Message {
  return {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'u2',
    senderName: 'Ana',
    contentDisplay: 'Fijado',
    contentOriginal: null,
    autoCensored: false,
    manuallyCensored: false,
    censoredByName: null,
    censoredAt: null,
    edited: false,
    editedAt: null,
    deleted: false,
    createdAt: '2026-01-01T10:00:00Z',
    replyTo: null,
    pinned: true,
    pinnedBy: 'me',
    pinnedAt: '2026-01-01T10:01:00Z',
    reactions: [],
    readBy: [],
    attachment: null,
    ...overrides,
  };
}

describe('MessageThreadComponent', () => {
  let chat: ChatStub;
  let fixture: ComponentFixture<MessageThreadComponent>;

  beforeEach(async () => {
    chat = {
      activeConversation: signal<Conversation | null>(conv()),
      currentUserId: signal<string | null>('me'),
      messages: signal<Message[]>([msg()]),
      loading: signal(false),
      typingNames: signal<string[]>(['Ana']),
      error: signal<string | null>(null),
      replyingTo: signal<Message | null>(null),
      closeThread: vi.fn(),
      cancelReply: vi.fn(),
      notifyTyping: vi.fn(),
      sendText: vi.fn(),
      sendWithFile: vi.fn(),
      canModerate: signal(false),
      toggleReaction: vi.fn(),
      startReply: vi.fn(),
      editMessage: vi.fn(),
      togglePin: vi.fn(),
      censorMessage: vi.fn(),
      deleteMessage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MessageThreadComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageThreadComponent);
  });

  it('renderiza grupo con fijados, typing y cierre', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.thread__title')?.textContent).toContain('Proyecto');
    expect(el.querySelector('.thread__meta')?.textContent).toContain('2');
    expect(el.querySelector('.thread__pin')?.textContent).toContain('Fijado');
    expect(el.querySelector('.thread__typing')?.textContent).toContain('Ana');

    el.querySelector<HTMLButtonElement>('.thread__header .icon-button')?.click();
    expect(chat.closeThread).toHaveBeenCalled();
  });

  it('renderiza individuales usando el otro participante y muestra errores', () => {
    chat.activeConversation.set(conv({ type: 'INDIVIDUAL', name: null, anonymous: false }));
    chat.messages.set([]);
    chat.typingNames.set([]);
    chat.error.set('errors.server');

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.thread__title')?.textContent).toContain('Ana');
    expect(el.querySelector('.thread__meta')).toBeNull();
    expect(el.querySelector('.thread__hint')?.textContent).toContain('mensajes');
    expect(el.querySelector('.thread__error')?.textContent).toContain('servidor');
  });

  it('muestra loading y titulo vacio cuando no hay conversacion activa', () => {
    chat.activeConversation.set(null);
    chat.loading.set(true);
    chat.messages.set([]);

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.thread__title')?.textContent?.trim()).toBe('');
    expect(el.querySelector('.thread__hint')?.textContent).toContain('Cargando');
  });
});
