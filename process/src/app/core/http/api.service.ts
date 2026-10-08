import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getFullUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = (this.baseUrl).replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (base.endsWith('/api/v1') && cleanPath.startsWith('/api/v1/')) {
      return `${base.replace(/\/api\/v1$/, '')}${cleanPath}`;
    }
    return `${base}${cleanPath}`;
  }

  public get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(this.getFullUrl(path), { params });
  }

  public post<T>(path: string, body: any = {}, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.getFullUrl(path), body, { headers });
  }

  public put<T>(path: string, body: any = {}): Observable<T> {
    return this.http.put<T>(this.getFullUrl(path), body);
  }

  public delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(this.getFullUrl(path));
  }
}
