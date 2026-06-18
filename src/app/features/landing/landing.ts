import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/ui/button/button';
import { LogoComponent } from '../../shared/ui/logo/logo';
import { IconComponent } from '../../shared/ui/icon/icon';
import { AvatarComponent } from '../../shared/ui/avatar/avatar';
import { CarouselComponent } from '../../shared/ui/carousel/carousel';
import { SectionTabsComponent, SectionTab } from '../../shared/ui/section-tabs/section-tabs';
import { ThemeToggleComponent } from '../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../core/a11y/a11y-toggle';
import { AuroraBackgroundComponent } from '../../shared/ui/aurora-background/aurora-background';

/** Un autor del proyecto para la sección "Hecho por". */
interface Author {
  readonly name: string;
  readonly role: string;
  /** Foto opcional; sin ella el avatar genera iniciales + color por nombre. */
  readonly photo?: string;
  /** Enlace opcional (p. ej. LinkedIn): vuelve la tarjeta un enlace que abre en una pestaña nueva. */
  readonly link?: string;
}

/**
 * Landing pública: una sola página desplazable (hero, acerca de, galería, equipo
 * y pie). El fondo se delega al componente reutilizable `eci-aurora-background`
 * (variante `landing`), que sustituye a la escena 3D de Three.js.
 *
 * La navegación por pestañas (`eci-section-tabs`) actúa como scroll-spy: al
 * pulsar una pestaña se desplaza la sección correspondiente a la vista, y al
 * desplazarse un IntersectionObserver actualiza la pestaña activa. El mismo
 * observador revela cada sección con la animación `eci-section-enter`. Todo el
 * acceso al DOM se hace dentro de `afterNextRender` (SSR-safe) y se limpia con
 * `DestroyRef`.
 */
