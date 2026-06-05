import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { LandingComponent } from './landing';
import { SpaceBackgroundComponent } from '../../shared/ui/space-background/space-background';
import { SpaceSceneService } from '../../shared/ui/space-background/space-scene.service';
import { StaticTranslateLoader } from '../../core/i18n/static-translate.loader';

/** Stub de la escena para no inicializar WebGL/three.js en jsdom. */
class SceneStub {
  init(): Promise<void> {
    return Promise.resolve();
  }
  readonly dispose = vi.fn();
}

@Component({ template: '' })
class DummyComponent {}

describe('LandingComponent', () => {
  let router: Router;

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
      .overrideComponent(SpaceBackgroundComponent, {
        set: { providers: [{ provide: SpaceSceneService, useClass: SceneStub }] },
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
