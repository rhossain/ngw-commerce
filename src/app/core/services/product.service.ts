import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, ProductSearchParams, ProductSearchResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  searchProducts(params: ProductSearchParams): Observable<ProductSearchResponse> {
    return this.api.get<ProductSearchResponse>('/products/search', params);
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`);
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.api.get<Product>(`/products/slug/${slug}`);
  }

  getRelatedProducts(productId: number): Observable<Product[]> {
    return this.api.get<Product[]>(`/products/${productId}/related`);
  }

  getProductReviews(productId: number): Observable<any[]> {
    return this.api.get<any[]>(`/products/${productId}/reviews`);
  }

  addProductReview(productId: number, rating: number, content: string): Observable<any> {
    return this.api.post(`/products/${productId}/reviews`, { rating, content });
  }
}