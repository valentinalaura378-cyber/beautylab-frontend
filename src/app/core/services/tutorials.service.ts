import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from '../config';
import { Paged, Tutorial, TutorialDetail, TutorialInput, TutorialQuery } from '../models';

@Injectable({ providedIn: 'root' })
export class TutorialsService {
  private http = inject(HttpClient);
  private url = `${API_URL}/tutorials`;

  list(query: TutorialQuery = {}) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return this.http.get<Paged<Tutorial>>(this.url, { params });
  }

  get(id: string) {
    return this.http.get<TutorialDetail>(`${this.url}/${id}`);
  }

  mine() {
    return this.http.get<Tutorial[]>(`${this.url}/mine`);
  }

  categoryCounts() {
    return this.http.get<Record<string, number>>(`${this.url}/category-counts`);
  }

  create(body: TutorialInput) {
    return this.http.post<Tutorial>(this.url, body);
  }

  update(id: string, body: Partial<TutorialInput>) {
    return this.http.put<Tutorial>(`${this.url}/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete<{ message: string }>(`${this.url}/${id}`);
  }
}
