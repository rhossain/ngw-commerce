import { Injectable } from '@angular/core';
import { Observable, of, catchError, forkJoin, throwError, merge } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Product, ProductSearchParams, ProductSearchResponse, ProductVariation, ProductCategory } from '../models/product.model';
import { ProductReview, ReviewCreateRequest, ReviewUpdateRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private api: ApiService) {}

  /**
   * Progressive product stream:
   * 1. Emits all products immediately after the initial list is fetched (base data, variation IDs only).
   * 2. For each variable product, fetches its full variation objects in the background
   *    and re-emits the updated product array as each one completes — no waiting for all.
   */
  streamProducts(params: ProductSearchParams): Observable<Product[]> {
    return this.api.get<any[]>('/products', params, { skipLoading: true }).pipe(
      switchMap((products: any[]) => {
        if (!products || products.length === 0) {
          return of([]);
        }

        const variableProducts = products.filter(
          p => p.type === 'variable' && p.variations && p.variations.length > 0
        );

        if (variableProducts.length === 0) {
          // Simple products only — emit immediately
          return of(products as Product[]);
        }

        // Emit the base products right away (skeletons disappear instantly)
        const immediate$ = of(products as Product[]);

        // For each variable product, fetch its variations independently and
        // emit the whole updated array as each product finishes
        const variationStreams = variableProducts.map(product =>
          forkJoin(
            product.variations.map((variationId: number) =>
              this.api.get<ProductVariation>(
                `/products/${product.id}/variations/${variationId}`,
                undefined,
                { skipLoading: true }
              ).pipe(catchError(() => of(null)))
            )
          ).pipe(
            map(variations => {
              product.variations = (variations as (ProductVariation | null)[]).filter(v => v !== null);
              // Return a fresh array reference so Angular change detection fires
              return [...products] as Product[];
            })
          )
        );

        // merge: immediate$ fires first, then each variation stream fires as it completes
        return merge(immediate$, ...variationStreams);
      }),
      catchError(() => of([]))
    );
  }

  searchProducts(params: ProductSearchParams): Observable<ProductSearchResponse> {
    // Use standard WooCommerce products endpoint
    return this.api.get<any[]>('/products', params, { skipLoading: true }).pipe(
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
            this.api.get<ProductVariation>(`/products/${product.id}/variations/${variationId}`, undefined, { skipLoading: true }).pipe(
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
    return this.api.get<Product>(`/products/${id}`, undefined, { skipLoading: true }).pipe(
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
    return this.api.get<any[]>('/products', { slug: slug, _embed: true }, { skipLoading: true }).pipe(
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
              this.api.get<ProductVariation>(`/products/${product.id}/variations/${variationId}`, undefined, { skipLoading: true }).pipe(
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
        
        return this.api.get<any[]>('/products', { search: searchTerm }, { skipLoading: true }).pipe(
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
    return this.api.get<Product[]>('/products', { per_page: 4 }, { skipLoading: true }).pipe(
      catchError((error) => {
        console.error('Related products error:', error);
        return of([]);
      })
    );
  }

  getProductReviews(productId: number): Observable<ProductReview[]> {
    // Use WooCommerce Store API - Public API designed for storefronts
    // GET /wc/store/v1/products/reviews?product_id={id}
    return this.api.getStore<any[]>('/products/reviews', { 
      product_id: productId,
      per_page: 100
    }).pipe(
      map(reviews => reviews.map(review => ({
        id: review.id,
        product_id: review.product_id,
        date_created: review.date_created,
        date_created_gmt: review.date_created_gmt,
        status: 'approved', // Store API only returns approved reviews
        reviewer: review.reviewer,
        reviewer_email: '', // Not provided by Store API for privacy
        review: review.review,
        rating: review.rating,
        verified: review.verified || false,
        reviewer_avatar_urls: review.reviewer_avatar_urls
      }))),
      catchError((error) => {
        console.warn('Reviews fetch error from Store API:', error);
        console.log('Product reviews may not be available.');
        return of([]);
      })
    );
  }

  addProductReview(request: ReviewCreateRequest): Observable<ProductReview> {
    // Use custom WordPress plugin endpoint for review submission
    // Requires user to be logged in - name and email come from WordPress user
    return this.api.postReview<any>('/reviews', {
      product_id: request.product_id,
      review: request.review,
      rating: request.rating
    }).pipe(
      map((response: any) => {
        // Custom endpoint returns nested review object
        const review = response.review || response;
        return {
          id: review.id,
          product_id: review.product_id,
          date_created: review.date_created,
          reviewer: review.reviewer,
          review: review.review,
          rating: review.rating,
          verified: review.verified || false,
          reviewer_avatar_urls: review.reviewer_avatar_urls || {},
          user_id: review.user_id
        } as ProductReview;
      }),
      catchError((error) => {
        console.error('Error creating review:', error);
        // Return user-friendly error message
        const errorMessage = error.error?.message || 
                           error.message || 
                           'Failed to submit review. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateProductReview(request: ReviewUpdateRequest): Observable<ProductReview> {
    return this.api.putReview<any>(`/reviews/${request.id}`, {
      review: request.review,
      rating: request.rating
    }).pipe(
      map((response: any) => {
        const review = response.review || response;
        return {
          id: review.id,
          product_id: review.product_id,
          date_created: review.date_created,
          reviewer: review.reviewer,
          review: review.review,
          rating: review.rating,
          verified: review.verified || false,
          reviewer_avatar_urls: review.reviewer_avatar_urls || {},
          user_id: review.user_id
        } as ProductReview;
      }),
      catchError((error) => {
        console.error('Error updating review:', error);
        const errorMessage = error.error?.message || 
                           error.message || 
                           'Failed to update review. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteProductReview(reviewId: number): Observable<any> {
    return this.api.deleteReview<any>(`/reviews/${reviewId}`).pipe(
      catchError((error) => {
        console.error('Error deleting review:', error);
        const errorMessage = error.error?.message || 
                           error.message || 
                           'Failed to delete review. Please try again.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Get all product categories from WooCommerce
   */
  getCategories(): Observable<ProductCategory[]> {
    return this.api.get<ProductCategory[]>('/products/categories', { per_page: 100 }, { skipLoading: true }).pipe(
      catchError((error) => {
        console.error('Error fetching categories:', error);
        return of([]);
      })
    );
  }

  /**
   * Get a specific category by ID
   */
  getCategoryById(id: number): Observable<ProductCategory> {
    return this.api.get<ProductCategory>(`/products/categories/${id}`, undefined, { skipLoading: true }).pipe(
      catchError((error) => {
        console.error('Error fetching category:', error);
        throw error;
      })
    );
  }

  /**
   * Lightweight suggestion query for header autocomplete.
   * Uses core products endpoint with small per_page for performance.
   */
  suggestProducts(term: string, categoryId?: number, limit: number = 5): Observable<Product[]> {
    if (!term || term.trim().length < 3) {
      return of([]);
    }
    const cleaned = term.trim();
    const params: any = {
      search: cleaned,
      per_page: limit,
      status: 'publish'
    }; // Avoid unsupported orderby for suggestions
    if (categoryId) {
      params.category = String(categoryId);
    }
    return this.api.get<any[]>('/products', params, { skipLoading: true }).pipe(
      switchMap(products => {
        if (products && products.length > 0) {
          return of(this.rankAndTrim(products, cleaned, limit));
        }
        // Fallback 1: try slug-style (replace spaces with hyphen)
        const slugGuess = cleaned.toLowerCase().replace(/\s+/g, '-');
        return this.api.get<any[]>('/products', { slug: slugGuess }, { skipLoading: true }).pipe(
          switchMap(slugProducts => {
            if (slugProducts && slugProducts.length > 0) {
              return of(this.rankAndTrim(slugProducts, cleaned, limit));
            }
            // Fallback 2: broaden by splitting words and searching first word
            const firstWord = cleaned.split(/\s+/)[0];
            if (firstWord && firstWord.length >= 3 && firstWord !== cleaned) {
              return this.api.get<any[]>('/products', { search: firstWord, per_page: limit, status: 'publish' }, { skipLoading: true }).pipe(
                map(p => this.rankAndTrim(p, cleaned, limit)),
                catchError(() => of([]))
              );
            }
            return of([]);
          })
        );
      }),
      catchError(err => {
        console.warn('suggestProducts error', err);
        return of([]);
      })
    );
  }

  private rankAndTrim(products: any[], term: string, limit: number): Product[] {
    const t = term.toLowerCase();
    const scored = products.map(p => {
      const name = (p.name || '').toLowerCase();
      let score = 0;
      if (name === t) score += 100; // exact
      if (name.startsWith(t)) score += 40;
      if (name.includes(t)) score += 20;
      // Partial word matches
      const words: string[] = name.split(/\s+/);
      if (words.some((w: string) => w.startsWith(t))) score += 10;
      return { p, score };
    });
    return scored.sort((a,b) => b.score - a.score).slice(0, limit).map(s => s.p as Product);
  }

  /**
   * Get all global product attributes (e.g. Color, Size)
   * WooCommerce endpoint: GET /products/attributes
   */
  getProductAttributes(): Observable<any[]> {
    return this.api.get<any[]>('/products/attributes', { per_page: 100 }, { skipLoading: true }).pipe(
      catchError(error => {
        console.error('Error fetching product attributes:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all terms for a specific global attribute
   * WooCommerce endpoint: GET /products/attributes/{attribute_id}/terms
   */
  getAttributeTerms(attributeId: number): Observable<any[]> {
    return this.api.get<any[]>(`/products/attributes/${attributeId}/terms`, { per_page: 100 }, { skipLoading: true }).pipe(
      catchError(error => {
        console.error(`Error fetching terms for attribute ${attributeId}:`, error);
        return of([]);
      })
    );
  }

  /**
   * Convenience helper to fetch attributes and their terms in parallel
   */
  getAttributesWithTerms(): Observable<{ id: number; name: string; slug: string; variation: boolean; terms: any[] }[]> {
    return this.getProductAttributes().pipe(
      switchMap(attrs => {
        if (!attrs || attrs.length === 0) return of([]);
        const requests = attrs.map(attr =>
          this.getAttributeTerms(attr.id).pipe(
            map(terms => ({
              id: attr.id,
              name: attr.name,
              slug: attr.slug, // e.g. 'pa_color'
              variation: attr.variation,
              terms
            }))
          )
        );
        return forkJoin(requests);
      }),
      catchError(error => {
        console.error('Error building attributes with terms:', error);
        return of([]);
      })
    );
  }
}