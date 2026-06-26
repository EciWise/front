import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CarouselComponent } from './carousel';

// jsdom no implementa scrollBy ni scrollTo en HTMLElement — los mockeamos globalmente
// para que los tests de teclado no fallen por falta de implementación DOM.
beforeAll(() => {
  if (!HTMLElement.prototype.scrollBy) {
    HTMLElement.prototype.scrollBy = vi.fn();
  }
  if (!HTMLElement.prototype.scrollTo) {
    HTMLElement.prototype.scrollTo = vi.fn();
  }
});

@Component({
  imports: [CarouselComponent],
  template: `
    <eci-carousel ariaLabel="Test carousel" prevLabel="Anterior" nextLabel="Siguiente" slideLabel="Diapositiva">
      <div class="slide">Slide 1</div>
      <div class="slide">Slide 2</div>
      <div class="slide">Slide 3</div>
    </eci-carousel>
  `,
})
class TestHostComponent {}

@Component({
  imports: [CarouselComponent],
  template: `
    <eci-carousel ariaLabel="single">
      <div class="slide">Solo uno</div>
    </eci-carousel>
  `,
})
class SingleSlideHostComponent {}

describe('CarouselComponent', () => {
  describe('con varios slides', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TestHostComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
    });

    it('se crea correctamente', () => {
      const carousel = fixture.debugElement.query(By.directive(CarouselComponent));
      expect(carousel).toBeTruthy();
    });

    it('el elemento host con aria-label está en el DOM', () => {
      expect(fixture.nativeElement.querySelector('[aria-label]')).not.toBeNull();
    });

    it('el elemento .carousel__track está presente', () => {
      expect(fixture.nativeElement.querySelector('.carousel__track')).not.toBeNull();
    });

    it('responde a ArrowLeft y ArrowRight sin lanzar', () => {
      const carouselEl = fixture.nativeElement.querySelector('[role="group"]');
      expect(() => {
        carouselEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        carouselEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        carouselEl?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      }).not.toThrow();
    });
  });

  describe('con un único slide', () => {
    let fixture: ComponentFixture<SingleSlideHostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SingleSlideHostComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(SingleSlideHostComponent);
      fixture.detectChanges();
    });

    it('se crea correctamente con un slide', () => {
      const carousel = fixture.debugElement.query(By.directive(CarouselComponent));
      expect(carousel).toBeTruthy();
    });
  });

  describe('standalone (sin host)', () => {
    let fixture: ComponentFixture<CarouselComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CarouselComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(CarouselComponent);
      fixture.detectChanges();
    });

    it('se crea sin slides proyectados', () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it('defaults: prevLabel=Previous, nextLabel=Next, slideLabel=Slide', () => {
      const comp = fixture.componentInstance;
      expect(comp.prevLabel()).toBe('Previous');
      expect(comp.nextLabel()).toBe('Next');
      expect(comp.slideLabel()).toBe('Slide');
    });

    it('ariaLabel por defecto es cadena vacía', () => {
      expect(fixture.componentInstance.ariaLabel()).toBe('');
    });

    it('goTo con índice fuera de rango no lanza', () => {
      const comp = fixture.componentInstance as unknown as { goTo(i: number): void };
      expect(() => comp.goTo(99)).not.toThrow();
    });

    it('onKeydown con teclas no direccionales no lanza', () => {
      const comp = fixture.componentInstance as unknown as {
        onKeydown(e: KeyboardEvent): void;
      };
      expect(() => {
        comp.onKeydown(new KeyboardEvent('keydown', { key: 'Tab' }));
        comp.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
        comp.onKeydown(new KeyboardEvent('keydown', { key: 'Space' }));
      }).not.toThrow();
    });

    it('onKeydown con ArrowLeft/ArrowRight no lanza (scrollBy mockeado)', () => {
      const comp = fixture.componentInstance as unknown as {
        onKeydown(e: KeyboardEvent): void;
      };
      expect(() => {
        comp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        comp.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      }).not.toThrow();
    });
  });
});
