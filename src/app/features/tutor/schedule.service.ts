import { Injectable, computed, inject } from '@angular/core';
import { TutorSession } from './tutor.models';
import { TutoringMockService } from './tutoring.service';

function addMinutes(time: string, minutes: number): string {
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const total = hour * 60 + minute + minutes;
  return `${Math.floor(total / 60)}`.padStart(2, '0') + `:${total % 60}`.padStart(2, '0');
}

/** Adaptador de horarios de tutoria sobre el mock central. */
@Injectable({ providedIn: 'root' })
export class TutorScheduleService {
  private readonly tutoring = inject(TutoringMockService);

  readonly sessions = computed<TutorSession[]>(() =>
    this.tutoring.tutorAvailabilities()
      .filter((availability) => availability.status === 'active')
      .map((availability) => ({
        id: availability.id,
        subject: this.tutoring.subjectName(availability.subjectId),
        datetime: `${availability.date}T${availability.startTime}`,
        seats: this.tutoring.availableSeats(availability.id),
        mode: availability.mode,
      })),
  );
  readonly upcomingCount = computed(() => this.sessions().length);

  create(subject: string, datetime: string, seats: number): void {
    const subjectId =
      this.tutoring.subjects().find((item) => item.name === subject || item.id === subject)?.id ??
      this.tutoring.subjects()[0]?.id ??
      '';
    const [date = '', time = ''] = datetime.split('T');
    if (!subjectId || !date || !time) {
      return;
    }
    this.tutoring.createAvailability({
      subjectId,
      date,
      startTime: time,
      endTime: addMinutes(time, 90),
      mode: 'virtual',
      capacity: seats,
    });
  }

  cancel(id: string): void {
    const result = this.tutoring.deleteAvailability(id);
    if (!result.ok) {
      this.tutoring.cancelAvailability(id, 'Cancelacion operativa');
    }
  }
}
