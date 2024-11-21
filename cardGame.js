document.addEventListener("DOMContentLoaded", function() {
    let deckID;
    let wins = 0;
    let totalRounds = 0;
    let cardsRemaining = 52;
    let totalRedDrawn = 0;
    let totalBlackDrawn = 0;
    let currentHand = [];

    const drawHandButton = document.getElementById("draw-hand");
    const cardsArea = document.getElementById("cards");
    const resetStatsButton = document.getElementById("reset-stats");
    const colorButtonsDiv = document.getElementById("color-buttons");
    const selectRedButton = document.getElementById("select-red");
    const selectBlackButton = document.getElementById("select-black");
    const historyContent = document.getElementById("history-content");
    const toggleCheatsButton = document.getElementById("toggle-cheats");
    const cheatsContent = document.getElementById("cheats-content");
    const progressBar = document.querySelector(".progress .bar");
    const resultMessageContainer = document.getElementById("result-message");

    //hide red/black buttons initially
    colorButtonsDiv.style.display = "none";
    //hide result message initially
    resultMessageContainer.style.display = "none"; 

    //initialize deck
    async function initializeDeck() 
    {
        try 
        {
            const response = await fetch("https://cards.soward.net/deck/newDeck");
            const data = await response.json();
            deckID = data.deckID;
            cardsRemaining = data.cardsRemaining;
            totalRedDrawn = 0;
            totalBlackDrawn = 0;
            updateCardsRemaining();
            updateCheats();
        } 
        catch (error) 
        {
            console.error("Error initializing deck:", error);
        }
    }

    //shuffle deck, reset counts
    async function shuffleDeck() 
    {
        try 
        {
            const response = await fetch(`https://cards.soward.net/deck/shuffleDeck/${deckID}`);
            alert("Deck shuffled!");
            cardsRemaining = 52;
            totalRedDrawn = 0;
            totalBlackDrawn = 0;
            updateCardsRemaining();
            updateCheats();
            //hide result message after shuffling
            resultMessageContainer.style.display = "none"; 
        } 
        catch (error) 
        {
            console.error("Error shuffling deck:", error);
        }
    }

    //draw hand of 5 cards and display backs of cards
    async function drawHand() 
    {
        //if not enough cards reshuffle 
        if (cardsRemaining < 5) 
        {
            resultMessageContainer.innerHTML = "Not enough cards in the deck, shuffling...";
            resultMessageContainer.style.display = "block";
            await shuffleDeck();
            return;
        }

        try 
        {
            const response = await fetch(`https://cards.soward.net/deck/drawFromDeck/${deckID}/5`);
            const data = await response.json();
            cardsRemaining -= 5;
            currentHand = data.cards;

            currentHand.forEach(card => {
                if (card.color === "red") 
                {
                    totalRedDrawn++;
                } 
                else if (card.color === "black") 
                {
                    totalBlackDrawn++;
                }
            });

            displayCardBacks();
            updateCardsRemaining();
            updateCheats();

            //hide draw hand button after its clicked
            drawHandButton.style.display = "none"; 
            //display red/black buttons
            colorButtonsDiv.style.display = "inline-block"; 
            //hide result message from previous turn if necessary
            resultMessageContainer.style.display = "none"; 
        } 
        catch (error) 
        {
            console.error("Error drawing hand:", error);
        }
    }

    //display card backs
    function displayCardBacks() 
    {
        cardsArea.innerHTML = "";
        const cardBackImageURL = "cardBack.png";

        for (let i = 0; i < 5; i++) 
        {
            const cardDiv = document.createElement("div");
            cardDiv.className = "column";
            cardDiv.innerHTML = `<img src="${cardBackImageURL}" alt="Card Back" class="ui centered small image">`;
            cardsArea.appendChild(cardDiv);
        }
    }

    //check win/lose based on selected color
    function checkWin(selectedColor) 
    {
        let numRed = currentHand.filter(card => card.color === "red").length;
        let numBlack = currentHand.filter(card => card.color === "black").length;

        //variables four result/history ouput
        const win = selectedColor === "red" ? numRed >= 3 : numBlack >= 3;
        const outcome = win ? 'Won' : 'Lost';
        const comparison = numRed > numBlack ? 'more' : 'less';

        logHistory(outcome, selectedColor, cardsRemaining, win ? 'thumbs up' : 'thumbs down');

        if (win) wins++;
        totalRounds++;
        updateStats();
        displayCardFronts();

        //hide red/black buttons
        colorButtonsDiv.style.display = "none"; 
        //show draw hand button for another round
        drawHandButton.style.display = "inline-block"; 
        
        //display result message
        resultMessageContainer.innerHTML = `You ${outcome}!!! There are ${comparison} red cards than black cards.`;
        //show result message only when cards are facing up
        resultMessageContainer.style.display = "block"; 
    }

    //display front of cards
    function displayCardFronts() 
    {
        cardsArea.innerHTML = "";
        currentHand.forEach(card => {
            const cardDiv = document.createElement("div");
            cardDiv.className = "column";
            cardDiv.innerHTML = `<img src="${card.svgImage}" alt="${card.value} of ${card.suitName}" class="ui centered small image">`;
            cardsArea.appendChild(cardDiv);
        });
    }

    //update stats (num wins and win percentage)
    function updateStats() 
    {
        document.getElementById("wins").textContent = wins;
        document.getElementById("win-percentage").textContent = ((wins / totalRounds) * 100).toFixed(2);
    }

    //update remaining cards and progress bar
    function updateCardsRemaining() 
    {
        const percentage = Math.round((cardsRemaining / 52) * 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.textContent = `${percentage}%`;
        progressBar.style.textAlign = "right";
        progressBar.style.color = "white";

        document.getElementById("cards-remaining").textContent = cardsRemaining;
        
        //green if 100%, grey otherwise
        if (percentage < 100) 
        {
            progressBar.parentNode.classList.remove("success");
            progressBar.parentNode.classList.add("grey");
        }
        else 
        {
            progressBar.parentNode.classList.remove("grey");
            progressBar.parentNode.classList.add("success");
        }
    }

    //log history
    function logHistory(outcome, guessedColor, remainingCards, icon)
     {
        const listItem = document.createElement("div");
        listItem.className = "item";
        listItem.innerHTML = `
            <i class="${icon} icon"></i>
            <div class="content">
                ${outcome} | Guessed ${capitalizeFirstLetter(guessedColor)} | Cards remaining: ${remainingCards}
            </div>
        `;
        historyContent.appendChild(listItem);
    }

    //capitalize the first letter of a string
    function capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //toggle cheats section
    toggleCheatsButton.addEventListener("click", () => {
        cheatsContent.style.display = cheatsContent.style.display === "none" ? "block" : "none";
        document.getElementById("cheats-placeholder").style.display = cheatsContent.style.display === "none" ? "block" : "none";
        toggleCheatsButton.textContent = cheatsContent.style.display === "none" ? "Show" : "Hide";
    });

    //calculate probability of drawing 3 or more cards of a color out of 5 cards
    function calculateProbability(remainingColorCount, remainingDeckSize) {
        //hypergeometric distribution

        //not enough cards
        if (remainingDeckSize < 5 || remainingColorCount < 3) 
        {
            return 0; 
        }

        //probability of drawing 3, 4, or 5 cards color
        const probability3 = (comb(remainingColorCount, 3) * comb(remainingDeckSize - remainingColorCount, 2)) / comb(remainingDeckSize, 5);
        const probability4 = (comb(remainingColorCount, 4) * comb(remainingDeckSize - remainingColorCount, 1)) / comb(remainingDeckSize, 5);
        const probability5 = (comb(remainingColorCount, 5) * comb(remainingDeckSize - remainingColorCount, 0)) / comb(remainingDeckSize, 5);

        //convert to percentage
        return ((probability3 + probability4 + probability5) * 100).toFixed(2);
    }

    //combination function to calculate n choose k
    function comb(n, k) 
    {
        if (k > n) return 0;
        if (k === 0 || k === n) return 1;
        let result = 1;
        for (let i = 1; i <= k; i++)
        {
            result *= (n - i + 1) / i;
        }
        return result;
    }

    //update cheats section with remaining card number and probability of each color
    function updateCheats() 
    {
        const remainingRed = 26 - totalRedDrawn;
        const remainingBlack = 26 - totalBlackDrawn;
        const remainingDeckSize = cardsRemaining;

        //probabilities for drawing 3 or more reds or blacks
        const redProbability = calculateProbability(remainingRed, remainingDeckSize);
        const blackProbability = calculateProbability(remainingBlack, remainingDeckSize);

        document.getElementById("cheats-red").textContent = `${remainingRed} (${redProbability}%)`;
        document.getElementById("cheats-black").textContent = `${remainingBlack} (${blackProbability}%)`;
    }

    //reset stats and history
    function resetStats() 
    {
        wins = 0;
        totalRounds = 0;
        //clear history log
        historyContent.innerHTML = ""; 
        updateStats();
        //hide result message
        resultMessageContainer.style.display = "none"; 
    }

    //event listeners
    drawHandButton.addEventListener("click", drawHand);
    resetStatsButton.addEventListener("click", resetStats);
    selectRedButton.addEventListener("click", () => checkWin("red"));
    selectBlackButton.addEventListener("click", () => checkWin("black"));

    initializeDeck();
});