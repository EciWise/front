import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfettiComponent } from './confetti';

@Component({
  standalone: true,
  imports: [ConfettiComponent],
  template: `<eci-confetti [count]="count()" />`,
})
class ConfettiHostComponent {
  readonly count = signal(3);
}

describe('ConfettiComponent', () => {
  let fixture: ComponentFixture<ConfettiHostComponent>;
  let values: number[];
  let getRandomValues: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    values = Array.from({ length: 64 }, (_, index) => (index % 10) * 0x19999999);
    getRandomValues = vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(
      <T extends ArrayBufferView | null>(array: T): T => {
        if (array instanceof Uint32Array) {
          array[0] = values.shift() ?? 0;
        }
        return array;
      },
    );

    await TestBed.configureTestingModule({
      imports: [ConfettiHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfettiHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    getRandomValues.mockRestore();
  });

  it('genera piezas deterministas con estilos CSS listos para animar', () => {
    const pieces = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.confetti__piece'),
    );

    expect(pieces).toHaveLength(3);
    expect(parseFloat(pieces[0].style.left)).toBeGreaterThanOrEqual(0);
    expect(parseFloat(pieces[0].style.left)).toBeLessThan(100);
    expect(parseInt(pieces[0].style.width, 10)).toBeGreaterThanOrEqual(7);
    expect(parseInt(pieces[0].style.width, 10)).toBeLessThanOrEqual(13);
    expect(pieces[0].style.getPropertyValue('--drift')).not.toBe('');
    expect(pieces.some((piece) => piece.classList.contains('confetti__piece--round'))).toBe(true);
  });

  it('recalcula la cantidad de piezas cuando cambia el input', () => {
    fixture.componentInstance.count.set(1);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.confetti__piece'),
    ).toHaveLength(1);
  });
});
