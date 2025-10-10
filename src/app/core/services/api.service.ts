import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(public http: HttpClient) {} // Made public for WordPress auth

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

  // WordPress API methods (for comments/reviews) - Public access, no auth
  getWp<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${environment.apiUrl}${endpoint}`;
    const httpParams = this.buildParams(params);
    
    console.log('[API Service] GET WP Request (Public):', {
      url,
      endpoint,
      params,
      fullUrl: `${url}?${httpParams.toString()}`
    });
    
    // WordPress comments are public, don't send WooCommerce auth headers
    return this.http.get<T>(url, { 
      params: httpParams
    });
  }

  postWp<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.apiUrl}${endpoint}`;
    
    console.log('[API Service] POST WP Request:', { url, body });
    
    // For creating comments, we still need some form of auth
    // But we'll let it fail gracefully if not authenticated
    return this.http.post<T>(url, body, { 
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  // WooCommerce Store API methods - Public API for storefronts
  getStore<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${environment.storeApi}${endpoint}`;
    const httpParams = this.buildParams(params);
    
    console.log('[API Service] GET Store API Request (Public):', {
      url,
      endpoint,
      params,
      fullUrl: `${url}?${httpParams.toString()}`
    });
    
    // Store API is public, no authentication needed
    return this.http.get<T>(url, { 
      params: httpParams
    });
  }

  postStore<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.storeApi}${endpoint}`;
    
    console.log('[API Service] POST Store API Request:', { url, body });
    
    // Store API public endpoint
    return this.http.post<T>(url, body, { 
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
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

  // Custom Reviews API methods (requires WordPress authentication)
  postReview<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.reviewsApi}${endpoint}`;
    console.log('[API Service] POST Custom Reviews API Request (Authenticated):', {
      url,
      endpoint,
      body
    });
    return this.http.post<T>(url, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true // Send WordPress cookies for authentication
    });
  }

  putReview<T>(endpoint: string, body: any): Observable<T> {
    const url = `${environment.reviewsApi}${endpoint}`;
    console.log('[API Service] PUT Custom Reviews API Request (Authenticated):', {
      url,
      endpoint,
      body
    });
    return this.http.put<T>(url, body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    });
  }

  deleteReview<T>(endpoint: string): Observable<T> {
    const url = `${environment.reviewsApi}${endpoint}`;
    console.log('[API Service] DELETE Custom Reviews API Request (Authenticated):', {
      url,
      endpoint
    });
    return this.http.delete<T>(url, {
      withCredentials: true
    });
  }
}