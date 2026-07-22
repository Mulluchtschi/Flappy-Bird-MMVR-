let scaleSize;
let cols = 18;
let rows = 32;
let sceneManager;
const baseWidth = 1080;
const baseHeight = 1920;
let pixeloidFont;
let flappyBirdLoop = null;
let flappyBirdFadeTimeout = null;
let snakeMusicLoop = null;
let snakeMusicFadeTimeout = null;
let auaSfx = null;
let notThisWaySfx = null;
let buttonClickSfx = null;
let appleEatSfx = null;
let gameOverSfx = null;
let winSfx = null;
let loadingBarPushSfxPool = [];
let loadingBarPushSfxPoolIndex = 0;
let snakeTalkingLoop = null;
let captchaTalkingLoop = null;
let shakingSfxPool = [];
let shakingSfxPoolIndex = 0;
let shakingLoop = null;
let buttonClickSfxLoadStarted = false;
let lastAuaSfxAtMs = 0;
let lastNotThisWaySfxAtMs = 0;
let lastButtonClickSfxAtMs = 0;
let lastAppleEatSfxAtMs = 0;
let lastWinSfxAtMs = 0;
let snakeTalkingFadeTimeout = null;
let captchaTalkingFadeTimeout = null;
let shakingFadeTimeout = null;
const FLAPPY_BIRD_VOLUME = 0.32;
const SNAKE_MUSIC_VOLUME = 0.25;
const SNAKE_TALKING_VOLUME = 0.42;
const CAPTCHA_TALKING_VOLUME = 0.42;
const SHAKING_VOLUME = 0.95;
const MUSIC_FADE_IN_SEC = 0.35;
const MUSIC_FADE_OUT_MS = 420;
const AUA_SFX_COOLDOWN_MS = 180;
const NOT_THIS_WAY_SFX_COOLDOWN_MS = 180;
const BUTTON_CLICK_SFX_COOLDOWN_MS = 80;
const APPLE_EAT_SFX_COOLDOWN_MS = 80;
const WIN_SFX_COOLDOWN_MS = 120;
const BUTTON_CLICK_SFX_PATH = 'assets/buttonsClick.mp3';
const APPLE_EAT_SFX_PATH = 'assets/appelEat.mp3';
const GAME_OVER_SFX_PATH = 'assets/GameOver.mp3';
const WIN_SFX_PATH = 'assets/win.mp3';
const LOADING_BAR_PUSH_SFX_PATH = 'assets/loadingbardush.mp3';
const SNAKE_TALKING_SFX_PATH = 'assets/snakeTalking.mp3';
const CAPTCHA_TALKING_SFX_PATH = 'assets/CaptchaTalking.mp3';
const SHAKING_SFX_PATH = 'assets/shakingsound.mp3';
const LOADING_BAR_PUSH_SFX_POOL_SIZE = 4;
const SHAKING_SFX_POOL_SIZE = 3;

