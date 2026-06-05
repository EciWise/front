import { FormBuilder, Validators } from '@angular/forms';
import { DatosIaInputs } from '../../core/ia/ia.model';

/**
 * Campos del modelo de deserción (sin `gender`, que ya se captura en
 * rendimiento). Es un subconjunto de {@link DatosIaInputs}, así que se deriva con
 * `Pick` para no repetir la lista de variables ni desincronizar sus tipos.
 */
export type DropoutFormValue = Pick<
  DatosIaInputs,
  | 'maritalStatus'
  | 'applicationMode'
  | 'applicationOrder'
  | 'course'
  | 'previousQualification'
  | 'nacionality'
  | 'motherQualification'
  | 'fatherQualification'
  | 'motherOccupation'
  | 'fatherOccupation'
  | 'displaced'
  | 'educationalSpecialNeeds'
  | 'debtor'
  | 'tuitionFeesUpToDate'
  | 'scholarshipHolder'
  | 'ageAtEnrollment'
  | 'international'
  | 'curricularUnits1stSemCredited'
  | 'curricularUnits1stSemEnrolled'
  | 'curricularUnits1stSemEvaluations'
  | 'curricularUnits1stSemApproved'
>;

/**
 * Construye el `FormGroup` con los 21 campos del modelo de deserción, todos
 * obligatorios. Los rangos replican la validación del servicio de IA.
 */
export function buildDropoutGroup(fb: FormBuilder) {
  const req = (min: number, max: number) => [
    Validators.required,
    Validators.min(min),
    Validators.max(max),
  ];
  return fb.nonNullable.group({
    maritalStatus: [null as number | null, req(1, 6)],
    applicationMode: [null as number | null, req(1, 18)],
    applicationOrder: [null as number | null, req(0, 9)],
    course: [null as number | null, req(1, 17)],
    previousQualification: [null as number | null, req(1, 17)],
    nacionality: [null as number | null, req(1, 21)],
    motherQualification: [null as number | null, req(1, 29)],
    fatherQualification: [null as number | null, req(1, 34)],
    motherOccupation: [null as number | null, req(1, 32)],
    fatherOccupation: [null as number | null, req(1, 46)],
    displaced: [null as number | null, req(0, 1)],
    educationalSpecialNeeds: [null as number | null, req(0, 1)],
    debtor: [null as number | null, req(0, 1)],
    tuitionFeesUpToDate: [null as number | null, req(0, 1)],
    scholarshipHolder: [null as number | null, req(0, 1)],
    ageAtEnrollment: [null as number | null, req(17, 70)],
    international: [null as number | null, req(0, 1)],
    curricularUnits1stSemCredited: [null as number | null, req(0, 20)],
    curricularUnits1stSemEnrolled: [null as number | null, req(0, 26)],
    curricularUnits1stSemEvaluations: [null as number | null, req(0, 45)],
    curricularUnits1stSemApproved: [null as number | null, req(0, 26)],
  });
}

/** Convierte los valores del formulario al payload parcial que espera wise_auth. */
export function buildDropoutPayload(d: DropoutFormValue): Partial<DatosIaInputs> {
  return {
    maritalStatus: d.maritalStatus ?? 0,
    applicationMode: d.applicationMode ?? 0,
    applicationOrder: d.applicationOrder ?? 0,
    course: d.course ?? 0,
    previousQualification: d.previousQualification ?? 0,
    nacionality: d.nacionality ?? 0,
    motherQualification: d.motherQualification ?? 0,
    fatherQualification: d.fatherQualification ?? 0,
    motherOccupation: d.motherOccupation ?? 0,
    fatherOccupation: d.fatherOccupation ?? 0,
    displaced: d.displaced ?? 0,
    educationalSpecialNeeds: d.educationalSpecialNeeds ?? 0,
    debtor: d.debtor ?? 0,
    tuitionFeesUpToDate: d.tuitionFeesUpToDate ?? 0,
    scholarshipHolder: d.scholarshipHolder ?? 0,
    ageAtEnrollment: d.ageAtEnrollment ?? 0,
    international: d.international ?? 0,
    curricularUnits1stSemCredited: d.curricularUnits1stSemCredited ?? 0,
    curricularUnits1stSemEnrolled: d.curricularUnits1stSemEnrolled ?? 0,
    curricularUnits1stSemEvaluations: d.curricularUnits1stSemEvaluations ?? 0,
    curricularUnits1stSemApproved: d.curricularUnits1stSemApproved ?? 0,
  };
}
