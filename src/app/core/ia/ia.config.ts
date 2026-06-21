import { InjectionToken } from '@angular/core';

/** URLs de los servicios de IA (predicción ML y RAG/chat). */
export interface IaConfig {
  /** Servicio de rendimiento académico (Eciwise-IA). Sin barra final. */
  readonly performanceApiUrl: string;
  /** Servicio de deserción (ECIwise-IADropout-succes). Sin barra final. */
  readonly dropoutApiUrl: string;
  /** Servicio RAG (chat, socrático, quiz generativo). Sin barra final. */
  readonly ragApiUrl: string;
}

export const IA_CONFIG = new InjectionToken<IaConfig>('IA_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    performanceApiUrl: 'http://localhost:8001',
    dropoutApiUrl: 'http://localhost:8002',
    ragApiUrl: 'http://localhost:3000',
  }),
});
