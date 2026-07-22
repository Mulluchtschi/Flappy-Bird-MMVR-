class PlayingScene extends BaseScene {
    constructor(manager) {
        super(manager);
        this.food = null;
    }

    enter() {
        if (!this.manager.snake) {
            this.manager.snake = new Snake(9, 9, 16, 1, 0, 10, 0.05);
        }
        this.manager.snake.isTalking = false;
        this.manager.snake.headShakeIntensity = 0;
        this.spawnFoodRandom();
    }

    draw() {
        background(0);

        if (this.manager.snake) {
            this.manager.snake.update();

            if (this.food && this.food.checkCollision(this.manager.snake.body[0])) {
                this.manager.snake.grow(1);
                this.manager.snake.eatFood(); // Mund kurz aufmachen
                this.spawnFoodRandom();
            }

            this.manager.snake.show();
            this.manager.snake.updateAndShowDialogs();
        }

        if (this.food) {
            this.food.show();
        }
    }

    spawnFoodRandom() {
        let foodX, foodY;
        do {
            foodX = floor(random(cols));
            foodY = floor(random(rows));
        } while (this.manager.snake && this.manager.snake.body.some(s => s.x === foodX && s.y === foodY));
        this.food = new Food(foodX, foodY);
    }

    mousePressed() {
        let snake = this.manager.snake;
        if (!snake) return;
        if (mouseButton === LEFT) snake.turnLeft();
        else if (mouseButton === RIGHT) snake.turnRight();
    }
}
