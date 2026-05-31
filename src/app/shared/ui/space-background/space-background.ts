import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SpaceSceneService } from './space-scene.service';

/**
 * Fondo espacial 3D reutilizable (campo de estrellas + símbolos académicos
 * flotando). Renderiza un canvas fijo a pantalla completa, detrás del
 * contenido y sin capturar clics. La escena solo se inicializa en el navegador
 * y se omite si el usuario prefiere movimiento reducido.
 */
@Component({
  selector: 'eci-space-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SpaceSceneService],
  template: `<canvas #canvas class="space-bg" aria-hidden="true"></canvas>`,
  styles: [
    `
      .space-bg {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        display: block;
        pointer-events: none;
        z-index: 0;
      }
    `,
  ],
})
export class SpaceBackgroundComponent {
  private readonly scene = inject(SpaceSceneService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser || this.prefersReducedMotion()) {
        return;
      }
      const canvas = this.canvas()?.nativeElement;
      if (canvas) {
        void this.scene.init(canvas);
      }
    });
    inject(DestroyRef).onDestroy(() => this.scene.dispose());
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
