import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${environment.customApi}${endpoint}`;
    return this.http.get<T>(url, { 
      params: this.buildParams(params),
      withCredentials: true 
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.customApi}${endpoint}`;
    return this.http.post<T>(url, body, { withCredentials: true });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.customApi}${endpoint}`;
    return this.http.put<T>(url, body, { withCredentials: true });
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${environment.customApi}${endpoint}`;
    return this.http.delete<T>(url, { withCredentials: true });
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }
}