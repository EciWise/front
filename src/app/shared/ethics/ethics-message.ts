import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LucideAngularModule, ShieldCheck } from '@lucide/angular';

/** Mensaje de esfuerzo y ética visible para todos los roles. */
@Component({
  selector: 'eci-ethics-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideAngularModule],
  template: `
    <aside class="ethics" role="note" [attr.aria-label]="'ethics.title' | translate">
      <lucide-icon [img]="shield" class="ethics__icon" [size]="22" aria-hidden="true" />
      <div>
        <h2 class="ethics__title">{{ 'ethics.title' | translate }}</h2>
        <p class="ethics__text">{{ 'ethics.message' | translate }}</p>
      </div>
    </aside>
  `,
  styleUrl: './ethics-message.css',
})
export class EthicsMessageComponent {
  protected readonly shield = ShieldCheck;
}
