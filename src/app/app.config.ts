import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
import { StaticTranslateLoader } from './core/i18n/static-translate.loader';
import { I18nService } from './core/i18n/i18n.service';
import { ThemeService } from './core/theme/theme.service';
import { A11yService } from './core/a11y/a11y.service';
import { AUTH_CONFIG } from './core/auth/auth.config';
import { IA_CONFIG } from './core/ia/ia.config';
import { STUDY_CONFIG } from './core/study/study.config';
import { TALK_CONFIG } from './core/talk/talk.config';
import { TODO_CONFIG } from './core/todo/todo.config';
import { GAME_CONFIG } from './core/game/game.config';
import { EnvService } from './core/config/env.service';
import { normalizeServiceUrl } from './core/config/url.util';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withViewTransitions(),
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideTranslateService({
      loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
      fallbackLang: 'es',
      lang: 'es',
    }),
    provideAppInitializer(() => {
      inject(ThemeService).init();
      inject(I18nService).init();
      inject(A11yService).init();
    }),
    provideAppInitializer(() => inject(EnvService).load()),
    {
      provide: AUTH_CONFIG,
      useFactory: (env: EnvService) => ({
        apiBaseUrl: normalizeServiceUrl(env.get('apiBaseUrl'), 'http://localhost:3001'),
      }),
      deps: [EnvService],
    },
    {
      provide: IA_CONFIG,
      useFactory: (env: EnvService) => ({
        performanceApiUrl: normalizeServiceUrl(env.get('performanceApiUrl'), 'http://localhost:8001'),
        dropoutApiUrl:     normalizeServiceUrl(env.get('dropoutApiUrl'),     'http://localhost:8002'),
        ragApiUrl:         normalizeServiceUrl(env.get('ragApiUrl'),          'http://localhost:3000'),
      }),
      deps: [EnvService],
    },
    {
      provide: STUDY_CONFIG,
      useFactory: (env: EnvService) => ({
        studyApiUrl: env.get('studyApiUrl', 'http://localhost:8082'),
      }),
      deps: [EnvService],
    },
    {
      provide: TALK_CONFIG,
      useFactory: (env: EnvService) => ({
        talkApiUrl: env.get('talkApiUrl', 'http://localhost:3003'),
        talkWsUrl: env.get('talkWsUrl', 'ws://localhost:3003/ws/chat'),
      }),
      deps: [EnvService],
    },
    {
      provide: TODO_CONFIG,
      useFactory: (env: EnvService) => ({
        todoApiUrl: env.get('todoApiUrl', 'http://localhost:8083'),
      }),
      deps: [EnvService],
    },
    {
      provide: GAME_CONFIG,
      useFactory: (env: EnvService) => ({
        gameWsUrl: env.get('gameWsUrl', 'ws://localhost:3002/ws/game'),
      }),
      deps: [EnvService],
    },
  ],
};
