import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AUTH_CONFIG } from '../auth/auth.config';
import { DatosIa, PrediccionResultado } from './ia.model';
import { IaDataService } from './ia-data.service';

const BASE = 'http://api.test';

const datosIa: DatosIa = {
  gender: 1,
  ethnicity: 2,
  parentalEducation: 3,
  studyTimeWeekly: 12,
  absences: 1,
  tutoring: 1,
  parentalSupport: 3,
  extracurricular: 0,
  sports: 1,
  music: 0,
  volunteering: 1,
  maritalStatus: null,
  applicationMode: null,
  applicationOrder: null,
  course: null,
  previousQualification: null,
  nacionality: null,
  motherQualification: null,
  fatherQualification: null,
  motherOccupation: null,
  fatherOccupation: null,
  displaced: null,
  educationalSpecialNeeds: null,
  debtor: null,
  tuitionFeesUpToDate: null,
  scholarshipHolder: null,
  ageAtEnrollment: null,
  international: null,
  curricularUnits1stSemCredited: null,
  curricularUnits1stSemEnrolled: null,
  curricularUnits1stSemEvaluations: null,
  curricularUnits1stSemApproved: null,
  prediccionRendimiento: 'Alto',
  prediccionDesercion: 'No',
  confianzaDesercion: 88,
  probabilidadExito: 91,
  fechaPrediccion: '2026-06-01T00:00:00Z',
};

describe('IaDataService', () => {
  let service: IaDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_CONFIG, useValue: { apiBaseUrl: `${BASE}/` } },
      ],
    });
    service = TestBed.inject(IaDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta los datos IA del usuario autenticado', () => {
    let result: DatosIa | null | undefined;
    service.getMyData().subscribe((data) => (result = data));

    const req = http.expectOne(`${BASE}/ia/me`);
    expect(req.request.method).toBe('GET');
    req.flush(datosIa);

    expect(result).toEqual(datosIa);
  });

  it('permite que el backend responda null cuando no hay datos IA', () => {
    let result: DatosIa | null | undefined = datosIa;
    service.getMyData().subscribe((data) => (result = data));

    http.expectOne(`${BASE}/ia/me`).flush(null);

    expect(result).toBeNull();
  });

  it('guarda parcialmente los datos IA', () => {
    const body = { studyTimeWeekly: 14, absences: 2 };
    service.saveMyData(body).subscribe();

    const req = http.expectOne(`${BASE}/ia/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(datosIa);
  });

  it('persiste el resultado de prediccion IA', () => {
    const result: PrediccionResultado = {
      prediccionRendimiento: 'Medio',
      prediccionDesercion: 'No',
      confianzaDesercion: 76,
      probabilidadExito: 82,
    };

    service.savePrediction(result).subscribe();

    const req = http.expectOne(`${BASE}/ia/me/prediccion`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(result);
    req.flush(datosIa);
  });
});
