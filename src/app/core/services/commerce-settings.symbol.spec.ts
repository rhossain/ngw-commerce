import { CommerceSettingsService, CommerceSettingsResponse } from './commerce-settings.service';

describe('CommerceSettingsService currency symbol decoding', () => {
  let service: CommerceSettingsService;
  beforeEach(() => { service = new CommerceSettingsService({} as any); });

  function settingsWithSymbol(encodedSymbol: string): CommerceSettingsResponse {
    return {
      hero_slider_products: [1],
      hero_slider_order: [1],
      hero_slider_details: [
        { id: 1, title: 'BDT Product', price: 1557.51, regularPrice: 1600, salePrice: 1557.51, discountPercent: 3, hasDiscount: true, discountAmount: 42.49, currency: 'BDT', currencySymbol: encodedSymbol }
      ],
      cache_version: 1,
      updated_at: new Date().toISOString(),
      schema_version: 4
    };
  }

  it('decodes HTML entity currency symbol (BDT)', () => {
    const settings = settingsWithSymbol('&#2547;&nbsp;');
    const slide = service.mapHeroSlides(settings)[0];
    expect(slide.currencySymbol).toBe('৳'); // BDT Taka symbol
  });

  it('passes through plain symbol unchanged', () => {
    const settings = settingsWithSymbol('$');
    const slide = service.mapHeroSlides(settings)[0];
    expect(slide.currencySymbol).toBe('$');
  });
});
