class OutroScene extends BaseScene {
    constructor() {
        super();
        this.outroSnake = null;
        this.cameraOffsetY = 0;
        this.cameraMaxOffsetY = 0;
        this.stopTriggerRow = 0; // 5. Zeile von unten (Startpunkt fuer Scroll-Phase)
        this.stopStarted = false;
        this.backgroundScrollActive = false;
        this.backgroundScrollSpeedPxPerSec = 0;
        this.backgroundScrollCurrentSpeed = 0;
        this.backgroundScrollSmoothFactor = 0.12;
        // Pfadsteuerung wie in der Intro-Szene: Richtung + Distanz pro Schritt.
        this.movementSequence = [
            { direction: { x: -1, y: 0 }, distance: 4 },
            { direction: { x: 0, y: -1 }, distance: 4 },
            { direction: { x: -1, y: 0 }, distance: 2 },
            { direction: { x: 0, y: -1 }, distance: 3 },
            { direction: { x: -1, y: 0 }, distance: 2 },
            { direction: { x: 0, y: -1 }, distance: 7 },
            { direction: { x: 1, y: 0 }, distance: 11 }
        ];
        this.movementSequenceStarted = false;
        this.movementSequenceFinished = false;
        this.currentMovementIndex = 0;
        this.startingHeadPos = null;
        this.lastHeadY = null;
        this.unwrappedHeadY = 0;
        this.finalFacingDir = { x: 1, y: 0 };

        this.introWakeStartDelay = 1000;
        this.finalDialogsStarted = false;
        this.finalDialogsTimer = 0;
        this.debugDialogSkipEnabled = true;

        // Outro-Endphase: Loading-Bar wie in LoadingScene (bis 99%).
        this.loadingBarPhaseActive = false;
        this.loadingStartPercent = 83;
        this.loadingProgress = this.loadingStartPercent;
        // Bei Start bei 83 und Ende bei 99 dauert der Lauf so ca. 5 Sekunden.
        this.loadingSpeed = 0.27;
        this.loadingWaitingAtStopPercent = false;
        this.loadingStopPercent = 99;
        this.loadingBarWidth = scaleSize * 12;
        this.loadingBarHeight = scaleSize;
        this.loadingPhaseDelayMs = 770;
        this.loadingPhaseDelayTimer = 0;
        this.loadingPhaseDelayStarted = false;
        this.errorScreenDelayMs = 3000;
        this.errorScreenDelayTimer = 0;
        this.showErrorScreen = false;
        this.outroFlappyLoopActive = false;

        // Gleiche Dialoge wie in der Intro-Szene, aber an die Outro-Snake gebunden.
        this.introWakeDialogs = [
            new DialogBox({
                text: "Danke, mein Akh!",
                textSize: 26,
                scale: 1.8,
                scaleX: 2.7,
                flipImage: true,
                padding: 25,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 2500,
                bubbleType: 'short',
                positionMode: 'head',
                positionEntity: () => this.outroSnake,
                positionOffsetY: 110,
                positionOffsetX: 0
            }),
            new DialogBox({
                text: "Zusammen haben wir die Captchas besiegt.",
                textSize: 24,
                scale: 2,
                scaleX: 1.5,
                scaleY: 2.2,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.outroSnake,
                positionOffsetY: 110,
                positionOffsetX: -120
            }),
            new DialogBox({
                text: "Jetzt lasse ich dich auch wieder Flappy Bird spielen.",
                textSize: 24,
                scale: 1.6,
                scaleX: 2,
                scaleY: 2.4,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.outroSnake,
                positionOffsetY: 110,
                positionOffsetX: -120
            }),
            new DialogBox({
                text: "Wir sehen uns bestimmt wieder!",
                textSize: 24,
                scale: 1.8,
                scaleX: 2,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.outroSnake,
                positionOffsetY: 110,
                positionOffsetX: -120
            })
        ];
        this.introWakeDialogTriggered = this.introWakeDialogs.map(() => false);
    }

