import { Component, input, output } from '@angular/core';

/** Estrellas de valoración. Si es editable, emite la nueva nota al hacer clic. */
@Component({
  selector: 'app-star-rating',
  template: `
    <span class="stars" [class.editable]="editable()">
      @for (star of stars; track star) {
        <button
          type="button"
          class="star"
          [class.on]="star <= value()"
          [disabled]="!editable()"
          [attr.aria-label]="star + ' estrellas'"
          (click)="rate.emit(star)"
        >
          ★
        </button>
      }
    </span>
  `,
  styles: `
    .stars { display: inline-flex; gap: 2px; }
    .star {
      border: none; background: none; padding: 0; font-size: 1.15rem; line-height: 1;
      color: #e2d5dc; cursor: default;
    }
    .star.on { color: #f4a62a; }
    .editable .star { cursor: pointer; font-size: 1.6rem; }
    .editable .star:hover { transform: scale(1.15); }
  `,
})
export class StarRating {
  readonly value = input(0);
  readonly editable = input(false);
  readonly rate = output<number>();
  protected readonly stars = [1, 2, 3, 4, 5];
}
