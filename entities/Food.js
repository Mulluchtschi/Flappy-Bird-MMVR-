class Food {
    static appleImage = null;

    constructor(gridX, gridY, config = {}) {
        // Position in Grid-Koordinaten
        this.gridX = gridX;
        this.gridY = gridY;

        // Styling
        this.color = config.color ?? color(255, 50, 50); // Rot
        this.size = config.size ?? 1; // 1 = 1 Zelle

        // State
        this.collected = false;
    }

    // Zeichne das Food
    show() {
        if (this.collected) return;

        push();
        let x = this.gridX * scaleSize;
        let y = this.gridY * scaleSize;
        let size = this.size * scaleSize;

        if (Food.appleImage) {
            imageMode(CENTER);
            noTint();
            image(Food.appleImage, x + size / 2, y + size / 2, size * 1.2, size * 1.2);
        } else {
            rectMode(CORNER);
            noStroke();
            fill(this.color);
            rect(x, y, size, size, 4);
        }
        pop();
    }

    // Prüfe ob Schlange das Food collected
    checkCollision(snakeHead) {
        if (this.collected) return false;

        if (snakeHead.x === this.gridX && snakeHead.y === this.gridY) {
            this.collected = true;
            return true;
        }
        return false;
    }

    // Reset
    reset(newGridX, newGridY) {
        this.gridX = newGridX;
        this.gridY = newGridY;
        this.collected = false;
    }
}
