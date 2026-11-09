const SIZE = 4;

// Создаём пустое поле 4x4
export function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

// Находим все клетки, в которых ещё нет плиток
function getEmptyCells(board) {
    const emptyCells = [];

    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }

    return emptyCells;
}

// Добавляем в случайную пустую клетку плитку со значением 2 или 4
export function addRandomTile(board) {
    const emptyCells = getEmptyCells(board);

    if (emptyCells.length === 0) {
        return false;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const cell = emptyCells[randomIndex];

    board[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;

    return true;
}

// Создаём состояние новой игры с одной-тремя стартовыми плитками
export function createNewGame() {
    const board = createEmptyBoard();
    const tilesCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < tilesCount; i++) {
        addRandomTile(board);
    }

    return {
        board,
        score: 0,
        isGameOver: false,
        scoreSaved: false
    };
}

// Обрабатываем одну строку или колонку так, будто она направлена влево
function moveRowLeft(row) {
    // Сохраняем только непустые плитки и их исходные координаты
    let tiles = row.filter(tile => tile.value !== 0);
    let score = 0;
    let hasMerged = true;

    // По примерам задания результат слияния тоже может объединиться
    // с такой же плиткой в рамках одного хода
    while (hasMerged) {
        const newTiles = [];
        hasMerged = false;

        for (let i = 0; i < tiles.length; i++) {
            const nextTile = tiles[i + 1];

            if (nextTile && tiles[i].value === nextTile.value) {
                const newValue = tiles[i].value * 2;

                newTiles.push({
                    value: newValue,
                    sources: [
                        ...tiles[i].sources,
                        ...nextTile.sources
                    ]
                });

                // За слияние начисляем очки, равные значению новой плитки
                score += newValue;

                // Вторая плитка уже использована в этом слиянии
                i++;
                hasMerged = true;
            } else {
                newTiles.push(tiles[i]);
            }
        }

        tiles = newTiles;
    }

    return {
        cells: tiles,
        score
    };
}

// Возвращаем координаты клеток в том порядке, в котором их нужно обработать
function getLineCoordinates(direction, index) {
    const coordinates = [];

    for (let i = 0; i < SIZE; i++) {
        if (direction === "left") {
            coordinates.push([index, i]);
        } else if (direction === "right") {
            coordinates.push([index, SIZE - 1 - i]);
        } else if (direction === "up") {
            coordinates.push([i, index]);
        } else if (direction === "down") {
            coordinates.push([SIZE - 1 - i, index]);
        }
    }

    return coordinates;
}

// Сравниваем два поля, чтобы понять, изменилось ли положение плиток
function isBoardChanged(oldBoard, newBoard) {
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            if (oldBoard[row][col] !== newBoard[row][col]) {
                return true;
            }
        }
    }

    return false;
}

// Проверяем, остался ли хотя бы один возможный ход
export function checkGameOver(board) {
    // Если есть пустая клетка, игра ещё не закончена
    if (getEmptyCells(board).length > 0) {
        return false;
    }

    // Если соседние плитки равны, их ещё можно объединить
    for (let row = 0; row < SIZE; row++) {
        for (let col = 0; col < SIZE; col++) {
            const current = board[row][col];

            if (col < SIZE - 1 && current === board[row][col + 1]) {
                return false;
            }

            if (row < SIZE - 1 && current === board[row + 1][col]) {
                return false;
            }
        }
    }

    return true;
}

// Выполняем движение всего поля в одном из четырёх направлений
export function moveBoard(board, direction) {
    const directions = ["left", "right", "up", "down"];

    if (!directions.includes(direction)) {
        return {
            board,
            score: 0,
            moved: false,
            movements: []
        };
    }

    const newBoard = createEmptyBoard();
    const movements = [];
    let score = 0;

    // Обрабатываем четыре строки или четыре колонки
    for (let i = 0; i < SIZE; i++) {
        const coordinates = getLineCoordinates(direction, i);

        // Для каждой плитки запоминаем её исходную координату
        const line = coordinates.map(([row, col]) => ({
            value: board[row][col],
            sources: [{ row, col }]
        }));

        const result = moveRowLeft(line);
        score += result.score;

        // Записываем новые значения и формируем данные для анимации
        result.cells.forEach((cell, index) => {
            const [toRow, toCol] = coordinates[index];

            newBoard[toRow][toCol] = cell.value;

            cell.sources.forEach((source, sourceIndex) => {
                movements.push({
                    fromRow: source.row,
                    fromCol: source.col,
                    toRow,
                    toCol,
                    value: cell.value,
                    // Первая плитка остаётся, остальные исчезают при слиянии.
                    survivor: sourceIndex === 0,
                    merged: cell.sources.length > 1
                });
            });
        });
    }

    return {
        board: newBoard,
        score,
        moved: isBoardChanged(board, newBoard),
        movements
    };
}
