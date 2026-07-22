class SceneManager {
    constructor() {
        this.scenes = {};
        this.current = null;
        this.currentName = '';
        this.snake = null; // geteilte Snake-Instanz für alle Szenen
        this.introSnakeState = null; // letzter bekannter Snake-Zustand nach Intro
        this.gameOverController = new GameOverController({
            fadeDurationMs: 850,
            blackHoldDurationMs: 8200,
            respawnLength: 7
        });
    }

    register(name, scene) {
        scene.manager = this; // Rückreferenz damit Szenen selbst wechseln können
        this.scenes[name] = scene;
    }

    switchTo(name) {
        const nextScene = this.scenes[name];
        if (!nextScene) {
            console.error(`Scene "${name}" is not registered.`);
            return;
        }

        this.current?.exit();
        this.currentName = name;
        this.current = nextScene;
        this.current.enter();
    }

    _callCurrent(methodName, ...args) {
        try {
            this.current?.[methodName]?.(...args);
        } catch (e) {
            console.error(`Error in ${methodName}():`, e);
        }
    }

    update() {
        if (this.gameOverController.isBlocking()) {
            this.gameOverController.update(this._getActiveSnakeForGameOver());
            return;
        }

        this._callCurrent('update');
        this.gameOverController.update(this._getActiveSnakeForGameOver());
    }

    draw() {
        this._callCurrent('draw');
        this.gameOverController.drawOverlay();
    }

    keyPressed(k, kc) {
        this._callCurrent('keyPressed', k, kc);
    }

    mousePressed(mx, my, button) {
        if (this.gameOverController.onPointerPressed()) {
            return;
        }
        this._callCurrent('mousePressed', mx, my, button);
    }

    mouseReleased(mx, my) {
        this._callCurrent('mouseReleased', mx, my);
    }

    _getActiveSnakeForGameOver() {
        if (this.current && this.current.outroSnake) {
            return this.current.outroSnake;
        }
        return this.snake;
    }
}
