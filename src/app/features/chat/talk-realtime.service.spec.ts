import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth/auth.service';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import { TalkRealtimeService } from './talk-realtime.service';

describe('TalkRealtimeService', () => {
  function setup(token: string | null): TalkRealtimeService {
    TestBed.configureTestingModule({
      providers: [
        TalkRealtimeService,
        { provide: TALK_CONFIG, useValue: { talkApiUrl: 'http://talk.test', talkWsUrl: 'ws://talk.test/ws/chat' } },
        { provide: AuthService, useValue: { token } },
      ],
    });
    return TestBed.inject(TalkRealtimeService);
  }

  it('no conecta si no hay token (sin sesión)', () => {
    const service = setup(null);
    service.connect();
    expect(service.connected()).toBe(false);
  });

  it('expone los streams de eventos y desconectar es seguro', () => {
    const service = setup(null);
    expect(service.events$).toBeDefined();
    expect(service.typing$).toBeDefined();
    expect(service.notifications$).toBeDefined();
    expect(() => service.disconnect()).not.toThrow();
    expect(service.connected()).toBe(false);
  });
});
