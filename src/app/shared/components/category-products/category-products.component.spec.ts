import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CategoryProductsComponent } from './category-products.component';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductCategory } from '../../../core/models/product.model';

describe('CategoryProductsComponent', () => {
  let component: CategoryProductsComponent;
  let fixture: ComponentFixture<CategoryProductsComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const realProducts: Product[] = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      slug: 'wireless-bluetooth-headphones',
      permalink: 'https://example.com/product/wireless-bluetooth-headphones',
      type: 'simple',
      status: 'publish',
      featured: false,
      description: '<p>High-quality wireless Bluetooth headphones with noise cancellation and 30-hour battery life.</p>',
      short_description: '<p>Premium wireless headphones with exceptional sound quality.</p>',
      sku: 'WBH-001',
      price: '29.99',
      regular_price: '29.99',
      sale_price: '',
      price_html: '<span class="price">$29.99</span>',
      on_sale: false,
      purchasable: true,
      stock_status: 'instock',
      stock_quantity: 50,
      manage_stock: true,
      average_rating: '4.5',
      rating_count: 10,
      review_count: 10,
      categories: [{ id: 15, name: 'Electronics', slug: 'electronics', parent: 0, description: '', count: 25 }],
      tags: [{ id: 1, name: 'Audio', slug: 'audio' }],
      images: [{ id: 1, src: 'https://example.com/headphones.jpg', name: 'Headphones', alt: 'Wireless Headphones', position: 0 }],
      attributes: [],
      variations: [],
      related_ids: [3, 4, 5],
      upsell_ids: [6, 7],
      cross_sell_ids: [8, 9],
      weight: '250g',
      dimensions: { length: '20', width: '18', height: '8' }
    },
    {
      id: 2,
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      permalink: 'https://example.com/product/smart-watch-pro',
      type: 'simple',
      status: 'publish',
      featured: true,
      description: '<p>Advanced smartwatch with fitness tracking, heart rate monitor, and GPS.</p>',
      short_description: '<p>Stay connected and track your fitness goals.</p>',
      sku: 'SWP-002',
      price: '39.99',
      regular_price: '49.99',
      sale_price: '39.99',
      price_html: '<del>$49.99</del> <ins>$39.99</ins>',
      on_sale: true,
      purchasable: true,
      stock_status: 'instock',
      stock_quantity: 30,
      manage_stock: true,
      average_rating: '5.0',
      rating_count: 20,
      review_count: 20,
      categories: [{ id: 15, name: 'Electronics', slug: 'electronics', parent: 0, description: '', count: 25 }],
      tags: [{ id: 2, name: 'Wearables', slug: 'wearables' }],
      images: [{ id: 2, src: 'https://example.com/smartwatch.jpg', name: 'Smart Watch', alt: 'Smart Watch Pro', position: 0 }],
      attributes: [],
      variations: [],
      related_ids: [1, 10, 11],
      upsell_ids: [12, 13],
      cross_sell_ids: [14, 15],
      weight: '50g',
      dimensions: { length: '4', width: '4', height: '1' }
    }
  ];

  const mockCategory: ProductCategory = {
    id: 15,
    name: 'Electronics',
    slug: 'electronics',
    parent: 0,
    description: 'Electronics category',
    count: 10,
  };

  beforeEach(async () => {
    const productServiceSpyObj = jasmine.createSpyObj('ProductService', [
      'searchProducts',
      'getCategoryById',
    ]);

    await TestBed.configureTestingModule({
      imports: [CategoryProductsComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpyObj },
      ],
    }).compileComponents();

    productServiceSpy = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    fixture = TestBed.createComponent(CategoryProductsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if categoryId is not provided', () => {
    component.categoryId = undefined as any;
    component.ngOnInit();

    expect(component.error).toBe('Category ID is required');
    expect(component.loading).toBe(false);
  });

  it('should load products on init', () => {
    const mockResponse = {
      success: true,
      products: realProducts,
      total: 2,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.ngOnInit();

    expect(productServiceSpy.searchProducts).toHaveBeenCalled();
    expect(component.products).toEqual(realProducts);
    expect(component.loading).toBe(false);
  });

  it('should load category name if no heading is provided', () => {
    const mockResponse = {
      success: true,
      products: realProducts,
      total: 2,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.heading = '';
    component.ngOnInit();

    expect(productServiceSpy.getCategoryById).toHaveBeenCalledWith(15);
    expect(component.categoryName).toBe('Electronics');
  });

  it('should not load category name if heading is provided', () => {
    const mockResponse = {
      success: true,
      products: realProducts,
      total: 2,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));

    component.categoryId = 15;
    component.heading = 'Featured Products';
    component.ngOnInit();

    expect(productServiceSpy.getCategoryById).not.toHaveBeenCalled();
  });

  it('should handle error when loading products', () => {
    productServiceSpy.searchProducts.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.ngOnInit();

    expect(component.error).toBe('Failed to load products. Please try again later.');
    expect(component.loading).toBe(false);
  });

  it('should apply on_sale filter when showOnSaleOnly is true', () => {
    const mockResponse = {
      success: true,
      products: [realProducts[1]], // Only sale product
      total: 1,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.showOnSaleOnly = true;
    component.ngOnInit();

    const callArgs = productServiceSpy.searchProducts.calls.mostRecent().args[0];
    expect(callArgs.on_sale).toBe(true);
  });

  it('should apply featured filter when showFeaturedOnly is true', () => {
    const mockResponse = {
      success: true,
      products: realProducts,
      total: 2,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.showFeaturedOnly = true;
    component.ngOnInit();

    const callArgs = productServiceSpy.searchProducts.calls.mostRecent().args[0];
    expect(callArgs.featured).toBe(true);
  });

  it('should return correct display heading', () => {
    component.heading = 'Custom Heading';
    expect(component.getDisplayHeading()).toBe('Custom Heading');

    component.heading = '';
    component.categoryName = 'Electronics';
    expect(component.getDisplayHeading()).toBe('Electronics');

    component.heading = '';
    component.categoryName = '';
    expect(component.getDisplayHeading()).toBe('Products');
  });

  it('should generate correct view all link', () => {
    component.categoryId = 15;
    component.viewAllRoute = '/shop';
    expect(component.getViewAllLink()).toBe('/shop?category=15');

    component.viewAllRoute = '/products';
    expect(component.getViewAllLink()).toBe('/products?category=15');
  });

  it('should return correct grid classes', () => {
    component.gridColumns = 4;
    const classes = component.getGridClasses();
    expect(classes).toContain('grid');
    expect(classes).toContain('gap-6');
  });

  it('should track products by id', () => {
    const product = realProducts[0];
    const trackId = component.trackByProductId(0, product);
    expect(trackId).toBe(product.id);
  });

  it('should configure carousel correctly', () => {
    component.carouselLoop = true;
    component.carouselAutoplay = true;
    component.carouselDelay = 5000;
    component.carouselSlidesPerView = 3;
    component.carouselSpaceBetween = 25;

    const config = component.getSwiperConfig();
    expect(config.loop).toBe(true);
    expect(config.autoplay).toBeTruthy();
    expect(config.autoplay.delay).toBe(5000);
    expect(config.spaceBetween).toBe(25);
  });

  it('should reload products when reload is called', () => {
    const mockResponse = {
      success: true,
      products: realProducts,
      total: 2,
      pages: 1,
      current_page: 1,
    };

    productServiceSpy.searchProducts.and.returnValue(of(mockResponse));
    productServiceSpy.getCategoryById.and.returnValue(of(mockCategory));

    component.categoryId = 15;
    component.ngOnInit();

    const initialCallCount = productServiceSpy.searchProducts.calls.count();
    component.reload();

    expect(productServiceSpy.searchProducts.calls.count()).toBe(initialCallCount + 1);
  });
});