    enter() {
        this.cameraOffsetY = 0;
        this.cameraMaxOffsetY = height;
        this.stopTriggerRow = max(0, rows - 5);
        this.stopStarted = false;
        this.backgroundScrollActive = false;
        this.backgroundScrollSpeedPxPerSec = 5 * scaleSize;
        this.backgroundScrollCurrentSpeed = 0;
        this.movementSequenceStarted = false;
        this.movementSequenceFinished = false;
        this.currentMovementIndex = 0;
        this.startingHeadPos = null;
        this.lastHeadY = null;
        this.unwrappedHeadY = 0;
        const lastMove = this.movementSequence[this.movementSequence.length - 1];
        this.finalFacingDir = lastMove
            ? { x: lastMove.direction.x, y: lastMove.direction.y }
            : { x: 1, y: 0 };
        this.finalDialogsStarted = false;
        this.finalDialogsTimer = 0;
        this.loadingBarPhaseActive = false;
        this.loadingProgress = this.loadingStartPercent;
        this.loadingWaitingAtStopPercent = false;
        this.loadingPhaseDelayTimer = 0;
        this.loadingPhaseDelayStarted = false;
        this.errorScreenDelayTimer = 0;
        this.showErrorScreen = false;
        this.outroFlappyLoopActive = false;
        stopFlappyBirdLoop();
        this.introWakeDialogTriggered = this.introWakeDialogTriggered.map(() => false);
        for (const dialog of this.introWakeDialogs) {
            dialog.isVisible = false;
            dialog.displayTimer = 0;
            dialog.typewriterTimer = 0;
            dialog.typewriterIndex = 0;
        }

        const snakeLength = 10;
        const spawnX = floor(cols / 2);
        const spawnY = min(rows - 1, floor(rows / 2) + 2);
        this.outroSnake = new Snake(
            snakeLength,
            spawnX,
            spawnY,
            0,
            1,
            5,
            0.05
        );

        // Outro-Snake soll stabil laufen und nicht durch Segmentverlust schrumpfen.
        this.outroSnake.segmentLossTimer = 0;
        this.outroSnake.segmentLossCycle = Number.MAX_SAFE_INTEGER;
        this.outroSnake.targetSpeed = 5;
        this.outroSnake.moveProgress = 1;

        this.lastHeadY = this.outroSnake.body[0].y;
        this.unwrappedHeadY = this.lastHeadY;
    }

    exit() {
        if (this.outroFlappyLoopActive) {
            stopFlappyBirdLoop();
            this.outroFlappyLoopActive = false;
        }
    }

    update() {
        if (!this.outroSnake) return;

        // Sicherheitsnetz: Vor der Loading-Bar-Phase darf Flappy hier nie laufen.
        if (!this.loadingBarPhaseActive && this.outroFlappyLoopActive) {
            stopFlappyBirdLoop();
            this.outroFlappyLoopActive = false;
        }

        if (this.loadingBarPhaseActive) {
            this._updateOutroLoadingBar();
            return;
        }

        if (this.movementSequenceFinished) {
            this._updateFinalBrakeAndLock();
            this._updateFinalDialogs();
            return;
        }

        this._updateMovementSequence();
        this.outroSnake.update();
        this._updateStopAndBackgroundScroll();
        this._updateCameraOffset();
        this._updateFinalDialogs();
    }

    draw() {
        this._drawBackgroundWithCamera();

        if (this.outroSnake && !this.loadingBarPhaseActive) {
            const shouldUseFinalFacing = this.movementSequenceFinished
                && this.outroSnake.xdir === 0
                && this.outroSnake.ydir === 0;

            if (shouldUseFinalFacing) {
                const originalXDir = this.outroSnake.xdir;
                const originalYDir = this.outroSnake.ydir;
                this.outroSnake.xdir = this.finalFacingDir.x;
                this.outroSnake.ydir = this.finalFacingDir.y;
                this.outroSnake.show();
                this.outroSnake.xdir = originalXDir;
                this.outroSnake.ydir = originalYDir;
            } else {
                this.outroSnake.show();
            }
        }

        this._drawForegroundWithCamera();

        if (this.loadingBarPhaseActive) {
            this._drawOutroLoadingBar();
            return;
        }

        this._drawFinalDialogs();
    }

