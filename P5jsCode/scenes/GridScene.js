class GridScene extends BaseScene {
    constructor() {
        super();
        this.gridCells = [];
        this.gridOriginX = 0;
        this.gridOriginY = 0;
        this.gridRows = 4;
        this.gridCols = 4;
        this.cellSize = 0;
        this.cellGap = 0;
        this.targetLabel = 'tree';
        this.feedbackText = '';
        this.feedbackColor = null;
        this.feedbackTimerMs = 0;
        this.verifyButtonRect = null;
        this.phase = 'approach';
        this.transitionStartDelayMs = 500;
        this.transitionAnimDurationMs = 800;
        this.transitionElapsedMs = 0;
        this.transitionPrevAcceleration = null;
        this.captchaInputEnabled = false;
        this.captchaIntroActive = false;
        this.captchaTypewriterTimer = 0;
        this.captchaTypewriterIndex = 0;
        this.captchaTypewriterSpeedMs = 35;
        this.captchaIntroText = '';
        this.captchaKeywordText = 'Snake';
        this.captchaKeywordTypewriterTimer = 0;
        this.captchaKeywordTypewriterIndex = 0;
        this.captchaIntroStage = 'idle';
        this.captchaIntroStageTimerMs = 0;
        // Ablauf zentral steuerbar (wie Intro-Scene):
        // dialog -> delay -> curtain close -> hold(shake) -> open -> typewriter
        this.captchaSequence = {
            dialogDurationMs: 3500,
            afterDialogDelayMs: 500,
            curtainCloseMs: 900,
            curtainHoldMs: 1400,
            curtainOpenMs: 900,
            typewriterCharMs: 35
        };
        this.curtainState = 'idle';
        this.curtainTimerMs = 0;
        this.curtainOpenAmount = 0;
        this.curtainCloseDurationMs = this.captchaSequence.curtainCloseMs;
        this.curtainHoldDurationMs = this.captchaSequence.curtainHoldMs;
        this.curtainOpenDurationMs = this.captchaSequence.curtainOpenMs;
        this.snakePrisonVisible = false;
        this.backgroundOpenFlashCooldownMs = 5000;
        this.backgroundOpenFlashDurationMs = 500;
        this.backgroundOpenFlashRemainingMs = 0;
        this.snakePrisonStage = 1;
        this.captchaRound = 1;
        this.successCurtainActive = false;
        this.successCurtainDone = false;
        this.successSequenceStage = 'idle';
        this.outroTransitionDelayMs = 900;
        this.outroTransitionTimerMs = 0;
        this.successCorrectIndices = new Set();
        this.prisonDropWhooshPlayed = false;
        this.shakeStrengthPx = 12;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.trapDialog = new DialogBox({
            text: 'Oh nein, was fuer eine boese Falle!',
            textSize: 24,
            scale: 1.45,
            padding: 15,
            textOffsetX: 8,
            scaleX: 2,
            textColor: color(0, 0, 0),
            displayDuration: this.captchaSequence.dialogDurationMs,
            bubbleType: 'long',
            positionMode: 'head',
            positionEntity: () => this.manager?.snake,
            positionOffsetY: 100,
            positionOffsetX: 120
        });
        this.normalSnakeSpeed = 5;
        this.goldenBlockCell = { x: 0, y: 0 };
        this.defaultSegmentLossCycle = 2000;

        this.labels = ['tree', 'car', 'house', 'bird'];

        // Hier waehlt man das aktive vordefinierte CAPTCHA-Template (0, 1, 2).
        this.activeTemplateIndex = 0;
        // Optional: auf true lassen, wenn feste Templates genutzt werden sollen.
        this.usePredefinedTemplates = true;
        // Pro Template: feste korrekte Felder fuer das komplette 4x4-Grid.
        // Wichtig: Indizes gehen von 0 bis 15 (zeilenweise von links oben nach rechts unten).
        this.captchaTemplates = [
            {
                id: 'template-1',
                promptText: 'Select all squares with',
                keywordText: 'Snake',
                correctIndices: [0, 1, 2, 4, 5, 6, 7, 9, 10, 11]
            },
            {
                id: 'template-2S',
                promptText: 'Select all squares with',
                keywordText: 'Snake',
                correctIndices: [2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14]
            },
            {
                id: 'template-3',
                promptText: 'Select all squares with',
                keywordText: 'Snake',
                correctIndices: [0, 1, 2, 5, 6, 7, 9, 10, 13, 14, 15]
            }
        ];
    }

    init() {
        this.phase = 'approach';
        this.transitionElapsedMs = 0;
        this.transitionPrevAcceleration = null;
        this.captchaInputEnabled = false;
        this.captchaIntroActive = false;
        this.captchaTypewriterTimer = 0;
        this.captchaTypewriterIndex = 0;
        this.captchaTypewriterSpeedMs = this.captchaSequence.typewriterCharMs;
        this.captchaIntroText = '';
        this.captchaKeywordTypewriterTimer = 0;
        this.captchaKeywordTypewriterIndex = 0;
        this.captchaIntroStage = 'idle';
        this.captchaIntroStageTimerMs = 0;
        this.curtainState = 'idle';
        this.curtainTimerMs = 0;
        this.curtainOpenAmount = 0;
        this.curtainCloseDurationMs = this.captchaSequence.curtainCloseMs;
        this.curtainHoldDurationMs = this.captchaSequence.curtainHoldMs;
        this.curtainOpenDurationMs = this.captchaSequence.curtainOpenMs;
        this.snakePrisonVisible = false;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.backgroundOpenFlashRemainingMs = 0;
        this.backgroundOpenFlashCooldownMs = 5000;
        this.trapDialog.isVisible = false;
        this.goldenBlockCell = {
            x: 6,
            y: 12
        };

        this.gridCells = [];
        this.feedbackText = '';
        this.feedbackColor = null;
        this.feedbackTimerMs = 0;
        this.verifyButtonRect = null;
        this.snakePrisonStage = 1;
        this.captchaRound = 1;
        this.successCurtainActive = false;
        this.successCurtainDone = false;
        this.successSequenceStage = 'idle';
        this.outroTransitionTimerMs = 0;
        this.successCorrectIndices = new Set();
        this.prisonDropWhooshPlayed = false;
    }

    _initCaptchaGrid() {
        this.gridCells = [];
        this.feedbackText = '';
        this.feedbackColor = null;
        this.feedbackTimerMs = 0;

        // Jede CAPTCHA-Kachel ist exakt 4x4 Grid-Bloecke gross.
        this.cellSize = 4 * scaleSize;
        // Kacheln liegen direkt aneinander.
        this.cellGap = 0;
        const gridSize = this.cellSize * this.gridCols + this.cellGap * (this.gridCols - 1);
        this.gridOriginX = width / 2 - gridSize / 2;
        this.gridOriginY = 9 * scaleSize;

        const totalCells = this.gridRows * this.gridCols;
        let targetIndices = null;
        const template = this.usePredefinedTemplates ? this._getTemplateForRound() : null;

        if (template) {
            targetIndices = new Set((template.correctIndices || []).filter((i) => i >= 0 && i < totalCells));
            this.captchaIntroText = template.promptText || 'Select all squares with';
            this.captchaKeywordText = template.keywordText || 'Snake';
            this.successCorrectIndices = new Set(targetIndices);
        }

        if (!targetIndices || targetIndices.size === 0) {
            this.targetLabel = random(this.labels);
            const targetCount = floor(random(4, 7));
            targetIndices = this._pickUniqueIndices(targetCount, totalCells);
            this.successCorrectIndices = new Set(targetIndices);
        }

        let cellIndex = 0;
        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                const isTarget = targetIndices.has(cellIndex);
                const label = isTarget ? this.targetLabel : this._pickNonTargetLabel(this.targetLabel);
                this.gridCells.push({
                    x: col * (this.cellSize + this.cellGap),
                    y: row * (this.cellSize + this.cellGap),
                    w: this.cellSize,
                    h: this.cellSize,
                    label,
                    selected: false
                });
                cellIndex++;
            }
        }

        this._updateVerifyButtonRect();
    }

    enter() {
        this.init();
        this._ensureSnakeExists();

        const snake = this.manager.snake;
        if (snake) {
            snake.isTalking = false;
            snake.headShakeIntensity = 0;
            snake.moveProgress = 1;
            snake.targetSpeed = this.normalSnakeSpeed;
            snake.segmentLossCycle = this.defaultSegmentLossCycle;
            if (snake.xdir === 0 && snake.ydir === 0) {
                snake.xdir = 0;
                snake.ydir = -1;
            }
        }
    }

    update() {
        const snake = this.manager.snake;
        if (!snake) return;

        if (this.feedbackTimerMs > 0) {
            this.feedbackTimerMs = max(0, this.feedbackTimerMs - deltaTime);
            if (this.feedbackTimerMs <= 0) {
                this.feedbackText = '';
            }
        }

        if (this.phase === 'transition') {
            this.transitionElapsedMs += deltaTime;
            const transitionTotal = this.transitionStartDelayMs + this.transitionAnimDurationMs;
            if (this.transitionElapsedMs >= transitionTotal) {
                this._startCaptchaPhase();
                return;
            }
        }

        if (this.phase === 'captcha' && this.successCurtainActive) {
            this._updateSuccessCurtainSequence();
        }

        snake.update();

        if (this.phase === 'approach' && this._isSnakeOnGoldenBlock(snake)) {
            if (typeof playAppleEatSfx === 'function') {
                playAppleEatSfx();
            }
            this._startTransitionPhase();
            return;
        }

        if (this.phase === 'captcha' && this.captchaIntroActive) {
            this._updateCaptchaIntroSequence();
        }

        this._updateBackgroundBlink();
    }

    draw() {
        const showOpenBackground = this._isBackgroundBlinkActive() && this.backgroundOpenFlashRemainingMs > 0;
        const closedBackground = GridScene.backgroundImageClosed ?? GridScene.backgroundImageOpen;
        const drawBackground = showOpenBackground
            ? (GridScene.backgroundImageOpen ?? closedBackground)
            : closedBackground;

        if (drawBackground) {
            imageMode(CORNER);
            image(drawBackground, 0, 0, width, height);
        } else {
            background(30);
        }

        const shouldShake = this.curtainState === 'shake';
        if (shouldShake) {
            push();
            translate(this.shakeOffsetX, this.shakeOffsetY);
        }

        if (!this.phase) {
            this.init();
        }

        if (this.phase === 'approach') {
            this._drawApproachPhase();
            this._drawSnake();
        } else if (this.phase === 'transition') {
            this._drawSnake();
            this._drawTransitionPhase();
        } else {
            if (this.gridCells.length === 0) {
                this._initCaptchaGrid();
            }
            this._drawSnake();
            this._drawCaptchaPhase();
        }

        if (shouldShake) {
            pop();
        }
    }

    _isBackgroundBlinkActive() {
        return this.phase === 'captcha' && this.captchaInputEnabled;
    }

    _updateBackgroundBlink() {
        if (!this._isBackgroundBlinkActive()) {
            this.backgroundOpenFlashRemainingMs = 0;
            this.backgroundOpenFlashCooldownMs = 5000;
            return;
        }

        if (this.backgroundOpenFlashRemainingMs > 0) {
            this.backgroundOpenFlashRemainingMs = max(0, this.backgroundOpenFlashRemainingMs - deltaTime);
            return;
        }

        this.backgroundOpenFlashCooldownMs -= deltaTime;
        if (this.backgroundOpenFlashCooldownMs <= 0) {
            this.backgroundOpenFlashRemainingMs = this.backgroundOpenFlashDurationMs;
            this.backgroundOpenFlashCooldownMs = 5000;
        }
    }

    _drawSnake() {
        if (!this.manager.snake) return;
        this.manager.snake.show();
        this.manager.snake.updateAndShowDialogs();
    }

    _drawApproachPhase() {
        const blockX = this.goldenBlockCell.x * scaleSize;
        const blockY = this.goldenBlockCell.y * scaleSize;

        if (GridScene.goldenAppleImage) {
            imageMode(CORNER);
            image(GridScene.goldenAppleImage, blockX, blockY, scaleSize, scaleSize);
            return;
        }

        push();
        stroke(255, 235, 160);
        strokeWeight(3);
        fill(232, 187, 60);
        rect(blockX, blockY, scaleSize, scaleSize, 6);

        noStroke();
        fill(255, 235, 160, 120);
        rect(blockX + 5, blockY + 5, scaleSize - 10, scaleSize - 10, 4);
        pop();
    }

    _drawCaptchaPhase() {
        this._updateVerifyButtonRect();
        const typedIntroText = this.captchaIntroText.substring(0, this.captchaTypewriterIndex);
        const typedKeywordText = this.captchaKeywordText.substring(0, this.captchaKeywordTypewriterIndex);

        this._drawSnakePrisonUnderlay();

        // Text wieder wie vorher frei oben anzeigen (ohne Boxen).
        push();
        textAlign(LEFT, TOP);
        fill(255);
        const textX = scaleSize * 2;
        const textY = scaleSize * 4.5;
        textSize(40);
        text(typedIntroText, textX, textY);
        textSize(74);
        text(typedKeywordText, textX, textY + scaleSize);
        pop();

        this.gridCells.forEach((cell) => {
            const x = this.gridOriginX + cell.x;
            const y = this.gridOriginY + cell.y;
            stroke(cell.selected ? color(80, 190, 255) : color(255, 255, 255, 130));
            strokeWeight(cell.selected ? 4 : 2);

            if (cell.selected) {
                // Gedrueckt: Picture-Box PNG.
                if (GridScene.pictureBoxImage) {
                    imageMode(CORNER);
                    image(GridScene.pictureBoxImage, x, y, cell.w, cell.h);
                    noFill();
                } else {
                    fill(245, 245, 245, 145);
                }
            } else {
                // Ungedrueckt: transparenter Button.
                noFill();
            }

            rect(x, y, cell.w, cell.h, 8);
        });

        if (this.captchaInputEnabled) {
            this._drawVerifyButton();
        }

        if (this.feedbackText) {
            push();
            textAlign(CENTER, CENTER);
            textSize(34);
            fill(this.feedbackColor || color(255));
            text(
                this.feedbackText,
                width / 2,
                this.verifyButtonRect.y + this.verifyButtonRect.h / 2
            );
            pop();
        }

        this._drawCurtainBetweenLayers();

        // Prison immer zuletzt zeichnen, damit es vor den CAPTCHA-Feldern liegt.
        this._drawPrisonAtTarget();

        if (this.captchaIntroActive && this.captchaIntroStage === 'dialog') {
            if (this.manager.snake) {
                this.manager.snake.isTalking = true;
                this.manager.snake.headShakeIntensity = 1;
            }
            this.trapDialog.show();
        }
    }

    _drawTransitionPhase() {
        const target = this._getPrisonTargetRect();
        const progress = constrain(
            (this.transitionElapsedMs - this.transitionStartDelayMs) / this.transitionAnimDurationMs,
            0,
            1
        );

        if (!this.prisonDropWhooshPlayed && progress >= 0.9) {
            if (typeof playLoadingBarPushSfx === 'function') {
                playLoadingBarPushSfx();
            }
            this.prisonDropWhooshPlayed = true;
        }

        const eased = 1 - pow(1 - progress, 3);
        const scaleFactor = lerp(5, 1, eased);

        const drawW = target.w * scaleFactor;
        const drawH = target.h * scaleFactor;
        const drawX = target.x + (target.w - drawW) / 2;
        const startY = -drawH - 60;
        const drawY = lerp(startY, target.y, eased);

        if (GridScene.prisonImage) {
            imageMode(CORNER);
            image(GridScene.prisonImage, drawX, drawY, drawW, drawH);
        } else {
            push();
            fill(70, 70, 70, 220);
            stroke(190);
            strokeWeight(3);
            rect(drawX, drawY, drawW, drawH, 12);
            pop();
        }
    }

    _drawPrisonAtTarget() {
        const target = this._getPrisonTargetRect();
        if (GridScene.prisonImage) {
            imageMode(CORNER);
            image(GridScene.prisonImage, target.x, target.y, target.w, target.h);
            return;
        }

        push();
        fill(70, 70, 70, 220);
        stroke(190);
        strokeWeight(3);
        rect(target.x, target.y, target.w, target.h, 12);
        pop();
    }

    _drawSnakePrisonUnderlay() {
        if (!this.snakePrisonVisible) return;

        const target = this._getPrisonTargetRect();
        const imageToDraw = this._getActiveSnakePrisonImage();
        if (!imageToDraw) return;
        imageMode(CORNER);
        image(imageToDraw, target.x, target.y, target.w, target.h);
    }

    _getActiveSnakePrisonImage() {
        if (this.snakePrisonStage === 3) return GridScene.snakePrisonImage3;
        if (this.snakePrisonStage === 2) return GridScene.snakePrisonImage2;
        return GridScene.snakePrisonImage;
    }

    _drawCurtainBetweenLayers() {
        if (this.curtainOpenAmount <= 0) return;

        const target = this._getPrisonTargetRect();
        // openAmount: 0 = offen, 1 = komplett geschlossen.
        const halfGap = (target.w * this.curtainOpenAmount) / 2;

        push();
        noStroke();
        fill(55, 55, 55);
        rect(target.x, target.y, halfGap, target.h);
        rect(target.x + target.w - halfGap, target.y, halfGap, target.h);
        pop();
    }

    _updateCurtainAndShake() {
        const dt = deltaTime;
        if (this.curtainState === 'idle') {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            return;
        }

        this.curtainTimerMs += dt;

        if (this.curtainState === 'closing') {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            const t = constrain(this.curtainTimerMs / this.curtainCloseDurationMs, 0, 1);
            this.curtainOpenAmount = t;
            if (t >= 1) {
                this.curtainOpenAmount = 1;
                this.snakePrisonVisible = true;
                this.curtainState = 'shake';
                this.curtainTimerMs = 0;
            }
            return;
        }

        if (this.curtainState === 'shake') {
            this.curtainOpenAmount = 1;
            this.shakeOffsetX = random(-this.shakeStrengthPx, this.shakeStrengthPx);
            this.shakeOffsetY = random(-this.shakeStrengthPx, this.shakeStrengthPx);
            if (this.curtainTimerMs >= this.curtainHoldDurationMs) {
                this.curtainState = 'opening';
                this.curtainTimerMs = 0;
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
            return;
        }

        if (this.curtainState === 'opening') {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            const t = constrain(this.curtainTimerMs / this.curtainOpenDurationMs, 0, 1);
            this.curtainOpenAmount = 1 - t;
            if (t >= 1) {
                this.curtainState = 'idle';
                this.curtainTimerMs = 0;
                this.curtainOpenAmount = 0;
            }
        }
    }

    _updateCaptchaIntroSequence() {
        this.captchaIntroStageTimerMs += deltaTime;
        const snake = this.manager.snake;

        if (this.captchaIntroStage === 'dialog') {
            this.trapDialog.update();

            if (snake) {
                snake.isTalking = this.trapDialog.isVisible;
                snake.headShakeIntensity = this.trapDialog.isVisible ? 1 : 0;
            }

            if (!this.trapDialog.isVisible) {
                this.captchaIntroStage = 'dialog_delay';
                this.captchaIntroStageTimerMs = 0;
            }
            return;
        }

        if (snake) {
            snake.isTalking = false;
            snake.headShakeIntensity = 0;
        }

        if (this.captchaIntroStage === 'dialog_delay') {
            if (this.captchaIntroStageTimerMs >= this.captchaSequence.afterDialogDelayMs) {
                this.captchaIntroStage = 'curtain';
                this.captchaIntroStageTimerMs = 0;
                this.curtainState = 'closing';
                this.curtainTimerMs = 0;
                this.curtainOpenAmount = 0;
            }
            return;
        }

        if (this.captchaIntroStage === 'curtain') {
            this._updateCurtainAndShake();

            if (this.curtainState === 'idle') {
                this.captchaIntroStage = 'typewriter';
                this.captchaIntroStageTimerMs = 0;
                this.captchaTypewriterTimer = 0;
                this.captchaTypewriterIndex = 0;
                this.captchaKeywordTypewriterTimer = 0;
                this.captchaKeywordTypewriterIndex = 0;
                this.trapDialog.isVisible = false;
            }
            return;
        }

        if (this.captchaIntroStage === 'typewriter') {
            if (this.captchaTypewriterIndex < this.captchaIntroText.length) {
                this.captchaTypewriterTimer += deltaTime;
                while (this.captchaTypewriterTimer >= this.captchaTypewriterSpeedMs && this.captchaTypewriterIndex < this.captchaIntroText.length) {
                    this.captchaTypewriterTimer -= this.captchaTypewriterSpeedMs;
                    this.captchaTypewriterIndex++;
                }
                return;
            }

            if (this.captchaKeywordTypewriterIndex < this.captchaKeywordText.length) {
                this.captchaKeywordTypewriterTimer += deltaTime;
                while (this.captchaKeywordTypewriterTimer >= this.captchaTypewriterSpeedMs && this.captchaKeywordTypewriterIndex < this.captchaKeywordText.length) {
                    this.captchaKeywordTypewriterTimer -= this.captchaTypewriterSpeedMs;
                    this.captchaKeywordTypewriterIndex++;
                }
                return;
            }

            if (
                this.captchaTypewriterIndex >= this.captchaIntroText.length &&
                this.captchaKeywordTypewriterIndex >= this.captchaKeywordText.length
            ) {
                this.captchaIntroActive = false;
                this.captchaInputEnabled = true;
                this.captchaIntroStage = 'done';
            }
        }
    }

    _updateSuccessCurtainSequence() {
        this._updateCurtainAndShake();

        if (this.successSequenceStage === 'close_to_2' && this.curtainState === 'shake') {
            this.snakePrisonStage = 2;
            this.successSequenceStage = 'open_after_2';
            return;
        }

        if (this.successSequenceStage === 'open_after_2' && this.curtainState === 'idle') {
            this.successCurtainActive = false;
            this.successSequenceStage = 'await_round_2';
            this.captchaRound = 2;
            this._initCaptchaGrid();
            this.captchaInputEnabled = true;
            return;
        }

        if (this.successSequenceStage === 'close_to_3' && this.curtainState === 'shake') {
            this.snakePrisonStage = 3;
            this.successSequenceStage = 'open_after_3';
            return;
        }

        if (this.successSequenceStage === 'open_after_3' && this.curtainState === 'idle') {
            this.successCurtainActive = false;
            this.successSequenceStage = 'await_round_3';
            this.captchaRound = 3;
            this._initCaptchaGrid();
            this.captchaInputEnabled = true;
            return;
        }

        if (this.successSequenceStage === 'final_close' && this.curtainState === 'shake') {
            this.curtainState = 'closed';
            this.curtainTimerMs = 0;
            this.curtainOpenAmount = 1;
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
            this.successCurtainActive = false;
            this.successCurtainDone = true;
            this.captchaInputEnabled = false;
            this.successSequenceStage = 'done';
            this.outroTransitionTimerMs = 0;
            this.manager.switchTo('outro');
            return;
        }

        if (this.successCurtainDone && this.successSequenceStage === 'done') {
            this.outroTransitionTimerMs = max(0, this.outroTransitionTimerMs - deltaTime);
            if (this.outroTransitionTimerMs <= 0) {
                this.manager.switchTo('outro');
            }
        }
    }

    keyPressed(k, kc) {
        const snake = this.manager.snake;
        if (!snake) return;
        if (this.phase !== 'approach') return;

        if (kc === UP_ARROW) { snake.setDirection(0, -1); return; }
        if (kc === DOWN_ARROW) { snake.setDirection(0, 1); return; }
        if (kc === LEFT_ARROW) { snake.setDirection(-1, 0); return; }
        if (kc === RIGHT_ARROW) { snake.setDirection(1, 0); return; }
    }

    mousePressed(mx, my, button) {
        if (this.phase === 'approach') {
            const snake = this.manager.snake;
            if (!snake) return;

            const pressedButton = button ?? mouseButton;
            if (pressedButton === LEFT) this._turnSnake(snake, 'left');
            else if (pressedButton === RIGHT) this._turnSnake(snake, 'right');
            return;
        }

        if (this.phase !== 'captcha') {
            return;
        }

        if (!this.captchaInputEnabled) {
            return;
        }

        if (this._handleVerifyButtonClick(mx, my)) {
            return;
        }

        const gx = mx - this.gridOriginX;
        const gy = my - this.gridOriginY;

        this.gridCells.forEach((cell) => {
            if (
                gx >= cell.x && gx <= cell.x + cell.w &&
                gy >= cell.y && gy <= cell.y + cell.h
            ) {
                if (typeof playButtonClickSfx === 'function') {
                    playButtonClickSfx();
                }
                cell.selected = !cell.selected;
            }
        });
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
                state.targetSpeed ?? this.normalSnakeSpeed,
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

        this.manager.snake = new Snake(
            10,
            floor(cols / 2),
            floor(rows / 2) + 4,
            0,
            -1,
            this.normalSnakeSpeed,
            0.05
        );
    }

    _isSnakeOnGoldenBlock(snake) {
        if (!snake || !snake.body || snake.body.length === 0) return false;
        const head = snake.body[0];
        return round(head.x) === this.goldenBlockCell.x && round(head.y) === this.goldenBlockCell.y;
    }

    _startCaptchaPhase() {
        this.phase = 'captcha';
        this._initCaptchaGrid();
        this.captchaInputEnabled = false;
        this.captchaIntroActive = true;
        this.captchaIntroStage = 'dialog';
        this.captchaIntroStageTimerMs = 0;
        this.captchaTypewriterSpeedMs = this.captchaSequence.typewriterCharMs;
        this.curtainCloseDurationMs = this.captchaSequence.curtainCloseMs;
        this.curtainHoldDurationMs = this.captchaSequence.curtainHoldMs;
        this.curtainOpenDurationMs = this.captchaSequence.curtainOpenMs;
        this.curtainState = 'idle';
        this.curtainTimerMs = 0;
        this.curtainOpenAmount = 0;
        this.snakePrisonVisible = false;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.captchaTypewriterTimer = 0;
        this.captchaTypewriterIndex = 0;
        this.captchaKeywordTypewriterTimer = 0;
        this.captchaKeywordTypewriterIndex = 0;
        if (!this.captchaIntroText) {
            this.captchaIntroText = 'Select all squares with';
        }
        this.trapDialog.text = 'Oh nein, was fuer eine boese Falle!';
        this.trapDialog.trigger(this.captchaSequence.dialogDurationMs);

        const snake = this.manager.snake;
        if (snake) {
            this._freezeSnakeAtCurrentRenderPose(snake);

            if (this.transitionPrevAcceleration !== null) {
                snake.acceleration = this.transitionPrevAcceleration;
                this.transitionPrevAcceleration = null;
            }
            snake.targetSpeed = 0;
            snake.speed = 0;
            snake.xdir = 0;
            snake.ydir = 0;
            snake.moveProgress = 1;
            // In Phase 2 keine Segmentverluste mehr.
            snake.segmentLossTimer = 0;
            snake.segmentLossCycle = Number.MAX_SAFE_INTEGER;
        }
    }

    _freezeSnakeAtCurrentRenderPose(snake) {
        if (!snake || !snake.body || !snake.prevBody || snake.body.length !== snake.prevBody.length) {
            return;
        }

        const t = constrain(snake.moveProgress, 0, 1);
        const frozenBody = [];

        for (let i = 0; i < snake.body.length; i++) {
            const prev = snake.prevBody[i];
            const curr = snake.body[i];
            let dx = curr.x - prev.x;
            let dy = curr.y - prev.y;

            if (abs(dx) > cols / 2) dx += dx > 0 ? -cols : cols;
            if (abs(dy) > rows / 2) dy += dy > 0 ? -rows : rows;

            const x = (prev.x + dx * t + cols) % cols;
            const y = (prev.y + dy * t + rows) % rows;
            frozenBody.push(createVector(x, y));
        }

        snake.body = frozenBody.map((segment) => segment.copy());
        snake.prevBody = frozenBody.map((segment) => segment.copy());
    }

    _startTransitionPhase() {
        this.phase = 'transition';
        this.transitionElapsedMs = 0;

        const snake = this.manager.snake;
        if (snake) {
            if (this.transitionPrevAcceleration === null) {
                this.transitionPrevAcceleration = snake.acceleration;
            }
            // Schnell bremsen statt abrupt stoppen.
            snake.acceleration = max(snake.acceleration, 0.35);
            snake.targetSpeed = 0;
            // Ab Einleitung der zweiten Phase kein Segmentverlust mehr.
            snake.segmentLossTimer = 0;
            snake.segmentLossCycle = Number.MAX_SAFE_INTEGER;
        }
    }

    _startSuccessCurtainPhase() {
        this.successCurtainActive = true;
        this.successCurtainDone = false;
        this.successSequenceStage = this.captchaRound === 1
            ? 'close_to_2'
            : (this.captchaRound === 2 ? 'close_to_3' : 'final_close');
        this.captchaInputEnabled = false;
        this.curtainState = 'closing';
        this.curtainTimerMs = 0;
        this.curtainOpenAmount = 0;
        this.snakePrisonVisible = true;
    }

    // Extern konfigurierbar: Ablaufzeiten wie in Intro-Scene zentral steuern.
    setCaptchaSequence(config = {}) {
        this.captchaSequence = {
            ...this.captchaSequence,
            ...config
        };

        this.captchaTypewriterSpeedMs = this.captchaSequence.typewriterCharMs;
        this.curtainCloseDurationMs = this.captchaSequence.curtainCloseMs;
        this.curtainHoldDurationMs = this.captchaSequence.curtainHoldMs;
        this.curtainOpenDurationMs = this.captchaSequence.curtainOpenMs;
        this.trapDialog.displayDuration = this.captchaSequence.dialogDurationMs;
    }

    _getPrisonTargetRect() {
        const targetW = 16 * scaleSize + 20;
        const targetH = 16 * scaleSize + 20;
        const targetX = 1 * scaleSize - 10;
        const targetY = 9 * scaleSize - 10;
        return { x: targetX, y: targetY, w: targetW, h: targetH };
    }

    _turnSnake(snake, turnDirection) {
        const nextDirection = this._getTurnDirection(snake, turnDirection);
        if (!nextDirection) return;

        snake.setDirection(nextDirection.x, nextDirection.y);
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

    _pickUniqueIndices(count, maxCount) {
        const indices = new Set();
        while (indices.size < count) {
            indices.add(floor(random(maxCount)));
        }
        return indices;
    }

    _pickNonTargetLabel(target) {
        const options = this.labels.filter((label) => label !== target);
        return random(options);
    }

    _getActiveTemplate() {
        if (!this.captchaTemplates || this.captchaTemplates.length === 0) return null;

        const safeIndex = constrain(this.activeTemplateIndex, 0, this.captchaTemplates.length - 1);
        return this.captchaTemplates[safeIndex] || null;
    }

    _getTemplateForRound() {
        if (!this.captchaTemplates || this.captchaTemplates.length === 0) return null;

        const baseIndex = constrain(this.activeTemplateIndex, 0, this.captchaTemplates.length - 1);
        const roundIndex = constrain(baseIndex + (this.captchaRound - 1), 0, this.captchaTemplates.length - 1);
        return this.captchaTemplates[roundIndex] || null;
    }

    // Kann extern aufgerufen werden, um das Template umzuschalten.
    setTemplateIndex(index) {
        this.activeTemplateIndex = constrain(floor(index), 0, max(0, this.captchaTemplates.length - 1));
        if (this.phase === 'captcha') {
            this._initCaptchaGrid();
        }
    }

    _updateVerifyButtonRect() {
        const w = 4 * scaleSize;
        const h = 1 * scaleSize;
        const x = width - scaleSize - w;
        const y = height - (5 * scaleSize) - h;
        this.verifyButtonRect = { x, y, w, h };
    }

    _drawVerifyButton() {
        if (!this.verifyButtonRect) return;

        const enabled = this.captchaInputEnabled;

        const hovered = enabled && mouseX >= this.verifyButtonRect.x &&
            mouseX <= this.verifyButtonRect.x + this.verifyButtonRect.w &&
            mouseY >= this.verifyButtonRect.y &&
            mouseY <= this.verifyButtonRect.y + this.verifyButtonRect.h;

        const scaleFactor = hovered ? 1.06 : 1;
        const drawW = this.verifyButtonRect.w * scaleFactor;
        const drawH = this.verifyButtonRect.h * scaleFactor;
        const drawX = this.verifyButtonRect.x + (this.verifyButtonRect.w - drawW) / 2;
        const drawY = this.verifyButtonRect.y + (this.verifyButtonRect.h - drawH) / 2;

        if (GridScene.verifyButtonSmallImage) {
            push();
            imageMode(CORNER);
            if (!enabled) {
                tint(175, 175, 175, 220);
            } else {
                noTint();
            }
            image(GridScene.verifyButtonSmallImage, drawX, drawY, drawW, drawH);
            noTint();
            pop();
            return;
        }

        noStroke();
        fill(!enabled ? color(120, 120, 120, 180) : (hovered ? color(80, 170, 245) : color(62, 150, 230)));
        rect(drawX, drawY, drawW, drawH, 12);
    }

    _handleVerifyButtonClick(mx, my) {
        if (!this.verifyButtonRect) return false;
        const hit = mx >= this.verifyButtonRect.x &&
            mx <= this.verifyButtonRect.x + this.verifyButtonRect.w &&
            my >= this.verifyButtonRect.y &&
            my <= this.verifyButtonRect.y + this.verifyButtonRect.h;
        if (!hit) return false;

        const selectedIndices = new Set(
            this.gridCells
                .map((cell, index) => (cell.selected ? index : -1))
                .filter((index) => index >= 0)
        );
        const solved =
            selectedIndices.size === this.successCorrectIndices.size &&
            [...selectedIndices].every((index) => this.successCorrectIndices.has(index));

        if (solved) {
            if (typeof playWinSfx === 'function') {
                playWinSfx();
            }
            this.feedbackText = '';
            this.feedbackTimerMs = 0;
            this._startSuccessCurtainPhase();
        } else {
            this.feedbackText = 'Try again';
            this.feedbackColor = color(255, 110, 110);
            this.feedbackTimerMs = 1400;
        }

        return true;
    }

}
