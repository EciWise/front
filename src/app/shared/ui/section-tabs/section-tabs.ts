import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent, IconName } from '../icon/icon';

/** Una sección navegable: id estable, etiqueta i18n e icono opcional. */
export interface SectionTab {
  readonly id: string;
  readonly labelKey: string;
  readonly icon?: IconName;
}

/**
 * Botones de sección identificables con animación: control segmentado con un
 * indicador deslizante (la "píldora" activa se desliza al cambiar de sección).
 * Es la pieza compartida para dividir cualquier pantalla en secciones. Vincula
 * la sección activa por su `id` mediante el modelo `active` (two-way: `[(active)]`).
 *
 * La píldora se posiciona MIDIENDO el botón activo (no asumiendo columnas
 * iguales de 1/N): así queda perfectamente alineada aunque las etiquetas tengan
 * anchos distintos. Cuando las pestañas no caben, la pista se desplaza en
 * horizontal y la sección activa se trae a la vista, sin recortar texto ni
 * desbordar la pantalla.
 */
@Component({
  selector: 'eci-section-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent],
  template: `
    <div class="seg" #track role="tablist">
      <span
        class="seg__indicator"
        [style.transform]="'translateX(' + indicatorLeft() + 'px)'"
        [style.width.px]="indicatorWidth()"
        aria-hidden="true"
      ></span>
      @for (t of tabs(); track t.id) {
        <button
          #tabBtn
          type="button"
          role="tab"
          class="seg__btn"
          [class.seg__btn--active]="t.id === active()"
          [attr.aria-selected]="t.id === active()"
          (click)="select(t.id)"
        >
          @if (t.icon; as ic) {
            <eci-icon [name]="ic" [size]="18" />
          }
          <span class="seg__label">{{ t.labelKey | translate }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './section-tabs.css',
})
export class SectionTabsComponent {
  readonly tabs = input.required<readonly SectionTab[]>();
  /** Id de la sección activa (two-way). */
  readonly active = model.required<string>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly tabBtns = viewChildren<ElementRef<HTMLButtonElement>>('tabBtn');
  private readonly destroyRef = inject(DestroyRef);

  /** Posición (px) y ancho (px) de la píldora, medidos del botón activo. */
  protected readonly indicatorLeft = signal(0);
  protected readonly indicatorWidth = signal(0);

  protected readonly activeIndex = computed(() =>
    Math.max(0, this.tabs().findIndex((t) => t.id === this.active())),
  );

  constructor() {
    // Al cambiar de sección (o de lista de pestañas) recolocamos la píldora y
    // traemos la pestaña activa a la vista. La medición se hace tras el layout.
    effect(() => {
      this.active();
      this.tabs();
      this.scheduleMeasure(true);
    });

    // Configuración que toca el DOM: solo en navegador (este componente se
    // renderiza también en el servidor con SSR).
    afterNextRender(() => {
      this.measure(false);

      // Recoloca al cambiar el tamaño del contenedor (resize / rotación).
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.measure(false));
        ro.observe(this.track().nativeElement);
        this.destroyRef.onDestroy(() => ro.disconnect());
      }

      // Las fuentes (Nunito/Inter) cargan de forma asíncrona y cambian el ancho
      // de las etiquetas: volvemos a medir cuando terminan.
      void document.fonts?.ready.then(() => this.measure(false));
    });
  }

  select(id: string): void {
    this.active.set(id);
  }

  /** Programa una medición tras el layout (solo navegador). */
  private scheduleMeasure(scrollIntoView: boolean): void {
    if (typeof requestAnimationFrame === 'undefined') {
      return;
    }
    requestAnimationFrame(() => this.measure(scrollIntoView));
  }

  /** Mide el botón activo y posiciona la píldora; opcionalmente lo enfoca. */
  private measure(scrollIntoView: boolean): void {
    const el = this.tabBtns()[this.activeIndex()]?.nativeElement;
    if (!el) {
      return;
    }
    this.indicatorLeft.set(el.offsetLeft);
    this.indicatorWidth.set(el.offsetWidth);
    if (scrollIntoView && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        inline: 'nearest',
        block: 'nearest',
        behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