function preload() {
  pixeloidFont = loadFont('assets/PixeloidSans-lxa3y.ttf');
  // Lade Sprechblasen-Bilder direkt in die DialogBox Klasse
  DialogBox.speechBubbles.long = loadImage('assets/speechbubble_long.png');
  DialogBox.speechBubbles.short = loadImage('assets/speechbubble_short.png');
  Snake.headImage = loadImage('assets/snakehead_closed.png');
  Snake.headImageOpen = loadImage('assets/snakehead_open.png');
  Food.appleImage = loadImage('assets/apple.png');
  IntroScene.rollingCircleImage = loadImage('assets/captcha_close.png');
  IntroScene.rollingCircleImageOpen = loadImage('assets/captcha_open.png');
  IntroScene.revealOverlayImage = loadImage('assets/AGBintro.png');
  ScrollingScene.backgroundImage = loadImage('assets/scrolling background.png');
  ScrollingScene.agbImage = loadImage('assets/AGB.png');
  ScrollingScene.checkboxOffImage = loadImage('assets/checkbox_off.png');
  ScrollingScene.checkboxOnImage = loadImage('assets/checkbox_on.png');
  ScrollingScene.mainCheckboxOffImage = loadImage('assets/maincheckbox_off.png');
  ScrollingScene.mainCheckboxOnImage = loadImage('assets/maincheckbox_on.png');
  ScrollingScene.mainCheckboxNotVerifyImage = loadImage('assets/maincheckbox_notverify.png');
  ScrollingScene.scrollBarImage = loadImage('assets/scrollingbar.png');
  ScrollingScene.scrollHandleClosedImage = loadImage('assets/handle close .png');
  ScrollingScene.scrollHandleImage = loadImage('assets/handle.png');
  RevealScene.backgroundImage = loadImage('assets/revealbackgroundP1.png');
  RevealScene.backgroundImageClosed = loadImage('assets/revealbackgroundP1close.png');
  RevealScene.backgroundImageP2 = loadImage('assets/revealbackgroundP2.png');
  RevealScene.backgroundImageClosedP2 = loadImage('assets/revealbackgroundP2close.png');
  RevealScene.stoneImage = loadImage('assets/stone.png');
  RevealScene.keyboardButtonImage = loadImage('assets/keyboardbutton.png');
  RevealScene.verifyButtonImage = loadImage('assets/verifybutton.png');
  RevealScene.keyboardOverlayImage = loadImage('assets/keyboardoverlay.png');
  GridScene.backgroundImageClosed = loadImage('assets/gridbackgroundClose.png');
  GridScene.backgroundImageOpen = loadImage('assets/gridbackgroundOpen.png');
  GridScene.goldenAppleImage = loadImage('assets/goldenApple.png');
  GridScene.verifyButtonSmallImage = loadImage('assets/verifybuttonSmall.png');
  GridScene.prisonImage = loadImage('assets/prison.png');
  GridScene.snakePrisonImage = loadImage('assets/snakeprison1.png');
  GridScene.snakePrisonImage2 = loadImage('assets/snakeprison2.png');
  GridScene.snakePrisonImage3 = loadImage('assets/snakeprison3.png');
  GridScene.pictureBoxImage = loadImage('assets/picturebox.png');
  OutroScene.backgroundImage = loadImage('assets/outroBcakround.png.png');
  OutroScene.foregroundImage = loadImage('assets/outroVorground.png');
  OutroScene.errorScreenImage = loadImage('assets/errorscreen.png');
  GameOverController.jesusImage = loadImage('assets/Jesus.png');
  LoadingScene.barImage = loadImage('assets/loadingbar.png');
  flappyBirdLoop = loadSound('assets/FlappyBird.mp3');
  snakeMusicLoop = loadSound('assets/SnakeMusik.mp3');
  auaSfx = loadSound('assets/Aua.mp3');
  notThisWaySfx = loadSound('assets/notThisWay.mp3');
  buttonClickSfx = loadSound(BUTTON_CLICK_SFX_PATH);
  appleEatSfx = loadSound(APPLE_EAT_SFX_PATH);
  gameOverSfx = loadSound(GAME_OVER_SFX_PATH);
  winSfx = loadSound(WIN_SFX_PATH);
  loadingBarPushSfxPool = Array.from(
    { length: LOADING_BAR_PUSH_SFX_POOL_SIZE },
    () => loadSound(LOADING_BAR_PUSH_SFX_PATH)
  );
  snakeTalkingLoop = loadSound(SNAKE_TALKING_SFX_PATH);
  captchaTalkingLoop = loadSound(CAPTCHA_TALKING_SFX_PATH);
  shakingSfxPool = Array.from(
    { length: SHAKING_SFX_POOL_SIZE },
    () => loadSound(SHAKING_SFX_PATH)
  );
  shakingLoop = loadSound(SHAKING_SFX_PATH);
}

