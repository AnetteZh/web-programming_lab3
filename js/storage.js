
const GAME_KEY = "2048-game";
const LEADERS_KEY = "2048-leaders";

export function saveGame(state, history) {
    const data = {
        state,
        history
    };

    localStorage.setItem(GAME_KEY, JSON.stringify(data));
}

export function loadGame() {
    const savedGame = localStorage.getItem(GAME_KEY);

    if (!savedGame) {
        return null;
    }

    try {
        const data = JSON.parse(savedGame);

        if (
            !data.state ||
            !Array.isArray(data.state.board) ||
            data.state.board.length !== 4 ||
            !data.state.board.every(
                row => Array.isArray(row) && row.length === 4
            ) ||
            !Array.isArray(data.history)
        ) {
            return null;
        }

        return data;
    } catch (error) {
        console.error("unable to load game:", error);
        return null;
    }
}

export function loadLeaders() {
    const savedLeaders = localStorage.getItem(LEADERS_KEY);

    if (!savedLeaders) {
        return [];
    }

    try {
        const leaders = JSON.parse(savedLeaders);
        return Array.isArray(leaders) ? leaders : [];
    } catch (error) {
        console.error("unable to load records:", error);
        return [];
    }
}

export function saveLeader(name, score) {
    const leaders = loadLeaders();

    const newLeader = {
        name,
        score,
        date: new Date().toLocaleDateString("ru-RU")
    };

    leaders.push(newLeader);

    leaders.sort((a, b) => b.score - a.score);

    const topLeaders = leaders.slice(0, 10);

    localStorage.setItem(LEADERS_KEY, JSON.stringify(topLeaders));

    return topLeaders;
}
