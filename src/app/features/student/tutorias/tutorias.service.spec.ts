import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TutoringApiService } from '../../../core/tutoring/tutoring-api.service';
import { TutoriasService } from './tutorias.service';

const makeDto = (id: string, seats = 3) => ({
  id,
  tutorNombre: 'Monitor',
  materiaNombre: 'Cálculo',
  fecha: '2026-07-01',
  horaInicio: '10:00',
  cuposDisponibles: seats,
  modalidad: 'VIRTUAL' as const,
});

describe('TutoriasService', () => {
  let service: TutoriasService;
  let reservar: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reservar = vi.fn(() => of({}));

    TestBed.configureTestingModule({
      providers: [
        {
          provide: TutoringApiService,
          useValue: {
            buscarTutorias: vi.fn(() => of([makeDto('t1', 3), makeDto('t2', 2)])),
            reservar,
            cancelarReserva: vi.fn(() => of({})),
          },
        },
      ],
    });
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
    service.request('t1');
    const statusAfterFirst = service.items().find((m) => m.id === 't1')?.status;
    expect(statusAfterFirst).toBe('requested');

    service.request('t1');
    expect(service.items().find((m) => m.id === 't1')?.status).toBe('requested');
  });
});
