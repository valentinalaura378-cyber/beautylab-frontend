import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { errorMessage } from '../../core/services/errors';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-auth-page',
  imports: [FormsModule],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.scss',
})
export class AuthPage implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  protected mode = signal<'login' | 'register'>('login');
  protected loading = signal(false);
  protected error = signal('');

  protected name = '';
  protected email = '';
  protected password = '';

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) this.router.navigate(['/mi-aprendizaje']);
    if (this.route.snapshot.queryParamMap.get('modo') === 'registro') this.mode.set('register');
  }

  protected setMode(mode: 'login' | 'register') {
    this.mode.set(mode);
    this.error.set('');
  }

  protected submit() {
    this.error.set('');

    const email = this.email.trim();
    if (this.mode() === 'register' && this.name.trim().length < 2) {
      this.error.set('Escribe tu nombre (mínimo 2 caracteres).');
      return;
    }
    if (!email || !email.includes('@')) {
      this.error.set('Escribe un correo válido.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('La contraseña debe tener mínimo 6 caracteres.');
      return;
    }

    this.loading.set(true);
    const request =
      this.mode() === 'login'
        ? this.auth.login({ email, password: this.password })
        : this.auth.register({ name: this.name.trim(), email, password: this.password });

    request.subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(this.mode() === 'login' ? `¡Hola de nuevo, ${res.user.name}!` : '¡Cuenta creada! Bienvenida a BeautyLab.');
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || '/mi-aprendizaje');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'No se pudo completar la solicitud.'));
      },
    });
  }
}
