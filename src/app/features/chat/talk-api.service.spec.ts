import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AppError } from '../../core/errors/app-error';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import { TalkApiService } from './talk-api.service';

describe('TalkApiService', () => {
  let service: TalkApiService;
  let http: { get: ReturnType<typeof vi.fn>; post: ReturnType<typeof vi.fn>; patch: ReturnType<typeof vi.fn> };
  const base = 'http://talk.test';

  beforeEach(() => {
    http = { get: vi.fn(), post: vi.fn(), patch: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: http },
        { provide: TALK_CONFIG, useValue: { talkApiUrl: base, talkWsUrl: 'ws://talk.test/ws/chat' } },
      ],
    });
    service = TestBed.inject(TalkApiService);
  });

  it('lista conversaciones contra el endpoint v1', async () => {
    http.get.mockReturnValue(of([{ id: 'c1' }]));

    const result = await firstValueFrom(service.listConversations());

    expect(http.get).toHaveBeenCalledWith(`${base}/api/v1/conversations`);
    expect(result).toEqual([{ id: 'c1' }]);
  });

  it('censura un mensaje con PATCH en la ruta correcta', async () => {
    http.patch.mockReturnValue(of({ id: 'm1', manuallyCensored: true }));

    const msg = await firstValueFrom(service.censorMessage('c1', 'm1'));

    expect(http.patch).toHaveBeenCalledWith(
      `${base}/api/v1/conversations/c1/messages/m1/censor`,
      {},
    );
    expect(msg.manuallyCensored).toBe(true);
  });

  it('normaliza errores HTTP a AppError con clave de traducción', async () => {
    http.post.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    let error: unknown;
    try {
      await firstValueFrom(service.sendMessage('c1', { content: 'hola' }));
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).messageKey).toBe('errors.server');
  });
});