function initButtonClickSfx() {
  if (buttonClickSfxLoadStarted || buttonClickSfx) return;
  buttonClickSfxLoadStarted = true;

  // Nicht-blockierend laden, damit ein Asset-Problem den Spielstart nicht stoppt.
  buttonClickSfx = loadSound(
    BUTTON_CLICK_SFX_PATH,
    () => {
      // Erfolgreich geladen.
    },
    () => {
      buttonClickSfx = null;
      console.warn('Button Click SFX konnte nicht geladen werden.');
    }
  );
}

function playButtonClickSfx() {
  if (!buttonClickSfx) {
    initButtonClickSfx();
    return;
  }

  if (!buttonClickSfx || !buttonClickSfx.isLoaded()) return;
  const nowMs = millis();
  if (nowMs - lastButtonClickSfxAtMs < BUTTON_CLICK_SFX_COOLDOWN_MS) return;
  lastButtonClickSfxAtMs = nowMs;
  buttonClickSfx.setVolume(0.6);
  buttonClickSfx.playMode('restart');
  buttonClickSfx.play();
}

function playAppleEatSfx() {
  if (!appleEatSfx || !appleEatSfx.isLoaded()) return;
  const nowMs = millis();
  if (nowMs - lastAppleEatSfxAtMs < APPLE_EAT_SFX_COOLDOWN_MS) return;
  lastAppleEatSfxAtMs = nowMs;
  appleEatSfx.setVolume(0.75);
  appleEatSfx.playMode('restart');
  appleEatSfx.play();
}

function playGameOverSfx() {
  if (!gameOverSfx || !gameOverSfx.isLoaded()) return;
  gameOverSfx.setVolume(0.85);
  gameOverSfx.playMode('restart');
  gameOverSfx.play();
}

function playWinSfx() {
  if (!winSfx || !winSfx.isLoaded()) return;
  const nowMs = millis();
  if (nowMs - lastWinSfxAtMs < WIN_SFX_COOLDOWN_MS) return;
  lastWinSfxAtMs = nowMs;
  winSfx.setVolume(0.85);
  winSfx.playMode('restart');
  winSfx.play();
}

function playLoadingBarPushSfx() {
  if (!loadingBarPushSfxPool || loadingBarPushSfxPool.length === 0) return;

  const sound = loadingBarPushSfxPool[loadingBarPushSfxPoolIndex];
  loadingBarPushSfxPoolIndex = (loadingBarPushSfxPoolIndex + 1) % loadingBarPushSfxPool.length;

  if (!sound || !sound.isLoaded()) return;

  sound.setVolume(0.85);
  sound.playMode('restart');
  sound.play();
}

function playShakingSfx(volume = SHAKING_VOLUME) {
  if (!shakingSfxPool || shakingSfxPool.length === 0) return;

  const sound = shakingSfxPool[shakingSfxPoolIndex];
  shakingSfxPoolIndex = (shakingSfxPoolIndex + 1) % shakingSfxPool.length;

  if (!sound || !sound.isLoaded()) return;

  sound.setVolume(volume);
  sound.playMode('restart');
  sound.play();
}

function playAuaSfx() {
  if (!auaSfx || !auaSfx.isLoaded()) return;
  const nowMs = millis();
  if (nowMs - lastAuaSfxAtMs < AUA_SFX_COOLDOWN_MS) return;
  lastAuaSfxAtMs = nowMs;
  auaSfx.setVolume(0.9);
  auaSfx.playMode('restart');
  auaSfx.play();
}

function playNotThisWaySfx() {
  if (!notThisWaySfx || !notThisWaySfx.isLoaded()) return;
  const nowMs = millis();
  if (nowMs - lastNotThisWaySfxAtMs < NOT_THIS_WAY_SFX_COOLDOWN_MS) return;
  lastNotThisWaySfxAtMs = nowMs;
  notThisWaySfx.setVolume(0.9);
  notThisWaySfx.playMode('restart');
  notThisWaySfx.play();
}

