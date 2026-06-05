import { TestBed } from '@angular/core/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationsService);
  });

  it('expone notificaciones iniciales no leidas y calcula el contador', () => {
    expect(service.items()).toHaveLength(2);
    expect(service.items().every((item) => !item.read)).toBe(true);
    expect(service.unreadCount()).toBe(2);
  });

  it('marca una notificacion puntual como leida sin alterar las demas', () => {
    service.markRead('n1');

    expect(service.items().find((item) => item.id === 'n1')?.read).toBe(true);
    expect(service.items().find((item) => item.id === 'n2')?.read).toBe(false);
    expect(service.unreadCount()).toBe(1);
  });

  it('ignora ids inexistentes al marcar lectura', () => {
    const before = service.items();

    service.markRead('missing');

    expect(service.items()).toEqual(before);
    expect(service.unreadCount()).toBe(2);
  });

  it('marca todas las notificaciones como leidas', () => {
    service.markAllRead();

    expect(service.items().every((item) => item.read)).toBe(true);
    expect(service.unreadCount()).toBe(0);
  });
});
