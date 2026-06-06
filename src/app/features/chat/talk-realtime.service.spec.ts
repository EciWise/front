import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { AuthService } from '../../core/auth/auth.service';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import { TalkRealtimeService } from './talk-realtime.service';

type PublishParams = Parameters<Client['publish']>[0];

interface ClientInternals {
  readonly brokerURL: string;
  readonly connectHeaders: Record<string, string>;
  readonly reconnectDelay: number;
  readonly heartbeatIncoming: number;
  readonly heartbeatOutgoing: number;
  readonly onConnect: () => void;
  readonly onWebSocketClose: () => void;
  readonly onStompError: () => void;
}

interface RealtimeInternals {
  readonly client: ClientInternals | null;
}

interface MockSubscription {
  readonly unsubscribe: ReturnType<typeof vi.fn>;
}

function setup(token: string | null, platformId = 'browser'): TalkRealtimeService {
  TestBed.configureTestingModule({
    providers: [
      TalkRealtimeService,
      {
        provide: TALK_CONFIG,
        useValue: { talkApiUrl: 'http://talk.test', talkWsUrl: 'ws://talk.test/ws/chat' },
      },
      { provide: AuthService, useValue: { token } },
      { provide: PLATFORM_ID, useValue: platformId },
    ],
  });
  return TestBed.inject(TalkRealtimeService);
}

function clientOf(service: TalkRealtimeService): ClientInternals {
  const client = (service as unknown as RealtimeInternals).client;
  if (!client) {
    throw new Error('Expected STOMP client to be created');
  }
  return client;
}

describe('TalkRealtimeService', () => {
  let callbacks: Map<string, (message: IMessage) => void>;
  let subscriptions: MockSubscription[];
  let published: PublishParams[];

  beforeEach(() => {
    callbacks = new Map();
    subscriptions = [];
    published = [];
    TestBed.resetTestingModule();
    vi.spyOn(Client.prototype, 'activate').mockImplementation(function activateMock(this: Client) {
      Object.defineProperty(this, 'active', { configurable: true, value: true });
    });
    vi.spyOn(Client.prototype, 'deactivate').mockImplementation(function deactivateMock(this: Client) {
      Object.defineProperty(this, 'active', { configurable: true, value: false });
      Object.defineProperty(this, 'connected', { configurable: true, value: false });
      return Promise.resolve();
    });
    vi.spyOn(Client.prototype, 'subscribe').mockImplementation(
      (destination: string, callback: (message: IMessage) => void): StompSubscription => {
        callbacks.set(destination, callback);
        const subscription: MockSubscription = { unsubscribe: vi.fn() };
        subscriptions.push(subscription);
        return subscription as unknown as StompSubscription;
      },
    );
    vi.spyOn(Client.prototype, 'publish').mockImplementation((frame: PublishParams) => {
      published.push(frame);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('no conecta si no hay token o si corre en servidor', () => {
    setup(null).connect();
    expect(Client.prototype.activate).not.toHaveBeenCalled();

    TestBed.resetTestingModule();
    setup('jwt', 'server').connect();
    expect(Client.prototype.activate).not.toHaveBeenCalled();
  });

  it('crea una conexion STOMP con headers y es idempotente mientras esta activa', () => {
    const service = setup('jwt-123');

    service.connect();
    service.connect();

    const client = clientOf(service);
    expect(Client.prototype.activate).toHaveBeenCalledTimes(1);
    expect(client).toMatchObject({
      brokerURL: 'ws://talk.test/ws/chat',
      connectHeaders: { Authorization: 'Bearer jwt-123' },
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });
  });

  it('marca conexion, suscribe notificaciones y reabre la conversacion tras conectar', () => {
    const service = setup('jwt-123');

    service.openConversation('c1');
    const client = clientOf(service);
    Object.defineProperty(client, 'connected', { configurable: true, value: true });
    client.onConnect();

    expect(service.connected()).toBe(true);
    expect(Client.prototype.subscribe).toHaveBeenCalledWith(
      '/user/queue/notifications',
      expect.any(Function),
    );
    expect(Client.prototype.subscribe).toHaveBeenCalledWith(
      '/topic/conversation.c1',
      expect.any(Function),
    );
  });

  it('publica mensajes y typing como JSON con content-type', () => {
    const service = setup('jwt-123');
    service.connect();

    service.sendMessage('c1', { content: 'hola' });
    service.sendTyping('c1', true);

    expect(published).toEqual([
      {
        destination: '/app/conversation/c1.send',
        body: JSON.stringify({ content: 'hola' }),
        headers: { 'content-type': 'application/json' },
      },
      {
        destination: '/app/conversation/c1.typing',
        body: JSON.stringify(true),
        headers: { 'content-type': 'application/json' },
      },
    ]);
  });

  it('rutea frames de conversacion a typing o eventos y descarta payloads invalidos', () => {
    const service = setup('jwt-123');
    const events: unknown[] = [];
    const typing: unknown[] = [];
    service.events$.subscribe((event) => events.push(event));
    service.typing$.subscribe((event) => typing.push(event));

    service.openConversation('c1');
    const client = clientOf(service);
    Object.defineProperty(client, 'connected', { configurable: true, value: true });
    client.onConnect();
    const callback = callbacks.get('/topic/conversation.c1');
    expect(callback).toBeDefined();

    callback?.({ body: JSON.stringify({ type: 'TYPING', conversationId: 'c1', userId: 'u2' }) } as IMessage);
    callback?.({ body: JSON.stringify({ type: 'MESSAGE', conversationId: 'c1', messageId: 'm1' }) } as IMessage);
    callback?.({ body: JSON.stringify({}) } as IMessage);
    callback?.({ body: '{bad json' } as IMessage);

    expect(typing).toHaveLength(1);
    expect(events).toHaveLength(1);
  });

  it('emite notificaciones personales parseadas', () => {
    const service = setup('jwt-123');
    const notifications: unknown[] = [];
    service.notifications$.subscribe((notification) => notifications.push(notification));

    service.connect();
    clientOf(service).onConnect();
    callbacks.get('/user/queue/notifications')?.({ body: '{"id":"c1"}' } as IMessage);

    expect(notifications).toEqual([{ id: 'c1' }]);
  });

  it('cierra conversaciones, maneja errores de socket y desconecta limpiamente', () => {
    const service = setup('jwt-123');
    service.openConversation('c1');
    const client = clientOf(service);
    Object.defineProperty(client, 'connected', { configurable: true, value: true });
    client.onConnect();

    const convSub = subscriptions.at(-1);
    service.closeConversation();
    expect(convSub?.unsubscribe).toHaveBeenCalled();

    client.onWebSocketClose();
    expect(service.connected()).toBe(false);
    service.connected.set(true);
    client.onStompError();
    expect(service.connected()).toBe(false);

    service.disconnect();
    expect(Client.prototype.deactivate).toHaveBeenCalled();
    expect(service.connected()).toBe(false);
  });
});
