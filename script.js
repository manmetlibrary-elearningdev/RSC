// Global Variables
let selectedCard = null;
let correctOrder = [];
let feedbackMode = false;
let cardContainer;

// Utility function to strip out HTML tags (for clean comparison)
function stripHtml(html) {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

function fetchCardData() {
    fetch('cards.json')
        .then(response => response.json())
        .then(data => {
            correctOrder = data.correctOrder.map(card => card.content);
            console.log("Fetched correct order:");
            const randomizedOrder = shuffleArray(data.initialOrder);
            populateCards(randomizedOrder);
        })
        .catch(error => {
            console.error("Error loading card data:", error);
        });
}

function populateCards(cardsData) {
    cardsData.forEach(card => {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.id = card.id;
        div.innerHTML = card.content;
        div.setAttribute('tabindex', '0');
        div.setAttribute('role', 'listitem');
        div.setAttribute('aria-label', `Reference part: ${card.content}`);
        cardContainer.appendChild(div);
    });
}

function cardInteractionHandler(e) {
    if (feedbackMode) return;
    const card = e.target.closest('.card');
    if (!card) return;

    if (e.type === 'touchend') {
        e.preventDefault();
    }

    if (!selectedCard) {
        selectedCard = card;
        card.setAttribute('aria-selected', 'true');
        card.classList.add('selected');
        console.log("Card selected:", card.innerHTML.trim());
    } else {
        const tempContent = selectedCard.innerHTML;
        selectedCard.innerHTML = card.innerHTML;
        card.innerHTML = tempContent;

        selectedCard.classList.remove('selected');
        selectedCard.removeAttribute('aria-selected');
        console.log("Cards swapped.");
        selectedCard = null;
    }
}

function checkAnswer() {
    const cards = document.querySelectorAll('.card');
    let isCorrect = true;

    feedbackMode = true;
    cardContainer.classList.add('feedback-given');

    cards.forEach((card, index) => {
        card.classList.add('unselectable-card');
        card.setAttribute('tabindex', '-1');
        card.classList.remove('green', 'red');

        // Remove any existing feedback icons to reset the state
        const existingTick = card.querySelector('.icon.tick');
        const existingCross = card.querySelector('.icon.cross');
        if (existingTick) card.removeChild(existingTick);
        if (existingCross) card.removeChild(existingCross);

        const cardContent = stripHtml(card.innerHTML).trim();
        const correctAnswerWithoutHtml = stripHtml(correctOrder[index]).trim();

        if (cardContent !== correctAnswerWithoutHtml) {
            card.classList.add('red');
            const crossIcon = document.createElement('i');
            crossIcon.className = 'fas fa-times icon cross';
            card.appendChild(crossIcon);
            isCorrect = false;
        } else {
            card.classList.add('green');
            const tickIcon = document.createElement('i');
            tickIcon.className = 'fas fa-check icon tick';
            card.appendChild(tickIcon);
        }
    });

    const feedbackEl = document.getElementById('feedback');
    feedbackEl.textContent = isCorrect ? "Correct! Well done." : "Incorrect. Please try again.";
}

document.addEventListener('DOMContentLoaded', (event) => {
    cardContainer = document.getElementById('cardContainer');
    
    if (!cardContainer) {
        console.error("cardContainer element not found!");
        return;
    }

    const resetActivityButton = document.getElementById('resetActivity');
    const checkAnswerButton = document.getElementById('checkAnswer');

    if (resetActivityButton) {
        resetActivityButton.addEventListener('click', function() {
            feedbackMode = false;
            location.reload();
        });
    }

    if (checkAnswerButton) {
        checkAnswerButton.addEventListener('click', checkAnswer);
    }

    cardContainer.addEventListener('click', cardInteractionHandler);
    cardContainer.addEventListener('touchend', cardInteractionHandler);
    cardContainer.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            cardInteractionHandler.call(e.target, e);
        }
    });

    // Fetch the card data and initiate the activity
    fetchCardData();
});
