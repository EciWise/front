import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoTooltipComponent } from './tooltip';

@Component({
  imports: [InfoTooltipComponent],
  template: `
    <eci-info-tooltip
      text="Ayuda contextual"
      ariaLabel="Abrir ayuda"
      [placement]="placement"
    />
  `,
})
class TooltipHostComponent {
  placement: 'auto' | 'above' | 'below' = 'auto';
}

const rect = (
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect => ({
  left,
  top,
  width,
  height,
  right: left + width,
  bottom: top + height,
  x: left,
  y: top,
  toJSON: () => undefined,
} as DOMRect);

describe('InfoTooltipComponent', () => {
  let fixture: ComponentFixture<TooltipHostComponent>;

  const host = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('eci-info-tooltip') as HTMLElement;
  const trigger = (): HTMLButtonElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.tip__trigger') as HTMLButtonElement;
  const bubble = (): HTMLElement =>
    (fixture.nativeElement as HTMLElement).querySelector('.tip__bubble') as HTMLElement;

  beforeEach(async () => {
    Object.defineProperty(globalThis, 'innerWidth', {
      configurable: true,
      value: 320,
    });
    await TestBed.configureTestingModule({ imports: [TooltipHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TooltipHostComponent);
  });

  it('centra el popup dentro del viewport aunque el icono este pegado al borde', () => {
    fixture.detectChanges();
    host().getBoundingClientRect = () => rect(0, 100, 20, 20);
    trigger().getBoundingClientRect = () => rect(2, 120, 20, 20);

    trigger().dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    expect(bubble().classList.contains('tip__bubble--visible')).toBe(true);
    expect(bubble().style.left).toBe('152px');
    expect(bubble().style.top).toBe('48px');
    expect(bubble().classList.contains('tip__bubble--above')).toBe(false);
  });

  it('usa posicion superior cuando placement es above y se oculta al perder hover', () => {
    fixture.componentInstance.placement = 'above';
    fixture.detectChanges();
    host().getBoundingClientRect = () => rect(10, 100, 20, 20);
    trigger().getBoundingClientRect = () => rect(130, 160, 20, 20);

    trigger().dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    expect(bubble().classList.contains('tip__bubble--above')).toBe(true);
    expect(bubble().style.top).toBe('52px');

    trigger().dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    fixture.detectChanges();

    expect(bubble().classList.contains('tip__bubble--visible')).toBe(false);
  });
});
