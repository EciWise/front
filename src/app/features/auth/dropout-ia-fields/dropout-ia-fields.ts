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
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';

interface Option {
  readonly value: number;
  readonly key: string;
}

/** Descriptor de un campo del formulario, discriminado por tipo de control. */
type FieldDef =
  | {
      readonly kind: 'select';
      readonly control: string;
      readonly options: readonly Option[];
      readonly hint?: boolean;
    }
  | {
      readonly kind: 'number';
      readonly control: string;
      readonly min: number;
      readonly max: number;
      readonly step: number;
      readonly hint?: boolean;
    }
  | { readonly kind: 'yesno'; readonly control: string; readonly hint?: boolean };

/** Una página del asistente: título i18n y los controles que agrupa. */
interface Page {
  readonly titleKey: string;
  readonly controls: readonly string[];
}

/**
 * Campos del modelo de deserción con presentación amigable (selects con texto,
 * sí/no y numéricos con ayuda). Recibe el `FormGroup` de `buildDropoutGroup`.
 * En modo `paginated` reparte las preguntas en pasos cortos con navegación
 * Anterior/Siguiente para no abrumar al estudiante; en modo normal las muestra
 * todas en una sola grilla.
 */
@Component({
  selector: 'eci-dropout-ia-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    InfoTooltipComponent,
  ],
  templateUrl: './dropout-ia-fields.html',
  styleUrl: '../datos-ia-fields/datos-ia-fields.css',
})
export class DropoutIaFieldsComponent {
  readonly group = input.required<FormGroup>();
  /** Activa la navegación por pasos (Anterior/Siguiente + botón final). */
  readonly paginated = input(false);
  /** Deshabilita el botón final mientras el contenedor guarda. */
  readonly pending = input(false);
  /** Clave i18n de error a mostrar sobre los botones de navegación. */
  readonly error = input<string | null>(null);
  /** Se emite al confirmar el último paso (tras validar la página). */
  readonly completed = output<void>();

  protected readonly yesNo: readonly Option[] = [
    { value: 1, key: 'yes' },
    { value: 0, key: 'no' },
  ];

