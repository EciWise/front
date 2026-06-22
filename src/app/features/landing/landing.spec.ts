import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { LandingComponent } from './landing';
import { StaticTranslateLoader } from '../../core/i18n/static-translate.loader';
import { AuroraBackgroundComponent } from '../../shared/ui/aurora-background/aurora-background';
import { SymbolSceneService } from '../../shared/ui/aurora-background/symbol-scene.service';
import { AuthService } from '../../core/auth/auth.service';
import { AUTH_CONFIG } from '../../core/auth/auth.config';
import { Role } from '../../core/models/role.enum';
import { User } from '../../core/models/user.model';

class SceneStub {
  init(): Promise<void> { return Promise.resolve(); }
  readonly dispose = vi.fn();
}

const stubUser = { id: 'u1', name: 'Test', email: 't@gmail.com', role: Role.Student } as User;

describe('LandingComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: '' } },
        {
          provide: AuthService,
          useValue: {
            loginWithEmail: vi.fn(() => of(stubUser)),
            register: vi.fn(() => of(stubUser)),
          },
        },
      ],
    })
      .overrideComponent(AuroraBackgroundComponent, {
        set: { providers: [{ provide: SymbolSceneService, useClass: SceneStub }] },
      })
      .compileComponents();
  });

  it('renderiza los tabs de login y registro en la card de auth', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll('.landing__auth-tab');
    expect(tabs.length).toBe(2);
  });

  it('muestra el formulario de login por defecto', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('.landing__auth-form input');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('cambia al formulario de registro al pulsar el tab de registro', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const registerTab = fixture.nativeElement.querySelectorAll(
      '.landing__auth-tab',
    )[1] as HTMLButtonElement;
    registerTab.click();
    fixture.detectChanges();

    const dots = fixture.nativeElement.querySelectorAll('.landing__step-dot');
    expect(dots.length).toBe(3);
  });
});
