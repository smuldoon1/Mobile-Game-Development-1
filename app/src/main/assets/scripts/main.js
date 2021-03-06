var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var playerRunning = document.getElementById('playerRunning');
var playerJumping = document.getElementById('playerJumping');
var playerDeath = document.getElementById('playerDeath');
var playerAttack = document.getElementById('playerAttack');
var enemyIdle = document.getElementById('enemyIdle');
var enemyDeath = document.getElementById('enemyDeath');
var enemyAttack = document.getElementById('enemyAttack');
var fireballSprite = document.getElementById('fireball');
var healthPowerup = document.getElementById('healthPowerup');
var rapidFirePowerup = document.getElementById('rapidFirePowerup');
var healthbarEmpty = document.getElementById('healthbarEmpty');
var healthbarNearDeath = document.getElementById('healthbarNearDeath');
var healthbarDamaged = document.getElementById('healthbarDamaged');
var healthbarFull = document.getElementById('healthbarFull');
var buildingStart = document.getElementById('buildingStart');
var building48a = document.getElementById('building48a');
var building48b = document.getElementById('building48b');
var building48c = document.getElementById('building48c');
var building48d = document.getElementById('building48d');
var building16a = document.getElementById('building16a');
var building16b = document.getElementById('building16b');
var building16c = document.getElementById('building16c');
var building64a = document.getElementById('building64a');
var building64b = document.getElementById('building64b');
var buildingCrane = document.getElementById('buildingCrane');
var buildingPallet = document.getElementById('buildingPallet');
var background = document.getElementById('background');
var titleScreen = document.getElementById('titleScreen');
var endScreen = document.getElementById('endScreen');

var jumpSFX = document.getElementById('jumpSFX');
var doubleJumpSFX = document.getElementById('doubleJumpSFX');
var playerDamagedSFX = document.getElementById('playerDamagedSFX');
var playerDeathSFX = document.getElementById('playerDeathSFX');
var playerAttackSFX = document.getElementById('playerAttackSFX');
var enemyDeathSFX = document.getElementById('enemyDeathSFX');
var powerupSFX = document.getElementById('powerupSFX');
var gameMusic = document.getElementById('gameMusic');
var menuMusic = document.getElementById('menuMusic');

var previousDate;
var deltaTime;

var backgroundScroll;
var backgroundWidth;

var score;

var maxJumpHoldTime;
var speedMultiplier;

var gravity;
var initialVelocity;
var initialJumpForce;
var jumpHoldForce;

var scene;
var gameLoopInterval;

var entities = [];
var player;

function init() {
    ctx.imageSmoothingEnabled = false; // Ensures sprites are not drawn blurry

    previousDate = performance.now(); // Initialise the date used to keep track of time

    // Setup building array and weight values
    Building.setup();

    // Setup background
    backgroundScroll = 0;
    backgroundWidth = canvas.width / (canvas.height / background.height);

    // Add touch event listeners
    document.addEventListener("touchstart", Input.touchStartHandler, false);
    document.addEventListener("touchend", Input.touchEndHandler, false);

    requestAnimationFrame(render); // Start drawing to the canvas
    setScene("main_menu"); // Start the game in the main menu scene

    gameLoopInterval = setInterval(gameLoop, 10); // Starts the game loop so the update functions are called every 10 milliseconds

    menuMusic.play(); // The game starts with menu music playing
}

// Clear all entities and the player, create gap before first building
function resetEntities() {
    entities = [];
    player = null;
    Building.timeSinceLastBuilding = 1000;
}

function startGame() {
    resetEntities();

    score = -29; // Start score in the negative so the player will get a score of 0 if they fall straight away

    jumpHeldTime = 0;
    maxJumpHoldTime = 400;
    speedMultiplier = 0.85;

    gravity = 8.88 / canvas.height;
    initialVelocity = 296 / canvas.height;
    initialJumpForce = -3350 / canvas.height;
    jumpHoldForce = 100 / canvas.height;

    // Spawn the player
    player = new Player(
        0,
        new Rect(canvas.width * 0.1, canvas.height * 0.5 - canvas.width * 0.2, canvas.width * 0.2, canvas.width * 0.2),
        new Sprite(playerRunning, 32, 32, 0, 0, 1, 1, 100, 6, true),
        new Sprite(playerJumping, 31, 33, 0, 0, 1, 1, 100, 4, false),
        new Sprite(playerAttack, 36, 32, 0, 0, 1, 1, 100, 6, false),
        new Sprite(playerDeath, 23, 35, 0, 0, 0.75, 1, 150, 6, false)
    );
    player.setDrawOrder(100); // Give player an arbitrarily high draw order to make sure it is drawn in front of other entities

    // Spawn the building the player initially starts on top of
    let startBuilding = new Building(
        -720 / canvas.width,
        new Rect(0, canvas.height * 0.5, canvas.width * 1.5, canvas.height),
        new Sprite(buildingStart, 90, 256, 0, -canvas.height, 1, 2, 0, 0, false)
    );
    startBuilding.setDrawOrder(105);

    gameMusic.play();
    stopMusic(menuMusic);
}

