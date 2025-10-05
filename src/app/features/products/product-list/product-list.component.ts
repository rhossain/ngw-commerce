import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.state';
import * as ProductActions from '../../../store/actions/product.actions';
import * as ProductSelectors from '../../../store/selectors/product.selectors';
import { Product, ProductSearchParams } from '../../../core/models/product.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products$: Observable<Product[]>;
  loading$: Observable<boolean>;
  pagination$: Observable<any>;
  
  private destroy$ = new Subject<void>();

  searchParams: ProductSearchParams = {
    page: 1,
    per_page: 12,
    orderby: 'date'
  };

  // Filter options
  categories: string[] = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  sortOptions = [
    { value: 'date', label: 'Newest' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' }
  ];

  showFilters = false;
  minPrice = 0;
  maxPrice = 1000;

  constructor(private store: Store<AppState>) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.pagination$ = this.store.select(ProductSelectors.selectProductsPagination);
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.store.dispatch(ProductActions.loadProducts({ params: this.searchParams }));
  }

  onSearch(searchTerm: string): void {
    this.searchParams = {
      ...this.searchParams,
      search: searchTerm,
      page: 1
    };
    this.loadProducts();
  }

  onCategoryChange(category: string): void {
    this.searchParams = {
      ...this.searchParams,
      category: category,
      page: 1
    };
    this.loadProducts();
  }

  onSortChange(sortBy: string): void {
    this.searchParams = {
      ...this.searchParams,
      orderby: sortBy as any,
      page: 1
    };
    this.loadProducts();
  }

  onPriceFilter(): void {
    this.searchParams = {
      ...this.searchParams,
      min_price: this.minPrice,
      max_price: this.maxPrice,
      page: 1
    };
    this.loadProducts();
  }

  onInStockChange(inStock: boolean): void {
    this.searchParams = {
      ...this.searchParams,
      in_stock: inStock || undefined,
      page: 1
    };
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.searchParams = {
      ...this.searchParams,
      page: page
    };
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearFilters(): void {
    this.searchParams = {
      page: 1,
      per_page: 12,
      orderby: 'date'
    };
    this.minPrice = 0;
    this.maxPrice = 1000;
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
}