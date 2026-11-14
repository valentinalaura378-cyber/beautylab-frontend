import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Stats, Tutorial } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { LearningService } from '../../core/services/learning.service';
import { TutorialsService } from '../../core/services/tutorials.service';
import { TutorialCard } from '../../shared/components/tutorial-card';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TutorialCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  protected auth = inject(AuthService);
  protected catalog = inject(CatalogService);
  private tutorials = inject(TutorialsService);
  private learning = inject(LearningService);

  protected stats = signal<Stats | null>(null);
  protected latest = signal<Tutorial[]>([]);
  protected topRated = signal<Tutorial[]>([]);
  protected loading = signal(true);

  protected readonly pillars = [
    { icon: '📚', title: 'Aprende paso a paso', text: 'Tutoriales organizados por categoría y nivel, con los productos que necesitas para cada técnica.' },
    { icon: '✅', title: 'Practica a tu ritmo', text: 'Marca los pasos que vas completando y retoma tu aprendizaje cuando quieras.' },
    { icon: '🤝', title: 'Comparte y colabora', text: 'Publica tus propios tutoriales, comenta, resuelve dudas y aprende de la comunidad.' },
  ];

  ngOnInit(): void {
    this.learning.stats().subscribe({ next: (s) => this.stats.set(s), error: () => this.stats.set(null) });
    this.tutorials.list({ sort: 'recent', limit: 6 }).subscribe({
      next: (res) => {
        this.latest.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
    this.tutorials.list({ sort: 'rating', limit: 3 }).subscribe({
      next: (res) => this.topRated.set(res.items.filter((t) => t.ratingCount > 0)),
      error: () => this.topRated.set([]),
    });
  }
}
