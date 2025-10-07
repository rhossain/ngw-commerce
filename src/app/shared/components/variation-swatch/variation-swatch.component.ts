import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SwatchOption {
  type: 'color' | 'image' | 'label';
  value: string;
  name: string;
  slug: string;
  available?: boolean; // Whether this option is in stock
}

@Component({
  selector: 'app-variation-swatch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap gap-2">
      <button
        *ngFor="let option of options"
        type="button"
        (click)="selectOption(option)"
        [disabled]="!option.available && option.available !== undefined"
        [class]="getSwatchClasses(option)"
        [attr.aria-label]="'Select ' + option.name"
        [title]="option.name"
      >
        <!-- Color Swatch -->
        <span 
          *ngIf="option.type === 'color'"
          class="block w-full h-full rounded"
          [style.background-color]="option.value"
        ></span>

        <!-- Image Swatch -->
        <img 
          *ngIf="option.type === 'image'"
          [src]="option.value"
          [alt]="option.name"
          class="w-full h-full object-cover rounded"
        />

        <!-- Label Swatch -->
        <span 
          *ngIf="option.type === 'label'"
          class="text-sm font-medium"
        >
          {{ option.name }}
        </span>

        <!-- Out of Stock Indicator -->
        <span 
          *ngIf="!option.available && option.available !== undefined"
          class="absolute inset-0 flex items-center justify-center"
        >
          <svg class="w-full h-full text-red-500 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="2" y1="2" x2="22" y2="22" stroke-width="2"/>
          </svg>
        </span>
      </button>
    </div>
  `,
  styles: []
})
export class VariationSwatchComponent {
  @Input() options: SwatchOption[] = [];
  @Input() selected: string | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() optionSelected = new EventEmitter<SwatchOption>();

  selectOption(option: SwatchOption): void {
    if (option.available !== false) {
      this.optionSelected.emit(option);
    }
  }

  getSwatchClasses(option: SwatchOption): string {
    const baseClasses = 'relative inline-flex items-center justify-center border-2 transition-all';
    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12'
    };
    
    const isSelected = this.selected === option.slug || this.selected === option.name;
    const isAvailable = option.available !== false;
    
    let classes = `${baseClasses} ${sizeClasses[this.size]}`;
    
    // Type-specific styling
    if (option.type === 'color' || option.type === 'image') {
      classes += ' rounded';
    } else {
      classes += ' rounded-md px-3';
    }
    
    // Selection state
    if (isSelected) {
      classes += ' border-primary-600 ring-2 ring-primary-600 ring-offset-2';
    } else {
      classes += ' border-gray-300 hover:border-gray-400';
    }
    
    // Availability state
    if (!isAvailable) {
      classes += ' opacity-40 cursor-not-allowed';
    } else {
      classes += ' cursor-pointer hover:shadow-md';
    }
    
    return classes;
  }
}
