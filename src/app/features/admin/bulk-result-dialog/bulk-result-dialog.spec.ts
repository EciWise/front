import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { BulkResultDialogComponent } from './bulk-result-dialog';
import { BulkUploadResult } from '../user-admin.service';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';

/** Construye un usuario de resultado con valores por defecto. */
const makeUser = (n: number) => ({
  email: `user${n}@test.com`,
  nombre: `Nombre${n}`,
  apellido: `Apellido${n}`,
  rol: 'estudiante',
  passwordTemporal: `pass${n}`,
});

const makeResult = (count: number, errores: BulkUploadResult['errores'] = []): BulkUploadResult => ({
  total: count + errores.length,
  creados: count,
  errores,
  usuarios: Array.from({ length: count }, (_, i) => makeUser(i + 1)),
});

describe('BulkResultDialogComponent', () => {
  let written: string[];

  const setup = (result: BulkUploadResult): ComponentFixture<BulkResultDialogComponent> => {
    const fixture = TestBed.createComponent(BulkResultDialogComponent);
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    return fixture;
  };

  const rows = (fixture: ComponentFixture<BulkResultDialogComponent>) =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.dialog__table tbody tr');

  beforeEach(async () => {
    written = [];
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          written.push(text);
          return Promise.resolve();
        },
      },
    });

    await TestBed.configureTestingModule({
      imports: [BulkResultDialogComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();
  });

  it('renderiza los usuarios creados y el chip de resumen', () => {
    const fixture = setup(makeResult(2));
    const el = fixture.nativeElement as HTMLElement;

    expect(rows(fixture).length).toBe(2);
    expect(el.querySelector('.dialog__chip--ok')?.textContent).toContain('2');
    expect(el.querySelector('.dialog__role')?.textContent).toContain('Estudiante');
    expect(el.querySelector('.dialog__role')?.textContent).not.toContain('estudiante');
    // Sin errores, no se muestra el chip de error ni la pestaña de errores.
    expect(el.querySelector('.dialog__chip--err')).toBeNull();
    expect(el.querySelectorAll('.dialog__tab').length).toBe(1);
  });

  it('pagina los usuarios (6 por página) y avanza con next()', () => {
    const fixture = setup(makeResult(7));
    const component = fixture.componentInstance;

    expect(rows(fixture).length).toBe(6);
    expect((fixture.nativeElement as HTMLElement).querySelector('.dialog__pager')).not.toBeNull();

    component.next();
    fixture.detectChanges();
    expect(rows(fixture).length).toBe(1);

    component.prev();
    fixture.detectChanges();
    expect(rows(fixture).length).toBe(6);
  });

  it('no muestra el paginador cuando cabe en una página', () => {
    const fixture = setup(makeResult(6));
    expect((fixture.nativeElement as HTMLElement).querySelector('.dialog__pager')).toBeNull();
  });

  it('emite close al invocar onClose()', () => {
    const fixture = setup(makeResult(1));
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    fixture.componentInstance.onClose();
    expect(closed).toBe(true);
  });

  it('copia la contraseña de una fila al portapapeles', async () => {
    const fixture = setup(makeResult(1));
    await fixture.componentInstance.copyPassword('pass1', 0);
    expect(written).toEqual(['pass1']);
  });

  it('copia todas las parejas correo/contraseña', async () => {
    const fixture = setup(makeResult(2));
    await fixture.componentInstance.copyAll();
    expect(written.length).toBe(1);
    expect(written[0]).toBe('user1@test.com,pass1\nuser2@test.com,pass2');
  });

  it('muestra la pestaña de errores con su motivo', () => {
    const fixture = setup(
      makeResult(1, [{ fila: 2, email: 'dup@test.com', motivo: 'email_ya_existe' }]),
    );
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.dialog__chip--err')).not.toBeNull();
    // Hay creados, así que la pestaña activa es "Creados"; cambiamos a errores.
    expect(el.querySelectorAll('.dialog__tab').length).toBe(2);
    fixture.componentInstance.setTab('errors');
    fixture.detectChanges();

    const errors = el.querySelector('.dialog__errs');
    expect(errors).not.toBeNull();
    expect(errors?.textContent).toContain('dup@test.com');
    expect(errors?.textContent).toContain('El correo ya está registrado.');
  });

  it('arranca en la pestaña de errores cuando no se creó a nadie', () => {
    const fixture = setup(
      makeResult(0, [{ fila: 2, email: 'dup@test.com', motivo: 'email_ya_existe' }]),
    );
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.dialog__errs')).not.toBeNull();
    expect(el.querySelector('.dialog__errs')?.textContent).toContain('dup@test.com');
  });

  it('opera tabs, paginador, copiado y cierre desde la plantilla', async () => {
    const fixture = setup(
      makeResult(7, [{ fila: 9, email: 'bad@test.com', motivo: 'rol_invalido' }]),
    );
    const el = fixture.nativeElement as HTMLElement;
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));

    el.querySelector<HTMLButtonElement>('.dialog__copy')!.click();
    await Promise.resolve();
    fixture.detectChanges();
    expect(written).toEqual(['pass1']);

    el.querySelectorAll<HTMLButtonElement>('.dialog__nav')[1].click();
    fixture.detectChanges();
    expect(el.querySelector('.dialog__page')?.textContent).toContain('2 / 2');
    expect(rows(fixture).length).toBe(1);

    el.querySelectorAll<HTMLButtonElement>('.dialog__tab')[1].click();
    fixture.detectChanges();
    expect(el.querySelector('.dialog__errs')?.textContent).toContain('bad@test.com');

    el.querySelector<HTMLButtonElement>('.dialog__scrim')!.click();
    expect(closed).toBe(true);
  });
});
