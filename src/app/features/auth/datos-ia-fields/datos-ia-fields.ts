import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption as EciSelectOption } from '../../../shared/ui/select/select';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { DATOS_IA_PAGES, markPageTouchedAndValidate } from '../datos-ia-form';

/** Opción de un select codificado (valor numérico que espera el backend + clave i18n). */
interface SelectOption {
  readonly value: number;
  readonly key: string;
}

/**
 * Campos de datos de IA del estudiante con presentación amigable: selects con
 * texto (no códigos), ayudas descriptivas y alineación en grilla. Recibe el
 * `FormGroup` construido con `buildDatosIaGroup` y lo comparten el registro y el
 * pop-up de cambio de contraseña. En modo `paginated` reparte las preguntas en
 * pasos cortos con navegación Anterior/Siguiente.
 */
@Component({
  selector: 'eci-datos-ia-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    InfoTooltipComponent,
  ],
  templateUrl: './datos-ia-fields.html',
  styleUrl: './datos-ia-fields.css',
})
export class DatosIaFieldsComponent {
  readonly group = input.required<FormGroup>();
  /** Activa la navegación por pasos interna (Anterior/Siguiente + botón final). */
  readonly paginated = input(false);
  /**
   * Modo "controlado": si se indica un índice de página, el componente solo
   * renderiza esa página y oculta su indicador y su barra de navegación (las
   * provee el contenedor, p. ej. el registro en 3 pasos). `null` = automático.
   */
  readonly page = input<number | null>(null);
  /** Deshabilita el botón final mientras el contenedor guarda. */
  readonly pending = input(false);
  readonly showErrors = input(false);
  /** Clave i18n de error a mostrar sobre los botones de navegación. */
  readonly error = input<string | null>(null);
  /** Se emite al confirmar el último paso (tras validar la página). */
  readonly completed = output<void>();

  protected readonly genderOptions: readonly SelectOption[] = [
    { value: 0, key: 'male' },
    { value: 1, key: 'female' },
  ];
  protected readonly ethnicityOptions: readonly SelectOption[] = [
    { value: 0, key: 'caucasian' },
    { value: 1, key: 'african' },
    { value: 2, key: 'asian' },
    { value: 3, key: 'other' },
  ];
  protected readonly parentalEducationOptions: readonly SelectOption[] = [
    { value: 0, key: 'none' },
    { value: 1, key: 'highschool' },
    { value: 2, key: 'somecollege' },
    { value: 3, key: 'bachelor' },
    { value: 4, key: 'higher' },
  ];
  protected readonly parentalSupportOptions: readonly SelectOption[] = [
    { value: 0, key: 'none' },
    { value: 1, key: 'low' },
    { value: 2, key: 'moderate' },
    { value: 3, key: 'high' },
    { value: 4, key: 'veryhigh' },
  ];

  /** Preguntas sí/no (checkboxes). */
  protected readonly checks = [
    'tutoring',
    'extracurricular',
    'sports',
    'music',
    'volunteering',
  ] as const;

  /** Agrupación de las preguntas en pasos cortos y temáticos (compartida). */
  protected readonly pages = DATOS_IA_PAGES;

  /** Paso interno actual (0-based), solo en modo paginado autónomo. */
  protected readonly step = signal(0);
  /** Dirección del último cambio de paso (para la animación de slide). */
  protected readonly direction = signal<'forward' | 'back'>('forward');
  private readonly attemptedPages = signal<ReadonlySet<number>>(new Set());

  /** Muestra el indicador de pasos y la navegación propios del componente. */
  protected readonly chrome = computed(() => this.paginated() && this.page() === null);
  /** Modo de vista única (sin paginar ni controlar): todas las preguntas juntas. */
  protected readonly singleView = computed(
    () => !this.paginated() && this.page() === null,
  );
  /** Índice de página a renderizar: el controlado por el padre o el interno. */
  protected readonly activePage = computed(() => this.page() ?? this.step());

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

  /** Confirma el último paso: valida y emite `finish` para que el padre guarde. */
  finishStep(): void {
    if (this.validateCurrentPage()) {
      this.completed.emit();
    }
  }

  /** Clave i18n del error a mostrar bajo un campo (o null si es válido/intacto). */
  errorKeyFor(name: string): string | null {
    if (!this.showErrors() && !this.pageAttemptedFor(name)) {
      return null;
    }
    const control = this.group().get(name);
    if (!control || control.valid) {
      return null;
    }
    return control.hasError('required')
      ? 'datosIa.errors.required'
      : 'datosIa.errors.range';
  }

  /** Marca como tocados los controles del paso actual y reporta si son válidos. */
  private validateCurrentPage(): boolean {
    this.attemptedPages.update((pages) => new Set(pages).add(this.step()));
    return markPageTouchedAndValidate(this.group(), this.pages[this.step()].controls);
  }

  selectOptions(prefix: string, options: readonly SelectOption[]): readonly EciSelectOption[] {
    return options.map((option) => ({
      value: option.value,
      labelKey: `${prefix}.${option.key}`,
    }));
  }

  private pageAttemptedFor(name: string): boolean {
    const page = this.page();
    if (page !== null) {
      return this.showErrors();
    }
    const pageIndex = this.pages.findIndex((p) => p.controls.includes(name));
    return pageIndex >= 0 && this.attemptedPages().has(pageIndex);
  }
}
