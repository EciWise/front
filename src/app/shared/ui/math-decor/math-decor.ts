import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MATH_SYMBOLS } from '../math-symbols';

/** Zona donde se coloca la decoración (define el reparto de símbolos). */
export type MathDecorVariant = 'frame' | 'bar' | 'menu';

interface DecorPlacement {
  readonly char: string;
  readonly style: Record<string, string>;
}

/** Anclaje de un símbolo: posición + tamaño + ritmo de la animación. */
interface DecorSpot {
  readonly pos: Record<string, string>;
  readonly size: string;
  readonly dur: string;
  readonly delay: string;
}

/**
 * Símbolos repartidos en un anillo por todo el perímetro del área de contenido
 * (borde superior, derecho, inferior e izquierdo), con separación amplia para que
 * no se solapen. El interior queda libre para no competir con el contenido.
 */
const FRAME_SPOTS: readonly DecorSpot[] = [
  // Borde superior
  { pos: { top: '8%', left: '3%' }, size: '1.5rem', dur: '12s', delay: '-5s' },
  { pos: { top: '6%', left: '22%' }, size: '2.2rem', dur: '13s', delay: '0s' },
  { pos: { top: '5%', left: '40%' }, size: '1.7rem', dur: '11s', delay: '-3s' },
  { pos: { top: '7%', left: '58%' }, size: '2rem', dur: '14s', delay: '-6s' },
  { pos: { top: '5%', left: '74%' }, size: '1.6rem', dur: '12s', delay: '-2s' },
  { pos: { top: '9%', right: '5%' }, size: '2.6rem', dur: '15s', delay: '-7s' },
  // Borde derecho
  { pos: { top: '28%', right: '3%' }, size: '1.8rem', dur: '10s', delay: '-4s' },
  { pos: { top: '48%', right: '6%' }, size: '2.4rem', dur: '16s', delay: '-9s' },
  { pos: { top: '66%', right: '4%' }, size: '1.7rem', dur: '13s', delay: '-1s' },
  // Borde inferior
  { pos: { bottom: '12%', right: '8%' }, size: '2.8rem', dur: '14s', delay: '-5s' },
  { pos: { bottom: '7%', left: '72%' }, size: '1.9rem', dur: '12s', delay: '-8s' },
  { pos: { bottom: '6%', left: '54%' }, size: '2.2rem', dur: '11s', delay: '-3s' },
  { pos: { bottom: '8%', left: '38%' }, size: '1.6rem', dur: '15s', delay: '-6s' },
  { pos: { bottom: '6%', left: '22%' }, size: '2.4rem', dur: '13s', delay: '-2s' },
  // Borde izquierdo
  { pos: { bottom: '24%', left: '3%' }, size: '2rem', dur: '16s', delay: '-7s' },
  { pos: { top: '52%', left: '2%' }, size: '1.7rem', dur: '10s', delay: '-4s' },
  { pos: { top: '26%', left: '4%' }, size: '2.1rem', dur: '14s', delay: '-9s' },
];

/** Símbolos pequeños repartidos en la banda central de la barra superior. */
const BAR_SPOTS: readonly DecorSpot[] = [
  { pos: { top: '50%', left: '26%' }, size: '1rem', dur: '9s', delay: '0s' },
  { pos: { top: '34%', left: '35%' }, size: '0.85rem', dur: '11s', delay: '-3s' },
  { pos: { top: '56%', left: '44%' }, size: '1.2rem', dur: '10s', delay: '-5s' },
  { pos: { top: '38%', left: '53%' }, size: '0.95rem', dur: '12s', delay: '-7s' },
  { pos: { top: '54%', left: '62%' }, size: '1.05rem', dur: '9s', delay: '-2s' },
  { pos: { top: '40%', left: '70%' }, size: '0.9rem', dur: '11s', delay: '-8s' },
];

/** Símbolos en zigzag a lo largo de la columna del menú lateral. */
const MENU_SPOTS: readonly DecorSpot[] = [
  { pos: { top: '5%', right: '8%' }, size: '1.5rem', dur: '12s', delay: '0s' },
  { pos: { top: '14%', left: '8%' }, size: '1.2rem', dur: '10s', delay: '-4s' },
  { pos: { top: '23%', right: '12%' }, size: '1.3rem', dur: '14s', delay: '-7s' },
  { pos: { top: '33%', left: '10%' }, size: '1.1rem', dur: '11s', delay: '-2s' },
  { pos: { top: '43%', right: '7%' }, size: '1.6rem', dur: '13s', delay: '-6s' },
  { pos: { top: '53%', left: '12%' }, size: '1.2rem', dur: '9s', delay: '-9s' },
  { pos: { top: '63%', right: '14%' }, size: '1.3rem', dur: '12s', delay: '-3s' },
  { pos: { top: '73%', left: '8%' }, size: '1.4rem', dur: '15s', delay: '-5s' },
  { pos: { top: '83%', right: '9%' }, size: '1.5rem', dur: '10s', delay: '-8s' },
  { pos: { bottom: '6%', left: '11%' }, size: '1.2rem', dur: '13s', delay: '-1s' },
];

const SPOTS_BY_VARIANT: Record<MathDecorVariant, readonly DecorSpot[]> = {
  frame: FRAME_SPOTS,
  bar: BAR_SPOTS,
  menu: MENU_SPOTS,
};

/** Desfase del glifo inicial por variant, para que cada zona use símbolos distintos. */
const CHAR_OFFSET: Record<MathDecorVariant, number> = { frame: 0, bar: 7, menu: 13 };

/**
 * Capa decorativa con símbolos matemáticos muy sutiles para el área autenticada.
 * Es puramente ornamental (`aria-hidden`), no recibe eventos (`pointer-events:none`)
 * y se sitúa por detrás del contenido, así que nunca tapa ni bloquea nada.
 */
@Component({
  selector: 'eci-math-decor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './math-decor.html',
  styleUrl: './math-decor.css',
  host: { 'aria-hidden': 'true' },
})
export class MathDecorComponent {
  readonly variant = input<MathDecorVariant>('frame');

  protected readonly placements = computed<readonly DecorPlacement[]>(() => {
    const variant = this.variant();
    const offset = CHAR_OFFSET[variant];
    return SPOTS_BY_VARIANT[variant].map((spot, i) => ({
      char: MATH_SYMBOLS[(offset + i) % MATH_SYMBOLS.length],
      style: {
        ...spot.pos,
        'font-size': spot.size,
        '--decor-dur': spot.dur,
        '--decor-delay': spot.delay,
      },
    }));
  });
}
