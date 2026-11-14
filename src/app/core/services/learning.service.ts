import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { API_URL } from '../config';
import {
  ActivityItem,
  KitItem,
  NotificationItem,
  Progress,
  ProgressSummary,
  Stats,
  Tutorial,
  User,
} from '../models';

/** Todo lo personal del usuario: progreso, favoritos, kit, notificaciones, actividad y perfil. */
@Injectable({ providedIn: 'root' })
export class LearningService {
  private http = inject(HttpClient);

  /** Cantidad de notificaciones sin leer (se muestra en la barra de navegación). */
  readonly unread = signal(0);

  stats() {
    return this.http.get<Stats>(`${API_URL}/stats`);
  }

  // --- Progreso ---
  progressOf(tutorialId: string) {
    return this.http.get<Progress>(`${API_URL}/progress/tutorial/${tutorialId}`);
  }
  saveProgress(tutorialId: string, completedSteps: number[]) {
    return this.http.put<Progress>(`${API_URL}/progress/tutorial/${tutorialId}`, { completedSteps });
  }
  myProgress() {
    return this.http.get<ProgressSummary[]>(`${API_URL}/progress/me`);
  }

  // --- Favoritos ---
  favorites() {
    return this.http.get<Tutorial[]>(`${API_URL}/favorites/me`);
  }
  addFavorite(tutorialId: string) {
    return this.http.post(`${API_URL}/favorites/${tutorialId}`, {});
  }
  removeFavorite(tutorialId: string) {
    return this.http.delete(`${API_URL}/favorites/${tutorialId}`);
  }

  // --- Kit (antes inventario) ---
  kit() {
    return this.http.get<KitItem[]>(`${API_URL}/kit`);
  }
  addKitItem(body: { productName: string; quantity: number; notes?: string }) {
    return this.http.post<KitItem>(`${API_URL}/kit`, body);
  }
  updateKitItem(id: string, body: Partial<KitItem>) {
    return this.http.put<KitItem>(`${API_URL}/kit/${id}`, body);
  }
  removeKitItem(id: string) {
    return this.http.delete(`${API_URL}/kit/${id}`);
  }

  // --- Notificaciones ---
  notifications() {
    return this.http.get<NotificationItem[]>(`${API_URL}/notifications/me`);
  }
  refreshUnread() {
    this.http.get<{ count: number }>(`${API_URL}/notifications/me/unread-count`).subscribe({
      next: (res) => this.unread.set(res.count),
      error: () => this.unread.set(0),
    });
  }
  markNotificationRead(id: string) {
    return this.http.patch(`${API_URL}/notifications/${id}/read`, {}).pipe(tap(() => this.refreshUnread()));
  }
  markAllRead() {
    return this.http.patch(`${API_URL}/notifications/read-all`, {}).pipe(tap(() => this.unread.set(0)));
  }
  removeNotification(id: string) {
    return this.http.delete(`${API_URL}/notifications/${id}`).pipe(tap(() => this.refreshUnread()));
  }

  // --- Actividad y perfil ---
  activity() {
    return this.http.get<ActivityItem[]>(`${API_URL}/activity-logs/me`);
  }
  updateProfile(body: { name?: string; avatar?: string; bio?: string }) {
    return this.http.put<User>(`${API_URL}/users/me`, body);
  }
}
