import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, interval, map, of, tap } from 'rxjs';
import {
  TutoringApiService,
  TutoriaResumenDto,
} from '../../../core/tutoring/tutoring-api.service';
import {
  AcademicSubject,
  ReserveTutoringPayload,
  TutorProfile,
  TutoringActionResult,
  TutoringAvailability,
  TutoringSearchFilters,
  TutoringSlot,
} from '../../tutor/tutor.models';

function dtoToSlot(dto: TutoriaResumenDto, seatsAdjust = 0): TutoringSlot {
  const availability: TutoringAvailability = {
    id: dto.id,
    tutorId: dto.tutorUserId,
    subjectId: dto.materiaId,
    date: dto.fecha,
    startTime: dto.horaInicio,
    endTime: dto.horaFin,
    mode: dto.modalidad === 'VIRTUAL' ? 'virtual' : 'presential',
    capacity: dto.cuposMaximos,
    ...(dto.enlaceVirtual ? { virtualUrl: dto.enlaceVirtual } : {}),
    ...(dto.salaCodigo ? { room: dto.salaCodigo } : {}),
  };
  const subject: AcademicSubject = { id: dto.materiaId, name: dto.materiaNombre };
  const tutor: TutorProfile = { id: dto.tutorUserId, name: dto.tutorNombre ?? 'Monitor' };
  const availableSeats = Math.max(0, dto.cuposDisponibles - seatsAdjust);
  return {
    availability,
    subject,
    tutor,
    reservedSeats: dto.cuposMaximos - dto.cuposDisponibles + seatsAdjust,
    availableSeats,
  };
}

const POLL_INTERVAL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class TutoringSearchService {
  private readonly api = inject(TutoringApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _dtos = signal<TutoriaResumenDto[]>([]);
  private readonly _materias = signal<{ id: string; codigo: string; nombre: string; activa: boolean }[]>([]);
  private readonly _seatAdjust = signal<Record<string, number>>({});
  private readonly _reservedIds = signal<ReadonlySet<string>>(new Set());

  readonly reservedIds = this._reservedIds.asReadonly();

  constructor() {
    this.reload();
    interval(POLL_INTERVAL_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reload());
  }

  reload(): void {
    this.api
      .buscarTutorias()
      .pipe(catchError(() => of([] as TutoriaResumenDto[])))
      .subscribe((data) => {
        this._dtos.set(data);
        this._seatAdjust.set({});
      });

    this.api
      .listarMaterias()
      .pipe(catchError(() => of([])))
      .subscribe((data) => this._materias.set(data));
  }

  readonly slots = computed<TutoringSlot[]>(() => {
    const adj = this._seatAdjust();
    return this._dtos()
      .map((dto) => dtoToSlot(dto, adj[dto.id] ?? 0))
      .filter((s) => s.availableSeats > 0)
      .sort((a, b) =>
        `${a.availability.date}T${a.availability.startTime}`.localeCompare(
          `${b.availability.date}T${b.availability.startTime}`,
        ),
      );
  });

  readonly subjects = computed<AcademicSubject[]>(() =>
    this._materias().map((m) => ({ id: m.id, name: m.nombre })),
  );

  readonly tutors = computed<TutorProfile[]>(() => {
    const seen = new Set<string>();
    const result: TutorProfile[] = [];
    for (const dto of this._dtos()) {
      if (!seen.has(dto.tutorUserId)) {
        seen.add(dto.tutorUserId);
        result.push({ id: dto.tutorUserId, name: dto.tutorNombre ?? 'Monitor' });
      }
    }
    return result;
  });

  searchSlots(filters: TutoringSearchFilters): TutoringSlot[] {
    return this.slots().filter((slot) => {
      const a = slot.availability;
      return (
        (!filters.subjectId || a.subjectId === filters.subjectId) &&
        (!filters.tutorId || a.tutorId === filters.tutorId) &&
        (!filters.mode || a.mode === filters.mode) &&
        (!filters.date || a.date === filters.date) &&
        (!filters.time || (a.startTime <= filters.time && a.endTime > filters.time))
      );
    });
  }

  reserve(slot: TutoringSlot, payload: ReserveTutoringPayload): Observable<TutoringActionResult> {
    return this.api
      .reservar({
        tutoriaId: slot.availability.id,
        temaEspecifico: payload.specificTopic,
        descripcionDudas: payload.description,
      })
      .pipe(
        tap(() => {
          this._seatAdjust.update((a) => ({ ...a, [slot.availability.id]: (a[slot.availability.id] ?? 0) + 1 }));
          this._reservedIds.update((s) => new Set([...s, slot.availability.id]));
        }),
        map((): TutoringActionResult => ({ ok: true })),
        catchError((err): Observable<TutoringActionResult> => {
          const backendMsg = (err as { error?: { message?: string } })?.error?.message;
          return of({ ok: false, errorKey: backendMsg ?? 'tutoring.errors.generic' });
        }),
      );
  }
}
