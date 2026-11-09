// Элементы игрового поля и счёта
const tilesContainer = document.getElementById("tiles");
const scoreElement = document.getElementById("score");
const gridContainer = document.getElementById("grid");

// Элементы таблицы лидеров
const leaderboardModal = document.getElementById("leaderboard-modal");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardEmpty = document.getElementById("leaderboard-empty");

// Элементы окна окончания игры
const gameoverModal = document.getElementById("gameover-modal");
const finalScore = document.getElementById("final-score");
const saveForm = document.getElementById("save-score-form");
const saveStatus = document.getElementById("save-status");

const BOARD_SIZE = 4;
const MOVE_ANIMATION_WAIT = 190;
const MERGE_ANIMATION_DURATION = 160;

// Храним таймеры анимации, чтобы отменять их при перезапуске или undo
const animationTimers = new Set();

function startAnimationTimer(callback, delay) {
    const timer = setTimeout(() => {
        animationTimers.delete(timer);
        callback();
    }, delay);

    animationTimers.add(timer);
}

function clearAnimationTimers() {
    animationTimers.forEach(timer => clearTimeout(timer));
    animationTimers.clear();
}

// Создаём пустые клетки сетки 
for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement("div");
    cell.classList.add("grid-cell");
    gridContainer.appendChild(cell);
}

// Находим размеры и положение клетки относительно слоя с плитками
function getCellPosition(row, col) {
    const cell = gridContainer.children[row * BOARD_SIZE + col];
    const cellRect = cell.getBoundingClientRect();
    const layerRect = tilesContainer.getBoundingClientRect();

    return {
        left: cellRect.left - layerRect.left,
        top: cellRect.top - layerRect.top,
        width: cellRect.width,
        height: cellRect.height
    };
}

// Устанавливаем плитку в нужную клетку
function setTilePosition(tile, row, col) {
    const position = getCellPosition(row, col);

    tile.style.left = `${position.left}px`;
    tile.style.top = `${position.top}px`;
    tile.style.width = `${position.width}px`;
    tile.style.height = `${position.height}px`;
}

// Создаём HTML-элемент плитки
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

// Полностью отрисовываем поле (например, при запуске или отмене хода)
function renderStaticBoard(board) {
    tilesContainer.innerHTML = "";

    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const value = board[row][col];

            if (value !== 0) {
                tilesContainer.appendChild(createTile(value, row, col));
            }
        }
    }
}

// Перемещаем плитки, а после завершения движения выполняем слияния
function renderAnimatedBoard(board, movements) {
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

        // Плитки, которые участвуют в слиянии, обрабатываем отдельно
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

    // Ждём окончания движения, затем обновляем плитки после слияния
    startAnimationTimer(() => {
        tilesToRemove.forEach(tile => tile.remove());

        tilesToUpdate.forEach(({ tile, move }) => {
            tile.dataset.row = move.toRow;
            tile.dataset.col = move.toCol;
            tile.className = `tile tile-${move.value}`;
            tile.textContent = move.value;

            // Оставляем исходную анимацию объединения
            tile.classList.add("tile--merge");

            startAnimationTimer(() => {
                tile.classList.remove("tile--merge");
            }, MERGE_ANIMATION_DURATION);
        });

        // Новые плитки появляются после завершения движения
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
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
    }, MOVE_ANIMATION_WAIT);
}

// Перерисовываем поле с анимацией или без неё
export function renderBoard(board, movements = null) {
    // Незавершённая анимация не должна менять уже обновлённое поле
    clearAnimationTimers();

    if (movements === null) {
        renderStaticBoard(board);
        return;
    }

    renderAnimatedBoard(board, movements);
}

// При изменении размера окна сохраняем расположение плиток
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

// Обновляем счёт и доступность кнопки отмены
export function renderScore(score) {
    scoreElement.textContent = score;
}

export function renderUndoButton(canUndo) {
    document.getElementById("undo-btn").disabled = !canUndo;
}

// Показываем окно окончания игры. Если рекорд уже сохранён, форму не показываем
export function showGameOver(score, isSaved = false) {
    finalScore.textContent = score;

    saveForm.hidden = isSaved;
    saveStatus.hidden = !isSaved;

    if (!isSaved) {
        saveForm.reset();
    }

    gameoverModal.hidden = false;
    document.body.classList.add("modal-open");
}

export function hideGameOver() {
    gameoverModal.hidden = true;
    document.body.classList.remove("modal-open");
}

// После сохранения результата заменяем форму сообщением
export function showSavedMessage() {
    saveStatus.textContent = "Your record was saved!";
    saveForm.hidden = true;
    saveStatus.hidden = false;
}

// Сообщаем, если браузер не смог записать результат в localStorage
export function showSaveError() {
    saveStatus.textContent = "Could not save your record. Please try again.";
    saveStatus.hidden = false;
}

// Заполняем таблицу лидеров безопасно, используя textContent
export function showLeaderboard(leaders) {
    leaderboardBody.innerHTML = "";
    leaderboardModal.hidden = false;
    document.body.classList.add("modal-open");

    leaderboardEmpty.hidden = leaders.length > 0;

    leaders.forEach(leader => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const scoreCell = document.createElement("td");
        const dateCell = document.createElement("td");

        nameCell.textContent = leader.name;
        scoreCell.textContent = leader.score;
        dateCell.textContent = leader.date;

        row.append(nameCell, scoreCell, dateCell);
        leaderboardBody.appendChild(row);
    });
}

export function hideLeaderboard() {
    leaderboardModal.hidden = true;
    document.body.classList.remove("modal-open");
}
