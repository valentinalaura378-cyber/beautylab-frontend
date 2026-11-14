import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/services/catalog.service';
import { TutorialsService } from '../../core/services/tutorials.service';

@Component({
  selector: 'app-categories',
  imports: [RouterLink],
  template: `
    <div class="page">
      <div class="container">
        <div class="page-header">
          <h1>Categorías</h1>
          <p>Elige una técnica o zona del rostro y empieza a aprender.</p>
        </div>

        @if (catalog.categories().length === 0) {
          <div class="empty"><span class="emoji">🗂️</span>Todavía no hay categorías.</div>
        } @else {
          <div class="grid">
            @for (c of catalog.categories(); track c._id) {
              <a class="card cat" routerLink="/explorar" [queryParams]="{ categoryId: c._id }">
                <span class="icon">{{ c.icon || '💄' }}</span>
                <div>
                  <h3>{{ c.name }}</h3>
                  <p class="muted small">{{ c.description }}</p>
                  <span class="badge">{{ counts()[c._id] ?? 0 }} tutoriales</span>
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .cat { display: flex; gap: 1rem; align-items: flex-start; color: var(--ink); transition: transform .2s; }
    .cat:hover { transform: translateY(-3px); text-decoration: none; }
    .icon { font-size: 2.4rem; }
    h3 { margin-bottom: .2rem; }
    p { margin-bottom: .5rem; }
  `,
})
export class Categories implements OnInit {
  protected catalog = inject(CatalogService);
  private tutorials = inject(TutorialsService);
  protected counts = signal<Record<string, number>>({});

  ngOnInit(): void {
    this.catalog.loadCategories();
    this.tutorials.categoryCounts().subscribe({
      next: (c) => this.counts.set(c),
      error: () => this.counts.set({}),
    });
  }
}
