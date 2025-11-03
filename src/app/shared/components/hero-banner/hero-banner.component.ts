import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroSlide } from './hero-banner.model';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.css']
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  @Input() slides: HeroSlide[] = [];
  @Input() autoPlay: boolean = true;
  @Input() autoPlayDelay: number = 5000;
  @Input() showNavigationArrows: boolean = true;
  @Input() showNavigationDots: boolean = true;
  @Input() height: 'sm' | 'md' | 'lg' | 'xl' = 'lg';
  
  currentSlide = 0;
  private slideInterval: any;

  ngOnInit(): void {
    if (this.autoPlay && this.slides.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    if (this.autoPlay) {
      this.startAutoPlay(); // Reset the timer
    }
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    if (this.autoPlay) {
      this.startAutoPlay(); // Reset the timer
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    if (this.autoPlay) {
      this.startAutoPlay(); // Reset the timer
    }
  }

  getHeightClass(): string {
    const heights = {
      sm: 'h-64 md:h-80',
      md: 'h-80 md:h-96',
      lg: 'h-96 md:h-[500px]',
      xl: 'h-[500px] md:h-[600px]'
    };
    return heights[this.height] || heights.lg;
  }
}
