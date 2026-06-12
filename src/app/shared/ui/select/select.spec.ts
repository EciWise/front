import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { SelectComponent, SelectValue } from './select';

@Component({
  imports: [ReactiveFormsModule, SelectComponent],
  template: `
    <form [formGroup]="form">
      <eci-select
        formControlName="role"
        placeholder="Pick one"
        ariaLabel="Role"
        [options]="options"
        (valueChange)="changes.push($event)"
      />
    </form>
    <button type="button" class="outside">Outside</button>
  `,
})
class SelectHostComponent {
  readonly form = new FormGroup({
    role: new FormControl<SelectValue>(null),
  });
  readonly options = [
    { value: 'student', label: 'Student' },
    { value: 'tutor', label: 'Tutor' },
    { value: 'admin', label: 'Admin', disabled: true },
    { value: 2, label: 'Numbered' },
  ];
  readonly changes: SelectValue[] = [];
}

describe('SelectComponent', () => {
  let fixture: ComponentFixture<SelectHostComponent>;

  const trigger = (): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.select__trigger') as HTMLButtonElement;
  const select = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('eci-select') as HTMLElement;
  const selectShell = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.select') as HTMLElement;
  const options = (): NodeListOf<HTMLButtonElement> =>
    (fixture.nativeElement as HTMLElement).querySelectorAll('.select__option');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectHostComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectHostComponent);
    fixture.detectChanges();
  });

  it('abre con teclado, selecciona una opcion y notifica al formulario', () => {
    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(options().length).toBe(4);
    options()[1].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.role.value).toBe('tutor');
    expect(fixture.componentInstance.changes).toEqual(['tutor']);
    expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).toBeNull();
    expect(trigger().textContent).toContain('Tutor');
  });

  it('no cambia valor al intentar elegir una opcion deshabilitada', () => {
    trigger().click();
    fixture.detectChanges();

    options()[2].click();
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.role.value).toBeNull();
    expect(fixture.componentInstance.changes).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).not.toBeNull();
  });

  it('cierra con Escape, marca touched y tambien cierra con click externo', () => {
    trigger().click();
    fixture.detectChanges();

    trigger().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.form.controls.role.touched).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).toBeNull();

    trigger().click();
    fixture.detectChanges();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).toBeNull();
  });

  it('respeta el estado disabled del ControlValueAccessor', () => {
    fixture.componentInstance.form.controls.role.disable();
    fixture.detectChanges();

    expect(trigger().disabled).toBe(true);
    trigger().click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).toBeNull();
  });

  it('reconcilia valores numericos y strings equivalentes al mostrar seleccion', () => {
    fixture.componentInstance.form.controls.role.setValue('2');
    fixture.detectChanges();

    expect(trigger().textContent).toContain('Numbered');
  });

  it('despliega el menu hacia arriba cuando no hay espacio suficiente abajo', () => {
    const browserWindow = globalThis.window;
    const originalInnerHeight = browserWindow.innerHeight;
    const originalInnerWidth = browserWindow.innerWidth;
    Object.defineProperty(browserWindow, 'innerHeight', { configurable: true, value: 600 });
    Object.defineProperty(browserWindow, 'innerWidth', { configurable: true, value: 1024 });

    try {
      select().getBoundingClientRect = () =>
        ({
          top: 520,
          bottom: 568,
          left: 24,
          right: 324,
          width: 300,
          height: 48,
          x: 24,
          y: 520,
          toJSON: () => ({}),
        });

      trigger().click();
      fixture.detectChanges();

      expect(selectShell().classList).toContain('select--above');
      expect((fixture.nativeElement as HTMLElement).querySelector('.select__menu')).not.toBeNull();
    } finally {
      Object.defineProperty(browserWindow, 'innerHeight', {
        configurable: true,
        value: originalInnerHeight,
      });
      Object.defineProperty(browserWindow, 'innerWidth', {
        configurable: true,
        value: originalInnerWidth,
      });
    }
  });
});
