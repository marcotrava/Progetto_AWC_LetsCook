document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (!isLoggedIn || !username) {
        alert("Devi effettuare il login per accedere alle tue recensioni.");
        window.location.href = 'accesso.html';
        return;
    }

    const usernameDisplay = document.getElementById('username-display2');
    usernameDisplay.textContent = username;

    displayUserReviews(username);
});

//Funzione per mostrare le recensioni dell'utente
function displayUserReviews(username) {
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    const userReviews = reviews.filter(review => review.username === username);

    const container = document.getElementById('reviews-container');
    container.innerHTML = '';

    if (userReviews.length === 0) {
        container.innerHTML = `
            <div class="alert-container">
                <div class="alert alert-warning" role="alert">
                    Non hai ancora lasciato recensioni.
                </div>
            </div>
        `;
        return;
    }

    userReviews.forEach(async (review) => {
        try {
            const meal = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${review.recipeId}`)
                .then(response => response.json())
                .then(data => data.meals[0]);

            if (meal) {
                const reviewCard = createReviewCard(meal, review);
                container.appendChild(reviewCard);
            }
        } catch (error) {
            console.error("Errore nel recupero della recensione:", error);
        }
    });
}

// Funzione per creare la card della recensione
function createReviewCard(meal, review) {
    const reviewCard = document.createElement('div');
    reviewCard.className = 'col';
    reviewCard.innerHTML = `
        <div class="card h-100">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body text-center">
                <h5 class="card-title">${meal.strMeal}</h5>
                <p><strong>Data:</strong> ${review.reviewDate}</p>
                <p><strong>Difficoltà:</strong> ${review.difficulty} / 5</p>
                <p><strong>Gusto:</strong> ${review.taste} / 5</p>
                <p><strong>Nota:</strong> ${review.privateNote}</p>
                <div class="d-flex justify-content-center gap-2 mt-2">
                    <a href="#" class="btn btn-success" onclick="viewRecipeDetails('${meal.idMeal}')">
                        Info Ricetta
                    </a>
                    <button class="btn btn-warning" onclick="editReview('${review.recipeId}')">
                        Modifica recensione
                    </button>
                    <button class="btn btn-danger" onclick="deleteReview('${review.recipeId}')">
                        Elimina recensione

                    </button>
                </div>
            </div>
        </div>
    `;
    return reviewCard;
}

// Funzione per visualizzare i dettagli della ricetta
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

                displayFeedbackCard(mealID);

                modal.show();
            }
        })
        .catch(error => console.error("Errore nel recupero dei dettagli della ricetta:", error));
}

// Funzione per modificare la recensione
function editReview(recipeId) {
    const username = localStorage.getItem('username');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    const review = reviews.find(review => review.recipeId === recipeId && review.username === username);

    if (review) {
        sessionStorage.setItem('editReview', JSON.stringify(review));
        sessionStorage.setItem('currentRecipeId', recipeId); 
        window.location.href = 'recensioni.html'; 
    } else {
        alert('Errore: Recensione non trovata.');
    }
}

// Funzione per eliminare la recensione
function deleteReview(recipeId) {
    const username = localStorage.getItem('username');
    let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
    
    reviews = reviews.filter(review => !(review.recipeId === recipeId && review.username === username));
    
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    alert('Recensione eliminata con successo.');
    location.reload(); 
}

// Funzione per mostrare i feedback nel modal
function displayFeedbackCard(recipeId) {
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

