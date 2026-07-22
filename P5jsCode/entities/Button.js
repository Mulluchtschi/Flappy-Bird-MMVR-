class Button {
    constructor(x, y, width, height, imagePath, callback) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.imagePath = imagePath;
        this.callback = callback; // Was passiert bei Klick

        this.image = null;
        this.isPressed = false;
        this.isHovered = false;
        this.isReleasing = false; // Animation beim Loslassen
        this.pressTimer = 0;
        this.pressDuration = 150; // ms wie lange Animation dauert
        this.pressDistance = 10; // Pixel wie weit nach unten

        // Bild laden mit Callback
        if (this.imagePath) {
            loadImage(this.imagePath, (img) => {
                this.image = img;
            });
        }
    }

    // Bilder laden (wird in preload() aufgerufen)
    loadImage() {
        if (this.imagePath) {
            try {
                this.image = loadImage(this.imagePath);
            } catch (e) {
                console.warn(`Button Image konnte nicht geladen werden: ${this.imagePath}`);
            }
        }
    }

    // Klick erkennen
    checkClick(mx, my) {
        if (mx > this.x && mx < this.x + this.width &&
            my > this.y && my < this.y + this.height) {
            if (typeof playButtonClickSfx === 'function') {
                playButtonClickSfx();
            }
            this.press();
            return true;
        }
        return false;
    }

    // Button drücken (nur visuell, kein Callback)
    press() {
        this.isPressed = true;
        this.pressTimer = this.pressDuration;
        this.isHovered = true;
    }

    // Button loslassen (kein sofortiger Callback mehr)
    release() {
        if (!this.isPressed) return false;

        this.isHovered = false;
        this.isPressed = false;
        this.isReleasing = true;
        this.pressTimer = this.pressDuration; // Rückkehr-Animation starten
        // Callback wird NICHT mehr hier aufgerufen
        return true;
    }

    // Neuer Getter: Prüft ob Button gerade losgelassen wurde
    wasReleased() {
        return this.isReleasing && this.pressTimer >= this.pressDuration - 50;
    }

    // Update (für Animation)
    update() {
        if (this.isReleasing && this.pressTimer > 0) {
            this.pressTimer -= deltaTime;
            if (this.pressTimer <= 0) {
                this.isReleasing = false;
            }
        }
    }

    // Anzeigen
    show() {
        // Press-Offset Berechnung
        let pressOffset = 0;

        if (this.isPressed) {
            // Button bleibt unten während gedrückt
            pressOffset = this.pressDistance;
        } else if (this.isReleasing) {
            // Rückkehr-Animation: von pressDistance zurück zu 0
            let progress = 1 - (this.pressTimer / this.pressDuration);
            pressOffset = map(progress, 0, 1, this.pressDistance, 0);
        }

        push();
        if (this.image) {
            image(this.image, this.x, this.y + pressOffset, this.width, this.height);
        } else {
            // Fallback: Grauer Button wenn kein Bild
            fill(150);
            rectMode(CORNER);
            rect(this.x, this.y + pressOffset, this.width, this.height);
            fill(255);
            textAlign(CENTER, CENTER);
            text("Button", this.x + this.width / 2, this.y + this.height / 2 + pressOffset);
        }
        pop();
    }
}
