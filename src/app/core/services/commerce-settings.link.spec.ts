import { CommerceSettingsService, CommerceSettingsResponse } from './commerce-settings.service';

describe('CommerceSettingsService hero slide link mapping', () => {
  let service: CommerceSettingsService;
  beforeEach(() => { service = new CommerceSettingsService({} as any); });

  function base(): Omit<CommerceSettingsResponse, 'hero_slider_details'> {
    return {
      hero_slider_products: [111, 222],
      hero_slider_order: [111, 222],
      cache_version: 1,
      updated_at: new Date().toISOString(),
      schema_version: 5
    } as any;
  }

  it('uses slug when present (numeric id fallback avoided)', () => {
    const settings: CommerceSettingsResponse = {
      ...base(),
      hero_slider_details: [
        { id: 111, title: 'Product 111', slug: 'smart-watch-pro', link: 'https://example.com/product/smart-watch-pro' },
        { id: 222, title: 'Product 222', slug: 'headphones-x', link: 'https://example.com/product/headphones-x' }
      ] as any
    };
    const slides = service.mapHeroSlides(settings);
    expect(slides[0].ctaLink).toBe('/products/smart-watch-pro');
    expect(slides[1].ctaLink).toBe('/products/headphones-x');
  });

  it('falls back to id path when slug missing', () => {
    const settings: CommerceSettingsResponse = {
      ...base(),
      hero_slider_details: [
        { id: 111, title: 'Product 111', link: 'https://example.com/product/product-111' },
        { id: 222, title: 'Product 222', link: 'https://example.com/product/product-222' }
      ] as any
    };
    const slides = service.mapHeroSlides(settings);
    expect(slides[0].ctaLink).toBe('/products/111');
    expect(slides[1].ctaLink).toBe('/products/222');
  });
});
