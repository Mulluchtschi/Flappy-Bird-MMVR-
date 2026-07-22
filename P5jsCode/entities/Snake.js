class Snake {
    // Statische Kopf-Bilder
    static headImage = null;     // geschlossen
    static headImageOpen = null; // offen (beim Reden)

    constructor(length, StartX, StartY, DirectionX, DirectionY, Speed, Acceleration) {
        this.body = [];
        this.prevBody = [];
        this.xdir = DirectionX;
        this.ydir = DirectionY;
        this.targetSpeed = Speed ?? 0;
        this.speed = 0;
        this.acceleration = Acceleration;
        this.moveProgress = 1;

        // Sprechanzeige (wird von außen gesetzt wenn DialogBox sichtbar)
        this.isTalking = false;
        this.headShakeIntensity = 0;
        this.headShakeDuration = 0;
        this.headShakeMaxDuration = 150; // 150ms

        // Szenario 2: Stun + Bounce effect
        this.isStunned = false;
        this.bounceIntensity = 0;
        this.bounceDirection = null;

        // Collision Type Tracking (0=none, 1=scenario1, 2=scenario2)
        this.collisionType = 0;

        // Segment loss timer
        this.segmentLossTimer = 0;
        this.segmentLossCycle = 4000;
        this.segmentWarningTime = 2000;
        this.segmentWarningBlinkSpeed = 0.1;

        // Mouth timer (kurz öffnen wenn Apfel gegessen)
        this.mouthTimer = 0;
        this.mouthDuration = 200; // 200ms Mund offen

        // Tail blink + remove (nach Szenario 2 Kollision)
        this.tailBlinkCount = 0; // Wie viele Tail-Segmente gerade rot blinken (vor Entfernung)
        this.tailBlinkRemoveTimer = 0; // Countdown bis die blinkenden Segmente entfernt werden
        this.tailBlinkSpeed = 0.4;
        this.crashTailSegmentLoss = 2; // Anzahl Tail-Segmente, die bei Frontal-Crash verloren gehen

        // Grow queue: Segmente nacheinander spawnen
        this.growQueue = []; // Array von {timer: ms bis spawn}

        // Simple Dialog Timers
        this.dialog1Timer = 0;
        this.dialog2Timer = 0;
        this.lastDialogCollisionType = 0;
        this.dialog1Triggered = false;
        this.dialog2Triggered = false;

        // DialogBox für Snake-Kollisionen
        this.collisionDialog1 = new DialogBox({
            text: "DA KANN ICH NICHT LANG",
            textSize: 28,
            scale: 1.5,
            padding: 16,
            textOffsetX: 15,
            scaleX: 1.8,
            textColor: color(238, 0, 0),
            displayDuration: 1200,
            bubbleType: 'long',
            positionMode: 'head',
            positionEntity: () => this,
            positionOffsetY: 100
        });

        this.collisionDialog2 = new DialogBox({
            text: "AUA",
            textSize: 28,
            scale: 1.5,
            padding: 14,
            textOffsetX: 15,
            scaleX: 0.9,
            textColor: color(238, 0, 0),
            displayDuration: 1000,
            bubbleType: 'short',
            positionMode: 'head',
            positionEntity: () => this,
            positionOffsetY: 100
        });

        for (let i = 0; i < length; i++) {
            let pos = createVector(
                StartX - i * this.xdir,
                StartY - i * this.ydir
            );
            this.body[i] = pos;
            this.prevBody[i] = pos.copy();
        }
    }

    // Richtungswechsel - Szenario 1: Parallel collision detection
    setDirection(x, y) {
        if (this.isStunned) {
            this.isStunned = false;
            this.bounceIntensity = 0;
            this.bounceDirection = null;
            this.xdir = x;
            this.ydir = y;
            return;
        }

        if (this.xdir === -x && this.ydir === -y) return;

        // SZENARIO 1: Prüfe ob die NEUE Richtung sofort in Körper führt (parallel collision)
        let nextHeadX = this.body[0].x + x;
        let nextHeadY = this.body[0].y + y;

        // Wrap-around
        if (nextHeadX < 0) nextHeadX = cols - 1;
        if (nextHeadX >= cols) nextHeadX = 0;
        if (nextHeadY < 0) nextHeadY = rows - 1;
        if (nextHeadY >= rows) nextHeadY = 0;

        // Prüfe Kollision mit Körper
        for (let i = 1; i < this.body.length; i++) {
            if (nextHeadX === this.body[i].x && nextHeadY === this.body[i].y) {
                this.triggerParallelCollision();
                return;
            }
        }

        // Keine Kollision - Richtung ändern
        this.xdir = x;
        this.ydir = y;
    }

    // Drehung um 90° nach links
    turnLeft() {
        if (this.xdir === 1 && this.ydir === 0) this.setDirection(0, -1); // rechts -> oben
        else if (this.xdir === 0 && this.ydir === -1) this.setDirection(-1, 0); // oben -> links
        else if (this.xdir === -1 && this.ydir === 0) this.setDirection(0, 1); // links -> unten
        else if (this.xdir === 0 && this.ydir === 1) this.setDirection(1, 0); // unten -> rechts
    }

    // Drehung um 90° nach rechts
    turnRight() {
        if (this.xdir === 1 && this.ydir === 0) this.setDirection(0, 1); // rechts -> unten
        else if (this.xdir === 0 && this.ydir === 1) this.setDirection(-1, 0); // unten -> links
        else if (this.xdir === -1 && this.ydir === 0) this.setDirection(0, -1); // links -> oben
        else if (this.xdir === 0 && this.ydir === -1) this.setDirection(1, 0); // oben -> rechts
    }

    // Bewegung mit Interpolation
    update() {
        // Update mouth timer (Mund kurz offen nach Apfel essen)
        if (this.mouthTimer > 0) {
            this.mouthTimer -= deltaTime;
        }

        // Grow queue: Segmente mit Verzögerung spawnen
        for (let i = this.growQueue.length - 1; i >= 0; i--) {
            this.growQueue[i].timer -= deltaTime;
            if (this.growQueue[i].timer <= 0) {
                this.grow(1);
                this.growQueue.splice(i, 1);
            }
        }

        if (this.collisionType !== 0 && this.collisionType !== this.lastDialogCollisionType) {
            if (this.collisionType === 1) {
                this.dialog1Timer = this.collisionDialog1.displayDuration;
            } else if (this.collisionType === 2) {
                this.dialog2Timer = this.collisionDialog2.displayDuration;
            }
            this.lastDialogCollisionType = this.collisionType;
        }

        // Reset collision type wenn beide Dialog-Timer vorbei sind
        if (this.collisionType !== 0 && this.dialog1Timer <= 0 && this.dialog2Timer <= 0) {
            this.collisionType = 0;
            this.lastDialogCollisionType = 0;
            this.dialog1Triggered = false;
            this.dialog2Triggered = false;
        }

        // Update tail blink timer (nach Szenario 2 Verlust)
        if (this.tailBlinkRemoveTimer > 0) {
            this.tailBlinkRemoveTimer -= deltaTime;
            if (this.tailBlinkRemoveTimer <= 0) {
                let toRemove = min(this.tailBlinkCount, this.body.length - 1);
                for (let i = 0; i < toRemove; i++) {
                    this.body.pop();
                    this.prevBody.pop();
                }
                this.tailBlinkCount = 0;
                this.tailBlinkSpeed = 0.4;
            }
        }

        // Segment loss timer (alle 30 Sekunden verliert die Schlange ein Segment)
        this.segmentLossTimer += deltaTime;
        if (this.segmentLossTimer >= this.segmentLossCycle && this.body.length > 1) {
            this.body.pop();
            this.prevBody.pop();
            this.segmentLossTimer = 0;
        }

        // Szenario 2: Update bounce decay und Rückwärtsbewegung wenn stunned
        if (this.isStunned) {
            if (this.bounceIntensity > 0) {
                this.bounceIntensity *= 0.88;
            }
            // Lasse moveProgress von 0 zu 1 laufen für smoothe Rückwärtsbewegung
            this.moveProgress += this.speed * (deltaTime / 1000) * 0.5;  // Halbe Geschwindigkeit
            if (this.moveProgress > 1) {
                this.moveProgress = 1;  // Am Ende angelangt
            }
            return; // Keine normale Bewegung wenn stunned
        }

        if (this.speed < this.targetSpeed) {
            this.speed = min(this.targetSpeed, this.speed + this.acceleration);
        } else if (this.speed > this.targetSpeed) {
            this.speed = max(this.targetSpeed, this.speed - this.acceleration);
        }

        // Update head shake
        if (this.headShakeDuration < this.headShakeMaxDuration) {
            this.headShakeDuration += deltaTime;
            this.headShakeIntensity *= 0.92;
        } else {
            this.headShakeIntensity = 0;
        }

        if (this.speed <= 0) return;

        if (this.moveProgress < 1) {
            this.moveProgress += this.speed * (deltaTime / 1000);
            if (this.moveProgress > 1) this.moveProgress = 1;
            return;
        }

        if (this.xdir === 0 && this.ydir === 0) return;

        // SZENARIO 2: Prüfe BEVOR wir uns bewegen, ob die aktuelle Richtung zu Kollision führt
        let nextHeadX = this.body[0].x + this.xdir;
        let nextHeadY = this.body[0].y + this.ydir;

        // Wrap-around
        if (nextHeadX < 0) nextHeadX = cols - 1;
        if (nextHeadX >= cols) nextHeadX = 0;
        if (nextHeadY < 0) nextHeadY = rows - 1;
        if (nextHeadY >= rows) nextHeadY = 0;

        // Prüfe Kollision mit Körper (ab Index 1)
        for (let i = 1; i < this.body.length; i++) {
            if (nextHeadX === this.body[i].x && nextHeadY === this.body[i].y) {
                this.triggerFrontalCollision();
                return;
            }
        }

        // Aktuelle Position speichern
        for (let i = 0; i < this.body.length; i++) {
            this.prevBody[i] = this.body[i].copy();
        }

        let head = this.body[0].copy();
        head.x += this.xdir;
        head.y += this.ydir;

        // Ränder: Wrap-around
        if (head.x < 0) head.x = cols - 1;
        if (head.x >= cols) head.x = 0;
        if (head.y < 0) head.y = rows - 1;
        if (head.y >= rows) head.y = 0;

        this.body.unshift(head);
        this.body.pop();
        this.moveProgress = 0;
    }

    triggerParallelCollision() {
        if (typeof playNotThisWaySfx === 'function') {
            playNotThisWaySfx();
        }
        this.headShakeIntensity = 8;
        this.headShakeDuration = 0;
        this.collisionType = 1;
    }

    triggerFrontalCollision() {
        if (!this.body || !this.prevBody || this.body.length < 3) return;

        if (typeof playAuaSfx === 'function') {
            playAuaSfx();
        }

        for (let i = 0; i < this.body.length; i++) {
            this.prevBody[i] = this.body[i].copy();
        }

        this.body.shift();

        this.tailBlinkCount = min(this.crashTailSegmentLoss, this.body.length - 1);
        this.tailBlinkRemoveTimer = 500;
        this.tailBlinkSpeed = 0.4;

        if (this.body.length > 1) {
            let diffX = this.body[1].x - this.body[0].x;
            let diffY = this.body[1].y - this.body[0].y;
            if (abs(diffX) > cols / 2) diffX = diffX > 0 ? -cols : cols;
            if (abs(diffY) > rows / 2) diffY = diffY > 0 ? -rows : rows;
            this.xdir = diffX === 0 ? 0 : (diffX > 0 ? -1 : 1);
            this.ydir = diffY === 0 ? 0 : (diffY > 0 ? -1 : 1);
        }

        this.isStunned = true;
        this.bounceIntensity = 12;
        this.bounceDirection = createVector(this.xdir, this.ydir);
        this.headShakeIntensity = 0;
        this.moveProgress = 0;
        this.collisionType = 2;
    }

    // Schlange verlängern
    grow(amount) {
        for (let i = 0; i < amount; i++) {
            let tail = this.body[this.body.length - 1];
            this.body.push(tail.copy());
            this.prevBody.push(tail.copy());
        }
    }

    // Mund kurz öffnen wenn Apfel gegessen + 5 Segmente nacheinander aufploppen
    eatFood() {
        this.mouthTimer = this.mouthDuration;
        if (typeof playAppleEatSfx === 'function') {
            playAppleEatSfx();
        }
        // 5 Segmente mit je 150ms Abstand in die Queue
        for (let i = 0; i < 5; i++) {
            this.growQueue.push({ timer: i * 150 });
        }
    }

    // Schlange zeichnen mit Interpolation
    show() {
        rectMode(CORNER);
        noStroke();
        let t = constrain(this.moveProgress, 0, 1);

        for (let i = 0; i < this.body.length; i++) {
            let prev = this.prevBody[i];
            let curr = this.body[i];
            let dx = curr.x - prev.x;
            let dy = curr.y - prev.y;

            // Wrap-around Interpolation
            if (abs(dx) > cols / 2) dx += dx > 0 ? -cols : cols;
            if (abs(dy) > rows / 2) dy += dy > 0 ? -rows : rows;

            let x = (prev.x + dx * t + cols) % cols * scaleSize;
            let y = (prev.y + dy * t + rows) % rows * scaleSize;

            // Apply bounce + direction offset auf den Kopf (i === 0)
            if (i === 0) {
                // Head shake effect (Szenario 1) - wackeln mit random offset
                if (this.headShakeIntensity > 0.1) {
                    let shakeX = random(-this.headShakeIntensity, this.headShakeIntensity) * scaleSize * 0.08;
                    let shakeY = random(-this.headShakeIntensity, this.headShakeIntensity) * scaleSize * 0.08;
                    x += shakeX;
                    y += shakeY;
                }

                // Bounce effect (Szenario 2) - visuelle Rückwärtsbewegung mit offset
                if (this.bounceIntensity > 0.1 && this.bounceDirection) {
                    let bounceX = this.bounceDirection.x * this.bounceIntensity * scaleSize * 0.05;
                    let bounceY = this.bounceDirection.y * this.bounceIntensity * scaleSize * 0.05;
                    x += bounceX;
                    y += bounceY;
                }
            }

            // Bestimme Farbe
            let segmentColor;
            if (i === 0) {
                // Kopf: PNG rendern falls vorhanden
                if (Snake.headImage) {
                    push();
                    imageMode(CORNER);
                    // Wechsle zwischen offen/geschlossen wenn Schlange redet (alle 500ms)
                    // ODER Mund offen wenn gerade Apfel gegessen
                    let talking = this.isTalking && Snake.headImageOpen;
                    let eating = this.mouthTimer > 0;
                    let mouthOpen = (talking && (floor(millis() / 500) % 2 === 0)) || eating;
                    let headImg = mouthOpen ? Snake.headImageOpen : Snake.headImage;
                    // Drehe das Bild entsprechend der Bewegungsrichtung (-90° gegen Uhrzeiger)
                    let angle = -HALF_PI;
                    if (this.xdir === 1) angle = 0;
                    if (this.xdir === -1) angle = PI;
                    if (this.ydir === 1) angle = HALF_PI;
                    if (this.ydir === -1) angle = -HALF_PI;
                    translate(x + scaleSize / 2, y + scaleSize / 2);
                    rotate(angle);
                    // Offener Mund etwas größer rendern (Hitbox bleibt gleich)
                    let drawSize = mouthOpen ? scaleSize * 1.2 : scaleSize;
                    image(headImg, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
                    pop();
                } else {
                    fill(color(0, 255, 0));
                    rect(x, y, scaleSize, scaleSize, 4);
                }
                continue;
            } else if (this.tailBlinkCount > 0 && i >= this.body.length - this.tailBlinkCount) {
                // Letzten N Segmente blinken rot vor der Entfernung
                let blinkAlpha = abs(sin(frameCount * this.tailBlinkSpeed));
                segmentColor = color(255, 50, 50, blinkAlpha * 255);
            } else if (i === this.body.length - 1) {
                let timeLeft = this.segmentLossCycle - this.segmentLossTimer;
                if (timeLeft < this.segmentWarningTime) {
                    let redIntensity = 1 - (timeLeft / this.segmentWarningTime);
                    let baseGreen = 200 * (1 - redIntensity);
                    let blinkFactor = map(abs(sin(frameCount * this.segmentWarningBlinkSpeed)), 0, 1, 0.3, 1);
                    segmentColor = color(255 * blinkFactor, baseGreen * blinkFactor, 0);
                } else {
                    segmentColor = color(0, 200, 100);
                }
            } else {
                // Normaler Body
                segmentColor = color(0, 200, 100);
            }

            fill(segmentColor);
            rect(x, y, scaleSize, scaleSize, 4);
        }
    }

    // Dialoge updaten und rendern (wird in jeder Szene aufgerufen)
    updateAndShowDialogs() {
        let headX = this.body[0].x * scaleSize + scaleSize / 2;
        let headY = this.body[0].y * scaleSize + scaleSize / 2;

        if (this.dialog1Timer > 0) {
            this.dialog1Timer -= deltaTime;
            if (!this.dialog1Triggered) {
                this.collisionDialog1._posMode = 'manual';
                this.collisionDialog1._posX = headX;
                this.collisionDialog1._posY = headY - 80;
                this.collisionDialog1.trigger();
                this.dialog1Triggered = true;
            }
            this.isTalking = true;
            this.headShakeIntensity = 1;
        } else {
            this.collisionDialog1.isVisible = false;
        }

        if (this.dialog2Timer > 0) {
            this.dialog2Timer -= deltaTime;
            if (!this.dialog2Triggered) {
                this.collisionDialog2._posMode = 'manual';
                this.collisionDialog2._posX = headX;
                this.collisionDialog2._posY = headY - 80;
                this.collisionDialog2.trigger();
                this.dialog2Triggered = true;
            }
            this.isTalking = true;
            this.headShakeIntensity = 1;
        } else {
            this.collisionDialog2.isVisible = false;
        }

        if (!this.collisionDialog1.isVisible && !this.collisionDialog2.isVisible) {
            this.isTalking = false;
            this.headShakeIntensity = 0;
        }

        if (this.collisionDialog1.isVisible) {
            this.collisionDialog1.update();
            this.collisionDialog1.show();
        }
        if (this.collisionDialog2.isVisible) {
            this.collisionDialog2.update();
            this.collisionDialog2.show();
        }
    }
}