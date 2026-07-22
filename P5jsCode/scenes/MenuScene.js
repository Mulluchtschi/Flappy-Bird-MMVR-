class MenuScene extends BaseScene {
    constructor(manager) {
        super(manager);

        // Bilder laden
        this.backgroundImg = loadImage('assets/background_MenuScene.png');
        this.foregroundImg = loadImage('assets/foreground_MenuScene.png');
        this.buttonImg = loadImage('assets/button_MenuScene.png');
        this.titleImg = loadImage('assets/title_MenuScene.png');

        // Bird-Animation (fliegt hoch und runter)
        this.birdImages = [
            loadImage('assets/bird_up_MenuScene.png'),
            loadImage('assets/bird_mid_MenuScene.png'),
            loadImage('assets/bird_down_MenuScene.png')
        ];
        this.birdFrame = 0; // 0, 1, 2
        this.birdFrameTimer = 0;
        this.birdFrameDuration = 150; // ms pro Frame
        this.birdX = width / 2; // X bleibt gleich
        this.birdY = 600; // Basis Y-Position
        this.birdMoveRange = 150; // 150 Pixel auf und ab
        this.birdMoveTimer = 0;
        this.birdMoveCycle = 700; // 1 Sekunde für volle auf/ab Bewegung

        // Parallax scrolling
        this.backgroundX = 0;
        this.foregroundX = 0;
        this.backgroundSpeed = 0.5;
        this.foregroundSpeed = 1.5;

        // Transition-Timer
        this.transitionTimer = 0;
        this.transitionDuration = 1000; // 1 Sekunde in ms
        this.isTransitioning = false;

        // Button (ohne Callback - wird in release() gehandhabt)
        this.startButton = new Button(
            width / 2 - 214,
            height - 650,
            428,  // Breite - von 150 auf 250 erhöht
            240,  // Höhe - von 80 auf 160 erhöht
            'assets/button_MenuScene.png',
            null // kein direkter Callback mehr
        );
    }

    enter() {
        startFlappyBirdLoop(true);
    }

    draw() {
        // Update Parallax
        this.backgroundX -= this.backgroundSpeed;
        this.foregroundX -= this.foregroundSpeed;

        // Wrap around (Endlosschleife - teleportiert zurück zum Anfang)
        if (this.backgroundX < -this.backgroundImg.width) this.backgroundX = 0;
        if (this.foregroundX < -this.foregroundImg.width) this.foregroundX = 0;

        // Hintergrund (langsam, wiederholend von rechts nach links - originale Größe)
        image(this.backgroundImg, this.backgroundX, -325);
        image(this.backgroundImg, this.backgroundX + this.backgroundImg.width - 2, -325);

        // Vordergrund (schneller, wiederholend von rechts nach links - originale Größe)
        image(this.foregroundImg, this.foregroundX, 1575);
        image(this.foregroundImg, this.foregroundX + this.foregroundImg.width, 1575);

        // Titel
        image(this.titleImg, width / 2 - this.titleImg.width * 1.3 / 2, 200, this.titleImg.width * 1.3, this.titleImg.height * 1.3);

        // Bird-Animation
        this.birdMoveTimer += deltaTime;
        if (this.birdMoveTimer >= this.birdMoveCycle) {
            this.birdMoveTimer = 0;
        }
        // Sinus-Welle: hoch und runter
        let progress = this.birdMoveTimer / this.birdMoveCycle;
        let offsetY = sin(progress * PI * 2) * (this.birdMoveRange / 2); // ±50 Pixel
        // Breite und Höhe berechnen - Proportionen bewahren
        let birdWidth = 120;
        let birdHeight = (birdWidth / this.birdImages[this.birdFrame].width) * this.birdImages[this.birdFrame].height;
        image(this.birdImages[this.birdFrame], this.birdX - birdWidth / 2, this.birdY + offsetY, birdWidth, birdHeight);

        // Bird-Frame wechsel
        this.birdFrameTimer += deltaTime;
        if (this.birdFrameTimer >= this.birdFrameDuration) {
            this.birdFrameTimer = 0;
            this.birdFrame = (this.birdFrame + 1) % 3; // 0 -> 1 -> 2 -> 0
        }

        // Button Update & Render
        this.startButton.update();
        this.startButton.show();

        // Transition-Overlay (Schwarzübergang)
        if (this.isTransitioning) {
            let progress = this.transitionTimer / this.transitionDuration;
            let alpha = map(progress, 0, 1, 255, 0); // Von schwarz (255) zu transparent (0)
            fill(0, alpha); // Schwarz mit Transparenz
            rect(0, 0, width, height);
        }
    }

    update() {
        // Prüfe ob Button losgelassen wurde
        if (!this.isTransitioning && this.startButton.isReleasing && !this.startButton.isPressed) {
            this.isTransitioning = true;
            this.transitionTimer = this.transitionDuration;
        }

        // Transition-Timer update
        if (this.isTransitioning) {
            this.transitionTimer -= deltaTime;
            if (this.transitionTimer <= 0) {
                this.isTransitioning = false;
                this.manager.switchTo('loading');
            }
        }
    }

    mousePressed(mx, my) {
        this.startButton.checkClick(mx, my);
    }

    mouseReleased() {
        this.startButton.release();
    }
}