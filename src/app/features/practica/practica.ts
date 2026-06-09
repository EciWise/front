import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header';
import { SectionTabsComponent, SectionTab } from '../../shared/ui/section-tabs/section-tabs';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models/role.enum';
import { QuizPlayComponent } from './play/quiz-play';
import { QuizHistoryComponent } from './history/quiz-history';
import { QuizLeaderboardComponent } from './leaderboard/quiz-leaderboard';
import { QuestionsAdminComponent } from './questions/questions-admin';
import { QuestionCollectionsComponent } from './collections/question-collections';
import { SubjectsAdminComponent } from './subjects/subjects-admin';

/** Identificadores estables de cada pestaña de la sección Práctica. */
type PracticaTab =
  | 'play'
  | 'history'
  | 'leaderboard'
  | 'questions'
  | 'collections'
  | 'subjects';

const TAB_DEFS: Readonly<Record<PracticaTab, SectionTab>> = {
  play: { id: 'play', labelKey: 'practica.tab.play', icon: 'games' },
  questions: { id: 'questions', labelKey: 'practica.tab.questions', icon: 'file' },
  collections: { id: 'collections', labelKey: 'practica.tab.collections', icon: 'study' },
  subjects: { id: 'subjects', labelKey: 'practica.tab.subjects', icon: 'materials' },
  history: { id: 'history', labelKey: 'practica.tab.history', icon: 'history' },
  leaderboard: { id: 'leaderboard', labelKey: 'practica.tab.leaderboard', icon: 'trophy' },
};

/** Pestañas disponibles por rol (Jugar + autoría según rol). */
const TABS_BY_ROLE: Readonly<Record<Role, readonly PracticaTab[]>> = {
  [Role.Student]: ['play', 'history', 'leaderboard'],
  [Role.Tutor]: ['questions', 'collections', 'play', 'history', 'leaderboard'],
  [Role.Admin]: ['subjects', 'questions', 'collections', 'play', 'leaderboard', 'history'],
};

/**
 * Sección "Práctica": sistema de quiz de ECIWISE-STUDY (Parcial / Repaso /
 * Supervivencia, banco de preguntas, colecciones, historial y ranking). Las
 * pestañas se adaptan al rol del usuario.
 */
@Component({
  selector: 'eci-practica',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    SectionTabsComponent,
    QuizPlayComponent,
    QuizHistoryComponent,
    QuizLeaderboardComponent,
    QuestionsAdminComponent,
    QuestionCollectionsComponent,
    SubjectsAdminComponent,
  ],
  templateUrl: './practica.html',
})
export class PracticaComponent {
  private readonly auth = inject(AuthService);

  protected readonly tabs = computed<readonly SectionTab[]>(() => {
    const role = this.auth.role();
    const ids = role ? TABS_BY_ROLE[role] : [];
    return ids.map((id) => TAB_DEFS[id]);
  });

  protected readonly active = signal<string>('play');

  constructor() {
    // Asegura que la pestaña activa pertenezca al rol actual.
    effect(() => {
      const tabs = this.tabs();
      if (tabs.length && !tabs.some((t) => t.id === this.active())) {
        this.active.set(tabs[0].id);
      }
    });
  }
}
