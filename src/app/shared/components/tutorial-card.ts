import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tutorial } from '../../core/models';
import { CatalogService } from '../../core/services/catalog.service';
import { coverGradient } from '../../core/labels';
import { LevelLabelPipe } from '../pipes/level-label.pipe';
import { StarRating } from './star-rating';

@Component({
  selector: 'app-tutorial-card',
  imports: [RouterLink, LevelLabelPipe, StarRating],
  template: `
    <article class="tcard">
      <a class="cover" [routerLink]="['/tutoriales', tutorial()._id]"
         [style.background-image]="tutorial().coverImage ? 'url(' + tutorial().coverImage + ')' : null"
         [style.background]="tutorial().coverImage ? null : gradient()">
        @if (!tutorial().coverImage) {
          <span class="emoji">{{ category()?.icon || '💄' }}</span>
        }
        <span class="badge level" [class]="tutorial().level">{{ tutorial().level | levelLabel }}</span>
        @if (tutorial().status === 'draft') {
          <span class="badge draft state">Borrador</span>
        }
      </a>
      <div class="body">
        @if (category(); as c) {
          <span class="cat">{{ c.name }}</span>
        }
        <h3><a [routerLink]="['/tutoriales', tutorial()._id]">{{ tutorial().title }}</a></h3>
        <p class="muted small summary">{{ tutorial().summary }}</p>
        <div class="meta small muted">
          <span>⏱ {{ tutorial().durationMinutes ?? '—' }} min</span>
          <span>📋 {{ tutorial().steps.length }} pasos</span>
        </div>
        <div class="foot">
          <a class="author small" [routerLink]="['/explorar']" [queryParams]="{ authorId: tutorial().authorId }">
            por {{ tutorial().authorName }}
          </a>
          <span class="rating">
            <app-star-rating [value]="tutorial().ratingAvg" />
            <small class="muted">({{ tutorial().ratingCount }})</small>
          </span>
        </div>
      </div>
    </article>
  `,
  styles: `
    .tcard { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
      overflow: hidden; box-shadow: var(--shadow); display: flex; flex-direction: column; height: 100%;
      transition: transform .2s; }
    .tcard:hover { transform: translateY(-4px); }
    .cover { position: relative; height: 150px; display: flex; align-items: center; justify-content: center;
      background-size: cover; background-position: center; text-decoration: none; }
    .emoji { font-size: 3rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,.2)); }
    .level { position: absolute; top: .7rem; left: .7rem; }
    .state { position: absolute; top: .7rem; right: .7rem; }
    .body { padding: 1rem 1.1rem 1.1rem; display: flex; flex-direction: column; gap: .35rem; flex: 1; }
    .cat { font-size: .72rem; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: var(--accent); }
    h3 { font-size: 1.05rem; margin: 0; font-family: var(--font); font-weight: 600; }
    h3 a { color: var(--ink); }
    .summary { margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { display: flex; gap: 1rem; }
    .foot { margin-top: auto; display: flex; justify-content: space-between; align-items: center; padding-top: .5rem; }
    .rating { display: inline-flex; align-items: center; gap: .25rem; }
  `,
})
export class TutorialCard {
  readonly tutorial = input.required<Tutorial>();
  private catalog = inject(CatalogService);

  protected category() {
    return this.catalog.categoryOf(this.tutorial().categoryId);
  }
  protected gradient() {
    return coverGradient(this.tutorial()._id);
  }
}
