
const SIZE = 4;

// Создаем пустое игровое поле
export function createEmptyBoard() {
    return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

// Возвращаем список свободных клеток
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

// Добавляем новую плитку со значением 2 или 4
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

// Создаем новое игровое поле
export function createNewGame() {
    const board = createEmptyBoard();

    // В начале игры появляется от 1 до 3 плиток
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

// Перемещаем плитки влево

function moveRowLeft(row) {
    let numbers = row.filter(value => value !== 0);
    let score = 0;

    // Повторяем объединение, пока остаются одинаковые соседние плитки
    while (true) {
        const result = [];
        let merged = false;

        for (let i = 0; i < numbers.length; i++) {
            if (numbers[i] === numbers[i + 1]) {
                const newValue = numbers[i] * 2;

                result.push(newValue);
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

    while (numbers.length < SIZE) {
        numbers.push(0);
    }

    return { row: numbers, score };
}

// Получаем координаты одной линии в зависимости от направления
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

// Проверяем, изменилось ли поле
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

// Проверяем, закончилась ли игра
export function checkGameOver(board) {
    // Если есть хотя бы одна пустая клетка, игра продолжается
    if (getEmptyCells(board).length > 0) {
        return false;
    }

    // Проверяем соседние плитки по горизонтали и вертикали
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

// Выполняем ход
export function moveBoard(board, direction) {
    if (!["left", "right", "up", "down"].includes(direction)) {
        return {
            board,
            score: 0,
            moved: false
        };
    }

    const newBoard = createEmptyBoard();
    let score = 0;

    for (let i = 0; i < SIZE; i++) {
        const coordinates = getLineCoordinates(direction, i);

        const line = coordinates.map(([row, col]) => board[row][col]);

        const result = moveRowLeft(line);

        score += result.score;

        // Записываем обработанную линию обратно на поле
        coordinates.forEach(([row, col], index) => {
            newBoard[row][col] = result.row[index];
        });
    }

    return {
        board: newBoard,
        score,
        moved: isBoardChanged(board, newBoard)
    };
}