    _updateStopAndBackgroundScroll() {
        if (!this.outroSnake || !this.outroSnake.body || this.outroSnake.body.length === 0) return;

        const headY = this.outroSnake.body[0].y;
        if (this.lastHeadY === null) {
            this.lastHeadY = headY;
            this.unwrappedHeadY = headY;
        }

        let deltaY = headY - this.lastHeadY;
        if (deltaY < -rows / 2) deltaY += rows;
        else if (deltaY > rows / 2) deltaY -= rows;

        this.unwrappedHeadY += deltaY;
        this.lastHeadY = headY;

        if (!this.stopStarted && this.unwrappedHeadY >= this.stopTriggerRow) {
            this.stopStarted = true;
            this.backgroundScrollActive = true;
            // Smooth stoppen ueber Snake-Acceleration/Deceleration.
            this.outroSnake.targetSpeed = 0;
        }

        const scrollFinished = this.cameraOffsetY >= this.cameraMaxOffsetY - 0.5;
        if (this.stopStarted && !this.movementSequenceStarted && this.movementSequence.length > 0) {
            const isFullyStopped = this.outroSnake.speed <= 0.05;
            if (isFullyStopped && scrollFinished) {
                // Sicherstellen, dass die naechste Bewegung sauber aus einer stabilen Pose startet.
                this.outroSnake.moveProgress = 1;
                this.backgroundScrollActive = false;
                this._startMovementSequence();
                this.outroSnake.targetSpeed = 5;
            }
        }
    }

    _updateCameraOffset() {
        if (!this.backgroundScrollActive) {
            return;
        }

        this.backgroundScrollCurrentSpeed = lerp(
            this.backgroundScrollCurrentSpeed,
            this.backgroundScrollSpeedPxPerSec,
            this.backgroundScrollSmoothFactor
        );

        this.cameraOffsetY += this.backgroundScrollCurrentSpeed * (deltaTime / 1000);
        this.cameraOffsetY = min(this.cameraOffsetY, this.cameraMaxOffsetY);
    }

    _updateMovementSequence() {
        if (!this.outroSnake || this.movementSequence.length === 0) return;
        if (!this.movementSequenceStarted) return;
        if (this.currentMovementIndex >= this.movementSequence.length) return;

        const currentMove = this.movementSequence[this.currentMovementIndex];
        const headPos = this.outroSnake.body[0];

        if (!this.startingHeadPos) {
            this.startingHeadPos = { x: headPos.x, y: headPos.y };
            this.outroSnake.xdir = currentMove.direction.x;
            this.outroSnake.ydir = currentMove.direction.y;
            return;
        }

        let dx = headPos.x - this.startingHeadPos.x;
        let dy = headPos.y - this.startingHeadPos.y;

        let movedDistance = 0;
        if (currentMove.direction.x === 1) {
            // Nach rechts: Distanz mit Wrap ueber kompletten Grid-Umfang messen.
            movedDistance = (dx + cols) % cols;
        } else if (currentMove.direction.x === -1) {
            // Nach links: inverse Distanz mit Wrap.
            movedDistance = (this.startingHeadPos.x - headPos.x + cols) % cols;
        } else if (currentMove.direction.y === 1) {
            // Nach unten: Distanz mit Wrap ueber kompletten Grid-Umfang messen.
            movedDistance = (dy + rows) % rows;
        } else if (currentMove.direction.y === -1) {
            // Nach oben: inverse Distanz mit Wrap.
            movedDistance = (this.startingHeadPos.y - headPos.y + rows) % rows;
        }

        if (movedDistance < currentMove.distance) return;

        this.currentMovementIndex++;
        if (this.currentMovementIndex >= this.movementSequence.length) {
            this.movementSequenceFinished = true;
            this.finalFacingDir = { x: currentMove.direction.x, y: currentMove.direction.y };
            // Letzten Schritt weich auslaufen lassen statt hart zu cutten.
            this.outroSnake.xdir = 0;
            this.outroSnake.ydir = 0;
            this.outroSnake.targetSpeed = 0;
            return;
        }

        const nextMove = this.movementSequence[this.currentMovementIndex];
        this.finalFacingDir = { x: nextMove.direction.x, y: nextMove.direction.y };
        this.outroSnake.xdir = nextMove.direction.x;
        this.outroSnake.ydir = nextMove.direction.y;
        this.startingHeadPos = { x: headPos.x, y: headPos.y };
    }

    _startMovementSequence() {
        if (!this.outroSnake || this.movementSequence.length === 0) return;

        this.movementSequenceStarted = true;
        this.movementSequenceFinished = false;
        this.currentMovementIndex = 0;
        const headPos = this.outroSnake.body[0];
        this.startingHeadPos = { x: headPos.x, y: headPos.y };

        const firstMove = this.movementSequence[0];
        this.finalFacingDir = { x: firstMove.direction.x, y: firstMove.direction.y };
        this.outroSnake.xdir = firstMove.direction.x;
        this.outroSnake.ydir = firstMove.direction.y;
    }

    _lockSnakeStill() {
        if (!this.outroSnake) return;
        this.outroSnake.xdir = 0;
        this.outroSnake.ydir = 0;
        this.outroSnake.speed = 0;
        this.outroSnake.targetSpeed = 0;
        this.outroSnake.moveProgress = 1;
    }

