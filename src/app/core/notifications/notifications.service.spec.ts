import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NOTIFICATIONS_CONFIG } from './notifications.config';
import { NotificationsService } from './notifications.service';

const BASE = 'http://test-notifications';

const MOCK_API = [
  { id: 1, asunto: 'Tutoria aceptada', resumen: '...', visto: false, fechaCreacion: '2026-01-01', type: 'info' },
  { id: 2, asunto: 'Material nuevo', resumen: '...', visto: false, fechaCreacion: '2026-01-02', type: 'info' },
];

describe('NotificationsService', () => {
  let service: NotificationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NOTIFICATIONS_CONFIG, useValue: { notificationsApiUrl: BASE } },
      ],
    });
    service = TestBed.inject(NotificationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function seed(): void {
    service.load();
    http.expectOne(`${BASE}/notificacion`).flush(MOCK_API);
  }

  it('expone notificaciones iniciales no leidas y calcula el contador', () => {
    seed();
    expect(service.items()).toHaveLength(2);
    expect(service.items().every((item) => !item.read)).toBe(true);
    expect(service.unreadCount()).toBe(2);
  });

  it('marca una notificacion puntual como leida sin alterar las demas', () => {
    seed();
    service.markRead('1');
    http.expectOne(`${BASE}/notificacion/read/1`).flush({});

    expect(service.items().find((item) => item.id === '1')?.read).toBe(true);
    expect(service.items().find((item) => item.id === '2')?.read).toBe(false);
    expect(service.unreadCount()).toBe(1);
  });

  it('ignora ids inexistentes al marcar lectura', () => {
    seed();
    const before = service.items();

    service.markRead('missing');
    http.expectOne(`${BASE}/notificacion/read/missing`).flush({});

    expect(service.items()).toEqual(before);
    expect(service.unreadCount()).toBe(2);
  });

  it('marca todas las notificaciones como leidas', () => {
    seed();
    service.markAllRead();
    http.expectOne(`${BASE}/notificacion/read-all`).flush({});

    expect(service.items().every((item) => item.read)).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });
});
