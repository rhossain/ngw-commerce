# NGW Commerce Settings Admin UI

This document describes the WordPress admin interface provided by the NGW Commerce Settings plugin. It enables configuration of homepage product experiences for the Angular storefront.

## Overview
The admin panel ("Commerce Settings") groups functionality into three tabs:

1. Hero Products – choose and order products for the hero slider
2. Featured Categories – select categories to display prominently
3. Highlighted Products – map categories to a curated list of highlighted products

All changes are stored in a structured option and delivered to the frontend via versioned REST API responses with cache + ETag support.

## Hero Products Tab
- Initial load shows the first page (20 items) with drag-and-drop reordering.
- Checkbox selection determines inclusion in the hero slider; drag order defines display order.
- "Load More Products" retrieves additional pages (cached server-side).
- Accessibility: rows are focusable; dragging updates hidden ordering inputs.

## Featured Categories Tab
- Lists available product categories.
- Checkbox marking persists selection.
- Client-side filter bar allows quick name filtering.

## Highlighted Products Tab (Advanced Loading)
This tab includes performance-oriented loading and new UX behaviors:

### Selective Preload
Only products already selected for a category are rendered initially. This keeps first paint light and avoids bulk queries until explicitly requested.

### Initial Load Button
A button labeled "Load First Page" appears for each category group when no pages have been fetched. After first successful load it changes to "Load More (+N)" where N is the currently chosen per-page size (4 / 8 / 12).

### Adjustable Per-Page Size
A per-page selector (4, 8, 12) controls how many products are fetched per request. Changing the value resets pagination state to zero.

### Server-Side Search (Debounced)
A "Server search" input lets you define a search term applied to server requests:
- Debounce: 400ms after typing stops.
- When the term changes, previously loaded (non-selected) products are cleared while keeping selected items.
- Status line updates: "Search ready: <term>. Press Load First Page." to prompt explicit first load.
- Search term persists per category in localStorage.

### Client-Side Filter
Separate input labeled "Filter loaded products" performs in-browser filtering on the currently loaded product rows.

### Clear Loaded Products
"Clear Loaded" button removes all non-selected loaded items for that category, preserving selection, resetting page count, and returning the load button to the initial state.

### Status Line
Displays dynamic progress: "Loaded X of Y" optionally with search context ("(search: term)"). When everything is loaded the load button disables and reads "All Loaded".

### Sorting
Use the "Sort" selector to change ordering before loading pages:
- Default – underlying WordPress ordering
- Newest – recent products first (date DESC)
- Price ↑ – ascending by product price
- Price ↓ – descending by product price

### Multi-Sort (Composite Modes)
Two composite options refine curation when both freshness and price matter:

- Newest + Price ↑ (`newest_price_asc`): Primary sort by newest (date DESC). If two products share the same publish date (to the second), the one with lower price appears first. Missing prices are treated as very high values and sink to the bottom of same-date groups.
- Newest + Price ↓ (`newest_price_desc`): Same primary newest ordering; ties broken by higher price first. Missing prices are treated as very low priority within the tie-break (placed last among equal-date items).

Implementation detail: The server queries by date DESC then performs a stable post‑processing pass to apply the secondary price order only for items whose date value is identical. This avoids complex meta query overhead while keeping predictable ordering.

Recommendation: Use composite modes when running short promotional campaigns where grouping by release date is important, and you want a price gradient within each release batch.

Changing sort clears non-selected loaded rows while keeping selected ones. Status line updates with `[sort: key]`.

### Select Newly Loaded Helper
After a load, click "Select Newly Loaded" to quickly check all products fetched in the most recent page without affecting previously loaded items. This action is idempotent per page (clears the tracking list once applied).

### Hover Card Preview
Hold the Alt key and move the pointer over a loaded product row to display a small hover card showing:
- Product title
- Price (if available)
- Thumbnail (60×60)

This reduces clicks needed to inspect product details while curating highlighted selections.

#### Keyboard Shortcut
Focused row + press `h` (lowercase or uppercase) toggles the hover card positioned beneath the row. Press `Esc` to close. This provides full keyboard accessibility without relying on the Alt + mouse gesture.

