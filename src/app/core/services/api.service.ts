import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    // Create Basic Auth header for WooCommerce
    const credentials = btoa(`${environment.consumerKey}:${environment.consumerSecret}`);
    return new HttpHeaders({
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    });
  }

  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${environment.woocommerceApi}${endpoint}`;
    const httpParams = this.buildParams(params);
    
    console.log('[API Service] GET Request:', {
      url,
      endpoint,
      params,
      fullUrl: `${url}?${httpParams.toString()}`
    });
    
    return this.http.get<T>(url, { 
      headers: this.getAuthHeaders(),
      params: httpParams
    });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.woocommerceApi}${endpoint}`;
    
    return this.http.post<T>(url, body, { 
      headers: this.getAuthHeaders()
    });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.woocommerceApi}${endpoint}`;
    
    return this.http.put<T>(url, body, { 
      headers: this.getAuthHeaders()
    });
  }

  delete<T>(endpoint: string): Observable<T> {
    const url = `${environment.woocommerceApi}${endpoint}`;
    
    return this.http.delete<T>(url, { 
      headers: this.getAuthHeaders()
    });
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