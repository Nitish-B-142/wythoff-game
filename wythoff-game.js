// Wythoff's Game - Improved Structure with Better Rendering

// Ensure the document is fully loaded before execution
window.onload = function() {
    initializeGame();
};

function initializeGame() {
    createUI();
    resetGame();
}

function createUI() {
    document.body.innerHTML = `
        <h1>Wythoff's Game</h1>
        <div id="game-container">
            <p>Current Numbers: <span id="current-numbers"></span></p>
            <input type="number" id="input-number" min="1" value="1">
            <button onclick="increaseInput()">+</button>
            <button onclick="decreaseInput()">-</button>
            <button onclick="playerMove(1)">Reduce First</button>
            <button onclick="playerMove(2)">Reduce Second</button>
            <button onclick="playerMove(3)">Reduce Both</button>
        </div>
        <div id="message"></div>
        <button onclick="resetGame()">Rematch</button>
        <table id="move-history">
            <tr><th>Turn</th><th>Player</th><th>Numbers</th></tr>
        </table>
        <p>Losing Streak: <span id="losing-streak">0</span></p>
    `;
}

let gameData;

function resetGame() {
    gameData = {
        first: getRandomStart(),
        second: getRandomStart(),
        turn: 1,
        losingStreak: parseInt(localStorage.getItem("losingStreak")) || 0
    };
    updateDisplay();
}

function getRandomStart() {
    let num;
    do {
        num = Math.floor(Math.random() * 21) + 10;
    } while (isWinningPosition(num, num));
    return num;
}

function updateDisplay() {
    document.getElementById("current-numbers").textContent = `${gameData.first}, ${gameData.second}`;
    document.getElementById("losing-streak").textContent = gameData.losingStreak;
}

function playerMove(type) {
    let num = parseInt(document.getElementById("input-number").value);
    if (num <= 0 || num > Math.max(gameData.first, gameData.second)) {
        displayMessage("Invalid move!", true);
        return;
    }
    
    if (type === 1 && gameData.first >= num) gameData.first -= num;
    else if (type === 2 && gameData.second >= num) gameData.second -= num;
    else if (type === 3 && gameData.first >= num && gameData.second >= num) {
        gameData.first -= num;
        gameData.second -= num;
    } else {
        displayMessage("Invalid move!", true);
        return;
    }
    
    addMoveHistory("Player", gameData.first, gameData.second);
    checkGameStatus();
    setTimeout(aiMove, 500);
}

function aiMove() {
    if (gameData.first === 0 && gameData.second === 0) return;
    
    let bestMove = findBestMove(gameData.first, gameData.second);
    gameData.first -= bestMove[0];
    gameData.second -= bestMove[1];
    addMoveHistory("AI", gameData.first, gameData.second);
    checkGameStatus();
}

function checkGameStatus() {
    if (gameData.first === 0 && gameData.second === 0) {
        displayMessage("Game Over! " + (gameData.turn % 2 === 0 ? "Player Wins!" : "AI Wins!"));
        if (gameData.turn % 2 !== 0) gameData.losingStreak++;
        else gameData.losingStreak = 0;
        localStorage.setItem("losingStreak", gameData.losingStreak);
    }
    updateDisplay();
    gameData.turn++;
}

function addMoveHistory(player, first, second) {
    let table = document.getElementById("move-history");
    let row = table.insertRow();
    row.innerHTML = `<td>${gameData.turn}</td><td>${player}</td><td>${first}, ${second}</td>`;
}

function findBestMove(a, b) {
    if (isWinningPosition(a, b)) return [1, 1];
    let goldenRatio = (1 + Math.sqrt(5)) / 2;
    let targetA = Math.floor(b * goldenRatio);
    let targetB = Math.floor(a * goldenRatio);
    if (targetA <= a) return [a - targetA, 0];
    if (targetB <= b) return [0, b - targetB];
    return [1, 1];
}

function isWinningPosition(a, b) {
    let goldenRatio = (1 + Math.sqrt(5)) / 2;
    let n = Math.floor(a * goldenRatio);
    return n === b;
}

function displayMessage(text, temporary = false) {
    let msg = document.getElementById("message");
    msg.textContent = text;
    if (temporary) setTimeout(() => msg.textContent = "", 2000);
}

function increaseInput() {
    let input = document.getElementById("input-number");
    input.value = parseInt(input.value) + 1;
}

function decreaseInput() {
    let input = document.getElementById("input-number");
    if (parseInt(input.value) > 1) input.value = parseInt(input.value) - 1;
}
