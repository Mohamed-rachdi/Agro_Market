document.getElementById("listingForm").addEventListener("submit", async (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const formData = new FormData(event.target);

    const listingData = {
        listingType: formData.get("listingType"),
        title: formData.get("title"),
        price: formData.get("price"),
        location: formData.get("location"),
        image: formData.get("image"),
    };

    try {
        const response = await fetch("http://localhost:5000/api/create-listing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Inclure les cookies (authToken)
            body: JSON.stringify(listingData),
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            window.location.href = "listings.html"; // Rediriger après création
        } else {
            const error = await response.json();
            alert("Failed to create listing: " + error.error);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("An error occurred while creating the listing.");
    }
});
