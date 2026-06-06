import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimePickerComponent } from './time-picker';

@Component({
  standalone: true,
  imports: [TimePickerComponent],
  template: `
    <eci-time-picker
      [value]="value()"
      (valueChange)="value.set($event)"
      [step]="step()"
      [placeholder]="placeholder()"
    />
  `,
})
class TimePickerHostComponent {
  readonly value = signal('08:00');
  readonly step = signal(60);
  readonly placeholder = signal('Hora');
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

describe('TimePickerComponent', () => {
  let fixture: ComponentFixture<TimePickerHostComponent>;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  const host = (): TimePickerHostComponent => fixture.componentInstance;
  const el = (): HTMLElement => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    scrollIntoView = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });

    await TestBed.configureTestingModule({
      imports: [TimePickerHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimePickerHostComponent);
    fixture.detectChanges();
  });

  it('abre la lista con granularidad configurada, centra la seleccion y emite el nuevo horario', async () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 700 });
    const field = el().querySelector<HTMLButtonElement>('.tp-field')!;
    mockRect(field, { top: 40, bottom: 72, left: 64, width: 220 });

    field.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const list = el().querySelector<HTMLElement>('.tp-pop')!;
    const options = Array.from(el().querySelectorAll<HTMLButtonElement>('.tp-opt'));
    expect(list.style.top).toBe('76px');
    expect(list.style.left).toBe('64px');
    expect(list.style.width).toBe('220px');
    expect(options).toHaveLength(24);
    expect(el().querySelector('.tp-opt--selected')?.textContent?.trim()).toBe('08:00');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' });

    options.find((option) => option.textContent?.trim() === '09:00')!.click();
    fixture.detectChanges();

    expect(host().value()).toBe('09:00');
    expect(el().querySelector('.tp-pop')).toBeNull();
    expect(field.getAttribute('aria-expanded')).toBe('false');
  });

  it('posiciona arriba cuando no hay espacio y cierra con click externo', () => {
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 300 });
    const field = el().querySelector<HTMLButtonElement>('.tp-field')!;
    mockRect(field, { top: 250, bottom: 282, left: 24, width: 160 });

    field.click();
    fixture.detectChanges();

    const list = el().querySelector<HTMLElement>('.tp-pop')!;
    expect(list.style.top).toBe('22px');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(el().querySelector('.tp-pop')).toBeNull();
  });
});
