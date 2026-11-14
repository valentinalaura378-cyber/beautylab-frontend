import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActivityItem, ProgressSummary, Tutorial } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { errorMessage } from '../../core/services/errors';
import { LearningService } from '../../core/services/learning.service';
import { ToastService } from '../../core/services/toast.service';
import { TutorialsService } from '../../core/services/tutorials.service';
import { LevelLabelPipe } from '../../shared/pipes/level-label.pipe';
import { TutorialCard } from '../../shared/components/tutorial-card';

type Tab = 'progress' | 'saved' | 'mine' | 'activity';

@Component({
  selector: 'app-my-learning',
  imports: [RouterLink, DatePipe, LevelLabelPipe, TutorialCard],
  templateUrl: './my-learning.html',
})
export class MyLearning implements OnInit {
  protected auth = inject(AuthService);
  private learning = inject(LearningService);
  private tutorials = inject(TutorialsService);
  private toast = inject(ToastService);

  protected tab = signal<Tab>('progress');
  protected loading = signal(true);

  protected progress = signal<ProgressSummary[]>([]);
  protected saved = signal<Tutorial[]>([]);
  protected mine = signal<Tutorial[]>([]);
  protected activity = signal<ActivityItem[]>([]);

  ngOnInit(): void {
    let pending = 4;
    const done = () => {
      if (--pending === 0) this.loading.set(false);
    };
    this.learning.myProgress().subscribe({ next: (l) => { this.progress.set(l); done(); }, error: done });
    this.learning.favorites().subscribe({ next: (l) => { this.saved.set(l); done(); }, error: done });
    this.tutorials.mine().subscribe({ next: (l) => { this.mine.set(l); done(); }, error: done });
    this.learning.activity().subscribe({ next: (l) => { this.activity.set(l); done(); }, error: done });
  }

  protected completedCount(): number {
    return this.progress().filter((p) => p.status === 'completed').length;
  }

  protected inProgress(): ProgressSummary[] {
    return this.progress().filter((p) => p.status !== 'completed');
  }

  protected deleteMine(t: Tutorial) {
    if (!confirm(`¿Eliminar "${t.title}"?`)) return;
    this.tutorials.remove(t._id).subscribe({
      next: () => {
        this.mine.update((list) => list.filter((x) => x._id !== t._id));
        this.toast.success('Tutorial eliminado');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }
}
