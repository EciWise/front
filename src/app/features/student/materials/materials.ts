import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { PageHeaderComponent } from '../../../shared/ui/page-header/page-header';
import { CardComponent } from '../../../shared/ui/card/card';
import { IconComponent } from '../../../shared/ui/icon/icon';
import { MaterialsService } from './materials.service';

/** Catálogo de materiales con búsqueda por título o materia. */
@Component({
  selector: 'eci-materials',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, PageHeaderComponent, CardComponent, IconComponent],
  templateUrl: './materials.html',
  styleUrl: './materials.css',
})
export class MaterialsComponent {
  private readonly service = inject(MaterialsService);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const items = this.service.items();
    if (!q) {
      return items;
    }
    return items.filter(
      (m) => m.title.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q),
    );
  });

  onSearch(value: string): void {
    this.query.set(value);
  }
}