function update() {

    // Animate and update each entity
    for (var i = 0; i < entities.length; i++) {
        entities[i].animationTick();
        entities[i].update();
        entities[i].checkToDestroy();
    }

    if (scene == "game_level") {
        // Building spawning
        Building.attemptSpawn();

        // While the player is alive, the background should scroll and the score should increment
        if (player.isAlive) {
            backgroundScroll += deltaTime * 0.025 * speedMultiplier;
            if (backgroundScroll > background.width * 0.5)
                backgroundScroll -= background.width * 0.5;

            score += deltaTime * 0.01 * speedMultiplier;
            speedMultiplier += deltaTime * 0.000003;
            if (speedMultiplier > 1.6)
                speedMultiplier = 1.6;
        }

        // Update powerup timers
        Powerup.updateTimers(deltaTime);
    }
}

// Handles rendering of sprites and UI elements
function render() {

    // Clear the canvas at the beginning of each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    ctx.drawImage(background, backgroundScroll, 0, backgroundWidth, background.height, 0, 0, canvas.width, canvas.height);

    // Cycle through all entities and draw them
    for (let i = 0; i < entities.length; i++) {
        entities[i].draw();
    }

    // If the game is in the game level scene, draw players health and score
    if (scene == "game_level") {
        // Get the correct healthbar image for the players health and draw it on the canvas
        let healthbar = getHealthbarImage();
        ctx.drawImage(healthbar, canvas.width - canvas.width * 0.45 - 20, 20, canvas.width * 0.45, canvas.width * 0.12);

        // Set up the custom font and draw the players score on the canvas
        let fontSize = getFontSize(40);
        ctx.font = fontSize + 'px Score_Font';
        ctx.fillStyle = '#fff133';
        ctx.fillText("score: " + Math.max(0, Math.round(score)), canvas.width * 0.05, fontSize * 2.5);
    }

    // RequestAnimationFrame used instead to stop the flickering caused by calling the render function with setInterval();
    requestAnimationFrame(render);
}

// Called at a set interval to update the games entities and the deltaTime
function gameLoop() {

    // deltaTime is used to maintain more accurate timing regardless of any delay of setInterval being called
    let dateNow = performance.now();
    deltaTime = dateNow - previousDate;
    previousDate = dateNow;

    update();
}

// Set the game scene
function setScene(sceneName) {
    scene = sceneName;
    switch (sceneName) {
        case "main_menu":
            mainMenuScreen();
            break;
        case "game_level":
            startGame(); // Sets up game variables
            break;
        case "game_over":
            gameOverScreen();
            break;
        default:
            console.error("Invalid scene name: " + sceneName);
            break;
    }
}

// Show title screen and game instructions
function mainMenuScreen() {
    resetEntities();
    backgroundScroll = background.width * 0.175;
    new Entity(0, new Rect(0, 0, canvas.width, canvas.height), new Sprite(titleScreen, 1080, 2220, 0, 0, 1, 1, 0, 0, false));
}

// Show game over screen and the players score, set a new high score if necessary
function gameOverScreen() {
    new Entity(0, new Rect(0, 0, canvas.width, canvas.height), new Sprite(endScreen, 1080, 2220, 0, 0, 1, 1, 0, 0, false));
    if (trySetHighscore())
        new Text(0, new Rect(canvas.width * 0.275, canvas.height * 0.3, 0, 0), "new hi-score!", "#ffffff", 40, 0, 10000000);
    new Text(0, new Rect(canvas.width * 0.1, canvas.height * 0.4, 0, 0), "score: " + Math.max(0, Math.round(score)), "#fff703", 60, 0, 10000000);
    new Text(0, new Rect(canvas.width * 0.1, canvas.height * 0.5, 0, 0), "hi-score: " + getHighScore(), "#6c33e8", 60, 0, 10000000);

    // Stop the game msuic and start playing menu music again
    menuMusic.play();
    stopMusic(gameMusic);
}

// Check if the score is higher than the high score, if so then set it as the new high score
// Returns true if there is a new high score
function trySetHighscore() {
    if (score > getHighScore()) {
        localStorage.setItem("highscore", JSON.stringify(Math.max(0, Math.round(score))));
        return true;
    }
    return false;
}

// Get the highscore saved to the device
function getHighScore() {
    if (localStorage.getItem("highscore") != null)
        return localStorage.getItem("highscore");
    return 0;
}

// Stop an audio object by pausing it and resetting the duration back to 0
function stopMusic(music) {
    music.pause();
    music.currentTime = 0;
}

// Get the Class name of an object
function getType(object) {
    return object.constructor.name;
}

// Get the correct healthbar image to display
function getHealthbarImage() {
    switch (player.health) {
        case 0:
            return healthbarEmpty;
        case 1:
            return healthbarNearDeath;
        case 2:
            return healthbarDamaged;
        default:
            return healthbarFull;
    }
}

// Get an expected font size for the canvas size
function getFontSize(relativeSize) {
    return canvas.width * 0.001 * relativeSize;
}

// Remove an object from an array
function removeFromArray(array, object) {
    array.splice(array.indexOf(object), 1);
}

// Sort entities by their draw order
function compareDrawOrder(a, b) {
    return a.drawOrder - b.drawOrder;
}

init(); // Initialise the game