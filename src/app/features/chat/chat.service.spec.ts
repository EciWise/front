import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import {
  CensoredWord,
  Conversation,
  DirectoryUser,
  Message,
  WsMessageEvent,
  WsTypingEvent,
} from './chat.models';
import { ChatService } from './chat.service';
import { TalkApiService } from './talk-api.service';
import { TalkRealtimeService } from './talk-realtime.service';

type ApiMethod =
  | 'listConversations'
  | 'listMessages'
  | 'markAsRead'
  | 'sendMessage'
  | 'sendMessageWithAttachment'
  | 'editMessage'
  | 'deleteMessage'
  | 'deleteConversation'
  | 'censorMessage'
  | 'togglePin'
  | 'addReaction'
  | 'removeReaction'
  | 'createConversation'
  | 'listCensoredWords'
  | 'addCensoredWord'
  | 'deactivateCensoredWord';

type ApiMock = Record<ApiMethod, ReturnType<typeof vi.fn>>;

function makeConversation(id: string, overrides: Partial<Conversation> = {}): Conversation {
  return {
    id,
    type: 'GROUP',
    name: 'Grupo',
    description: null,
    createdBy: 'me',
    createdAt: '2026-01-01T09:00:00',
    updatedAt: '2026-01-01T09:00:00',
    anonymous: false,
    participants: [],
    ...overrides,
  };
}

