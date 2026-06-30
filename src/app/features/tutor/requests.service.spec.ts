import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../core/auth/auth.service';
import { TutoringRequestsService } from './requests.service';
import { TutorHistoryService } from './history.service';

const fakeAuth = { user: signal<null>(null).asReadonly() };

describe('TutoringRequestsService', () => {
  let service: TutoringRequestsService;
  let history: TutorHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: fakeAuth }],
    });
    service = TestBed.inject(TutoringRequestsService);
    history = TestBed.inject(TutorHistoryService);
  });

  it('acepta una solicitud pendiente y la registra como completada en el historial', () => {
    const req = service.requests().find((r) => r.status === 'pending')!;
    const historyBefore = history.entries().length;

    service.accept(req.id);

    expect(service.requests().find((r) => r.id === req.id)?.status).toBe('accepted');
    expect(service.pendingCount()).toBeLessThan(3);
    expect(history.entries().length).toBe(historyBefore + 1);
    expect(history.entries().some((e) => e.status === 'completed' && e.student === req.student)).toBe(
      true,
    );
  });

  it('rechaza una solicitud y la registra como cancelada', () => {
    const req = service.requests().find((r) => r.status === 'pending')!;
    service.reject(req.id);

    expect(service.requests().find((r) => r.id === req.id)?.status).toBe('rejected');
    expect(history.entries().some((e) => e.status === 'cancelled' && e.student === req.student)).toBe(
      true,
    );
  });

  it('no procesa dos veces la misma solicitud', () => {
    const req = service.requests().find((r) => r.status === 'pending')!;
    service.accept(req.id);
    const countAfterFirst = history.entries().length;
    service.reject(req.id);

    expect(history.entries().length).toBe(countAfterFirst);
    expect(service.requests().find((r) => r.id === req.id)?.status).toBe('accepted');
  });
});
