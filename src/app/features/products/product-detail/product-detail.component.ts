import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.state';
import * as ProductActions from '../../../store/actions/product.actions';
import * as ProductSelectors from '../../../store/selectors/product.selectors';
import { Product, ProductVariation } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductService } from '../../../core/services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product$: Observable<Product | null>;
  loading$: Observable<boolean>;
  
  private destroy$ = new Subject<void>();

  selectedImage = 0;
  quantity = 1;
  selectedVariation: ProductVariation | null = null;
  selectedAttributes: { [key: string]: string } = {};
  
  relatedProducts: Product[] = [];
  reviews: any[] = [];
  
  activeTab: 'description' | 'reviews' | 'additional' = 'description';

  // Review form
  newReview = {
    rating: 5,
    content: ''
  };

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService,
    private toastr: ToastrService
  ) {
    this.product$ = this.store.select(ProductSelectors.selectSelectedProduct);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const slug = params['slug'];
      this.loadProductBySlug(slug);
    });

    this.product$.pipe(takeUntil(this.destroy$)).subscribe(product => {
      if (product) {
        this.loadRelatedProducts(product.id);
        this.loadReviews(product.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(ProductActions.clearProductDetail());
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProductBySlug(slug: string): void {
    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.store.dispatch(ProductActions.loadProductDetailSuccess({ product }));
      },
      error: (error) => {
        this.store.dispatch(ProductActions.loadProductDetailFailure({ error }));
        this.toastr.error('Failed to load product');
      }
    });
  }

  loadRelatedProducts(productId: number): void {
    this.productService.getRelatedProducts(productId).subscribe({
      next: (products) => {
        this.relatedProducts = products;
      },
      error: (error) => {
        console.error('Error loading related products:', error);
      }
    });
  }

  loadReviews(productId: number): void {
    this.productService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
      }
    });
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAttributeChange(attributeName: string, value: string): void {
    this.selectedAttributes[attributeName] = value;
    this.findMatchingVariation();
  }

  findMatchingVariation(): void {
    // Implementation to find matching variation based on selected attributes
    // This is a simplified version - you may need more complex logic
    this.product$.pipe(takeUntil(this.destroy$)).subscribe(product => {
      if (product && product.variations) {
        const matching = product.variations.find(variation => {
          return Object.keys(this.selectedAttributes).every(key => {
            return variation.attributes[key] === this.selectedAttributes[key];
          });
        });
        this.selectedVariation = matching || null;
      }
    });
  }

  addToCart(product: Product): void {
    if (!product.purchasable) {
      this.toastr.error('This product is not available for purchase');
      return;
    }

    const request: any = {
      product_id: product.id,
      quantity: this.quantity
    };

    if (this.selectedVariation) {
      request.variation_id = this.selectedVariation.id;
      request.variation = this.selectedAttributes;
    }

    this.cartService.addToCart(request).subscribe({
      next: () => {
        this.toastr.success('Product added to cart!');
      },
      error: (error) => {
        this.toastr.error('Failed to add product to cart');
        console.error('Add to cart error:', error);
      }
    });
  }

  toggleWishlist(product: Product): void {
    if (this.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id).subscribe({
        next: () => {
          this.toastr.info('Removed from wishlist');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
        }
      });
    } else {
      this.wishlistService.addToWishlist(product.id).subscribe({
        next: () => {
          this.toastr.success('Added to wishlist!');
        },
        error: (error) => {
          this.toastr.error('Failed to update wishlist');
        }
      });
    }
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  submitReview(product: Product): void {
    if (!this.newReview.content.trim()) {
      this.toastr.error('Please write a review');
      return;
    }

    this.productService.addProductReview(
      product.id,
      this.newReview.rating,
      this.newReview.content
    ).subscribe({
      next: () => {
        this.toastr.success('Review submitted successfully!');
        this.newReview = { rating: 5, content: '' };
        this.loadReviews(product.id);
      },
      error: (error) => {
        this.toastr.error('Failed to submit review');
        console.error('Review submission error:', error);
      }
    });
  }

  setActiveTab(tab: 'description' | 'reviews' | 'additional'): void {
    this.activeTab = tab;
  }

  getCurrentPrice(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.price;
    }
    return product.on_sale ? product.sale_price : product.price;
  }

  getRegularPrice(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.regular_price;
    }
    return product.regular_price;
  }

  isOnSale(product: Product): boolean {
    if (this.selectedVariation) {
      return this.selectedVariation.on_sale;
    }
    return product.on_sale;
  }

  getStockStatus(product: Product): string {
    if (this.selectedVariation) {
      return this.selectedVariation.stock_status;
    }
    return product.stock_status;
  }
}