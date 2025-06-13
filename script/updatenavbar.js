// Funzione per controllare se l'utente è loggato e aggiornare la navbar
function updateNavbar() {
    const loggedIn = localStorage.getItem('loggedIn');
    const usernameDisplay = document.getElementById('username-display');
    const authButtonsContainer = document.getElementById('auth-buttons');

    if (loggedIn === 'true') {
        const username = localStorage.getItem('username');
        usernameDisplay.textContent = username; 
        authButtonsContainer.innerHTML = `
            <a class="btn btn-logout-custom d-flex align-items-center" id="logout-btn" href="#">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
            </a>`;

        
        document.getElementById('logout-btn').addEventListener('click', logoutUser);
    } else {
        usernameDisplay.textContent = 'Profilo'; 
        authButtonsContainer.innerHTML = `
            <a class="btn btn-outline-custom d-flex align-items-center" href="accesso.html">
                <i class="bi bi-person-fill me-2"></i> Accedi
            </a>`;
    }
}

// Funzione per gestire il logout
function logoutUser() {
    // Rimuovi il flag di login e l'usernmae dell'utente dal localStorage
    localStorage.removeItem('loggedIn','false');
    localStorage.removeItem('username');

    window.location.href = 'index.html';
}

window.onload = updateNavbar;
