// Initialize a hidden WebGL canvas
const canvas = document.createElement("canvas");
canvas.style.display = "none"; // Hide the canvas
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;
const gl = canvas.getContext("webgl");

// Check if WebGL is supported
if (!gl) {
    alert("WebGL not supported");
    throw new Error("WebGL not supported");
}

// Clear the WebGL canvas with black color
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// Game variables
let num1, num2, input = 1, history = [], gameOver = false, turnCounter = 1, losingStreak = 0;

// Compute losing positions based on the golden ratio
const goldenRatio = (1 + Math.sqrt(5)) / 2;
const losingPositions = new Set(["0,0"]);
for (let i = 1; i <= 100; i++) {
    let a = Math.floor(i * goldenRatio);
    let b = a + i;
    losingPositions.add(`${a},${b}`);
    losingPositions.add(`${b},${a}`);
}

// Function to start or reset the game
function initializeGame() {
    do {
        num1 = Math.floor(Math.random() * 21) + 10;
        num2 = Math.floor(Math.random() * 21) + 10;
    } while (losingPositions.has(`${num1},${num2}`));
    
    gameOver = false;
    turnCounter = 1;
    document.getElementById("log").innerHTML = "";
    updateUI();
    document.getElementById("rematch").style.display = "none";
    document.getElementById("winnerMessage").style.display = "none";
    enableButtons();
}

// UI setup
const uiHTML = `
    <h1 style='color: white;'>Wythoff's Game</h1>
    <p style='color: white;'>Current Numbers: <span id='num1'></span>, <span id='num2'></span></p>
    <input type='number' id='input' value='1' min='1'>
    <button id='increase'>+</button>
    <button id='decrease'>-</button>
    <br>
    <button id='reduce1'>Reduce First</button>
    <button id='reduce2'>Reduce Second</button>
    <button id='reduceBoth'>Reduce Both</button>
    <p style='color: white;'>Turn Log:</p>
    <table border='1' style='color: white;'><thead><tr><th>Turn</th><th>Player</th><th>Num1</th><th>Num2</th></tr></thead><tbody id='log'></tbody></table>
    <p style='color: white;'>Losing Streak: <span id='streak'>0</span></p>
    <p id='winnerMessage' style='color: yellow; display: none;'></p>
    <p id='cheatMessage' style='color: red; display: none;'>Cheating is not allowed!</p>
    <button id='rematch' style='display:none;'>Rematch</button>
`;
document.body.innerHTML = uiHTML;

// Event listeners for input increase and decrease
document.getElementById("increase").addEventListener("click", () => {
    let inputField = document.getElementById("input");
    inputField.value++;
});

document.getElementById("decrease").addEventListener("click", () => {
    let inputField = document.getElementById("input");
    if (inputField.value > 1) inputField.value--;
});

// Assign event listeners to game action buttons
const buttons = ["reduce1", "reduce2", "reduceBoth"];
buttons.forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        disableButtons();
        playerMove(id);
    });
});

// Event listener for rematch button
document.getElementById("rematch").addEventListener("click", () => {
    initializeGame();
    document.getElementById("streak").textContent = losingStreak;
});

// Disable action buttons to prevent spam clicking
function disableButtons() {
    buttons.forEach(id => document.getElementById(id).disabled = true);
}

// Enable action buttons after AI moves
function enableButtons() {
    buttons.forEach(id => document.getElementById(id).disabled = false);
}

// Update the UI with the current game state
function updateUI() {
    document.getElementById("num1").textContent = num1;
    document.getElementById("num2").textContent = num2;
    document.getElementById("input").value = 1;
}

// Log each move in the game table
function logMove(player, n1, n2) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${turnCounter}</td><td>${player}</td><td>${n1}</td><td>${n2}</td>`;
    document.getElementById("log").appendChild(row);
    turnCounter++;
}

// Handle player's move and check validity
function playerMove(action) {
    if (gameOver) return;
    input = parseInt(document.getElementById("input").value);
    if (isNaN(input) || input < 1) {
        alert("Invalid input! Please enter a natural number greater than zero.");
        enableButtons();
        return;
    }
    if ((action !== "reduceBoth" && input > Math.min(num1, num2)) || (action === "reduceBoth" && (input > num1 || input > num2))) {
        document.getElementById("cheatMessage").style.display = "block";
        setTimeout(() => {
            document.getElementById("cheatMessage").style.display = "none";
        }, 2000);
        enableButtons();
        return;
    }
    
    if (action === "reduce1") num1 -= input;
    else if (action === "reduce2") num2 -= input;
    else if (action === "reduceBoth") {
        num1 -= input;
        num2 -= input;
    }
    
    logMove("Player", num1, num2);
    updateUI();
    checkWin();
    if (!gameOver) setTimeout(() => { aiMove(); enableButtons(); }, 500);
}

// Check if the game has been won
function checkWin() {
    if (num1 === 0 && num2 === 0) {
        gameOver = true;
        document.getElementById("rematch").style.display = "block";
        const winner = (turnCounter % 2 === 0) ? "AI Wins!" : "Player Wins!";
        document.getElementById("winnerMessage").textContent = winner;
        document.getElementById("winnerMessage").style.display = "block";
        losingStreak = (winner === "AI Wins!") ? losingStreak + 1 : 0;
        document.getElementById("streak").textContent = losingStreak;
    }
}

// Start the game
initializeGame();