import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LEVELS } from '../../core/labels';
import { Level, Product, Tag, TutorialInput } from '../../core/models';
import { CatalogService } from '../../core/services/catalog.service';
import { errorMessage } from '../../core/services/errors';
import { ToastService } from '../../core/services/toast.service';
import { TutorialsService } from '../../core/services/tutorials.service';

interface StepForm {
  title: string;
  description: string;
  imageUrl: string;
  tip: string;
}

const emptyStep = (): StepForm => ({ title: '', description: '', imageUrl: '', tip: '' });

@Component({
  selector: 'app-tutorial-form',
  imports: [FormsModule, RouterLink],
  templateUrl: './tutorial-form.html',
  styleUrl: './tutorial-form.scss',
})
export class TutorialForm implements OnInit {
  protected catalog = inject(CatalogService);
  private tutorials = inject(TutorialsService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected readonly levels = LEVELS;
  protected editingId = signal<string | null>(null);
  protected loading = signal(false);
  protected saving = signal(false);
  protected error = signal('');

  protected products = signal<Product[]>([]);
  protected tagSuggestions = signal<Tag[]>([]);

  protected title = '';
  protected summary = '';
  protected description = '';
  protected level: Level = 'beginner';
  protected categoryId = '';
  protected style = '';
  protected durationMinutes: number | null = null;
  protected coverImage = '';
  protected videoUrl = '';
  protected tagsText = '';
  protected status: 'draft' | 'published' = 'published';
  protected selectedProducts = signal<string[]>([]);
  protected steps = signal<StepForm[]>([emptyStep()]);

  ngOnInit(): void {
    this.catalog.loadCategories();
    this.catalog.getProducts().subscribe((p) => this.products.set(p));
    this.catalog.getTags().subscribe((t) => this.tagSuggestions.set(t));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId.set(id);
      this.loading.set(true);
      this.tutorials.get(id).subscribe({
        next: (t) => {
          this.title = t.title;
          this.summary = t.summary;
          this.description = t.description ?? '';
          this.level = t.level;
          this.categoryId = t.categoryId;
          this.style = t.style ?? '';
          this.durationMinutes = t.durationMinutes ?? null;
          this.coverImage = t.coverImage ?? '';
          this.videoUrl = t.videoUrl ?? '';
          this.tagsText = t.tags.join(', ');
          this.status = t.status;
          this.selectedProducts.set(t.productIds);
          this.steps.set(
            t.steps.map((s) => ({ title: s.title, description: s.description, imageUrl: s.imageUrl ?? '', tip: s.tip ?? '' })),
          );
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('No se pudo cargar el tutorial para editarlo.');
        },
      });
    }
  }

  // ---------- Pasos ----------
  protected addStep() {
    this.steps.update((list) => [...list, emptyStep()]);
  }

  protected removeStep(index: number) {
    this.steps.update((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  }

  protected moveStep(index: number, direction: -1 | 1) {
    this.steps.update((list) => {
      const target = index + direction;
      if (target < 0 || target >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  // ---------- Productos y etiquetas ----------
  protected toggleProduct(id: string) {
    this.selectedProducts.update((list) => (list.includes(id) ? list.filter((p) => p !== id) : [...list, id]));
  }

  protected addTag(name: string) {
    const current = this.tagList();
    if (!current.includes(name)) this.tagsText = [...current, name].join(', ');
  }

  private tagList(): string[] {
    return this.tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length >= 2);
  }

  // ---------- Guardar ----------
  protected save() {
    this.error.set('');

    const steps = this.steps().map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
      imageUrl: s.imageUrl.trim() || undefined,
      tip: s.tip.trim() || undefined,
    }));

    if (this.title.trim().length < 5) {
      this.fail('El título debe tener mínimo 5 caracteres.');
      return;
    }
    if (this.summary.trim().length < 10) {
      this.fail('El resumen debe tener mínimo 10 caracteres.');
      return;
    }
    if (!this.categoryId) {
      this.fail('Elige una categoría.');
      return;
    }
    const badStep = steps.findIndex((s) => s.title.length < 2 || s.description.length < 5);
    if (badStep >= 0) {
      this.fail(`Completa el título y la descripción del paso ${badStep + 1}.`);
      return;
    }

    const body: TutorialInput = {
      title: this.title.trim(),
      summary: this.summary.trim(),
      description: this.description.trim() || undefined,
      level: this.level,
      categoryId: this.categoryId,
      style: this.style.trim() || undefined,
      durationMinutes: this.durationMinutes ? Number(this.durationMinutes) : undefined,
      coverImage: this.coverImage.trim(),
      videoUrl: this.videoUrl.trim(),
      steps,
      productIds: this.selectedProducts(),
      tags: this.tagList(),
      status: this.status,
    };

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.tutorials.update(id, body) : this.tutorials.create(body);
    request.subscribe({
      next: (t) => {
        this.saving.set(false);
        this.toast.success(id ? 'Tutorial actualizado' : '¡Tutorial publicado!');
        this.router.navigate(['/tutoriales', t._id]);
      },
      error: (err) => {
        this.saving.set(false);
        this.fail(errorMessage(err, 'No se pudo guardar el tutorial.'));
      },
    });
  }

  private fail(message: string): void {
    this.error.set(message);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
