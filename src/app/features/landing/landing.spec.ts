import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { LandingComponent } from './landing';
import { StaticTranslateLoader } from '../../core/i18n/static-translate.loader';
import { AuroraBackgroundComponent } from '../../shared/ui/aurora-background/aurora-background';
import { SymbolSceneService } from '../../shared/ui/aurora-background/symbol-scene.service';

@Component({ template: '' })
class DummyComponent {}

/** Evita inicializar WebGL (Three.js) en jsdom: el fondo solo decora. */
class SceneStub {
  init(): Promise<void> {
    return Promise.resolve();
  }
  readonly dispose = vi.fn();
}

describe('LandingComponent', () => {
  let router: Router;

  // El fondo `eci-aurora-background` combina orbes CSS con una escena 3D
  // (Three.js); se stubea su escena para no inicializar WebGL en jsdom.
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        provideRouter([
          { path: 'auth/login', component: DummyComponent },
          { path: 'auth/register', component: DummyComponent },
        ]),
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    })
      .overrideComponent(AuroraBackgroundComponent, {
        set: { providers: [{ provide: SymbolSceneService, useClass: SceneStub }] },
      })
      .compileComponents();

    router = TestBed.inject(Router);
  });

  it('renderiza los dos botones de llamado a la acción', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const ctaButtons = fixture.nativeElement.querySelectorAll('.landing__cta button');
    expect(ctaButtons.length).toBe(2);
  });

  it('navega a login al hacer clic en "Ingresar"', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const enterButton = fixture.nativeElement.querySelectorAll(
      '.landing__cta button',
    )[0] as HTMLButtonElement;
    enterButton.click();

    expect(navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('navega a registro al hacer clic en "Registrarse"', () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const registerButton = fixture.nativeElement.querySelectorAll(
      '.landing__cta button',
    )[1] as HTMLButtonElement;
    registerButton.click();

    expect(navigate).toHaveBeenCalledWith(['/auth/register']);
  });
});
