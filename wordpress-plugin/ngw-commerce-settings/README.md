# NGW Commerce Settings Plugin

Provides WordPress admin controls that power the Angular storefront homepage:

* Hero slider products selection (with persisted drag order)
* Featured categories selection
* Highlighted products per category mapping
* Versioned, ETag-enabled REST API (`/wp-json/ngw/v1/settings`) for the Angular app to consume
* Paginated product/category product endpoints for admin lazy loading
* Secure, rate-limited cache flush endpoint to invalidate derived caches
* Audit log endpoint for cache flush actions

## Installation

1. Copy the `wordpress-plugin` folder contents into your WordPress `wp-content/plugins/ngw-commerce-settings/` directory (ensure folder name matches main file slug `ngw-commerce-settings.php`).
2. Activate the plugin in WordPress Admin > Plugins.

## Admin Settings Page

Location: `Settings > Commerce Settings` (top-level menu).

Sections (Smart UI):

* Hero Slider Products: Checkbox list with thumbnails, drag-and-drop ordering, lazy pagination ("Load More") consuming `/products` endpoint.
* Featured Categories: Checkbox list with filter.
* Highlighted Products by Category: Collapsible category groups; each loads products incrementally via `/category-products/{id}`.
* Cache Meta Bar: Shows current `cache_version` and exposes a "Flush Cache" button (one flush permitted per admin user per 60 seconds) calling `/cache/flush`.

Data is stored in a single option: `ngw_commerce_settings` for simplified retrieval & caching.

## REST API

Endpoint: `GET /wp-json/ngw/v1/settings`

Adds response headers:
* `ETag`: Stable hash derived from `cache_version` + `updated_at`. Clients may send `If-None-Match` to receive `304 Not Modified`.

Response shape (example):

```json
{
  "hero_slider_products": [12,34],
  "featured_categories": [5,7],
  "highlighted_category_map": {
    "5": [12,90],
    "7": [34]
  },
  "updated_at": "2025-11-03 10:11:12",
  "version": "0.1.0",
  "schema_version": 4,
  "hero_slider_details": [
    {
      "id": 12,
      "title": "Hat",
      "thumbUrl": "https://example.com/wp-content/uploads/hat.jpg",
      "link": "https://example.com/product/hat/",
      "price": 18.00,
      "regularPrice": 24.00,
      "salePrice": 18.00,
      "discountPercent": 25,
      "hasDiscount": true,
      "discountAmount": 6.00,
      "currency": "USD",
      "currencySymbol": "$"
    }
  ],
  "featured_category_details": [{"id":5,"name":"Men","slug":"men"}],
  "highlighted_category_details": [
    {
      "category": {"id":5,"name":"Men","slug":"men"},
      "products": [
        {
          "id": 12,
          "title": "Hat",
          "thumbUrl": "https://example.com/wp-content/uploads/hat.jpg",
          "price": 18.00,
          "regularPrice": 24.00,
          "salePrice": 18.00,
          "discountPercent": 25,
          "hasDiscount": true,
          "discountAmount": 6.00,
          "currency": "USD",
          "currencySymbol": "$"
        }
      ]
    }
  ],
  "cache_version": 7
}
```

### Hero Slider Pricing Fields

Each object in `hero_slider_details` (and nested highlighted category product arrays) can include the following pricing metadata (schema_version >= 4):

Field | Description
----- | -----------
`price` | Effective price (sale price if active; falls back to regular price)
`regularPrice` | Original non-sale list price
`salePrice` | Sale price when discounted (may equal regularPrice if no discount)
`hasDiscount` | Boolean convenience flag indicating a true discount is active
`discountPercent` | Integer percent off (rounded) when discounted
`discountAmount` | Absolute savings amount (`regularPrice - salePrice`)
`currency` | Store currency code (e.g. `USD`, `EUR`)
`currencySymbol` | Symbol derived from WooCommerce (`$`, `€`, etc.)
`thumbUrl` | Large thumbnail URL (placeholder provided if missing)

#### Angular Integration Notes

Recommended hero banner mapping logic:

1. Use `price` for display; show struck-through `regularPrice` when `hasDiscount`.
2. When `hasDiscount` is true, surface both `discountPercent` and `discountAmount` (formatted with symbol if available).
3. Fall back to Angular CurrencyPipe if `currencySymbol` not provided.
4. Treat zero values (`0`) as valid prices; use explicit null/undefined checks in templates.
5. Re-fetch settings when `schema_version` changes (ETag already incorporates it).

Edge Cases:
* If `salePrice` equals `regularPrice`, the backend sets `hasDiscount` false and omits `discountPercent`.
* Variable products still reported via Woo getters—ensure each selected product has a visible price in WooCommerce.
* If prices are entirely absent, fields may be `null`; hide pricing UI gracefully.

#### Example Angular Template Snippet

```html
<div *ngIf="slide.price !== null && slide.price !== undefined">
  <span>{{ slide.currencySymbol ? (slide.currencySymbol + (slide.price | number:'1.2-2')) : (slide.price | currency:slide.currency:'symbol':'1.2-2') }}</span>
  <span *ngIf="slide.hasDiscount && slide.regularPrice" class="line-through">
    {{ slide.currencySymbol ? (slide.currencySymbol + (slide.regularPrice | number:'1.2-2')) : (slide.regularPrice | currency:slide.currency:'symbol':'1.2-2') }}
  </span>
  <span *ngIf="slide.hasDiscount" class="badge">{{ slide.discountPercent }}% · Save {{ slide.currencySymbol ? (slide.currencySymbol + (slide.discountAmount | number:'1.2-2')) : (slide.discountAmount | currency:slide.currency:'symbol':'1.2-2') }}</span>
</div>
```

