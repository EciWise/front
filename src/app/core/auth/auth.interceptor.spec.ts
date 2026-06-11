import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { IA_CONFIG } from '../ia/ia.config';
import { STUDY_CONFIG } from '../study/study.config';
import { TALK_CONFIG } from '../talk/talk.config';
import { TODO_CONFIG } from '../todo/todo.config';
import { AUTH_CONFIG } from './auth.config';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: 'https://auth.test/' } },
        {
          provide: IA_CONFIG,
          useValue: {
            performanceApiUrl: 'https://ia-performance.test',
            dropoutApiUrl: 'https://ia-dropout.test',
          },
        },
        { provide: STUDY_CONFIG, useValue: { studyApiUrl: 'https://study.test' } },
        { provide: TALK_CONFIG, useValue: { talkApiUrl: 'https://talk.test', talkWsUrl: 'wss://talk.test/ws' } },
        { provide: TODO_CONFIG, useValue: { todoApiUrl: 'https://todo.test' } },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
    localStorage.clear();
  });

  it('adjunta Authorization solo a hosts propios con token presente', async () => {
    localStorage.setItem('eciwise.token', 'jwt-test');

    const authOwn = firstValueFrom(http.get('https://auth.test/auth/me'));
    const authOwnReq = controller.expectOne('https://auth.test/auth/me');
    expect(authOwnReq.request.headers.get('Authorization')).toBe('Bearer jwt-test');
    authOwnReq.flush({});
    await authOwn;

    const own = firstValueFrom(http.get('https://todo.test/api/tasks'));
    const ownReq = controller.expectOne('https://todo.test/api/tasks');
    expect(ownReq.request.headers.get('Authorization')).toBe('Bearer jwt-test');
    ownReq.flush([]);
    await own;

    const thirdParty = firstValueFrom(http.get('https://cdn.example.com/data.json'));
    const thirdPartyReq = controller.expectOne('https://cdn.example.com/data.json');
    expect(thirdPartyReq.request.headers.has('Authorization')).toBe(false);
    thirdPartyReq.flush({});
    await thirdParty;

    const similarHost = firstValueFrom(http.get('https://auth.test.evil/api'));
    const similarHostReq = controller.expectOne('https://auth.test.evil/api');
    expect(similarHostReq.request.headers.has('Authorization')).toBe(false);
    similarHostReq.flush({});
    await similarHost;
  });

  it('no adjunta Authorization cuando no hay token', async () => {
    const result = firstValueFrom(http.get('https://auth.test/auth/me'));
    const req = controller.expectOne('https://auth.test/auth/me');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
    await result;
  });
});
