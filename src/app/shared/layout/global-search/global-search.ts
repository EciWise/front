import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { LucideSearch, LucideX } from '@lucide/angular';
import { AuthService } from '../../../core/auth/auth.service';
import { SearchEntry, searchEntriesFor } from '../nav-items';
import { IconComponent } from '../../ui/icon/icon';

@Component({
  selector: 'eci-global-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, LucideSearch, LucideX, IconComponent],
  templateUrl: './global-search.html',
  styleUrl: './global-search.css',
})
export class GlobalSearchComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly langChange = toSignal(this.translate.onLangChange, { initialValue: null });
  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly open = signal(false);
  protected readonly query = signal('');
  protected readonly activeIndex = signal(-1);

  protected readonly results = computed<readonly SearchEntry[]>(() => {
    this.langChange();
    const q = this.query().toLowerCase().trim();
    if (!q) return [];
    const role = this.auth.role();
    if (!role) return [];
    return searchEntriesFor(role).filter(
      (item) =>
        this.translate.instant(item.labelKey).toLowerCase().includes(q) ||
        (item.parentLabelKey &&
          this.translate.instant(item.parentLabelKey).toLowerCase().includes(q)),
    );
  });

  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.open()) this.positionDropdown();
  }

  openSearch(): void {
    this.open.set(true);
    this.query.set('');
    this.activeIndex.set(-1);
    setTimeout(() => {
      this.positionDropdown();
      this.inputRef()?.nativeElement.focus();
    }, 0);
  }

  close(): void {
    this.open.set(false);
    this.query.set('');
    this.activeIndex.set(-1);
  }

  onInputKeydown(event: KeyboardEvent): void {
    const res = this.results();
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(i + 1, res.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      const idx = this.activeIndex();
      const item = idx >= 0 ? res[idx] : res[0];
      if (item) this.navigateTo(item);
    }
  }

  navigateTo(item: SearchEntry): void {
    this.close();
    this.router.navigate([item.route]).catch(() => undefined);
  }

  onQueryChange(value: string): void {
    this.query.set(value);
    this.activeIndex.set(-1);
  }

  private positionDropdown(): void {
    if (window.innerWidth <= 900) return;
    const host = this.elRef.nativeElement;
    const { bottom, left, width } = host.getBoundingClientRect();
    host.style.setProperty('--dd-top', `${bottom + 8}px`);
    host.style.setProperty('--dd-left', `${left}px`);
    host.style.setProperty('--dd-width', `${width}px`);
  }
}
