import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type MathDecorVariant = 'frame' | 'bar' | 'menu';

interface DecorPlacement {
  readonly char: string;
  readonly anim: string;
  readonly style: Record<string, string>;
}

interface DecorSpot {
  readonly char: string;
  readonly pos: Record<string, string>;
  readonly size: string;
  readonly dur: string;
  readonly delay: string;
  readonly anim: 'em' | 'a' | 'b' | 'p';
  readonly opMax?: string;
  readonly opMin?: string;
}

const FRAME_SPOTS: readonly DecorSpot[] = [
  // Corners — emerge (fade in, float, fade out)
  { char: '∮', pos: { top: '2%',    left: '1.5%'  }, size: '2.8rem', dur: '22s', delay: '-3s',  anim: 'em', opMax: '0.17' },
  { char: 'Ψ', pos: { top: '2%',    right: '2%'   }, size: '2.6rem', dur: '20s', delay: '-9s',  anim: 'em', opMax: '0.15' },
  { char: '∑', pos: { bottom: '5%', left: '1.5%'  }, size: '3rem',   dur: '24s', delay: '-15s', anim: 'em', opMax: '0.17' },
  { char: 'ℝ', pos: { bottom: '4%', right: '2%'   }, size: '2.5rem', dur: '18s', delay: '-5s',  anim: 'em', opMax: '0.15' },
  // Top edge — alternating float
  { char: 'θ', pos: { top: '4%', left: '19%' }, size: '2rem',   dur: '14s', delay: '-6s',  anim: 'a' },
  { char: '∂', pos: { top: '6%', left: '36%' }, size: '1.8rem', dur: '12s', delay: '-2s',  anim: 'b' },
  { char: '∇', pos: { top: '4%', left: '53%' }, size: '2.1rem', dur: '16s', delay: '-10s', anim: 'a' },
  { char: 'λ', pos: { top: '5%', left: '70%' }, size: '2.2rem', dur: '11s', delay: '-4s',  anim: 'b' },
  { char: '∞', pos: { top: '4%', left: '85%' }, size: '2rem',   dur: '19s', delay: '-7s',  anim: 'a' },
  // Left edge
  { char: 'α', pos: { top: '27%', left: '1.5%' }, size: '2.1rem', dur: '12s', delay: '-5s',  anim: 'b' },
  { char: 'β', pos: { top: '47%', left: '2%'   }, size: '1.9rem', dur: '15s', delay: '-11s', anim: 'a' },
  { char: 'μ', pos: { top: '67%', left: '1.5%' }, size: '2rem',   dur: '18s', delay: '-2s',  anim: 'b' },
  // Right edge
  { char: 'ψ', pos: { top: '26%', right: '2%'   }, size: '1.9rem', dur: '13s', delay: '-3s', anim: 'b' },
  { char: 'Ω', pos: { top: '46%', right: '2.5%' }, size: '2.4rem', dur: '21s', delay: '-9s', anim: 'a' },
  { char: 'ε', pos: { top: '66%', right: '2%'   }, size: '1.8rem', dur: '15s', delay: '-6s', anim: 'b' },
  // Interior — very subtle pulse
  { char: 'ℕ', pos: { top: '15%',    left: '9%'    }, size: '1.5rem', dur: '22s', delay: '-8s',  anim: 'p', opMin: '0.02', opMax: '0.07' },
  { char: 'π', pos: { top: '15%',    right: '9%'   }, size: '1.6rem', dur: '26s', delay: '-13s', anim: 'p', opMin: '0.02', opMax: '0.07' },
  { char: 'φ', pos: { bottom: '20%', left: '9%'   }, size: '1.4rem', dur: '24s', delay: '-4s',  anim: 'p', opMin: '0.02', opMax: '0.07' },
  { char: 'ℂ', pos: { bottom: '18%', right: '9%'  }, size: '1.5rem', dur: '21s', delay: '-10s', anim: 'p', opMin: '0.02', opMax: '0.07' },
];

