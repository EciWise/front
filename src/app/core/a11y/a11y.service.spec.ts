import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { A11yService } from './a11y.service';

interface A11yInternals {
  readonly handleShortcut: (event: KeyboardEvent) => void;
}

describe('A11yService', () => {
  function setup(platformId = 'browser'): A11yService {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(A11yService);
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('a11y-mode');
    TestBed.resetTestingModule();
  });

  it('activa el modo accesible aplicando la clase y persistiendo', () => {
    const service = setup();

    service.setEnabled(true);

    expect(service.enabled()).toBe(true);
    expect(document.documentElement.classList.contains('a11y-mode')).toBe(true);
    expect(localStorage.getItem('eciwise.a11y')).toBe('true');
  });

  it('alterna el modo accesible', () => {
    const service = setup();

    service.setEnabled(false);
    service.toggle();
    expect(service.enabled()).toBe(true);
    service.toggle();
    expect(service.enabled()).toBe(false);
    expect(document.documentElement.classList.contains('a11y-mode')).toBe(false);
  });

  it('inicializa desde localStorage y registra el atajo global', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    localStorage.setItem('eciwise.a11y', 'true');
    const service = setup();

    service.init();

    expect(service.enabled()).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('Alt+A alterna el modo y previene el evento', () => {
    const service = setup();
    const event = new KeyboardEvent('keydown', { altKey: true, key: 'A', cancelable: true });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    (service as unknown as A11yInternals).handleShortcut(event);

    expect(preventDefault).toHaveBeenCalled();
    expect(service.enabled()).toBe(true);
  });

  it('ignora atajos que no sean Alt+A', () => {
    const service = setup();
    const event = new KeyboardEvent('keydown', { key: 'A', cancelable: true });

    (service as unknown as A11yInternals).handleShortcut(event);

    expect(service.enabled()).toBe(false);
  });

  it('no toca DOM ni storage al inicializar en servidor', () => {
    const service = setup('server');

    service.init();

    expect(document.documentElement.classList.contains('a11y-mode')).toBe(false);
    expect(localStorage.getItem('eciwise.a11y')).toBeNull();
  });
});
