const canvas = document.createElement("canvas");
canvas.style.display = "none"; // Hide the canvas
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
    throw new Error("WebGL not supported");
}

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

let num1, num2, input = 1, history = [], gameOver = false, turnCounter = 1, losingStreak = 0;

const goldenRatio = (1 + Math.sqrt(5)) / 2;
const losingPositions = new Set(["0,0"]);
for (let i = 1; i <= 100; i++) {
    let a = Math.floor(i * goldenRatio);
    let b = a + i;
    losingPositions.add(`${a},${b}`);
    losingPositions.add(`${b},${a}`);
}

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

document.body.innerHTML = `
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
    <button id='rematch' style='display:none;'>Rematch</button>
`;

document.getElementById("increase").addEventListener("click", () => {
    let inputField = document.getElementById("input");
    inputField.value++;
});

document.getElementById("decrease").addEventListener("click", () => {
    let inputField = document.getElementById("input");
    if (inputField.value > 1) inputField.value--;
});

const buttons = ["reduce1", "reduce2", "reduceBoth"];

buttons.forEach(id => {
    document.getElementById(id).addEventListener("click", () => {
        disableButtons();
        playerMove(id);
    });
});

document.getElementById("rematch").addEventListener("click", () => {
    initializeGame();
    document.getElementById("streak").textContent = losingStreak;
});

function disableButtons() {
    buttons.forEach(id => document.getElementById(id).disabled = true);
}

function enableButtons() {
    buttons.forEach(id => document.getElementById(id).disabled = false);
}

function updateUI() {
    document.getElementById("num1").textContent = num1;
    document.getElementById("num2").textContent = num2;
}

function logMove(player, n1, n2) {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${turnCounter}</td><td>${player}</td><td>${n1}</td><td>${n2}</td>`;
    document.getElementById("log").appendChild(row);
    turnCounter++;
}

function playerMove(action) {
    if (gameOver) return;
    input = parseInt(document.getElementById("input").value);
    
    if ((action === "reduce1" && input > num1) || (action === "reduce2" && input > num2) || (action === "reduceBoth" && (input > num1 || input > num2))) {
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
    if (!gameOver) setTimeout(aiMove, 500);
}

function aiMove() {
    if (gameOver) return;
    let moveMade = false;
    for (let i = 1; i <= Math.max(num1, num2); i++) {
        if (num1 >= i && losingPositions.has(`${num1 - i},${num2}`)) {
            num1 -= i;
            moveMade = true;
            break;
        }
        if (num2 >= i && losingPositions.has(`${num1},${num2 - i}`)) {
            num2 -= i;
            moveMade = true;
            break;
        }
        if (num1 >= i && num2 >= i && losingPositions.has(`${num1 - i},${num2 - i}`)) {
            num1 -= i;
            num2 -= i;
            moveMade = true;
            break;
        }
    }
    if (!moveMade) {
        num1 = Math.max(0, num1 - 1);
        num2 = Math.max(0, num2 - 1);
    }
    logMove("AI", num1, num2);
    updateUI();
    checkWin();
    enableButtons();
}

function checkWin() {
    if (num1 === 0 && num2 === 0) {
        gameOver = true;
        document.getElementById("rematch").style.display = "block";
        const winner = (turnCounter % 2 === 1) ? "AI Wins!" : "Player Wins!";
        document.getElementById("winnerMessage").textContent = winner;
        document.getElementById("winnerMessage").style.display = "block";
        losingStreak = (winner === "AI Wins!") ? losingStreak + 1 : 0;
        document.getElementById("streak").textContent = losingStreak;
    }
}

initializeGame();
