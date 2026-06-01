import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ForcePasswordChangeComponent } from './force-password-change';
import { AuthService } from '../../../core/auth/auth.service';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';

interface ChangeCall {
  newPassword: string;
  datosIa: unknown;
}

describe('ForcePasswordChangeComponent', () => {
  let calls: ChangeCall[];

  const mockAuth = {
    changePassword: (newPassword: string, datosIa?: unknown) => {
      calls.push({ newPassword, datosIa });
      return of(undefined);
    },
  };

  const create = async (): Promise<ComponentFixture<ForcePasswordChangeComponent>> => {
    calls = [];
    await TestBed.configureTestingModule({
      imports: [ForcePasswordChangeComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
        { provide: AuthService, useValue: mockAuth },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ForcePasswordChangeComponent);
    fixture.detectChanges();
    return fixture;
  };

  // Acceso a la signal `form` protegida para preparar valores en las pruebas.
  const formOf = (fixture: ComponentFixture<ForcePasswordChangeComponent>) =>
    (fixture.componentInstance as unknown as { form: FormGroup }).form;

  it('solo pide la contraseña: no incrusta el formulario de datos de IA', async () => {
    const fixture = await create();
    expect((fixture.nativeElement as HTMLElement).querySelector('.fpc__group')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('eci-datos-ia-fields')).toBeNull();
  });

  it('no envía si el formulario es inválido', async () => {
    const fixture = await create();
    fixture.componentInstance.submit();
    expect(calls.length).toBe(0);
  });

  it('no envía si las contraseñas no coinciden', async () => {
    const fixture = await create();
    formOf(fixture).patchValue({ newPassword: 'abcd1234', confirm: 'otra1234' });
    fixture.componentInstance.submit();
    expect(calls.length).toBe(0);
  });

  it('envía solo la nueva contraseña, sin datosIa', async () => {
    const fixture = await create();
    formOf(fixture).patchValue({ newPassword: 'abcd1234', confirm: 'abcd1234' });
    fixture.componentInstance.submit();

    expect(calls.length).toBe(1);
    expect(calls[0].newPassword).toBe('abcd1234');
    expect(calls[0].datosIa).toBeUndefined();
  });
});
