import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Role, User } from '../../core/models';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { errorMessage } from '../../core/services/errors';
import { ToastService } from '../../core/services/toast.service';

interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'url';
  required?: boolean;
}

interface SectionConfig {
  id: string;
  title: string;
  endpoint: string;
  singular: string;
  fields: FieldConfig[];
  canCreate: boolean;
}

type Row = Record<string, unknown> & { _id: string };

/** Panel de administración: el CRUD del catálogo (antes pantallas separadas de marcas, categorías y productos). */
@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private admin = inject(AdminService);
  private catalog = inject(CatalogService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  protected readonly sections: SectionConfig[] = [
    {
      id: 'categories', title: 'Categorías', endpoint: 'categories', singular: 'categoría', canCreate: true,
      fields: [
        { key: 'icon', label: 'Ícono (emoji)' },
        { key: 'name', label: 'Nombre', required: true },
        { key: 'description', label: 'Descripción' },
      ],
    },
    {
      id: 'brands', title: 'Marcas', endpoint: 'brands', singular: 'marca', canCreate: true,
      fields: [
        { key: 'name', label: 'Nombre', required: true },
        { key: 'country', label: 'País' },
      ],
    },
    {
      id: 'products', title: 'Productos', endpoint: 'products', singular: 'producto', canCreate: true,
      fields: [
        { key: 'name', label: 'Nombre', required: true },
        { key: 'brand', label: 'Marca', required: true },
        { key: 'category', label: 'Categoría', required: true },
        { key: 'price', label: 'Precio', type: 'number' },
        { key: 'description', label: 'Descripción' },
      ],
    },
    {
      id: 'tags', title: 'Etiquetas', endpoint: 'tags', singular: 'etiqueta', canCreate: true,
      fields: [
        { key: 'name', label: 'Nombre', required: true },
        { key: 'color', label: 'Color (#hex)' },
      ],
    },
  ];

  protected active = signal<string>('categories');
  protected rows = signal<Row[]>([]);
  protected users = signal<User[]>([]);
  protected loading = signal(false);

  protected form: Record<string, string> = {};
  protected editingId = signal<string | null>(null);

  ngOnInit(): void {
    this.select('categories');
  }

  protected section(): SectionConfig | undefined {
    return this.sections.find((s) => s.id === this.active());
  }

  protected select(id: string) {
    this.active.set(id);
    this.resetForm();
    this.loading.set(true);

    if (id === 'users') {
      this.admin.users().subscribe({
        next: (list) => {
          this.users.set(list);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
      return;
    }

    const config = this.section();
    if (!config) return;
    this.admin.list<Row>(config.endpoint).subscribe({
      next: (list) => {
        this.rows.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected cell(row: Row, key: string): string {
    const value = row[key];
    return value === undefined || value === null ? '' : String(value);
  }

  protected resetForm() {
    this.form = {};
    this.editingId.set(null);
  }

  protected edit(row: Row) {
    const config = this.section();
    if (!config) return;
    this.editingId.set(row._id);
    this.form = {};
    for (const f of config.fields) this.form[f.key] = this.cell(row, f.key);
  }

  protected save() {
    const config = this.section();
    if (!config) return;

    const body: Record<string, unknown> = {};
    for (const f of config.fields) {
      const raw = (this.form[f.key] ?? '').trim();
      if (f.required && !raw) {
        this.toast.info(`Completa el campo "${f.label}".`);
        return;
      }
      if (raw) body[f.key] = f.type === 'number' ? Number(raw) : raw;
    }

    const id = this.editingId();
    const request = id
      ? this.admin.update<Row>(config.endpoint, id, body)
      : this.admin.create<Row>(config.endpoint, body);

    request.subscribe({
      next: () => {
        this.toast.success(id ? 'Cambios guardados' : `${config.singular} creada`);
        if (config.endpoint === 'categories') this.catalog.loadCategories(true);
        this.select(config.id);
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected remove(row: Row) {
    const config = this.section();
    if (!config || !confirm('¿Eliminar este elemento?')) return;
    this.admin.remove(config.endpoint, row._id).subscribe({
      next: () => {
        this.toast.success('Eliminado');
        if (config.endpoint === 'categories') this.catalog.loadCategories(true);
        this.select(config.id);
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected changeRole(user: User, role: string) {
    this.admin.changeRole(user.id, role as Role).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
        this.toast.success('Rol actualizado');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }
}
