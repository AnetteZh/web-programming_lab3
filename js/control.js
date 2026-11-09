const DIRECTIONS = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right"
};

export function initControls(callbacks) {
    // Управление стрелками на клавиатуре
    document.addEventListener("keydown", event => {
        const direction = DIRECTIONS[event.key];

        if (!direction) {
            return;
        }

        const leaderboardIsOpen =
            !document.getElementById("leaderboard-modal").hidden;
        const gameOverIsOpen =
            !document.getElementById("gameover-modal").hidden;

        // Не двигаем плитки, пока открыто модальное окно
        if (leaderboardIsOpen || gameOverIsOpen) {
            return;
        }

        event.preventDefault();
        callbacks.onMove(direction);
    });

    // Управление экранными кнопками на мобильных устройствах
    const mobileControls = document.getElementById("mobile-controls");

    mobileControls.addEventListener("click", event => {
        const button = event.target.closest("[data-move]");

        if (button) {
            callbacks.onMove(button.dataset.move);
        }
    });

    // Отмена последнего хода
    document.getElementById("undo-btn").addEventListener("click", () => {
        callbacks.onUndo();
    });

    // Начало новой игры
    document.getElementById("restart-btn").addEventListener("click", () => {
        callbacks.onRestart();
    });

    // Перезапуск из окна окончания игры
    document.getElementById("restart-from-modal").addEventListener("click", () => {
        callbacks.onRestart();
    });

    // Открытие таблицы лидеров
    document.getElementById("leaderboard-btn").addEventListener("click", () => {
        callbacks.onLeaderboard();
    });

    // Закрытие модальных окон
    document.querySelectorAll("[data-close]").forEach(button => {
        button.addEventListener("click", () => {
            callbacks.onCloseModal(button.dataset.close);
        });
    });

    // Сохранение результата после окончания игры
    document.getElementById("save-score-form").addEventListener("submit", event => {
        event.preventDefault();

        const nameInput = document.getElementById("player-name");
        const name = nameInput.value.trim();

        if (!name) {
            nameInput.focus();
            return;
        }

        callbacks.onSaveScore(name);
    });
}
