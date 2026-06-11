import { DatosIaInputs } from './ia.model';

export type IaSection = 'performance' | 'dropout';

/** Metadatos de cada campo de IA para construir el formulario de forma genérica. */
export interface IaFieldConfig {
  readonly key: keyof DatosIaInputs;
  readonly section: IaSection;
  readonly min: number;
  readonly max: number;
  readonly step: number;
}

/** Definición declarativa de las 32 variables (rangos = validación del servicio). */
export const IA_FIELDS: readonly IaFieldConfig[] = [
  // Modelo de rendimiento (Eciwise-IA)
  { key: 'gender', section: 'performance', min: 0, max: 1, step: 1 },
  { key: 'ethnicity', section: 'performance', min: 0, max: 3, step: 1 },
  { key: 'parentalEducation', section: 'performance', min: 0, max: 4, step: 1 },
  { key: 'studyTimeWeekly', section: 'performance', min: 0, max: 20, step: 0.5 },
  { key: 'absences', section: 'performance', min: 0, max: 30, step: 1 },
  { key: 'tutoring', section: 'performance', min: 0, max: 1, step: 1 },
  { key: 'parentalSupport', section: 'performance', min: 0, max: 4, step: 1 },
  { key: 'extracurricular', section: 'performance', min: 0, max: 1, step: 1 },
  { key: 'sports', section: 'performance', min: 0, max: 1, step: 1 },
  { key: 'music', section: 'performance', min: 0, max: 1, step: 1 },
  { key: 'volunteering', section: 'performance', min: 0, max: 1, step: 1 },
  // Modelo de deserción (ECIwise-IADropout-succes)
  { key: 'maritalStatus', section: 'dropout', min: 1, max: 6, step: 1 },
  { key: 'applicationMode', section: 'dropout', min: 1, max: 18, step: 1 },
  { key: 'applicationOrder', section: 'dropout', min: 0, max: 9, step: 1 },
  { key: 'course', section: 'dropout', min: 1, max: 17, step: 1 },
  { key: 'previousQualification', section: 'dropout', min: 1, max: 17, step: 1 },
  { key: 'nacionality', section: 'dropout', min: 1, max: 21, step: 1 },
  { key: 'motherQualification', section: 'dropout', min: 1, max: 29, step: 1 },
  { key: 'fatherQualification', section: 'dropout', min: 1, max: 34, step: 1 },
  { key: 'motherOccupation', section: 'dropout', min: 1, max: 32, step: 1 },
  { key: 'fatherOccupation', section: 'dropout', min: 1, max: 46, step: 1 },
  { key: 'displaced', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'educationalSpecialNeeds', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'debtor', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'tuitionFeesUpToDate', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'scholarshipHolder', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'ageAtEnrollment', section: 'dropout', min: 14, max: 70, step: 1 },
  { key: 'international', section: 'dropout', min: 0, max: 1, step: 1 },
  { key: 'curricularUnits1stSemCredited', section: 'dropout', min: 0, max: 20, step: 1 },
  { key: 'curricularUnits1stSemEnrolled', section: 'dropout', min: 0, max: 26, step: 1 },
  { key: 'curricularUnits1stSemEvaluations', section: 'dropout', min: 0, max: 45, step: 1 },
  { key: 'curricularUnits1stSemApproved', section: 'dropout', min: 0, max: 26, step: 1 },
];
