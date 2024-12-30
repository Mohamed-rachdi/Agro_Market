// Populate the listings grid
function displayListings(listings) {
    const container = document.getElementById('listingsGrid');
    container.innerHTML = ''; // Clear previous listings

    listings.forEach(listing => {
        const card = createListingCard(listing);
        container.appendChild(card);
    });
}

// Create individual listing card
function createListingCard(listing) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}">
        <div class="listing-info">
            <h3>${listing.title}</h3>
            <p>Price: $${listing.price}</p>
            <p>Location: ${listing.location}</p>
            <button onclick="viewListing(${listing.id})">View Details</button>
        </div>
    `;
    return card;
}

// View the details of the listing (redirect to another page)
function viewListing(id) {
    window.location.href = `listing-detail.html?id=${id}`;
}

// Apply filters based on user input
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter').value;
    const priceMin = parseFloat(document.getElementById('priceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('priceMax').value) || Infinity;

    // Store filters in localStorage
    localStorage.setItem('typeFilter', typeFilter);
    localStorage.setItem('priceMin', priceMin);
    localStorage.setItem('priceMax', priceMax);

    // Filter listings based on the selected criteria
    const filteredListings = allListings.filter(listing => {
        const matchesType = typeFilter ? listing.type === typeFilter : true;
        const matchesPrice = listing.price >= priceMin && listing.price <= priceMax;
        return matchesType && matchesPrice;
    });

    displayListings(filteredListings);
}

// Load filters from localStorage and apply them on page load
function loadFilters() {
    const typeFilter = localStorage.getItem('typeFilter') || '';
    const priceMin = parseFloat(localStorage.getItem('priceMin')) || 0;
    const priceMax = parseFloat(localStorage.getItem('priceMax')) || Infinity;

    document.getElementById('typeFilter').value = typeFilter;
    document.getElementById('priceMin').value = priceMin;
    document.getElementById('priceMax').value = priceMax;

    applyFilters();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadFilters();
});