function startMusicWithFade(track, targetVolume, timeoutKey, restartFromBeginning = false) {
  if (!track || !track.isLoaded()) return;

  const audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state !== 'running') {
    userStartAudio();
    return;
  }

  if (timeoutKey.value !== null) {
    clearTimeout(timeoutKey.value);
    timeoutKey.value = null;
  }

  if (restartFromBeginning && track.isPlaying()) {
    track.stop();
  }

  if (!track.isPlaying()) {
    track.setVolume(0);
    track.loop();
  }

  track.setVolume(targetVolume, MUSIC_FADE_IN_SEC);
}

function stopMusicWithFade(track, targetVolume, timeoutKey, durationMs = MUSIC_FADE_OUT_MS) {
  if (!track || !track.isLoaded()) return;

  if (timeoutKey.value !== null) {
    return;
  }

  if (!track.isPlaying()) {
    track.setVolume(targetVolume);
    return;
  }

  const safeDurationMs = max(0, durationMs);
  track.setVolume(0, safeDurationMs / 1000);
  timeoutKey.value = setTimeout(() => {
    if (track && track.isLoaded() && track.isPlaying()) {
      track.stop();
    }
    if (track && track.isLoaded()) {
      track.setVolume(targetVolume);
    }
    timeoutKey.value = null;
  }, safeDurationMs + 60);
}

function startFlappyBirdLoop(restartFromBeginning = false) {
  const timeoutRef = { value: flappyBirdFadeTimeout };
  startMusicWithFade(
    flappyBirdLoop,
    FLAPPY_BIRD_VOLUME,
    timeoutRef,
    restartFromBeginning
  );
  flappyBirdFadeTimeout = timeoutRef.value;
}

function stopFlappyBirdLoop() {
  const timeoutRef = { value: flappyBirdFadeTimeout };
  stopMusicWithFade(flappyBirdLoop, FLAPPY_BIRD_VOLUME, timeoutRef, MUSIC_FADE_OUT_MS);
  flappyBirdFadeTimeout = timeoutRef.value;
}

function fadeOutFlappyBirdLoop(durationMs = 1800) {
  const timeoutRef = { value: flappyBirdFadeTimeout };
  stopMusicWithFade(flappyBirdLoop, FLAPPY_BIRD_VOLUME, timeoutRef, durationMs);
  flappyBirdFadeTimeout = timeoutRef.value;
}

function startSnakeMusicLoop(restartFromBeginning = false) {
  const timeoutRef = { value: snakeMusicFadeTimeout };
  startMusicWithFade(
    snakeMusicLoop,
    SNAKE_MUSIC_VOLUME,
    timeoutRef,
    restartFromBeginning
  );
  snakeMusicFadeTimeout = timeoutRef.value;
}

function stopSnakeMusicLoop() {
  const timeoutRef = { value: snakeMusicFadeTimeout };
  stopMusicWithFade(snakeMusicLoop, SNAKE_MUSIC_VOLUME, timeoutRef, MUSIC_FADE_OUT_MS);
  snakeMusicFadeTimeout = timeoutRef.value;
}

function startSnakeTalkingLoop(restartFromBeginning = false) {
  const timeoutRef = { value: snakeTalkingFadeTimeout };
  startMusicWithFade(
    snakeTalkingLoop,
    SNAKE_TALKING_VOLUME,
    timeoutRef,
    restartFromBeginning
  );
  snakeTalkingFadeTimeout = timeoutRef.value;
}

function stopSnakeTalkingLoop() {
  const timeoutRef = { value: snakeTalkingFadeTimeout };
  stopMusicWithFade(snakeTalkingLoop, SNAKE_TALKING_VOLUME, timeoutRef, 180);
  snakeTalkingFadeTimeout = timeoutRef.value;
}

function startCaptchaTalkingLoop(restartFromBeginning = false) {
  const timeoutRef = { value: captchaTalkingFadeTimeout };
  startMusicWithFade(
    captchaTalkingLoop,
    CAPTCHA_TALKING_VOLUME,
    timeoutRef,
    restartFromBeginning
  );
  captchaTalkingFadeTimeout = timeoutRef.value;
}

