import { FormBuilder } from '@angular/forms';
import {
  DATOS_IA_PAGES,
  buildDatosIaGroup,
  buildDatosIaPayload,
  markPageTouchedAndValidate,
} from './datos-ia-form';

describe('datos-ia-form unit', () => {
  const fb = new FormBuilder();

  it('marca solo los controles de la pagina activa y reporta invalidez', () => {
    const group = buildDatosIaGroup(fb);

    const valid = markPageTouchedAndValidate(group, DATOS_IA_PAGES[0].controls);

    expect(valid).toBe(false);
    expect(group.controls.gender.touched).toBe(true);
    expect(group.controls.ethnicity.touched).toBe(true);
    expect(group.controls.studyTimeWeekly.touched).toBe(false);
  });

  it('convierte nulls a 0 y booleanos a 1/0 para el contrato del backend', () => {
    expect(
      buildDatosIaPayload({
        gender: null,
        ethnicity: 2,
        parentalEducation: 3,
        studyTimeWeekly: null,
        absences: 4,
        parentalSupport: null,
        tutoring: true,
        extracurricular: false,
        sports: true,
        music: false,
        volunteering: true,
      }),
    ).toEqual({
      gender: 0,
      ethnicity: 2,
      parentalEducation: 3,
      studyTimeWeekly: 0,
      absences: 4,
      parentalSupport: 0,
      tutoring: 1,
      extracurricular: 0,
      sports: 1,
      music: 0,
      volunteering: 1,
    });
  });

  it('aplica limites numericos del formulario de IA', () => {
    const group = buildDatosIaGroup(fb);

    group.patchValue({
      gender: 2,
      ethnicity: 4,
      parentalEducation: 5,
      parentalSupport: 5,
      studyTimeWeekly: 21,
      absences: 31,
    });

    expect(group.valid).toBe(false);
    expect(group.controls.gender.hasError('max')).toBe(true);
    expect(group.controls.studyTimeWeekly.hasError('max')).toBe(true);
    expect(group.controls.absences.hasError('max')).toBe(true);
  });
});
