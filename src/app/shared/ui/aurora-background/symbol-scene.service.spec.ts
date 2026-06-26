import { TestBed } from '@angular/core/testing';
import { SymbolSceneService } from './symbol-scene.service';

describe('SymbolSceneService', () => {
  let service: SymbolSceneService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SymbolSceneService] });
    service = TestBed.inject(SymbolSceneService);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('dispose() no lanza cuando el servicio nunca se inicializó', () => {
    expect(() => service.dispose()).not.toThrow();
  });

  it('dispose() es idempotente: llamarlo dos veces no lanza', () => {
    service.dispose();
    expect(() => service.dispose()).not.toThrow();
  });

  it('init() rechaza la promesa cuando WebGL no está disponible en el entorno de tests', async () => {
    // jsdom no implementa WebGL → Three.js lanza al crear el renderer.
    // Verificamos que la promesa rechaza y que dispose() queda sin estado.
    const canvas = document.createElement('canvas');
    await expect(
      service.init(canvas, { symbols: 2, stars: 10, opacity: 0.5 }),
    ).rejects.toThrow();
    // Después del fallo, dispose() no debe lanzar
    expect(() => service.dispose()).not.toThrow();
  });
});
