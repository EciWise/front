import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { TutorSessionsService } from '../tutor-sessions.service';

/** Historial de tutorías del tutor: participaciones ya cerradas (datos reales). */
@Component({
  selector: 'eci-tutor-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class TutorHistoryComponent implements OnInit {
  private readonly sessions = inject(TutorSessionsService);

  protected readonly entries = this.sessions.pastSessions;
  protected readonly loading = this.sessions.loading;
  protected readonly error = this.sessions.error;

  ngOnInit(): void {
    this.sessions.load();
  }

  statusKey(estado: string): string {
    const map: Record<string, string> = {
      ASISTIDA: 'tutoring.status.completed',
      INASISTIDA: 'tutoring.status.no_show',
      CANCELADA: 'tutoring.status.cancelled',
    };
    return map[estado] ?? estado;
  }

  statusCssValue(estado: string): string {
    const map: Record<string, string> = {
      ASISTIDA: 'completed',
      INASISTIDA: 'no_show',
      CANCELADA: 'cancelled',
    };
    return map[estado] ?? estado.toLowerCase();
  }

  modeKey(modalidad: 'VIRTUAL' | 'PRESENCIAL'): string {
    return modalidad === 'VIRTUAL' ? 'tutoring.modes.virtual' : 'tutoring.modes.presential';
  }
}
