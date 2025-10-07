import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AttributeTerm {
  id: number;
  name: string;
  slug: string;
  description?: string;
  menu_order?: number;
  count?: number;
  meta_data?: Array<{
    key: string;
    value: string;
  }>;
}

export interface SwatchData {
  type: 'color' | 'image' | 'label';
  value: string; // Color code, image URL, or label text
  name: string;
  slug: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttributeService {
  private attributeCache: Map<string, AttributeTerm[]> = new Map();

  constructor(private api: ApiService) {}

  /**
   * Get all terms for a specific attribute
   */
  getAttributeTerms(attributeId: number): Observable<AttributeTerm[]> {
    const cacheKey = `attribute_${attributeId}`;
    
    // Check cache first
    if (this.attributeCache.has(cacheKey)) {
      return of(this.attributeCache.get(cacheKey)!);
    }

    return this.api.get<AttributeTerm[]>(`/products/attributes/${attributeId}/terms`).pipe(
      map(terms => {
        this.attributeCache.set(cacheKey, terms);
        return terms;
      }),
      catchError(error => {
        console.error('Error fetching attribute terms:', error);
        return of([]);
      })
    );
  }

  /**
   * Get swatch data from attribute term
   * Parses meta_data to extract swatch information
   */
  getSwatchDataFromTerm(term: AttributeTerm): SwatchData {
    const swatchData: SwatchData = {
      type: 'label',
      value: term.name,
      name: term.name,
      slug: term.slug
    };

    if (!term.meta_data) {
      return swatchData;
    }

    // Look for variation swatches plugin meta data
    const colorMeta = term.meta_data.find(m => 
      m.key === 'product_attribute_color' || 
      m.key === 'color'
    );
    
    const imageMeta = term.meta_data.find(m => 
      m.key === 'product_attribute_image' || 
      m.key === 'image'
    );

    const typeMeta = term.meta_data.find(m => 
      m.key === 'product_attribute_type' || 
      m.key === 'attribute_type'
    );

    if (colorMeta && colorMeta.value) {
      swatchData.type = 'color';
      swatchData.value = colorMeta.value;
    } else if (imageMeta && imageMeta.value) {
      swatchData.type = 'image';
      swatchData.value = imageMeta.value;
    } else if (typeMeta) {
      swatchData.type = typeMeta.value as 'color' | 'image' | 'label';
    }

    return swatchData;
  }

  /**
   * Get all swatches for a product's attributes
   */
  getProductSwatches(product: any): Observable<Map<string, SwatchData[]>> {
    if (!product.attributes || product.attributes.length === 0) {
      return of(new Map());
    }

    // Only process variation attributes
    const variationAttributes = product.attributes.filter((attr: any) => attr.variation);

    if (variationAttributes.length === 0) {
      return of(new Map());
    }

    // Fetch terms for all variation attributes
    const termRequests = variationAttributes.map((attr: any) => 
      this.getAttributeTerms(attr.id).pipe(
        map(terms => ({
          attributeName: attr.name,
          swatches: terms.map(term => this.getSwatchDataFromTerm(term))
        }))
      )
    );

    return forkJoin(termRequests as Array<Observable<{ attributeName: string; swatches: SwatchData[] }>>).pipe(
      map(results => {
        const swatchMap = new Map<string, SwatchData[]>();
        results.forEach(result => {
          swatchMap.set(result.attributeName, result.swatches);
        });
        return swatchMap;
      }),
      catchError(error => {
        console.error('Error fetching product swatches:', error);
        return of(new Map());
      })
    );
  }

  /**
   * Get swatch for a specific attribute value
   */
  getSwatchForValue(attributeId: number, value: string): Observable<SwatchData | null> {
    return this.getAttributeTerms(attributeId).pipe(
      map(terms => {
        const term = terms.find(t => 
          t.name.toLowerCase() === value.toLowerCase() || 
          t.slug.toLowerCase() === value.toLowerCase()
        );
        
        return term ? this.getSwatchDataFromTerm(term) : null;
      })
    );
  }

  /**
   * Clear cache (useful when attributes are updated)
   */
  clearCache(): void {
    this.attributeCache.clear();
  }
}
