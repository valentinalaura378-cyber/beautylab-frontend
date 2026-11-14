import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationItem } from '../../core/models';
import { LearningService } from '../../core/services/learning.service';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe],
  template: `
    <div class="page">
      <div class="container narrow">
        <div class="page-header row between">
          <div>
            <h1>Notificaciones 🔔</h1>
            <p>Mira lo que pasa con tus tutoriales y comentarios.</p>
          </div>
          @if (items().length) {
            <button type="button" class="btn btn-ghost btn-sm" (click)="readAll()">Marcar todas como leídas</button>
          }
        </div>

        @if (loading()) {
          <div class="loading">Cargando…</div>
        } @else if (items().length === 0) {
          <div class="empty"><span class="emoji">📭</span>No tienes notificaciones.</div>
        } @else {
          <div class="stack">
            @for (n of items(); track n._id) {
              <div class="card row between item" [class.unread]="!n.isRead">
                <button type="button" class="open" (click)="open(n)">
                  <strong>{{ n.title }}</strong>
                  <span>{{ n.message }}</span>
                  <span class="muted small">{{ n.createdAt | date: 'medium' }}</span>
                </button>
                <button type="button" class="btn btn-ghost btn-sm" (click)="remove(n)" aria-label="Eliminar">✕</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    .narrow { max-width: 760px; }
    .item.unread { border-left: 5px solid var(--primary); background: #fff6fa; }
    .open { display: flex; flex-direction: column; text-align: left; background: none; border: none; padding: 0; flex: 1; }
  `,
})
export class Notifications implements OnInit {
  private learning = inject(LearningService);
  private router = inject(Router);

  protected items = signal<NotificationItem[]>([]);
  protected loading = signal(true);

  ngOnInit(): void {
    this.learning.notifications().subscribe({
      next: (list) => {
        this.items.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected open(n: NotificationItem) {
    if (!n.isRead) {
      this.learning.markNotificationRead(n._id).subscribe(() => {
        this.items.update((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      });
    }
    if (n.link) this.router.navigateByUrl(n.link);
  }

  protected readAll() {
    this.learning.markAllRead().subscribe(() => this.items.update((list) => list.map((x) => ({ ...x, isRead: true }))));
  }

  protected remove(n: NotificationItem) {
    this.learning.removeNotification(n._id).subscribe(() => this.items.update((list) => list.filter((x) => x._id !== n._id)));
  }
}
