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

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  new DOMRect(left, top, width, height);

describe('InfoTooltipComponent', () => {
  let fixture: ComponentFixture<TooltipHostComponent>;

  const root = (): HTMLElement => fixture.nativeElement;
  const host = (): HTMLElement =>
    root().querySelector<HTMLElement>('eci-info-tooltip')!;
  const trigger = (): HTMLButtonElement =>
    root().querySelector<HTMLButtonElement>('.tip__trigger')!;
  const bubble = (): HTMLElement =>
    root().querySelector<HTMLElement>('.tip__bubble')!;

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
