import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { User } from '../../../core/models/user.model';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  cartItemsCount: number = 0;
  wishlistCount: number = 0;
  mobileMenuOpen = false;
  userMenuOpen = false;
  // Search state
  searchTerm = '';
  searchOpen = false;
  suggestions: Product[] = [];
  searching = false;
  showDropdown = false;
  activeIndex: number = -1; // keyboard highlight index
  chosenCategorySlug: string | '' = '';
  categories: { id: number; name: string; slug: string }[] = [];
  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private suggestionCache = new Map<string, Product[]>(); // key: term|catId

  constructor(
    private authService: AuthService,
    private authModalService: AuthModalService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private productService: ProductService
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(cart => {
      this.cartItemsCount = cart?.items_count || 0;
    });

    this.wishlistService.wishlist$.subscribe(wishlist => {
      this.wishlistCount = wishlist.length;
    });

    // Load categories for category filter in search
    this.productService.getCategories().subscribe(cats => {
      this.categories = cats.map(c => ({ id: c.id, name: c.name, slug: c.slug }));
    });

    // Setup debounced search suggestions
    this.searchInput$.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      tap(term => {
        if (term.length < 3) {
          this.suggestions = [];
          this.showDropdown = !!this.searchOpen && term.length > 0; // show empty state
        }
      }),
      switchMap(term => {
        if (term.length < 3) {
          return of([] as Product[]);
        }
        this.searching = true;
        const catId = this.getSelectedCategoryId();
        const cacheKey = `${term.toLowerCase()}|${catId || ''}`;
        if (this.suggestionCache.has(cacheKey)) {
          this.searching = false; // immediate
          return of(this.suggestionCache.get(cacheKey)!);
        }
        return this.productService.suggestProducts(term, catId).pipe(
          tap(results => this.suggestionCache.set(cacheKey, results)),
          catchError(() => of([] as Product[]))
        );
      }),
      tap(() => this.searching = false)
    ).subscribe(results => {
      this.suggestions = results;
      this.showDropdown = true;
      this.activeIndex = results.length ? 0 : -1;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchInput$.next(value.trim());
    this.searchOpen = true;
    this.activeIndex = -1; // reset
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.suggestions = [];
    this.showDropdown = false;
  }

  focusSearch(): void {
    this.searchOpen = true;
    if (this.searchTerm.length >= 3) {
      this.showDropdown = true;
    }
  }

  selectSuggestion(product: Product): void {
    this.clearSearch();
    // Navigate to product detail by slug
    // Use window.location to bypass potential menu close timing issues
    // but routerLink navigation could also be used
    // We'll use Router navigation via anchor in template instead of here.
  }

  showAllResults(): void {
    // Navigate to shop with search & optional category slug (needs slug-> kept) for consistency
    const queryParams: any = { search: this.searchTerm };
    if (this.chosenCategorySlug) {
      queryParams.category = this.chosenCategorySlug;
    }
    // Use location assign via link in template; left placeholder here if later using router
    this.clearSearch();
  }

  onCategoryChange(slug: string): void {
    this.chosenCategorySlug = slug;
    if (this.searchTerm.length >= 3) {
      this.searchInput$.next(this.searchTerm.trim());
    }
  }

  getSelectedCategoryId(): number | undefined {
    if (!this.chosenCategorySlug) return undefined;
    return this.categories.find(c => c.slug === this.chosenCategorySlug)?.id;
  }

  @HostListener('document:click', ['$event']) onDocClick(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    if (!target.closest('#global-search-wrapper')) {
      this.showDropdown = false;
    }
    if (!target.closest('#user-menu')) {
      this.userMenuOpen = false;
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.clearSearch();
      return;
    }
    if (!this.showDropdown || this.suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.suggestions.length;
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.suggestions.length) % this.suggestions.length;
      return;
    }
    if (event.key === 'Enter' && this.activeIndex >= 0) {
      const product = this.suggestions[this.activeIndex];
      if (product) {
        // rely on routerLink navigation - simulate click by constructing URL
        // Could inject Router, but simpler: set window.location
        window.location.href = `/products/${product.slug}`;
        this.clearSearch();
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.userMenuOpen = false;
  }

  openLoginModal(): void {
    this.authModalService.open('login');
  }

  openRegisterModal(): void {
    this.authModalService.open('register');
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }
}