class DialogBox {
    // Statische Bilder (einmal geladen für alle DialogBox Instanzen)
    static speechBubbles = {
        long: null,
        short: null
    };

    constructor(config = {}) {
        // Inhalt
        this.text = config.text ?? "Text";

        // Sprechblase Bild (zuerst laden, damit wir die natürlichen Maße kennen)
        this.bubbleType = config.bubbleType ?? 'long';
        this.bgImage = null;
        if (this.bubbleType === 'short' && DialogBox.speechBubbles.short) {
            this.bgImage = DialogBox.speechBubbles.short;
        } else if (this.bubbleType === 'long' && DialogBox.speechBubbles.long) {
            this.bgImage = DialogBox.speechBubbles.long;
        }
        this.flipImage = config.flipImage ?? false;

        // Größe: Natürliche PNG-Maße als Basis, nur durch scale änderbar
        const naturalWidth = this.bgImage ? this.bgImage.width : 400;
        const naturalHeight = this.bgImage ? this.bgImage.height : 150;
        this.scale = config.scale ?? 1;
        this.scaleX = config.scaleX ?? null;
        this.scaleY = config.scaleY ?? null;

        this.displayWidth = naturalWidth * (this.scaleX ?? this.scale);
        this.displayHeight = naturalHeight * (this.scaleY ?? this.scale);

        // Styling
        this.textColor = config.textColor ?? color(0, 0, 0);
        this.textSize = config.textSize ?? 16;
        this.padding = config.padding ?? 15;
        this.textOffsetX = config.textOffsetX ?? 0;

        // Position (Pixel)
        this.x = 0;
        this.y = 0;

        // Animation
        this.isVisible = false;
        this.displayDuration = config.displayDuration ?? null;
        this.displayTimer = 0;

        // Typewriter: automatisch aus duration berechnen (duration - 500ms), oder manuell
        if (config.typewriterSpeed !== undefined) {
            this.typewriterSpeed = config.typewriterSpeed;
        } else if (this.displayDuration !== null && this.text.length > 0) {
            this.typewriterSpeed = (this.displayDuration - 1000) / this.text.length;
        } else {
            this.typewriterSpeed = 50;
        }
        this.typewriterTimer = 0;
        this.typewriterIndex = 0;

        // Position Config (wird in update() automatisch aufgelöst)
        // head:   positionMode: 'head',   positionEntity: () => snake, positionOffsetY: 80, positionOffsetX: 0
        // manual: positionMode: 'manual', positionX: 540 oder () => ..., positionY: 960 oder () => ...
        // preset: positionMode: 'preset', positionPreset: 'CENTER'
        this._posMode = config.positionMode ?? null;
        this._posEntity = config.positionEntity ?? null;
        this._posOffsetY = config.positionOffsetY ?? 80;
        this._posOffsetX = config.positionOffsetX ?? 0;
        this._posX = config.positionX ?? null;
        this._posY = config.positionY ?? null;
        this._posPreset = config.positionPreset ?? null;
    }

    // Setze Position mit verschiedenen Modi
    setPositionMode(mode, data1, data2, data3) {
        if (mode === 'head' && data1) {
            // Über dem Kopf einer Entity
            let headX = data1.body[0].x * scaleSize + scaleSize / 2;
            let headY = data1.body[0].y * scaleSize + scaleSize / 2;
            let offsetY = data2 ?? 80;
            let offsetX = data3 ?? 0;
            this.x = headX + offsetX;
            this.y = headY - offsetY;
        } else if (mode === 'manual') {
            // Freie Koordinaten
            this.x = data1;
            this.y = data2;
        } else if (mode === 'preset') {
            // Vordefinierte Position
            const positions = {
                CENTER: { x: 540, y: 960 },
                TOP_CENTER: { x: 540, y: 80 },
                BOTTOM_CENTER: { x: 540, y: 1840 }
            };
            const pos = positions[data1];
            if (pos) {
                this.x = pos.x;
                this.y = pos.y;
            }
        }
    }

    // Zeige Dialog und starte Timer
    trigger(durationMs = null) {
        this.isVisible = true;
        this.displayTimer = 0;
        this.typewriterTimer = 0;
        this.typewriterIndex = 0;
        if (durationMs !== null) {
            this.displayDuration = durationMs;
        }
    }

    // Update
    update() {
        // Position automatisch updaten wenn positionMode gesetzt
        if (this._posMode === 'head') {
            const entity = typeof this._posEntity === 'function' ? this._posEntity() : this._posEntity;
            if (entity) this.setPositionMode('head', entity, this._posOffsetY, this._posOffsetX);
        } else if (this._posMode === 'manual') {
            const x = typeof this._posX === 'function' ? this._posX() : this._posX;
            const y = typeof this._posY === 'function' ? this._posY() : this._posY;
            if (x !== null && y !== null) this.setPositionMode('manual', x, y);
        } else if (this._posMode === 'preset') {
            if (this._posPreset) this.setPositionMode('preset', this._posPreset);
        }

        // Typewriter-Animation
        if (this.isVisible && this.typewriterIndex < this.text.length) {
            this.typewriterTimer += deltaTime;
            if (this.typewriterTimer >= this.typewriterSpeed) {
                this.typewriterTimer = 0;
                this.typewriterIndex++;
            }
        }

        // Auto-Hide Timer
        if (this.displayDuration !== null && this.isVisible) {
            this.displayTimer += deltaTime;
            if (this.displayTimer >= this.displayDuration) {
                this.isVisible = false;
            }
        }
    }

    // Render
    show() {
        if (!this.isVisible) return;

        // Background Bild (eigener push/pop damit Transformation nicht auf Text übergeht)
        if (this.bgImage) {
            push();
            imageMode(CENTER);
            noStroke();
            if (this.flipImage) {
                translate(this.x, this.y);
                scale(-1, 1);
                image(this.bgImage, 0, 0, this.displayWidth, this.displayHeight);
            } else {
                image(this.bgImage, this.x, this.y, this.displayWidth, this.displayHeight);
            }
            pop();
        }

        // Text (immer im normalen Koordinatensystem)
        push();
        noStroke();
        fill(this.textColor);
        if (typeof pixeloidFont !== 'undefined') {
            textFont(pixeloidFont);
        }
        textSize(this.textSize);
        textAlign(LEFT, TOP);

        const textX = this.x - this.displayWidth / 2 + this.padding + this.textOffsetX;
        const textY = this.y - this.displayHeight / 2 + this.padding;
        const maxWidth = this.displayWidth - this.padding * 2;

        let displayText = this.text.substring(0, this.typewriterIndex);
        this._drawWrappedText(displayText, textX, textY, maxWidth);
        pop();
    }

    // Text wrapping helper
    _drawWrappedText(content, x, y, maxWidth) {
        let words = content.split(' ');
        let line = '';
        let lineY = y;

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + ' ';
            let testWidth = textWidth(testLine);

            if (testWidth > maxWidth && line !== '') {
                text(line, x, lineY);
                line = words[i] + ' ';
                lineY += this.textSize + 4;
            } else {
                line = testLine;
            }
        }

        text(line, x, lineY);
    }
}

