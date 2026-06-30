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

export interface ReservaEstudianteDto {
  readonly id: string;
  readonly tutoriaId: string;
  readonly estadoAsistencia: string;
  readonly temaEspecifico: string | null;
  readonly descripcionDudas: string | null;
  readonly canceladoEn: string | null;
  readonly motivoCancelacion: string | null;
  readonly tutorNombre: string | null;
  readonly tutoria: {
    readonly fecha: string;
    readonly horaInicio: string;
    readonly horaFin: string;
    readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
    readonly materiaId: string;
    readonly materiaCodigo: string;
    readonly materiaNombre: string;
    readonly tutorUserId: string;
    readonly salaCodigo: string | null;
    readonly enlaceVirtual: string | null;
  };
}

export interface TutorSesionParticipanteDto {
  readonly id: string;
  readonly tutoriaId: string;
  readonly estudianteUserId: string;
  readonly estudianteNombre: string | null;
  readonly estadoAsistencia: string;
  readonly temaEspecifico: string | null;
  readonly descripcionDudas: string | null;
  readonly canceladoEn: string | null;
  readonly motivoCancelacion: string | null;
  readonly sesion: {
    readonly fecha: string;
    readonly horaInicio: string;
    readonly horaFin: string;
    readonly modalidad: 'VIRTUAL' | 'PRESENCIAL';
    readonly materiaId: string;
    readonly materiaCodigo: string;
    readonly materiaNombre: string;
    readonly salaCodigo: string | null;
    readonly enlaceVirtual: string | null;
  };
}

export interface SalaDto {
  readonly id: string;
  readonly codigo: string;
  readonly edificio: string | null;
  readonly activa: boolean;
}

export interface MateriaDto {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly activa: boolean;
}

export interface FranjaDto {
  readonly id: string;
  readonly diaSemana: number;
  readonly horaInicio: string;
  readonly horaFin: string;
  readonly orden: number;
  readonly activa: boolean;
}

export interface CrearMateriaPayload {
  readonly codigo: string;
  readonly nombre: string;
}

export interface ActualizarMateriaPayload {
  readonly codigo?: string;
  readonly nombre?: string;
  readonly activa?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TutoringApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(TUTORING_CONFIG);

  private get base(): string {
    return this.config.tutoringApiUrl;
  }

  listarMisReservas(): Observable<ReservaEstudianteDto[]> {
    return this.http.get<ReservaEstudianteDto[]>(`${this.base}/reservas`);
  }

  listarMisSesiones(): Observable<TutorSesionParticipanteDto[]> {
    return this.http.get<TutorSesionParticipanteDto[]>(`${this.base}/reservas/mis-sesiones`);
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

  listarFranjas(): Observable<FranjaDto[]> {
    return this.http.get<FranjaDto[]>(`${this.base}/catalogos/franjas`);
  }

  materializarAhora(): Observable<{ creadas: number; omitidas: number }> {
    return this.http.post<{ creadas: number; omitidas: number }>(`${this.base}/disponibilidad/materializacion`, {});
  }

  publicarDisponibilidad(payload: PublicarDisponibilidadPayload): Observable<DisponibilidadDto> {
    return this.http.post<DisponibilidadDto>(`${this.base}/disponibilidad`, payload);
  }

  editarDisponibilidad(
    id: string,
    payload: Partial<Pick<PublicarDisponibilidadPayload, 'materiaId' | 'salaId' | 'modalidad' | 'cuposMaximos' | 'vigenciaDesde' | 'vigenciaHasta'>>,
  ): Observable<DisponibilidadDto> {
    return this.http.patch<DisponibilidadDto>(`${this.base}/disponibilidad/${id}`, payload);
  }

  desactivarDisponibilidad(id: string): Observable<DisponibilidadDto> {
    return this.http.patch<DisponibilidadDto>(`${this.base}/disponibilidad/${id}/desactivar`, {});
  }

  listarSalas(): Observable<SalaDto[]> {
    return this.http.get<SalaDto[]>(`${this.base}/catalogos/salas`);
  }

  crearSala(payload: { codigo: string; edificio?: string }): Observable<SalaDto> {
    return this.http.post<SalaDto>(`${this.base}/catalogos/salas`, payload);
  }

  actualizarSala(
    id: string,
    payload: { codigo?: string; edificio?: string | null; activa?: boolean },
  ): Observable<SalaDto> {
    return this.http.patch<SalaDto>(`${this.base}/catalogos/salas/${id}`, payload);
  }

  eliminarSala(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/catalogos/salas/${id}`);
  }

  listarMaterias(): Observable<MateriaDto[]> {
    return this.http.get<MateriaDto[]>(
      `${this.base}/catalogos/materias`,
      { params: { soloActivas: 'true' } },
    );
  }

  // ── CRUD de materias (admin) ───────────────────────────────────────────────

  listarTodasMaterias(): Observable<MateriaDto[]> {
    return this.http.get<MateriaDto[]>(`${this.base}/catalogos/materias`);
  }

  crearMateria(payload: CrearMateriaPayload): Observable<MateriaDto> {
    return this.http.post<MateriaDto>(`${this.base}/catalogos/materias`, payload);
  }

  actualizarMateria(id: string, payload: ActualizarMateriaPayload): Observable<MateriaDto> {
    return this.http.patch<MateriaDto>(`${this.base}/catalogos/materias/${id}`, payload);
  }

  eliminarMateria(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/catalogos/materias/${id}`);
  }

  // ── Gestión de materias por tutor (admin) ──────────────────────────────────

  listarMateriasDelTutor(tutorId: string): Observable<{ id: string; codigo: string; nombre: string }[]> {
    return this.http.get<{ id: string; codigo: string; nombre: string }[]>(
      `${this.base}/catalogos/tutor-materias`,
      { params: { tutorUserId: tutorId } },
    );
  }

  asignarMateria(tutorId: string, materiaId: string): Observable<unknown> {
    return this.http.post(`${this.base}/catalogos/tutor-materias`, {
      tutorUserId: tutorId,
      materiaId,
    });
  }

  removerMateria(tutorId: string, materiaId: string): Observable<unknown> {
    return this.http.delete(`${this.base}/catalogos/tutor-materias`, {
      params: { tutorUserId: tutorId, materiaId },
    });
  }
}
