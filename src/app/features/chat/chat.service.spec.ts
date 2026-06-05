import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import { ChatService } from './chat.service';
import { Message, WsMessageEvent } from './chat.models';
import { TalkApiService } from './talk-api.service';
import { TalkRealtimeService } from './talk-realtime.service';

function makeMessage(id: string, conversationId = 'c1'): Message {
  return {
    id,
    conversationId,
    senderId: 'other',
    senderName: 'Otro',
    contentDisplay: 'hola',
    contentOriginal: null,
    autoCensored: false,
    manuallyCensored: false,
    censoredByName: null,
    censoredAt: null,
    edited: false,
    editedAt: null,
    deleted: false,
    createdAt: '2026-01-01T10:00:00',
    replyTo: null,
    pinned: false,
    pinnedBy: null,
    pinnedAt: null,
    reactions: [],
    readBy: [],
    attachment: null,
  };
}

describe('ChatService', () => {
  let service: ChatService;
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let events$: Subject<WsMessageEvent>;
  const role = signal<Role | null>(Role.Tutor);

  beforeEach(() => {
    events$ = new Subject<WsMessageEvent>();
    api = {
      listConversations: vi.fn(() => of([{ id: 'c1', type: 'GROUP', participants: [] }])),
      listMessages: vi.fn(() => of({ content: [makeMessage('m1')], totalElements: 1, number: 0, totalPages: 1, last: true })),
      markAsRead: vi.fn(() => of(undefined)),
      sendMessage: vi.fn(() => of(makeMessage('m9'))),
    };
    const realtime = {
      events$,
      typing$: new Subject(),
      notifications$: new Subject(),
      connected: signal(false),
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
        { provide: AuthService, useValue: { role, user: signal({ id: 'me' }), token: 't' } },
      ],
    });
    service = TestBed.inject(ChatService);
  });

  it('solo tutores y admin pueden moderar', () => {
    role.set(Role.Tutor);
    expect(service.canModerate()).toBe(true);
    role.set(Role.Admin);
    expect(service.canModerate()).toBe(true);
    role.set(Role.Student);
    expect(service.canModerate()).toBe(false);
  });

  it('carga la lista de conversaciones', () => {
    service.loadConversations();
    expect(api['listConversations']).toHaveBeenCalled();
    expect(service.conversations().length).toBe(1);
  });

  it('abrir una conversación carga sus mensajes y cambia a la vista de hilo', () => {
    service.openConversation('c1');
    expect(service.activeId()).toBe('c1');
    expect(service.view()).toBe('thread');
    expect(service.messages().map((m) => m.id)).toEqual(['m1']);
  });

  it('un evento MESSAGE entrante agrega el mensaje a la conversación activa', () => {
    service.openConversation('c1');
    events$.next({
      type: 'MESSAGE',
      conversationId: 'c1',
      message: makeMessage('m2'),
      messageId: null,
      userId: null,
      userName: null,
      timestamp: null,
      messageIds: null,
      emoji: null,
      pinned: null,
    });
    expect(service.messages().map((m) => m.id)).toContain('m2');
  });

  it('responde un mensaje incluyendo replyToMessageId y limpia el estado', () => {
    service.openConversation('c1');
    service.startReply(makeMessage('m1'));
    service.sendText('hola');

    // realtime.connected() es false en el stub → usa la vía REST.
    expect(api['sendMessage']).toHaveBeenCalledWith('c1', {
      content: 'hola',
      replyToMessageId: 'm1',
    });
    expect(service.replyingTo()).toBeNull();
  });
});