  /** Catálogo de campos indexado por control (valores = códigos del modelo). */
  private readonly fields: readonly FieldDef[] = [
    {
      kind: 'select',
      control: 'maritalStatus',
      hint: true,
      options: [
        { value: 1, key: 'single' },
        { value: 2, key: 'married' },
        { value: 3, key: 'widower' },
        { value: 4, key: 'divorced' },
        { value: 5, key: 'union' },
        { value: 6, key: 'separated' },
      ],
    },
    {
      kind: 'select',
      control: 'applicationMode',
      hint: true,
      options: [
        { value: 1, key: 'general' },
        { value: 2, key: 'secondPhase' },
        { value: 5, key: 'special' },
        { value: 10, key: 'transfer' },
        { value: 18, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'course',
      hint: true,
      options: [
        { value: 4, key: 'technologies' },
        { value: 9, key: 'management' },
        { value: 12, key: 'nursing' },
        { value: 3, key: 'socialWork' },
        { value: 6, key: 'education' },
        { value: 17, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'previousQualification',
      hint: true,
      options: [
        { value: 1, key: 'secondary' },
        { value: 5, key: 'technical' },
        { value: 3, key: 'bachelor' },
        { value: 6, key: 'postgrad' },
        { value: 17, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'nacionality',
      options: [
        { value: 1, key: 'colombian' },
        { value: 13, key: 'latinAmerican' },
        { value: 6, key: 'european' },
        { value: 21, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'motherQualification',
      options: [
        { value: 1, key: 'none' },
        { value: 2, key: 'primary' },
        { value: 3, key: 'secondary' },
        { value: 10, key: 'technical' },
        { value: 20, key: 'higher' },
        { value: 29, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'fatherQualification',
      options: [
        { value: 1, key: 'none' },
        { value: 2, key: 'primary' },
        { value: 3, key: 'secondary' },
        { value: 10, key: 'technical' },
        { value: 20, key: 'higher' },
        { value: 34, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'motherOccupation',
      options: [
        { value: 2, key: 'professional' },
        { value: 3, key: 'technician' },
        { value: 4, key: 'administrative' },
        { value: 5, key: 'services' },
        { value: 7, key: 'skilled' },
        { value: 9, key: 'unskilled' },
        { value: 32, key: 'other' },
      ],
    },
    {
      kind: 'select',
      control: 'fatherOccupation',
      options: [
        { value: 2, key: 'professional' },
        { value: 3, key: 'technician' },
        { value: 4, key: 'administrative' },
        { value: 5, key: 'services' },
        { value: 7, key: 'skilled' },
        { value: 9, key: 'unskilled' },
        { value: 46, key: 'other' },
      ],
    },
    { kind: 'number', control: 'ageAtEnrollment', min: 17, max: 70, step: 1, hint: true },
    { kind: 'number', control: 'applicationOrder', min: 0, max: 9, step: 1, hint: true },
    { kind: 'number', control: 'curricularUnits1stSemEnrolled', min: 0, max: 26, step: 1, hint: true },
    { kind: 'number', control: 'curricularUnits1stSemApproved', min: 0, max: 26, step: 1, hint: true },
    { kind: 'number', control: 'curricularUnits1stSemEvaluations', min: 0, max: 45, step: 1, hint: true },
    { kind: 'number', control: 'curricularUnits1stSemCredited', min: 0, max: 20, step: 1, hint: true },
    { kind: 'yesno', control: 'displaced' },
    { kind: 'yesno', control: 'educationalSpecialNeeds' },
    { kind: 'yesno', control: 'debtor' },
    { kind: 'yesno', control: 'tuitionFeesUpToDate' },
    { kind: 'yesno', control: 'scholarshipHolder' },
    { kind: 'yesno', control: 'international' },
  ];

  private readonly fieldMap = new Map(this.fields.map((f) => [f.control, f]));

  /** Agrupación de las preguntas en pasos cortos y temáticos. */
  protected readonly pages: readonly Page[] = [
    {
      titleKey: 'datosIa.dropout.pages.personal',
      controls: ['maritalStatus', 'nacionality', 'ageAtEnrollment', 'displaced', 'international'],
    },
    {
      titleKey: 'datosIa.dropout.pages.family',
      controls: [
        'motherQualification',
        'fatherQualification',
        'motherOccupation',
        'fatherOccupation',
      ],
    },
    {
      titleKey: 'datosIa.dropout.pages.admission',
      controls: [
        'applicationMode',
        'course',
        'previousQualification',
        'applicationOrder',
        'educationalSpecialNeeds',
      ],
    },
    {
      titleKey: 'datosIa.dropout.pages.firstSemester',
      controls: [
        'curricularUnits1stSemEnrolled',
        'curricularUnits1stSemApproved',
        'curricularUnits1stSemEvaluations',
        'curricularUnits1stSemCredited',
        'scholarshipHolder',
        'debtor',
        'tuitionFeesUpToDate',
      ],
    },
  ];

  /** Paso actual (0-based). */
  protected readonly step = signal(0);
  /** Dirección del último cambio de paso (para la animación de slide). */
  protected readonly direction = signal<'forward' | 'back'>('forward');
  private readonly attemptedPages = signal<ReadonlySet<number>>(new Set());
  protected readonly isFirst = computed(() => this.step() === 0);
  protected readonly isLast = computed(() => this.step() === this.pages.length - 1);

  /** Campos visibles: los del paso actual si está paginado; todos si no. */
  protected readonly visibleFields = computed<readonly FieldDef[]>(() => {
    const names = this.paginated()
      ? this.pages[this.step()].controls
      : this.fields.map((f) => f.control);
    return names.map((name) => this.fieldMap.get(name)!);
  });

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
    if (!this.pageAttemptedFor(name)) {
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
    const formGroup = this.group();
    let valid = true;
    for (const name of this.pages[this.step()].controls) {
      const control = formGroup.get(name);
      if (control) {
        control.markAsTouched();
        valid = valid && control.valid;
      }
    }
    return valid;
  }

  selectOptions(field: Extract<FieldDef, { kind: 'select' }>): readonly SelectOption[] {
    return field.options.map((option) => ({
      value: option.value,
      labelKey: `datosIa.dropout.options.${field.control}.${option.key}`,
    }));
  }

  yesNoOptions(): readonly SelectOption[] {
    return this.yesNo.map((option) => ({
      value: option.value,
      labelKey: `datosIa.yesNo.${option.key}`,
    }));
  }

  private pageAttemptedFor(name: string): boolean {
    if (!this.paginated()) {
      return this.attemptedPages().size > 0;
    }
    const pageIndex = this.pages.findIndex((p) => p.controls.includes(name));
    return pageIndex >= 0 && this.attemptedPages().has(pageIndex);
  }
}
