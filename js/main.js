import {
    createNewGame,
    moveBoard,
    addRandomTile,
    checkGameOver
} from "./game.js";

import {
    saveGame,
    loadGame,
    loadLeaders,
    saveLeader
} from "./storage.js";

import {
    renderBoard,
    renderScore,
    renderUndoButton,
    showGameOver,
    hideGameOver,
    showSavedMessage,
    showSaveError,
    showLeaderboard,
    hideLeaderboard
} from "./ui.js";

import { initControls } from "./control.js";

// Сколько времени блокируем новые ходы, пока проигрывается анимация
const ANIMATION_DURATION = 370;

// Текущее состояние игры и история предыдущих ходов
let gameState;
let history = [];

// Пока плитки анимируются, новые ходы не принимаются
let isAnimating = false;
let animationTimeout = null;

// Создаём отдельную копию состояния для истории отмены
function copyState(state) {
    return {
        board: state.board.map(row => [...row]),
        score: state.score,
        isGameOver: state.isGameOver,
        scoreSaved: state.scoreSaved
    };
}

// Сохраняем текущее состояние игры и историю ходов
function saveCurrentGame() {
    saveGame(gameState, history);
}

// Обновляем игровое поле, счёт и доступность кнопки отмены
function updateUI(movements = null) {
    renderBoard(gameState.board, movements);
    renderScore(gameState.score);

    // Кнопка остаётся визуально активной во время анимации
    // Сам обработчик undo всё равно не даст отменить ход до её завершения
    const canUndo = history.length > 0 && !gameState.isGameOver;

    renderUndoButton(canUndo);
}

// Начинаем новую игру без перезагрузки страницы
function restartGame() {
    // Останавливаем старую анимацию, чтобы она не изменила новое поле
    clearTimeout(animationTimeout);
    animationTimeout = null;
    isAnimating = false;

    gameState = createNewGame();
    history = [];

    hideGameOver();
    hideLeaderboard();

    updateUI();
    saveCurrentGame();
}

// Обрабатываем ход в одном из четырёх направлений
function handleMove(direction) {
    if (gameState.isGameOver || isAnimating) {
        return;
    }

    const result = moveBoard(gameState.board, direction);

    // Если поле не изменилось, ход не засчитывается и плитка не появляется
    if (!result.moved) {
        return;
    }

    // Сохраняем состояние до хода, чтобы его можно было восстановить
    history.push(copyState(gameState));

    gameState.board = result.board;
    gameState.score += result.score;

    // После успешного хода добавляем одну или две случайные плитки
    const tilesCount = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < tilesCount; i++) {
        // Если свободных клеток больше нет, добавить следующую плитку нельзя
        if (!addRandomTile(gameState.board)) {
            break;
        }
    }

    // Конец игры проверяем уже после появления новых плиток
    gameState.isGameOver = checkGameOver(gameState.board);
    gameState.scoreSaved = false;

    isAnimating = true;
    updateUI(result.movements);
    saveCurrentGame();

    animationTimeout = setTimeout(() => {
        isAnimating = false;
        animationTimeout = null;
        renderUndoButton(history.length > 0 && !gameState.isGameOver);
    }, ANIMATION_DURATION);

    if (gameState.isGameOver) {
        showGameOver(gameState.score, false);
    }
}

// Отменяем последний ход. После окончания игры undo недоступен
function handleUndo() {
    if (gameState.isGameOver || isAnimating || history.length === 0) {
        return;
    }

    gameState = history.pop();

    updateUI();
    saveCurrentGame();
}

// Открываем таблицу лидеров
function handleLeaderboard() {
    showLeaderboard(loadLeaders());
}

// Сохраняем результат только один раз за одну завершённую игру
function handleSaveScore(name) {
    if (!gameState.isGameOver || gameState.scoreSaved) {
        return;
    }

    const savedLeaders = saveLeader(name, gameState.score);

    if (!savedLeaders) {
        showSaveError();
        return;
    }

    gameState.scoreSaved = true;

    saveCurrentGame();
    showSavedMessage();
}

// Закрываем нужное модальное окно
function handleCloseModal(modalId) {
    if (modalId === "leaderboard-modal") {
        hideLeaderboard();
    }

    if (modalId === "gameover-modal") {
        hideGameOver();
    }
}

// Загружаем сохранённую игру или создаём новую
function initGame() {
    const savedGame = loadGame();

    if (savedGame) {
        gameState = savedGame.state;
        history = savedGame.history;

        // Добавлено для совместимости с сохранениями старой версии игры
        gameState.scoreSaved = gameState.scoreSaved ?? false;
    } else {
        gameState = createNewGame();
        history = [];
    }

    updateUI();

    if (gameState.isGameOver) {
        showGameOver(gameState.score, gameState.scoreSaved);
    }

    saveCurrentGame();
}

// Подключаем обработчики событий
initControls({
    onMove: handleMove,
    onUndo: handleUndo,
    onRestart: restartGame,
    onLeaderboard: handleLeaderboard,
    onSaveScore: handleSaveScore,
    onCloseModal: handleCloseModal
});

// Запускаем приложение
initGame();
