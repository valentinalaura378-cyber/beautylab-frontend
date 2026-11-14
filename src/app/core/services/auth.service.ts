import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from '../config';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'beautylab_token';
const USER_KEY = 'beautylab_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly token = signal<string | null>(this.read(TOKEN_KEY));
  readonly user = signal<User | null>(this.readUser());

  readonly isLoggedIn = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  login(body: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, body)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(body: { name: string; email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, body)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(redirect = true): void {
    this.token.set(null);
    this.user.set(null);
    this.remove(TOKEN_KEY);
    this.remove(USER_KEY);
    if (redirect) this.router.navigate(['/']);
  }

  /** Actualiza el usuario guardado (por ejemplo después de editar el perfil). */
  updateUser(user: User): void {
    this.user.set(user);
    this.write(USER_KEY, JSON.stringify(user));
  }

  private setSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    this.write(TOKEN_KEY, res.token);
    this.write(USER_KEY, JSON.stringify(res.user));
  }

  private readUser(): User | null {
    const raw = this.read(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  // El almacenamiento puede no estar disponible (modo privado, etc.): nunca debe romper la app.
  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  private write(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* sin almacenamiento */
    }
  }
  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      /* sin almacenamiento */
    }
  }
}
