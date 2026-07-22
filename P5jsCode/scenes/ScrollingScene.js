class ScrollingScene extends BaseScene {
  constructor() {
    super();
    this.scrollOffset = 0;
    this.scrollMaxOffset = 0;
    this.scrollHandleHeight = scaleSize * 3;
    this.scrollBarWidth = scaleSize;
    this.sectionButtons = [];
    this.confirmButton = null;
    this.appleSpawnPoints = [
      { x: 11, y: 6 },
      { x: 3, y: 32 },
      { x: 5, y: 54 },
      { x: 10, y: 73 },
      { x: 3, y: 88 }
    ];
    this.checkboxSpawnPoints = [
      { x: 12, y: 12 },
      { x: 6, y: 18 },
      { x: 11, y: 28 },
      { x: 5, y: 32 },
      { x: 6, y: 40 },
      { x: 7, y: 54 },
      { x: 11, y: 62 },
      { x: 2, y: 66 },
      { x: 12, y: 73 },
      { x: 12, y: 83 }
    ];
    this.mainCheckboxSpawnPoint = { x: 5, y: 90 };
    this.foodItems = [];
    this.contentHeight = 0;
    this.statusMessage = '';
    this.statusMessageTimer = 0;
    this.normalSnakeSpeed = 5;
    this.pushSnakeSpeed = 1.8;
    this.lastHeadRenderX = null;
    this.lastHeadRenderY = null;
    this.pushLatchTime = 0;
    this.pushLatchDir = 0;
    this.handleCrashCooldown = 0;
    this.mainNotVerifyFlashTimer = 0;
    this.mainNotVerifyFlashDuration = 360;
    this.handleOpenFlashCooldownMs = 5000;
    this.handleOpenFlashDurationMs = 500;
    this.handleOpenFlashRemainingMs = 0;
    this.foodRespawnDelayMs = 5000;
  }

  enter() {
    stopFlappyBirdLoop();
    this._ensureSnakeExists();
    this._resetRuntimeState();
    this._resetSnakeStateForSceneEntry();
    this._initContent();
  }

  _resetRuntimeState() {
    this.scrollOffset = 0;
    this.statusMessage = '';
    this.statusMessageTimer = 0;
    this.lastHeadRenderX = null;
    this.lastHeadRenderY = null;
    this.pushLatchTime = 0;
    this.pushLatchDir = 0;
    this.handleCrashCooldown = 0;
    this.mainNotVerifyFlashTimer = 0;
    this.handleOpenFlashRemainingMs = 0;
    this.handleOpenFlashCooldownMs = 5000;
  }

  _resetSnakeStateForSceneEntry() {
    const snake = this.manager.snake;
    if (!snake) return;

    snake.isTalking = false;
    snake.headShakeIntensity = 0;
    snake.targetSpeed = this.normalSnakeSpeed;
  }

  exit() {
    const snake = this.manager.snake;
    if (!snake || !snake.body || !snake.prevBody) return;

    for (let i = 0; i < snake.body.length; i++) {
      snake.body[i].x = round(snake.body[i].x);
      snake.body[i].y = round(snake.body[i].y);
      snake.prevBody[i].x = round(snake.prevBody[i].x);
      snake.prevBody[i].y = round(snake.prevBody[i].y);
    }
  }

  _ensureSnakeExists() {
    if (this.manager.snake) return;

    const state = this._getInitialSnakeState();
    this.manager.snake = this._createSnakeFromState(state);
    this._applySnakeState(state);
  }

  _getInitialSnakeState() {
    return this.manager.introSnakeState ?? {
      body: this._buildIntroExitBodyFallback(),
      prevBody: this._buildIntroExitBodyFallback(),
      xdir: 1,
      ydir: 0,
      targetSpeed: 5,
      acceleration: 0.05,
      moveProgress: 1
    };
  }

  _createSnakeFromState(state) {
    const head = state.body[0] ?? { x: 3, y: 31 };
    return new Snake(
      max(1, state.body.length),
      head.x,
      head.y,
      state.xdir ?? 1,
      state.ydir ?? 0,
      state.targetSpeed ?? 5,
      state.acceleration ?? 0.05
    );
  }

  _applySnakeState(state) {
    const snake = this.manager.snake;
    if (!snake) return;

    snake.body = state.body.map((segment) => createVector(segment.x, segment.y));
    snake.prevBody = (state.prevBody && state.prevBody.length === state.body.length
      ? state.prevBody
      : state.body
    ).map((segment) => createVector(segment.x, segment.y));

    snake.xdir = state.xdir ?? snake.xdir;
    snake.ydir = state.ydir ?? snake.ydir;
    snake.targetSpeed = state.targetSpeed ?? snake.targetSpeed;
    snake.moveProgress = state.moveProgress ?? 1;
    snake.isTalking = false;
    snake.headShakeIntensity = 0;
  }

  _buildIntroExitBodyFallback() {
    const headX = 3;
    const headY = 31;
    const length = 16;
    const body = [];

    for (let i = 0; i < length; i++) {
      body.push({
        x: (headX - i + cols) % cols,
        y: headY
      });
    }

    return body;
  }

  _initContent() {
    const sectionButtonSize = scaleSize * 2;
    const mainButtonWidth = scaleSize * 6;
    const mainButtonHeight = scaleSize * 2;

    this.sectionButtons = this.checkboxSpawnPoints.map((spawnPoint) => ({
      x: spawnPoint.x * scaleSize,
      y: spawnPoint.y * scaleSize,
      w: sectionButtonSize,
      h: sectionButtonSize,
      active: false
    }));
    this.foodItems = this.appleSpawnPoints.map((spawnPoint) => new Food(spawnPoint.x, spawnPoint.y));

    this.confirmButton = {
      x: this.mainCheckboxSpawnPoint.x * scaleSize,
      y: this.mainCheckboxSpawnPoint.y * scaleSize,
      w: mainButtonWidth,
      h: mainButtonHeight
    };

    const lastSectionBottom = this.sectionButtons.reduce(
      (maxBottom, button) => max(maxBottom, button.y + button.h),
      0
    );
    const mainBottom = this.confirmButton.y + this.confirmButton.h;
    const contentBottom = max(lastSectionBottom, mainBottom) + 110;
    this.contentHeight = max(this._getBackgroundHeight(), contentBottom);
    this.scrollMaxOffset = max(0, this.contentHeight - this._getViewportHeight());
  }

  update() {
    this.handleCrashCooldown = max(0, this.handleCrashCooldown - deltaTime);
    this.mainNotVerifyFlashTimer = max(0, this.mainNotVerifyFlashTimer - deltaTime);
    if (this.handleOpenFlashRemainingMs > 0) {
      this.handleOpenFlashRemainingMs = max(0, this.handleOpenFlashRemainingMs - deltaTime);
    } else {
      this.handleOpenFlashCooldownMs -= deltaTime;
      if (this.handleOpenFlashCooldownMs <= 0) {
        this.handleOpenFlashRemainingMs = this.handleOpenFlashDurationMs;
        this.handleOpenFlashCooldownMs = 5000;
      }
    }

    const snake = this.manager.snake;
    if (snake) {
      if (
        this._isSnakeHeadingIntoHandle(snake) ||
        this._isSnakeHeadingIntoUiObstacle(snake)
      ) {
        snake.triggerFrontalCollision();
      }
      snake.update();
      this._handleScrollWithSnake();

      // Nach dem Push kann sich der Handle im selben Frame verschieben.
      // Darum nochmals gegen die aktualisierte Handle-Position pruefen.
      if (!snake.isStunned && this._isSnakeHeadingIntoHandle(snake)) {
        snake.triggerFrontalCollision();
      }

      this._handleFoodCollisions();
    }

    if (this.statusMessageTimer > 0) {
      this.statusMessageTimer -= deltaTime;
      if (this.statusMessageTimer <= 0) {
        this.statusMessage = '';
      }
    }
  }

  draw() {
    background(24);
    this._drawStaticBackground();
    this._drawPageContent();
    this._drawScrollBar();
    this._drawStatusMessage();

    if (this.manager.snake) {
      this.manager.snake.show();
      this.manager.snake.updateAndShowDialogs();
    }
  }

  _drawSceneGrid() {
    push();
    stroke(70);
    strokeWeight(1);
    for (let x = 0; x <= width; x += scaleSize) {
      line(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += scaleSize) {
      line(0, y, width, y);
    }
    noStroke();
    pop();
  }

  _drawStaticBackground() {
    const backgroundImage = ScrollingScene.backgroundImage;
    if (!backgroundImage || backgroundImage.width <= 0 || backgroundImage.height <= 0) {
      return;
    }

    const scale = max(width / backgroundImage.width, height / backgroundImage.height);
    const drawW = backgroundImage.width * scale;
    const drawH = backgroundImage.height * scale;
    const drawX = (width - drawW) / 2;
    const drawY = (height - drawH) / 2;

    imageMode(CORNER);
    image(backgroundImage, drawX, drawY, drawW, drawH);
  }

  _handleScrollWithSnake() {
    const snake = this.manager.snake;
    if (!snake || !snake.body || snake.body.length === 0) return;

    const head = snake.body[0];
    const prevHead = snake.prevBody && snake.prevBody.length > 0 ? snake.prevBody[0] : head;
    const scrollbarCell = this._getScrollbarCenterCell();
    const headRenderX = lerp(prevHead.x, head.x, constrain(snake.moveProgress, 0, 1));
    const headRenderY = lerp(prevHead.y, head.y, constrain(snake.moveProgress, 0, 1));

    if (this.lastHeadRenderX === null || this.lastHeadRenderY === null) {
      this.lastHeadRenderX = headRenderX;
      this.lastHeadRenderY = headRenderY;
    }

    let deltaRenderY = headRenderY - this.lastHeadRenderY;
    if (abs(deltaRenderY) > rows / 2) {
      deltaRenderY += deltaRenderY > 0 ? -rows : rows;
    }

    const headLeftPx = headRenderX * scaleSize;
    const headRightPx = headLeftPx + scaleSize;
    const headTopPx = headRenderY * scaleSize;
    const headBottomPx = headTopPx + scaleSize;

    const lastHeadLeftPx = this.lastHeadRenderX * scaleSize;
    const lastHeadRightPx = lastHeadLeftPx + scaleSize;
    const lastHeadTopPx = this.lastHeadRenderY * scaleSize;
    const lastHeadBottomPx = lastHeadTopPx + scaleSize;

    // Position des Scroll-Handles in "Zeilen" umrechnen
    const trackTop = this._getScrollTrackTop();
    const trackHeight = this._getScrollTrackHeight();
    const trackTravelPx = trackHeight - this.scrollHandleHeight;
    const maxOffsetForMap = max(1, this.scrollMaxOffset);
    const barX = this._getScrollbarCenterX();
    const handleTopPx = map(
      this.scrollOffset,
      0,
      maxOffsetForMap,
      trackTop,
      trackTop + trackHeight - this.scrollHandleHeight
    );
    const handleBottomPx = handleTopPx + this.scrollHandleHeight;
    const handleLeftPx = barX - this.scrollBarWidth / 2;
    const handleRightPx = barX + this.scrollBarWidth / 2;
    const handleTopRow = handleTopPx / scaleSize;
    const handleBottomRow = handleBottomPx / scaleSize;

    // Statt eines winzigen Toleranz-Fensters (das die Schlange von Frame zu
    // Frame einfach überspringen kann) prüfen wir, ob die Kante zwischen dem
    // letzten und dem aktuellen Frame überquert wurde - das erwischt den
    // Punkt "Abstand = 0" zuverlässig, egal wie schnell sich der Kopf bewegt.
    const crossed = (from, to, edge) =>
      (from <= edge && to >= edge) || (from >= edge && to <= edge);

    const overlapsHandleX = headRightPx > handleLeftPx && headLeftPx < handleRightPx;
    const wasOverlappingHandleX = lastHeadRightPx > handleLeftPx && lastHeadLeftPx < handleRightPx;

    // Fuer Druck von oben muss die untere Kopfkante die obere Handle-Kante treffen.
    const touchingTop =
      crossed(lastHeadBottomPx, headBottomPx, handleTopPx) ||
      abs(headBottomPx - handleTopPx) <= scaleSize * 0.2 ||
      (headBottomPx >= handleTopPx - scaleSize * 0.1 && headBottomPx <= handleTopPx + scaleSize * 0.6);

    // Fuer Druck von unten muss die obere Kopfkante die untere Handle-Kante treffen.
    const touchingBottom =
      crossed(lastHeadTopPx, headTopPx, handleBottomPx) ||
      abs(headTopPx - handleBottomPx) <= scaleSize * 0.2;

    // Side crash: seitlich in den Handle fahren soll wie Body-Crash reagieren.
    const movingSideways = snake.xdir !== 0;
    const overlapsHandleY = headBottomPx > handleTopPx && headTopPx < handleBottomPx;
    const crossedFromLeft = snake.xdir === 1 && lastHeadRightPx <= handleLeftPx && headRightPx >= handleLeftPx;
    const crossedFromRight = snake.xdir === -1 && lastHeadLeftPx >= handleRightPx && headLeftPx <= handleRightPx;
    const sideImpact = movingSideways && overlapsHandleY && (crossedFromLeft || crossedFromRight);

    if (sideImpact && this.handleCrashCooldown <= 0) {
      snake.triggerFrontalCollision();
      this.pushLatchTime = 0;
      this.pushLatchDir = 0;
      this.handleCrashCooldown = 220;
      this.lastHeadRenderX = this.lastHeadRenderX ?? headRenderX;
      this.lastHeadRenderY = this.lastHeadRenderY ?? headRenderY;
      return;
    }

    this.pushLatchTime = max(0, this.pushLatchTime - deltaTime);

    const startDownPush = (overlapsHandleX || wasOverlappingHandleX) && snake.ydir === 1 && touchingTop;
    const startUpPush = (overlapsHandleX || wasOverlappingHandleX) && snake.ydir === -1 && touchingBottom;

    if (startDownPush) {
      this.pushLatchDir = 1;
      this.pushLatchTime = 140;
    } else if (startUpPush) {
      this.pushLatchDir = -1;
      this.pushLatchTime = 140;
    }

    const latchDown = this.pushLatchTime > 0 && this.pushLatchDir === 1 && snake.ydir === 1 && (overlapsHandleX || wasOverlappingHandleX);
    const latchUp = this.pushLatchTime > 0 && this.pushLatchDir === -1 && snake.ydir === -1 && (overlapsHandleX || wasOverlappingHandleX);

    const pushingDown = startDownPush || latchDown;
    const pushingUp = startUpPush || latchUp;
    let blockedAtLimit = false;

    if (pushingDown || pushingUp) {
      snake.targetSpeed = this.pushSnakeSpeed;

      // Handle bewegt sich exakt im Tempo der Kopfbewegung mit.
      if (pushingDown && deltaRenderY > 0) {
        this.scrollOffset += deltaRenderY * scaleSize;
      } else if (pushingUp && deltaRenderY < 0) {
        this.scrollOffset += deltaRenderY * scaleSize;
      }

      // Anti-Overshoot: Handle darf den Kontaktpunkt nicht hinter sich lassen.
      if (trackTravelPx > 0) {
        const edgeBiasRows = 0.01;

        if (pushingDown) {
          // Druck von oben: untere Kopfkante soll auf oberer Handle-Kante bleiben.
          const headBottomRow = headRenderY + 1;
          const desiredTopPx = (headBottomRow - edgeBiasRows) * scaleSize;
          const requiredT = (desiredTopPx - trackTop) / trackTravelPx;
          const requiredOffset = constrain(requiredT * maxOffsetForMap, 0, this.scrollMaxOffset);
          this.scrollOffset = max(this.scrollOffset, requiredOffset);
        } else if (pushingUp) {
          // Druck von unten: obere Kopfkante soll auf unterer Handle-Kante bleiben.
          const headTopRow = headRenderY;
          const desiredTopPx = (headTopRow + edgeBiasRows) * scaleSize - this.scrollHandleHeight;
          const requiredT = (desiredTopPx - trackTop) / trackTravelPx;
          const requiredOffset = constrain(requiredT * maxOffsetForMap, 0, this.scrollMaxOffset);
          this.scrollOffset = min(this.scrollOffset, requiredOffset);
        }
      }

      const atBottomLimit = this.scrollOffset >= this.scrollMaxOffset - 0.001;
      const atTopLimit = this.scrollOffset <= 0.001;
      blockedAtLimit = (pushingDown && atBottomLimit) || (pushingUp && atTopLimit);

      // Am Anschlag nicht durch den Handle laufen: Kopfbewegung rueckgaengig machen.
      if (blockedAtLimit) {
        for (let i = 0; i < snake.body.length; i++) {
          snake.body[i].x = snake.prevBody[i].x;
          snake.body[i].y = snake.prevBody[i].y;
        }

        const lockX = scrollbarCell;
        let lockY = prevHead.y;

        if (pushingDown) {
          // Untere Kopfkante liegt exakt auf der oberen Handle-Kante.
          lockY = handleTopRow - 1;
        } else if (pushingUp) {
          // Obere Kopfkante liegt exakt auf der unteren Handle-Kante.
          lockY = handleBottomRow;
        }

        const shiftX = lockX - snake.body[0].x;
        const shiftY = lockY - snake.body[0].y;

        for (let i = 0; i < snake.body.length; i++) {
          snake.body[i].x += shiftX;
          snake.body[i].y += shiftY;
          snake.prevBody[i].x = snake.body[i].x;
          snake.prevBody[i].y = snake.body[i].y;
        }

        snake.targetSpeed = 0;
        snake.speed = 0;
        snake.moveProgress = 1;
      }
    } else {
      snake.targetSpeed = this.normalSnakeSpeed;
      this.pushLatchTime = 0;
      this.pushLatchDir = 0;
    }

    this.scrollOffset = constrain(this.scrollOffset, 0, this.scrollMaxOffset);
    this.lastHeadRenderX = blockedAtLimit ? prevHead.x : headRenderX;
    this.lastHeadRenderY = blockedAtLimit ? prevHead.y : headRenderY;
  }

  _drawPageContent() {
    push();
    rectMode(CORNER);
    translate(0, -this.scrollOffset);

    const agbImage = ScrollingScene.agbImage;
    const backgroundHeight = this._getBackgroundHeight();
    if (agbImage) {
      imageMode(CORNER);
      image(agbImage, 0, 0, width, backgroundHeight);
    }

    this._drawFoodItems();

    this.sectionButtons.forEach((button) => {
      const isHovered = this._isPointInsideRect(mouseX, mouseY + this.scrollOffset, button);
      const scaleFactor = isHovered ? 1.08 : 1;
      const drawW = button.w * scaleFactor;
      const drawH = button.h * scaleFactor;
      const drawX = button.x - (drawW - button.w) / 2;
      const drawY = button.y - (drawH - button.h) / 2;

      imageMode(CORNER);
      const buttonImage = button.active
        ? (ScrollingScene.checkboxOnImage ?? ScrollingScene.checkboxOffImage)
        : ScrollingScene.checkboxOffImage;

      if (buttonImage) {
        image(buttonImage, drawX, drawY, drawW, drawH);
      } else {
        fill(button.active ? color(40, 170, 80) : color(85));
        rect(drawX, drawY, drawW, drawH, 12);
      }
    });

    const allPressed = this._allStepsCompleted();
    imageMode(CORNER);
    const showNotVerifyFlash = !allPressed && this.mainNotVerifyFlashTimer > 0;
    const mainButtonImage = showNotVerifyFlash
      ? (ScrollingScene.mainCheckboxNotVerifyImage ?? ScrollingScene.mainCheckboxOffImage)
      : (allPressed
        ? (ScrollingScene.mainCheckboxOnImage ?? ScrollingScene.mainCheckboxOffImage)
        : ScrollingScene.mainCheckboxOffImage);

    const mainHovered = this._isPointInsideRect(mouseX, mouseY + this.scrollOffset, this.confirmButton);
    const mainScale = mainHovered ? 1.05 : 1;
    const mainDrawW = this.confirmButton.w * mainScale;
    const mainDrawH = this.confirmButton.h * mainScale;
    const mainDrawX = this.confirmButton.x - (mainDrawW - this.confirmButton.w) / 2;
    const mainDrawY = this.confirmButton.y - (mainDrawH - this.confirmButton.h) / 2;

    if (mainButtonImage) {
      image(mainButtonImage, mainDrawX, mainDrawY, mainDrawW, mainDrawH);
    } else {
      fill(allPressed ? color(12, 138, 217) : color(110));
      rect(mainDrawX, mainDrawY, mainDrawW, mainDrawH, 16);
    }

    pop();
  }

  _drawFoodItems() {
    this.foodItems.forEach((food) => {
      food.show();
    });
  }

  _handleFoodCollisions() {
    const snake = this.manager.snake;
    if (!snake || !snake.body || snake.body.length === 0) return;

    const { x: headWorldX, y: headWorldY } = this._getSnakeHeadWorldCell(snake);

    this.foodItems.forEach((food) => {
      if (food.collected) {
        food.respawnTimerMs = max(0, (food.respawnTimerMs ?? this.foodRespawnDelayMs) - deltaTime);
        if (food.respawnTimerMs <= 0) {
          // Respawn exakt an derselben Stelle.
          food.reset(food.gridX, food.gridY);
          food.respawnTimerMs = this.foodRespawnDelayMs;
        }
        return;
      }

      if (!food.collected && food.gridX === headWorldX && food.gridY === headWorldY) {
        food.collected = true;
        food.respawnTimerMs = this.foodRespawnDelayMs;
        snake.grow(1);
        snake.eatFood();
      }
    });
  }

  _drawScrollBar() {
    const barX = this._getScrollbarCenterX();
    const trackTop = this._getScrollTrackTop();
    const trackHeight = this._getScrollTrackHeight();
    const handleY = map(
      this.scrollOffset,
      0,
      max(1, this.scrollMaxOffset),
      trackTop,
      trackTop + trackHeight - this.scrollHandleHeight
    );

    const barCenterY = trackTop + trackHeight / 2;
    const handleCenterY = handleY + this.scrollHandleHeight / 2;

    imageMode(CENTER);
    noStroke();

    if (ScrollingScene.scrollBarImage) {
      image(ScrollingScene.scrollBarImage, barX, barCenterY, this.scrollBarWidth, trackHeight);
    } else {
      rectMode(CENTER);
      fill(55);
      rect(barX, barCenterY, this.scrollBarWidth, trackHeight, 10);
    }

    const showOpenHandle = this.handleOpenFlashRemainingMs > 0;
    const closedHandleImage = ScrollingScene.scrollHandleClosedImage ?? ScrollingScene.scrollHandleImage;
    const handleImage = showOpenHandle
      ? (ScrollingScene.scrollHandleImage ?? closedHandleImage)
      : closedHandleImage;

    if (handleImage) {
      image(handleImage, barX, handleCenterY, this.scrollBarWidth, this.scrollHandleHeight);
    } else {
      rectMode(CENTER);
      fill(205);
      rect(barX, handleCenterY, this.scrollBarWidth, this.scrollHandleHeight, 10);
    }
  }

  mousePressed(mx, my) {
    const contentMx = mx;
    const contentMy = my + this.scrollOffset;

    const snake = this.manager.snake;
    let clickedUiButton = false;

    this.sectionButtons.forEach((button) => {
      if (
        mouseButton === LEFT &&
        contentMx >= button.x && contentMx <= button.x + button.w &&
        contentMy >= button.y && contentMy <= button.y + button.h
      ) {
        if (typeof playButtonClickSfx === 'function') {
          playButtonClickSfx();
        }
        button.active = !button.active;
        clickedUiButton = true;
      }
    });

    const allPressed = this._allStepsCompleted();
    const mb = this.confirmButton;
    if (
      mouseButton === LEFT &&
      contentMx >= mb.x && contentMx <= mb.x + mb.w &&
      contentMy >= mb.y && contentMy <= mb.y + mb.h
    ) {
      if (typeof playButtonClickSfx === 'function') {
        playButtonClickSfx();
      }
      clickedUiButton = true;

      if (!allPressed) {
        this.mainNotVerifyFlashTimer = this.mainNotVerifyFlashDuration;
        return;
      }

      if (this.manager.scenes['reveal']) {
        if (typeof playWinSfx === 'function') {
          playWinSfx();
        }
        this.manager.scenes['reveal'].init();
        this.manager.switchTo('reveal');
      }

      return;
    }

    if (clickedUiButton) {
      return;
    }

    if (!snake) return;
    if (mouseButton === LEFT) {
      this._turnSnakeWithHandleCollision(snake, 'left');
    } else if (mouseButton === RIGHT) {
      this._turnSnakeWithHandleCollision(snake, 'right');
    }
  }

  _turnSnakeWithHandleCollision(snake, turnDirection) {
    const nextDirection = this._getTurnDirection(snake, turnDirection);
    if (!nextDirection) return;

    if (
      this._wouldDirectionHitHandle(snake, nextDirection.x, nextDirection.y) ||
      this._wouldDirectionHitUiObstacle(snake, nextDirection.x, nextDirection.y)
    ) {
      snake.triggerParallelCollision();
      return;
    }

    if (turnDirection === 'left') {
      snake.turnLeft();
    } else {
      snake.turnRight();
    }
  }

  _getTurnDirection(snake, turnDirection) {
    if (!snake) return null;

    if (turnDirection === 'left') {
      if (snake.xdir === 1 && snake.ydir === 0) return { x: 0, y: -1 };
      if (snake.xdir === 0 && snake.ydir === -1) return { x: -1, y: 0 };
      if (snake.xdir === -1 && snake.ydir === 0) return { x: 0, y: 1 };
      if (snake.xdir === 0 && snake.ydir === 1) return { x: 1, y: 0 };
    } else {
      if (snake.xdir === 1 && snake.ydir === 0) return { x: 0, y: 1 };
      if (snake.xdir === 0 && snake.ydir === 1) return { x: -1, y: 0 };
      if (snake.xdir === -1 && snake.ydir === 0) return { x: 0, y: -1 };
      if (snake.xdir === 0 && snake.ydir === -1) return { x: 1, y: 0 };
    }

    return null;
  }

  _getWrappedNextHead(snake, xdir, ydir) {
    let nextHeadX = snake.body[0].x + xdir;
    let nextHeadY = snake.body[0].y + ydir;

    if (nextHeadX < 0) nextHeadX = cols - 1;
    if (nextHeadX >= cols) nextHeadX = 0;
    if (nextHeadY < 0) nextHeadY = rows - 1;
    if (nextHeadY >= rows) nextHeadY = 0;

    return { x: nextHeadX, y: nextHeadY };
  }

  _getRectFromCell(cellX, cellY) {
    const left = cellX * scaleSize;
    const top = cellY * scaleSize;

    return {
      left,
      right: left + scaleSize,
      top,
      bottom: top + scaleSize
    };
  }

  _getScrollHandleRect() {
    const barX = this._getScrollbarCenterX();
    const trackTop = this._getScrollTrackTop();
    const trackHeight = this._getScrollTrackHeight();
    const handleTop = map(
      this.scrollOffset,
      0,
      max(1, this.scrollMaxOffset),
      trackTop,
      trackTop + trackHeight - this.scrollHandleHeight
    );

    return {
      left: barX - this.scrollBarWidth / 2,
      right: barX + this.scrollBarWidth / 2,
      top: handleTop,
      bottom: handleTop + this.scrollHandleHeight
    };
  }

  _getSnakeHeadWorldCell(snake) {
    const head = snake.body[0];
    return {
      x: round(head.x),
      y: round(head.y + this.scrollOffset / scaleSize)
    };
  }

  _wouldDirectionHitHandle(snake, xdir, ydir) {
    if (!snake || !snake.body || snake.body.length === 0) return false;

    // Vertikales Druecken von oben/unten soll Push ausloesen, nicht
    // die "DA KANN ICH NICHT LANG"-Blockade.
    if (xdir === 0) {
      return false;
    }

    const nextHead = this._getWrappedNextHead(snake, xdir, ydir);
    const nextRect = this._getRectFromCell(nextHead.x, nextHead.y);
    const handleRect = this._getScrollHandleRect();

    return (
      nextRect.right > handleRect.left &&
      nextRect.left < handleRect.right &&
      nextRect.bottom > handleRect.top &&
      nextRect.top < handleRect.bottom
    );
  }

  _isSnakeHeadingIntoUiObstacle(snake) {
    if (!snake || snake.isStunned || snake.moveProgress < 1 || snake.speed <= 0) {
      return false;
    }

    return this._wouldDirectionHitUiObstacle(snake, snake.xdir, snake.ydir);
  }

  _isSnakeHeadingIntoHandle(snake) {
    if (
      !snake ||
      snake.isStunned ||
      snake.moveProgress < 1
    ) {
      return false;
    }

    return this._wouldDirectionHitHandle(snake, snake.xdir, snake.ydir);
  }

  _wouldDirectionHitUiObstacle(snake, xdir, ydir) {
    if (!snake || !snake.body || snake.body.length === 0) return false;

    const nextHead = this._getWrappedNextHead(snake, xdir, ydir);
    const headRect = this._getRectFromCell(nextHead.x, nextHead.y);
    const obstacleRects = [
      ...this.sectionButtons,
      this.confirmButton
    ].filter(Boolean);

    return obstacleRects.some((obstacle) => {
      const obstacleLeft = obstacle.x;
      const obstacleRight = obstacle.x + obstacle.w;
      const obstacleTop = obstacle.y - this.scrollOffset;
      const obstacleBottom = obstacleTop + obstacle.h;

      return (
        headRect.right > obstacleLeft &&
        headRect.left < obstacleRight &&
        headRect.bottom > obstacleTop &&
        headRect.top < obstacleBottom
      );
    });
  }

  _isPointInsideRect(px, py, rect) {
    if (!rect) return false;

    return (
      px >= rect.x &&
      px <= rect.x + rect.w &&
      py >= rect.y &&
      py <= rect.y + rect.h
    );
  }

  _drawStatusMessage() {
    if (!this.statusMessage || this.statusMessageTimer <= 0) return;

    push();
    rectMode(CENTER);
    noStroke();
    fill(0, 0, 0, 190);
    rect(width / 2, scaleSize * 2.2, width - scaleSize * 3, 82, 14);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text(this.statusMessage, width / 2, scaleSize * 2.2);
    pop();
  }

  _allStepsCompleted() {
    return this.sectionButtons.length > 0 && this.sectionButtons.every((button) => button.active);
  }

  _getViewportHeight() {
    return height;
  }

  _getBackgroundHeight() {
    const bg = ScrollingScene.agbImage;
    if (bg && bg.width > 0 && bg.height > 0) {
      return width * (bg.height / bg.width);
    }

    return this._getViewportHeight() * 3;
  }

  _getScrollTrackTop() {
    return scaleSize * 3;
  }

  _getScrollTrackHeight() {
    return height - scaleSize * 6;
  }

  _getScrollbarCenterCell() {
    return cols - 2;
  }

  _getScrollbarCenterX() {
    return this._getScrollbarCenterCell() * scaleSize + scaleSize / 2;
  }
}