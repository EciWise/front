import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AchievementToastService } from '../../../core/gamification/achievement-toast.service';
import { IconComponent } from '../icon/icon';

/**
 * Pila de toasts que aparece al desbloquear un logro. Cada toast usa el icono y
 * color propios del logro, se puede cerrar a mano y se va solo tras unos
 * segundos. Se monta una sola vez en el shell de la app.
 */
@Component({
  selector: 'eci-achievement-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, IconComponent],
  templateUrl: './achievement-toast.html',
  styleUrl: './achievement-toast.css',
})
export class AchievementToastComponent {
  protected readonly service = inject(AchievementToastService);
}
