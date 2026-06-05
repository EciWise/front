import { Injectable, inject } from '@angular/core';
import { stripTrailingSlashes } from '../config/url.util';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_CONFIG } from '../auth/auth.config';
import { DatosIa, DatosIaInputs, PrediccionResultado } from './ia.model';

/**
 * Acceso a los datos de IA del estudiante autenticado (almacenados en wise_auth).
 * El JWT lo añade el `authInterceptor`. Los errores los normaliza el `errorInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class IaDataService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  private get base(): string {
    return stripTrailingSlashes(this.config.apiBaseUrl);
  }

  getMyData(): Observable<DatosIa | null> {
    return this.http.get<DatosIa | null>(`${this.base}/ia/me`);
  }

  saveMyData(data: Partial<DatosIaInputs>): Observable<DatosIa> {
    return this.http.put<DatosIa>(`${this.base}/ia/me`, data);
  }

  savePrediction(result: PrediccionResultado): Observable<DatosIa> {
    return this.http.put<DatosIa>(`${this.base}/ia/me/prediccion`, result);
  }
}
