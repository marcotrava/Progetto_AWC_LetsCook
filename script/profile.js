var isLoggedIn = localStorage.getItem('loggedIn') === 'true';
var username = localStorage.getItem('username');

if (!isLoggedIn || !username) {
    alert("Devi effettuare il login per accedere alla gestione profilo.");
    window.location.href = 'accesso.html'; 
} else {
    var users = JSON.parse(localStorage.getItem('users')) || [];
    
    var user = users.find(u => u.username === username);

    if (!user) {
        alert("Utente non trovato. Devi registrarti a LET'S COOK prima.");
        window.location.href = 'registrazione.html'; 
    } else {
        document.getElementById('username').value = user.username;
        document.getElementById('firstName').value = user.name;  
        document.getElementById('lastName').value = user.surname; 
    }
}

// Funzione per cambiare la password
function updateProfile(event) {
    event.preventDefault(); 

    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    // Regex per validare la password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
        alert("Errore: la password deve contenere almeno:\n- 8 caratteri\n- Una lettera maiuscola\n- Una lettera minuscola\n- Un numero\n- Un carattere speciale.");
        return; 
    }

    if (newPassword !== confirmPassword) {
        alert("Le password non corrispondono.");
        return;
    }

    var users = JSON.parse(localStorage.getItem('users'));
    var userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword; 
        localStorage.setItem('users', JSON.stringify(users)); 
        alert("Password cambiata con successo!");
    } else {
        alert("Errore nel cambiamento della password.");
    }
    window.location.href = 'index.html'; 
}

// Funzione per eliminare l'account
function deleteAccount() {
    if (confirm("Sei sicuro di voler eliminare il tuo account?")) {

        // Recupera gli utenti e le recensioni dal localStorage
        var users = JSON.parse(localStorage.getItem('users'));
        var reviews = JSON.parse(localStorage.getItem('reviews')) || [];

        users = users.filter(u => u.username !== username); 
        reviews = reviews.filter(review => review.username !== username) 

        localStorage.setItem('users', JSON.stringify(users)); 
        localStorage.setItem('reviews', JSON.stringify(reviews)); 
        
        localStorage.removeItem('loggedIn'); 
        localStorage.removeItem('username'); 
        alert("Il tuo profilo è stato eliminato.");
        window.location.href = 'index.html'; 
    }
}
