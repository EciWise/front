import { Injectable, computed, inject } from '@angular/core';
import { Tutoria } from './tutoria.model';
import { TutoringMockService } from '../../tutor/tutoring.service';

/** Catalogo mock de tutorias y solicitudes del estudiante. */
@Injectable({ providedIn: 'root' })
export class TutoriasService {
  private readonly tutoring = inject(TutoringMockService);

  readonly items = computed<Tutoria[]>(() =>
    this.tutoring.slots().map((slot) => ({
      id: slot.availability.id,
      tutorId: slot.tutor.id,
      subjectId: slot.subject.id,
      subject: slot.subject.name,
      tutor: slot.tutor.name,
      datetime: `${slot.availability.date}T${slot.availability.startTime}:00`,
      seats: slot.availableSeats,
      status: slot.userReservation ? 'requested' : 'available',
      mode: slot.availability.mode,
    })),
  );

  request(id: string): void {
    const slot = this.tutoring.slots().find((item) => item.availability.id === id);
    if (!slot || slot.userReservation) {
      return;
    }
    this.tutoring.reserve(id, {
      specificTopic: 'Tema por definir',
      description: 'Reserva creada desde el listado rapido.',
      mode: slot.availability.mode,
    });
  }
}
