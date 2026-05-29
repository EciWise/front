import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';

interface StudyGroup {
  readonly id: string;
  readonly name: string;
  readonly subject: string;
  readonly members: number;
}

/** Centro de estudios: recursos y grupos de estudio (mock). */
@Component({
  selector: 'eci-study',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageHeaderComponent, CardComponent, ButtonComponent],
  template: `
    <eci-page-header titleKey="study.title" icon="study" />
    <h2 class="study__heading">{{ 'study.groups' | translate }}</h2>
    <ul class="study__list">
      @for (group of groups; track group.id) {
        <li>
          <eci-card>
            <div class="study__group">
              <div>
                <h3 class="study__name">{{ group.name }}</h3>
                <p class="study__meta">
                  {{ group.subject }} ·
                  {{ 'study.members' | translate: { count: group.members } }}
                </p>
              </div>
              <eci-button variant="secondary">{{ 'study.join' | translate }}</eci-button>
            </div>
          </eci-card>
        </li>
      }
    </ul>
  `,
  styleUrl: './study.css',
})
export class StudyComponent {
  protected readonly groups: readonly StudyGroup[] = [
    { id: 's1', name: 'Cálculo sin miedo', subject: 'Cálculo', members: 12 },
    { id: 's2', name: 'Code & Coffee', subject: 'Programación', members: 8 },
    { id: 's3', name: 'Física aplicada', subject: 'Física', members: 5 },
  ];
}
