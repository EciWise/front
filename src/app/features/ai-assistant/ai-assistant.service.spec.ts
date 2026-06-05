import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AiAssistantService } from './ai-assistant.service';

describe('AiAssistantService', () => {
  let service: AiAssistantService;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiAssistantService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inicia la conversacion con el mensaje semilla del asistente', () => {
    expect(service.messages()).toEqual([
      expect.objectContaining({ id: 'seed', author: 'assistant' }),
    ]);
  });

  it('ignora mensajes vacios sin alterar el historial', () => {
    let completed = false;
    let emitted = false;

    service.send('   ').subscribe({
      next: () => (emitted = true),
      complete: () => (completed = true),
    });

    expect(emitted).toBe(false);
    expect(completed).toBe(true);
    expect(service.messages().map((message) => message.id)).toEqual(['seed']);
  });

  it('agrega el mensaje del usuario y luego la respuesta simulada', async () => {
    const replyPromise = firstValueFrom(service.send('  horarios de tutoria  '));

    expect(service.messages()).toContainEqual({
      id: 'u-1780315200000',
      author: 'user',
      text: 'horarios de tutoria',
    });
    expect(service.messages()).toHaveLength(2);

    await vi.advanceTimersByTimeAsync(500);
    const reply = await replyPromise;

    expect(reply).toEqual({
      id: 'a-1780315200000',
      author: 'assistant',
      text: expect.stringContaining('horarios de tutoria'),
    });
    expect(service.messages().at(-1)).toEqual(reply);
  });
});
