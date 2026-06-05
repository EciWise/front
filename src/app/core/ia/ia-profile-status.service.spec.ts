import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { IaDataService } from './ia-data.service';
import { DatosIa } from './ia.model';
import { IaProfileStatusService } from './ia-profile-status.service';

const completeProfile: DatosIa = {
  gender: 1,
  ethnicity: 2,
  parentalEducation: 3,
  studyTimeWeekly: 10,
  absences: 1,
  tutoring: 1,
  parentalSupport: 4,
  extracurricular: 0,
  sports: 1,
  music: 0,
  volunteering: 1,
  maritalStatus: 0,
  applicationMode: 1,
  applicationOrder: 1,
  course: 33,
  previousQualification: 1,
  nacionality: 1,
  motherQualification: 19,
  fatherQualification: 19,
  motherOccupation: 5,
  fatherOccupation: 5,
  displaced: 0,
  educationalSpecialNeeds: 0,
  debtor: 0,
  tuitionFeesUpToDate: 1,
  scholarshipHolder: 0,
  ageAtEnrollment: 19,
  international: 0,
  curricularUnits1stSemCredited: 0,
  curricularUnits1stSemEnrolled: 6,
  curricularUnits1stSemEvaluations: 6,
  curricularUnits1stSemApproved: 5,
  prediccionRendimiento: null,
  prediccionDesercion: null,
  confianzaDesercion: null,
  probabilidadExito: null,
  fechaPrediccion: null,
};

describe('IaProfileStatusService', () => {
  let getMyData: ReturnType<typeof vi.fn>;
  let service: IaProfileStatusService;

  beforeEach(() => {
    getMyData = vi.fn(() => of(completeProfile));
    TestBed.configureTestingModule({
      providers: [{ provide: IaDataService, useValue: { getMyData } }],
    });
    service = TestBed.inject(IaProfileStatusService);
  });

  it('marca completos los perfiles de rendimiento y desercion cuando todos los campos existen', () => {
    service.load();

    expect(service.loaded()).toBe(true);
    expect(service.performanceComplete()).toBe(true);
    expect(service.dropoutComplete()).toBe(true);
  });

  it('considera incompleto el perfil si un campo requerido viene null', () => {
    getMyData.mockReturnValue(of({ ...completeProfile, absences: null }));

    service.load();

    expect(service.loaded()).toBe(true);
    expect(service.performanceComplete()).toBe(false);
    expect(service.dropoutComplete()).toBe(true);
  });

  it('marca loaded aunque falle la carga para no bloquear indefinidamente el shell', () => {
    getMyData.mockReturnValue(throwError(() => new Error('network')));

    service.load();

    expect(service.loaded()).toBe(true);
    expect(service.performanceComplete()).toBe(false);
    expect(service.dropoutComplete()).toBe(false);
  });
});
