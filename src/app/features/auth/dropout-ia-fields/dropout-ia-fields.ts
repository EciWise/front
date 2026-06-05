import {
  ChangeDetectionStrategy,
  Component,
  computed,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { SelectComponent, SelectOption as EciSelectOption } from '../../../shared/ui/select/select';
import { InfoTooltipComponent } from '../../../shared/ui/tooltip/tooltip';
import { WizardFieldsBase } from '../wizard-fields.base';

interface Option {
  readonly value: number;
  readonly key: string;
}

const OCCUPATIONS: readonly Option[] = [
  { value: 2, key: 'professional' },
  { value: 3, key: 'technician' },
  { value: 4, key: 'administrative' },
  { value: 5, key: 'services' },
  { value: 7, key: 'skilled' },
  { value: 9, key: 'unskilled' },
];

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

interface Page {
  readonly titleKey: string;
  readonly controls: readonly string[];
}

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
export class DropoutIaFieldsComponent extends WizardFieldsBase {
  protected readonly yesNo: readonly Option[] = [
    { value: 1, key: 'yes' },
    { value: 0, key: 'no' },
  ];

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
      options: [...OCCUPATIONS, { value: 32, key: 'other' }],
    },
    {
      kind: 'select',
      control: 'fatherOccupation',
      options: [...OCCUPATIONS, { value: 46, key: 'other' }],
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

  private readonly fieldMap = new Map(this.fields.map((field) => [field.control, field]));

  protected override readonly pages: readonly Page[] = [
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

  protected readonly visibleFields = computed<readonly FieldDef[]>(() => {
    const names = this.paginated()
      ? this.pages[this.step()].controls
      : this.fields.map((field) => field.control);
    return names.map((name) => this.fieldMap.get(name)!);
  });

  protected selectOptions(field: Extract<FieldDef, { kind: 'select' }>): readonly EciSelectOption[] {
    return field.options.map((option) => ({
      value: option.value,
      labelKey: `datosIa.dropout.options.${field.control}.${option.key}`,
    }));
  }

  protected yesNoOptions(): readonly EciSelectOption[] {
    return this.yesNo.map((option) => ({
      value: option.value,
      labelKey: `datosIa.yesNo.${option.key}`,
    }));
  }
}
