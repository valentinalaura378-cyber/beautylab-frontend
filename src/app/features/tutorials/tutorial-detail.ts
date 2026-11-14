import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { coverGradient } from '../../core/labels';
import { CommentItem, ReviewItem, TutorialDetail } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/community.service';
import { errorMessage } from '../../core/services/errors';
import { LearningService } from '../../core/services/learning.service';
import { ToastService } from '../../core/services/toast.service';
import { TutorialsService } from '../../core/services/tutorials.service';
import { LevelLabelPipe } from '../../shared/pipes/level-label.pipe';
import { StarRating } from '../../shared/components/star-rating';

@Component({
  selector: 'app-tutorial-detail',
  imports: [FormsModule, RouterLink, DatePipe, CurrencyPipe, LevelLabelPipe, StarRating],
  templateUrl: './tutorial-detail.html',
  styleUrl: './tutorial-detail.scss',
})
export class TutorialDetailPage {
  protected auth = inject(AuthService);
  private tutorials = inject(TutorialsService);
  private community = inject(CommunityService);
  private learning = inject(LearningService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  protected tutorial = signal<TutorialDetail | null>(null);
  protected loading = signal(true);
  protected notFound = signal(false);

  protected completed = signal<number[]>([]);
  protected comments = signal<CommentItem[]>([]);
  protected reviews = signal<ReviewItem[]>([]);
  protected isFavorite = signal(false);

  protected newComment = '';
  protected replyTo = signal<string | null>(null);
  protected replyText = '';
  protected myRating = signal(0);
  protected myReviewText = '';

  protected readonly percent = computed(() => {
    const t = this.tutorial();
    if (!t || t.steps.length === 0) return 0;
    return Math.round((this.completed().length / t.steps.length) * 100);
  });

  protected readonly canManage = computed(() => {
    const t = this.tutorial();
    const u = this.auth.user();
    return !!t && !!u && (u.role === 'admin' || u.id === t.authorId);
  });

  protected readonly isAuthor = computed(() => {
    const t = this.tutorial();
    return !!t && this.auth.user()?.id === t.authorId;
  });

  protected readonly rootComments = computed(() => this.comments().filter((c) => !c.parentId));

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((p) => {
      const id = p.get('id');
      if (id) this.load(id);
    });
  }

  private load(id: string) {
    this.loading.set(true);
    this.notFound.set(false);
    this.tutorials.get(id).subscribe({
      next: (t) => {
        this.tutorial.set(t);
        this.loading.set(false);
        this.loadCommunity(id);
        if (this.auth.isLoggedIn()) this.loadPersonal(id);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadCommunity(id: string) {
    this.community.comments(id).subscribe((list) => this.comments.set(list));
    this.community.reviews(id).subscribe((list) => {
      this.reviews.set(list);
      const mine = list.find((r) => r.userId === this.auth.user()?.id);
      this.myRating.set(mine?.rating ?? 0);
      this.myReviewText = mine?.comment ?? '';
    });
  }

  private loadPersonal(id: string) {
    this.learning.progressOf(id).subscribe((p) => this.completed.set(p.completedSteps));
    this.learning.favorites().subscribe((list) => this.isFavorite.set(list.some((t) => t._id === id)));
  }

  protected cover(t: TutorialDetail) {
    return t.coverImage ? null : coverGradient(t._id);
  }

  protected repliesOf(commentId: string) {
    return this.comments().filter((c) => c.parentId === commentId);
  }

  protected canDeleteComment(c: CommentItem): boolean {
    const u = this.auth.user();
    return !!u && (u.role === 'admin' || u.id === c.authorId || u.id === this.tutorial()?.authorId);
  }

  // ---------- Progreso ----------
  protected isDone(order: number): boolean {
    return this.completed().includes(order);
  }

  protected toggleStep(order: number) {
    const t = this.tutorial();
    if (!t) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/acceder'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const previous = this.completed();
    const next = previous.includes(order) ? previous.filter((n) => n !== order) : [...previous, order];
    this.completed.set(next);

    this.learning.saveProgress(t._id, next).subscribe({
      next: (p) => {
        if (p.status === 'completed' && previous.length < t.steps.length) {
          this.toast.success('🎉 ¡Completaste el tutorial! Ahora puedes calificarlo.');
        }
      },
      error: (err) => {
        this.completed.set(previous);
        this.toast.error(errorMessage(err, 'No se pudo guardar tu progreso.'));
      },
    });
  }

  // ---------- Favoritos ----------
  protected toggleFavorite() {
    const t = this.tutorial();
    if (!t) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/acceder'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const request = this.isFavorite() ? this.learning.removeFavorite(t._id) : this.learning.addFavorite(t._id);
    request.subscribe({
      next: () => {
        this.isFavorite.update((v) => !v);
        this.toast.success(this.isFavorite() ? 'Guardado en tus favoritos' : 'Quitado de favoritos');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  // ---------- Comentarios ----------
  protected sendComment(parentId?: string) {
    const t = this.tutorial();
    const message = (parentId ? this.replyText : this.newComment).trim();
    if (!t || !message) return;

    this.community.addComment(t._id, message, parentId).subscribe({
      next: () => {
        if (parentId) {
          this.replyText = '';
          this.replyTo.set(null);
        } else {
          this.newComment = '';
        }
        this.community.comments(t._id).subscribe((list) => this.comments.set(list));
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected deleteComment(id: string) {
    if (!confirm('¿Eliminar este comentario?')) return;
    this.community.deleteComment(id).subscribe({
      next: () => {
        const t = this.tutorial();
        if (t) this.community.comments(t._id).subscribe((list) => this.comments.set(list));
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  // ---------- Reseñas ----------
  protected sendReview() {
    const t = this.tutorial();
    if (!t || this.myRating() < 1) {
      this.toast.info('Elige de 1 a 5 estrellas.');
      return;
    }
    this.community.saveReview(t._id, this.myRating(), this.myReviewText.trim() || undefined).subscribe({
      next: (res) => {
        this.toast.success('¡Gracias por tu valoración!');
        this.tutorial.update((cur) => (cur ? { ...cur, ratingAvg: res.ratingAvg, ratingCount: res.ratingCount } : cur));
        this.community.reviews(t._id).subscribe((list) => this.reviews.set(list));
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  protected deleteReview(id: string) {
    if (!confirm('¿Eliminar esta reseña?')) return;
    const t = this.tutorial();
    this.community.deleteReview(id).subscribe({
      next: () => {
        if (!t) return;
        this.myRating.set(0);
        this.myReviewText = '';
        this.tutorials.get(t._id).subscribe((fresh) => this.tutorial.set(fresh));
        this.community.reviews(t._id).subscribe((list) => this.reviews.set(list));
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }

  // ---------- Gestión del tutorial ----------
  protected deleteTutorial() {
    const t = this.tutorial();
    if (!t || !confirm('¿Eliminar este tutorial? Esta acción no se puede deshacer.')) return;
    this.tutorials.remove(t._id).subscribe({
      next: () => {
        this.toast.success('Tutorial eliminado');
        this.router.navigate(['/mi-aprendizaje']);
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }
}