### Triggering Data Refresh

To force clients to pick up pricing changes:
1. Edit and save settings in the admin page (updates `updated_at`).
2. (Optional) Click "Flush Cache" if underlying product pricing changed outside settings edits.
3. Angular client will receive a new `ETag`; stale clients should re-request the body.

Update endpoint (requires `manage_options` capability):

`POST /wp-json/ngw/v1/settings`

Payload example:

```json
{
  "hero_slider_products": [12,34,56],
  "featured_categories": [5,7],
  "highlighted_category_map": {"5": [12,56], "7": [34]}
}
```

### Search & Pagination Endpoints (Admin UI Enhancements)

Used by admin JavaScript but available for custom tooling:

* `GET /wp-json/ngw/v1/search/products?q=hat&page=1`
* `GET /wp-json/ngw/v1/search/categories?q=men&page=1`

Paginated products (used for hero slider lazy load):

* `GET /wp-json/ngw/v1/products?page=1&per_page=20&search=hat`

Paginated products by category (used inside highlighted accordion groups):

* `GET /wp-json/ngw/v1/category-products/{categoryId}?page=1&per_page=20&search=shoe`

Each paginated endpoint returns:
```json
{ "items": [{"id":123,"title":"Foo","thumbUrl":"https://..."}], "page":1, "perPage":20, "totalPages":3, "total":56 }
```

Flush cache endpoint (secured, rate-limited):

* `POST /wp-json/ngw/v1/cache/flush`

Headers required: `X-WP-Nonce` (admin), capability `manage_options`.

Success response:
Flush audit log endpoint:

* `GET /wp-json/ngw/v1/cache/flush-log?limit=25`

Returns newest-first entries:
```json
{
  "items": [
    {"time":"2025-11-03 10:15:20","user":1,"version":8,"ip":"127.0.0.1"}
  ],
  "count": 12,
  "returned": 1,
  "limit": 25
}
```
```json
{ "success": true, "cache_version": 8, "rate_limit": 60, "flushed_by": 1, "log_count": 12, "next_allowed": 1730639999 }
```

Both return shape:
```json
{ "items": [{"id":123,"title":"Foo"}], "page":1, "totalPages":3 }
```

## Angular Sync Strategy

* On Angular app bootstrap (home route resolver), call the GET endpoint and hydrate UI components.
* Cache response client-side and leverage `ETag` header: send `If-None-Match` on subsequent requests to reduce payload.
* Use `cache_version` to decide if local caches (e.g. aggregated hero slider composition) need rebuild; if version unchanged, skip UI re-render.
* Combine `cache_version` + `updated_at` for more granular diffing if needed (e.g., ignore timestamp-only changes for some layers).
* Implement a periodic revalidation (e.g., every 15 minutes) or use a manual invalidation when navigating to home.

## Security & Hardening

* Public GET endpoint (returns ETag, may be cached by reverse proxies).
* Custom capability `manage_ngw_commerce_settings` granted to administrators on activation; permission callbacks use this (fall back to `manage_options` if missing).
* POST settings & POST cache/flush require custom capability + valid REST nonce.
* GET flush-log requires custom capability.
* Flush endpoint rate-limited to one invocation per user per 60 seconds (returns HTTP 429 with `retry_after` if exceeded).
* All data sanitized (int conversion + filtering) before persistence.
* Flush actions logged (last 50 entries) in option `ngwcs_flush_log` for audit.

## Roadmap / Future Enhancements

1. Image override & CTA buttons per hero product / bespoke hero slides.
2. Pagination & infinite scroll for search results.
3. Layout variants selection (hero style A/B, category grid style, etc.).
4. Versioned settings & changelog audit trail (custom table) for rollback.
5. Webhook push to Angular backend when settings update (instead of client polling).
6. Custom capability `manage_ngw_commerce_settings` instead of `manage_options`.
7. Transient or object-cache layer for aggregated GET response (implemented for product lists with versioned keys; settings endpoint ETag provided).
## Hero Slider Ordering

`hero_slider_order` persists drag-and-drop sequence independent of selection array. When settings are saved without an explicit order, the selection order is used. Angular should always prefer `hero_slider_order` when constructing the hero slider.

## Client Caching Reference Implementation (Pseudo-code)

```typescript
async function fetchSettingsCached(){
  const etag = localStorage.getItem('ngwcs_etag');
  const headers: any = {};
  if(etag){ headers['If-None-Match'] = etag; }
  const res = await fetch('/wp-json/ngw/v1/settings', { headers });
  if(res.status === 304){ return JSON.parse(localStorage.getItem('ngwcs_settings_cache')||'{}'); }
  const data = await res.json();
  const newEtag = res.headers.get('ETag');
  if(newEtag){ localStorage.setItem('ngwcs_etag', newEtag); }
  localStorage.setItem('ngwcs_settings_cache', JSON.stringify(data));
  return data;
}
```
8. WP-CLI commands: `wp ngwcs get`, `wp ngwcs set`, `wp ngwcs export`.
9. Export/import JSON settings backup.
10. Bulk operations & template presets (seasonal setups).

## Contributing

Submit PRs with clear description. Follow WordPress coding standards. Increment version in main plugin file when releasing.

## License

GPLv2 or later.
