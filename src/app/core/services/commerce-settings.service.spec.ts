import { CommerceSettingsService, CommerceSettingsResponse, HeroBannerSlide } from './commerce-settings.service';

describe('CommerceSettingsService.mapHeroSlides', () => {
  let service: CommerceSettingsService;

  beforeEach(() => {
    // Provide a dummy HttpClient (not used for mapHeroSlides). Cast as any.
    service = new CommerceSettingsService({} as any);
  });

  function buildSettings(details: CommerceSettingsResponse['hero_slider_details']): CommerceSettingsResponse {
    return {
      hero_slider_products: details.map(d => d.id),
      hero_slider_order: details.map(d => d.id),
      hero_slider_details: details,
      cache_version: 1,
      updated_at: new Date().toISOString(),
      schema_version: 4
    };
  }

  it('maps regular price only (no discount)', () => {
    const settings = buildSettings([
      { id: 101, title: 'Regular Product', price: 25, regularPrice: 25, salePrice: null, discountPercent: null, currency: 'USD', hasDiscount: false, discountAmount: null, currencySymbol: '$' }
    ]);
    const slides = service.mapHeroSlides(settings) as HeroBannerSlide[];
    expect(slides.length).toBe(1);
    const s = slides[0];
    expect(s.price).toBe(25);
    expect(s.hasDiscount).toBe(false);
    expect(s.discountPercent).toBeNull();
    expect(s.discountAmount).toBeNull();
  });

  it('maps sale price with discount', () => {
    const settings = buildSettings([
      { id: 202, title: 'Sale Product', price: 40, regularPrice: 50, salePrice: 40, discountPercent: 20, currency: 'USD', hasDiscount: true, discountAmount: 10, currencySymbol: '$' }
    ]);
    const slides = service.mapHeroSlides(settings) as HeroBannerSlide[];
    const s = slides[0];
    expect(s.price).toBe(40); // effective price
    expect(s.salePrice).toBe(40);
    expect(s.regularPrice).toBe(50);
    expect(s.hasDiscount).toBe(true);
    expect(s.discountPercent).toBe(20); // from backend
    expect(s.discountAmount).toBe(10);
  });

  it('no discount when sale equals regular', () => {
    const settings = buildSettings([
      { id: 303, title: 'No Discount Product', price: 30, regularPrice: 30, salePrice: 30, discountPercent: null, currency: 'USD', hasDiscount: false, discountAmount: null, currencySymbol: '$' }
    ]);
    const slides = service.mapHeroSlides(settings) as HeroBannerSlide[];
    const s = slides[0];
    expect(s.price).toBe(30);
    expect(s.hasDiscount).toBe(false);
    expect(s.discountPercent).toBeNull();
    expect(s.discountAmount).toBeNull();
  });

  it('computes discountPercent if missing but sale < regular', () => {
    const settings = buildSettings([
      { id: 404, title: 'Computed Discount Product', price: 70, regularPrice: 100, salePrice: 70, discountPercent: null, currency: 'USD', hasDiscount: true, discountAmount: 30, currencySymbol: '$' }
    ]);
    const slides = service.mapHeroSlides(settings) as HeroBannerSlide[];
    const s = slides[0];
    expect(s.discountPercent).toBe(30); // 100->70 => 30%
    expect(s.discountAmount).toBe(30);
  });
});
