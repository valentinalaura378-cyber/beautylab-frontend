import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../config';
import { Role, User } from '../models';

/** Operaciones de administración: CRUD genérico del catálogo y gestión de usuarios. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  list<T>(endpoint: string) {
    return this.http.get<T[]>(`${API_URL}/${endpoint}`);
  }
  create<T>(endpoint: string, body: object) {
    return this.http.post<T>(`${API_URL}/${endpoint}`, body);
  }
  update<T>(endpoint: string, id: string, body: object) {
    return this.http.put<T>(`${API_URL}/${endpoint}/${id}`, body);
  }
  remove(endpoint: string, id: string) {
    return this.http.delete(`${API_URL}/${endpoint}/${id}`);
  }

  users() {
    return this.http.get<User[]>(`${API_URL}/users`);
  }
  changeRole(id: string, role: Role) {
    return this.http.patch<User>(`${API_URL}/users/${id}/role`, { role });
  }
}
