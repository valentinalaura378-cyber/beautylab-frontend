import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CatalogService } from './core/services/catalog.service';
import { LearningService } from './core/services/learning.service';
import { ToastService } from './core/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected auth = inject(AuthService);
  protected learning = inject(LearningService);
  protected toast = inject(ToastService);
  private catalog = inject(CatalogService);
  private router = inject(Router);

  protected menuOpen = signal(false);
  protected readonly year = new Date().getFullYear();

  constructor() {
    // Las categorías se usan en casi todas las pantallas: se cargan una sola vez al iniciar.
    this.catalog.loadCategories();

    // Cuando el usuario inicia sesión, se consulta cuántas notificaciones tiene sin leer.
    effect(() => {
      if (this.auth.isLoggedIn()) this.learning.refreshUnread();
      else this.learning.unread.set(0);
    });
  }

  protected toggleMenu() {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu() {
    this.menuOpen.set(false);
  }

  protected logout() {
    this.closeMenu();
    this.auth.logout();
  }

  protected goShare() {
    this.closeMenu();
    this.router.navigate(['/tutoriales/nuevo']);
  }
}
