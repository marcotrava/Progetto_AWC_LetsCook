//Funzione per la registrazione del profilo
function submitForm() {
    console.log("submitForm è stato chiamato");

    const name = document.getElementById('inputName').value;
    const surname = document.getElementById('inputSurname').value;
    const email = document.getElementById('inputEmail').value;
    const birthDate = document.getElementById('inputBirthDate').value; 
    const password = document.getElementById('inputPassword').value;
    const confirmPassword = document.getElementById('inputConfirmPassword').value; 
    const username = document.getElementById('inputUsername').value;
    const terms = document.getElementById('gridCheck').checked;

     // Regular Expression per validare un'email
     const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

     if (!emailRegex.test(email)) {
         alert("Errore: il formato dell'email non è valido. Inserisci un'email corretta.");
         return false; 
     }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        alert("Errore: la password deve contenere almeno 8 caratteri, una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale.");
        return false; 
    }

    if (password !== confirmPassword) {
        alert("ATTENZIONE! Le password non corrispondono. Riprova.");
        return false; 
    }

     const users = JSON.parse(localStorage.getItem('users')) || [];

    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
    const usernameExists = users.some(user => user.username.toLowerCase() === username.toLowerCase());

     if (emailExists) {
         alert("Errore: l'email è già associata a un altro account.");
         return false;
     }
 
     if (usernameExists) {
         alert("Errore: username è già in uso da un'altro utente.");
         return false;
     }

    const user = {
        name: name,
        surname: surname,
        email: email,
        birthDate: birthDate, 
        password: password,
        username: username,
        termsAccepted: terms
    };
  
    users.push(user);

    // Memorizza l'array di utenti nel localStorage come stringa JSON
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registrazione completata con successo! LET'S COOK!");

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000); 

    return false; 
}

// Funzione per mostrare o nascondere la password
function togglePasswordVisibility(inputId, icon) {
    const inputField = document.getElementById(inputId);
    const isPassword = inputField.type === 'password';

    inputField.type = isPassword ? 'text' : 'password';

    icon.classList.toggle('bi-eye-fill', !isPassword);
    icon.classList.toggle('bi-eye-slash-fill', isPassword);
}

// Funzione per il login dell'utente
function loginUser() {
    console.log("loginUser è stato chiamato");

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Recupera gli utenti dal localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === email);

    if (user) {
        if (user.password === password) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', user.username);

            alert(`Login effettuato con successo! Benvenuto, ${user.username}!`);
            window.location.href = 'index.html';
        } else {
            showError('Email o password errati. Riprova.');
        }
    } else {
        showError('Nessun account trovato con questa email.');
    }

    return false;
}

// Funzione per mostrare un messaggio di errore
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block'; 
}
