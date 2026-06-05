import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  function setup(platformId = 'browser'): ThemeService {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: platformId }],
    });
    return TestBed.inject(ThemeService);
  }

  function mockMatchMedia(matches: boolean): void {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches }),
    });
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.resetTestingModule();
    mockMatchMedia(false);
  });

  it('aplica el tema al html y lo persiste', () => {
    const service = setup();

    service.setTheme('dark');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem('eciwise.theme')).toBe('dark');
  });

  it('alterna entre claro y oscuro', () => {
    const service = setup();

    service.setTheme('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
  });

  it('inicializa desde localStorage antes que prefers-color-scheme', () => {
    localStorage.setItem('eciwise.theme', 'light');
    mockMatchMedia(true);
    const service = setup();

    service.init();

    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('usa prefers-color-scheme cuando no hay preferencia guardada', () => {
    mockMatchMedia(true);
    const service = setup();

    service.init();

    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('eciwise.theme')).toBe('dark');
  });

  it('no toca DOM ni storage al inicializar en servidor', () => {
    const service = setup('server');

    service.init();

    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    expect(localStorage.getItem('eciwise.theme')).toBeNull();
  });
});
