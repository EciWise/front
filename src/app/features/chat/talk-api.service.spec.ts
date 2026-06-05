import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppError } from '../../core/errors/app-error';
import { TALK_CONFIG } from '../../core/talk/talk.config';
import { ParticipantInput } from './chat.models';
import { TalkApiService } from './talk-api.service';

const BASE = 'http://talk.test/api/v1';

describe('TalkApiService', () => {
  let service: TalkApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TALK_CONFIG, useValue: { talkApiUrl: 'http://talk.test/', talkWsUrl: 'ws://talk.test/ws/chat' } },
      ],
    });
    service = TestBed.inject(TalkApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('cubre operaciones REST de conversaciones', () => {
    const participant: ParticipantInput = {
      userId: 'u2',
      userName: 'Tutor',
      userRol: 'tutor',
    };
    const createBody = {
      type: 'INDIVIDUAL' as const,
      participants: [participant],
      anonymous: false,
    };

    service.listConversations().subscribe();
    let req = http.expectOne(`${BASE}/conversations`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.getConversation('c1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'c1' });

    service.createConversation(createBody).subscribe();
    req = http.expectOne(`${BASE}/conversations`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createBody);
    req.flush({ id: 'c1' });

    service.updateConversation('c1', { name: 'Grupo', description: 'Proyecto' }).subscribe();
    req = http.expectOne(`${BASE}/conversations/c1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Grupo', description: 'Proyecto' });
    req.flush({ id: 'c1', name: 'Grupo' });

    service.addParticipant('c1', participant).subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/participants`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(participant);
    req.flush({ id: 'c1' });

    service.removeParticipant('c1', 'u2').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/participants/u2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    service.deleteConversation('c1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('cubre consultas y mutaciones de mensajes', () => {
    service.listMessages('c1').subscribe();
    let req = http.expectOne(`${BASE}/conversations/c1/messages?page=0&size=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, number: 0, totalPages: 0, last: true });

    service.listMessages('c1', 2, 20).subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages?page=2&size=20`);
    expect(req.request.method).toBe('GET');
    req.flush({ content: [], totalElements: 0, number: 2, totalPages: 0, last: true });

    service.sendMessage('c1', { content: 'hola', replyToMessageId: 'm0' }).subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'hola', replyToMessageId: 'm0' });
    req.flush({ id: 'm1', contentDisplay: 'hola' });

    service.editMessage('c1', 'm1', 'editado').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ content: 'editado' });
    req.flush({ id: 'm1', contentDisplay: 'editado' });

    service.deleteMessage('c1', 'm1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    service.censorMessage('c1', 'm1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1/censor`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush({ id: 'm1', manuallyCensored: true });

    service.togglePin('c1', 'm1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1/pin`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush({ id: 'm1', pinned: true });

    service.getPinned('c1').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/pinned`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('envia adjuntos como FormData con JSON y archivo', () => {
    const file = new File(['contenido'], 'nota.txt', { type: 'text/plain' });

    service.sendMessageWithAttachment('c1', { content: 'ver adjunto' }, file).subscribe();

    const req = http.expectOne(`${BASE}/conversations/c1/messages/with-attachment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    const form = req.request.body as FormData;
    expect(form.get('data')).toBeInstanceOf(Blob);
    expect(form.get('file')).toBe(file);
    req.flush({ id: 'm1', attachment: { fileName: 'nota.txt' } });
  });

  it('cubre lecturas y reacciones, incluyendo encoding de emoji', () => {
    service.markAsRead('c1', ['m1', 'm2']).subscribe();
    let req = http.expectOne(`${BASE}/conversations/c1/messages/read`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ messageIds: ['m1', 'm2'] });
    req.flush(null);

    service.addReaction('c1', 'm1', '👍').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1/reactions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ emoji: '👍' });
    req.flush(null);

    service.removeReaction('c1', 'm1', '👍').subscribe();
    req = http.expectOne(`${BASE}/conversations/c1/messages/m1/reactions/%F0%9F%91%8D`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('cubre la lista negra de censura', () => {
    service.listCensoredWords().subscribe();
    let req = http.expectOne(`${BASE}/censorship/words`);
    expect(req.request.method).toBe('GET');
    req.flush([]);

    service.addCensoredWord('spam').subscribe();
    req = http.expectOne(`${BASE}/censorship/words`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ word: 'spam' });
    req.flush({ id: 'w1', word: 'spam', active: true });

    service.deactivateCensoredWord('w1').subscribe();
    req = http.expectOne(`${BASE}/censorship/words/w1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('normaliza errores HTTP a AppError con clave de traduccion', async () => {
    const result = firstValueFrom(service.sendMessage('c1', { content: 'hola' }));
    http
      .expectOne(`${BASE}/conversations/c1/messages`)
      .flush('boom', { status: 500, statusText: 'Server Error' });

    await expect(result).rejects.toMatchObject({ messageKey: 'errors.server' });
    await expect(result).rejects.toBeInstanceOf(AppError);
  });

  it('normaliza errores no HTTP como desconocidos', async () => {
    const result = firstValueFrom(service.sendMessage('c1', { content: 'hola' }));
    http
      .expectOne(`${BASE}/conversations/c1/messages`)
      .error(new ProgressEvent('network'));

    await expect(result).rejects.toMatchObject({ messageKey: 'errors.network' });
    expect(new HttpErrorResponse({ status: 0 })).toBeInstanceOf(HttpErrorResponse);
  });
});
