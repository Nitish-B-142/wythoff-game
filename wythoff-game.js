document.addEventListener("DOMContentLoaded", () => {
    let gameState = {
        num1: getRandomNonWinningNumber(),
        num2: getRandomNonWinningNumber(),
        playerTurn: true,
        losingStreak: 0,
        turnHistory: []
    };
    
    const num1Display = document.getElementById("num1");
    const num2Display = document.getElementById("num2");
    const inputField = document.getElementById("moveValue");
    const messageBox = document.getElementById("message");
    const historyTable = document.getElementById("history");
    const streakDisplay = document.getElementById("losingStreak");
    const buttons = document.querySelectorAll(".move-btn");
    
    function updateUI() {
        num1Display.textContent = gameState.num1;
        num2Display.textContent = gameState.num2;
        streakDisplay.textContent = gameState.losingStreak;
    }
    
    function disableButtons(disable) {
        buttons.forEach(btn => btn.disabled = disable);
    }
    
    function getRandomNonWinningNumber() {
        let n;
        do {
            n = Math.floor(Math.random() * 21) + 10;
        } while (isWinningPosition(n, n));
        return n;
    }
    
    function isWinningPosition(a, b) {
        const phi = (1 + Math.sqrt(5)) / 2;
        let winningX = Math.floor(b - a * phi) === 0;
        let winningY = Math.floor(a - b * phi) === 0;
        return winningX || winningY;
    }
    
    function makeMove(reduceFirst, reduceSecond) {
        let moveValue = parseInt(inputField.value, 10);
        if (moveValue <= 0 || isNaN(moveValue) || 
            (reduceFirst && moveValue > gameState.num1) || 
            (reduceSecond && moveValue > gameState.num2)) {
            messageBox.textContent = "Invalid move!";
            return;
        }
        
        if (reduceFirst) gameState.num1 -= moveValue;
        if (reduceSecond) gameState.num2 -= moveValue;
        gameState.turnHistory.push({ turn: "Player", num1: gameState.num1, num2: gameState.num2 });
        disableButtons(true);
        updateUI();
        setTimeout(aiMove, 500);
    }
    
    function aiMove() {
        if (gameState.num1 === 0 && gameState.num2 === 0) {
            messageBox.textContent = "Player Wins!";
            gameState.losingStreak = 0;
            return;
        }
        
        if (!isWinningPosition(gameState.num1, gameState.num2)) {
            let moveValue = Math.min(gameState.num1, gameState.num2);
            gameState.num1 -= moveValue;
            gameState.num2 -= moveValue;
        } else {
            gameState.num1 = Math.max(0, gameState.num1 - 1);
            gameState.num2 = Math.max(0, gameState.num2 - 1);
        }
        
        gameState.turnHistory.push({ turn: "AI", num1: gameState.num1, num2: gameState.num2 });
        updateUI();
        disableButtons(false);
        
        if (gameState.num1 === 0 && gameState.num2 === 0) {
            messageBox.textContent = "AI Wins!";
            gameState.losingStreak++;
        }
    }
    
    document.getElementById("reduceNum1").addEventListener("click", () => makeMove(true, false));
    document.getElementById("reduceNum2").addEventListener("click", () => makeMove(false, true));
    document.getElementById("reduceBoth").addEventListener("click", () => makeMove(true, true));
    
    document.getElementById("rematch").addEventListener("click", () => {
        gameState.num1 = getRandomNonWinningNumber();
        gameState.num2 = getRandomNonWinningNumber();
        gameState.turnHistory = [];
        messageBox.textContent = "";
        disableButtons(false);
        updateUI();
    });
    
    updateUI();
});
