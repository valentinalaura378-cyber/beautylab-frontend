import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Brand, Category, Product } from '../../core/models';
import { CatalogService } from '../../core/services/catalog.service';

@Component({
  selector: 'app-products',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="page">
      <div class="container">
        <div class="page-header">
          <h1>Productos recomendados</h1>
          <p>Los productos que aparecen en los tutoriales, organizados por categoría y marca.</p>
        </div>

        <div class="card filters">
          <input class="input" type="search" placeholder="Buscar producto…" [(ngModel)]="search" (keyup.enter)="load()" />
          <select class="input" [(ngModel)]="category" (change)="load()">
            <option value="">Todas las categorías</option>
            @for (c of categories(); track c._id) {
              <option [value]="c.name">{{ c.name }}</option>
            }
          </select>
          <select class="input" [(ngModel)]="brand" (change)="load()">
            <option value="">Todas las marcas</option>
            @for (b of brands(); track b._id) {
              <option [value]="b.name">{{ b.name }}</option>
            }
          </select>
          <button type="button" class="btn btn-primary" (click)="load()">Buscar</button>
        </div>

        @if (loading()) {
          <div class="loading">Cargando productos…</div>
        } @else if (products().length === 0) {
          <div class="empty"><span class="emoji">🧴</span>No hay productos con esos filtros.</div>
        } @else {
          <div class="grid">
            @for (p of products(); track p._id) {
              <div class="card">
                <span class="badge">{{ p.category }}</span>
                <h3 class="name">{{ p.name }}</h3>
                <p class="muted small">{{ p.brand }}</p>
                @if (p.description) {
                  <p class="small">{{ p.description }}</p>
                }
                @if (p.price) {
                  <strong>{{ p.price | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</strong>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `.name { margin: .5rem 0 .1rem; font-family: var(--font); font-size: 1.05rem; }`,
})
export class Products implements OnInit {
  private catalog = inject(CatalogService);

  protected products = signal<Product[]>([]);
  protected brands = signal<Brand[]>([]);
  protected categories = signal<Category[]>([]);
  protected loading = signal(true);

  protected search = '';
  protected category = '';
  protected brand = '';

  ngOnInit(): void {
    this.catalog.getBrands().subscribe((b) => this.brands.set(b));
    this.catalog.loadCategories();
    this.categories = this.catalog.categories;
    this.load();
  }

  protected load() {
    this.loading.set(true);
    this.catalog
      .getProducts({ search: this.search.trim(), category: this.category, brand: this.brand })
      .subscribe({
        next: (list) => {
          this.products.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
