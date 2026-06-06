import { Injectable, inject } from '@angular/core';
import { stripTrailingSlashes } from '../config/url.util';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AUTH_CONFIG } from '../auth/auth.config';
import { DatosIa } from './ia.model';

/** Predicción resumida que viaja en la lista de estudiantes. */
export interface PrediccionResumen {
  prediccionRendimiento: string | null;
  prediccionDesercion: string | null;
  confianzaDesercion: number | null;
  probabilidadExito: number | null;
  fechaPrediccion: string | null;
}

/** Estudiante con su predicción (GET /ia/estudiantes). */
export interface EstudianteIa {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  avatar_url: string | null;
  semestre: number;
  datosIa: PrediccionResumen | null;
}

export interface EstudianteDetalle extends Omit<EstudianteIa, 'datosIa'> {
  datosIa: DatosIa | null;
}

/** Media, mediana y moda de una serie de predicciones. */
export interface SerieEstadistica {
  media: number;
  mediana: number;
  moda: number;
  n: number;
}

export interface PlatformStats {
  totalEstudiantes: number;
  conDatos: number;
  conPrediccion: number;
  enRiesgo: number;
  distribucionRendimiento: { grado: string; conteo: number }[];
  // Registro / ingreso de la plataforma
  distribucionRoles: { rol: string; conteo: number }[];
  registrosPorMes: { mes: string; conteo: number }[];
  accesosPorMes: { mes: string; conteo: number }[];
  accesoEstado: { hanIngresado: number; nuncaIngresado: number };
  // Predicciones de IA
  distribucionDesercion: { etiqueta: string; conteo: number }[];
  estadisticasProbabilidadExito: SerieEstadistica;
  estadisticasConfianzaDesercion: SerieEstadistica;
}

export interface UsuarioBasico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Asignacion {
  id: string;
  tutor: UsuarioBasico;
  estudiante: UsuarioBasico;
  createdAt: string;
}

interface Paginated<T> {
  data?: T[];
}

/** IDs de rol sembrados en Prisma. */
const ROL_ESTUDIANTE = 1;
const ROL_TUTOR = 2;

/**
 * Acceso de tutor/admin a las predicciones, estadísticas y asignaciones de IA
 * (wise_auth). El JWT lo añade el `authInterceptor`.
 */
@Injectable({ providedIn: 'root' })
export class IaAdminService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(AUTH_CONFIG);

  private get base(): string {
    return stripTrailingSlashes(this.config.apiBaseUrl);
  }

  /** Estudiantes con predicción (admin: todos; tutor: solo asignados). */
  listStudents(): Observable<EstudianteIa[]> {
    return this.http.get<EstudianteIa[]>(`${this.base}/ia/estudiantes`);
  }

  getStudent(id: string): Observable<EstudianteDetalle> {
    return this.http.get<EstudianteDetalle>(`${this.base}/ia/estudiantes/${id}`);
  }

  platformStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(`${this.base}/ia/estadisticas`);
  }

  // ── Asignaciones (admin) ──
  listAssignments(): Observable<Asignacion[]> {
    return this.http.get<Asignacion[]>(`${this.base}/ia/asignaciones`);
  }

  createAssignment(tutorId: string, estudianteId: string): Observable<unknown> {
    return this.http.post(`${this.base}/ia/asignaciones`, { tutorId, estudianteId });
  }

  deleteAssignment(id: string): Observable<unknown> {
    return this.http.delete(`${this.base}/ia/asignaciones/${id}`);
  }

  listTutors(): Observable<UsuarioBasico[]> {
    return this.usersByRole(ROL_TUTOR);
  }

  listEstudiantes(): Observable<UsuarioBasico[]> {
    return this.usersByRole(ROL_ESTUDIANTE);
  }

  private usersByRole(rolId: number): Observable<UsuarioBasico[]> {
    return this.http
      .get<Paginated<UsuarioBasico>>(
        `${this.base}/gestion-usuarios?page=1&limit=200&rolId=${rolId}`,
      )
      .pipe(map((res) => res.data ?? []));
  }
}
