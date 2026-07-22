class GameOverController {
    static jesusImage = null;

    constructor(config = {}) {
        this.fadeDurationMs = config.fadeDurationMs ?? 1500;
        this.blackHoldDurationMs = config.blackHoldDurationMs ?? 8200;
        this.respawnLength = config.respawnLength ?? 7;

        this.state = 'idle';
        this.alpha = 0;
        this.stateTimerMs = 0;

        this.activeSnake = null;
        this.savedDirection = { x: 1, y: 0 };
        this.savedTargetSpeed = 5;
        this.savedHead = null;
        this.respawnApplied = false;

        this.revelationMaxAlpha = 255;
        this.jesusFadeDurationMs = 2300;
        this.revelationTextStartDelayMs = 800;
        this.revelationLineFadeDurationMs = 1900;
        this.revelationLineStaggerMs = 680;
        this.clickEnableAfterJesusMs = 300;
        this.postTextAutoExitMs = 7000;
        this.textSequenceDone = false;
        this.textDoneTimerMs = 0;
        this.skipRequested = false;
        this.revelationLines = [
            'Wieder hast du eine Schlange zu Fall gebracht.',
            'Wieder hast du das Gleichgewicht der Welt erschuettert.',
            'Deine Suenden sind nicht vergessen...',
            'Doch die Flammen des Schicksals schenken dir ein letztes Geschenk:',
            'Eine zweite Chance.',
            'Nutze sie... oder kehre fuer immer in die Dunkelheit zurueck.'
        ];
    }

    isBlocking() {
        return this.state !== 'idle';
    }

    update(candidateSnake) {
        if (this.state === 'idle') {
            if (this._shouldTrigger(candidateSnake)) {
                this._start(candidateSnake);
            }
            return;
        }

        if (!this.activeSnake) {
            this._reset();
            return;
        }

        this._lockSnakeStill(this.activeSnake);

        if (this.state === 'fadeOut') {
            this.alpha += (255 / this.fadeDurationMs) * deltaTime;
            if (this.alpha >= 255) {
                this.alpha = 255;
                this._applyRespawnAtBlack();
                this.state = 'hold';
                this.stateTimerMs = 0;
            }
            return;
        }

        if (this.state === 'hold') {
            this.stateTimerMs += deltaTime;
            if (!this.textSequenceDone && this._isRevelationFullyVisible()) {
                this.textSequenceDone = true;
                this.textDoneTimerMs = 0;
            }

            if (this.textSequenceDone) {
                this.textDoneTimerMs += deltaTime;
            }

            const autoAfterText = this.textSequenceDone && this.textDoneTimerMs >= this.postTextAutoExitMs;
            if (this.skipRequested || autoAfterText) {
                this.state = 'fadeIn';
                this.stateTimerMs = 0;
            }
            return;
        }

        if (this.state === 'fadeIn') {
            this.alpha -= (255 / this.fadeDurationMs) * deltaTime;
            if (this.alpha <= 0) {
                this.alpha = 0;
                this._finish();
            }
        }
    }

    drawOverlay() {
        if (!this.isBlocking()) return;

        if (this.state === 'hold') {
            this._drawRevelationSequence();
            return;
        }

        push();
        noStroke();
        fill(0, 0, 0, constrain(this.alpha, 0, 255));
        rectMode(CORNER);
        rect(0, 0, width, height);
        pop();
    }

    _drawRevelationSequence() {
        push();
        noStroke();
        rectMode(CORNER);
        fill(0);
        rect(0, 0, width, height);

        const jesusImage = GameOverController.jesusImage;
        const imageAlpha = constrain(
            map(this.stateTimerMs, 0, this.jesusFadeDurationMs, 0, this.revelationMaxAlpha),
            0,
            this.revelationMaxAlpha
        );

        if (jesusImage) {
            const sourceW = max(1, jesusImage.width);
            const sourceH = max(1, jesusImage.height);
            // Fullscreen "cover": Bild fuellt den gesamten Viewport.
            const imageScale = max(width / sourceW, height / sourceH);
            const drawW = sourceW * imageScale;
            const drawH = sourceH * imageScale;
            const drawX = (width - drawW) / 2;
            const drawY = (height - drawH) / 2;

            push();
            imageMode(CORNER);
            tint(255, imageAlpha);
            image(jesusImage, drawX, drawY, drawW, drawH);
            noTint();
            pop();
        }

        const textStartY = height * 0.62;
        const lineHeight = 50;
        const normalTextSize = 24;
        const emphasizedTextSize = 34;
        textAlign(CENTER, TOP);
        textFont(pixeloidFont);

        for (let i = 0; i < this.revelationLines.length; i++) {
            const line = this.revelationLines[i];
            const lineStart = this.revelationTextStartDelayMs + i * this.revelationLineStaggerMs;
            const alpha = constrain(
                map(this.stateTimerMs, lineStart, lineStart + this.revelationLineFadeDurationMs, 0, this.revelationMaxAlpha),
                0,
                this.revelationMaxAlpha
            );

            if (alpha <= 0 || line === '') continue;

            const isSecondChanceLine = line === 'Eine zweite Chance.';
            textSize(isSecondChanceLine ? emphasizedTextSize : normalTextSize);
            fill(255, 255, 255, alpha);
            text(line, width / 2, textStartY + i * lineHeight);
        }

        pop();
    }

    onPointerPressed() {
        if (!this.isBlocking()) return false;

        const clickAllowed = this.state === 'hold'
            && this.stateTimerMs >= this.jesusFadeDurationMs + this.clickEnableAfterJesusMs;
        if (!clickAllowed) {
            // Noch gesperrt: Eingabe konsumieren, aber kein Exit.
            return true;
        }

        // Klick irgendwo: Sequenz verlassen, aber mit normalem Fade-Out.
        if (!this.respawnApplied) {
            this._applyRespawnAtBlack();
        }
        this.skipRequested = true;

        // Blockiert Eingaben an die darunterliegende Szene waehrend GameOver.
        return true;
    }

    _isRevelationFullyVisible() {
        const lastVisibleLineIndex = this._getLastVisibleLineIndex();
        if (lastVisibleLineIndex < 0) return true;

        // "Gespawnt" = letzter Text beginnt sichtbar zu werden.
        const lastLineSpawnAt =
            this.revelationTextStartDelayMs +
            lastVisibleLineIndex * this.revelationLineStaggerMs;

        return this.stateTimerMs >= lastLineSpawnAt;
    }

    _getLastVisibleLineIndex() {
        for (let i = this.revelationLines.length - 1; i >= 0; i--) {
            if (this.revelationLines[i] && this.revelationLines[i].trim() !== '') {
                return i;
            }
        }
        return -1;
    }

    _shouldTrigger(snake) {
        return !!snake && Array.isArray(snake.body) && snake.body.length === 1;
    }

    _start(snake) {
        stopFlappyBirdLoop();
        if (typeof playGameOverSfx === 'function') {
            playGameOverSfx();
        }
        this.activeSnake = snake;

        const dirX = snake.xdir ?? 0;
        const dirY = snake.ydir ?? 0;
        if (dirX === 0 && dirY === 0) {
            this.savedDirection = { x: 1, y: 0 };
        } else {
            this.savedDirection = { x: dirX, y: dirY };
        }

        this.savedTargetSpeed = snake.targetSpeed > 0 ? snake.targetSpeed : 5;
        const head = snake.body[0];
        this.savedHead = head ? { x: head.x, y: head.y } : null;

        this.state = 'fadeOut';
        this.alpha = 0;
        this.stateTimerMs = 0;
        this.respawnApplied = false;
        this.textSequenceDone = false;
        this.textDoneTimerMs = 0;
        this.skipRequested = false;

        this._lockSnakeStill(snake);
    }

    _applyRespawnAtBlack() {
        if (this.respawnApplied || !this.activeSnake || !this.savedHead) return;

        const snake = this.activeSnake;
        const dir = this.savedDirection;
        const backwardX = -dir.x;
        const backwardY = -dir.y;

        const newBody = [];
        for (let i = 0; i < this.respawnLength; i++) {
            const x = (this.savedHead.x + backwardX * i + cols) % cols;
            const y = (this.savedHead.y + backwardY * i + rows) % rows;
            newBody.push(createVector(x, y));
        }

        snake.body = newBody.map((segment) => segment.copy());
        snake.prevBody = newBody.map((segment) => segment.copy());

        snake.growQueue = [];
        snake.tailBlinkCount = 0;
        snake.tailBlinkRemoveTimer = 0;
        snake.isStunned = false;
        snake.bounceIntensity = 0;
        snake.bounceDirection = null;
        snake.collisionType = 0;
        snake.dialog1Timer = 0;
        snake.dialog2Timer = 0;
        snake.collisionDialog1.isVisible = false;
        snake.collisionDialog2.isVisible = false;

        snake.segmentLossTimer = 0;
        snake.moveProgress = 1;

        this.respawnApplied = true;
    }

    _finish() {
        if (!this.activeSnake) {
            this._reset();
            return;
        }

        this.activeSnake.xdir = this.savedDirection.x;
        this.activeSnake.ydir = this.savedDirection.y;
        this.activeSnake.speed = 0;
        this.activeSnake.targetSpeed = this.savedTargetSpeed;
        this.activeSnake.moveProgress = 1;
        this.activeSnake.segmentLossTimer = 0;

        this._reset();
    }

    _reset() {
        this.state = 'idle';
        this.alpha = 0;
        this.stateTimerMs = 0;
        this.activeSnake = null;
        this.savedHead = null;
        this.respawnApplied = false;
        this.textSequenceDone = false;
        this.textDoneTimerMs = 0;
        this.skipRequested = false;
    }

    _lockSnakeStill(snake) {
        snake.xdir = 0;
        snake.ydir = 0;
        snake.speed = 0;
        snake.targetSpeed = 0;
        snake.moveProgress = 1;
    }
}