Hover card content now includes stock status (see Stock Badges) if available.

### Reset Search Button
The small × button beside the server search input clears the current server-side search term, removes persisted page context, and resets the load button to "Load First Page".

### Persistence (localStorage)
Each category maintains the following keys:
- `ngwcs_cat_page_<id>` – last loaded page number (omitted if none loaded or after clear/search reset)
- `ngwcs_cat_per_page_<id>` – selected per-page size
- `ngwcs_cat_search_<id>` – current search term (if any)
- `ngwcs_cat_sort_<id>` – current sort key (if selected)

On re-entry to the admin panel:
- If pages were previously loaded, the load button resumes as "Load More (+N)".
- If only a search term exists and no pages loaded, status guides the admin to perform the first load.

### Accessibility & Feedback
### Stock Badges
Products loaded for Highlighted mapping include inventory context when available:

| Status Key      | Badge Text      | Color Purpose |
|-----------------|-----------------|---------------|
| `instock`       | In Stock        | Green – Available immediately |
| `outofstock`    | Out of Stock    | Red – Not currently purchasable |
| `onbackorder`   | Backorder       | Amber – Purchasable with delayed fulfillment |

Badges appear inside the hover card under the Stock line. Absence of a badge indicates no stock metadata for the product (legacy products or missing inventory data).

### Select / Unselect Newly Loaded Workflow
Each load action for a category stores the IDs of the just-fetched batch:

1. Click "Select Newly Loaded" to bulk check only the latest page's products. After execution the tracking list is cleared so the action won't re-toggle older pages.
2. If you change your mind before loading another page, use "Unselect Newly Loaded" to revert those selections. This also clears tracking.
3. Subsequent loads create a fresh tracking list. This pattern prevents accidental multi-page bulk selection and keeps intent explicit.

Tip: Load, inspect via hover card (`h`), then bulk select with "Select Newly Loaded"—repeat until enough curated items are chosen.
- Spinner appears inside load button during network fetch.
- Status region uses `aria-live="polite"` for incremental updates.
- Buttons remain keyboard accessible; focus styles rely on CSS variable driven shadow.

## REST API & Caching Notes
- Category product loads use paginated endpoint: `/wp-json/ngw/v1/category-products/<categoryId>?page=<n>&per_page=<size>&search=<term>`.
- Responses contain `items`, `page`, `perPage`, `totalPages`, and `total` enabling progress calculations.
- Results are cached per version for 5 minutes to reduce load.

## Performance Rationale
The selective initial rendering, manual first page trigger, and small adjustable batch sizes reduce:
- Unnecessary queries for categories the admin never expands.
- Memory usage in long admin sessions.
- Network bandwidth from large unfiltered category pulls.

## Common Workflows
1. Curate highlighted products quickly:
   - Expand category
   - Enter search term (e.g., "Summer")
   - Load first page
   - Select desired products
   - Adjust per-page to 8 if exploring more
   - Load more until satisfied
2. Refine search:
   - Change search term
   - Wait debounce
   - Load first page again
3. Reset view:
   - Click "Clear Loaded" to discard non-selected rows
   - Perform new search or load first page fresh

## Edge Cases
- Zero results: status shows "Loaded 0 of 0 (search: term)"; button disables.
- Changing per-page mid-session: resets page count and load button; previously loaded rows persist until cleared (recommended to Clear for consistent pagination).
- Selecting products then clearing: selections are preserved so they remain mapped to the category.

## Future Enhancements (Optional)
- Bulk price / stock indicators.
- Multi-select actions (e.g., mark top N loaded as highlighted automatically).
- Persistent pinned products section.

## Troubleshooting
| Issue | Cause | Resolution |
|-------|-------|-----------|
| Load button stays disabled | All pages loaded | Clear or change search/per-page to fetch different products |
| Search does nothing | Typing continuous | Pause briefly (400ms debounce) then press Load First Page |
| Products reappear after search change | Selected items retained | Use Clear Loaded if you want a minimal set before new search |

## Versioning
This README documents admin behaviors introduced after incremental loading/per-page/spinner enhancements (November 2025). Keep in sync when adding new UX components.

---
**Last Updated:** November 4, 2025
