(function($){
    function updateCounts(){
        const heroTotal = $('.ngwcs-tab-panel[data-panel="hero"] .ngwcs-products[data-draggable="hero"] .ngwcs-row').length;
        const heroSelected = $('.ngwcs-tab-panel[data-panel="hero"] input[type="checkbox"]:checked').length;
        const catTotal = $('.ngwcs-tab-panel[data-panel="featured"] .ngwcs-categories .ngwcs-row').length;
        const catSelected = $('.ngwcs-tab-panel[data-panel="featured"] input[type="checkbox"]:checked').length;
        const highlightedSelected = $('.ngwcs-tab-panel[data-panel="highlighted"] input[type="checkbox"]:checked').length;
        $('.ngwcs-tab[data-tab="hero"]').find('.ngwcs-count-badge').remove();
        $('.ngwcs-tab[data-tab="hero"]').append('<span class="ngwcs-count-badge" aria-label="'+heroSelected+' selected of '+heroTotal+'">'+heroSelected+'/'+heroTotal+'</span>');
        $('.ngwcs-tab[data-tab="featured"]').find('.ngwcs-count-badge').remove();
        $('.ngwcs-tab[data-tab="featured"]').append('<span class="ngwcs-count-badge" aria-label="'+catSelected+' selected of '+catTotal+'">'+catSelected+'/'+catTotal+'</span>');
        $('.ngwcs-tab[data-tab="highlighted"]').find('.ngwcs-count-badge').remove();
        $('.ngwcs-tab[data-tab="highlighted"]').append('<span class="ngwcs-count-badge" aria-label="'+highlightedSelected+' total highlighted selections">'+highlightedSelected+'</span>');
    }

    function switchTab($btn){
        const target = $btn.data('tab');
        $btn.addClass('is-active').attr('aria-selected','true').siblings('.ngwcs-tab').removeClass('is-active').attr('aria-selected','false');
        $('.ngwcs-tab-panel').each(function(){
            const $panel = $(this);
            if($panel.data('panel') === target){
                $panel.addClass('is-active').removeAttr('hidden').attr('tabindex','0').focus();
            } else {
                $panel.removeClass('is-active').attr('hidden','hidden').removeAttr('tabindex');
            }
        });
    }

    function initDragOrdering(){
        const $list = $('.ngwcs-products[data-draggable="hero"]');
        if(!$list.length) return;
        let $dragging=null; let $placeholder=$('<li class="ngwcs-drag-placeholder"/>');
        $list.on('dragstart', '.ngwcs-row', function(e){
            $dragging=$(this).addClass('is-dragging');
            e.originalEvent.dataTransfer.effectAllowed='move';
        });
        $list.on('dragend', '.ngwcs-row', function(){
            if($dragging){ $dragging.removeClass('is-dragging'); $placeholder.remove(); $dragging=null; regenerateHeroOrder(); updateCounts(); }
        });
        $list.on('dragover', function(e){
            e.preventDefault();
            if(!$dragging) return;
            const y = e.originalEvent.clientY;
            let placed=false;
            $list.children('.ngwcs-row').not('.is-dragging').each(function(){
                const rect=this.getBoundingClientRect();
                if(y < rect.top + rect.height/2){
                    $placeholder.insertBefore(this); placed=true; return false;
                }
            });
            if(!placed){ $list.append($placeholder); }
        });
        $list.on('drop', function(e){ e.preventDefault(); if($dragging){ $placeholder.replaceWith($dragging); }});
    }

    function regenerateHeroOrder(){
        const $wrapper = $('.ngwcs-hero-list-wrapper');
        const $orderContainer = $wrapper.find('.ngwcs-order-hidden');
        $orderContainer.empty();
        const ids = [];
        $wrapper.find('ul.ngwcs-products .ngwcs-row').each(function(){
            const $row = $(this);
            const checkbox = $row.find('input[type="checkbox"]');
            if(checkbox.is(':checked')){ ids.push($row.data('id')); }
        });
        ids.forEach(id=>{ $orderContainer.append('<input type="hidden" name="'+NGWCS_DATA.optionKey+'[hero_slider_order][]" value="'+id+'">'); });
    }

    function injectFilters(){
        // Hero filter
        const $heroPanel = $('.ngwcs-tab-panel[data-panel="hero"]');
        if($heroPanel.find('.ngwcs-filter-bar').length===0){
            $('<div class="ngwcs-filter-bar"><input type="text" placeholder="Filter products" aria-label="Filter hero products"></div>').insertBefore($heroPanel.find('.ngwcs-list')); }
        // Featured categories filter
        const $featPanel = $('.ngwcs-tab-panel[data-panel="featured"]');
        if($featPanel.find('.ngwcs-filter-bar').length===0){
            $('<div class="ngwcs-filter-bar"><input type="text" placeholder="Filter categories" aria-label="Filter categories"></div>').insertBefore($featPanel.find('.ngwcs-list')); }
    }

    function initFilters(){
        $('.ngwcs-tab-panel').on('input', '.ngwcs-filter-bar input', function(){
            const q = $(this).val().toLowerCase();
            const $list = $(this).closest('.ngwcs-tab-panel').find('.ngwcs-list').first();
            $list.children('.ngwcs-row').each(function(){
                const text = $(this).text().toLowerCase();
                $(this).toggle(text.indexOf(q) !== -1);
            });
        });
    }

    function initAccessibility(){
        // Keyboard navigation for tabs (Left/Right/Home/End)
        $('.ngwcs-tab').attr('tabindex','0');
        $('.ngwcs-tab-nav').on('keydown', '.ngwcs-tab', function(e){
            const $tabs = $('.ngwcs-tab');
            let idx = $tabs.index(this);
            if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
                e.preventDefault();
                if(e.key==='ArrowRight'){ idx = (idx+1)%$tabs.length; }
                if(e.key==='ArrowLeft'){ idx = (idx-1+$tabs.length)%$tabs.length; }
                if(e.key==='Home'){ idx = 0; }
                if(e.key==='End'){ idx = $tabs.length-1; }
                const $target = $tabs.eq(idx); $target.focus(); switchTab($target); updateCounts();
            }
        });
    }

    function initCountsListeners(){
        $('.ngwcs-form').on('change', 'input[type="checkbox"]', updateCounts);
        $('.ngwcs-form').on('change', 'input[type="checkbox"][name*="hero_slider_products"]', regenerateHeroOrder);
        updateCounts();
    }

    function initHeroIncremental(){
        // Restore persisted per-page & page (if any)
        const storedHeroPer = localStorage.getItem('ngwcs_hero_per_page');
        if(storedHeroPer){ $('.ngwcs-hero-per-page').val(storedHeroPer); }
        const storedHeroPage = parseInt(localStorage.getItem('ngwcs_hero_page')||'0',10);
        if(storedHeroPage>0){
            // Show load more button state
            const $btn = $('.ngwcs-load-hero-products');
            if($btn.length){ $btn.removeClass('ngwcs-load-initial').text('Load More'); }
        }
        const storedHeroSearch = localStorage.getItem('ngwcs_hero_search');
        if(storedHeroSearch){
            $('.ngwcs-hero-search').val(storedHeroSearch);
            $('.ngwcs-hero-list-wrapper').data('search', storedHeroSearch);
            $('.ngwcs-hero-status').text('Search ready: '+storedHeroSearch+'. Press Load First Page.');
        }
        const storedHeroSort = localStorage.getItem('ngwcs_hero_sort');
        if(storedHeroSort){
            $('.ngwcs-hero-sort').val(storedHeroSort);
            $('.ngwcs-hero-list-wrapper').data('sort', storedHeroSort);
        }
        $('.ngwcs-form').on('click', '.ngwcs-load-hero-products', function(){
            const $btn = $(this);
            const $wrap = $btn.closest('.ngwcs-hero-list-wrapper');
            const $list = $wrap.find('ul.ngwcs-products');
            let page = parseInt($wrap.data('page'),10) || 0; // 0 means nothing loaded yet
            const perPageSel = $('.ngwcs-hero-per-page');
            const perPage = perPageSel.length ? parseInt(perPageSel.val(),10) : 12;
            const search = $wrap.data('search') || '';
            const sort = $wrap.data('sort') || '';
            $btn.prop('disabled', true).html('<span class="ngwcs-spinner" aria-hidden="true"></span><span>'+(page===0?'Loading First Page...':'Loading...')+'</span>');
            const nextPage = page + 1;
            const qs = 'page=' + nextPage + '&per_page=' + perPage + (search?('&search='+encodeURIComponent(search)):'') + (sort?('&sort='+encodeURIComponent(sort)):'');
            fetch(window.wpApiSettings.root + NGWCS_DATA.restNamespace + '/products?' + qs, {
                headers: { 'X-WP-Nonce': NGWCS_DATA.nonce }
            }).then(r=>r.json()).then(data=>{
                const existingIds = new Set();
                $list.find('.ngwcs-row').each(function(){ existingIds.add(parseInt($(this).data('id'),10)); });
                (data.items||[]).forEach(item=>{
                    if(existingIds.has(item.id)) return; // skip duplicates
                    const thumb = item.thumbUrl ? '<img src="'+item.thumbUrl+'" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;" />' : '<span class="ngwcs-thumb ngwcs-thumb--placeholder" style="width:40px;height:40px;display:inline-block;background:#eee;border-radius:4px;margin-right:8px;"></span>';
                    const row = '<li class="ngwcs-row" draggable="true" data-id="'+item.id+'"><label>'+thumb+'<input type="checkbox" name="'+NGWCS_DATA.optionKey+'[hero_slider_products][]" value="'+item.id+'"> '+item.title+' <span class="ngwcs-id">#'+item.id+'</span></label></li>';
                    $list.append(row);
                });
                const loadedNow = ($list.find('.ngwcs-row').length);
                $wrap.data('page', nextPage).data('loaded', loadedNow);
                localStorage.setItem('ngwcs_hero_page', String(nextPage));
                localStorage.setItem('ngwcs_hero_per_page', String(perPage));
                const total = typeof data.total === 'number' ? data.total : loadedNow;
                $wrap.data('total', total);
                const allLoaded = total && loadedNow >= total;
                if(allLoaded){ $btn.removeClass('ngwcs-load-initial').prop('disabled', true).text('All Loaded'); }
                else { $btn.removeClass('ngwcs-load-initial').prop('disabled', false).text('Load More'); }
                const statusText = 'Loaded '+loadedNow+(total?(' of '+total):'') + (search?(' (search: '+search+')'):'') + (sort?(' [sort: '+sort+']'):'');
                $('.ngwcs-hero-status').text(statusText);
                updateCounts();
            }).catch(err=>{
                console.error('Hero load error', err); $btn.prop('disabled', false).text('Retry');
            });
        });
        // Clear non-selected hero products
        $('.ngwcs-form').on('click', '.ngwcs-clear-hero-products', function(){
            const $wrap = $('.ngwcs-hero-list-wrapper');
            const $list = $wrap.find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                if(!cb.is(':checked')){ $row.remove(); }
            });
            $wrap.data('page', 0);
            localStorage.removeItem('ngwcs_hero_page');
            const $btn = $('.ngwcs-load-hero-products'); if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).text('Load First Page'); }
            updateCounts();
        });
        // Per-page change resets page and clears non-selected hero rows
        $('.ngwcs-form').on('change', '.ngwcs-hero-per-page', function(){
            const val = $(this).val();
            localStorage.setItem('ngwcs_hero_per_page', String(val));
            const $wrap = $('.ngwcs-hero-list-wrapper');
            const $list = $wrap.find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                if(!cb.is(':checked')){ $row.remove(); }
            });
            $wrap.data('page', 0);
            localStorage.removeItem('ngwcs_hero_page');
            const $btn = $('.ngwcs-load-hero-products'); if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).text('Load First Page'); }
            $('.ngwcs-hero-status').text('');
        });
        // Hero server search debounce
        let heroSearchTimer=null;
        $('.ngwcs-form').on('input', '.ngwcs-hero-search', function(){
            const $input = $(this);
            const val = $input.val().trim();
            const $wrap = $('.ngwcs-hero-list-wrapper');
            if(heroSearchTimer){ clearTimeout(heroSearchTimer); }
            heroSearchTimer = setTimeout(()=>{
                const $list = $wrap.find('ul.ngwcs-products');
                $list.children('.ngwcs-row').each(function(){
                    const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                    if(!cb.is(':checked')){ $row.remove(); }
                });
                $wrap.data('page', 0);
                localStorage.removeItem('ngwcs_hero_page');
                if(val){
                    $wrap.data('search', val);
                    localStorage.setItem('ngwcs_hero_search', val);
                    $('.ngwcs-hero-status').text('Search ready: '+val+'. Press Load First Page.');
                } else {
                    $wrap.removeData('search');
                    localStorage.removeItem('ngwcs_hero_search');
                    $('.ngwcs-hero-status').text('');
                }
                const $btn = $('.ngwcs-load-hero-products'); if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).text('Load First Page'); }
            }, 400);
        });
        // Hero reset search
        $('.ngwcs-form').on('click', '.ngwcs-hero-reset-search', function(){
            const $wrap = $('.ngwcs-hero-list-wrapper');
            $wrap.removeData('search');
            localStorage.removeItem('ngwcs_hero_search');
            $wrap.data('page',0);
            localStorage.removeItem('ngwcs_hero_page');
            const $list = $wrap.find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                if(!cb.is(':checked')){ $row.remove(); }
            });
            $('.ngwcs-hero-search').val('');
            $('.ngwcs-hero-status').text('Search reset. Ready for first load.');
            const $btn = $('.ngwcs-load-hero-products'); if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).text('Load First Page'); }
        });
        // Hero sort change
        $('.ngwcs-form').on('change', '.ngwcs-hero-sort', function(){
            const val = $(this).val();
            const $wrap = $('.ngwcs-hero-list-wrapper');
            if(val){
                $wrap.data('sort', val);
                localStorage.setItem('ngwcs_hero_sort', val);
            } else {
                $wrap.removeData('sort');
                localStorage.removeItem('ngwcs_hero_sort');
            }
            // Clear non-selected rows
            const $list = $wrap.find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                if(!cb.is(':checked')){ $row.remove(); }
            });
            $wrap.data('page',0);
            localStorage.removeItem('ngwcs_hero_page');
            const $btn = $('.ngwcs-load-hero-products'); if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).text('Load First Page'); }
            $('.ngwcs-hero-status').text('Sort changed: '+(val||'default')+'. Press Load First Page.');
        });
    }

    function loadCategoryProducts(catId, page=1, perPage=4, search='', sort=''){
        const qs = 'page=' + page + '&per_page=' + perPage +
            (search ? ('&search=' + encodeURIComponent(search)) : '') +
            (sort ? ('&sort=' + encodeURIComponent(sort)) : '');
        return fetch(window.wpApiSettings.root + NGWCS_DATA.restNamespace + '/category-products/' + catId + '?' + qs, {
            headers: { 'X-WP-Nonce': NGWCS_DATA.nonce }
        }).then(r=>r.json());
    }

    function initCategoryLoad(){
        $('.ngwcs-form').on('click', '.ngwcs-load-category-products', function(){
            const $btn = $(this);
            const catId = $btn.data('category');
            const $wrapper = $btn.closest('.ngwcs-category-products-wrapper');
            let page = parseInt($wrapper.data('page'),10) || 0; // page 0 means none loaded yet
                const perPageSelect = $wrapper.find('select.ngwcs-per-page');
                const perPage = perPageSelect.length ? parseInt(perPageSelect.val(),10) : 4;
                const statusEl = $wrapper.find('.ngwcs-cat-status');
            const search = $wrapper.data('search') || '';
            const sort = $wrapper.data('sort') || '';
                $btn.prop('disabled', true).html('<span class="ngwcs-spinner" aria-hidden="true"></span><span>'+(page===0?'Loading...':'Loading more...')+'</span>');
            const nextPage = page + 1; // API pages start at 1
            loadCategoryProducts(catId, nextPage, perPage, search, sort).then(data=>{
                const $list = $wrapper.find('ul.ngwcs-products');
                const existingIds = new Set();
                $list.find('.ngwcs-row').each(function(){ existingIds.add(parseInt($(this).data('id'),10)); });
                const newlyLoaded = [];
                (data.items||[]).forEach(item=>{
                    if(existingIds.has(item.id)) return;
                    const thumb = item.thumbUrl ? '<img loading="lazy" src="'+item.thumbUrl+'" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;" />' : '<span class="ngwcs-thumb ngwcs-thumb--placeholder" style="width:40px;height:40px;display:inline-block;background:#eee;border-radius:4px;margin-right:8px;"></span>';
                    const price = (item.price !== null && item.price !== undefined) ? '<span class="ngwcs-price">$'+item.price+'</span>' : '';
                    const stockStatus = (item.stockStatus || '').toLowerCase();
                    const row = '<li class="ngwcs-row" tabindex="0" data-id="'+item.id+'" data-price="'+(item.price!==null?item.price:'')+'" data-title="'+(item.title||'')+'" data-stock-status="'+stockStatus+'" data-stock="'+(item.stock!==undefined && item.stock!==null?item.stock:'')+'"><label>'+thumb+'<input type="checkbox" name="'+NGWCS_DATA.optionKey+'[highlighted_category_map]['+catId+'][]" value="'+item.id+'"> '+item.title+' '+price+' <span class="ngwcs-id">#'+item.id+'</span></label></li>';
                    $list.append(row);
                    newlyLoaded.push(item.id);
                });
                $wrapper.data('page', nextPage);
                    localStorage.setItem('ngwcs_cat_page_'+catId, String(nextPage));
                    localStorage.setItem('ngwcs_cat_per_page_'+catId, String(perPage));
                if(search){ localStorage.setItem('ngwcs_cat_search_'+catId, search); }
                if(sort){ localStorage.setItem('ngwcs_cat_sort_'+catId, sort); }
                $wrapper.data('newlyLoaded', newlyLoaded);
                    const total = typeof data.total === 'number' ? data.total : (nextPage * perPage);
                    const loaded = $list.find('.ngwcs-row').length;
                    if(statusEl.length){
                    statusEl.text('Loaded '+loaded+(total?(' of '+total):'') + (search ? ' (search: '+search+')' : '') + (sort? ' [sort: '+sort+']':'') );
                    }
                    const allLoaded = total && loaded >= total;
                if(allLoaded || nextPage >= (data.totalPages||1)){
                    $btn.removeClass('ngwcs-load-initial').html('All Loaded').prop('disabled', true);
                } else {
                    $btn.removeClass('ngwcs-load-initial').prop('disabled', false).html('Load More (+'+perPage+')');
                }
                updateCounts();
            }).catch(err=>{
                console.error('Category load error', err); $btn.prop('disabled', false).text('Retry');
            });
        });
        // Category filter
        $('.ngwcs-form').on('input', '.ngwcs-category-filter', function(){
            const q = $(this).val().toLowerCase();
            const $list = $(this).closest('.ngwcs-category-products-wrapper').find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const text = $(this).text().toLowerCase();
                $(this).toggle(text.indexOf(q) !== -1);
            });
        });
        // Server search debounce
        let searchTimer=null;
        $('.ngwcs-form').on('input', '.ngwcs-category-search', function(){
            const $input = $(this);
            const val = $input.val().trim();
            const $wrap = $input.closest('.ngwcs-category-products-wrapper');
            const catId = $wrap.data('category-id');
            if(searchTimer){ clearTimeout(searchTimer); }
            searchTimer = setTimeout(()=>{
                // Reset list (keep selected items) and page
                const $list = $wrap.find('ul.ngwcs-products');
                $list.children('.ngwcs-row').each(function(){
                    const $row = $(this);
                    const cb = $row.find('input[type="checkbox"]');
                    if(!cb.is(':checked')){ $row.remove(); }
                });
                $wrap.data('page', 0);
                if(val){
                    $wrap.data('search', val);
                    localStorage.setItem('ngwcs_cat_search_'+catId, val);
                } else {
                    $wrap.removeData('search');
                    localStorage.removeItem('ngwcs_cat_search_'+catId);
                }
                const statusEl = $wrap.find('.ngwcs-cat-status');
                if(statusEl.length){ statusEl.text(val ? ('Search ready: '+val+'. Press Load First Page.') : ''); }
                const $btn = $wrap.find('.ngwcs-load-category-products');
                $btn.addClass('ngwcs-load-initial').prop('disabled', false).html('Load First Page');
                localStorage.removeItem('ngwcs_cat_page_'+catId);
            }, 400);
        });
        // Clear loaded products
        $('.ngwcs-form').on('click', '.ngwcs-clear-category-products', function(){
            const $btn = $(this);
            const catId = $btn.data('category');
            const $wrap = $btn.closest('.ngwcs-category-products-wrapper');
            const $list = $wrap.find('ul.ngwcs-products');
            $list.children('.ngwcs-row').each(function(){
                const $row = $(this);
                const cb = $row.find('input[type="checkbox"]');
                if(!cb.is(':checked')){ $row.remove(); }
            });
            $wrap.data('page', 0);
            localStorage.removeItem('ngwcs_cat_page_'+catId);
            const statusEl = $wrap.find('.ngwcs-cat-status');
            if(statusEl.length){ statusEl.text('Cleared. Ready for first load.'); }
            const $loadBtn = $wrap.find('.ngwcs-load-category-products');
            $loadBtn.addClass('ngwcs-load-initial').prop('disabled', false).html('Load First Page');
            $wrap.removeData('newlyLoaded');
        });
        // Restore persisted search
        $('.ngwcs-category-products-wrapper').each(function(){
            const $wrap = $(this);
            const catId = $wrap.data('category-id');
            const storedSearch = localStorage.getItem('ngwcs_cat_search_'+catId);
            if(storedSearch){
                $wrap.data('search', storedSearch);
                const $searchInput = $wrap.find('.ngwcs-category-search');
                if($searchInput.length){ $searchInput.val(storedSearch); }
                const statusEl = $wrap.find('.ngwcs-cat-status');
                if(statusEl.length && parseInt($wrap.data('page'),10)===0){ statusEl.text('Search ready: '+storedSearch+'. Press Load First Page.'); }
            }
            const storedSort = localStorage.getItem('ngwcs_cat_sort_'+catId);
            if(storedSort){
                $wrap.data('sort', storedSort);
                const $sortSel = $wrap.find('select.ngwcs-sort');
                if($sortSel.length){ $sortSel.val(storedSort); }
            }
        });
            // Restore persisted per-page selection and page status
            $('.ngwcs-category-products-wrapper').each(function(){
                const $wrap = $(this);
                const catId = $wrap.data('category-id');
                const storedPer = localStorage.getItem('ngwcs_cat_per_page_'+catId);
                if(storedPer){
                    const $sel = $wrap.find('select.ngwcs-per-page');
                    if($sel.length){ $sel.val(storedPer); }
                }
                const storedPage = localStorage.getItem('ngwcs_cat_page_'+catId);
                if(storedPage){
                    $wrap.data('page', parseInt(storedPage,10));
                    const statusEl = $wrap.find('.ngwcs-cat-status');
                    if(statusEl.length){ statusEl.text('Previously loaded '+storedPage+' page(s)'); }
                    const $btn = $wrap.find('.ngwcs-load-category-products');
                    if($btn.length && parseInt(storedPage,10)>0){ $btn.removeClass('ngwcs-load-initial').html('Load More (+'+($wrap.find('select.ngwcs-per-page').val()||4)+')'); }
                } else {
                    // ensure initial styling when nothing loaded
                    const $btn = $wrap.find('.ngwcs-load-category-products');
                    if($btn.length){ $btn.addClass('ngwcs-load-initial').html('Load First Page'); }
                }
            });
            // Handle per-page change (reset page and clear stored page)
            $('.ngwcs-form').on('change', 'select.ngwcs-per-page', function(){
                const $sel = $(this);
                const $wrap = $sel.closest('.ngwcs-category-products-wrapper');
                const catId = $wrap.data('category-id');
                $wrap.data('page', 0);
                localStorage.setItem('ngwcs_cat_per_page_'+catId, String($sel.val()));
                localStorage.removeItem('ngwcs_cat_page_'+catId);
                const statusEl = $wrap.find('.ngwcs-cat-status');
                if(statusEl.length){ statusEl.text(''); }
                const $btn = $wrap.find('.ngwcs-load-category-products');
                if($btn.length){ $btn.prop('disabled', false).text('Load Products'); }
            });
            // Handle sort change
            $('.ngwcs-form').on('change', 'select.ngwcs-sort', function(){
                const $sel = $(this);
                const $wrap = $sel.closest('.ngwcs-category-products-wrapper');
                const catId = $wrap.data('category-id');
                const val = $sel.val();
                if(val){
                    $wrap.data('sort', val);
                    localStorage.setItem('ngwcs_cat_sort_'+catId, val);
                } else {
                    $wrap.removeData('sort');
                    localStorage.removeItem('ngwcs_cat_sort_'+catId);
                }
                // Clear non-selected loaded rows
                const $list = $wrap.find('ul.ngwcs-products');
                $list.children('.ngwcs-row').each(function(){
                    const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                    if(!cb.is(':checked')){ $row.remove(); }
                });
                $wrap.data('page', 0);
                localStorage.removeItem('ngwcs_cat_page_'+catId);
                const statusEl = $wrap.find('.ngwcs-cat-status');
                if(statusEl.length){ statusEl.text('Sort changed: '+(val||'default')+'. Press Load First Page.'); }
                const $btn = $wrap.find('.ngwcs-load-category-products');
                if($btn.length){ $btn.addClass('ngwcs-load-initial').prop('disabled', false).html('Load First Page'); }
            });
            // Reset search button
            $('.ngwcs-form').on('click', '.ngwcs-reset-search', function(){
                const $btn = $(this);
                const $wrap = $btn.closest('.ngwcs-category-products-wrapper');
                const catId = $wrap.data('category-id');
                $wrap.removeData('search');
                localStorage.removeItem('ngwcs_cat_search_'+catId);
                $wrap.data('page', 0);
                localStorage.removeItem('ngwcs_cat_page_'+catId);
                const $searchInput = $wrap.find('.ngwcs-category-search'); if($searchInput.length){ $searchInput.val(''); }
                // Clear non-selected loaded products
                const $list = $wrap.find('ul.ngwcs-products');
                $list.children('.ngwcs-row').each(function(){
                    const $row = $(this); const cb = $row.find('input[type="checkbox"]');
                    if(!cb.is(':checked')){ $row.remove(); }
                });
                const statusEl = $wrap.find('.ngwcs-cat-status'); if(statusEl.length){ statusEl.text('Search reset. Ready for first load.'); }
                const $loadBtn = $wrap.find('.ngwcs-load-category-products'); if($loadBtn.length){ $loadBtn.addClass('ngwcs-load-initial').prop('disabled', false).html('Load First Page'); }
            });
            // Select newly loaded helper
            $('.ngwcs-form').on('click', '.ngwcs-select-newly-loaded', function(){
                const $btn = $(this); const catId = $btn.data('category');
                const $wrap = $btn.closest('.ngwcs-category-products-wrapper');
                const ids = $wrap.data('newlyLoaded') || [];
                if(!ids.length){ return; }
                ids.forEach(id=>{
                    const cb = $wrap.find('input[value="'+id+'"]'); if(cb.length){ cb[0].checked = true; }
                });
                // After selection, clear newlyLoaded memory to prevent re-selection spam
                $wrap.removeData('newlyLoaded');
                updateCounts();
            });
            // Unselect newly loaded helper
            $('.ngwcs-form').on('click', '.ngwcs-unselect-newly-loaded', function(){
                const $btn = $(this); const catId = $btn.data('category');
                const $wrap = $btn.closest('.ngwcs-category-products-wrapper');
                const ids = $wrap.data('newlyLoaded') || [];
                if(!ids.length){ return; }
                ids.forEach(id=>{
                    const cb = $wrap.find('input[value="'+id+'"]'); if(cb.length){ cb[0].checked = false; }
                });
                // Clear memory after unselect to avoid repeated unselect attempts
                $wrap.removeData('newlyLoaded');
                updateCounts();
            });
            // Hover card
            let $hover = $('<div class="ngwcs-hover-card" role="dialog" aria-live="polite" aria-hidden="true"></div>').appendTo('body');
            function buildHoverHtml($row){
                const title = $row.data('title');
                const price = $row.data('price');
                const stockStatus = ($row.data('stock-status')||'').toString();
                let html = '<h4>'+title+'</h4>';
                if(price){ html += '<div class="ngwcs-hover-meta">Price: <span class="ngwcs-price">$'+price+'</span></div>'; }
                if(stockStatus){
                    const human = stockStatus.replace(/-/g,' ');
                    html += '<div class="ngwcs-hover-meta">Stock: <span class="ngwcs-stock-badge" data-status="'+stockStatus+'">'+human+'</span></div>';
                }
                const img = $row.find('img').attr('src');
                if(img){ html += '<div style="margin-top:6px;"><img src="'+img+'" alt="'+title+'" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" /></div>'; }
                return html;
            }
            function showHover($row, e){
                const html = buildHoverHtml($row);
                $hover.data('active-row', $row[0]);
                $hover.html(html).css({ top: (e.pageY + 12)+'px', left: (e.pageX + 12)+'px' }).attr('aria-hidden','false').fadeIn(100);
            }
            function showHoverAtRow($row){
                const html = buildHoverHtml($row);
                const offset = $row.offset();
                $hover.data('active-row', $row[0]);
                $hover.html(html).css({ top: (offset.top + $row.outerHeight() + 8)+'px', left: (offset.left + 16)+'px' }).attr('aria-hidden','false').fadeIn(100);
            }
            function hideHover(){ $hover.hide(); }
            $(document).on('mousemove', '.ngwcs-category-products-wrapper .ngwcs-row', function(e){
                const $row = $(this);
                if(e.altKey){ showHover($row, e); } else { hideHover(); }
            });
            $(document).on('mouseleave', '.ngwcs-category-products-wrapper .ngwcs-row', hideHover);
            // Keyboard shortcut (press 'h' while focused on a row to toggle hover card; Esc to close)
            $(document).on('keydown', '.ngwcs-category-products-wrapper .ngwcs-row', function(e){
                if(e.key === 'h' || e.key === 'H'){
                    e.preventDefault();
                    const $row = $(this);
                    if($hover.is(':visible') && $hover.data('active-row') === $row[0]){
                        hideHover();
                    } else {
                        showHoverAtRow($row);
                    }
                } else if(e.key === 'Escape'){
                    hideHover();
                }
            });
    }

    function initCategoryBulkSelect(){
        $(document).on('click', '.ngwcs-select-all-cat', function(){
            const catId = $(this).data('category');
            const $list = $('ul.ngwcs-products[data-category-list="'+catId+'"]').first();
            $list.find('input[type="checkbox"]').each(function(){ this.checked = true; });
            updateCounts();
        });
        $(document).on('click', '.ngwcs-unselect-all-cat', function(){
            const catId = $(this).data('category');
            const $list = $('ul.ngwcs-products[data-category-list="'+catId+'"]').first();
            $list.find('input[type="checkbox"]').each(function(){ this.checked = false; });
            updateCounts();
        });
    }

    function initFlushCache(){
        $(document).on('click', '.ngwcs-flush-cache', function(){
            const $btn = $(this);
            const $status = $('.ngwcs-flush-status');
            $btn.prop('disabled', true).text('Flushing...');
            $status.text('Flushing cache...');
            fetch(window.wpApiSettings.root + NGWCS_DATA.restNamespace + '/cache/flush', {
                method: 'POST',
                headers: { 'X-WP-Nonce': NGWCS_DATA.nonce }
            }).then(async r=>{
                const isJson = r.headers.get('content-type') && r.headers.get('content-type').includes('application/json');
                const body = isJson ? await r.json() : {};
                if(!r.ok){ throw body; }
                const ver = body.cache_version;
                $('.ngwcs-cache-version').attr('data-cache-version', ver).find('strong').text(ver);
                $status.text('Cache flushed. New version: '+ver);
                $btn.prop('disabled', false).text('Flush Cache');
            }).catch(err=>{
                console.error('Flush error', err);
                const msg = (err && err.message) ? err.message : 'Flush failed';
                $status.text(msg);
                $btn.prop('disabled', false).text('Retry Flush');
            });
        });
    }

    $(function(){
        injectFilters();
        initFilters();
        initDragOrdering();
        initAccessibility();
        initCountsListeners();
    initHeroIncremental();
        initCategoryLoad();
    initCategoryBulkSelect();
        initFlushCache();
        // Primary click binding
        $('.ngwcs-tab-nav').on('click', '.ngwcs-tab', function(e){
            e.preventDefault();
            switchTab($(this));
            updateCounts();
        });
        // Defensive fallback (in case nav replaced dynamically)
        $(document).on('click', '.ngwcs-tab-nav .ngwcs-tab', function(e){
            if(!$(this).hasClass('is-active')){
                console.debug('[NGWCS] Tab click (fallback handler):', $(this).data('tab'));
                switchTab($(this));
                updateCounts();
            }
        });
    });
})(jQuery);
