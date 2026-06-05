import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { DATOS_IA_PAGES } from '../datos-ia-form';
import { WizardChromeComponent } from '../wizard-chrome/wizard-chrome';
import { WizardFieldsBase } from '../wizard-fields.base';

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
  imports: [ReactiveFormsModule, TranslatePipe, WizardChromeComponent],
  templateUrl: './datos-ia-fields.html',
  styleUrl: './datos-ia-fields.css',
})
export class DatosIaFieldsComponent extends WizardFieldsBase {
  /**
   * Modo "controlado": si se indica un índice de página, el componente solo
   * renderiza esa página y oculta su indicador y su barra de navegación (las
   * provee el contenedor, p. ej. el registro en 3 pasos). `null` = automático.
   */
  readonly page = input<number | null>(null);

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

  /** Muestra el indicador de pasos y la navegación propios del componente. */
  protected readonly chrome = computed(() => this.paginated() && this.page() === null);
  /** Modo de vista única (sin paginar ni controlar): todas las preguntas juntas. */
  protected readonly singleView = computed(
    () => !this.paginated() && this.page() === null,
  );
  /** Índice de página a renderizar: el controlado por el padre o el interno. */
  protected readonly activePage = computed(() => this.page() ?? this.step());
}
