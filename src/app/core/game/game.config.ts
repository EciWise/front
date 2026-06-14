import { InjectionToken } from '@angular/core';

/** Configuración del servidor de juego en tiempo real (Asclepio). */
export interface GameConfig {
  /** Endpoint WebSocket del juego (ws:// o wss://), sin query. */
  readonly gameWsUrl: string;
}

export const GAME_CONFIG = new InjectionToken<GameConfig>('GAME_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    gameWsUrl: 'ws://localhost:3002/ws/game',
  }),
});