function makeMessage(id: string, overrides: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'c1',
    senderId: 'other',
    senderName: 'Otro',
    contentDisplay: `mensaje ${id}`,
    contentOriginal: null,
    autoCensored: false,
    manuallyCensored: false,
    censoredByName: null,
    censoredAt: null,
    edited: false,
    editedAt: null,
    deleted: false,
    createdAt: `2026-01-01T10:00:0${id.replace(/\D/g, '') || '0'}`,
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

function makeWord(id: string, word = 'spam'): CensoredWord {
  return {
    id,
    word,
    addedByName: 'Admin',
    active: true,
    createdAt: '2026-01-01T10:00:00',
  };
}

function makeEvent(overrides: Partial<WsMessageEvent>): WsMessageEvent {
  return {
    type: 'MESSAGE',
    conversationId: 'c1',
    message: null,
    messageId: null,
    userId: null,
    userName: null,
    timestamp: null,
    messageIds: null,
    emoji: null,
    pinned: null,
    ...overrides,
  };
}

describe('ChatService', () => {
  let service: ChatService;
  let api: ApiMock;
  let events$: Subject<WsMessageEvent>;
  let typing$: Subject<WsTypingEvent>;
  let notifications$: Subject<unknown>;
  const role = signal<Role | null>(Role.Tutor);
  const user = signal({ id: 'me' });
  const realtimeConnected = signal(false);
  let token: string | null;

  beforeEach(() => {
    vi.useRealTimers();
    role.set(Role.Tutor);
    user.set({ id: 'me' });
    token = null;
    realtimeConnected.set(false);
    events$ = new Subject<WsMessageEvent>();
    typing$ = new Subject<WsTypingEvent>();
    notifications$ = new Subject<unknown>();
    api = {
      listConversations: vi.fn(() => of([makeConversation('c1')])),
      listMessages: vi.fn(() =>
        of({
          content: [makeMessage('m2'), makeMessage('m1')],
          totalElements: 2,
          number: 0,
          totalPages: 1,
          last: true,
        }),
      ),
      markAsRead: vi.fn(() => of(undefined)),
      sendMessage: vi.fn(() => of(makeMessage('m9', { senderId: 'me' }))),
      sendMessageWithAttachment: vi.fn(() => of(makeMessage('m10', { attachment: null }))),
      editMessage: vi.fn(() => of(makeMessage('m1', { contentDisplay: 'editado' }))),
      deleteMessage: vi.fn(() => of(undefined)),
      deleteConversation: vi.fn(() => of(undefined)),
      censorMessage: vi.fn(() => of(makeMessage('m1', { manuallyCensored: true }))),
      togglePin: vi.fn(() => of(makeMessage('m1', { pinned: true }))),
      addReaction: vi.fn(() => of(undefined)),
      removeReaction: vi.fn(() => of(undefined)),
      createConversation: vi.fn(() => of(makeConversation('new'))),
      listCensoredWords: vi.fn(() => of([makeWord('w1')])),
      addCensoredWord: vi.fn(() => of(makeWord('w2', 'fraude'))),
      deactivateCensoredWord: vi.fn(() => of(undefined)),
    };
    const realtime = {
      events$,
      typing$,
      notifications$,
      connected: realtimeConnected,
      connect: vi.fn(),
      openConversation: vi.fn(),
      closeConversation: vi.fn(),
      sendMessage: vi.fn(),
      sendTyping: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: TalkApiService, useValue: api },
        { provide: TalkRealtimeService, useValue: realtime },
        { provide: AuthService, useValue: { role, user, get token() { return token; } } },
      ],
    });
    service = TestBed.inject(ChatService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('calcula permisos y usuario actual desde rol, JWT o fallback de sesion', () => {
    role.set(Role.Tutor);
    expect(service.canModerate()).toBe(true);
    expect(service.isAdmin()).toBe(false);

    role.set(Role.Admin);
    expect(service.canModerate()).toBe(true);
    expect(service.isAdmin()).toBe(true);

    role.set(Role.Student);
    expect(service.canModerate()).toBe(false);

    token = 'token-invalido';
    expect(service.currentUserId()).toBe('me');
    token = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJqd3QtbWUifQ.';
    user.set({ id: 'me-after-token-change' });
    expect(service.currentUserId()).toBe('jwt-me');
  });

  it('maneja navegacion basica, carga conversaciones y errores', () => {
    service.showNew();
    expect(service.view()).toBe('new');
    service.showList();
    expect(service.view()).toBe('list');

    service.loadConversations();
    expect(api.listConversations).toHaveBeenCalled();
    expect(service.conversations().map((conv) => conv.id)).toEqual(['c1']);

    api.listConversations.mockReturnValueOnce(throwError(() => ({ messageKey: 'errors.server' })));
    service.loadConversations();
    expect(service.error()).toBe('errors.server');

    notifications$.next({ id: 'n1' });
    expect(api.listConversations).toHaveBeenCalledTimes(3);
  });

  it('abre y cierra conversaciones cargando mensajes ordenados y marcando lectura', () => {
    service.loadConversations();
    service.openConversation('c1');

    expect(service.activeId()).toBe('c1');
    expect(service.activeConversation()?.id).toBe('c1');
    expect(service.view()).toBe('thread');
    expect(service.loading()).toBe(false);
    expect(service.messages().map((msg) => msg.id)).toEqual(['m1', 'm2']);
    expect(api.markAsRead).toHaveBeenCalledWith('c1', ['m1', 'm2']);

    service.closeThread();
    expect(service.activeId()).toBeNull();
    expect(service.messages()).toEqual([]);
    expect(service.view()).toBe('list');
  });

  it('reporta error si falla la carga de mensajes', () => {
    api.listMessages.mockReturnValueOnce(throwError(() => ({ messageKey: 'chat.loadFailed' })));

    service.openConversation('c1');

    expect(service.loading()).toBe(false);
    expect(service.error()).toBe('chat.loadFailed');
  });

  it('crea conversaciones individuales y grupales con participantes normalizados', () => {
    const ana: DirectoryUser = {
      id: 'u2',
      name: 'Ana Diaz',
      email: 'ana@escuelaing.edu.co',
      rol: 'estudiante',
    };

    service.createIndividual(ana);
    expect(api.createConversation).toHaveBeenCalledWith({
      type: 'INDIVIDUAL',
      name: null,
      participants: [{ userId: 'u2', userName: 'Ana Diaz', userRol: 'estudiante' }],
      anonymous: false,
    });
    expect(service.view()).toBe('thread');

    service.createGroup('Proyecto', [ana], true);
    expect(api.createConversation).toHaveBeenLastCalledWith({
      type: 'GROUP',
      name: 'Proyecto',
      participants: [{ userId: 'u2', userName: 'Ana Diaz', userRol: 'estudiante' }],
      anonymous: true,
    });

    api.createConversation.mockReturnValueOnce(throwError(() => ({ messageKey: 'chat.createFailed' })));
    service.createGroup('Falla', [ana]);
    expect(service.error()).toBe('chat.createFailed');
  });

  it('gestiona moderacion solo para admin', () => {
    role.set(Role.Student);
    service.loadCensoredWords();
    expect(api.listCensoredWords).not.toHaveBeenCalled();

    role.set(Role.Admin);
    service.showModeration();
    expect(service.view()).toBe('moderation');
    expect(service.censoredWords()).toEqual([makeWord('w1')]);

    service.addCensoredWord('   ');
    expect(api.addCensoredWord).not.toHaveBeenCalled();

    service.addCensoredWord('  fraude  ');
    expect(api.addCensoredWord).toHaveBeenCalledWith('fraude');
    expect(service.censoredWords().map((word) => word.id)).toEqual(['w2', 'w1']);

    service.removeCensoredWord('w1');
    expect(api.deactivateCensoredWord).toHaveBeenCalledWith('w1');
    expect(service.censoredWords().map((word) => word.id)).toEqual(['w2']);
  });

  it('propaga errores de moderacion', () => {
    role.set(Role.Admin);
    api.listCensoredWords.mockReturnValueOnce(throwError(() => ({ messageKey: 'words.error' })));
    service.loadCensoredWords();
    expect(service.error()).toBe('words.error');

    api.addCensoredWord.mockReturnValueOnce(throwError(() => ({ messageKey: 'words.addError' })));
    service.addCensoredWord('x');
    expect(service.error()).toBe('words.addError');

    api.deactivateCensoredWord.mockReturnValueOnce(throwError(() => ({ messageKey: 'words.removeError' })));
    service.removeCensoredWord('w1');
    expect(service.error()).toBe('words.removeError');
  });

  it('envia texto por REST o realtime segun conexion y valida estados vacios', () => {
    service.sendText('sin conversacion');
    expect(api.sendMessage).not.toHaveBeenCalled();

    service.openConversation('c1');
    service.startReply(makeMessage('m1'));
    service.sendText('  hola  ');
    expect(api.sendMessage).toHaveBeenCalledWith('c1', {
      content: 'hola',
      replyToMessageId: 'm1',
    });
    expect(service.replyingTo()).toBeNull();
    expect(service.messages().some((msg) => msg.id === 'm9')).toBe(true);

    service.sendText('   ');
    expect(api.sendMessage).toHaveBeenCalledTimes(1);

    realtimeConnected.set(true);
    service.sendText('por ws');
    const realtime = TestBed.inject(TalkRealtimeService);
    expect(realtime.sendMessage).toHaveBeenCalledWith('c1', {
      content: 'por ws',
      replyToMessageId: null,
    });
  });

  it('envia adjuntos, edita, borra, censura y fija mensajes', () => {
    const file = new File(['a'], 'a.txt');

    service.sendWithFile(file, 'sin conversacion');
    expect(api.sendMessageWithAttachment).not.toHaveBeenCalled();

    service.openConversation('c1');
    service.startReply(makeMessage('m1'));
    service.sendWithFile(file, '  adjunto  ');
    expect(api.sendMessageWithAttachment).toHaveBeenCalledWith('c1', {
      content: 'adjunto',
      replyToMessageId: 'm1',
    }, file);
    expect(service.replyingTo()).toBeNull();

    service.sendWithFile(file, '   ');
    expect(api.sendMessageWithAttachment).toHaveBeenLastCalledWith('c1', {
      content: null,
      replyToMessageId: null,
    }, file);

    service.editMessage('m1', '   ');
    expect(api.editMessage).not.toHaveBeenCalled();
    service.editMessage('m1', '  editado  ');
    expect(api.editMessage).toHaveBeenCalledWith('c1', 'm1', 'editado');
    expect(service.messages().find((msg) => msg.id === 'm1')?.contentDisplay).toBe('editado');

    service.deleteMessage('m1');
    expect(api.deleteMessage).toHaveBeenCalledWith('c1', 'm1');

    service.censorMessage('m1');
    expect(api.censorMessage).toHaveBeenCalledWith('c1', 'm1');
    expect(service.messages().find((msg) => msg.id === 'm1')?.manuallyCensored).toBe(true);

    service.togglePin('m1');
    expect(api.togglePin).toHaveBeenCalledWith('c1', 'm1');
    expect(service.messages().find((msg) => msg.id === 'm1')?.pinned).toBe(true);
  });

  it('propaga errores de operaciones de mensaje', () => {
    service.openConversation('c1');

    api.sendMessage.mockReturnValueOnce(throwError(() => ({ messageKey: 'send.error' })));
    service.sendText('hola');
    expect(service.error()).toBe('send.error');

    api.sendMessageWithAttachment.mockReturnValueOnce(throwError(() => ({ messageKey: 'file.error' })));
    service.sendWithFile(new File(['a'], 'a.txt'));
    expect(service.error()).toBe('file.error');

    api.editMessage.mockReturnValueOnce(throwError(() => ({ messageKey: 'edit.error' })));
    service.editMessage('m1', 'x');
    expect(service.error()).toBe('edit.error');

    api.deleteMessage.mockReturnValueOnce(throwError(() => ({ messageKey: 'delete.error' })));
    service.deleteMessage('m1');
    expect(service.error()).toBe('delete.error');

    api.censorMessage.mockReturnValueOnce(throwError(() => ({ messageKey: 'censor.error' })));
    service.censorMessage('m1');
    expect(service.error()).toBe('censor.error');

    api.togglePin.mockReturnValueOnce(throwError(() => ({ messageKey: 'pin.error' })));
    service.togglePin('m1');
    expect(service.error()).toBe('pin.error');
  });

  it('agrega o remueve reacciones segun el estado local', () => {
    service.openConversation('c1');

    service.toggleReaction('m1', '👍');
    expect(api.addReaction).toHaveBeenCalledWith('c1', 'm1', '👍');

    events$.next(
      makeEvent({
        type: 'REACTION_ADDED',
        messageId: 'm1',
        emoji: '👍',
        userId: 'me',
        userName: 'Yo',
      }),
    );
    service.toggleReaction('m1', '👍');
    expect(api.removeReaction).toHaveBeenCalledWith('c1', 'm1', '👍');

    api.addReaction.mockReturnValueOnce(throwError(() => ({ messageKey: 'reaction.error' })));
    service.toggleReaction('missing', '❌');
    expect(service.error()).toBe('reaction.error');

    user.set({ id: '' });
    token = null;
    service.toggleReaction('m1', '👍');
    expect(api.addReaction).toHaveBeenCalledTimes(2);
  });

  it('aplica eventos websocket de mensajes, pin, lectura y conversaciones externas', () => {
    service.openConversation('c1');

    events$.next(makeEvent({ type: 'MESSAGE', message: makeMessage('m3') }));
    expect(service.messages().map((msg) => msg.id)).toContain('m3');

    events$.next(
      makeEvent({
        type: 'MESSAGE_UPDATED',
        message: makeMessage('m3', { contentDisplay: 'actualizado' }),
      }),
    );
    expect(service.messages().find((msg) => msg.id === 'm3')?.contentDisplay).toBe('actualizado');

    events$.next(makeEvent({ type: 'MESSAGE_PINNED', messageId: 'm3', pinned: true }));
    expect(service.messages().find((msg) => msg.id === 'm3')?.pinned).toBe(true);

    events$.next(makeEvent({ type: 'MESSAGE_UNPINNED', messageId: 'm3', pinned: null }));
    expect(service.messages().find((msg) => msg.id === 'm3')?.pinned).toBe(false);

    events$.next(makeEvent({ type: 'REACTION_ADDED', messageId: 'm3', emoji: null, userId: 'u2' }));
    expect(service.messages().find((msg) => msg.id === 'm3')?.reactions).toEqual([]);

    events$.next(
      makeEvent({
        type: 'REACTION_ADDED',
        messageId: 'm3',
        emoji: '👍',
        userId: 'u2',
        userName: 'Ana',
      }),
    );
    events$.next(
      makeEvent({
        type: 'REACTION_ADDED',
        messageId: 'm3',
        emoji: '👍',
        userId: 'u2',
        userName: 'Ana',
      }),
    );
    expect(service.messages().find((msg) => msg.id === 'm3')?.reactions.at(0)?.count).toBe(1);

    events$.next(
      makeEvent({
        type: 'REACTION_REMOVED',
        messageId: 'm3',
        emoji: '👍',
        userId: 'u2',
      }),
    );
    expect(service.messages().find((msg) => msg.id === 'm3')?.reactions).toEqual([]);

    events$.next(makeEvent({ type: 'MESSAGE_READ', messageIds: null, userId: 'u3' }));
    events$.next(
      makeEvent({
        type: 'MESSAGE_READ',
        messageIds: ['m3'],
        userId: 'u3',
        userName: 'Luis',
        timestamp: '2026-01-01T11:00:00',
      }),
    );
    events$.next(
      makeEvent({
        type: 'MESSAGE_READ',
        messageIds: ['m3'],
        userId: 'u3',
        userName: 'Luis',
        timestamp: '2026-01-01T11:00:00',
      }),
    );
    expect(service.messages().find((msg) => msg.id === 'm3')?.readBy).toHaveLength(1);

    events$.next(makeEvent({ conversationId: 'other', message: makeMessage('m4') }));
    expect(api.listConversations).toHaveBeenCalled();
  });

  it('separa chats por tipo, oculta/muestra y marca no leidos por actividad', () => {
    const direct = makeConversation('d1', { type: 'INDIVIDUAL', name: null });
    const group = makeConversation('g1', { type: 'GROUP', updatedAt: '2026-01-01T00:00:00' });
    api.listConversations.mockReturnValue(of([direct, group]));
    service.loadConversations();

    expect(service.directChats().map((c) => c.id)).toEqual(['d1']);
    expect(service.groupChats().map((c) => c.id)).toEqual(['g1']);

    // Sin "última vez visto" registrada, hay actividad → no leído.
    expect(service.hasUnread(group)).toBe(true);

    // Ocultar lo saca de la lista hasta que se piden ver los ocultos.
    service.hideConversation('d1');
    expect(service.directChats()).toEqual([]);
    expect(service.hasHidden()).toBe(true);
    service.toggleShowHidden();
    expect(service.directChats().map((c) => c.id)).toEqual(['d1']);
    expect(service.isHidden('d1')).toBe(true);
    service.unhideConversation('d1');
    expect(service.isHidden('d1')).toBe(false);

    // Al abrir, queda como vista (la activa nunca muestra no leído).
    service.openConversation('g1');
    expect(service.hasUnread(group)).toBe(false);
    service.closeThread();
    expect(service.hasUnread(group)).toBe(false);
  });

  it('hard delete solo para el creador de la conversacion', () => {
    const mine = makeConversation('g1', { createdBy: 'me' });
    const other = makeConversation('g2', { createdBy: 'alguien' });
    api.listConversations.mockReturnValue(of([mine, other]));
    service.loadConversations();

    expect(service.isCreator(mine)).toBe(true);
    expect(service.isCreator(other)).toBe(false);

    // No creador: no llama al backend.
    service.deleteConversation('g2');
    expect(api.deleteConversation).not.toHaveBeenCalled();

    // Creador: borra y desaparece de la lista.
    service.deleteConversation('g1');
    expect(api.deleteConversation).toHaveBeenCalledWith('g1');
    expect(service.conversations().map((c) => c.id)).toEqual(['g2']);
  });

  it('maneja typing remoto, timers y notificaciones de escritura propias', async () => {
    vi.useFakeTimers();
    service.openConversation('c1');

    typing$.next({ type: 'TYPING', conversationId: 'c1', userId: 'me', userName: 'Yo', typing: true });
    expect(service.typingNames()).toEqual([]);

    typing$.next({ type: 'TYPING', conversationId: 'other', userId: 'u2', userName: 'Ana', typing: true });
    expect(service.typingNames()).toEqual([]);

    typing$.next({ type: 'TYPING', conversationId: 'c1', userId: 'u2', userName: 'Ana', typing: true });
    expect(service.typingNames()).toEqual(['Ana']);

    typing$.next({ type: 'TYPING', conversationId: 'c1', userId: 'u2', userName: 'Ana', typing: true });
    await vi.advanceTimersByTimeAsync(3999);
    expect(service.typingNames()).toEqual(['Ana']);
    await vi.advanceTimersByTimeAsync(1);
    expect(service.typingNames()).toEqual([]);

    typing$.next({ type: 'TYPING', conversationId: 'c1', userId: 'u3', userName: 'Luis', typing: true });
    typing$.next({ type: 'TYPING', conversationId: 'c1', userId: 'u3', userName: 'Luis', typing: false });
    expect(service.typingNames()).toEqual([]);

    service.notifyTyping(true);
    const realtime = TestBed.inject(TalkRealtimeService);
    expect(realtime.sendTyping).toHaveBeenCalledWith('c1', true);

    service.closeThread();
    service.notifyTyping(true);
    expect(realtime.sendTyping).toHaveBeenCalledTimes(1);
  });
});
