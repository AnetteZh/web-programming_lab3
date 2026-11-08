
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
    showLeaderboard,
    hideLeaderboard
} from "./ui.js";

import { initControls } from "./control.js";

// Текущее состояние игры
let gameState;

// История предыдущих ходов
let history = [];

// Пока плитки анимируются, новые ходы не принимаются.
let isAnimating = false;
let animationTimeout = null;

// Создаем копию состояния для сохранения в истории
function copyState(state) {
    return {
        board: state.board.map(row => [...row]),
        score: state.score,
        isGameOver: state.isGameOver
    };
}

// Сохраняем текущее состояние
function saveCurrentGame() {
    saveGame(gameState, history);
}

// Обновляем отображение игры
function updateUI(movements = null) {
    renderBoard(gameState.board, movements);
    renderScore(gameState.score);

    renderUndoButton(
        history.length > 0 && !gameState.isGameOver && !isAnimating
    );
}

// Начинаем новую игру
function restartGame() {
    // Сбрасываем блокировку и старый таймер анимации.
    clearTimeout(animationTimeout);
    isAnimating = false;

    gameState = createNewGame();
    history = [];

    hideGameOver();
    hideLeaderboard();

    updateUI();
    saveCurrentGame();
}

// Обрабатываем движение плиток
function handleMove(direction) {
    if (gameState.isGameOver || isAnimating) {
        return;
    }

    const result = moveBoard(gameState.board, direction);

    // Если поле не изменилось, ничего не делаем
    if (!result.moved) {
        return;
    }

    // Сохраняем состояние до совершения хода
    history.push(copyState(gameState));

    // Обновляем игровое поле и счет
    gameState.board = result.board;
    gameState.score += result.score;

    // После успешного хода появляется 1 или 2 новые плитки
    const tilesCount = Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < tilesCount; i++) {
        if (!addRandomTile(gameState.board)) {
            break;
        }
    }

    // Проверяем, закончилась ли игра
    gameState.isGameOver = checkGameOver(gameState.board);

    isAnimating = true;
    updateUI(result.movements);
    saveCurrentGame();

    // Движение длится 180 мс, затем может идти короткий эффект слияния.
    animationTimeout = setTimeout(() => {
        isAnimating = false;
    }, 370);

    if (gameState.isGameOver) {
        showGameOver(gameState.score);
    }
}

// Отменяем предыдущий ход
function handleUndo() {
    // После окончания игры отмена запрещена
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

// Сохраняем результат игры
function handleSaveScore(name) {
    saveLeader(name, gameState.score);
    showSavedMessage();
}

// Закрываем модальное окно
function handleCloseModal(modalId) {
    if (modalId === "leaderboard-modal") {
        hideLeaderboard();
    }

    if (modalId === "gameover-modal") {
        hideGameOver();
    }
}

// Загружаем предыдущую игру или создаем новую
function initGame() {
    const savedGame = loadGame();

    if (savedGame) {
        gameState = savedGame.state;
        history = savedGame.history;
    } else {
        gameState = createNewGame();
        history = [];
    }

    updateUI();

    if (gameState.isGameOver) {
        showGameOver(gameState.score);
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
