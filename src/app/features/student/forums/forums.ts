import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Forum } from './community.models';
import { ForumsListComponent } from './components/forums-list/forums-list.component';
import { ForumDetailComponent } from './components/forum-detail/forum-detail.component';

@Component({
  selector: 'eci-forums',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ForumsListComponent, ForumDetailComponent],
  templateUrl: './forums.html',
  styleUrl: './forums.css',
})
export class ForumsComponent {
  protected readonly selectedForumId = signal<string | null>(null);

  protected selectForum(forum: Forum): void {
    this.selectedForumId.set(forum.id);
  }

  protected back(): void {
    this.selectedForumId.set(null);
  }
}
