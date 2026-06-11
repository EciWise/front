import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { AppNotification } from '../../../core/notifications/notification.model';
import { NotificationsService } from '../../../core/notifications/notifications.service';
import { NotificationsBellComponent } from './notifications-bell';

const makeItems = (): AppNotification[] => [
  {
    id: 'n1',
    titleKey: 'notifications.title',
    body: 'Tutoria aceptada',
    kind: 'success',
    createdAt: '2026-06-01T08:00:00Z',
    read: false,
  },
  {
    id: 'n2',
    titleKey: 'notifications.title',
    body: 'Material nuevo',
    kind: 'info',
    createdAt: '2026-06-02T08:00:00Z',
    read: false,
  },
];

describe('NotificationsBellComponent', () => {
  let fixture: ComponentFixture<NotificationsBellComponent>;
  let markAllRead: ReturnType<typeof vi.fn>;

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const trigger = (): HTMLButtonElement => el().querySelector('.bell > .icon-button') as HTMLButtonElement;

  beforeEach(async () => {
    const items = signal<AppNotification[]>(makeItems());
    markAllRead = vi.fn(() =>
      items.update((current) => current.map((item) => ({ ...item, read: true }))),
    );

    await TestBed.configureTestingModule({
      imports: [NotificationsBellComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        {
          provide: NotificationsService,
          useValue: {
            items: items.asReadonly(),
            unreadCount: computed(() => items().filter((item) => !item.read).length),
            markAllRead,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsBellComponent);
    fixture.detectChanges();
  });

  it('muestra contador, abre el panel y marca todas como leidas', () => {
    expect(el().querySelector('.icon-button__badge')?.textContent).toContain('2');
    expect(el().querySelector('.bell__panel')).toBeNull();

    trigger().click();
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(el().querySelectorAll('.bell__item').length).toBe(2);

    (el().querySelector('.bell__link') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(markAllRead).toHaveBeenCalledTimes(1);
    expect(el().querySelector('.icon-button__badge')).toBeNull();
    expect(el().querySelector('.bell__item--unread')).toBeNull();
  });

  it('cierra el panel desde el backdrop', () => {
    trigger().click();
    fixture.detectChanges();

    (el().querySelector('.bell__backdrop') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(el().querySelector('.bell__panel')).toBeNull();
  });
});
