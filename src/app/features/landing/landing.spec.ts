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

function openRegister(fixture: { nativeElement: HTMLElement; detectChanges: () => void }): HTMLElement {
  const el = fixture.nativeElement;
  const registerTab = el.querySelectorAll('.landing__auth-tab')[1] as HTMLButtonElement;
  registerTab.click();
  fixture.detectChanges();
  return el;
}

function fillInput(el: HTMLElement, selector: string, value: string): void {
  const input = el.querySelector(selector) as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

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

  it('convierte el correo de login a minusculas mientras se escribe', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    fillInput(el, '#login-email', 'ANA.DIAZ@GMAIL.COM');
    fixture.detectChanges();

    expect((el.querySelector('#login-email') as HTMLInputElement).value).toBe('ana.diaz@gmail.com');
  });

  it('permite mostrar y ocultar la contraseña de login', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const password = el.querySelector('#login-password') as HTMLInputElement;
    const toggle = el.querySelector('.landing__password-toggle') as HTMLButtonElement;

    expect(password.type).toBe('password');
    expect(toggle.getAttribute('aria-label')).toBe('Mostrar contraseña');

    toggle.click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
    expect(toggle.getAttribute('aria-label')).toBe('Ocultar contraseña');
  });

  it('cambia al formulario de registro al pulsar el tab de registro', async () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const el = openRegister(fixture);

    const dots = el.querySelectorAll('.landing__step-dot');
    expect(dots.length).toBe(3);
  });

  it('muestra campos obligatorios del primer paso solo al intentar continuar', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    const name = el.querySelector('#reg-nombre') as HTMLInputElement;
    name.dispatchEvent(new Event('blur', { bubbles: true }));
    fixture.detectChanges();

    expect(el.textContent).not.toContain('Este campo es obligatorio.');

    (el.querySelector('.landing__auth-submit') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Este campo es obligatorio.');
  });

  it('capitaliza nombre y apellido por palabra mientras se escriben', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-nombre', 'mARía jOSÉ');
    fillInput(el, '#reg-apellido', 'pÉREZ góMEZ');
    fixture.detectChanges();

    expect((el.querySelector('#reg-nombre') as HTMLInputElement).value).toBe('María José');
    expect((el.querySelector('#reg-apellido') as HTMLInputElement).value).toBe('Pérez Gómez');
  });

  it('convierte el correo de registro a minusculas mientras se escribe', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-email', 'ANA.DIAZ@GMAIL.COM');
    fixture.detectChanges();

    expect((el.querySelector('#reg-email') as HTMLInputElement).value).toBe('ana.diaz@gmail.com');
  });

  it('muestra y limpia el error de numeros en nombre segun el valor actual', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-nombre', 'Ana1');
    fixture.detectChanges();

    expect((el.querySelector('#reg-nombre') as HTMLInputElement).value).toBe('Ana1');
    expect(el.textContent).toContain('No se permiten números.');

    fillInput(el, '#reg-nombre', 'Ana');
    fixture.detectChanges();

    expect(el.textContent).not.toContain('No se permiten números.');
  });

  it('muestra y limpia el error cuando nombre o apellido supera 30 caracteres', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-apellido', 'abcdefghijklmnopqrstuvwxyzzzzzz');
    fixture.detectChanges();

    const lastName = el.querySelector('#reg-apellido') as HTMLInputElement;
    expect(lastName.value.length).toBeGreaterThan(30);
    expect(el.textContent).toContain('Máximo 30 caracteres.');

    fillInput(el, '#reg-apellido', 'Diaz');
    fixture.detectChanges();

    expect(el.textContent).not.toContain('Máximo 30 caracteres.');
  });

  it('aplica la mascara visual al telefono de registro', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-phone', '3001234567');
    fixture.detectChanges();

    expect((el.querySelector('#reg-phone') as HTMLInputElement).value).toBe('(300) 123-4567');
  });

  it('permite mostrar y ocultar las contraseñas de registro', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    const password = el.querySelector('#reg-pwd') as HTMLInputElement;
    const confirm = el.querySelector('#reg-confirm') as HTMLInputElement;
    const toggles = el.querySelectorAll('.landing__password-toggle');

    expect(password.type).toBe('password');
    expect(confirm.type).toBe('password');

    (toggles[0] as HTMLButtonElement).click();
    (toggles[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(password.type).toBe('text');
    expect(confirm.type).toBe('text');
  });

  it('reemplaza los selectores nativos por dropdowns personalizados en el paso academico', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-nombre', 'Ana');
    fillInput(el, '#reg-apellido', 'Diaz');
    fillInput(el, '#reg-email', 'ana@gmail.com');
    fillInput(el, '#reg-pwd', 'Password1!');
    fillInput(el, '#reg-confirm', 'Password1!');
    (el.querySelector('.landing__auth-submit') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.querySelectorAll('eci-select.landing__auth-select').length).toBe(3);
    expect(el.querySelectorAll('.landing__auth-card select').length).toBe(0);
  });

  it('muestra errores obligatorios del paso academico solo al intentar continuar', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    const el = openRegister(fixture);

    fillInput(el, '#reg-nombre', 'Ana');
    fillInput(el, '#reg-apellido', 'Diaz');
    fillInput(el, '#reg-email', 'ana@gmail.com');
    fillInput(el, '#reg-pwd', 'Password1!');
    fillInput(el, '#reg-confirm', 'Password1!');
    (el.querySelector('.landing__auth-submit') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.textContent).not.toContain('Por favor responde esta pregunta para continuar.');

    (el.querySelector('.landing__auth-submit') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(el.textContent).toContain('Por favor responde esta pregunta para continuar.');
  });
});
