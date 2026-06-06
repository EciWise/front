import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DatePickerComponent } from './date-picker';

interface DayCellLike {
  readonly iso: string;
  readonly label: number;
  readonly inMonth: boolean;
  readonly disabled: boolean;
}

interface DatePickerInternals {
  readonly open: () => boolean;
  readonly days: () => readonly DayCellLike[];
  select(cell: DayCellLike): void;
}

@Component({
  standalone: true,
  imports: [DatePickerComponent],
  template: `
    <eci-date-picker
      [value]="value()"
      (valueChange)="value.set($event)"
      [min]="min()"
      [max]="max()"
      [placeholder]="placeholder()"
    />
  `,
})
class DatePickerHostComponent {
  readonly value = signal('2026-06-15');
  readonly min = signal('2026-06-10');
  readonly max = signal('2026-06-20');
  readonly placeholder = signal('Fecha');
}

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () =>
      ({
        x: rect.left ?? 0,
        y: rect.top ?? 0,
        width: rect.width ?? 0,
        height: rect.height ?? 0,
        top: rect.top ?? 0,
        right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
        bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
        left: rect.left ?? 0,
        toJSON: () => ({}),
      }) as DOMRect,
  });
}

describe('DatePickerComponent', () => {
  let fixture: ComponentFixture<DatePickerHostComponent>;

  const host = (): DatePickerHostComponent => fixture.componentInstance;
  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;
  const picker = (): DatePickerInternals =>
    fixture.debugElement.query(By.directive(DatePickerComponent)).componentInstance as DatePickerInternals;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatePickerHostComponent);
    fixture.detectChanges();
  });

  it('abre el calendario posicionado dentro del viewport y selecciona una fecha habilitada', () => {
    Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: 600 });
    Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 700 });
    const field = el().querySelector<HTMLButtonElement>('.dp-field')!;
    mockRect(field, { top: 12, bottom: 44, left: 500, width: 180 });

    field.click();
    fixture.detectChanges();

    const popover = el().querySelector<HTMLElement>('.dp-pop')!;
    expect(popover).not.toBeNull();
    expect(popover.style.top).toBe('48px');
    expect(popover.style.left).toBe('304px');
    expect(field.getAttribute('aria-expanded')).toBe('true');
    expect(el().querySelector('.dp-day--selected')?.textContent?.trim()).toBe('15');

    const disabled = picker().days().find((cell) => cell.disabled)!;
    picker().select(disabled);
    fixture.detectChanges();

    expect(host().value()).toBe('2026-06-15');
    expect(picker().open()).toBe(true);

    const enabledDay = Array.from(el().querySelectorAll<HTMLButtonElement>('.dp-day')).find(
      (button) => button.textContent?.trim() === '16' && !button.classList.contains('dp-day--muted'),
    )!;
    enabledDay.click();
    fixture.detectChanges();

    expect(host().value()).toBe('2026-06-16');
    expect(el().querySelector('.dp-pop')).toBeNull();
    expect(field.getAttribute('aria-expanded')).toBe('false');
  });

  it('posiciona arriba cuando no hay espacio debajo y cierra con click externo', () => {
    Object.defineProperty(globalThis, 'innerWidth', { configurable: true, value: 900 });
    Object.defineProperty(globalThis, 'innerHeight', { configurable: true, value: 600 });
    const field = el().querySelector<HTMLButtonElement>('.dp-field')!;
    mockRect(field, { top: 520, bottom: 552, left: 120, width: 180 });

    field.click();
    fixture.detectChanges();

    const popover = el().querySelector<HTMLElement>('.dp-pop')!;
    expect(popover.style.top).toBe('196px');
    expect(popover.style.left).toBe('120px');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(el().querySelector('.dp-pop')).toBeNull();
  });
});
