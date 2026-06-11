import { TestBed } from '@angular/core/testing';
import { TutoriasService } from './tutorias.service';

describe('TutoriasService', () => {
  let service: TutoriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TutoriasService);
  });

  it('marca como solicitada una tutoría disponible y reduce los cupos', () => {
    const target = service.items().find((m) => m.status === 'available')!;
    const seatsBefore = target.seats;

    service.request(target.id);
    const updated = service.items().find((m) => m.id === target.id)!;

    expect(updated.status).toBe('requested');
    expect(updated.seats).toBe(seatsBefore - 1);
  });

  it('no altera tutorías que ya fueron solicitadas', () => {
    const requested = service.items().find((m) => m.status === 'requested')!;
    service.request(requested.id);

    expect(service.items().find((m) => m.id === requested.id)?.status).toBe('requested');
  });
});
