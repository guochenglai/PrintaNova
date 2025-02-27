// View counter functionality using in-memory storage with periodic JSON file updates
async function incrementView(productId) {
    try {
        // Send increment request to the server (no need to fetch first)
        const response = await fetch('/api/updateViews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update UI with the returned count
            updateAllCounters(productId, result.count);
            return result.count;
        }
    } catch (error) {
        console.error('Error updating view count:', error);
        // Fallback to localStorage if server request fails
        return incrementViewLocal(productId);
    }
    return 0;
}

// Fallback to localStorage
function incrementViewLocal(productId) {
    let views = JSON.parse(localStorage.getItem('productViews') || '{"boxes":0,"wallpaper":0,"billboard":0}');
    if (productId in views) {
        views[productId]++;
        localStorage.setItem('productViews', JSON.stringify(views));
        updateAllCounters(productId, views[productId]);
        return views[productId];
    }
    return 0;
}

async function getViews(productId) {
    try {
        const response = await fetch('/api/views.json');
        const views = await response.json();
        return views[productId] || 0;
    } catch (error) {
        console.error('Error fetching view count:', error);
        // Fallback to localStorage
        return getViewsLocal(productId);
    }
}

function getViewsLocal(productId) {
    let views = JSON.parse(localStorage.getItem('productViews') || '{"boxes":0,"wallpaper":0,"billboard":0}');
    return views[productId] || 0;
}

function updateAllCounters(productId, value) {
    // Ensure value is a number and convert it to string only for display
    if (typeof value === 'object' && value instanceof Promise) {
        console.error('Received Promise instead of value for counter update');
        return;
    }
    
    const displayValue = String(value);
    
    // Update both home and detail page counters with all possible ID formats
    const selectors = [
        `#views-${productId}`,           // Home page format
        `#views-${productId}-detail`     // Detail page format
    ];
    
    selectors.forEach(selector => {
        const counter = document.querySelector(selector);
        if (counter) {
            counter.textContent = displayValue;
        }
    });
}

// Shared view tracking functionality
async function setupViewTracking(options = {}) {
    const { selector = '.product-section' } = options;

    // Determine if this is a detail page
    const isDetailPage = window.location.pathname.includes('billboard.html') || window.location.pathname.includes('wallpaper.html') || window.location.pathname.includes('boxes.html');
    
    // Get current page product ID (for detail pages)
    let currentPageProductId = null;
    if (isDetailPage) {
        // Extract product ID from pathname (e.g., "boxes" from "boxes.html")
        const pathname = window.location.pathname;
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        currentPageProductId = filename.replace('.html', '');
    }
    
    // First, initialize the view counters (always do this regardless of page type)
    const products = ['boxes', 'wallpaper', 'billboard'];
    
    // Initialize counters asynchronously
    for (const productId of products) {
        try {
            const currentViews = await getViews(productId);
            updateAllCounters(productId, currentViews);
        } catch (error) {
            console.error('Error initializing counter for', productId, error);
        }
    }
    
    // For detail pages, immediately increment the view counter for the current product
    if (isDetailPage && currentPageProductId && products.includes(currentPageProductId)) {
        console.log(`Incrementing view for ${currentPageProductId} on page load`);
        incrementView(currentPageProductId);
    }
    
    // Also set up the intersection observer for detail pages
    // This ensures views are counted when elements scroll into view
    if (isDetailPage) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const productId = entry.target.id || entry.target.getAttribute('data-product-id');
                    if (productId) {
                        incrementView(productId);
                    }
                }
            });
        }, { threshold: 0.5 });

        // Start observing elements
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            const productId = element.id || element.getAttribute('data-product-id');
            if (productId) {
                observer.observe(element);
            }
        });
    }
}