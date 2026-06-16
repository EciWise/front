import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from '../icon/icon';

/**
 * Carrusel reutilizable e i18n-agnóstico. El consumidor proyecta los "slides"
 * directamente (`<ng-content />`) y el componente los envuelve en una pista con
 * desplazamiento horizontal y ajuste por scroll-snap. Provee flechas anterior/
 * siguiente, puntos de paginación y navegación por teclado, todo accesible.
 *
 * Loop INFINITO sin costuras: si los slides reales desbordan la vista, se clona
 * el conjunto completo a ambos lados (cabecera y cola); al centrar un clon se
 * salta una anchura de conjunto de forma instantánea. Como los clones son
 * idénticos a los reales, el salto es invisible y el carrusel "no tiene fin".
 *
 * SSR-safe: toda lectura/medición/manipulación del DOM ocurre dentro de
 * `afterNextRender` (este componente se renderiza también en el servidor). Las
 * flechas y puntos se ocultan cuando hay un solo slide o cabe sin desplazarse.
 *
 * Las etiquetas accesibles se reciben por entrada (`ariaLabel`, `prevLabel`,
 * `nextLabel`, `slideLabel`) para que el consumidor pase cadenas traducidas; el
 * componente no importa TranslatePipe a propósito.
 */
@Component({
  selector: 'eci-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
export class CarouselComponent {
  /** Etiqueta accesible de la región del carrusel. */
  readonly ariaLabel = input<string>('');
  /** Etiqueta accesible del botón anterior (cadena traducida por el consumidor). */
  readonly prevLabel = input('Previous');
  /** Etiqueta accesible del botón siguiente (cadena traducida por el consumidor). */
  readonly nextLabel = input('Next');
  /**
   * Prefijo accesible de cada punto, p. ej. "Slide" → "Go to Slide 2".
   * Se mantiene simple porque los puntos no se traducen individualmente.
   */
  readonly slideLabel = input('Slide');

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly destroyRef = inject(DestroyRef);

  /** Nº de slides reales (excluye los clones del loop). Alimenta los puntos. */
  private readonly realCount = signal(0);
  /** Índice real del slide centrado, derivado de la posición de scroll. */
  protected readonly activeIndex = signal(0);
  /** Loop infinito activo: hay slides reales que desbordan la vista. */
  private readonly loop = signal(false);
  /** Solo en modo NO-loop: el scroll está al principio (inhabilita "anterior"). */
  protected readonly atStart = signal(true);
  /** Solo en modo NO-loop: el scroll está al final (inhabilita "siguiente"). */
  protected readonly atEnd = signal(true);

  /** Nº de clones de cabecera (= nº de slides reales cuando hay loop, si no 0). */
  private headCount = 0;
  /** Observa cambios de slides del consumidor; se pausa al clonar (evita recursión). */
  private mutationObserver?: MutationObserver;
  /** Temporizador "scroll detenido": difiere el cierre del loop hasta el reposo. */
  private wrapTimer?: ReturnType<typeof setTimeout>;

  /** Elementos enfocables dentro de un slide (se neutralizan en los clones). */
  private static readonly FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

  /** Array índice por slide REAL para renderizar los puntos en el template. */
  protected readonly dots = computed(() =>
    Array.from({ length: this.realCount() }, (_, i) => i),
  );
  /** Hay más de un slide y, o bien hay loop, o el contenido desborda la vista. */
  protected readonly hasControls = computed(
    () => this.realCount() > 1 && (this.loop() || !(this.atStart() && this.atEnd())),
  );

  constructor() {
    // Toda interacción con el DOM va aquí: solo se ejecuta en el navegador.
    afterNextRender(() => {
      const el = this.track().nativeElement;

      const onScroll = (): void => this.onScroll();
      el.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() => {
        el.removeEventListener('scroll', onScroll);
        if (this.wrapTimer !== undefined) {
          clearTimeout(this.wrapTimer);
        }
      });

      // Re-construimos al cambiar el tamaño del contenedor (resize / rotación):
      // el desbordamiento —y por tanto el loop— puede activarse o desactivarse.
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => this.rebuild());
        ro.observe(el);
        this.destroyRef.onDestroy(() => ro.disconnect());
      }

      // Re-construimos si el consumidor añade/quita slides proyectados.
      if (typeof MutationObserver !== 'undefined') {
        this.mutationObserver = new MutationObserver(() => this.rebuild());
        this.mutationObserver.observe(el, { childList: true });
        this.destroyRef.onDestroy(() => this.mutationObserver?.disconnect());
      }

      this.rebuild();
    });
  }

  /** Desplaza una "página" hacia la izquierda. */
  protected prev(): void {
    this.scrollByPage(-1);
  }

  /** Desplaza una "página" hacia la derecha. */
  protected next(): void {
    this.scrollByPage(1);
  }

  /** Lleva el slide REAL indicado al centro de la vista. */
  protected goTo(index: number): void {
    const el = this.track().nativeElement;
    const slide = el.children.item(this.headCount + index) as HTMLElement | null;
    if (!slide) {
      return;
    }
    el.scrollTo({
      left: slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2,
      behavior: this.scrollBehavior(),
    });
  }

  /** Teclas de dirección sobre la región: navegan entre páginas. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  /** Desplaza ~90% del ancho visible (una "página") en la dirección dada. */
  private scrollByPage(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: this.scrollBehavior(),
    });
  }

  /**
   * (Re)construye el carrusel: quita clones previos, cuenta los slides reales y,
   * si desbordan la vista, los clona a ambos lados para el loop infinito. Pausa
   * el MutationObserver mientras manipula el DOM para no reaccionar a sus propias
   * inserciones.
   */
  private rebuild(): void {
    const el = this.track().nativeElement;
    this.mutationObserver?.disconnect();

    // 1) Estado limpio: elimina los clones de una construcción previa.
    for (const child of Array.from(el.children)) {
      if (child.hasAttribute('data-clone')) {
        child.remove();
      }
    }

    // 2) Slides reales y decisión de loop (solo si desbordan la vista).
    const reals = Array.from(el.children) as HTMLElement[];
    this.realCount.set(reals.length);
    const overflows = el.scrollWidth > el.clientWidth + 1;
    const shouldLoop = reals.length > 1 && overflows;
    this.loop.set(shouldLoop);

    if (shouldLoop) {
      // 3) Clona el conjunto real en cabecera (antes) y cola (después).
      const head = document.createDocumentFragment();
      const tail = document.createDocumentFragment();
      for (const real of reals) {
        head.appendChild(this.makeClone(real));
        tail.appendChild(this.makeClone(real));
      }
      el.insertBefore(head, reals[0]);
      el.appendChild(tail);
      this.headCount = reals.length;
      // 4) Posiciona la vista en el primer slide real (banda central).
      const firstReal = el.children.item(this.headCount) as HTMLElement;
      el.scrollLeft = firstReal.offsetLeft;
    } else {
      this.headCount = 0;
      el.scrollLeft = 0;
    }

    this.updateScrollState();

    if (this.mutationObserver) {
      this.mutationObserver.observe(el, { childList: true });
    }
  }

  /**
   * Clona un slide como decorativo. Se oculta a lectores de pantalla
   * (`aria-hidden`) y se saca del orden de tabulación (`tabindex="-1"` en el clon y
   * en sus descendientes enfocables), pero —a diferencia de `inert`— SIGUE
   * respondiendo al puntero: así el clon que se ve al cerrar el loop conserva el
   * hover (zoom) y el clic (p. ej. abrir un enlace), igual que el slide real.
   */
  private makeClone(slide: HTMLElement): HTMLElement {
    const clone = slide.cloneNode(true) as HTMLElement;
    clone.setAttribute('data-clone', '');
    clone.setAttribute('aria-hidden', 'true');
    if (clone.matches(CarouselComponent.FOCUSABLE)) {
      clone.setAttribute('tabindex', '-1');
    }
    for (const focusable of clone.querySelectorAll<HTMLElement>(CarouselComponent.FOCUSABLE)) {
      focusable.setAttribute('tabindex', '-1');
    }
    return clone;
  }

  /**
   * En cada scroll actualizamos el estado visible (puntos/índice) al instante, pero
   * DIFERIMOS el cierre del loop hasta que el desplazamiento se detiene: reposicionar
   * `scrollLeft` mientras una animación `smooth` (flechas) sigue en curso hace que el
   * navegador "pelee" con su propia animación y se vea un salto abrupto. Al esperar al
   * reposo, el salto al gemelo real ocurre quieto y, al ser contenido idéntico, es
   * invisible.
   */
  private onScroll(): void {
    this.updateScrollState();
    if (this.loop()) {
      this.scheduleWrap();
    }
  }

  /** (Re)arma el temporizador de "scroll detenido": cierra el loop tras el reposo. */
  private scheduleWrap(): void {
    if (this.wrapTimer !== undefined) {
      clearTimeout(this.wrapTimer);
    }
    this.wrapTimer = setTimeout(() => {
      this.wrapTimer = undefined;
      this.wrapAround();
    }, 120);
  }

  /**
   * Cierra el loop: si el slide centrado es un clon de cabecera/cola, salta una
   * anchura de conjunto de forma instantánea hasta su gemelo real. El salto es
   * invisible porque el contenido es idéntico. La detección se basa en QUÉ slide
   * está centrado (no en umbrales de scrollLeft), por lo que es robusta frente al
   * centrado de `scroll-snap`.
   */
  private wrapAround(): void {
    const el = this.track().nativeElement;
    const real = this.realCount();
    const firstReal = el.children.item(this.headCount) as HTMLElement | null;
    const firstTail = el.children.item(this.headCount + real) as HTMLElement | null;
    if (!firstReal || !firstTail) {
      return;
    }
    const setWidth = firstTail.offsetLeft - firstReal.offsetLeft;
    if (setWidth <= 0) {
      return;
    }
    const nearest = this.nearestIndex(el);
    if (nearest < this.headCount) {
      el.scrollLeft += setWidth;
    } else if (nearest >= this.headCount + real) {
      el.scrollLeft -= setWidth;
    }
  }

  /** Índice del hijo cuyo centro está más cerca del centro visible. */
  private nearestIndex(el: HTMLElement): number {
    const count = el.children.length;
    if (count === 0) {
      return 0;
    }
    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < count; i++) {
      const slide = el.children.item(i) as HTMLElement;
      const slideCenter = slide.offsetLeft + slide.clientWidth / 2;
      const distance = Math.abs(slideCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    }
    return nearest;
  }

  /** Actualiza inicio/fin (solo no-loop) e índice real activo. */
  private updateScrollState(): void {
    const el = this.track().nativeElement;
    if (this.loop()) {
      this.atStart.set(false);
      this.atEnd.set(false);
    } else {
      const maxScroll = el.scrollWidth - el.clientWidth;
      // Tolerancia de 1px para fin/inicio (errores de redondeo subpíxel).
      this.atStart.set(el.scrollLeft <= 1);
      this.atEnd.set(el.scrollLeft >= maxScroll - 1);
    }

    const real = this.realCount();
    if (real === 0) {
      this.activeIndex.set(0);
      return;
    }
    const nearest = this.nearestIndex(el);
    this.activeIndex.set(
      this.loop() ? ((nearest - this.headCount) % real + real) % real : nearest,
    );
  }

  /** 'auto' si el usuario pide menos movimiento; 'smooth' en caso contrario. */
  private scrollBehavior(): ScrollBehavior {
    return this.prefersReducedMotion() ? 'auto' : 'smooth';
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
