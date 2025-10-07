import { Injectable } from '@angular/core';
import { Observable, of, catchError, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductSearchParams, ProductSearchResponse, ProductVariation } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  searchProducts(params: ProductSearchParams): Observable<ProductSearchResponse> {
    // Use standard WooCommerce products endpoint
    return this.api.get<any[]>('/products', params).pipe(
      switchMap((products: any[]) => {
        // Check if there are any variable products that need variation details
        const variableProducts = products.filter(p => p.type === 'variable' && p.variations && p.variations.length > 0);
        
        if (variableProducts.length === 0) {
          // No variable products, return as is
          return of({
            success: true,
            products: products,
            total: products.length,
            pages: 1,
            current_page: params.page || 1
          });
        }
        
        // Fetch variations for all variable products
        const variationFetchRequests = variableProducts.map(product => {
          const variationRequests = product.variations.map((variationId: number) =>
            this.api.get<ProductVariation>(`/products/${product.id}/variations/${variationId}`).pipe(
              catchError(error => {
                console.error(`Error fetching variation ${variationId} for product ${product.id}:`, error);
                return of(null);
              })
            )
          );
          
          return forkJoin(variationRequests).pipe(
            map((variations) => {
              // Filter out null values and assign to product
              product.variations = (variations as (ProductVariation | null)[]).filter(v => v !== null) as ProductVariation[];
              return product;
            })
          );
        });
        
        // Fetch all variations in parallel
        return forkJoin(variationFetchRequests).pipe(
          map(() => ({
            success: true,
            products: products,
            total: products.length,
            pages: 1,
            current_page: params.page || 1
          }))
        );
      }),
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
    
    // Include variations in the response for variable products
    return this.api.get<any[]>('/products', { slug: slug, _embed: true }).pipe(
      switchMap((products: any[]) => {
        console.log('WooCommerce API response for slug', slug, ':', products);
        
        if (products && products.length > 0) {
          const product = products[0];
          console.log('Product found by slug:', product);
          console.log('Product type:', product.type);
          console.log('Product price:', product.price);
          console.log('Product variations:', product.variations);
          console.log('Product variations length:', product.variations?.length);
          
          // If it's a variable product with variation IDs, fetch the full variation data
          if (product.type === 'variable' && product.variations && product.variations.length > 0) {
            console.log('Fetching variation details for product:', product.id);
            
            // Fetch all variations
            const variationRequests = product.variations.map((variationId: number) =>
              this.api.get<ProductVariation>(`/products/${product.id}/variations/${variationId}`).pipe(
                catchError(error => {
                  console.error(`Error fetching variation ${variationId}:`, error);
                  return of(null);
                })
              )
            );
            
            return forkJoin(variationRequests).pipe(
              map((variations) => {
                // Filter out null values and assign to product
                product.variations = (variations as (ProductVariation | null)[]).filter(v => v !== null) as ProductVariation[];
                console.log('Fetched variations:', product.variations);
                return product;
              })
            );
          }
          
          return of(product);
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