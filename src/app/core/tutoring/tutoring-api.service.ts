import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TUTORING_CONFIG } from './tutoring.config';

export interface TutoriaResumenDto {
  readonly id: string;
  readonly tutorUserId: string;
  readonly tutorNombre: string | null;
  readonly fecha: string;
  readonly diaSemana: number;
  readonly horaInicio: string;
  readonly horaFin: string;
  readonly materiaId: string;
  readonly materiaCodigo: string;
  readonly materiaNombre: string;
  readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
  readonly salaCodigo: string | null;
  readonly enlaceVirtual: string | null;
  readonly cuposMaximos: number;
  readonly cuposDisponibles: number;
}

export interface DisponibilidadDto {
  readonly id: string;
  readonly tutorUserId: string;
  readonly franjaId: string;
  readonly franjaDiaSemana: number;
  readonly materiaId: string;
  readonly salaId: string | null;
  readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
  readonly cuposMaximos: number;
  readonly vigenciaDesde: string;
  readonly vigenciaHasta: string;
  readonly activa: boolean;
}

export interface ReservarTutoriaPayload {
  readonly tutoriaId: string;
  readonly temaEspecifico: string;
  readonly descripcionDudas: string;
}

export interface CancelarReservaPayload {
  readonly motivo: string;
}

export interface ReprogramarPayload {
  readonly tutoriaOrigenId: string;
  readonly tutoriaDestinoId: string;
  readonly motivo: string;
  readonly temaEspecifico: string;
  readonly descripcionDudas: string;
}

export interface PublicarDisponibilidadPayload {
  readonly franjaId: string;
  readonly materiaId: string;
  readonly salaId?: string;
  readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
  readonly cuposMaximos: number;
  readonly vigenciaDesde: string;
  readonly vigenciaHasta: string;
}

export interface BuscarTutoriasParams {
  readonly materiaId?: string;
  readonly tutorUserId?: string;
  readonly modalidad?: 'VIRTUAL' | 'PRESENCIAL';
  readonly fecha?: string;
}

@Injectable({ providedIn: 'root' })
export class TutoringApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TUTORING_CONFIG);

  private get base(): string {
    return this.config.tutoringApiUrl;
  }

  buscarTutorias(params?: BuscarTutoriasParams): Observable<TutoriaResumenDto[]> {
    return this.http.get<TutoriaResumenDto[]>(`${this.base}/tutorias`, { params: params as Record<string, string> });
  }

  reservar(payload: ReservarTutoriaPayload): Observable<unknown> {
    return this.http.post(`${this.base}/reservas`, payload);
  }

  cancelarReserva(tutoriaId: string, payload: CancelarReservaPayload): Observable<unknown> {
    return this.http.post(`${this.base}/reservas/${tutoriaId}/cancelar`, payload);
  }

  reprogramar(payload: ReprogramarPayload): Observable<unknown> {
    return this.http.post(`${this.base}/reservas/reprogramar`, payload);
  }

  listarDisponibilidades(): Observable<DisponibilidadDto[]> {
    return this.http.get<DisponibilidadDto[]>(`${this.base}/disponibilidad`);
  }

  publicarDisponibilidad(payload: PublicarDisponibilidadPayload): Observable<DisponibilidadDto> {
    return this.http.post<DisponibilidadDto>(`${this.base}/disponibilidad`, payload);
  }

  desactivarDisponibilidad(id: string): Observable<DisponibilidadDto> {
    return this.http.patch<DisponibilidadDto>(`${this.base}/disponibilidad/${id}/desactivar`, {});
  }

  listarMaterias(): Observable<{ id: string; codigo: string; nombre: string; activa: boolean }[]> {
    return this.http.get<{ id: string; codigo: string; nombre: string; activa: boolean }[]>(
      `${this.base}/catalogos/materias`,
      { params: { soloActivas: 'true' } },
    );
  }
}
