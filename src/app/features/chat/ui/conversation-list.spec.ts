import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Role } from '../../../core/models/role.enum';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { TalkApiService } from '../talk-api.service';
import { TalkRealtimeService } from '../talk-realtime.service';
import { ConversationListComponent } from './conversation-list';

describe('ConversationListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationListComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: TalkApiService, useValue: {} },
        {
          provide: TalkRealtimeService,
          useValue: { events$: new Subject(), typing$: new Subject(), notifications$: new Subject() },
        },
        { provide: AuthService, useValue: { role: signal(Role.Student), user: signal({ id: 'me' }) } },
      ],
    }).compileComponents();
  });

  it('muestra el estado vacío cuando no hay conversaciones', () => {
    const fixture = TestBed.createComponent(ConversationListComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.conv-list__empty')).not.toBeNull();
    // Un estudiante no ve el acceso a moderación.
    expect(el.querySelector('[lucideShieldCheck]')).toBeNull();
  });
});
