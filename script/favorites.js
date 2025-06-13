document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (!isLoggedIn || !username) {
        alert("Devi effettuare il login per accedere al tuo ricettario personale.");
        window.location.href = 'accesso.html';
        return;
    }


      const usernameDisplay = document.getElementById('username-display2');
      usernameDisplay.textContent = username;
  

      displayFavorites(username);
});

// Funzione per visualizzare i piatti preferiti dell'utente
function displayFavorites(username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username);

    const container = document.getElementById('favorite-meals');
    container.innerHTML = '';

    if (!user || !user.favorites || user.favorites.length === 0) {
        container.innerHTML = `
            <div class="alert-container">
                <div class="alert alert-warning" role="alert">
                    Non hai ancora aggiunto piatti preferiti al tuo ricettario personale.
                </div>
            </div>
        `;
        return;
    }

    
    user.favorites.forEach(async (mealID) => {
        try {
            const meal = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`)
                .then(response => response.json())
                .then(data => data.meals[0]);

            if (meal) {
                const mealCard = createMealCard(meal, username);
                container.appendChild(mealCard);
            }
        } catch (error) {
            console.error("Errore nel recupero del piatto preferito:", error);
        }
    });
}

// Funzione per creare la card di un piatto preferito
function createMealCard(meal, username) {
    const mealCard = document.createElement('div');
    mealCard.className = 'col';
    mealCard.innerHTML = `
        <div class="card h-100">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body text-center">
                <h5 class="card-title">${meal.strMeal}</h5>
                <div class="d-flex justify-content-center gap-2 mt-2">
                    <a href="#" class="btn info-btn" onclick="viewRecipeDetails('${meal.idMeal}')">
                        Info Ricetta
                    </a>
                    <button class="btn btn-danger rimuovi-btn" onclick="removeFromFavorites('${meal.idMeal}', '${username}')">
                        Rimuovi dai preferiti
                    </button>
                    <button class="btn btn-primary recensione-btn" onclick="redirectToReviewPage('${meal.idMeal}')">
                        Lascia la tua recensione
                    </button>
                </div>
            </div>
        </div>
    `;
    return mealCard;
}

// Funzione per reindirizzare alla pagina di recensione
function redirectToReviewPage(recipeId) {
    const username = localStorage.getItem('username');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    // Controlla se l'utente ha già recensito questa ricetta
    const hasReviewed = reviews.some(review => review.recipeId === recipeId && review.username === username);

    if (hasReviewed) {
        alert("Hai già recensito questa ricetta. Non puoi recensirla di nuovo.");
        return;
    }

    // Salva l'ID della ricetta nel sessionStorage e reindirizza alla pagina di recensione
    sessionStorage.setItem("currentRecipeId", recipeId);
    window.location.href = "recensioni.html";
}

// Funzione per rimuovere un piatto preferito dal ricettario
function removeFromFavorites(mealID, username) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        const user = users[userIndex];
        user.favorites = user.favorites.filter(id => id !== mealID);
        localStorage.setItem('users', JSON.stringify(users));
        alert("Ricetta rimossa dal tuo ricettario.");


        displayFavorites(username);
    }
}

// Funzione per visualizzare i dettagli di una ricetta
function viewRecipeDetails(mealID) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealID}`)
        .then(response => response.json())
        .then(data => {
            const meal = data.meals[0];
            if (meal) {
                const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
                document.getElementById('recipe-image').src = meal.strMealThumb;
                document.getElementById('recipe-name').innerText = meal.strMeal;
                document.getElementById('recipe-instructions').innerText = meal.strInstructions;


                const ingredientsList = document.getElementById('recipe-ingredients');
                ingredientsList.innerHTML = '';


                for (let i = 1; i <= 20; i++) {
                    const ingredient = meal[`strIngredient${i}`];
                    const measure = meal[`strMeasure${i}`];
                    if (ingredient) {
                        const listItem = document.createElement('li');
                        listItem.innerText = `${ingredient} - ${measure}`;
                        ingredientsList.appendChild(listItem);
                    }
                }


                displayFeedbackInModal(mealID);

                modal.show();
            }
        })
        .catch(error => console.error("Errore nel recupero dei dettagli della ricetta:", error));
}

// Funzione per visualizzare i feedback di una ricetta nel modale della ricetta
function displayFeedbackInModal(recipeId) {
    const feedbackContainer = document.getElementById("recipe-feedback");
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    const recipeReviews = reviews.filter(review => review.recipeId === recipeId);

    if (recipeReviews.length === 0) {
        feedbackContainer.innerHTML = '<p class="text-muted">Nessun feedback disponibile per questa ricetta.</p>';
        return;
    }

    let feedbackHtml = recipeReviews.map(review => `
     <div class="feedback-item">
     <p><strong>Utente:</strong> <span class="date-style">${review.username}</span></p>
        <p><strong>Data:</strong> <span class="date-style">${review.reviewDate}</span></p>
        <p><strong>Difficoltà:</strong> ${'<i class="bi bi-egg-fried egg-icon-yellow"></i>'.repeat(review.difficulty)}</p>
        <p><strong>Gusto:</strong> ${'<i class="bi bi-egg-fried egg-icon-yellow"></i>'.repeat(review.taste)}</p>
        <hr>
    </div>
    `).join('');

    feedbackContainer.innerHTML = feedbackHtml;
}

