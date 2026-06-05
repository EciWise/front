import { InjectionToken } from '@angular/core';

/** URLs del microservicio de chat (talk). */
export interface TalkConfig {
  /** Base REST del servicio de chat. Sin barra final. */
  readonly talkApiUrl: string;
  /** Endpoint STOMP/WebSocket nativo (ws:// o wss://). */
  readonly talkWsUrl: string;
}

export const TALK_CONFIG = new InjectionToken<TalkConfig>('TALK_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    talkApiUrl: 'http://localhost:3003',
    talkWsUrl: 'ws://localhost:3003/ws/chat',
  }),
});