const BAR_SPOTS: readonly DecorSpot[] = [
  { char: 'δ', pos: { top: '45%', left: '27%' }, size: '0.90rem', dur: '9s',  delay: '-2s', anim: 'p' },
  { char: '∂', pos: { top: '22%', left: '34%' }, size: '0.78rem', dur: '11s', delay: '-5s', anim: 'a' },
  { char: 'λ', pos: { top: '68%', left: '42%' }, size: '0.95rem', dur: '10s', delay: '-8s', anim: 'b' },
  { char: 'ε', pos: { top: '25%', left: '51%' }, size: '0.82rem', dur: '12s', delay: '-1s', anim: 'p' },
  { char: '∑', pos: { top: '65%', left: '60%' }, size: '0.88rem', dur: '9s',  delay: '-6s', anim: 'a' },
  { char: 'θ', pos: { top: '28%', left: '69%' }, size: '0.72rem', dur: '11s', delay: '-3s', anim: 'b' },
  { char: 'π', pos: { top: '30%', left: '86%' }, size: '0.95rem', dur: '10s', delay: '-4s', anim: 'a' },
];

const MENU_SPOTS: readonly DecorSpot[] = [
  { char: 'π', pos: { top: '4%',    right: '14%' }, size: '1.4rem', dur: '12s', delay: '-1s',  anim: 'a' },
  { char: 'α', pos: { top: '12%',   left: '12%'  }, size: '1.1rem', dur: '10s', delay: '-4s',  anim: 'b' },
  { char: '∂', pos: { top: '22%',   right: '17%' }, size: '1.2rem', dur: '14s', delay: '-7s',  anim: 'a' },
  { char: 'λ', pos: { top: '31%',   left: '10%'  }, size: '1.0rem', dur: '11s', delay: '-2s',  anim: 'b' },
  { char: 'Σ', pos: { top: '40%',   right: '13%' }, size: '1.5rem', dur: '13s', delay: '-9s',  anim: 'p' },
  { char: 'θ', pos: { top: '50%',   left: '13%'  }, size: '1.1rem', dur: '9s',  delay: '-5s',  anim: 'a' },
  { char: '∫', pos: { top: '59%',   right: '15%' }, size: '1.3rem', dur: '15s', delay: '-8s',  anim: 'b' },
  { char: 'ε', pos: { top: '68%',   left: '11%'  }, size: '1.0rem', dur: '12s', delay: '-3s',  anim: 'a' },
  { char: 'ω', pos: { top: '77%',   right: '13%' }, size: '1.4rem', dur: '11s', delay: '-6s',  anim: 'b' },
  { char: 'δ', pos: { bottom: '8%', left: '12%'  }, size: '1.1rem', dur: '10s', delay: '-11s', anim: 'p' },
];

const SPOTS_BY_VARIANT: Record<MathDecorVariant, readonly DecorSpot[]> = {
  frame: FRAME_SPOTS,
  bar:   BAR_SPOTS,
  menu:  MENU_SPOTS,
};

@Component({
  selector: 'eci-math-decor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './math-decor.html',
  styleUrl: './math-decor.css',
  host: { 'aria-hidden': 'true' },
})
export class MathDecorComponent {
  readonly variant = input<MathDecorVariant>('frame');

  protected readonly placements = computed<readonly DecorPlacement[]>(() =>
    SPOTS_BY_VARIANT[this.variant()].map(spot => ({
      char: spot.char,
      anim: spot.anim,
      style: {
        ...spot.pos,
        'font-size': spot.size,
        '--mdf-dur': spot.dur,
        '--mdf-dl': spot.delay,
        ...(spot.opMax ? { '--sd-max': spot.opMax } : {}),
        ...(spot.opMin ? { '--sd-min': spot.opMin } : {}),
      },
    }))
  );
}
