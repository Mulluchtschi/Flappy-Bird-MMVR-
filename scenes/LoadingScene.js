class LoadingScene extends BaseScene {
    static barImage = null;

    constructor() {
        super();
        this.progress = 0;
        this.speed = 1;
        this.waitingAtStopPercent = false;
        this.stopPercent = 83;
        this.barWidth = scaleSize * 12;
        this.barHeight = scaleSize;
        this.shakeIntensity = 0;
        this.shakeDecay = 0.99;
        this.shakeThreshold = 10;
    }

    enter() {
        this.progress = 0;
        this.waitingAtStopPercent = false;
        this.shakeIntensity = 0;
    }

    exit() {
        // Cleanup wenn Szene verlassen wird
        this.progress = 0;
        this.waitingAtStopPercent = false;
        this.shakeIntensity = 0;
    }

    update() {
        // Screen shake decay (always runs)
        this.shakeIntensity *= this.shakeDecay;

        if (this.waitingAtStopPercent) return;

        if (this.progress < 50) {
            this.progress += this.speed;
        } else if (this.progress < this.stopPercent) {
            this.progress += this.speed * 0.2;
        }

        this.progress = constrain(this.progress, 0, this.stopPercent);

        if (this.progress >= this.stopPercent) {
            stopFlappyBirdLoop();
            this.waitingAtStopPercent = true;
        }
    }

    draw() {
        background(0); // Schwarzer Hintergrund

        push();

        // Apply screen shake
        if (this.shakeIntensity > 0) {
            let shakeX = random(-this.shakeIntensity, this.shakeIntensity);
            let shakeY = random(-this.shakeIntensity, this.shakeIntensity);
            translate(shakeX, shakeY);
        }

        fill(255);
        textFont(pixeloidFont);
        textSize(52);
        textAlign(CENTER, CENTER);
        text('Loading...', width / 2, height / 2 - 60);

        rectMode(CENTER);
        noStroke();
        // Hintergrund des Ladebalkens
        if (LoadingScene.barImage) {
            imageMode(CENTER);
            image(LoadingScene.barImage, width / 2, height / 2 + scaleSize / 2, this.barWidth + 20, this.barHeight + 20);
        } else {
            fill(100);
            rect(width / 2, height / 2 + scaleSize / 2, this.barWidth + 10, this.barHeight + 10, 10);
        }
        // Fortschrittsbalken
        let targetWidth = 10 * scaleSize;
        let currentWidth = map(this.progress, 0, this.stopPercent, 0, targetWidth);
        fill(0, 200, 100);
        rect(width / 2 - (this.barWidth - currentWidth) / 2, height / 2 + scaleSize / 2, currentWidth, this.barHeight, 10);

        fill(255);
        pixeloidFont
        textSize(52);
        text(floor(this.progress) + '%', width / 2, height / 2 + scaleSize * 2);

        pop();
    }
    mousePressed() {
        if (typeof playLoadingBarPushSfx === 'function') {
            playLoadingBarPushSfx();
        }

        if (this.waitingAtStopPercent) {
            // Add shake intensity on any key press
            this.shakeIntensity += 2;

            // If shake intensity exceeds threshold, skip to next scene
            if (this.shakeIntensity >= this.shakeThreshold) {
                console.log('🎮 Loading abgeschlossen, wechsel zu intro');
                this.manager.switchTo('intro');
                return;
            }
        }
    }
}
