import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Message } from '../chat.models';
import { ChatService } from '../chat.service';
import { MessageItemComponent } from './message-item';

interface ChatStub {
  readonly currentUserId: ReturnType<typeof signal<string | null>>;
  readonly canModerate: ReturnType<typeof signal<boolean>>;
  readonly toggleReaction: ReturnType<typeof vi.fn>;
  readonly startReply: ReturnType<typeof vi.fn>;
  readonly editMessage: ReturnType<typeof vi.fn>;
  readonly togglePin: ReturnType<typeof vi.fn>;
  readonly censorMessage: ReturnType<typeof vi.fn>;
  readonly deleteMessage: ReturnType<typeof vi.fn>;
}

function message(overrides: Partial<Message> = {}): Message {
  return {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'other',
    senderName: 'Ana',
    contentDisplay: 'Hola',
    contentOriginal: null,
    autoCensored: false,
    manuallyCensored: false,
    censoredByName: null,
    censoredAt: null,
    edited: false,
    editedAt: null,
    deleted: false,
    createdAt: '2026-01-01T10:30:00Z',
    replyTo: null,
    pinned: false,
    pinnedBy: null,
    pinnedAt: null,
    reactions: [],
    readBy: [],
    attachment: null,
    ...overrides,
  };
}

describe('MessageItemComponent', () => {
  let chat: ChatStub;
  let fixture: ComponentFixture<MessageItemComponent>;

  beforeEach(async () => {
    chat = {
      currentUserId: signal<string | null>('me'),
      canModerate: signal(true),
      toggleReaction: vi.fn(),
      startReply: vi.fn(),
      editMessage: vi.fn(),
      togglePin: vi.fn(),
      censorMessage: vi.fn(),
      deleteMessage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MessageItemComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageItemComponent);
  });

  it('muestra mensaje recibido con respuesta, adjunto, acciones y reacciones', () => {
    fixture.componentRef.setInput(
      'message',
      message({
        replyTo: {
          messageId: 'r1',
          senderId: 'u2',
          senderName: 'Luis',
          snippet: 'Pregunta',
          deleted: false,
        },
        attachment: {
          id: 'a1',
          fileName: 'guia.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1000,
          downloadUrl: '/guia.pdf',
          isImage: false,
        },
        reactions: [{ emoji: '👍', count: 2, userIds: ['me', 'u2'], userNames: ['Yo', 'Ana'] }],
      }),
    );

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.msg__author')?.textContent).toContain('Ana');
    expect(el.querySelector('.msg__reply')?.textContent).toContain('Luis');
    expect(el.querySelector('.msg__file')?.textContent).toContain('guia.pdf');
    expect(el.querySelector('.msg__reaction--on')?.textContent).toContain('👍');

    el.querySelector<HTMLButtonElement>('.msg__reaction')?.click();
    expect(chat.toggleReaction).toHaveBeenCalledWith('m1', '👍');

    // Abre el menú de 3 puntos y pulsa "Responder" (primer ítem del menú).
    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.msg__menu-item').item(0).click();
    expect(chat.startReply).toHaveBeenCalledWith(expect.objectContaining({ id: 'm1' }));
  });

  it('edita mensajes propios, muestra lectura y guarda el cambio', async () => {
    fixture.componentRef.setInput(
      'message',
      message({
        senderId: 'me',
        edited: true,
        readBy: [
          { userId: 'me', userName: 'Yo', readAt: '2026-01-01T10:31:00Z' },
          { userId: 'u2', userName: 'Ana', readAt: '2026-01-01T10:32:00Z' },
        ],
      }),
    );

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.msg--mine')).not.toBeNull();
    expect(el.querySelector('.msg__author--mine')?.textContent).toContain('Tú');
    expect(el.querySelector('.msg__read')?.textContent).toContain('1');
    // Abre el menú y pulsa "Editar" (2º ítem: Responder, Editar, …).
    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.msg__menu-item').item(1).click();
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>('.msg__edit-input');
    input!.value = 'Editado';
    input!.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.msg__edit .icon-button')?.click();

    expect(chat.editMessage).toHaveBeenCalledWith('m1', 'Editado');
  });

  it('oculta nombres en anonimos, muestra imagen y permite moderar/censurar/borrar', () => {
    fixture.componentRef.setInput('anonymous', true);
    fixture.componentRef.setInput('viewerIsCreator', false);
    fixture.componentRef.setInput(
      'message',
      message({
        attachment: {
          id: 'img',
          fileName: 'foto.png',
          mimeType: 'image/png',
          sizeBytes: 50,
          downloadUrl: '/foto.png',
          isImage: true,
        },
      }),
    );

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.msg__author')?.textContent).toContain('An');
    expect(el.querySelector('.msg__image')?.getAttribute('alt')).toBe('foto.png');

    // Mensaje ajeno con moderación: el menú tiene Responder, Fijar, Censurar, Eliminar.
    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    const items = el.querySelectorAll<HTMLButtonElement>('.msg__menu-item');
    items.item(1).click(); // Fijar
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.msg__menu-item').item(2).click(); // Censurar
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.msg__menu-item').item(3).click(); // Eliminar

    expect(chat.togglePin).toHaveBeenCalledWith('m1');
    expect(chat.censorMessage).toHaveBeenCalledWith('m1');
    expect(chat.deleteMessage).toHaveBeenCalledWith('m1');
  });

  it('muestra mensajes censurados o eliminados sin acciones', () => {
    fixture.componentRef.setInput(
      'message',
      message({
        manuallyCensored: true,
        censoredByName: 'Tutor',
        deleted: true,
        reactions: [{ emoji: '❤️', count: 1, userIds: ['u2'], userNames: ['Ana'] }],
      }),
    );

    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.msg__bubble--censored')).not.toBeNull();
    expect(el.querySelector('.msg__flag')?.textContent).toContain('Tutor');
    expect(el.querySelector('.msg__actions')).toBeNull();
    expect(el.querySelector('.msg__reactions')).toBeNull();
  });

  it('abre el menu de 3 puntos y reacciona desde la paleta', () => {
    fixture.componentRef.setInput('message', message());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    el.querySelector<HTMLButtonElement>('.msg__actions button[aria-haspopup]')?.click();
    fixture.detectChanges();
    el.querySelector<HTMLButtonElement>('.msg__menu-emojis .msg__emoji')?.click();

    expect(chat.toggleReaction).toHaveBeenCalledWith('m1', expect.any(String));
  });
});
