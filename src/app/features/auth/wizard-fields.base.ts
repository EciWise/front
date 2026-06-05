import { Directive, computed, input, output, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { markPageTouchedAndValidate } from './datos-ia-form';

/** Página mínima que necesita la navegación del asistente: sus controles. */
export interface WizardPage {
  readonly controls: readonly string[];
}

/**
 * Lógica común de los asistentes de campos de IA (rendimiento y deserción):
 * navegación por pasos, validación de la página actual y mapeo de errores a
 * claves i18n. Las subclases sólo aportan sus opciones de campos y la definición
 * de páginas; la mecánica del wizard vive aquí una sola vez.
 */
@Directive()
export abstract class WizardFieldsBase {
  readonly group = input.required<FormGroup>();
  /** Activa la navegación por pasos (Anterior/Siguiente + botón final). */
  readonly paginated = input(false);
  /** Deshabilita el botón final mientras el contenedor guarda. */
  readonly pending = input(false);
  /** Clave i18n de error a mostrar sobre los botones de navegación. */
  readonly error = input<string | null>(null);
  /** Se emite al confirmar el último paso (tras validar la página). */
  readonly completed = output<void>();

  /** Páginas del asistente (definidas por cada subclase). */
  protected abstract readonly pages: readonly WizardPage[];

  /** Paso actual (0-based). */
  protected readonly step = signal(0);
  /** Dirección del último cambio de paso (para la animación de slide). */
  protected readonly direction = signal<'forward' | 'back'>('forward');
  protected readonly isFirst = computed(() => this.step() === 0);
  protected readonly isLast = computed(() => this.step() === this.pages.length - 1);

  /** Avanza al siguiente paso si la página actual es válida. */
  next(): void {
    if (this.validateCurrentPage() && !this.isLast()) {
      this.direction.set('forward');
      this.step.update((s) => s + 1);
    }
  }

  /** Retrocede al paso anterior. */
  back(): void {
    if (!this.isFirst()) {
      this.direction.set('back');
      this.step.update((s) => s - 1);
    }
  }

  /** Confirma el último paso: valida y emite `completed` para que el padre guarde. */
  finishStep(): void {
    if (this.validateCurrentPage()) {
      this.completed.emit();
    }
  }

  /** Clave i18n del error a mostrar bajo un campo (o null si es válido/intacto). */
  errorKeyFor(name: string): string | null {
    const control = this.group().get(name);
    if (!control || control.valid || !control.touched) {
      return null;
    }
    return control.hasError('required')
      ? 'datosIa.errors.required'
      : 'datosIa.errors.range';
  }

  /** Marca como tocados los controles del paso actual y reporta si son válidos. */
  protected validateCurrentPage(): boolean {
    return markPageTouchedAndValidate(this.group(), this.pages[this.step()].controls);
  }
}
