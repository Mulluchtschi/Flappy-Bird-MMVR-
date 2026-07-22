class IntroScene extends BaseScene {
    static rollingCircleImage = null;
    static rollingCircleImageOpen = null;
    static revealOverlayImage = null;

    constructor(manager) {
        super(manager);

        // Intro-Cutscene mit Bewegungssequenz
        this.introActive = true;
        this.introTimer = 0;
        this.introPhase = 0;
        // Phase 0: Dialog "warum weckst du mich"
        // Phase 1: Bewegungssequenz
        // Phase 2: Dialog "okay jetzt kann es los gehen"
        // Phase 3+: Intro vorbei

        this.introDialogDuration = 2000;
        this.introWakeStartDelay = 1000;
        this.introClosingOutroDelay = 500;
        this.circlePauseDuration = 5000;
        this.reactionDialogLeadDelay = 1000;
        this.reactionDialogOutroDelay = 1000;
        this.phase1ShakeBuildDuration = 1000;
        this.phase1ShakeHoldDuration = 1000;
        this.phase1ShakeFadeDuration = 200;
        this.phase1ShakeMaxIntensity = 2;
        this.phase1ShakeRandomBonus = 1;
        this.phase18ShakeBuildDuration = 500;
        this.phase18ShakeHoldDuration = 2500;
        this.phase18ShakeFadeDuration = 200;
        this.phase18ShakeMaxIntensity = 8;
        this.phase18ShakeRandomBonus = 2;
        this.circleMoveShakeBase = 1;
        this.circleMoveShakeRandomBonus = 1;

        // Text für Intro Dialoge
        this.introWakeDialogs = [
            new DialogBox({
                text: "Gääähn...",
                textSize: 26,
                scale: 1.8,
                flipImage: true,
                padding: 25,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 2500,
                bubbleType: 'short',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: 0
            }),
            new DialogBox({
                text: "Wer hat mich denn aufgeweckt?",
                textSize: 24,
                scale: 1.6,
                scaleX: 2,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -120
            }),
            new DialogBox({
                text: "Das war echt nicht cool, Bro.",
                textSize: 24,
                scale: 1.6,
                scaleX: 1.8,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -120
            }),
            new DialogBox({
                text: "Ich geh dann mal wieder.",
                textSize: 24,
                scale: 1.6,
                flipImage: true,
                padding: 22,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -120
            })
        ];
        this.introWakeDialogTriggered = [false, false, false, false];

        this.circlePauseDialogs = [
            {
                speaker: 'circle',
                dialog: new DialogBox({
                    text: "Grrrr...",
                    textSize: 26,
                    padding: 16,
                    textOffsetX: 20,
                    scale: 1.4,
                    textColor: color(0, 0, 0),
                    displayDuration: 1800,
                    bubbleType: 'short',
                    positionMode: 'manual',
                    positionX: () => this.circleX * scaleSize + scaleSize / 2,
                    positionY: () => (this.circleY + 1) * scaleSize - 110
                })
            },
            {
                speaker: 'snake',
                dialog: new DialogBox({
                    text: "Du...",
                    textSize: 26,
                    scale: 1.5,
                    flipImage: true,
                    padding: 20,
                    textOffsetX: 20,
                    textColor: color(0, 0, 0),
                    displayDuration: 1500,
                    bubbleType: 'short',
                    positionMode: 'head',
                    positionEntity: () => this.manager.snake,
                    positionOffsetY: 110,
                    positionOffsetX: 0
                })
            },
            {
                speaker: 'snake',
                dialog: new DialogBox({
                    text: "Du bist doch das CAPTCHA-Monster!",
                    textSize: 22,
                    scale: 1.5,
                    scaleX: 2,
                    flipImage: true,
                    padding: 22,
                    textOffsetX: 20,
                    textColor: color(0, 0, 0),
                    displayDuration: 3000,
                    bubbleType: 'long',
                    positionMode: 'head',
                    positionEntity: () => this.manager.snake,
                    positionOffsetY: 110,
                    positionOffsetX: -120
                })
            },
            {
                speaker: 'circle',
                dialog: new DialogBox({
                    text: "Grrrr...",
                    textSize: 26,
                    padding: 16,
                    textOffsetX: 20,
                    scale: 1.4,
                    textColor: color(0, 0, 0),
                    displayDuration: 1800,
                    bubbleType: 'short',
                    positionMode: 'manual',
                    positionX: () => this.circleX * scaleSize + scaleSize / 2,
                    positionY: () => (this.circleY + 1) * scaleSize - 110
                })
            },
            {
                speaker: 'snake',
                dialog: new DialogBox({
                    text: "Wegen dir habe ich meinen letzten Job verloren...",
                    textSize: 21,
                    scale: 1.5,
                    scaleY: 1.8,
                    flipImage: true,
                    padding: 15,
                    textOffsetX: 20,
                    textColor: color(0, 0, 0),
                    displayDuration: 4000,
                    bubbleType: 'long',
                    positionMode: 'head',
                    positionEntity: () => this.manager.snake,
                    positionOffsetY: 110,
                    positionOffsetX: -120
                })
            },
            {
                speaker: 'snake',
                dialog: new DialogBox({
                    text: "Seitdem erreicht niemand mehr das Spiel...",
                    textSize: 21,
                    scale: 1.5,
                    scaleY: 1.8,
                    flipImage: true,
                    padding: 15,
                    textOffsetX: 20,
                    textColor: color(0, 0, 0),
                    displayDuration: 4000,
                    bubbleType: 'long',
                    positionMode: 'head',
                    positionEntity: () => this.manager.snake,
                    positionOffsetY: 110,
                    positionOffsetX: -120
                })
            },
            {
                speaker: 'snake',
                dialog: new DialogBox({
                    text: "Alle scheitern an deinen CAPTCHAs!",
                    textSize: 22,
                    scale: 1.5,
                    scaleX: 2,
                    flipImage: true,
                    padding: 22,
                    textOffsetX: 20,
                    textColor: color(0, 0, 0),
                    displayDuration: 3500,
                    bubbleType: 'long',
                    positionMode: 'head',
                    positionEntity: () => this.manager.snake,
                    positionOffsetY: 110,
                    positionOffsetX: -120
                })
            },
            {
                speaker: 'circle',
                dialog: new DialogBox({
                    text: "Grrrr...",
                    textSize: 26,
                    padding: 16,
                    textOffsetX: 20,
                    scale: 1.4,
                    textColor: color(0, 0, 0),
                    displayDuration: 1800,
                    bubbleType: 'short',
                    positionMode: 'manual',
                    positionX: () => this.circleX * scaleSize + scaleSize / 2,
                    positionY: () => (this.circleY + 1) * scaleSize - 110
                })
            }
        ];
        this.circlePauseDialogTriggered = this.circlePauseDialogs.map(() => false);

        // Dialoge nach der letzten Bewegung
        this.whatWasDialog1 = new DialogBox({
            text: "Was das war, für ein Rütteln?",
            textSize: 24,
            scale: 1.6,
            scaleX: 1.8,
            flipImage: true,
            padding: 22,
            textOffsetX: 20,
            textColor: color(0, 0, 0),
            displayDuration: 3000,
            bubbleType: 'long',
            positionMode: 'head',
            positionEntity: () => this.manager.snake,
            positionOffsetY: 110,
            positionOffsetX: -120
        });

        this.whatWasDialog2 = new DialogBox({
            text: "Dieses Rütteln kenne ich doch irgendwoher...",
            textSize: 22,
            scale: 1.6,
            scaleY: 1.8,
            flipImage: true,
            padding: 15,
            textOffsetX: 20,
            textColor: color(0, 0, 0),
            displayDuration: 4500,
            bubbleType: 'long',
            positionMode: 'head',
            positionEntity: () => this.manager.snake,
            positionOffsetY: 110,
            positionOffsetX: -120
        });

        this.whatWasDialog1Triggered = false;
        this.whatWasDialog2Triggered = false;

        this.introClosingDialogs = [
            new DialogBox({
                text: "Jetzt brennt mein Schwanz auch noch!",
                textSize: 22,
                scale: 1.5,
                scaleX: 2.2,
                flipImage: true,
                padding: 20,
                textOffsetX: 18,
                textColor: color(0, 0, 0),
                displayDuration: 3000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -140
            }),
            new DialogBox({
                text: "Ich werde nicht zulassen, dass Flappy Bird das Gleiche passiert!",
                textSize: 22,
                scale: 1.5,
                scaleX: 2,
                scaleY: 2,
                flipImage: true,
                padding: 18,
                textOffsetX: 20,
                textColor: color(0, 0, 0),
                displayDuration: 4000,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -120
            }),
            new DialogBox({
                text: "Zusammen werden wir die CAPTCHAs besiegen!",
                textSize: 24,
                scale: 1.5,
                scaleX: 2,
                scaleY: 2,
                flipImage: true,
                padding: 14,
                textOffsetX: 23,
                textColor: color(0, 0, 0),
                displayDuration: 3200,
                bubbleType: 'long',
                positionMode: 'head',
                positionEntity: () => this.manager.snake,
                positionOffsetY: 110,
                positionOffsetX: -120
            })
        ];
        this.introClosingDialogTriggered = this.introClosingDialogs.map(() => false);

        // Bewegungssequenz für Phase 1
        this.movementSequence = [
            { direction: { x: 0, y: -1 }, distance: 5 },   // 5 UP
            { direction: { x: -1, y: 0 }, distance: 3 },   // 3 LEFT
            { direction: { x: 0, y: 1 }, distance: 2 },   // 2 DOWN
            { direction: { x: -1, y: 0 }, distance: 4 },    // 5 LEFT
            { direction: { x: 0, y: -1 }, distance: 5 },    // 5 UP
            { direction: { x: -1, y: 0 }, distance: 3 },   // 5 LEFT
            { direction: { x: 0, y: -1 }, distance: 5 },   // 5 UP
            { direction: { x: 1, y: 0 }, distance: 3 },    // 5 RIGHT
        ];
        this.currentMovementIndex = 0;
        this.startingHeadPos = null;

        // Rolling Circle Animation (nach Phase 1)
        this.circleX = 0;
        this.circleY = rows - 2;
        this.circleRadius = 1;
        this.circleSpeed = 0.5;
        this.circleRowPair = 0;
        this.circleDirection = 1;
        this.circleAngle = 0;

        // Circle Pause im Bereich um X=13 / Y=9
        this.circlePaused = false;
        this.circlePauseTimer = 0;
        this.circlePauseTriggered = false;
        this.circlePausePhase = 0;
        this.circlePauseDialogIndex = 0;
        this.circlePauseLeadDelay = 500;
        this.circlePauseOutroDelay = 500;
        this.circleResumeRow = -1;
        this.circleCheckTailHitAfterResume = false;
        this.circleTailHitTriggered = false;

        // Screen shake Properties
        this.shakeIntensity = 0;
        this.shakeDecay = 0.95;
        this.shakeBuiltUp = false; // Ist das Zittern aufgebaut?
        this.shakeTimerForPhase1 = 0; // Timer für Zittern während Phase 1
        this.phase1ShakeSfxPlayed = false;
        this.phase18ShakeSfxPlayed = false;

        // Weiße Spur hinter Snake
        this.revealedCells = new Set();
    }

    enter() {
        if (!this.manager.snake) {
            this.manager.snake = new Snake(10, 12, 16, 1, 0, 5, 0.05);
        }

        this.introActive = true;
        this.introTimer = 0;
        this.introPhase = 0;
        this.currentMovementIndex = 0;
        this.startingHeadPos = null;
        this.circleDirection = 1;
        this.introWakeDialogTriggered = this.introWakeDialogTriggered.map(() => false);
        this.introClosingDialogTriggered = this.introClosingDialogTriggered.map(() => false);

        this.circlePaused = false;
        this.circlePauseTimer = 0;
        this.circlePauseTriggered = false;
        this.circlePausePhase = 0;
        this.circlePauseDialogIndex = 0;
        this.circlePauseDialogTriggered = this.circlePauseDialogTriggered.map(() => false);
        this.circleResumeRow = -1;
        this.circleCheckTailHitAfterResume = false;
        this.circleTailHitTriggered = false;

        // Resetiere alle Snake-Animationen während Intro
        if (this.manager.snake) {
            this.manager.snake.tailBlinkCount = 0;
            this.manager.snake.tailBlinkRemoveTimer = 0;
            this.manager.snake.mouthTimer = 0;
            this.manager.snake.isTalking = false;
            this.manager.snake.headShakeIntensity = 0;
            this.manager.snake.segmentLossTimer = 0; // Schwanz soll nicht blinken
        }

        // Resetiere Screen shake
        this.shakeIntensity = 0;
        this.phase1ShakeSfxPlayed = false;
        this.phase18ShakeSfxPlayed = false;
    }

    exit() {
        // Cleanup wenn Szene verlassen wird
        this.introActive = false;
    }

    draw() {
        background(0);

        push();
        this.applyScreenShake();

        this.drawLoadingOverlay();
        this.drawRevealedAreas();
        this.updateAndRenderSnake();

        if (this.introActive && this.introPhase === 1.5) {
            this.drawRollingCircle();
        }

        pop(); // Ende des shake transforms

        this.drawIntroDialogs();

        if (this.introActive) {
            this.updateIntro();
        }

        if (!this.introActive) {
            if (this.manager.snake) {
                this.manager.snake.updateAndShowDialogs();
            }
        }
    }

    applyScreenShake() {
        if (this.shakeIntensity <= 0) return;
        let shakeX = random(-this.shakeIntensity, this.shakeIntensity);
        let shakeY = random(-this.shakeIntensity, this.shakeIntensity);
        translate(shakeX, shakeY);
        this.shakeIntensity *= this.shakeDecay;
    }

    drawLoadingOverlay() {
        push();
        rectMode(CENTER);
        noStroke();
        if (LoadingScene.barImage) {
            imageMode(CENTER);
            image(LoadingScene.barImage, width / 2, height / 2 + scaleSize / 2, scaleSize * 12 + 20, scaleSize + 20);
        } else {
            fill(100);
            rect(width / 2, height / 2 + scaleSize / 2, scaleSize * 12 + 20, scaleSize + 20, 10);
        }

        fill(255);
        textFont(pixeloidFont);
        textSize(52);
        textAlign(CENTER, CENTER);
        text('Loading...', width / 2, height / 2 - 60);
        text('83%', width / 2, height / 2 + scaleSize * 2);
        pop();
    }

    updateAndRenderSnake() {
        if (!this.manager.snake) return;

        if (!this.introActive || this.introPhase === 1) {
            this.manager.snake.update();
        }

        if (this.introActive) {
            this.manager.snake.segmentLossTimer = 0;
        }

        this.manager.snake.show();
    }

    setSnakeTalking(isTalking, intensity = 0) {
        if (!this.manager.snake) return;
        this.manager.snake.isTalking = isTalking;
        this.manager.snake.headShakeIntensity = intensity;
    }

    drawIntroDialogs() {
        if (!this.introActive) return;

        if (this.introPhase === 0) {
            let anyWakeDialogVisible = false;
            for (let i = 0; i < this.introWakeDialogs.length; i++) {
                const dialog = this.introWakeDialogs[i];
                dialog.update();
                if (dialog.isVisible) {
                    dialog.show();
                    anyWakeDialogVisible = true;
                }
            }

            if (this.introTimer >= this.introWakeStartDelay && anyWakeDialogVisible) {
                this.setSnakeTalking(true, 1);
            } else if (this.manager.snake) {
                this.setSnakeTalking(false, 0);
                this.manager.snake.tailBlinkCount = 0;
                this.manager.snake.segmentLossTimer = 0;
            }
        } else if (this.introPhase === 2) {
            let anyClosingDialogVisible = false;
            for (const dialog of this.introClosingDialogs) {
                dialog.update();
                if (!dialog.isVisible) continue;
                dialog.show();
                anyClosingDialogVisible = true;
            }
            this.setSnakeTalking(anyClosingDialogVisible, anyClosingDialogVisible ? 1 : 0);
        } else {
            this.setSnakeTalking(false, 0);
        }

        this.drawCirclePauseDialogs();

        this.drawSnakeHurtDialogInIntro();
    }

    drawCirclePauseDialogs() {
        if (this.introPhase !== 1.5 || !this.circlePaused) return;

        let snakeDialogVisible = false;
        for (const entry of this.circlePauseDialogs) {
            entry.dialog.update();
            if (!entry.dialog.isVisible) continue;
            entry.dialog.show();
            if (entry.speaker === 'snake') {
                snakeDialogVisible = true;
            }
        }

        if (snakeDialogVisible) {
            this.setSnakeTalking(true, 1);
        }
    }

    drawSnakeHurtDialogInIntro() {
        if (!this.manager.snake || !this.manager.snake.collisionDialog2) return;
        if (!this.manager.snake.collisionDialog2.isVisible) return;

        this.manager.snake.collisionDialog2.update();
        this.manager.snake.collisionDialog2.show();
        this.setSnakeTalking(true, 1);
    }

    drawRollingCircle() {
        let drawX = this.circleX * scaleSize + scaleSize / 2;
        let drawY = (this.circleY + 1) * scaleSize;
        let radius = this.circleRadius * scaleSize;
        let isRolling = this.introPhase === 1.5 && !this.circlePaused;
        let isTalking = this.isCircleSpeakerVisible();

        if (isRolling) {
            drawX += sin(frameCount * 0.35) * scaleSize * 0.08;
            drawY += cos(frameCount * 0.3) * scaleSize * 0.06;
        }

        push();
        imageMode(CENTER);
        translate(drawX, drawY);
        rotate(isTalking ? 0 : this.circleAngle);
        let flipX = this.circleDirection < 0 ? -1 : 1;
        scale(flipX, 1);
        if (IntroScene.rollingCircleImage) {
            let animated = (isRolling || isTalking) && IntroScene.rollingCircleImageOpen;
            let showOpen = animated && (floor(millis() / 220) % 2 === 0);
            let circleImg = showOpen ? IntroScene.rollingCircleImageOpen : IntroScene.rollingCircleImage;
            image(circleImg, 0, 0, radius * 2, radius * 2);
        } else {
            noStroke();
            fill(0, 200, 100);
            circle(0, 0, radius * 2);
        }
        pop();
    }

    updateRollingCircle() {
        if (this.circlePaused) {
            this.circlePauseTimer += deltaTime;

            if (this.circlePausePhase === 1 && this.circlePauseTimer >= this.circlePauseLeadDelay) {
                this.triggerCirclePauseDialog(0);
                this.circlePausePhase = 2;
                this.circlePauseTimer = 0;
            } else if (this.circlePausePhase === 2) {
                const currentEntry = this.circlePauseDialogs[this.circlePauseDialogIndex];
                if (currentEntry && this.circlePauseTimer >= currentEntry.dialog.displayDuration) {
                    const nextIndex = this.circlePauseDialogIndex + 1;
                    if (nextIndex < this.circlePauseDialogs.length) {
                        this.triggerCirclePauseDialog(nextIndex);
                    } else {
                        this.circlePausePhase = 3;
                    }
                    this.circlePauseTimer = 0;
                }
            } else if (this.circlePausePhase === 3 && this.circlePauseTimer >= this.circlePauseOutroDelay) {
                this.circlePauseTimer = 0;
                this.circlePaused = false;
                this.circlePausePhase = 0;
                this.circleResumeRow = floor(this.circleY);
                this.circleCheckTailHitAfterResume = true;
                this.circleTailHitTriggered = false;
            }
            return;
        }

        this.circleX += this.circleSpeed * this.circleDirection;
        // Rotation: eine volle Umdrehung pro Umfang (2*PI*r = 2*PI*1 Zellen)
        this.circleAngle += (this.circleSpeed / this.circleRadius) * this.circleDirection;

        let circleGridX = this.circleDirection === -1
            ? ceil(this.circleX)
            : floor(this.circleX);
        let circleGridY = floor(this.circleY);

        this.checkCircleTailHitAfterResume(circleGridX, circleGridY);

        if (!this.circlePauseTriggered) {
            const inPauseAreaX = abs(circleGridX - 12) <= 1;
            const inPauseAreaY = abs(circleGridY - 5) <= 1;
            if (inPauseAreaX && inPauseAreaY) {
                this.circlePaused = true;
                this.circlePauseTimer = 0;
                this.circlePausePhase = 1;
                this.circlePauseDialogIndex = 0;
                this.circlePauseDialogTriggered = this.circlePauseDialogTriggered.map(() => false);
                this.circlePauseTriggered = true;
            }
        }

        this.addRevealedCell(circleGridX, circleGridY);
        this.addRevealedCell(circleGridX, circleGridY + 1);

        if (this.circleDirection === 1 && this.circleX > cols + this.circleRadius) {
            this.circleRowPair++;
            this.circleY = rows - 2 - (this.circleRowPair * 2);
            this.circleX = cols;
            this.circleDirection = -1;
        } else if (this.circleDirection === -1 && this.circleX < -this.circleRadius) {
            this.circleRowPair++;
            this.circleY = rows - 2 - (this.circleRowPair * 2);
            this.circleX = -this.circleRadius;
            this.circleDirection = 1;
        }

        if (this.circleY < 0) {
            this.introPhase = 2;
            this.introTimer = 0;
        }
    }

    getDialogPhaseTotalTime(dialog, leadDelay = 0, outroDelay = 0) {
        return leadDelay + dialog.displayDuration + outroDelay;
    }

    triggerCirclePauseDialog(index) {
        const entry = this.circlePauseDialogs[index];
        if (!entry || this.circlePauseDialogTriggered[index]) return;
        entry.dialog.trigger(entry.dialog.displayDuration);
        this.circlePauseDialogTriggered[index] = true;
        this.circlePauseDialogIndex = index;
        this.circlePausePhase = 2;
    }

    isCircleSpeakerVisible() {
        return this.circlePauseDialogs.some((entry) => {
            return entry.speaker === 'circle' && entry.dialog.isVisible;
        });
    }

    checkCircleTailHitAfterResume(circleGridX, circleGridY) {
        if (!this.circleCheckTailHitAfterResume || this.circleTailHitTriggered) return;

        if (floor(this.circleY) !== this.circleResumeRow) {
            this.circleCheckTailHitAfterResume = false;
            return;
        }

        if (!this.manager.snake || !this.manager.snake.body || this.manager.snake.body.length < 2) return;

        const hitsTail = this.manager.snake.body.some((segment, index) => {
            if (index === 0) return false;
            return segment.x === circleGridX && (segment.y === circleGridY || segment.y === circleGridY + 1);
        });

        if (!hitsTail) return;

        this.circleTailHitTriggered = true;
        this.circleCheckTailHitAfterResume = false;
        this.triggerSnakeTailIgnition();
    }

    triggerSnakeTailIgnition() {
        if (!this.manager.snake) return;

        this.manager.snake.tailBlinkCount = max(this.manager.snake.tailBlinkCount, 1);
        this.manager.snake.tailBlinkRemoveTimer = max(this.manager.snake.tailBlinkRemoveTimer, 700);
        this.manager.snake.tailBlinkSpeed = this.manager.snake.segmentWarningBlinkSpeed;

        if (this.manager.snake.collisionDialog2) {
            if (typeof playAuaSfx === 'function') {
                playAuaSfx();
            }
            this.manager.snake.collisionDialog2.trigger(this.manager.snake.collisionDialog2.displayDuration);
        }
    }

    addRevealedCell(x, y) {
        this.revealedCells.add(x + ',' + y);
    }

    drawRevealedAreas() {
        const overlay = IntroScene.revealOverlayImage;
        if (!overlay) return;

        const overlayDrawWidth = width;
        const overlayDrawHeight = overlay.width > 0 && overlay.height > 0
            ? overlayDrawWidth * (overlay.height / overlay.width)
            : height;

        push();
        noStroke();
        rectMode(CORNER);
        for (let cellKey of this.revealedCells) {
            let [x, y] = cellKey.split(',').map(Number);
            if (x < 0 || x >= cols || y < 0 || y >= rows) continue;

            const dx = x * scaleSize;
            const dy = y * scaleSize;
            const sx = (dx / overlayDrawWidth) * overlay.width;
            const sy = (dy / overlayDrawHeight) * overlay.height;
            const sw = (scaleSize / overlayDrawWidth) * overlay.width;
            const sh = (scaleSize / overlayDrawHeight) * overlay.height;

            image(
                overlay,
                dx,
                dy,
                scaleSize,
                scaleSize,
                sx,
                sy,
                sw,
                sh
            );
        }
        pop();
    }

    updateIntro() {
        this.introTimer += deltaTime;

        switch (this.introPhase) {
            case 0:
                this.updatePhase0();
                break;
            case 1:
                this.updatePhase1();
                break;
            case 1.7:
                this.updatePhase17();
                break;
            case 1.8:
                this.updatePhase18();
                break;
            case 1.9:
                this.updatePhase19();
                break;
            case 1.5:
                this.updatePhase15();
                break;
            case 2:
                this.updatePhase2();
                break;
        }
    }

    updatePhase0() {
        let triggerAt = this.introWakeStartDelay;
        for (let i = 0; i < this.introWakeDialogs.length; i++) {
            const dialog = this.introWakeDialogs[i];
            if (this.introTimer >= triggerAt && !this.introWakeDialogTriggered[i]) {
                dialog.trigger(dialog.displayDuration);
                this.introWakeDialogTriggered[i] = true;
            }

            triggerAt += dialog.displayDuration;
        }

        const totalWakeDialogTime = this.introWakeStartDelay + this.introWakeDialogs.reduce((sum, dialog) => {
            return sum + dialog.displayDuration;
        }, 0);
        if (this.introTimer < totalWakeDialogTime) return;

        this.introPhase = 1;
        this.introTimer = 0;
        this.currentMovementIndex = 0;

        if (!this.manager.snake) return;
        this.startingHeadPos = {
            x: this.manager.snake.body[0].x,
            y: this.manager.snake.body[0].y
        };
        const move = this.movementSequence[0];
        this.manager.snake.setDirection(move.direction.x, move.direction.y);
    }

    updatePhase1() {
        this.updateMovementSequence();

        const isLastMovement = this.currentMovementIndex >= this.movementSequence.length - 1;
        if (!isLastMovement) return;

        if (!this.phase1ShakeSfxPlayed) {
            if (typeof playShakingSfx === 'function') {
                playShakingSfx(0.65);
            }
            this.phase1ShakeSfxPlayed = true;
        }

        if (this.shakeTimerForPhase1 === 0) {
            this.shakeBuiltUp = false;
        }

        this.shakeTimerForPhase1 += deltaTime;
        const phase1BuildEnd = this.phase1ShakeBuildDuration;
        const phase1HoldEnd = phase1BuildEnd + this.phase1ShakeHoldDuration;
        const phase1FadeEnd = phase1HoldEnd + this.phase1ShakeFadeDuration;

        if (this.shakeTimerForPhase1 < phase1BuildEnd && !this.shakeBuiltUp) {
            let buildProgress = this.shakeTimerForPhase1 / this.phase1ShakeBuildDuration;
            this.shakeIntensity = buildProgress * this.phase1ShakeMaxIntensity;
        } else if (this.shakeTimerForPhase1 < phase1HoldEnd) {
            this.shakeIntensity = this.phase1ShakeMaxIntensity + random(0, this.phase1ShakeRandomBonus);
            this.shakeBuiltUp = true;
        } else if (this.shakeTimerForPhase1 < phase1FadeEnd) {
            let fadeOut = (this.shakeTimerForPhase1 - phase1HoldEnd) / this.phase1ShakeFadeDuration;
            this.shakeIntensity = this.phase1ShakeMaxIntensity * (1 - fadeOut);
        } else {
            this.introPhase = 1.7;
            this.introTimer = 0;
            this.shakeIntensity = 0;
            this.shakeBuiltUp = false;
            this.shakeTimerForPhase1 = 0;
        }
    }

    updateMovementSequence() {
        if (!this.manager.snake || this.currentMovementIndex >= this.movementSequence.length) return;

        const currentMove = this.movementSequence[this.currentMovementIndex];
        const headPos = this.manager.snake.body[0];
        let dx = headPos.x - this.startingHeadPos.x;
        let dy = headPos.y - this.startingHeadPos.y;

        if (abs(dx) > cols / 2) dx += dx > 0 ? -cols : cols;
        if (abs(dy) > rows / 2) dy += dy > 0 ? -rows : rows;

        if (max(abs(dx), abs(dy)) < currentMove.distance) return;

        this.currentMovementIndex++;
        if (this.currentMovementIndex < this.movementSequence.length) {
            const nextMove = this.movementSequence[this.currentMovementIndex];
            this.manager.snake.setDirection(nextMove.direction.x, nextMove.direction.y);
            this.startingHeadPos = { x: headPos.x, y: headPos.y };
            return;
        }

        this.manager.snake.targetSpeed = 0;
    }

    updatePhase17() {
        if (this.introTimer >= this.reactionDialogLeadDelay && !this.whatWasDialog1Triggered) {
            this.whatWasDialog1.trigger(this.whatWasDialog1.displayDuration);
            this.whatWasDialog1Triggered = true;
        }

        if (this.whatWasDialog1.isVisible) {
            this.whatWasDialog1.update();
            this.whatWasDialog1.show();
            this.setSnakeTalking(true, 1);
        }

        const totalPhaseTime = this.getDialogPhaseTotalTime(
            this.whatWasDialog1,
            this.reactionDialogLeadDelay,
            this.reactionDialogOutroDelay
        );
        if (this.introTimer <= totalPhaseTime) return;

        this.introPhase = 1.8;
        this.introTimer = 0;
        this.shakeIntensity = 0;
        this.shakeBuiltUp = false;
        this.whatWasDialog1Triggered = false;
        this.setSnakeTalking(false, 0);
    }

    updatePhase18() {
        if (!this.phase18ShakeSfxPlayed) {
            if (typeof playShakingSfx === 'function') {
                playShakingSfx(1);
            }
            this.phase18ShakeSfxPlayed = true;
        }

        const phase18BuildEnd = this.phase18ShakeBuildDuration;
        const phase18HoldEnd = phase18BuildEnd + this.phase18ShakeHoldDuration;
        const phase18FadeEnd = phase18HoldEnd + this.phase18ShakeFadeDuration;

        if (this.introTimer < phase18BuildEnd && !this.shakeBuiltUp) {
            let buildProgress = this.introTimer / this.phase18ShakeBuildDuration;
            this.shakeIntensity = buildProgress * this.phase18ShakeMaxIntensity;
        } else if (this.introTimer < phase18HoldEnd) {
            this.shakeIntensity =
                (this.phase18ShakeMaxIntensity - 1) + random(0, this.phase18ShakeRandomBonus);
            this.shakeBuiltUp = true;
        } else if (this.introTimer < phase18FadeEnd) {
            let fadeOut = (this.introTimer - phase18HoldEnd) / this.phase18ShakeFadeDuration;
            this.shakeIntensity = this.phase18ShakeMaxIntensity * (1 - fadeOut);
        } else {
            this.shakeIntensity = 0;
        }

        if (this.manager.snake) {
            this.manager.snake.targetSpeed = 0;
            this.manager.snake.headShakeIntensity = 0;
        }

        if (this.introTimer <= phase18FadeEnd) return;

        this.introPhase = 1.9;
        this.introTimer = 0;
        this.shakeIntensity = 0;
    }

    updatePhase19() {
        if (this.introTimer >= this.reactionDialogLeadDelay && !this.whatWasDialog2Triggered) {
            this.whatWasDialog2.trigger(this.whatWasDialog2.displayDuration);
            this.whatWasDialog2Triggered = true;
        }

        if (this.whatWasDialog2.isVisible) {
            this.whatWasDialog2.update();
            this.whatWasDialog2.show();
            this.setSnakeTalking(true, 2);
        }

        const totalPhaseTime = this.getDialogPhaseTotalTime(
            this.whatWasDialog2,
            this.reactionDialogLeadDelay,
            this.reactionDialogOutroDelay
        );
        if (this.introTimer <= totalPhaseTime) return;

        this.introPhase = 1.5;
        this.introTimer = 0;
        this.circleX = cols;
        this.circleY = rows - 2;
        this.circleRowPair = 0;
        this.circleDirection = -1;
        this.whatWasDialog2Triggered = false;
        this.setSnakeTalking(false, 0);
    }

    updatePhase15() {
        this.updateRollingCircle();

        if (!this.circlePaused) {
            this.shakeIntensity = this.circleMoveShakeBase + random(0, this.circleMoveShakeRandomBonus);
        } else {
            this.shakeIntensity = 0;
        }
    }

    updatePhase2() {
        let triggerAt = 0;
        for (let i = 0; i < this.introClosingDialogs.length; i++) {
            const dialog = this.introClosingDialogs[i];
            if (this.introTimer >= triggerAt && !this.introClosingDialogTriggered[i]) {
                dialog.trigger(dialog.displayDuration);
                this.introClosingDialogTriggered[i] = true;
            }
            triggerAt += dialog.displayDuration;
        }

        const totalClosingDialogTime = this.introClosingDialogs.reduce((sum, dialog) => {
            return sum + dialog.displayDuration;
        }, 0);
        if (this.introTimer < totalClosingDialogTime + this.introClosingOutroDelay) return;

        this.introActive = false;
        this.setSnakeTalking(false, 0);

        if (this.manager.snake) {
            this.manager.introSnakeState = {
                body: this.manager.snake.body.map((segment) => ({ x: segment.x, y: segment.y })),
                prevBody: this.manager.snake.prevBody.map((segment) => ({ x: segment.x, y: segment.y })),
                xdir: this.manager.snake.xdir,
                ydir: this.manager.snake.ydir,
                targetSpeed: this.manager.snake.targetSpeed,
                acceleration: this.manager.snake.acceleration,
                moveProgress: this.manager.snake.moveProgress
            };
        }

        this.manager.switchTo('scrolling');
    }
}
