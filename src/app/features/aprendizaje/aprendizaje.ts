import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { SectionTabsComponent, SectionTab } from '../../shared/ui/section-tabs/section-tabs';
import { CollectionsComponent } from './collections/collections';
import { StudySessionComponent } from './study/study-session';
import { StatsComponent } from './stats/stats';

/** Sección "Aprendizaje": flash cards con repetición espaciada (ECIWISE-STUDY). */
@Component({
  selector: 'eci-aprendizaje',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SectionTabsComponent,
    CollectionsComponent,
    StudySessionComponent,
    StatsComponent,
  ],
  template: `
    <div class="eci-fit">
      <eci-page-header titleKey="aprendizaje.title" icon="aprendizaje" />
      <div class="eci-fit__chrome">
        <eci-section-tabs [tabs]="tabs" [(active)]="active" />
      </div>
      <div class="eci-fit__body">
        @switch (active()) {
          @case ('collections') {
            <eci-aprendizaje-collections />
          }
          @case ('study') {
            <eci-aprendizaje-study />
          }
          @case ('stats') {
            <eci-aprendizaje-stats />
          }
        }
      </div>
    </div>
  `,
})
export class AprendizajeComponent {
  protected readonly active = signal('collections');
  protected readonly tabs: readonly SectionTab[] = [
    { id: 'collections', labelKey: 'aprendizaje.tab.collections', icon: 'study' },
    { id: 'study', labelKey: 'aprendizaje.tab.study', icon: 'aprendizaje' },
    { id: 'stats', labelKey: 'aprendizaje.tab.stats', icon: 'trophy' },
  ];
}
