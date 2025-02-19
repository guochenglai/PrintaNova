// View counter functionality using localStorage
function incrementView(productId) {
    let views = JSON.parse(localStorage.getItem('productViews') || '{"boxes":0,"wallpaper":0,"billboard":0}');
    if (productId in views) {
        views[productId]++;
        localStorage.setItem('productViews', JSON.stringify(views));
        updateAllCounters(productId, views[productId]);
        return views[productId];
    }
    return 0;
}

function getViews(productId) {
    let views = JSON.parse(localStorage.getItem('productViews') || '{"boxes":0,"wallpaper":0,"billboard":0}');
    return views[productId] || 0;
}

function updateAllCounters(productId, value) {
    // Update both home and detail page counters with all possible ID formats
    const selectors = [
        `#views-${productId}`,           // Home page format
        `#views-${productId}-detail`     // Detail page format
    ];
    
    selectors.forEach(selector => {
        const counter = document.querySelector(selector);
        if (counter) {
            counter.textContent = value.toString();
        }
    });
}

// Shared view tracking functionality
function setupViewTracking(options = {}) {
    const { selector = '.product-section' } = options;

    // Only increment views on detail pages
    const isDetailPage = !window.location.pathname.endsWith('index.html') && 
                        !window.location.pathname.endsWith('/') &&
                        window.location.pathname.includes('.html');

    // First, initialize the view counters (always do this regardless of page type)
    const products = ['boxes', 'wallpaper', 'billboard'];
    products.forEach(productId => {
        const currentViews = getViews(productId);
        updateAllCounters(productId, currentViews);
    });
    
    // Only set up the intersection observer for detail pages
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