    _updateFinalBrakeAndLock() {
        if (!this.outroSnake) return;

        // Keine neue Grid-Bewegung mehr, nur noch Speed auf 0 auslaufen lassen.
        this.outroSnake.xdir = 0;
        this.outroSnake.ydir = 0;
        this.outroSnake.targetSpeed = 0;
        this.outroSnake.update();

        const fullyStopped = this.outroSnake.speed <= 0.02;
        const interpolationDone = this.outroSnake.moveProgress >= 1;
        if (fullyStopped && interpolationDone) {
            this._lockSnakeStill();
        }
    }

    _updateFinalDialogs() {
        if (!this.outroSnake) return;

        const fullyStopped = this.movementSequenceFinished
            && this.outroSnake.speed <= 0.02
            && this.outroSnake.moveProgress >= 1;

        if (!fullyStopped) {
            this.outroSnake.isTalking = false;
            this.outroSnake.headShakeIntensity = 0;
            return;
        }

        if (!this.finalDialogsStarted) {
            this.finalDialogsStarted = true;
            this.finalDialogsTimer = 0;
        }

        this.finalDialogsTimer += deltaTime;
        let triggerAt = this.introWakeStartDelay;
        for (let i = 0; i < this.introWakeDialogs.length; i++) {
            const dialog = this.introWakeDialogs[i];
            if (this.finalDialogsTimer >= triggerAt && !this.introWakeDialogTriggered[i]) {
                dialog.trigger(dialog.displayDuration);
                this.introWakeDialogTriggered[i] = true;
            }
            triggerAt += dialog.displayDuration;
        }

        let anyVisible = false;
        for (const dialog of this.introWakeDialogs) {
            dialog.update();
            if (dialog.isVisible) anyVisible = true;
        }

        this.outroSnake.isTalking = anyVisible;
        this.outroSnake.headShakeIntensity = anyVisible ? 1 : 0;

        if (this._isFinalDialogSequenceDone()) {
            if (!this.loadingPhaseDelayStarted) {
                this.loadingPhaseDelayStarted = true;
                this.loadingPhaseDelayTimer = 0;
            }

            this.loadingPhaseDelayTimer += deltaTime;
            if (this.loadingPhaseDelayTimer >= this.loadingPhaseDelayMs) {
                this._enterLoadingBarPhase();
            }
        } else {
            this.loadingPhaseDelayStarted = false;
            this.loadingPhaseDelayTimer = 0;
        }
    }

    _drawFinalDialogs() {
        let anyVisible = false;
        for (const dialog of this.introWakeDialogs) {
            if (!dialog.isVisible) continue;
            dialog.show();
            anyVisible = true;
        }

        if (!anyVisible && this.outroSnake) {
            this.outroSnake.isTalking = false;
            this.outroSnake.headShakeIntensity = 0;
        }
    }

    _drawBackgroundWithCamera() {
        const bg = OutroScene.backgroundImage;

        if (bg) {
            imageMode(CORNER);
            image(bg, 0, -this.cameraOffsetY, width, height * 2);
            return;
        }

        background(30);
    }

    _drawForegroundWithCamera() {
        const fg = OutroScene.foregroundImage;
        if (!fg) return;

        imageMode(CORNER);
        image(fg, 0, -this.cameraOffsetY, width, height * 2);
    }

    _isFinalDialogSequenceDone() {
        if (!this.finalDialogsStarted) return false;
        const allTriggered = this.introWakeDialogTriggered.every((triggered) => triggered);
        if (!allTriggered) return false;
        return this.introWakeDialogs.every((dialog) => !dialog.isVisible);
    }

    _enterLoadingBarPhase() {
        if (!this.outroSnake || this.loadingBarPhaseActive) return;

        this.loadingBarPhaseActive = true;
        this.loadingProgress = this.loadingStartPercent;
        this.loadingWaitingAtStopPercent = false;
        this.loadingPhaseDelayStarted = false;
        this.loadingPhaseDelayTimer = 0;
        this.errorScreenDelayTimer = 0;
        this.showErrorScreen = false;
        startFlappyBirdLoop(true);
        this.outroFlappyLoopActive = true;

        // Schlange komplett ausblenden/beruhigen.
        this.outroSnake.isTalking = false;
        this.outroSnake.headShakeIntensity = 0;
        this._lockSnakeStill();
    }

