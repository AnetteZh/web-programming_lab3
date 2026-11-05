
export function initControls(callbacks) {
    // Управление с клавиатуры
    document.addEventListener("keydown", (event) => {
        const directions = {
            ArrowUp: "up",
            ArrowDown: "down",
            ArrowLeft: "left",
            ArrowRight: "right"
        };

        const direction = directions[event.key];

        if (!direction) {
            return;
        }

        const leaderboardIsOpen =
        !document.getElementById("leaderboard-modal").hidden;

        const gameOverIsOpen =
            !document.getElementById("gameover-modal").hidden;

        if (leaderboardIsOpen || gameOverIsOpen) {
            return;
        }

        event.preventDefault();
        callbacks.onMove(direction);
    });

    // Управление мобильными кнопками
    const mobileControls = document.getElementById("mobile-controls");

    mobileControls.addEventListener("click", (event) => {
        const button = event.target.closest("[data-move]");

        if (!button) {
            return;
        }

        callbacks.onMove(button.dataset.move);
    });

    // Кнопка отмены хода
    document.getElementById("undo-btn").addEventListener("click", () => {
        callbacks.onUndo();
    });

    // Кнопка начала новой игры
    document.getElementById("restart-btn").addEventListener("click", () => {
        callbacks.onRestart();
    });

    // Рестарт из окна окончания игры
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

    // Сохранение результата
    document.getElementById("save-score-form").addEventListener("submit", (event) => {
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
