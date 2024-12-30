// Handle user authentication
let currentUser = null;

function handleLogin(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    const password = event.target.querySelector('input[type="password"]').value;

    // Simple validation (in real app, this would connect to a backend)
    if (email && password) {
        currentUser = { email };  // Save user info (in a real app, store session or token)
        closeModal();
        updateNavigation();
    }
}

function updateNavigation() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    if (currentUser) {
        loginBtn.textContent = 'Logout';
        loginBtn.onclick = handleLogout;
        if (registerBtn) registerBtn.style.display = 'none';  // Hide register button
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.onclick = showLoginModal;
        if (registerBtn) registerBtn.style.display = 'inline';  // Show register button
    }
}

function handleLogout() {
    currentUser = null;  // Clear user session
    updateNavigation();  // Update navigation (logout)
}

// Modal handling
const modal = document.getElementById('authModal');
const closeBtn = document.querySelector('.close');

function showLoginModal() {
    modal.style.display = 'block';  // Show login modal
}

function closeModal() {
    modal.style.display = 'none';  // Close login modal
}

// Close modal when clicking outside or pressing close button
closeBtn.onclick = closeModal;
window.onclick = (event) => {
    if (event.target === modal) {
        closeModal();
    }
}

// Call updateNavigation on page load to adjust the UI
document.addEventListener('DOMContentLoaded', updateNavigation);
