import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { TutorSessionsService } from '../tutor-sessions.service';

/** Participantes con reserva activa en las próximas sesiones del tutor (lectura). */
@Component({
  selector: 'eci-tutor-requests',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class TutorRequestsComponent implements OnInit {
  private readonly sessions = inject(TutorSessionsService);

  protected readonly participants = this.sessions.upcomingParticipants;
  protected readonly loading = this.sessions.loading;
  protected readonly error = this.sessions.error;

  ngOnInit(): void {
    this.sessions.load();
  }

  modeKey(modalidad: 'VIRTUAL' | 'PRESENCIAL'): string {
    return modalidad === 'VIRTUAL' ? 'tutoring.modes.virtual' : 'tutoring.modes.presential';
  }
}
