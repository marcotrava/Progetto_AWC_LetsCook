document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const username = localStorage.getItem('username');
    if (!isLoggedIn || !username) {
        alert("Devi effettuare il login per lasciare una recensione.");
        window.location.href = "accesso.html";
        return;
    }

    const usernameDisplay = document.getElementById('username-display3');
    usernameDisplay.textContent = username;

    const recipeId = sessionStorage.getItem("currentRecipeId");
    if (!recipeId) {
        alert("Errore: nessuna ricetta selezionata.");
        window.location.href = "index.html";
        return;
    }

    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`)
    .then(response => response.json())
    .then(data => {
        const meal = data.meals[0];
        if (meal) {
            document.getElementById('recipe-name').textContent = `${meal.strMeal}`;
            document.getElementById('recipe-image').src = meal.strMealThumb;
            document.getElementById('recipe-instructions').textContent = meal.strInstructions;


            const ingredientsList = document.getElementById('recipe-ingredients');
            ingredientsList.innerHTML = ''; 
            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim() !== "") {
                    const listItem = document.createElement('li');
                    listItem.textContent = `${ingredient} - ${measure}`;
                    ingredientsList.appendChild(listItem);
                }
            }
        }
    })
    .catch(error => console.error("Errore nel recupero della ricetta:", error));


    setupRating("difficulty-rating", "review-difficulty");
    setupRating("taste-rating", "review-taste");

    // Carica i dati della recensione da modificare
    const editReview = sessionStorage.getItem('editReview');
    if (editReview) {
        const review = JSON.parse(editReview);

        document.getElementById('review-date').value = review.reviewDate;
        document.getElementById('review-difficulty').value = review.difficulty;
        document.getElementById('review-taste').value = review.taste;
        document.getElementById('private-note').value = review.privateNote;

        updateRatingDisplay(
            document.getElementById("difficulty-rating").querySelectorAll(".chef-icon"),
            review.difficulty
        );

        updateRatingDisplay(
            document.getElementById("taste-rating").querySelectorAll(".chef-icon"),
            review.taste
        );

        sessionStorage.removeItem('editReview'); 
    }
});

// Imposta la valutazione della recensione
function setupRating(ratingContainerId, inputId) {
    const container = document.getElementById(ratingContainerId);
    const icons = container.querySelectorAll(".chef-icon");
    const hiddenInput = document.getElementById(inputId);

    icons.forEach((icon, index) => {
        icon.addEventListener("mouseenter", () => {
            updateRatingDisplay(icons, index + 1);
        });

        icon.addEventListener("mouseleave", () => {
            updateRatingDisplay(icons, hiddenInput.value); 
        });

        icon.addEventListener("click", () => {
            hiddenInput.value = index + 1; 
            updateRatingDisplay(icons, index + 1);
        });
    });
}


function updateRatingDisplay(icons, value) {
    icons.forEach((icon, index) => {
        if (index < value) {
            icon.classList.add("selected");
        } else {
            icon.classList.remove("selected");
        }
    });
}


function saveReview(event) {
    event.preventDefault();

    const recipeId = sessionStorage.getItem("currentRecipeId");
    const reviewDate = document.getElementById("review-date").value;
    const difficulty = document.getElementById("review-difficulty").value;
    const taste = document.getElementById("review-taste").value;
    const privateNote = document.getElementById("private-note").value;

    if (!difficulty || !taste) {
        alert("Devi selezionare la difficoltà e il gusto!");
        return;
    }

    const review = {
        recipeId,
        username: localStorage.getItem("username"),
        reviewDate,
        difficulty,
        taste,
        privateNote
    };

    let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

    const existingReviewIndex = reviews.findIndex(r => r.recipeId === recipeId && r.username === review.username);
    if (existingReviewIndex !== -1) {
        reviews[existingReviewIndex] = review;
    } else {
        reviews.push(review);
    }

    localStorage.setItem("reviews", JSON.stringify(reviews));

    console.log("Recensione salvata:", review); 
    console.log("Tutte le recensioni salvate:", reviews); 

    alert("Recensione salvata con successo!");
    window.location.href = "reviews.html";
}
