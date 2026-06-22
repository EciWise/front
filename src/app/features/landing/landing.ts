import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggleComponent } from '../../core/theme/theme-toggle';
import { LanguageSwitchComponent } from '../../core/i18n/language-switch';
import { A11yToggleComponent } from '../../core/a11y/a11y-toggle';
import { SymbolSceneService } from '../../shared/ui/aurora-background/symbol-scene.service';
import { CarouselComponent } from '../../shared/ui/carousel/carousel';
import { AuthService } from '../../core/auth/auth.service';
import { ROLE_HOME } from '../../core/models/role.enum';
import type { RegisterRequest } from '../../core/models/user.model';

interface Author {
  readonly name: string;
  readonly role: string;
  readonly photo?: string;
  readonly link?: string;
}

interface GalleryCard {
  readonly icon: string;
  readonly tint: string;
  readonly tintBg: string;
  readonly labelKey: string;
  readonly descKey: string;
}

interface RegDia {
  gender: string;
  ethnicity: string;
  parentalEducation: string;
  parentalSupport: string;
  studyTimeWeekly: number;
  absences: number;
  tutoring: boolean;
  extracurricular: boolean;
  sports: boolean;
  music: boolean;
  volunteering: boolean;
}

@Component({
  selector: 'eci-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SymbolSceneService],
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ThemeToggleComponent,
    LanguageSwitchComponent,
    A11yToggleComponent,
    CarouselComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly scene = inject(SymbolSceneService);

  protected readonly section = signal('home');
  private readonly sectionEls = viewChildren<ElementRef<HTMLElement>>('sectionEl');
  private readonly heroCanvas = viewChild<ElementRef<HTMLCanvasElement>>('heroCanvas');

  protected readonly currentYear = new Date().getFullYear();

  protected readonly authMode = signal<'login' | 'register'>('login');
  protected readonly regStep = signal(1);
  protected readonly loginLoading = signal(false);
  protected readonly loginError = signal<string | null>(null);
  protected readonly regLoading = signal(false);
  protected readonly regError = signal<string | null>(null);

  protected readonly loginForm: FormGroup;
  protected readonly reg1Form: FormGroup;
  protected readonly regDia = signal<RegDia>({
    gender: '',
    ethnicity: '',
    parentalEducation: '',
    parentalSupport: '',
    studyTimeWeekly: 0,
    absences: 0,
    tutoring: false,
    extracurricular: false,
    sports: false,
    music: false,
    volunteering: false,
  });

  protected readonly navTabs = [
    { id: 'home', labelKey: 'landing.tabHome' },
    { id: 'about', labelKey: 'landing.tabAbout' },
    { id: 'gallery', labelKey: 'landing.tabGallery' },
    { id: 'team', labelKey: 'landing.tabTeam' },
  ] as const;

  protected readonly heroBullets = [
    {
      icon: 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.3 3 3 6 3s6-1.7 6-3v-5',
      labelKey: 'landing.hero.bullet1',
    },
    {
      icon: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
      labelKey: 'landing.hero.bullet2',
    },
    {
      icon: 'M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 20v-2a4 4 0 0 0-3-3.8',
      labelKey: 'landing.hero.bullet3',
    },
    {
      icon: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM5 16l.7 2L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16Z',
      labelKey: 'landing.hero.bullet4',
    },
  ] as const;

  protected readonly featureCards = [
    {
      icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
      labelKey: 'features.practice',
      descKey: 'features.practiceDesc',
    },
    {
      icon: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
      labelKey: 'features.learning',
      descKey: 'features.learningDesc',
    },
    {
      icon: 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.3 3 3 6 3s6-1.7 6-3v-5',
      labelKey: 'features.tutoring',
      descKey: 'features.tutoringDesc',
    },
    {
      icon: 'M21 12a8 8 0 0 1-11.4 7.2L3 21l1.8-6.6A8 8 0 1 1 21 12Z',
      labelKey: 'features.messages',
      descKey: 'features.messagesDesc',
    },
    {
      icon: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM5 16l.7 2L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16Z',
      labelKey: 'features.ia',
      descKey: 'features.iaDesc',
    },
    {
      icon: 'M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 17h6M12 13v4M8 21h8',
      labelKey: 'features.achievements',
      descKey: 'features.achievementsDesc',
    },
  ] as const;

  protected readonly galleryCards: readonly GalleryCard[] = [
    {
      icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
      tint: '#c8102e',
      tintBg: 'rgba(200,16,46,.08)',
      labelKey: 'features.practice',
      descKey: 'features.practiceDesc',
    },
    {
      icon: 'm12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5',
      tint: '#7a3cf8',
      tintBg: 'rgba(122,60,248,.08)',
      labelKey: 'features.learning',
      descKey: 'features.learningDesc',
    },
    {
      icon: 'M22 10 12 5 2 10l10 5 10-5ZM6 12v5c0 1.3 3 3 6 3s6-1.7 6-3v-5',
      tint: '#0d7cf2',
      tintBg: 'rgba(13,124,242,.08)',
      labelKey: 'features.tutoring',
      descKey: 'features.tutoringDesc',
    },
    {
      icon: 'M21 12a8 8 0 0 1-11.4 7.2L3 21l1.8-6.6A8 8 0 1 1 21 12Z',
      tint: '#09b46b',
      tintBg: 'rgba(9,180,107,.08)',
      labelKey: 'features.messages',
      descKey: 'features.messagesDesc',
    },
    {
      icon: 'M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM5 16l.7 2L8 19l-2.3.7L5 22l-.7-2.3L2 19l2.3-.7L5 16Z',
      tint: '#f59e0b',
      tintBg: 'rgba(245,158,11,.08)',
      labelKey: 'features.ia',
      descKey: 'features.iaDesc',
    },
    {
      icon: 'M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 17h6M12 13v4M8 21h8',
      tint: '#ef4444',
      tintBg: 'rgba(239,68,68,.08)',
      labelKey: 'features.achievements',
      descKey: 'features.achievementsDesc',
    },
  ];

  protected readonly authors: readonly Author[] = [
    {
      name: 'Daniel Eduardo Useche Pinilla',
      role: 'Líder Técnico · Arquitecto',
      photo: '/assets/authors/Daniel.png',
      link: 'https://www.linkedin.com/in/dannieleu/',
    },
    {
      name: 'Marianella Polo Peña',
      role: 'Desarrollo Frontend',
      photo: '/assets/authors/Marianella.jpeg',
      link: 'https://www.linkedin.com/in/marianellapolo/',
    },
    { name: 'Laura Alejandra Venegas', role: 'Desarrollo Backend' },
    { name: 'Jared Farfán Guevara', role: 'Diseño UX/UI' },
    { name: 'Ignacio Andrés Castillo Rendón', role: 'Arquitectura de software' },
    { name: 'Juan Diego Rodríguez Velásquez', role: 'Control de calidad' },
    { name: 'David Alejandro Patacón Henao', role: 'Gestión del proyecto' },
    { name: 'Anderson Fabián García Nieto', role: 'Documentación y soporte' },
    { name: 'Christian Alfonso Romero Martínez', role: 'Marketing y difusión' },
    {
      name: 'Hildebrando Peña Quezada',
      role: 'Análisis de datos y métricas',
      photo: '/assets/authors/brando.jfif',
      link: 'https://www.linkedin.com/in/hildebrando-pe%C3%B1a-quezada-2b32b33a1',
    },
    { name: 'Isaac David Palomo Peralta', role: 'Relaciones públicas y comunidad' },
    { name: 'Juana Lozano Chaves', role: 'Seguridad y cumplimiento' },
    {
      name: 'Maria Paula Rodríguez Muñoz',
      role: 'Innovación y nuevas tecnologías',
      link: 'https://www.linkedin.com/in/mariapaula-rodriguezmu%C3%B1oz',
    },
    { name: 'Felipe Eduardo Calvache Gallego', role: 'Integración y despliegue continuo' },
  ];

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    this.reg1Form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/)]],
      confirm: ['', Validators.required],
    });

    afterNextRender(() => {
      this.setupObserver();
      this.setupParallax();
      if (!this.prefersReducedMotion()) {
        const canvas = this.heroCanvas()?.nativeElement;
        if (canvas) {
          this.scene.init(canvas, { symbols: 18, stars: 600, opacity: 0.65 }).catch(() => undefined);
        }
      }
    });
    this.destroyRef.onDestroy(() => this.scene.dispose());
  }

  protected loginHasError(field: 'email' | 'password'): boolean {
    const ctrl = this.loginForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  protected loginErrorKey(field: 'email' | 'password'): string | null {
    const ctrl = this.loginForm.get(field);
    if (!ctrl?.invalid || !ctrl?.touched) return null;
    if (ctrl.hasError('required')) return 'register.errors.required';
    if (ctrl.hasError('email')) return 'register.errors.email';
    return null;
  }

  protected reg1HasError(field: string): boolean {
    const ctrl = this.reg1Form.get(field);
    if (!ctrl?.touched) return false;
    if (field === 'confirm') {
      const v = this.reg1Form.value as { password: string; confirm: string };
      return !!(ctrl.invalid || (ctrl.value && v.password !== v.confirm));
    }
    return !!ctrl?.invalid;
  }

  protected reg1ErrorKey(field: string): string | null {
    const ctrl = this.reg1Form.get(field);
    if (!ctrl?.touched) return null;
    if (field === 'confirm') {
      if (ctrl.hasError('required')) return 'register.errors.required';
      const v = this.reg1Form.value as { password: string; confirm: string };
      if (v.password !== v.confirm) return 'register.errors.passwordMismatch';
      return null;
    }
    if (!ctrl?.invalid) return null;
    if (ctrl.hasError('required')) return 'register.errors.required';
    if (ctrl.hasError('email')) return 'register.errors.email';
    if (ctrl.hasError('minlength') || ctrl.hasError('pattern')) return 'register.errors.password';
    return null;
  }

  protected toggleAuth(): void {
    this.authMode.update((m) => (m === 'login' ? 'register' : 'login'));
    this.regStep.set(1);
    this.loginError.set(null);
    this.regError.set(null);
  }

  protected onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginLoading.set(true);
    this.loginError.set(null);
    const { email, password } = this.loginForm.value as { email: string; password: string };
    this.authService.loginWithEmail({ email, password }).subscribe({
      next: (user) => {
        this.loginLoading.set(false);
        this.router.navigateByUrl(ROLE_HOME[user.role]).catch(() => undefined);
      },
      error: (err: { message?: string }) => {
        this.loginLoading.set(false);
        this.loginError.set(err?.message ?? 'auth.invalid');
      },
    });
  }

  protected onRegNext(): void {
    if (this.regStep() === 1) {
      this.reg1Form.markAllAsTouched();
      const v = this.reg1Form.value as { password: string; confirm: string };
      if (this.reg1Form.invalid || v.password !== v.confirm) {
        return;
      }
    }
    this.regStep.update((s) => Math.min(3, s + 1));
  }

  protected onRegBack(): void {
    this.regStep.update((s) => Math.max(1, s - 1));
  }

  protected updateDia<K extends keyof RegDia>(key: K, value: RegDia[K]): void {
    this.regDia.update((d) => ({ ...d, [key]: value }));
  }

  protected onRegSubmit(): void {
    const v = this.reg1Form.value as {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      password: string;
    };
    const d = this.regDia();
    const gMap: Record<string, number> = { male: 1, female: 0 };
    const eMap: Record<string, number> = { caucasian: 0, african: 1, asian: 2, other: 3 };
    const pMap: Record<string, number> = {
      none: 0,
      highschool: 1,
      technical: 2,
      bachelor: 3,
      higher: 4,
    };
    const sMap: Record<string, number> = {
      none: 0,
      low: 1,
      moderate: 2,
      high: 3,
      veryhigh: 4,
    };

    const payload: RegisterRequest = {
      email: v.email,
      password: v.password,
      nombre: v.nombre,
      apellido: v.apellido,
      telefono: v.telefono || undefined,
      datosIa: {
        gender: gMap[d.gender] ?? 0,
        ethnicity: eMap[d.ethnicity] ?? 0,
        parentalEducation: pMap[d.parentalEducation] ?? 0,
        parentalSupport: sMap[d.parentalSupport] ?? 0,
        studyTimeWeekly: d.studyTimeWeekly,
        absences: d.absences,
        tutoring: d.tutoring ? 1 : 0,
        extracurricular: d.extracurricular ? 1 : 0,
        sports: d.sports ? 1 : 0,
        music: d.music ? 1 : 0,
        volunteering: d.volunteering ? 1 : 0,
      },
    };

    this.regLoading.set(true);
    this.regError.set(null);
    this.authService.register(payload).subscribe({
      next: (user) => {
        this.regLoading.set(false);
        this.router.navigateByUrl(ROLE_HOME[user.role]).catch(() => undefined);
      },
      error: (err: { message?: string }) => {
        this.regLoading.set(false);
        this.regError.set(err?.message ?? 'errors.unknown');
      },
    });
  }

  protected scrollToSection(id: string, event?: Event): void {
    event?.preventDefault();
    if (typeof document === 'undefined') {
      return;
    }
    this.section.set(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }


  protected hideBrokenLogo(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

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
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    for (const el of this.sectionEls()) {
      observer.observe(el.nativeElement);
    }
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private setupParallax(): void {
    if (typeof window === 'undefined' || this.prefersReducedMotion()) {
      return;
    }
    const host = this.el.nativeElement as HTMLElement;
    const bands = Array.from(host.querySelectorAll<HTMLElement>('.landing__band'));
    const hero = host.querySelector<HTMLElement>('.landing__hero-band');

    const update = (): void => {
      const vh = window.innerHeight;
      const center = vh / 2;
      for (const band of bands) {
        const rect = band.getBoundingClientRect();
        if (rect.bottom <= 0) {
          band.style.opacity = '1';
          band.style.transform = 'none';
          continue;
        }
        if (rect.top >= vh) {
          band.style.opacity = '0';
          band.style.transform = 'translateY(48px)';
          continue;
        }
        const dist = (rect.top + rect.height / 2 - center) / (vh * 0.55);
        if (dist <= 0) {
          band.style.opacity = '1';
          band.style.transform = 'none';
        } else {
          const c = Math.min(1.2, dist);
          band.style.opacity = String(Math.max(0, 1 - c * 0.9));
          band.style.transform = `translateY(${c * 48}px)`;
        }
      }
      if (hero) {
        const rect = hero.getBoundingClientRect();
        if (rect.bottom < vh) {
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
    update();
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
