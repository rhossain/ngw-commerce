import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { WishlistService } from '../../core/services/wishlist.service';
import { Product } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlist$: Observable<Product[]>;

  constructor(private wishlistService: WishlistService) {
    this.wishlist$ = this.wishlistService.wishlist$;
  }

  ngOnInit(): void {
    this.wishlistService.loadWishlist();
  }
}