    _updateOutroLoadingBar() {
        // 1:1 LoadingScene-Logik, nur Zielwert ist 99 und Start bei 83.
        if (this.loadingWaitingAtStopPercent) {
            if (!this.showErrorScreen) {
                this.errorScreenDelayTimer += deltaTime;
                if (this.errorScreenDelayTimer >= this.errorScreenDelayMs) {
                    this.showErrorScreen = true;
                    if (typeof playWinSfx === 'function') {
                        playWinSfx();
                    }
                    if (this.outroFlappyLoopActive) {
                        stopFlappyBirdLoop();
                        this.outroFlappyLoopActive = false;
                    }
                }
            }
            return;
        }

        const frameCompensation = deltaTime / (1000 / 60);

        if (this.loadingProgress < 50) {
            this.loadingProgress += this.loadingSpeed * frameCompensation;
        } else if (this.loadingProgress < this.loadingStopPercent) {
            this.loadingProgress += this.loadingSpeed * 0.2 * frameCompensation;
        }

        this.loadingProgress = constrain(this.loadingProgress, 0, this.loadingStopPercent);

        if (this.loadingProgress >= this.loadingStopPercent) {
            this.loadingWaitingAtStopPercent = true;
            this.errorScreenDelayTimer = 0;
            this.showErrorScreen = false;
        }
    }

    _drawOutroLoadingBar() {
        push();

        if (this.showErrorScreen) {
            this._drawErrorScreenOverlay();
            pop();
            return;
        }


        rectMode(CENTER);
        noStroke();
        if (LoadingScene.barImage) {
            imageMode(CENTER);
            image(
                LoadingScene.barImage,
                width / 2,
                height / 2 + scaleSize / 2,
                this.loadingBarWidth + 20,
                this.loadingBarHeight + 20
            );
        } else {
            fill(100);
            rect(width / 2, height / 2 + scaleSize / 2, this.loadingBarWidth + 10, this.loadingBarHeight + 10, 10);
        }

        const startPercent = this.loadingStartPercent;
        const startWidth = 10 * scaleSize;
        const endWidth = 12 * scaleSize;
        const currentWidth = map(
            constrain(this.loadingProgress, startPercent, this.loadingStopPercent),
            startPercent,
            this.loadingStopPercent,
            startWidth,
            endWidth
        );
        fill(0, 200, 100);
        rect(width / 2 - (this.loadingBarWidth - currentWidth) / 2, height / 2 + scaleSize / 2, currentWidth, this.loadingBarHeight, 10);

        textFont(pixeloidFont);
        textSize(52);
        const percentText = floor(this.loadingProgress) + '%';
        const percentX = width / 2;
        const percentY = height / 2 + scaleSize * 2;
        const bgW = textWidth(percentText) + 28;
        const bgH = 68;
        fill(0);
        rect(percentX, percentY, bgW, bgH, 6);

        fill(255);
        text(percentText, percentX, percentY);
        pop();
    }

    _drawErrorScreenOverlay() {
        const errorScreen = OutroScene.errorScreenImage;
        if (errorScreen) {
            imageMode(CORNER);
            image(errorScreen, 0, 0, width, height);
            return;
        }

        // Fallback falls das Asset nicht geladen wurde.
        noStroke();
        fill(0);
        rectMode(CORNER);
        rect(0, 0, width, height);
    }

    _debugSkipToDialogs() {
        if (!this.outroSnake) return;

        this.movementSequenceFinished = true;
        this.backgroundScrollActive = false;
        this.cameraOffsetY = this.cameraMaxOffsetY;

        this.outroSnake.xdir = 0;
        this.outroSnake.ydir = 0;
        this.outroSnake.speed = 0;
        this.outroSnake.targetSpeed = 0;
        this.outroSnake.moveProgress = 1;

        this.finalDialogsStarted = false;
        this.finalDialogsTimer = 0;
        this.introWakeDialogTriggered = this.introWakeDialogTriggered.map(() => false);

        for (const dialog of this.introWakeDialogs) {
            dialog.isVisible = false;
            dialog.displayTimer = 0;
            dialog.typewriterTimer = 0;
            dialog.typewriterIndex = 0;
        }
    }

    keyPressed(k, kc) {
        if (this.debugDialogSkipEnabled && (k === 'k' || k === 'K')) {
            this._debugSkipToDialogs();
            return;
        }

        if (k === 'r' || k === 'R') {
            this.manager.scenes['grid'].init();
            this.manager.switchTo('grid');
        }
    }
}