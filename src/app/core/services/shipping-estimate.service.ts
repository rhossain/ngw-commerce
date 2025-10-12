import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ShippingEstimateService {
  // Simple example: flat estimate until thresholds or free shipping
  estimate(subtotal: number): number {
    if (subtotal === 0) return 0;
    if (subtotal >= environment.freeShippingThreshold) return 0;
    return environment.flatShippingEstimate;
  }
}
