import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { Message } from '../chat.models';
import { ChatService } from '../chat.service';
import { MessageComposerComponent } from './message-composer';

interface ChatStub {
  readonly replyingTo: ReturnType<typeof signal<Message | null>>;
  readonly cancelReply: ReturnType<typeof vi.fn>;
  readonly notifyTyping: ReturnType<typeof vi.fn>;
  readonly sendText: ReturnType<typeof vi.fn>;
  readonly sendWithFile: ReturnType<typeof vi.fn>;
}

interface ComposerInternals {
  readonly draft: () => string;
  readonly onInput: (value: string) => void;
  readonly submit: () => void;
}

function replyMessage(): Message {
  return {
    id: 'm1',
    conversationId: 'c1',
    senderId: 'u2',
    senderName: 'Ana',
    contentDisplay: 'Mensaje previo',
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
    pinned: false,
    pinnedBy: null,
    pinnedAt: null,
    reactions: [],
    readBy: [],
    attachment: null,
  };
}

describe('MessageComposerComponent', () => {
  let chat: ChatStub;
  let fixture: ComponentFixture<MessageComposerComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    chat = {
      replyingTo: signal<Message | null>(null),
      cancelReply: vi.fn(),
      notifyTyping: vi.fn(),
      sendText: vi.fn(),
      sendWithFile: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MessageComposerComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: ChatService, useValue: chat },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MessageComposerComponent);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('notifica typing, envia texto no vacio y limpia el borrador', async () => {
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as ComposerInternals;

    component.onInput(' hola ');
    fixture.detectChanges();

    expect(chat.notifyTyping).toHaveBeenCalledWith(true);
    await vi.advanceTimersByTimeAsync(2000);
    expect(chat.notifyTyping).toHaveBeenCalledWith(false);

    component.submit();
    fixture.detectChanges();

    expect(chat.sendText).toHaveBeenCalledWith('hola');
    expect(component.draft()).toBe('');
  });

  it('no envia texto vacio y mantiene el boton deshabilitado', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector<HTMLButtonElement>('.composer__send')?.disabled).toBe(true);
    el.querySelector<HTMLFormElement>('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );

    expect(chat.sendText).not.toHaveBeenCalled();
  });

  it('muestra respuesta activa, cancela y envia archivo con borrador', () => {
    chat.replyingTo.set(replyMessage());
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.composer__reply-text')?.textContent).toContain('Ana');
    el.querySelector<HTMLButtonElement>('.composer__reply .icon-button')?.click();
    expect(chat.cancelReply).toHaveBeenCalled();

    const component = fixture.componentInstance as unknown as ComposerInternals;
    component.onInput(' contexto ');
    fixture.detectChanges();

    const fileInput = el.querySelector<HTMLInputElement>('.composer__file')!;
    const file = new File(['data'], 'guia.pdf', { type: 'application/pdf' });
    Object.defineProperty(fileInput, 'files', { configurable: true, value: [file] });
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(chat.sendWithFile).toHaveBeenCalledWith(file, ' contexto ');
    expect(fileInput.value).toBe('');
  });
});
