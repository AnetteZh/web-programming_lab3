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

// Возвращает координаты клетки относительно слоя с плитками.
// Благодаря этому плитки можно позиционировать абсолютно,
// а CSS сам плавно анимирует изменение left и top.

function getCellPosition(row, col) {
    const cell = gridContainer.children[row * 4 + col];
    const cellRect = cell.getBoundingClientRect();
    const layerRect = tilesContainer.getBoundingClientRect();

    return {
        left: cellRect.left - layerRect.left,
        top: cellRect.top - layerRect.top,
        width: cellRect.width,
        height: cellRect.height
    };
}

function setTilePosition(tile, row, col) {
    const position = getCellPosition(row, col);

    tile.style.left = `${position.left}px`;
    tile.style.top = `${position.top}px`;
    tile.style.width = `${position.width}px`;
    tile.style.height = `${position.height}px`;
}

function createTile(value, row, col, isNew = false) {
    const tile = document.createElement("div");

    tile.classList.add("tile", `tile-${value}`);
    tile.textContent = value;

    tile.dataset.row = row;
    tile.dataset.col = col;

    setTilePosition(tile, row, col);

    if (isNew) {
        tile.classList.add("tile--new");
    }

    return tile;
}

export function renderBoard(board, movements = null) {
    if (movements === null) {
        tilesContainer.innerHTML = "";

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = board[row][col];

                if (value !== 0) {
                    tilesContainer.appendChild(createTile(value, row, col));
                }
            }
        }

        return;
    }

    const oldTiles = new Map();

    tilesContainer.querySelectorAll(".tile").forEach(tile => {
        const key = `${tile.dataset.row}-${tile.dataset.col}`;
        oldTiles.set(key, tile);
    });

    const occupiedCells = new Set();
    const tilesToRemove = [];
    const tilesToUpdate = [];

    movements.forEach(move => {
        const fromKey = `${move.fromRow}-${move.fromCol}`;
        const tile = oldTiles.get(fromKey);

        if (!tile) {
            return;
        }

        const toKey = `${move.toRow}-${move.toCol}`;
        occupiedCells.add(toKey);

        const hasMoved =
            move.fromRow !== move.toRow ||
            move.fromCol !== move.toCol;

        // Сохраняем плитки, которые участвуют в объединении.
        if (move.merged) {
            if (hasMoved) {
                tile.style.transition =
                    "left 180ms ease-in-out, top 180ms ease-in-out";

                setTilePosition(tile, move.toRow, move.toCol);
            }

            if (move.survivor) {
                tilesToUpdate.push({ tile, move });
            } else {
                tilesToRemove.push(tile);
            }

            return;
        }

        if (!hasMoved) {
            return;
        }

        tile.style.transition =
            "left 180ms ease-in-out, top 180ms ease-in-out";

        setTilePosition(tile, move.toRow, move.toCol);

        tile.dataset.row = move.toRow;
        tile.dataset.col = move.toCol;
    });

    // Ждём завершения движения, прежде чем объединять плитки.
    setTimeout(() => {
        tilesToRemove.forEach(tile => tile.remove());

        tilesToUpdate.forEach(({ tile, move }) => {
            tile.dataset.row = move.toRow;
            tile.dataset.col = move.toCol;
            tile.className = `tile tile-${move.value}`;
            tile.textContent = move.value;

            tile.classList.add("tile--merge");

            setTimeout(() => {
                tile.classList.remove("tile--merge");
            }, 160);
        });

        // Добавляем новые плитки после завершения движения.
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const value = board[row][col];
                const key = `${row}-${col}`;

                if (value === 0 || occupiedCells.has(key)) {
                    continue;
                }

                tilesContainer.appendChild(
                    createTile(value, row, col, true)
                );
            }
        }
    }, 190);
}

// При изменении размера окна пересчитываем координаты без анимации.
window.addEventListener("resize", () => {
    const tiles = tilesContainer.querySelectorAll(".tile");

    tiles.forEach(tile => {
        tile.style.transition = "none";
        setTilePosition(tile, Number(tile.dataset.row), Number(tile.dataset.col));
    });

    requestAnimationFrame(() => {
        tiles.forEach(tile => {
            tile.style.removeProperty("transition");
        });
    });
});

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