function stopCaptchaTalkingLoop() {
  const timeoutRef = { value: captchaTalkingFadeTimeout };
  stopMusicWithFade(captchaTalkingLoop, CAPTCHA_TALKING_VOLUME, timeoutRef, 180);
  captchaTalkingFadeTimeout = timeoutRef.value;
}

function startShakingLoop(restartFromBeginning = false) {
  const timeoutRef = { value: shakingFadeTimeout };
  startMusicWithFade(
    shakingLoop,
    SHAKING_VOLUME,
    timeoutRef,
    restartFromBeginning
  );
  shakingFadeTimeout = timeoutRef.value;
}

function stopShakingLoop() {
  if (shakingSfxPool && shakingSfxPool.length > 0) {
    shakingSfxPool.forEach((sound) => {
      if (!sound || !sound.isLoaded()) return;
      if (sound.isPlaying()) {
        sound.stop();
      }
      sound.setVolume(SHAKING_VOLUME);
    });
  }

  if (!shakingLoop || !shakingLoop.isLoaded()) return;

  if (shakingFadeTimeout !== null) {
    clearTimeout(shakingFadeTimeout);
    shakingFadeTimeout = null;
  }

  if (shakingLoop.isPlaying()) {
    shakingLoop.stop();
  }

  shakingLoop.setVolume(SHAKING_VOLUME);
}

function ensureAudioContextStarted() {
  const audioCtx = getAudioContext();
  if (audioCtx && audioCtx.state !== 'running') {
    userStartAudio();
  }

  // Start sofort nach echter User-Interaktion, falls wir in Menu oder Loading sind.
  const currentSceneName = sceneManager?.currentName;
  if (currentSceneName === 'menu') {
    startFlappyBirdLoop(false);
  }

  if (currentSceneName === 'loading') {
    const loadingScene = sceneManager?.current;
    const loadingAlreadyStopped = !!loadingScene?.waitingAtStopPercent;
    if (!loadingAlreadyStopped) {
      startFlappyBirdLoop(false);
    }
  }
}

function syncFlappyBirdMusicState() {
  if (!sceneManager) return;

  const isGameOverBlocking = !!sceneManager?.gameOverController?.isBlocking?.();
  if (isGameOverBlocking) {
    stopFlappyBirdLoop();
    return;
  }
}

function syncSnakeMusicState() {
  if (!sceneManager) return;

  const currentScene = sceneManager.currentName;
  const isGameOverBlocking = !!sceneManager?.gameOverController?.isBlocking?.();
  const shouldPlaySnakeMusic = !isGameOverBlocking && (
    currentScene === 'scrolling'
    || currentScene === 'reveal'
    || currentScene === 'grid'
  );

  if (shouldPlaySnakeMusic) {
    startSnakeMusicLoop(false);
    return;
  }

  stopSnakeMusicLoop();
}

function syncSnakeTalkingState() {
  if (!sceneManager) return;

  const activeSnake = sceneManager.current?.outroSnake ?? sceneManager.snake;
  const isGameOverBlocking = !!sceneManager?.gameOverController?.isBlocking?.();
  const hasCollisionSpeech = !!activeSnake && (
    activeSnake.dialog1Timer > 0
    || activeSnake.dialog2Timer > 0
    || activeSnake.collisionDialog1?.isVisible
    || activeSnake.collisionDialog2?.isVisible
  );
  const shouldPlayTalking = !!activeSnake
    && !isGameOverBlocking
    && !!activeSnake.isTalking
    && !hasCollisionSpeech;

  if (shouldPlayTalking) {
    startSnakeTalkingLoop(false);
    return;
  }

  stopSnakeTalkingLoop();
}

function syncCaptchaTalkingState() {
  if (!sceneManager) return;

  const isGameOverBlocking = !!sceneManager?.gameOverController?.isBlocking?.();
  const introScene = sceneManager.currentName === 'intro' ? sceneManager.current : null;
  const shouldPlayTalking = !isGameOverBlocking
    && !!introScene
    && typeof introScene.isCircleSpeakerVisible === 'function'
    && introScene.isCircleSpeakerVisible();

  if (shouldPlayTalking) {
    startCaptchaTalkingLoop(false);
    return;
  }

  stopCaptchaTalkingLoop();
}

