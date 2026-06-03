import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Una pieza de confeti con sus valores aleatorios precalculados. */
interface ConfettiPiece {
  readonly left: number;
  readonly delay: number;
  readonly duration: number;
  readonly drift: number;
  readonly rotate: number;
  readonly color: string;
  readonly size: number;
  readonly round: boolean;
}

const COLORS = ['var(--brand-red)', 'var(--success)', 'var(--warning)', 'var(--info)'];

/**
 * Lluvia de confeti puramente CSS (sin canvas ni dependencias).
 * Se monta sólo cuando hay algo que celebrar; respeta prefers-reduced-motion.
 */
@Component({
  selector: 'eci-confetti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="confetti" aria-hidden="true">
      @for (p of pieces(); track $index) {
        <span
          class="confetti__piece"
          [class.confetti__piece--round]="p.round"
          [style.left.%]="p.left"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
          [style.background]="p.color"
          [style.animation-delay.s]="p.delay"
          [style.animation-duration.s]="p.duration"
          [style.--drift.px]="p.drift"
          [style.--rotate.deg]="p.rotate"
        ></span>
      }
    </div>
  `,
  styleUrl: './confetti.css',
})
export class ConfettiComponent {
  /** Número de piezas a emitir. */
  readonly count = input(80);

  protected readonly pieces = computed<ConfettiPiece[]>(() =>
    Array.from({ length: this.count() }, (): ConfettiPiece => {
      const round = Math.random() > 0.5;
      return {
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.4 + Math.random() * 1.8,
        drift: (Math.random() - 0.5) * 200,
        rotate: 180 + Math.random() * 540,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 7 + Math.round(Math.random() * 6),
        round,
      };
    }),
  );
}
