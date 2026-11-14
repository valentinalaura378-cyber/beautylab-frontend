import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KitItem, Product } from '../../core/models';
import { CatalogService } from '../../core/services/catalog.service';
import { errorMessage } from '../../core/services/errors';
import { LearningService } from '../../core/services/learning.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-my-kit',
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="container narrow">
        <div class="page-header">
          <h1>Mi kit de maquillaje 🧴</h1>
          <p>Lleva el control de los productos que ya tienes y compáralos con los de cada tutorial.</p>
        </div>

        <div class="card add">
          <input class="input" list="catalog-products" placeholder="Producto (escribe o elige del catálogo)"
                 [(ngModel)]="productName" (keyup.enter)="add()" />
          <datalist id="catalog-products">
            @for (p of products(); track p._id) { <option [value]="p.name"></option> }
          </datalist>
          <input class="input qty" type="number" min="1" [(ngModel)]="quantity" aria-label="Cantidad" />
          <input class="input" placeholder="Notas (tono, fecha, etc.)" [(ngModel)]="notes" (keyup.enter)="add()" />
          <button type="button" class="btn btn-primary" (click)="add()">Agregar</button>
        </div>

        @if (loading()) {
          <div class="loading">Cargando…</div>
        } @else if (items().length === 0) {
          <div class="empty"><span class="emoji">💼</span>Tu kit está vacío. Agrega tu primer producto.</div>
        } @else {
          <div class="stack">
            @for (item of items(); track item._id) {
              <div class="card row between">
                @if (editingId() === item._id) {
                  <input class="input" [(ngModel)]="editName" />
                  <input class="input qty" type="number" min="1" [(ngModel)]="editQty" />
                  <input class="input" [(ngModel)]="editNotes" />
                  <span class="row">
                    <button type="button" class="btn btn-primary btn-sm" (click)="saveEdit(item)">Guardar</button>
                    <button type="button" class="btn btn-ghost btn-sm" (click)="editingId.set(null)">Cancelar</button>
                  </span>
                } @else {
                  <div>
                    <strong>{{ item.productName }}</strong>
                    <span class="badge qty-badge">x{{ item.quantity }}</span>
                    @if (item.notes) { <div class="muted small">{{ item.notes }}</div> }
                  </div>
                  <span class="row">
                    <button type="button" class="btn btn-ghost btn-sm" (click)="startEdit(item)">Editar</button>
                    <button type="button" class="btn btn-danger btn-sm" (click)="remove(item)">Quitar</button>
                  </span>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .narrow { max-width: 820px; }
    .add { display: grid; grid-template-columns: 2fr 90px 2fr auto; gap: .6rem; margin-bottom: 1.5rem; }
    .qty { max-width: 100px; }
    .qty-badge { margin-left: .5rem; }
    @media (max-width: 700px) { .add { grid-template-columns: 1fr; } .qty { max-width: none; } }
  `,
})
export class MyKit implements OnInit {
  private learning = inject(LearningService);
  private catalog = inject(CatalogService);
  private toast = inject(ToastService);

  protected items = signal<KitItem[]>([]);
  protected products = signal<Product[]>([]);
  protected loading = signal(true);
  protected editingId = signal<string | null>(null);

  protected productName = '';
  protected quantity = 1;
  protected notes = '';
  protected editName = '';
  protected editQty = 1;
  protected editNotes = '';

  ngOnInit(): void {
    this.catalog.getProducts().subscribe((p) => this.products.set(p));
    this.learning.kit().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected add() {
    const name = this.productName.trim();
    if (name.length < 2) {
      this.toast.info('Escribe el nombre del producto.');
      return;
    }
    this.learning.addKitItem({ productName: name, quantity: Number(this.quantity) || 1, notes: this.notes.trim() || undefined }).subscribe({
      next: (item) => {
        this.items.update((list) => [...list, item].sort((a, b) => a.productName.localeCompare(b.productName)));
        this.productName = '';
        this.quantity = 1;
        this.notes = '';
        this.toast.success('Producto agregado a tu kit');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected startEdit(item: KitItem) {
    this.editingId.set(item._id);
    this.editName = item.productName;
    this.editQty = item.quantity;
    this.editNotes = item.notes ?? '';
  }

  protected saveEdit(item: KitItem) {
    const body = { productName: this.editName.trim(), quantity: Number(this.editQty) || 1, notes: this.editNotes.trim() };
    this.learning.updateKitItem(item._id, body).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((i) => (i._id === item._id ? updated : i)));
        this.editingId.set(null);
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected remove(item: KitItem) {
    if (!confirm(`¿Quitar "${item.productName}" de tu kit?`)) return;
    this.learning.removeKitItem(item._id).subscribe({
      next: () => this.items.update((list) => list.filter((i) => i._id !== item._id)),
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }
}
