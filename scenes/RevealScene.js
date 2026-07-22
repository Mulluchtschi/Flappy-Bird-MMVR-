class RevealScene extends BaseScene {
    constructor() {
        super();
        this.hiddenRects = [];
        this.typedText = '';
        this.revealSuccess = false;
        this.revealText = 'aZaD1';
        this.revealText2 = 'opfer';
        this.keyboardRows = [
            '1234567890',
            'qwertzuiop',
            'asdfghjkl',
            'yxcvbnm'
        ];
        this.keyboardHitboxes = [];
        this.keyboardShift = false;
        this.verifyButtonRect = null;
        this.revealMode = 'type';
        this.verifyMessage = '';
        this.verifyMessageTimer = 0;
        this.collectWord = 'opfer';
        this.collectProgress = 0;
        this.letterTiles = [];
        this.letterCollisionCooldown = 0;
        this.uiCollisionArmed = true;
        // Konfigurierbare Food-Spawn-Koordinaten (Grid-Zellen)
        this.foodSpawnPoints = [
            { x: 3, y: 6 },
            { x: 8, y: 9 },
            { x: 12, y: 12 },
            { x: 6, y: 20 }
        ];
        this.foodSpawnIntervalMs = 5000;
        this.foodSpawnTimer = 0;
        this.nextFoodSpawnIndex = 0;
        this.activeTimedFood = null;
        this.backgroundOpenFlashCooldownMs = 5000;
        this.backgroundOpenFlashDurationMs = 500;
        this.backgroundOpenFlashRemainingMs = 0;
    }

    init() {
        this.hiddenRects = [];
        this.typedText = '';
        this.revealSuccess = false;
        this.keyboardHitboxes = [];
        this.keyboardShift = false;
        this.revealMode = 'type';
        this.verifyMessage = '';
        this.verifyMessageTimer = 0;
        this.collectProgress = 0;
        this.letterTiles = [];
        this.letterCollisionCooldown = 0;
        this.uiCollisionArmed = true;
        this.foodSpawnTimer = 0;
        this.nextFoodSpawnIndex = 0;
        this.activeTimedFood = null;
        this.backgroundOpenFlashRemainingMs = 0;
        this.backgroundOpenFlashCooldownMs = 5000;

        let revealWidthCells = 16;
        let revealHeightCells = 9;
        let revealStartX = floor((cols - revealWidthCells) / 2);
        let revealStartY = 3;
        let totalRects = 70;
        let used = {};

        while (this.hiddenRects.length < totalRects) {
            let x = revealStartX + floor(random(revealWidthCells));
            let y = revealStartY + floor(random(revealHeightCells));
            let key = x + ',' + y;
            if (!used[key]) {
                used[key] = true;
                this.hiddenRects.push({
                    x,
                    y,
                    active: true,
                    rotationSteps: floor(random(4))
                });
            }
        }
    }

    enter() {
        this._ensureSnakeExists();

        // Fuer Direkt-Wechsel (z.B. Debug) Szene initialisieren.
        if (this.hiddenRects.length === 0) {
            this.init();
        }

        const snake = this.manager.snake;
        if (snake) {
            snake.isTalking = false;
            snake.headShakeIntensity = 0;
            snake.moveProgress = 1;
            snake.targetSpeed = 5;
            snake.speed = snake.targetSpeed;

            // Spawn-Gnade: startet die Schlange in einem UI-Objekt,
            // wird UI-Kollision erst aktiv, nachdem sie es einmal verlassen hat.
            this.uiCollisionArmed = !this._isSnakeHeadInsideUiObstacle(snake);
        }

        if (!this.activeTimedFood) {
            this._spawnNextTimedFood();
        }
    }

    _ensureSnakeExists() {
        if (this.manager.snake) return;

        const state = this.manager.introSnakeState;

        if (state && state.body && state.body.length > 0) {
            const head = state.body[0];
            const snake = new Snake(
                max(1, state.body.length),
                head.x,
                head.y,
                state.xdir ?? 1,
                state.ydir ?? 0,
                state.targetSpeed ?? 5,
                state.acceleration ?? 0.05
            );

            snake.body = state.body.map((segment) => createVector(segment.x, segment.y));
            snake.prevBody = (state.prevBody && state.prevBody.length === state.body.length
                ? state.prevBody
                : state.body
            ).map((segment) => createVector(segment.x, segment.y));

            snake.xdir = state.xdir ?? snake.xdir;
            snake.ydir = state.ydir ?? snake.ydir;
            snake.targetSpeed = state.targetSpeed ?? snake.targetSpeed;
            snake.moveProgress = state.moveProgress ?? 1;
            this.manager.snake = snake;
            return;
        }

        // Debug-Fallback: Erzeuge eine spielbare Schlange in der Mitte.
        const fallbackLength = 10;
        const fallbackHeadX = floor(cols / 2);
        const fallbackHeadY = floor(rows / 2);
        this.manager.snake = new Snake(
            fallbackLength,
            fallbackHeadX,
            fallbackHeadY,
            1,
            0,
            5,
            0.05
        );
    }

    update() {
        let snake = this.manager.snake;
        if (!snake) return;

        this.verifyMessageTimer = max(0, this.verifyMessageTimer - deltaTime);
        if (this.verifyMessageTimer <= 0 && this.revealMode === 'type') {
            this.verifyMessage = '';
        }

        this.letterCollisionCooldown = max(0, this.letterCollisionCooldown - deltaTime);

        if (this.backgroundOpenFlashRemainingMs > 0) {
            this.backgroundOpenFlashRemainingMs = max(0, this.backgroundOpenFlashRemainingMs - deltaTime);
        } else {
            this.backgroundOpenFlashCooldownMs -= deltaTime;
            if (this.backgroundOpenFlashCooldownMs <= 0) {
                this.backgroundOpenFlashRemainingMs = this.backgroundOpenFlashDurationMs;
                this.backgroundOpenFlashCooldownMs = 5000;
            }
        }

        if (!this.uiCollisionArmed) {
            if (!this._isSnakeHeadInsideUiObstacle(snake)) {
                this.uiCollisionArmed = true;
            }
        }

        if (this.uiCollisionArmed && this._isSnakeHeadingIntoUiObstacle(snake)) {
            snake.triggerFrontalCollision();
        }

        snake.update();
        this._updateTimedFoodSpawner();
        this._handleTimedFoodCollision(snake);

        // Reveal-Bloecke in allen Modi weiter abtragen.
        let head = snake.body[0];
        this.hiddenRects.forEach((r) => {
            if (r.active && r.x === head.x && r.y === head.y) {
                r.active = false;
            }
        });

        if (this.revealMode === 'collect' || this.revealMode === 'collect_done') {
            this._updateLetterCollection();
            return;
        }
    }

    draw() {
        const isSecondMode = this.revealMode === 'collect' || this.revealMode === 'collect_done';
        const openBackground = isSecondMode
            ? (RevealScene.backgroundImageP2 ?? RevealScene.backgroundImage)
            : RevealScene.backgroundImage;
        const closedBackground = isSecondMode
            ? (RevealScene.backgroundImageClosedP2 ?? RevealScene.backgroundImageClosed ?? openBackground)
            : (RevealScene.backgroundImageClosed ?? openBackground);
        const showOpenBackground = this.backgroundOpenFlashRemainingMs > 0;
        const drawBackground = showOpenBackground
            ? (openBackground ?? closedBackground)
            : closedBackground;

        if (drawBackground) {
            imageMode(CORNER);
            image(drawBackground, 0, 0, width, height);
        } else {
            background(30);
        }

        // Versteckte Rechtecke
        const stoneImage = RevealScene.stoneImage;
        this.hiddenRects.forEach((r) => {
            if (!r.active) return;
            const drawX = r.x * scaleSize;
            const drawY = r.y * scaleSize;

            if (stoneImage) {
                push();
                translate(drawX + scaleSize / 2, drawY + scaleSize / 2);
                rotate((r.rotationSteps ?? 0) * HALF_PI);
                imageMode(CENTER);
                image(stoneImage, 0, 0, scaleSize, scaleSize);
                pop();
            } else {
                fill(120);
                rect(drawX, drawY, scaleSize, scaleSize, 8);
            }
        });

        // Eingabefeld: 10 Felder breit, 2 Felder hoch, X mittig, Start in Zeile 16
        const inputRect = this._getInputRect();
        let inputH = inputRect.h;
        let inputY = inputRect.y;

        const isTypeMode = this.revealMode === 'type';
        const promptText = isTypeMode ? 'Type the word above' : 'Eat the word above';
        textSize(28);
        fill(0);
        text(promptText, width / 2, 14 * scaleSize + scaleSize / 2 - 8);

        // Eingegebenen/gesammelten Text ohne Eingabebox anzeigen.
        push();
        textAlign(CENTER, CENTER);
        textSize(40);
        fill(0);
        text(this.typedText, width / 2, inputY + inputH / 2);
        pop();

        if (isTypeMode) {
            this._drawVerifyButton();
            this._drawVirtualKeyboard(false);
        }

        if (this.revealMode === 'collect' || this.revealMode === 'collect_done') {
            this._drawLetterTiles();
        }

        // Food vor dem Keyboard-Overlay anzeigen.
        if (this.activeTimedFood) {
            this.activeTimedFood.show();
        }

        if (isTypeMode) {
            this._drawVerifyFeedback(inputY, inputH);
        }

        if (this.revealMode === 'collect_done') {
            fill(0, 200, 100);
            textSize(36);
            textAlign(CENTER, TOP);
            text('Great! You built BIRD.', width / 2, inputY + inputH + 40);
            textSize(22);
            text('Press Enter to continue...', width / 2, inputY + inputH + 90);
        } else if (this.revealSuccess && this.revealMode === 'type') {
            fill(0, 200, 100);
            textSize(30);
            textAlign(CENTER, TOP);
            text('Verified! Collect BIRD below.', width / 2, inputY + inputH + 40);
        }

        // Snake zuletzt zeichnen, damit sie vor Text/UI liegt.
        if (this.manager.snake) {
            this.manager.snake.show();
            this.manager.snake.updateAndShowDialogs();
        }
    }

    keyPressed(k, kc) {
        let snake = this.manager.snake;

        // Snake-Steuerung
        if (kc === UP_ARROW) { this._setDirectionWithUiCollision(snake, 0, -1); return; }
        if (kc === DOWN_ARROW) { this._setDirectionWithUiCollision(snake, 0, 1); return; }
        if (kc === LEFT_ARROW) { this._setDirectionWithUiCollision(snake, -1, 0); return; }
        if (kc === RIGHT_ARROW) { this._setDirectionWithUiCollision(snake, 1, 0); return; }

        // Enter → weiter zu Grid wenn Erfolg
        if (kc === ENTER) {
            if (this.revealMode === 'type') {
                this._validateRevealInput();
                return;
            }

            if (this.revealMode === 'collect_done') {
                this._goToGridScene();
            }
            return;
        }

        // Texteingabe
        if (this.revealMode !== 'type') {
            return;
        }

        if (kc === BACKSPACE) {
            this.typedText = this.typedText.slice(0, -1);
            this._syncRevealSuccess();
            return;
        }
        if (k.length === 1 && this.typedText.length < this.revealText.length) {
            this._appendTypedChar(k);
        }
    }

    mousePressed(mx, my, button) {
        if (this.revealMode === 'type' && this._handleVerifyButtonClick(mx, my, button)) {
            return;
        }

        if (this.revealMode === 'type' && this._handleKeyboardClick(mx, my, button)) {
            return;
        }

        let snake = this.manager.snake;
        if (!snake) return;

        const pressedButton = button ?? mouseButton;

        if (pressedButton === LEFT) this._turnSnakeWithUiCollision(snake, 'left');
        else if (pressedButton === RIGHT) this._turnSnakeWithUiCollision(snake, 'right');
    }

    _setDirectionWithUiCollision(snake, xdir, ydir) {
        if (!snake) return;

        if (
            (this.uiCollisionArmed && this._wouldDirectionHitUiObstacle(snake, xdir, ydir)) ||
            this._wouldDirectionHitWrongLetterObstacle(snake, xdir, ydir)
        ) {
            snake.triggerParallelCollision();
            return;
        }

        snake.setDirection(xdir, ydir);
    }

    _turnSnakeWithUiCollision(snake, turnDirection) {
        if (!snake) return;

        const nextDirection = this._getTurnDirection(snake, turnDirection);
        if (!nextDirection) return;

        if (
            (this.uiCollisionArmed && this._wouldDirectionHitUiObstacle(snake, nextDirection.x, nextDirection.y)) ||
            this._wouldDirectionHitWrongLetterObstacle(snake, nextDirection.x, nextDirection.y)
        ) {
            snake.triggerParallelCollision();
            return;
        }

        if (turnDirection === 'left') snake.turnLeft();
        else snake.turnRight();
    }

    _getTurnDirection(snake, turnDirection) {
        if (!snake) return null;

        if (turnDirection === 'left') {
            if (snake.xdir === 1 && snake.ydir === 0) return { x: 0, y: -1 };
            if (snake.xdir === 0 && snake.ydir === -1) return { x: -1, y: 0 };
            if (snake.xdir === -1 && snake.ydir === 0) return { x: 0, y: 1 };
            if (snake.xdir === 0 && snake.ydir === 1) return { x: 1, y: 0 };
        } else {
            if (snake.xdir === 1 && snake.ydir === 0) return { x: 0, y: 1 };
            if (snake.xdir === 0 && snake.ydir === 1) return { x: -1, y: 0 };
            if (snake.xdir === -1 && snake.ydir === 0) return { x: 0, y: -1 };
            if (snake.xdir === 0 && snake.ydir === -1) return { x: 1, y: 0 };
        }

        return null;
    }

    _appendTypedChar(char) {
        if (this.revealMode !== 'type') return;
        if (this.typedText.length >= this.revealText.length) return;
        this.typedText += char;
        this.revealSuccess = false;
    }

    _updateTimedFoodSpawner() {
        if (!this.foodSpawnPoints || this.foodSpawnPoints.length === 0) return;

        this.foodSpawnTimer -= deltaTime;
        if (this.foodSpawnTimer <= 0) {
            this._spawnNextTimedFood();
        }
    }

    _spawnNextTimedFood() {
        if (!this.foodSpawnPoints || this.foodSpawnPoints.length === 0) return;

        const spawn = this.foodSpawnPoints[this.nextFoodSpawnIndex];
        if (!spawn) return;

        if (!this.activeTimedFood) {
            this.activeTimedFood = new Food(spawn.x, spawn.y);
        } else {
            this.activeTimedFood.reset(spawn.x, spawn.y);
        }

        this.nextFoodSpawnIndex = (this.nextFoodSpawnIndex + 1) % this.foodSpawnPoints.length;
        this.foodSpawnTimer = this.foodSpawnIntervalMs;
    }

    _handleTimedFoodCollision(snake) {
        if (!snake || !snake.body || snake.body.length === 0 || !this.activeTimedFood) return;

        if (this.activeTimedFood.checkCollision(snake.body[0])) {
            snake.grow(1);
            snake.eatFood();
        }
    }

    _isSnakeHeadingIntoUiObstacle(snake) {
        if (!snake || snake.isStunned || snake.moveProgress < 1 || snake.speed <= 0) {
            return false;
        }

        return this._wouldDirectionHitUiObstacle(snake, snake.xdir, snake.ydir);
    }

    _wouldDirectionHitUiObstacle(snake, xdir, ydir) {
        if (!snake || !snake.body || snake.body.length === 0) return false;

        let nextHeadX = snake.body[0].x + xdir;
        let nextHeadY = snake.body[0].y + ydir;

        if (nextHeadX < 0) nextHeadX = cols - 1;
        if (nextHeadX >= cols) nextHeadX = 0;
        if (nextHeadY < 0) nextHeadY = rows - 1;
        if (nextHeadY >= rows) nextHeadY = 0;

        const headRect = {
            left: nextHeadX * scaleSize,
            right: nextHeadX * scaleSize + scaleSize,
            top: nextHeadY * scaleSize,
            bottom: nextHeadY * scaleSize + scaleSize
        };

        const uiRects = this._getUiCollisionRects();
        return uiRects.some((rect) => (
            headRect.right > rect.left &&
            headRect.left < rect.right &&
            headRect.bottom > rect.top &&
            headRect.top < rect.bottom
        ));
    }

    _isSnakeHeadInsideUiObstacle(snake) {
        if (!snake || !snake.body || snake.body.length === 0) return false;

        const head = snake.body[0];
        const headRect = {
            left: head.x * scaleSize,
            right: head.x * scaleSize + scaleSize,
            top: head.y * scaleSize,
            bottom: head.y * scaleSize + scaleSize
        };

        const uiRects = this._getUiCollisionRects();
        return uiRects.some((rect) => (
            headRect.right > rect.left &&
            headRect.left < rect.right &&
            headRect.bottom > rect.top &&
            headRect.top < rect.bottom
        ));
    }

    _wouldDirectionHitWrongLetterObstacle(snake, xdir, ydir) {
        if (this.revealMode !== 'collect') return false;
        if (!snake || !snake.body || snake.body.length === 0) return false;

        let nextHeadX = snake.body[0].x + xdir;
        let nextHeadY = snake.body[0].y + ydir;

        if (nextHeadX < 0) nextHeadX = cols - 1;
        if (nextHeadX >= cols) nextHeadX = 0;
        if (nextHeadY < 0) nextHeadY = rows - 1;
        if (nextHeadY >= rows) nextHeadY = 0;

        const expectedChar = this.collectWord[this.collectProgress];
        const hitWrongTile = this.letterTiles.some((tile) => (
            tile.active &&
            tile.x === nextHeadX &&
            tile.y === nextHeadY &&
            tile.char !== expectedChar
        ));

        return hitWrongTile;
    }

    _getInputRect() {
        const w = 10 * scaleSize;
        const h = 2 * scaleSize;
        const x = floor((width - w) / 2);
        const y = 15 * scaleSize;

        return { x, y, w, h };
    }

    _getVerifyButtonRect() {
        const w = 6 * scaleSize;
        const h = 1 * scaleSize;
        const x = floor((width - w) / 2);
        const y = 18 * scaleSize;

        return { x, y, w, h };
    }

    _getUiCollisionRects() {
        const keyboardBounds = this._getKeyboardInteractionBounds();
        const input = this._getInputRect();
        const rects = [
            {
                left: input.x,
                top: input.y,
                right: input.x + input.w,
                bottom: input.y + input.h
            }
        ];

        if (this.revealMode === 'type') {
            const verify = this._getVerifyButtonRect();
            rects.push(
                {
                    left: keyboardBounds.x,
                    top: keyboardBounds.y,
                    right: keyboardBounds.x + keyboardBounds.w,
                    bottom: keyboardBounds.y + keyboardBounds.h
                },
                {
                    left: verify.x,
                    top: verify.y,
                    right: verify.x + verify.w,
                    bottom: verify.y + verify.h
                }
            );
        }

        return rects;
    }

    _goToGridScene() {
        const snake = this.manager.snake;
        if (snake) {
            snake.grow(10);
            snake.moveProgress = 1;
        }

        if (typeof playWinSfx === 'function') {
            playWinSfx();
        }
        this.manager.scenes['grid'].init();
        this.manager.switchTo('grid');
    }

    _syncRevealSuccess() {
        this.revealSuccess = this.typedText.toLowerCase() === this.revealText.toLowerCase();
    }

    _validateRevealInput() {
        this._syncRevealSuccess();

        if (this.revealSuccess) {
            if (typeof playWinSfx === 'function') {
                playWinSfx();
            }
            this.verifyMessage = '';
            this._startCollectMode();
            return;
        }

        this.verifyMessage = 'Try again';
        this.verifyMessageTimer = 1400;
    }

    _startCollectMode() {
        this.revealMode = 'collect';
        this.revealSuccess = false;
        this.collectProgress = 0;
        this.typedText = '';
        this.keyboardShift = false;
        this.backgroundOpenFlashRemainingMs = 0;
        this.backgroundOpenFlashCooldownMs = 5000;
        this._spawnLetterTiles();
    }

    _spawnLetterTiles() {
        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        const minRow = max(0, rows - 18);
        const snakeCells = new Set();
        const snake = this.manager.snake;

        if (snake && snake.body) {
            snake.body.forEach((segment) => {
                snakeCells.add(`${round(segment.x)},${round(segment.y)}`);
            });
        }

        const candidates = [];
        for (let y = minRow; y < rows; y++) {
            for (let x = 1; x < cols - 1; x++) {
                if (!snakeCells.has(`${x},${y}`) && !this._isCellBlockedByInputArea(x, y)) {
                    candidates.push({ x, y });
                }
            }
        }

        // Fisher-Yates Shuffle fuer zufaellige, aber gleichverteilte Reihenfolge.
        for (let i = candidates.length - 1; i > 0; i--) {
            const j = floor(random(i + 1));
            const tmp = candidates[i];
            candidates[i] = candidates[j];
            candidates[j] = tmp;
        }

        const placed = [];
        let letterIndex = 0;

        for (let i = 0; i < candidates.length && letterIndex < letters.length; i++) {
            const candidate = candidates[i];
            if (this._touchesExistingLetterTile(candidate.x, candidate.y, placed)) {
                continue;
            }

            placed.push({ char: letters[letterIndex], x: candidate.x, y: candidate.y, active: true });
            letterIndex++;
        }

        this.letterTiles = placed;
    }

    _isCellBlockedByInputArea(cellX, cellY) {
        const input = this._getInputRect();
        const inputLeftCell = floor(input.x / scaleSize);
        const inputTopCell = floor(input.y / scaleSize);
        const inputWidthCells = floor(input.w / scaleSize);
        const inputHeightCells = floor(input.h / scaleSize);

        // 1 Zelle Sicherheitsabstand um das Eingabefeld.
        const blockedLeft = inputLeftCell - 1;
        const blockedRight = inputLeftCell + inputWidthCells;
        const blockedTop = inputTopCell - 1;
        const blockedBottom = inputTopCell + inputHeightCells;

        return (
            cellX >= blockedLeft &&
            cellX <= blockedRight &&
            cellY >= blockedTop &&
            cellY <= blockedBottom
        );
    }

    _touchesExistingLetterTile(x, y, placedTiles) {
        for (let i = 0; i < placedTiles.length; i++) {
            const tile = placedTiles[i];
            if (abs(tile.x - x) <= 1 && abs(tile.y - y) <= 1) {
                return true;
            }
        }

        return false;
    }

    _updateLetterCollection() {
        if (this.revealMode !== 'collect') return;

        const snake = this.manager.snake;
        if (!snake || !snake.body || snake.body.length === 0) return;
        if (this.letterCollisionCooldown > 0) return;

        const head = snake.body[0];
        const headX = round(head.x);
        const headY = round(head.y);
        const hit = this.letterTiles.find((tile) => tile.active && tile.x === headX && tile.y === headY);
        if (!hit) return;

        const expectedChar = this.collectWord[this.collectProgress];
        if (hit.char === expectedChar) {
            hit.active = false;
            this.collectProgress++;
            this.typedText = this.collectWord.slice(0, this.collectProgress);
            snake.eatFood();

            if (this.collectProgress >= this.collectWord.length) {
                this.revealSuccess = true;
                this.verifyMessage = '';
                this._goToGridScene();
                return;
            }
        } else {
            snake.triggerFrontalCollision();
        }

        this.letterCollisionCooldown = 240;
    }

    _drawLetterTiles() {
        push();
        textAlign(CENTER, CENTER);
        textSize(scaleSize * 0.72);
        const overlayImage = RevealScene.keyboardButtonImage;

        const expectedChar = this.collectWord[this.collectProgress] ?? null;

        this.letterTiles.forEach((tile) => {
            if (!tile.active) return;

            const x = tile.x * scaleSize;
            const y = tile.y * scaleSize;
            const isExpected = tile.char === expectedChar;

            noStroke();
            fill(isExpected ? color(90, 200, 120) : color(205, 110, 110));
            rect(x + 2, y + 2, scaleSize - 4, scaleSize - 4, 6);
            fill(20);
            text(tile.char.toUpperCase(), x + scaleSize / 2, y + scaleSize / 2 + 1);

            if (overlayImage) {
                imageMode(CORNER);
                image(overlayImage, x, y, scaleSize, scaleSize);
            }
        });

        pop();
    }

    _drawCollectProgress() {
        const built = this.collectWord.slice(0, this.collectProgress).toUpperCase();
        const missing = this.collectWord.slice(this.collectProgress).toUpperCase();
        const keyboardTop = this._getKeyboardTop();

        push();
        fill(255);
        textAlign(CENTER, TOP);
        textSize(30);
        text('Collect letters in order:', width / 2, keyboardTop - 84);

        textSize(38);
        fill(110, 220, 130);
        text(built, width / 2 - textWidth(missing) / 2, keyboardTop - 44);
        fill(255);
        text(missing, width / 2 + textWidth(built) / 2, keyboardTop - 44);
        pop();
    }

    _getKeyboardTop() {
        // Obere Kante der Tastatur: 11. Zeile von unten.
        return max(0, (rows - 11) * scaleSize);
    }

    _getKeyboardBounds() {
        // Nur fuer das visuelle PNG-Overlay.
        const sidePadding = scaleSize * 0.5;
        const bottomPadding = scaleSize * 0.5;
        const top = this._getKeyboardTop();
        const x = sidePadding;
        const w = max(0, width - sidePadding * 2);
        const overlay = RevealScene.keyboardOverlayImage;

        let h;
        if (overlay && overlay.width > 0 && overlay.height > 0) {
            h = w * (overlay.height / overlay.width);
        } else {
            h = max(0, height - top - bottomPadding);
        }

        let y = height - bottomPadding - h;
        if (y < top) {
            y = top;
            h = max(0, height - bottomPadding - y);
        }

        return { x, y, w, h };
    }

    _getKeyboardInteractionBounds() {
        // Funktionales Keyboard: 1 Zelle Abstand links/rechts/unten.
        const sidePadding = scaleSize;
        const bottomPadding = scaleSize;
        const top = this._getKeyboardTop();
        const topInsetPx = 10;
        const x = sidePadding;
        const y = top + topInsetPx;
        const w = max(0, width - sidePadding * 2);
        const h = max(0, height - y - bottomPadding);

        return { x, y, w, h };
    }

    _drawVerifyFeedback(inputY, inputH) {
        if (!this.verifyMessage) return;

        push();
        textAlign(CENTER, TOP);
        textSize(28);
        fill(255, 120, 120);
        text(this.verifyMessage, width / 2, (rows - 13) * scaleSize + scaleSize / 2);
        pop();
    }

    _drawVerifyButton() {
        const buttonRect = this._getVerifyButtonRect();
        const buttonW = buttonRect.w;
        const buttonH = buttonRect.h;
        const buttonX = buttonRect.x;
        const buttonY = buttonRect.y;
        const disabled = this.revealMode !== 'type';
        const hovered = !disabled && mouseX >= buttonX && mouseX <= buttonX + buttonW && mouseY >= buttonY && mouseY <= buttonY + buttonH;

        // Hover-Effekt: Button wird leicht groesser.
        const scaleFactor = hovered ? 1.08 : 1;
        const drawW = buttonW * scaleFactor;
        const drawH = buttonH * scaleFactor;
        const drawX = buttonX + (buttonW - drawW) / 2;
        const drawY = buttonY + (buttonH - drawH) / 2;

        this.verifyButtonRect = {
            x: drawX,
            y: drawY,
            w: drawW,
            h: drawH
        };

        if (RevealScene.verifyButtonImage) {
            push();
            imageMode(CORNER);
            if (disabled) {
                tint(175, 175, 175, 230);
            } else {
                noTint();
            }
            image(RevealScene.verifyButtonImage, drawX, drawY, drawW, drawH);
            noTint();
            pop();
            return;
        }

        noStroke();
        fill(disabled ? color(115) : (hovered ? color(80, 170, 245) : color(62, 150, 230)));
        rect(drawX, drawY, drawW, drawH, 10);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(28);
        text('Verify', drawX + drawW / 2, drawY + drawH / 2 - 6);
    }

    _handleVerifyButtonClick(mx, my, button) {
        const pressedButton = button ?? mouseButton;
        if (pressedButton !== LEFT || !this.verifyButtonRect) return false;

        const r = this.verifyButtonRect;
        const hit = mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h;
        if (!hit) return false;

        if (typeof playButtonClickSfx === 'function') {
            playButtonClickSfx();
        }

        this._validateRevealInput();
        return true;
    }

    _getKeyboardLayout() {
        const keyboardBounds = this._getKeyboardInteractionBounds();
        const keyboardTop = keyboardBounds.y;
        const keyboardHeight = keyboardBounds.h;
        const rowGap = 12;
        const horizontalPadding = 0;
        const keyGap = 10;
        const keyRows = this._getKeyboardRowsForRender();
        const totalRowGaps = rowGap * (keyRows.length - 1);
        const rowHeight = floor((keyboardHeight - totalRowGaps - 24) / keyRows.length);
        const layout = [];

        let currentY = keyboardTop + 12;
        for (let rowIndex = 0; rowIndex < keyRows.length; rowIndex++) {
            const row = keyRows[rowIndex];
            const keyCount = row.length;
            const availableWidth = keyboardBounds.w - horizontalPadding * 2;
            const totalKeyGaps = keyGap * (keyCount - 1);
            const totalUnits = row.reduce((sum, key) => sum + key.units, 0);
            const unitWidth = floor((availableWidth - totalKeyGaps) / totalUnits);
            const rowWidth = totalUnits * unitWidth + totalKeyGaps;
            const startX = floor(keyboardBounds.x + (keyboardBounds.w - rowWidth) / 2);

            let cursorX = startX;
            for (let i = 0; i < keyCount; i++) {
                const key = row[i];
                const keyWidth = key.units * unitWidth;
                layout.push({
                    label: key.label,
                    action: key.action,
                    kind: key.kind,
                    toggled: key.action === 'shift' ? this.keyboardShift : false,
                    x: cursorX,
                    y: currentY,
                    w: keyWidth,
                    h: rowHeight
                });

                cursorX += keyWidth + keyGap;
            }

            currentY += rowHeight + rowGap;
        }

        return layout;
    }

    _getKeyboardRowsForRender() {
        const row2 = (this.keyboardShift ? this.keyboardRows[1].toUpperCase() : this.keyboardRows[1]).split('');
        const row3 = (this.keyboardShift ? this.keyboardRows[2].toUpperCase() : this.keyboardRows[2]).split('');
        const row4Letters = (this.keyboardShift ? this.keyboardRows[3].toUpperCase() : this.keyboardRows[3]).split('');

        return [
            this.keyboardRows[0].split('').map((char) => ({ label: char, action: 'char', units: 1, kind: 'normal' })),
            row2.map((char) => ({ label: char, action: 'char', units: 1, kind: 'normal' })),
            row3.map((char) => ({ label: char, action: 'char', units: 1, kind: 'normal' })),
            [
                { label: 'Shift', action: 'shift', units: 1.8, kind: 'special' },
                ...row4Letters.map((char) => ({ label: char, action: 'char', units: 1, kind: 'normal' })),
                { label: 'Back', action: 'backspace', units: 1.8, kind: 'special' }
            ],
            [
                { label: 'Space', action: 'space', units: 6, kind: 'special' },
                { label: 'Enter', action: 'enter', units: 2.2, kind: 'special' }
            ]
        ];
    }

    _drawVirtualKeyboard(disabled = false) {
        this.keyboardHitboxes = this._getKeyboardLayout();
        const keyboardBounds = this._getKeyboardBounds();

        push();
        noStroke();

        if (!RevealScene.keyboardOverlayImage) {
            fill(disabled ? color(30, 30, 30, 210) : color(10, 10, 10, 190));
            rect(keyboardBounds.x, keyboardBounds.y, keyboardBounds.w, keyboardBounds.h, 14);
        }

        textAlign(CENTER, CENTER);
        textSize(28);

        this.keyboardHitboxes.forEach((key) => {
            const hovered = !disabled && mouseX >= key.x && mouseX <= key.x + key.w && mouseY >= key.y && mouseY <= key.y + key.h;
            if (key.toggled) {
                fill(disabled ? color(95, 130, 105) : color(110, 200, 130));
            } else if (key.kind === 'special') {
                fill(disabled
                    ? color(130, 145, 160)
                    : (hovered ? color(200, 220, 240) : color(185, 205, 225))
                );
            } else {
                fill(disabled
                    ? color(140, 140, 140)
                    : (hovered ? color(240, 240, 240) : color(215, 215, 215)
                    )
                );
            }
            rect(key.x, key.y, key.w, key.h, 10);
            fill(25);
            text(key.label, key.x + key.w / 2, key.y + key.h / 2 + 1);
        });

        // Overlay zuletzt zeichnen, damit es vor den Tasten liegt.
        if (RevealScene.keyboardOverlayImage) {
            imageMode(CORNER);
            if (disabled) {
                tint(180, 180, 180, 220);
            } else {
                noTint();
            }
            image(
                RevealScene.keyboardOverlayImage,
                keyboardBounds.x,
                keyboardBounds.y,
                keyboardBounds.w,
                keyboardBounds.h
            );
            noTint();
        }

        pop();
    }

    _handleKeyboardClick(mx, my, button) {
        if (this.revealMode !== 'type') return false;

        const pressedButton = button ?? mouseButton;
        if (pressedButton !== LEFT) return false;

        if (this.keyboardHitboxes.length === 0) {
            this.keyboardHitboxes = this._getKeyboardLayout();
        }

        const hit = this.keyboardHitboxes.find((key) => (
            mx >= key.x &&
            mx <= key.x + key.w &&
            my >= key.y &&
            my <= key.y + key.h
        ));

        if (!hit) return false;

        if (typeof playButtonClickSfx === 'function') {
            playButtonClickSfx();
        }

        this._handleVirtualKeyAction(hit);
        return true;
    }

    _handleVirtualKeyAction(key) {
        if (key.action === 'shift') {
            this.keyboardShift = !this.keyboardShift;
            return;
        }

        if (key.action === 'backspace') {
            this.typedText = this.typedText.slice(0, -1);
            this.revealSuccess = false;
            return;
        }

        if (key.action === 'space') {
            this._appendTypedChar(' ');
            return;
        }

        if (key.action === 'enter') {
            this._validateRevealInput();
            if (this.revealMode === 'collect_done') {
                this._goToGridScene();
            }
            return;
        }

        if (key.action === 'char') {
            this._appendTypedChar(key.label);
            if (this.keyboardShift) {
                // Shift wie bei mobilen Tastaturen: nach einem Zeichen wieder aus.
                this.keyboardShift = false;
            }
        }
    }
}