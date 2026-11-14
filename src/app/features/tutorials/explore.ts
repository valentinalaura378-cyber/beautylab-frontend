import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LEVELS } from '../../core/labels';
import { Paged, Tutorial } from '../../core/models';
import { CatalogService } from '../../core/services/catalog.service';
import { TutorialsService } from '../../core/services/tutorials.service';
import { TutorialCard } from '../../shared/components/tutorial-card';

@Component({
  selector: 'app-explore',
  imports: [FormsModule, TutorialCard],
  templateUrl: './explore.html',
})
export class Explore {
  protected catalog = inject(CatalogService);
  private tutorials = inject(TutorialsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly levels = LEVELS;
  protected result = signal<Paged<Tutorial> | null>(null);
  protected loading = signal(true);
  protected failed = signal(false);

  protected search = '';
  protected categoryId = '';
  protected level = '';
  protected sort = 'recent';
  protected authorId = '';
  protected page = 1;

  constructor() {
    // Los filtros viven en la URL: así se pueden compartir y el botón "atrás" funciona.
    this.route.queryParamMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((p) => {
      this.search = p.get('search') ?? '';
      this.categoryId = p.get('categoryId') ?? '';
      this.level = p.get('level') ?? '';
      this.sort = p.get('sort') ?? 'recent';
      this.authorId = p.get('authorId') ?? '';
      this.page = Number(p.get('page')) || 1;
      this.load();
    });
  }

  private load() {
    this.loading.set(true);
    this.failed.set(false);
    this.tutorials
      .list({
        search: this.search.trim(),
        categoryId: this.categoryId,
        level: this.level,
        sort: this.sort,
        authorId: this.authorId,
        page: this.page,
        limit: 9,
      })
      .subscribe({
        next: (res) => {
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }

  protected apply(page = 1) {
    this.router.navigate([], {
      queryParams: {
        search: this.search.trim() || null,
        categoryId: this.categoryId || null,
        level: this.level || null,
        sort: this.sort !== 'recent' ? this.sort : null,
        authorId: this.authorId || null,
        page: page > 1 ? page : null,
      },
    });
  }

  protected clear() {
    this.router.navigate([], { queryParams: {} });
  }

  protected hasFilters(): boolean {
    return !!(this.search || this.categoryId || this.level || this.authorId);
  }
}