function syncIntroShakingState() {
  if (!sceneManager) return;

  const isGameOverBlocking = !!sceneManager?.gameOverController?.isBlocking?.();
  const introScene = sceneManager.currentName === 'intro' ? sceneManager.current : null;
  const gridScene = sceneManager.currentName === 'grid' ? sceneManager.current : null;
  const shouldPlayIntroLoop = !isGameOverBlocking
    && !!introScene
    && !!introScene.introActive
    && introScene.shakeIntensity > 0.05;

  const shouldPlayGridLoop = !isGameOverBlocking
    && !!gridScene
    && gridScene.curtainState === 'shake';

  if (shouldPlayIntroLoop || shouldPlayGridLoop) {
    startShakingLoop(false);
    return;
  }

  stopShakingLoop();
}

function setup() {
  pixelDensity(1);
  frameRate(60);
  createCanvas(baseWidth, baseHeight);

  // Kontextmenü (rechte Maustaste) deaktivieren
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  scaleSize = min(
    floor(baseWidth / cols),
    floor(baseHeight / rows)
  );
  textAlign(CENTER, CENTER);
  textSize(52);
  textFont(pixeloidFont);

  sceneManager = new SceneManager();
  sceneManager.register('menu', new MenuScene());
  sceneManager.register('loading', new LoadingScene());
  sceneManager.register('playing', new PlayingScene());
  sceneManager.register('intro', new IntroScene());
  sceneManager.register('scrolling', new ScrollingScene());
  sceneManager.register('reveal', new RevealScene());
  sceneManager.register('grid', new GridScene());
  sceneManager.register('outro', new OutroScene());
  sceneManager.switchTo("menu"); // Starte im Menu

  initButtonClickSfx();
}

function draw() {
  background(30);
  if (sceneManager?.currentName !== 'scrolling') {
    drawGrid();
  }
  textFont(pixeloidFont);
  sceneManager.update();
  syncFlappyBirdMusicState();
  syncSnakeMusicState();
  sceneManager.draw();
  syncSnakeTalkingState();
  syncCaptchaTalkingState();
  syncIntroShakingState();
  if (adminOpen) {
    drawAdminOverlay();
  }
}

// Hintergrundraster zeichnen
function drawGrid() {
  stroke(70);
  strokeWeight(1);
  for (let x = 0; x <= width; x += scaleSize)  line(x, 0, x, height);
  for (let y = 0; y <= height; y += scaleSize) line(0, y, width, y);
  noStroke();
}

function keyPressed() {
  ensureAudioContextStarted();

  if (key === 'a' || key === 'A') {
    toggleAdmin();
    return;
  }

  if (adminOpen) {
    // Admin: + zum Körper dazufügen
    if (key === '+' || key === '=') {
      if (sceneManager.snake) {
        sceneManager.snake.grow(1);
        console.log("Admin: +1 body part added!");
      }
      return;
    }

    if (key === '1') { sceneManager.switchTo('menu'); return; }
    if (key === '2') { sceneManager.switchTo('loading'); return; }
    if (key === '3') { sceneManager.switchTo('playing'); return; }
    if (key === '4') { sceneManager.switchTo('scrolling'); return; }
    if (key === '5') {
      sceneManager.scenes['reveal'].init();
      sceneManager.switchTo('reveal');
      return;
    }
    if (key === '6') { sceneManager.switchTo('grid'); return; }
  }

  sceneManager.keyPressed(key, keyCode);
}

function mousePressed() {
  ensureAudioContextStarted();
  sceneManager.mousePressed(mouseX, mouseY, mouseButton);
}

function mouseReleased() {
  sceneManager.mouseReleased(mouseX, mouseY);
}

function touchStarted() {
  ensureAudioContextStarted();
  return false;
}