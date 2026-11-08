
const SIZE = 4;

export function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

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

export function createNewGame() {
    const board = createEmptyBoard();

    const tilesCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < tilesCount; i++) {
        addRandomTile(board);
    }

    return {
        board,
        score: 0,
        isGameOver: false
    };
}



function moveRowLeft(row) {
    // Вместо обычных чисел используем объекты,
    // чтобы не потерять исходные координаты плиток
    let numbers = row.filter(cell => cell.value !== 0);

    let score = 0;

    // Повторяем объединение, пока есть одинаковые соседние плитки
    while (true) {
        const result = [];
        let merged = false;

        for (let i = 0; i < numbers.length; i++) {
            if (
                numbers[i + 1] &&
                numbers[i].value === numbers[i + 1].value
            ) {
                const newValue = numbers[i].value * 2;

                result.push({
                    value: newValue,

                    // Запоминаем координаты обеих исходных плиток
                    sources: [
                        ...numbers[i].sources,
                        ...numbers[i + 1].sources
                    ]
                });

                score += newValue;

                i++;
                merged = true;
            } else {
                result.push(numbers[i]);
            }
        }

        numbers = result;

        if (!merged) {
            break;
        }
    }

    return {
        cells: numbers,
        score
    };
}

function getLineCoordinates(direction, index) {
    const coordinates = [];

    for (let i = 0; i < SIZE; i++) {
        if (direction === "left") {
            coordinates.push([index, i]);
        }

        if (direction === "right") {
            coordinates.push([index, SIZE - 1 - i]);
        }

        if (direction === "up") {
            coordinates.push([i, index]);
        }

        if (direction === "down") {
            coordinates.push([SIZE - 1 - i, index]);
        }
    }

    return coordinates;
}

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

export function checkGameOver(board) {
    if (getEmptyCells(board).length > 0) {
        return false;
    }

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


export function moveBoard(board, direction) {
    if (!["left", "right", "up", "down"].includes(direction)) {
        return {
            board,
            score: 0,
            moved: false,
            movements: []
        };
    }

    const newBoard = createEmptyBoard();

    let score = 0;
    const movements = [];

    for (let i = 0; i < SIZE; i++) {
        const coordinates = getLineCoordinates(direction, i);

        // Получаем плитки и запоминаем их старые координаты
        const line = coordinates.map(([row, col]) => ({
            value: board[row][col],
            sources: [{
                row,
                col
            }]
        }));

        const result = moveRowLeft(line);

        score += result.score;

        // Записываем результат обработки линии
        result.cells.forEach((cell, index) => {
            const [toRow, toCol] = coordinates[index];

            newBoard[toRow][toCol] = cell.value;

            // Запоминаем перемещение каждой исходной плитки
            cell.sources.forEach((source, sourceIndex) => {
                movements.push({
                    fromRow: source.row,
                    fromCol: source.col,
                    toRow,
                    toCol,
                    value: cell.value,
                    // Первая плитка становится итоговой,
                    // остальные плавно сходятся с ней и исчезают.
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

