const searchBtn = document.getElementById("search-btn");
const searchInput = document.getElementById("search-input");
const mealList = document.getElementById("meal");
const mealDetailsContent = document.querySelector(".meal-details-content");
const receipeCloseBtn = document.querySelector(".receipe-close-btn");

const API_URL = "https://www.themealdb.com/api/json/v1/1/";

// Funzione per cercare ricette per nome
async function searchMealsByName(searchInput) {
    const url = `${API_URL}search.php?s=${searchInput}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Errore nella risposta API");
        const data = await response.json();
        return data.meals; 
    } catch (error) {
        console.error("Errore durante la ricerca per nome:", error);
        return null;
    }
}

// Funzione per cercare ricette per ingrediente
async function searchMealsByIngredient(searchInput) {
    const url = `${API_URL}filter.php?i=${searchInput}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Errore nella risposta API");
        const data = await response.json();
        return data.meals; 
    } catch (error) {
        console.error("Errore durante la ricerca per ingrediente:", error);
        return null;
    }
}

// Funzione per cercare ricette per lettera iniziale
async function searchMealsByLetter(searchInput) {
    const url = `${API_URL}search.php?f=${searchInput}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Errore nella risposta API");
        const data = await response.json();
        return data.meals; 
    } catch (error) {
        console.error("Errore durante la ricerca per lettera:", error);
        return null;
    }
}


searchBtn.addEventListener("click", (event) => {
    event.preventDefault();
    getMealList();
});

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        getMealList();
    }
});

mealList.addEventListener("click", getMealReceipe);
receipeCloseBtn?.addEventListener("click", () => {
    mealDetailsContent.parentElement.classList.remove("showReceipe");
});

// Prendere lista pasti in base all'input
async function getMealList() {
    const searchInputTxt = document.getElementById("search-input").value.trim();

    if (!searchInputTxt) {
        mealList.innerHTML = "<p>Inserisci nome ricetta, ingrediente o lettera valida perfavore.</p>";
        return;
    }

    let meals = null;
    if (searchInputTxt.length === 1 && /^[a-zA-Z]$/.test(searchInputTxt)) {
        // Prova con la lettera iniziale
        meals = await searchMealsByLetter(searchInputTxt);
    } else {
        // Prova con l'ingrediente
        meals = await searchMealsByIngredient(searchInputTxt);
        if (!meals) {
            // Prova con il nome
            meals = await searchMealsByName(searchInputTxt);
        }
    }

    let html = "";
    if (meals) {
        meals.forEach(meal => {
            html += `
            <div class='meal-item' data-id='${meal.idMeal}'>
                <div class='meal-img'>
                    <img src='${meal.strMealThumb}' alt='${meal.strMeal}' title='${meal.strMeal}'>
                </div>
                <div class='meal-name'>
                    <h3>${meal.strMeal}</h3>
                    <a href='#' class='receipe-btn'> Info Ricetta</a>
                </div>
            </div>
            `;
        });
        mealList.classList.remove("notFound");
    } else {
        html = "<p>Scusa, nessuna ricetta trovata. Prova con un altro nome, ingrediente o lettera iniziale.</p>";
        mealList.classList.add("notFound");
    }
    mealList.innerHTML = html; 
}

// Funzione per ottenere dettagli di una ricetta tramite ID
async function getMealDetails(id) {
    try {
        const response = await fetch(`${API_URL}lookup.php?i=${id}`);
        if (!response.ok) throw new Error("Errore nella risposta API");
        const data = await response.json();
        return data.meals[0]; 
    } catch (error) {
        console.error("Errore durante il recupero dei dettagli della ricetta:", error);
        return null;
    }
}

// Prendere la ricetta dei pasti
function getMealReceipe(event) {
    event.preventDefault();
    if (event.target.classList.contains('receipe-btn')) {
        let mealItem = event.target.closest('.meal-item');
        const mealId = mealItem.dataset.id;
        getMealDetails(mealId).then(meal => {
            if (meal) {
                showRecipeModal(meal);
            }
        }).catch((error) => {
            console.error("Errore nel recupero della ricetta: ", error);
        });
    }
}

// Funzione per mostrare il modal con i dettagli della ricetta
function showRecipeModal(meal) {
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

    const addToFavoritesButton = document.getElementById("add-to-recipe-book");
    addToFavoritesButton.onclick = () => addToFavorites(meal.idMeal);

    // Rimuovi eventuali pulsanti duplicati
    const existingReviewButton = document.querySelector('.btn-review');
    if (existingReviewButton) {
        existingReviewButton.remove();
    }

    displayFeedback(meal.idMeal);


    const reviewButton = document.createElement('button');
    reviewButton.className = 'btn btn-primary mt-3 btn-review';
    reviewButton.textContent = 'Lascia la tua recensione';
    reviewButton.onclick = () => redirectToReviewPage(meal.idMeal);

    const modalBody = document.querySelector('.meal-details-content');
    modalBody.appendChild(reviewButton);

    const modal = new bootstrap.Modal(document.getElementById('recipeModal'));
    modal.show();
}

// Funzione per visualizzare i feedback di una ricetta
function displayFeedback(recipeId) {
    console.log("Recipe ID passato alla funzione:", recipeId); 

    const feedbackContainer = document.getElementById("recipe-feedback");
    const reviews = JSON.parse(localStorage.getItem("reviews")) || [];
    console.log("Recensioni presenti nel localStorage:", reviews); 

    const recipeReviews = reviews.filter(review => review.recipeId === recipeId);
    console.log("Recensioni trovate per la ricetta con ID:", recipeId, recipeReviews); 

    if (recipeReviews.length === 0) {
        feedbackContainer.innerHTML = '<p class="text-muted">Nessun feedback disponibile per questa ricetta.</p>';
        return;
    }

    let feedbackHtml = "";
    recipeReviews.forEach(review => {
        feedbackHtml += `
            <div class="feedback-item">
                 <p><strong>Utente:</strong> <span class="date-style">${review.username}</span></p>
                <p><strong>Data:</strong> <span class="date-style">${review.reviewDate}</span></p>
                <p><strong>Difficoltà:</strong> ${'<i class="bi bi-egg-fried egg-icon-yellow"></i>'.repeat(review.difficulty)}</p>
                <p><strong>Gusto:</strong> ${'<i class="bi bi-egg-fried egg-icon-yellow"></i>'.repeat(review.taste)}</p>
                <hr>
             </div>
        `;
    });

    feedbackContainer.innerHTML = feedbackHtml;
}

// Funzione per recuperare ricette casuali
function getRandomMeals(count) {
    fetch(`${API_URL}search.php?s=`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Errore nella risposta dell'API");
            }
            return response.json();
        })
        .then(data => {
            if (data.meals) {
                const randomMeals = getRandomItems(data.meals, count);
                displayMeals(randomMeals);
            } else {
                document.getElementById('meal').innerHTML = "Nessuna ricetta trovata.";
            }
        })
        .catch(error => {
            console.error("Errore nella fetch: ", error);
            document.getElementById('meal').innerHTML = "Errore durante il recupero delle ricette.";
        });
}

// Funzione per ottenere un certo numero di elementi casuali da un array
function getRandomItems(arr, count) {
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}


function displayMeals(meals) {
    const mealList = document.getElementById('meal');
    let html = "";

    meals.forEach(meal => {
        html += `
        <div class='meal-item' data-id='${meal.idMeal}'>
            <div class='meal-img'>
                <img src='${meal.strMealThumb}' alt='${meal.strMeal}' title='${meal.strMeal}'>
            </div>
            <div class='meal-name'>
                <h3>${meal.strMeal}</h3>
                <a href='#' class='receipe-btn'>Info Ricetta</a>
            </div>
        </div>
        `;
    });

    mealList.innerHTML = html;
}

// Funzione per aggiungere una ricetta ai preferiti
function addToFavorites(mealID) {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const username = localStorage.getItem('username');

    if (!isLoggedIn || !username) {
        alert("Devi effettuare il login per aggiungere ricette ai preferiti.");
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(user => user.username === username);

    if (userIndex !== -1) {
        const user = users[userIndex];
        if (!user.favorites) {
            user.favorites = [];
        }

        if (user.favorites.includes(mealID)) {
            alert("Questo piatto è già nei tuoi preferiti.");
        } else {
            user.favorites.push(mealID);
            localStorage.setItem('users', JSON.stringify(users));
            alert("Ricetta aggiunta ai tuoi preferiti!");
        }
    }
}

// Funzione per indirizzare alla pagina di recensione
function redirectToReviewPage(recipeId) {
    const username = localStorage.getItem('username');
    const reviews = JSON.parse(localStorage.getItem('reviews')) || [];

    const hasReviewed = reviews.some(review => review.recipeId === recipeId && review.username === username);

    if (hasReviewed) {
        alert("Hai già recensito questa ricetta. Non puoi recensirla di nuovo.");
        return;
    }

    sessionStorage.setItem("currentRecipeId", recipeId);
    window.location.href = "recensioni.html";
}

// Mostra ricette casuali all'avvio
document.addEventListener("DOMContentLoaded", () => getRandomMeals(12));
