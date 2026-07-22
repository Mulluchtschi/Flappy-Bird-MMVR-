let adminOpen = false;

function toggleAdmin() {
    adminOpen = !adminOpen;
}

function drawAdminOverlay() {
    if (!adminOpen) return;

    push();
    resetMatrix();
    rectMode(CORNER);
    textAlign(LEFT, TOP);

    let panelX = 20;
    let panelY = 20;
    let panelW = 280;
    let panelH = 280;

    fill(0, 0, 0, 180);
    noStroke();
    rect(panelX, panelY, panelW, panelH, 12);

    fill(255);
    textSize(20);
    text('Admin Overlay', panelX + 20, panelY + 15);

    textSize(14);
    let y = panelY + 45;
    let lineHeight = 20;

    text('A - for Toggle Overlay', panelX + 20, y); y += lineHeight;
    text('+ - Add Body Part', panelX + 20, y); y += lineHeight;
    text('1 - for Menu', panelX + 20, y); y += lineHeight;
    text('2 - for Loading', panelX + 20, y); y += lineHeight;
    text('3 - for Playing', panelX + 20, y); y += lineHeight;
    text('4 - for Scrolling', panelX + 20, y); y += lineHeight;
    text('5 - for Reveal', panelX + 20, y); y += lineHeight;
    text('6 - for Grid', panelX + 20, y); y += lineHeight;
    text('FPS: ' + nf(frameRate(), 2, 1), panelX + 20, y); y += lineHeight;
    text('Window: ' + floor(windowWidth) + ' x ' + floor(windowHeight), panelX + 20, y); y += lineHeight;
    text('Canvas: ' + floor(width) + ' x ' + floor(height), panelX + 20, y); y += lineHeight;
    text('ScaleSize: ' + scaleSize, panelX + 20, y);
    pop();
}
