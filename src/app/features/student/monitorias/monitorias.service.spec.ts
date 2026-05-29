import { TestBed } from '@angular/core/testing';
import { MonitoriasService } from './monitorias.service';

describe('MonitoriasService', () => {
  let service: MonitoriasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonitoriasService);
  });

  it('marca como solicitada una monitoría disponible y reduce los cupos', () => {
    const target = service.items().find((m) => m.status === 'available')!;
    const seatsBefore = target.seats;

    service.request(target.id);
    const updated = service.items().find((m) => m.id === target.id)!;

    expect(updated.status).toBe('requested');
    expect(updated.seats).toBe(seatsBefore - 1);
  });

  it('no altera monitorías que ya fueron solicitadas', () => {
    const requested = service.items().find((m) => m.status === 'requested')!;
    service.request(requested.id);

    expect(service.items().find((m) => m.id === requested.id)?.status).toBe('requested');
  });
});
