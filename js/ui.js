
const tilesContainer = document.getElementById("tiles");
const scoreElement = document.getElementById("score");

const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardEmpty = document.getElementById("leaderboard-empty");

const gameoverModal = document.getElementById("gameover-modal");
const finalScore = document.getElementById("final-score");

const saveForm = document.getElementById("save-score-form");
const saveStatus = document.getElementById("save-status");

const gridContainer = document.getElementById("grid");

for (let i = 0; i < 16; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    gridContainer.appendChild(cell);
}

export function renderBoard(board) {
    tilesContainer.innerHTML = "";

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            const value = board[row][col];

            if (value === 0) {
                continue;
            }

            const tile = document.createElement("div");

            tile.classList.add("tile");
            tile.classList.add(`tile-${value}`);

            tile.textContent = value;

            tile.style.gridRow = row + 1;
            tile.style.gridColumn = col + 1;

            tilesContainer.appendChild(tile);
        }
    }
}

export function renderScore(score) {
    scoreElement.textContent = score;
}

export function renderUndoButton(canUndo) {
    const undoButton = document.getElementById("undo-btn");

    undoButton.disabled = !canUndo;
}

export function showGameOver(score) {
    finalScore.textContent = score;

    saveForm.hidden = false;
    saveStatus.hidden = true;

    saveForm.reset();

    gameoverModal.hidden = false;
    document.body.classList.add("modal-open");
}

export function hideGameOver() {
    gameoverModal.hidden = true;
    document.body.classList.remove("modal-open");
}

export function showSavedMessage() {
    saveForm.hidden = true;
    saveStatus.hidden = false;
}

export function showLeaderboard(leaders) {
    leaderboardBody.innerHTML = "";

    leaderboardModal.hidden = false;
    document.body.classList.add("modal-open");

    leaderboardEmpty.hidden = leaders.length > 0;

    leaders.forEach((leader, index) => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        const scoreCell = document.createElement("td");
        const dateCell = document.createElement("td");

        nameCell.textContent = leader.name;
        scoreCell.textContent = leader.score;
        dateCell.textContent = leader.date;

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        row.appendChild(dateCell);

        leaderboardBody.appendChild(row);
    });
}

export function hideLeaderboard() {
    leaderboardModal.hidden = true;
    document.body.classList.remove("modal-open");
}
