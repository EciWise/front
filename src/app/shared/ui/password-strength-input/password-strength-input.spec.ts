import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { StaticTranslateLoader } from '../../../core/i18n/static-translate.loader';
import { PasswordStrengthInputComponent } from './password-strength-input';

describe('PasswordStrengthInputComponent', () => {
  let fixture: ComponentFixture<PasswordStrengthInputComponent>;
  let component: PasswordStrengthInputComponent;
  let changed: string[];
  let touched: number;

  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const input = (): HTMLInputElement => el().querySelector<HTMLInputElement>('.psi__input')!;
  const setInputValue = (value: string): void => {
    input().value = value;
    input().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    changed = [];
    touched = 0;

    await TestBed.configureTestingModule({
      imports: [PasswordStrengthInputComponent],
      providers: [
        provideTranslateService({
          loader: { provide: TranslateLoader, useClass: StaticTranslateLoader },
          fallbackLang: 'es',
          lang: 'es',
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordStrengthInputComponent);
    component = fixture.componentInstance;
    component.registerOnChange((value) => changed.push(value));
    component.registerOnTouched(() => touched++);
    fixture.componentRef.setInput('placeholder', 'Password');
    fixture.componentRef.setInput('ariaLabel', 'Password field');
    fixture.detectChanges();
  });

  it('actua como ControlValueAccessor y notifica cambios/touched desde el input', () => {
    component.writeValue('Inicial123');
    fixture.detectChanges();

    expect(input().value).toBe('Inicial123');
    expect(input().getAttribute('placeholder')).toBe('Password');
    expect(input().getAttribute('aria-label')).toBe('Password field');

    setInputValue('abc');
    input().dispatchEvent(new Event('blur', { bubbles: true }));

    expect(changed).toEqual(['abc']);
    expect(touched).toBe(1);
    expect(el().querySelector<HTMLElement>('.psi__meter')?.dataset['strength']).toBe('weak');
    expect(el().querySelectorAll('.psi__bar--active')).toHaveLength(1);
  });

  it('calcula fortaleza media y segura y permite revelar/ocultar la contrasena', () => {
    setInputValue('Abcdef12');
    expect(el().querySelector<HTMLElement>('.psi__meter')?.dataset['strength']).toBe('medium');
    expect(el().querySelectorAll('.psi__bar--active')).toHaveLength(2);

    setInputValue('Abcdef12!!');
    expect(el().querySelector<HTMLElement>('.psi__meter')?.dataset['strength']).toBe('secure');
    expect(el().querySelectorAll('.psi__bar--active')).toHaveLength(3);

    expect(input().type).toBe('password');
    el().querySelector<HTMLButtonElement>('.psi__reveal')!.click();
    fixture.detectChanges();
    expect(input().type).toBe('text');

    el().querySelector<HTMLButtonElement>('.psi__reveal')!.click();
    fixture.detectChanges();
    expect(input().type).toBe('password');
  });

  it('respeta disabled state, null writeValue y el input showStrength', () => {
    component.writeValue(null);
    component.setDisabledState(true);
    fixture.detectChanges();

    expect(input().value).toBe('');
    expect(input().disabled).toBe(true);
    expect(el().querySelector<HTMLButtonElement>('.psi__reveal')!.disabled).toBe(true);
    expect(el().querySelector('.psi')?.classList.contains('psi--disabled')).toBe(true);

    fixture.componentRef.setInput('showStrength', false);
    fixture.detectChanges();

    expect(el().querySelector('.psi__meter')).toBeNull();
  });
});
