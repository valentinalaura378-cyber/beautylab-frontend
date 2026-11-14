import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { CommentItem, ReviewItem } from '../models';

/** Comentarios (preguntas y respuestas) y reseñas de los tutoriales. */
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private http = inject(HttpClient);

  comments(tutorialId: string) {
    return this.http.get<CommentItem[]>(`${API_URL}/comments/tutorial/${tutorialId}`);
  }

  addComment(tutorialId: string, message: string, parentId?: string) {
    return this.http.post<CommentItem>(`${API_URL}/comments`, { tutorialId, message, parentId });
  }

  deleteComment(id: string) {
    return this.http.delete(`${API_URL}/comments/${id}`);
  }

  reviews(tutorialId: string) {
    return this.http.get<ReviewItem[]>(`${API_URL}/reviews/tutorial/${tutorialId}`);
  }

  saveReview(tutorialId: string, rating: number, comment?: string) {
    return this.http.post<{ review: ReviewItem; ratingAvg: number; ratingCount: number }>(
      `${API_URL}/reviews`,
      { tutorialId, rating, comment },
    );
  }

  deleteReview(id: string) {
    return this.http.delete(`${API_URL}/reviews/${id}`);
  }
}