@Component({
  selector: 'eci-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslatePipe,
    ButtonComponent,
    LogoComponent,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
    IconComponent,
    AvatarComponent,
    CarouselComponent,
    SectionTabsComponent,
    AuroraBackgroundComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);

  /** Secciones navegables de la página única (orden = orden visual). */
  protected readonly sections: readonly SectionTab[] = [
    { id: 'home', labelKey: 'landing.tabHome', icon: 'dashboard' },
    { id: 'about', labelKey: 'landing.tabAbout', icon: 'ethics' },
    { id: 'gallery', labelKey: 'landing.tabGallery', icon: 'star' },
    { id: 'team', labelKey: 'landing.tabTeam', icon: 'users' },
  ];

  /** Sección visible actualmente (la actualiza el scroll-spy y los clics). */
  protected readonly section = signal('home');

  /**
   * Imágenes de marca de la galería (en `public/assets/cards/`, ~800x533, 4:3).
   * Rutas absolutas servidas estáticamente por Angular.
   */
  protected readonly gallery: readonly string[] = [
    'card-1.jpg',
    'card-2.jpg',
    'card-3.jpg',
    'card-4.jpg',
    'card-5.jpg',
  ].map((file) => `/assets/cards/${file}`);

  /**
   * Autores del proyecto para la sección "Hecho por".
   * PLACEHOLDERS: sustituye nombres y roles por los reales del equipo. Las fotos
   * son opcionales — sin `photo`, el avatar muestra iniciales con color por
   * nombre. Para añadir fotos reales, déjalas en `public/assets/authors/` y
   * apunta `photo` a, p. ej., `/assets/authors/nombre.jpg`.
   */
  protected readonly authors: readonly Author[] = [
    { name: 'Daniel Eduardo Useche Pinilla',
      role: 'Líder Técnico Arquitecto',
      photo: '/assets/authors/Daniel.png',
      link: 'https://www.linkedin.com/in/dannieleu/' },
    { name: 'Laura Alejandra Venegas', role: 'Desarrollo Backend' },
    { name: 'Jared Farfan Guevara', role: 'Diseño UX/UI' },
    { name: 'Ignacio Andrés Castillo Rendón', role: 'Arquitectura de software' },
    { name: 'Juan Diego Rodríguez Velásquez', role: 'Control de calidad' },
    { name: 'David Alejandro Patacón Henao', role: 'Gestión del proyecto' },
    { name: 'Anderson Fabián García Nieto', role: 'Documentación y soporte' },
    { name: 'Christian Alfonso Romero Martínez', role: 'Marketing y difusión' },
    { name: 'Hildebrando Peña Quezada', role: 'Análisis de datos y métricas',
      photo: '/assets/authors/brando.jfif',
      link: 'https://www.linkedin.com/in/hildebrando-peña-quezada-2b32b33a1 '
     },
    { name: 'Isaac David Palomo Peralta', role: 'Relaciones públicas y comunidad' },
    { name: 'Juana Lozano Chaves', role: 'Seguridad y cumplimiento' },
    { name: 'Maria Paula Rodríguez Muñoz', role: 'Innovación y nuevas tecnologías',
      link: 'https://www.linkedin.com/in/mariapaula-rodriguezmuñoz?utm_source=share_via&utm_content=profile&utm_medium=member_android'
     },
    { name: 'Felipe Eduardo Calvache Gallego', role: 'Integración y despliegue continuo' },
    {
      name: 'Marianella Polo Peña',
      role: 'Desarrollo Frontend',
      photo: '/assets/authors/Marianella.jpeg',
      link: 'https://www.linkedin.com/in/marianellapolo/',
    },
  ];

  private readonly sectionEls = viewChildren<ElementRef<HTMLElement>>('sectionEl');

  constructor() {
    afterNextRender(() => {
      this.setupObserver();
      this.setupParallax();
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']).catch(() => undefined);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']).catch(() => undefined);
  }

  /** Pulsar una pestaña desplaza su sección a la vista (respeta reduced-motion). */
  protected onTabChange(id: string): void {
    this.section.set(id);
    this.scrollToSection(id);
  }

  /** Enlaces del pie: desplazan a una sección y la marcan como activa. */
  protected scrollToSection(id: string, event?: Event): void {
    event?.preventDefault();
    if (typeof document === 'undefined') {
      return;
    }
    const target = document.getElementById(id);
    target?.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  /**
   * Un único IntersectionObserver hace dos cosas: revela cada sección al entrar
   * (clase `eci-section-enter`) y, para la sección más visible, actualiza la
   * pestaña activa. Se desconecta al destruir el componente.
   */
  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (best === null || entry.intersectionRatio > best.intersectionRatio)
          ) {
            best = entry;
          }
        }
        const id = best?.target.id;
        if (id && id !== this.section()) {
          this.section.set(id);
        }
      },
      // Margen superior negativo: la sección "gana" cuando cruza la barra fija.
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const el of this.sectionEls()) {
      observer.observe(el.nativeElement);
    }
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  /**
   * Parallax continuo enlazado al scroll: cada banda no-hero se opacifica y
   * traslada según su distancia al centro del viewport. El hero se desvanece
   * cuando el usuario lo deja atrás. Se actualiza en requestAnimationFrame
   * para no bloquear el hilo principal y funciona en todos los browsers sin
   * depender de la API Scroll-Driven Animations.
   */
  private setupParallax(): void {
    if (typeof window === 'undefined' || this.prefersReducedMotion()) {
      return;
    }

    const host = this.el.nativeElement as HTMLElement;
    const bands = Array.from(
      host.querySelectorAll<HTMLElement>('.landing__band:not(.landing__hero)'),
    );
    const hero = host.querySelector<HTMLElement>('.landing__hero');

    const update = (): void => {
      const vh = window.innerHeight;
      const center = vh / 2;

      for (const band of bands) {
        const rect = band.getBoundingClientRect();

        // Completamente fuera del viewport por arriba → ya fue vista, plena visibilidad.
        if (rect.bottom <= 0) {
          band.style.opacity = '1';
          band.style.transform = 'none';
          continue;
        }

        // Completamente debajo del viewport → estado inicial de espera.
        if (rect.top >= vh) {
          band.style.opacity = '0';
          band.style.transform = 'translateY(48px)';
          continue;
        }

        const bandCenter = rect.top + rect.height / 2;
        // dist: 0 = centrada, >0 = por debajo del centro, <0 = por encima del centro
        const dist = (bandCenter - center) / (vh * 0.55);

        if (dist <= 0) {
          // Sección ya pasó el centro → plena visibilidad (no se desvanece al salir)
          band.style.opacity = '1';
          band.style.transform = 'none';
        } else {
          // Sección aún entrando desde abajo → fade-in proporcional a la distancia
          const clamped = Math.min(1.2, dist);
          band.style.opacity = String(Math.max(0, 1 - clamped * 0.9));
          band.style.transform = `translateY(${clamped * 48}px)`;
        }
      }

      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < vh) {
          // Hero ya salió — se eleva y desvanece según cuánto ha salido
          const progress = Math.min(1, (vh - rect.bottom) / vh);
          hero.style.opacity = String(Math.max(0, 1 - progress * 1.4));
          hero.style.transform = `translateY(${-progress * 60}px)`;
        } else {
          hero.style.opacity = '1';
          hero.style.transform = 'none';
        }
      }
    };

    let rafId = 0;
    const onScroll = (): void => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // posiciona correctamente antes del primer scroll

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  /** El logo del pie aún no existe como asset: lo ocultamos si falla la carga. */
  protected hideBrokenLogo(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
