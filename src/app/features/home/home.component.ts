import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../store/app.state';
import * as ProductActions from '../../store/actions/product.actions';
import * as ProductSelectors from '../../store/selectors/product.selectors';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredProducts$: Observable<Product[]>;
  loading$: Observable<boolean>;

  heroSlides = [
    {
      title: 'Summer Collection',
      subtitle: 'Discover the latest trends for the season',
      image: 'https://placeholder-image-service.onrender.com/image/1200x500?prompt=Summer fashion collection hero banner with bright colors and stylish clothing&id=hero-001&customer_id=cus_TA1YAkwFiIX1gw',
      cta: 'Shop Now',
      link: '/products?category=summer'
    },
    {
      title: 'Electronics Sale',
      subtitle: 'Up to 50% off on selected items',
      image: 'https://placeholder-image-service.onrender.com/image/1200x500?prompt=Electronics sale banner with modern gadgets and devices on dark background&id=hero-002&customer_id=cus_TA1YAkwFiIX1gw',
      cta: 'Shop Electronics',
      link: '/products?category=electronics'
    },
    {
      title: 'Home & Garden',
      subtitle: 'Transform your living space',
      image: 'https://placeholder-image-service.onrender.com/image/1200x500?prompt=Home and garden banner with beautiful indoor plants and modern furniture&id=hero-003&customer_id=cus_TA1YAkwFiIX1gw',
      cta: 'Explore',
      link: '/products?category=home-garden'
    }
  ];

  currentSlide = 0;

  categories = [
    {
      name: 'Electronics',
      image: 'https://placeholder-image-service.onrender.com/image/300x200?prompt=Electronics category showcase with modern gadgets and devices&id=cat-001&customer_id=cus_TA1YAkwFiIX1gw',
      link: '/products?category=electronics'
    },
    {
      name: 'Fashion',
      image: 'https://placeholder-image-service.onrender.com/image/300x200?prompt=Fashion category with trendy clothing and accessories display&id=cat-002&customer_id=cus_TA1YAkwFiIX1gw',
      link: '/products?category=fashion'
    },
    {
      name: 'Home & Garden',
      image: 'https://placeholder-image-service.onrender.com/image/300x200?prompt=Home and garden category with furniture and plants&id=cat-003&customer_id=cus_TA1YAkwFiIX1gw',
      link: '/products?category=home-garden'
    },
    {
      name: 'Sports',
      image: 'https://placeholder-image-service.onrender.com/image/300x200?prompt=Sports category with athletic equipment and gear&id=cat-004&customer_id=cus_TA1YAkwFiIX1gw',
      link: '/products?category=sports'
    }
  ];

  constructor(private store: Store<AppState>) {
    this.featuredProducts$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
  }

  ngOnInit(): void {
    this.loadFeaturedProducts();
    this.startSlideShow();
  }

  loadFeaturedProducts(): void {
    this.store.dispatch(ProductActions.loadProducts({
      params: {
        per_page: 8,
        orderby: 'popularity'
      }
    }));
  }

  startSlideShow(): void {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
    }, 5000);
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.heroSlides.length - 1 : this.currentSlide - 1;
  }
}