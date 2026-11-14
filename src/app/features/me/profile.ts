import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { errorMessage } from '../../core/services/errors';
import { LearningService } from '../../core/services/learning.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="container narrow">
        <div class="page-header">
          <h1>Mi perfil</h1>
          <p>{{ auth.user()?.email }} · {{ auth.isAdmin() ? 'Administrador' : 'Miembro de la comunidad' }}</p>
        </div>

        <div class="card">
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" class="input" maxlength="60" [(ngModel)]="name" />
          </div>
          <div class="field">
            <label for="avatar">Foto de perfil (URL, opcional)</label>
            <input id="avatar" class="input" type="url" placeholder="https://…" [(ngModel)]="avatar" />
          </div>
          <div class="field">
            <label for="bio">Sobre mí</label>
            <textarea id="bio" class="input" maxlength="300" rows="3" placeholder="Cuéntale a la comunidad qué te apasiona del maquillaje" [(ngModel)]="bio"></textarea>
          </div>
          <button type="button" class="btn btn-primary" (click)="save()">Guardar cambios</button>
        </div>
      </div>
    </div>
  `,
  styles: `.narrow { max-width: 640px; }`,
})
export class Profile implements OnInit {
  protected auth = inject(AuthService);
  private learning = inject(LearningService);
  private toast = inject(ToastService);

  protected name = '';
  protected avatar = '';
  protected bio = '';

  ngOnInit(): void {
    const u = this.auth.user();
    this.name = u?.name ?? '';
    this.avatar = u?.avatar ?? '';
    this.bio = u?.bio ?? '';
  }

  protected save() {
    if (this.name.trim().length < 2) {
      this.toast.info('El nombre debe tener mínimo 2 caracteres.');
      return;
    }
    this.learning.updateProfile({ name: this.name.trim(), avatar: this.avatar.trim(), bio: this.bio.trim() }).subscribe({
      next: (user) => {
        this.auth.updateUser(user);
        this.toast.success('Perfil actualizado');
      },
      error: (err) => this.toast.error(errorMessage(err)),
    });
  }
}
