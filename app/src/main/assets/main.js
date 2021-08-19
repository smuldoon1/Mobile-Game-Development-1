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
var background = document.getElementById('background');

var jumpSFX = document.getElementById('jumpSFX');
var doubleJumpSFX = document.getElementById('doubleJumpSFX');
var playerDamagedSFX = document.getElementById('playerDamagedSFX');
var playerDeathSFX = document.getElementById('playerDeathSFX');
var playerAttackSFX = document.getElementById('playerAttackSFX');
var enemyDeathSFX = document.getElementById('enemyDeathSFX');
var powerupSFX = document.getElementById('powerupSFX');
var music = document.getElementById('gameMusic');

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

var timeSinceLastBuilding;
var maxTimeSinceLastBuilding;
var buildingGap;

var scene;
var gameLoopInterval;

var player;
var enemies = [];
var fireballs = [];
var buildings = [];

var entities = [];

function init() {
    ctx.imageSmoothingEnabled = false; // Ensures sprites are not drawn blurry

    previousDate = performance.now(); // Initialise the date used to keep track of time

    // Setup background
    backgroundScroll = 0;
    backgroundWidth = canvas.width / (canvas.height / background.height);

    // Add touch event listeners
    document.addEventListener("touchstart", Input.touchStartHandler, false);
    document.addEventListener("touchend", Input.touchEndHandler, false);

    requestAnimationFrame(render); // Start drawing to the canvas
    setScene("main_menu"); // Start the game in the main menu scene

    gameLoopInterval = setInterval(gameLoop, 10); // Starts the game loop so the update functions are called every 10 milliseconds
}

function resetEntities() {
    player = null;

    enemies = [];
    fireballs = [];
    buildings = [];

    entities = [];
}

function startGame() {
    resetEntities();
    avgDeltaTime = 0;
    counter = 0;

    score = 0;

    jumpHeldTime = 0;
    maxJumpHoldTime = 400;
    speedMultiplier = 0.9;

    gravity = 8.88 / canvas.height;
    initialVelocity = 296 / canvas.height;
    initialJumpForce = -3350 / canvas.height;
    jumpHoldForce = 100 / canvas.height;

    timeSinceLastBuilding = 1080000 / canvas.width;
    maxTimeSinceLastBuilding = 1620000 / canvas.width;
    buildingGap = 972000 / canvas.width;

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
    buildings.push(startBuilding);

    music.play();
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
            speedMultiplier += deltaTime * 0.0000025;
            if (speedMultiplier > 1.5)
                speedMultiplier = 1.5;
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

    if (scene == "game_level") {
        // Get the correct healthbar image for the players health and draw it on the canvas
        let healthbar = getHealthbarImage();
        ctx.drawImage(healthbar, canvas.width - canvas.width * 0.45 - 20, 20, canvas.width * 0.45, canvas.width * 0.12);

        // Set up the custom font and draw the players score on the canvas
        let fontSize = getFontSize(40);
        ctx.font = fontSize + 'px Score_Font';
        ctx.fillStyle = '#fff133';
        ctx.fillText("score: " + Math.round(score), canvas.width * 0.05, fontSize * 2.5);
    }

    // RequestAnimationFrame used instead to stop the flickering caused by calling the render function with setInterval();
    requestAnimationFrame(render);
}

function showMainMenu() {
    resetEntities();
    //new Button(0, new Rect(canvas.width * 0.3, canvas.width * 0.4, canvas.width * 0.4, canvas.width * 0.2), null);
}

function showGameOver() {

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
            showMainMenu();
            break;
        case "game_level":
            startGame(); // Sets up game variables
            break;
        case "game_over":
            showGameOver();
            break;
        default:
            console.error("Invalid scene name: " + sceneName);
            break;
    }
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
function sortByDrawOrder(a, b) {
    return a.drawOrder - b.drawOrder;
}

init(); // Initialise the game