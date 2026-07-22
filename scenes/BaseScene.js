class BaseScene {
    constructor() {
        this.manager = null; // wird von SceneManager gesetzt
    }

    enter() { }
    exit() { }
    update() { }
    draw() { }
    keyPressed(k, kc) { }
    mousePressed(mx, my) { }
    mouseReleased(mx, my) { }
}
