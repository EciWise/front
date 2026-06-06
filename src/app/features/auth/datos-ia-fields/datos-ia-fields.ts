import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectComponent, SelectOption as EciSelectOption } from '../../../shared/ui/select/select';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
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
 * pasos cortos con la navegación del componente `eci-wizard-chrome`.
 */
@Component({
  selector: 'eci-datos-ia-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    WizardChromeComponent,
    SelectComponent,
    InfoTooltipComponent,
  ],
  templateUrl: './datos-ia-fields.html',
  styleUrl: './datos-ia-fields.css',
})
export class DatosIaFieldsComponent extends WizardFieldsBase {
  readonly page = input<number | null>(null);
  readonly showErrors = input(false);

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

  protected readonly checks = [
    'tutoring',
    'volunteering',
    'sports',
    'music',
    'extracurricular',
  ] as const;

  protected override readonly pages = DATOS_IA_PAGES;
  protected readonly chrome = computed(() => this.paginated() && this.page() === null);
  protected readonly singleView = computed(
    () => !this.paginated() && this.page() === null,
  );
  protected readonly activePage = computed(() => this.page() ?? this.step());

  override errorKeyFor(name: string): string | null {
    const control = this.group().get(name);
    if (!control || control.valid || (!this.showErrors() && !control.touched)) {
      return null;
    }
    return control.hasError('required')
      ? 'datosIa.errors.required'
      : 'datosIa.errors.range';
  }

  protected selectOptions(
    prefix: string,
    options: readonly SelectOption[],
  ): readonly EciSelectOption[] {
    return options.map((option) => ({
      value: option.value,
      labelKey: `${prefix}.${option.key}`,
    }));
  }
}
