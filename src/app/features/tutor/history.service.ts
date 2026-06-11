import { Injectable, inject } from '@angular/core';
import { HistoryEntry } from './tutor.models';
import { TutoringMockService } from './tutoring.service';

/** Historial de tutorias del tutor (mock con signals). */
@Injectable({ providedIn: 'root' })
export class TutorHistoryService {
  private readonly tutoring = inject(TutoringMockService);
  readonly entries = this.tutoring.tutorHistoryEntries;

  add(entry: HistoryEntry): void {
    this.tutoring.addLegacyHistory(entry);
  }
}
