const GAME_KEY = "2048-game";
const LEADERS_KEY = "2048-leaders";
const BOARD_SIZE = 4;

// Проверяем, что в сохранении находится корректное состояние игры
function isValidState(state) {
    if (!state || !Array.isArray(state.board) || state.board.length !== BOARD_SIZE) {
        return false;
    }

    const hasValidBoard = state.board.every(row =>
        Array.isArray(row) &&
        row.length === BOARD_SIZE &&
        row.every(value =>
            Number.isInteger(value) &&
            value >= 0 &&
            (value === 0 || (value >= 2 && Number.isInteger(Math.log2(value))))
        )
    );

    return hasValidBoard &&
        Number.isInteger(state.score) &&
        state.score >= 0 &&
        typeof state.isGameOver === "boolean" &&
        (state.scoreSaved === undefined || typeof state.scoreSaved === "boolean");
}

// Сохраняем поле и историю ходов в localStorage
export function saveGame(state, history) {
    const data = {
        state,
        history
    };

    try {
        localStorage.setItem(GAME_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Unable to save the game:", error);
    }
}

// Загружаем сохранённую игру и проверяем её данные
export function loadGame() {
    try {
        const savedGame = localStorage.getItem(GAME_KEY);

        if (!savedGame) {
            return null;
        }

        const data = JSON.parse(savedGame);

        if (
            !isValidState(data.state) ||
            !Array.isArray(data.history) ||
            !data.history.every(isValidState)
        ) {
            return null;
        }

        // В старых сохранениях этого свойства ещё не было
        data.state.scoreSaved = data.state.scoreSaved ?? false;

        return data;
    } catch (error) {
        console.error("Unable to load the game:", error);
        return null;
    }
}

// Загружаем таблицу лидеров
export function loadLeaders() {
    try {
        const savedLeaders = localStorage.getItem(LEADERS_KEY);

        if (!savedLeaders) {
            return [];
        }

        const leaders = JSON.parse(savedLeaders);

        if (!Array.isArray(leaders)) {
            return [];
        }

        return leaders
            .filter(leader =>
                leader &&
                typeof leader.name === "string" &&
                Number.isInteger(leader.score) &&
                leader.score >= 0 &&
                typeof leader.date === "string"
            )
            .sort((first, second) => second.score - first.score)
            .slice(0, 10);
    } catch (error) {
        console.error("Unable to load the records:", error);
        return [];
    }
}

// Добавляем рекорд, сортируем результаты и оставляем только первые десять
export function saveLeader(name, score) {
    const leaders = loadLeaders();

    const newLeader = {
        name: name.trim(),
        score,
        date: new Date().toLocaleDateString("ru-RU")
    };

    leaders.push(newLeader);
    leaders.sort((first, second) => second.score - first.score);

    const topLeaders = leaders.slice(0, 10);

    try {
        localStorage.setItem(LEADERS_KEY, JSON.stringify(topLeaders));
    } catch (error) {
        console.error("Unable to save the record:", error);
        return null;
    }

    return topLeaders;
}
