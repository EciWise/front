import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SymbolSceneService, SymbolSceneOptions } from './symbol-scene.service';

/** Aspecto del fondo: `landing` es expresivo; `auth` es sobrio para no robar foco. */
export type AuroraVariant = 'landing' | 'auth';

/** Densidad de la escena 3D por variante (más sobria en `auth`). */
const SCENE_OPTIONS: Record<AuroraVariant, SymbolSceneOptions> = {
  landing: { symbols: 22, stars: 700, opacity: 0.7 },
  auth: { symbols: 12, stars: 400, opacity: 0.5 },
};

/**
 * Fondo del área pública: combina una capa de orbes de aurora en CSS (tintes de
 * marca, difuminados) con una escena 3D ligera (Three.js) de estrellas y
 * símbolos académicos que flotan con movimiento. La aurora da el glow; la escena
 * 3D aporta profundidad y vida. Reemplaza al antiguo `eci-space-background`
 * (sin las tarjetas-foto).
 *
 * Misma huella que `.space-bg` (fijo, pantalla completa, sin eventos de puntero,
 * z-index 0), por lo que entra donde estaba el anterior. La capa 3D solo se
 * inicializa en el navegador y se omite si el usuario pide menos movimiento
 * (queda solo la aurora CSS, ya estática por su `@media`).
 */
@Component({
  selector: 'eci-aurora-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SymbolSceneService],
  templateUrl: './aurora-background.html',
  styleUrl: './aurora-background.css',
  host: {
    'aria-hidden': 'true',
    '[class.aurora--auth]': "variant() === 'auth'",
    '[class.aurora--landing]': "variant() === 'landing'",
  },
})
export class AuroraBackgroundComponent {
  /** `landing`: escena rica. `auth`: menos densa y tenue (forma sobria). */
  readonly variant = input<AuroraVariant>('landing');

  private readonly scene = inject(SymbolSceneService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterNextRender(() => {
      if (!this.isBrowser || this.prefersReducedMotion()) {
        return;
      }
      const canvas = this.canvas()?.nativeElement;
      if (canvas) {
        this.scene.init(canvas, SCENE_OPTIONS[this.variant()]).catch(() => {
          this.scene.dispose();
        });
      }
    });
    inject(DestroyRef).onDestroy(() => this.scene.dispose());
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
