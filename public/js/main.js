// Sample data for featured listings
const featuredListings = [
    {
        id: 1,
        title: "Olive Farm with Well",
        price: 50000,
        location: "Northern Region",
        image: "https://thumbs.dreamstime.com/b/irrigation-field-7637377.jpg",
        type: "land"
    },
    {
        id: 1,
        title: "Olive Farm with Well",
        price: 50000,
        location: "Northern Region",
        image: "https://i.ytimg.com/vi/h4rlvkL-EF0/maxresdefault.jpg",
        type: "land"
    },
    
];

// Populate featured listings
function displayFeaturedListings() {
    const container = document.getElementById('featuredListings');
    featuredListings.forEach(listing => {
        const card = createListingCard(listing);
        container.appendChild(card);
    });
}

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

function viewListing(id) {
    // Navigate to listing detail page
    window.location.href = `listing-detail.html?id=${id}`;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedListings();
});