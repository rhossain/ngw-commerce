import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopComponent } from './shop.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { of, Subject } from 'rxjs';
import { AppState } from '../../../store/app.state';
import { Product, ProductCategory } from '../../../core/models/product.model';

describe('ShopComponent', () => {
  let component: ShopComponent;
  let fixture: ComponentFixture<ShopComponent>;
  let store: MockStore<AppState>;
  let productService: jasmine.SpyObj<ProductService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      slug: 'test-product-1',
      permalink: 'https://example.com/product/test-product-1',
      type: 'simple',
      status: 'publish',
      price: '29.99',
      regular_price: '39.99',
      sale_price: '29.99',
      price_html: '<del>$39.99</del> <ins>$29.99</ins>',
      on_sale: true,
      purchasable: true,
      description: 'Test description',
      short_description: 'Short desc',
      sku: 'TEST-1',
      stock_status: 'instock',
      stock_quantity: 10,
      manage_stock: true,
      categories: [{ 
        id: 1, 
        name: 'Category 1', 
        slug: 'category-1',
        parent: 0,
        description: 'Test category',
        count: 5
      }],
      tags: [],
      images: [{ 
        id: 1, 
        src: 'test.jpg', 
        name: 'Test', 
        alt: 'Test',
        position: 0
      }],
      attributes: [],
      variations: [],
      related_ids: [],
      upsell_ids: [],
      cross_sell_ids: [],
      average_rating: '4.5',
      rating_count: 10,
      review_count: 10,
      featured: true,
      weight: null,
      dimensions: null
    }
  ];

  const mockCategories: ProductCategory[] = [
    {
      id: 1,
      name: 'Category 1',
      slug: 'category-1',
      parent: 0,
      description: 'Test category',
      count: 5
    },
    {
      id: 2,
      name: 'Category 2',
      slug: 'category-2',
      parent: 0,
      description: 'Test category 2',
      count: 3
    }
  ];

  const initialState = {
    products: {
      products: mockProducts,
      selectedProduct: null,
      loading: false,
      error: null,
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalProducts: 50,
        perPage: 10
      }
    }
  };

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getCategories', 'getCategoryById']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const queryParamsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [ShopComponent],
      providers: [
        provideMockStore({ initialState }),
        { provide: ProductService, useValue: productServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
            snapshot: {
              queryParams: {}
            }
          }
        }
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);

    productService.getCategories.and.returnValue(of(mockCategories));

    fixture = TestBed.createComponent(ShopComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    fixture.detectChanges();
    expect(productService.getCategories).toHaveBeenCalled();
  });

  it('should initialize with default filters', () => {
    fixture.detectChanges();
    expect(component.filters).toEqual({ orderby: 'date' });
    expect(component.currentPage).toBe(1);
    expect(component.viewMode).toBe('grid');
  });

  it('should set view mode', () => {
    component.setViewMode('list');
    expect(component.viewMode).toBe('list');
    component.setViewMode('grid');
    expect(component.viewMode).toBe('grid');
  });

  it('should handle search input', (done) => {
    fixture.detectChanges();
    component.onSearchChange('test search');
    
    setTimeout(() => {
      expect(component.filters.search).toBe('test search');
      expect(component.currentPage).toBe(1);
      done();
    }, 350); // Wait for debounce (300ms) + a bit more
  });

  it('should handle category change', () => {
    component.onCategoryChange('5');
    expect(component.filters.category).toBe('5');
    expect(component.currentPage).toBe(1);
  });

  it('should handle price range change', () => {
    component.priceMin = 10;
    component.priceMax = 100;
    component.onPriceRangeChange();
    
    expect(component.filters.minPrice).toBe(10);
    expect(component.filters.maxPrice).toBe(100);
    expect(component.currentPage).toBe(1);
  });

  it('should toggle in stock filter', () => {
    component.onInStockToggle();
    expect(component.filters.inStock).toBe(true);
    
    component.onInStockToggle();
    expect(component.filters.inStock).toBe(false);
  });

  it('should toggle on sale filter', () => {
    component.onSaleToggle();
    expect(component.filters.onSale).toBe(true);
    
    component.onSaleToggle();
    expect(component.filters.onSale).toBe(false);
  });

  it('should toggle featured filter', () => {
    component.onFeaturedToggle();
    expect(component.filters.featured).toBe(true);
    
    component.onFeaturedToggle();
    expect(component.filters.featured).toBe(false);
  });

  it('should handle sort change', () => {
    component.onSortChange('price');
    expect(component.filters.orderby).toBe('price');
    expect(component.currentPage).toBe(1);
  });

  it('should clear all filters', () => {
    component.filters = {
      search: 'test',
      category: '5',
      minPrice: 10,
      maxPrice: 100,
      inStock: true,
      onSale: true,
      featured: true
    };
    component.priceMin = 10;
    component.priceMax = 100;
    
    component.clearFilters();
    
    expect(component.filters).toEqual({ orderby: 'date' });
    expect(component.priceMin).toBe(0);
    expect(component.priceMax).toBe(1000);
    expect(component.currentPage).toBe(1);
  });

  it('should navigate to page', () => {
    component.onPageChange(3);
    expect(component.currentPage).toBe(3);
  });

  it('should calculate visible pages correctly', () => {
    component.currentPage = 5;
    component.totalPages = 10;
    const pages = component.visiblePages;
    expect(pages).toEqual([3, 4, 5, 6, 7]);
  });

  it('should calculate visible pages at the start', () => {
    component.currentPage = 1;
    component.totalPages = 10;
    const pages = component.visiblePages;
    expect(pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('should calculate visible pages at the end', () => {
    component.currentPage = 10;
    component.totalPages = 10;
    const pages = component.visiblePages;
    expect(pages).toEqual([6, 7, 8, 9, 10]);
  });

  it('should toggle mobile filters', () => {
    component.showMobileFilters = false;
    component.toggleMobileFilters();
    expect(component.showMobileFilters).toBe(true);
    component.toggleMobileFilters();
    expect(component.showMobileFilters).toBe(false);
  });

  it('should toggle sidebar filters', () => {
    component.showFilters = true;
    component.toggleFilters();
    expect(component.showFilters).toBe(false);
    component.toggleFilters();
    expect(component.showFilters).toBe(true);
  });

  it('should detect active filters', () => {
    component.filters = {
      search: 'test',
      category: '5',
      minPrice: 10,
      inStock: true
    };
    expect(component.hasActiveFilters()).toBe(true);
  });

  it('should detect no active filters', () => {
    component.filters = { orderby: 'date' };
    expect(component.hasActiveFilters()).toBe(false);
  });
});
