import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card-skeleton.component.html',
  styleUrls: ['./product-card-skeleton.component.css']
})
export class ProductCardSkeletonComponent {
  /** Number of skeleton cards to render */
  @Input() count: number = 4;

  /** Match the display style of the parent container */
  @Input() displayStyle: 'grid' | 'carousel' | 'list' = 'grid';

  /** Number of visible slides — used to size carousel skeleton cards */
  @Input() slidesPerView: number = 4;

  /** Gap between carousel slides in px */
  @Input() spaceBetween: number = 20;

  /** For grid/list use display:contents so cards become direct grid children.
   *  For carousel the component owns its own layout wrapper. */
  @HostBinding('style.display')
  get hostDisplay(): string {
    return this.displayStyle === 'carousel' ? 'block' : 'contents';
  }

  get cards(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }

  /** Width of each carousel skeleton card */
  get carouselCardWidth(): string {
    const totalGap = (this.slidesPerView - 1) * this.spaceBetween;
    return `calc((100% - ${totalGap}px) / ${this.slidesPerView})`;
  }
}
