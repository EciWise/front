import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  roleApiName,
  roleLabelKey as roleLabelKeyFor,
} from '../../../core/models/role.enum';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { BulkUploadResult } from '../user-admin.service';

/** Filas por página de cada pestaña (pensado para entrar sin scroll). */
const PAGE_SIZE = 6;

/** Pestaña activa del diálogo. */
type Tab = 'created' | 'errors';

/**
 * Diálogo (pop-up) que muestra el resultado de una carga masiva por CSV en dos
 * pestañas — usuarios creados (con su contraseña temporal) y filas con error —
 * cada una paginada con flechas para que todo entre sin scroll. El padre lo
 * controla montándolo solo cuando hay un `result`.
 */
@Component({
  selector: 'eci-bulk-result-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, ButtonComponent, IconComponent],
  templateUrl: './bulk-result-dialog.html',
  styleUrl: './bulk-result-dialog.css',
  host: { '(document:keydown.escape)': 'onClose()' },
})
export class BulkResultDialogComponent {
  readonly result = input.required<BulkUploadResult>();
  readonly closed = output<void>();

  /** Raíz del diálogo; se promueve al top layer para quedar por encima de todo. */
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    // Mostrar como popover lo coloca en la capa superior del navegador, por
    // encima del menú y de cualquier contexto de apilamiento (p. ej. el área
    // principal con view-transition-name). afterNextRender => solo en navegador.
    afterNextRender(() => {
      const el = this.root().nativeElement;
      if (typeof el.showPopover === 'function' && !el.matches(':popover-open')) {
        try {
          el.showPopover();
        } catch {
          // Si el navegador no lo permite, el diálogo sigue siendo fixed.
        }
      }
    });
  }

  protected readonly pageSize = PAGE_SIZE;

  protected readonly users = computed(() => this.result().usuarios);
  protected readonly errors = computed(() => this.result().errores);
  protected readonly hasErrors = computed(() => this.errors().length > 0);

  /** Pestaña activa; arranca en errores si no se creó a nadie pero hubo errores. */
  protected readonly tab = linkedSignal<BulkUploadResult, Tab>({
    source: this.result,
    computation: (r) =>
      r.usuarios.length === 0 && r.errores.length > 0 ? 'errors' : 'created',
  });

  /** Nº de elementos del conjunto de la pestaña activa. */
  protected readonly count = computed(() =>
    this.tab() === 'created' ? this.users().length : this.errors().length,
  );

  /**
   * Página actual (0-based). Se reinicia al cambiar de pestaña o de resultado.
   * La clave es un primitivo estable (no un objeto nuevo en cada detección).
   */
  protected readonly page = linkedSignal<string, number>({
    source: () => {
      const r = this.result();
      return `${this.tab()}|${r.total}|${r.creados}|${r.errores.length}`;
    },
    computation: () => 0,
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.count() / this.pageSize)),
  );
  /** Offset global para numerar filas a través de las páginas. */
  protected readonly pageOffset = computed(() => this.page() * this.pageSize);

  protected readonly pagedUsers = computed(() =>
    this.users().slice(this.pageOffset(), this.pageOffset() + this.pageSize),
  );
  protected readonly pagedErrors = computed(() =>
    this.errors().slice(this.pageOffset(), this.pageOffset() + this.pageSize),
  );

  /** Índice global de la fila cuya contraseña se acaba de copiar. */
  protected readonly copiedIndex = signal<number | null>(null);
  /** Marca efímera cuando se copian todas las contraseñas. */
  protected readonly copiedAll = signal(false);

  /** Sufijo de clase del badge según el rol (estudiante/tutor/admin). */
  protected roleClass(rol: string): string {
    return roleApiName(rol);
  }

  protected roleLabelKey(rol: string): string {
    return roleLabelKeyFor(rol);
  }

  setTab(tab: Tab): void {
    this.tab.set(tab);
  }

  prev(): void {
    this.page.update((p) => Math.max(0, p - 1));
  }

  next(): void {
    this.page.update((p) => Math.min(this.totalPages() - 1, p + 1));
  }

  onClose(): void {
    this.closed.emit();
  }

  async copyPassword(password: string, index: number): Promise<void> {
    if (await this.writeClipboard(password)) {
      this.copiedIndex.set(index);
      setTimeout(() => this.copiedIndex.set(null), 1500);
    }
  }

  /** Copia todas las parejas correo/contraseña como texto (una por línea). */
  async copyAll(): Promise<void> {
    const text = this.users()
      .map((u) => `${u.email},${u.passwordTemporal}`)
      .join('\n');
    if (await this.writeClipboard(text)) {
      this.copiedAll.set(true);
      setTimeout(() => this.copiedAll.set(false), 1500);
    }
  }

  private async writeClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // El portapapeles puede no estar disponible (p. ej. contexto no seguro).
      return false;
    }
  }
}
