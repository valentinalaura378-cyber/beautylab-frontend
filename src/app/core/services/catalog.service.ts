import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../config';
import { Brand, Category, Product, Tag } from '../models';

/** Categorías, marcas, productos y etiquetas (el catálogo de BeautyLab). */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);

  readonly categories = signal<Category[]>([]);
  private categoriesLoaded = false;

  /** Carga las categorías una sola vez y las deja disponibles en el signal. */
  loadCategories(force = false) {
    if (this.categoriesLoaded && !force) return;
    this.categoriesLoaded = true;
    this.http.get<Category[]>(`${API_URL}/categories`).subscribe({
      next: (list) => this.categories.set(list),
      error: () => (this.categoriesLoaded = false),
    });
  }

  categoryOf(id: string): Category | undefined {
    return this.categories().find((c) => c._id === id);
  }

  getBrands() {
    return this.http.get<Brand[]>(`${API_URL}/brands`);
  }

  getProducts(filters: { search?: string; category?: string; brand?: string } = {}) {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.brand) params = params.set('brand', filters.brand);
    return this.http.get<Product[]>(`${API_URL}/products`, { params });
  }

  getTags() {
    return this.http.get<Tag[]>(`${API_URL}/tags`);
  }
}
