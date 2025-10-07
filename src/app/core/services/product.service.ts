import { Injectable } from '@angular/core';
import { Observable, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductSearchParams, ProductSearchResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  searchProducts(params: ProductSearchParams): Observable<ProductSearchResponse> {
    // Use standard WooCommerce products endpoint
    return this.api.get<any[]>('/products', params).pipe(
      map((products: any[]) => ({
        success: true,
        products: products,
        total: products.length,
        pages: 1,
        current_page: params.page || 1
      })),
      catchError((error) => {
        console.error('WooCommerce API Error:', error);
        // Return empty result on error
        return of({
          success: false,
          products: [],
          total: 0,
          pages: 0,
          current_page: 1
        });
      })
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.api.get<Product>(`/products/${id}`).pipe(
      catchError((error) => {
        console.error('Product fetch error:', error);
        throw error;
      })
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    // WooCommerce API supports slug parameter to filter products
    console.log('Fetching product by slug:', slug);
    
    return this.api.get<any[]>('/products', { slug: slug }).pipe(
      map((products: any[]) => {
        console.log('WooCommerce API response for slug', slug, ':', products);
        
        if (products && products.length > 0) {
          console.log('Product found by slug:', products[0]);
          return products[0];
        }
        
        console.error('No product found with slug:', slug);
        throw new Error(`Product with slug "${slug}" not found`);
      }),
      catchError((error) => {
        console.error('Product slug fetch error:', error);
        
        // Fallback: Try searching by name (convert slug to name)
        const searchTerm = slug.replace(/-/g, ' ');
        console.log('Trying fallback search with term:', searchTerm);
        
        return this.api.get<any[]>('/products', { search: searchTerm }).pipe(
          map((products: any[]) => {
            if (products && products.length > 0) {
              console.log('Product found by search:', products[0]);
              return products[0];
            }
            throw new Error(`Product with slug or search term "${slug}" not found`);
          }),
          catchError(() => {
            throw error; // Re-throw original error
          })
        );
      })
    );
  }

  getRelatedProducts(productId: number): Observable<Product[]> {
    // Get product first to find related IDs, or just return similar products
    return this.api.get<Product[]>('/products', { per_page: 4 }).pipe(
      catchError((error) => {
        console.error('Related products error:', error);
        return of([]);
      })
    );
  }

  getProductReviews(productId: number): Observable<any[]> {
    return this.api.get<any[]>(`/products/${productId}/reviews`).pipe(
      catchError((error) => {
        console.error('Reviews fetch error:', error);
        return of([]);
      })
    );
  }

  addProductReview(productId: number, rating: number, content: string): Observable<any> {
    return this.api.post(`/products/${productId}/reviews`, { 
      rating, 
      review: content 
    }).pipe(
      catchError((error) => {
        console.error('Add review error:', error);
        throw error;
      })
    );
  }
}