import { Injectable, computed, inject, signal } from '@angular/core';
import { RequestStatus, TutoringRequest } from './tutor.models';
import { TutoringMockService } from './tutoring.service';

/** Reservas activas del monitor, expuestas como solicitudes para compatibilidad. */
@Injectable({ providedIn: 'root' })
export class TutoringRequestsService {
  private readonly tutoring = inject(TutoringMockService);
  private readonly resolved = signal<Record<string, Exclude<RequestStatus, 'pending'>>>({});

  readonly requests = computed<TutoringRequest[]>(() =>
    this.tutoring.tutorReservations().map((reservation) => {
      const availability = this.tutoring.availabilityById(reservation.availabilityId);
      const student = this.tutoring.studentById(reservation.studentId);
      const resolvedStatus = this.resolved()[reservation.id];
      let status: RequestStatus;
      if (resolvedStatus) {
        status = resolvedStatus;
      } else if (reservation.status === 'confirmed') {
        status = 'pending';
      } else if (reservation.status === 'completed') {
        status = 'accepted';
      } else {
        status = 'rejected';
      }
      return {
        id: reservation.id,
        student: student?.name ?? reservation.studentId,
        subject: this.tutoring.subjectName(reservation.subjectId),
        datetime: availability ? `${availability.date}T${availability.startTime}` : '',
        status,
      };
    }),
  );

  readonly pendingCount = computed(
    () => this.requests().filter((request) => request.status === 'pending').length,
  );

  accept(id: string): void {
    this.resolve(id, 'accepted');
  }

  reject(id: string): void {
    this.resolve(id, 'rejected');
  }

  private resolve(id: string, status: Exclude<RequestStatus, 'pending'>): void {
    const request = this.requests().find((item) => item.id === id);
    if (request?.status !== 'pending') {
      return;
    }
    const attendanceStatus = status === 'accepted' ? 'completed' : 'cancelled';
    this.tutoring.markAttendance(id, attendanceStatus);
    this.resolved.update((items) => ({ ...items, [id]: status }));
  }
}
