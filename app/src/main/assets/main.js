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
var healthbarEmpty = document.getElementById('healthbarEmpty');
var healthbarNearDeath = document.getElementById('healthbarNearDeath');
var healthbarDamaged = document.getElementById('healthbarDamaged');
var healthbarFull = document.getElementById('healthbarFull');
var background = document.getElementById('background');

var jumpSFX = document.getElementById('jumpSFX');
var doubleJumpSFX = document.getElementById('doubleJumpSFX');
var playerDamagedSFX = document.getElementById('playerDamagedSFX');
var playerDeathSFX = document.getElementById('playerDeathSFX');
var playerAttackSFX = document.getElementById('playerAttackSFX');
var enemyDeathSFX = document.getElementById('enemyDeathSFX');
var music = document.getElementById('gameMusic');

var previousDate;
var deltaTime;

var backgroundScroll;
var backgroundWidth;

var score;

var jumpHeldTime;
var maxJumpHoldTime;
var speedMultiplier;

var gravity;
var initialVelocity;
var initialJumpForce;
var jumpFoldForce;

var timeSinceLastBuilding;
var maxTimeSinceLastBuilding;
var buildingGap;

var player;
var enemies = [];
var fireballs = [];
var buildings = [];

var entities = [];

function init() {
    previousDate = performance.now();

    backgroundScroll = 0;
    backgroundWidth = canvas.width / (canvas.height / background.height);

    score = 0;

    jumpHeldTime = 0;
    maxJumpHoldTime = 400;
    speedMultiplier = 0.9;

    gravity = 8.88 / canvas.height;
    initialVelocity = 296 / canvas.height;
    initialJumpForce = -3350 / canvas.height;
    jumpFoldForce = 100 / canvas.height;

    timeSinceLastBuilding = 1080000 / canvas.width;
    maxTimeSinceLastBuilding = 1620000 / canvas.width;
    buildingGap = 972000 / canvas.width;

    // Spawn the player
    player = new Player(
        0,
        new Rect(canvas.width * 0.1, canvas.height * 0.5 - canvas.width * 0.2, canvas.width * 0.2, canvas.width * 0.2),
        new Sprite(playerRunning, 32, 32, 100, 6, true),
        new Sprite(playerJumping, 31, 33, 100, 4, false),
        new Sprite(playerAttack, 36, 32, 100, 6, false),
        new Sprite(playerDeath, 23, 35, 150, 6, false)
    );

    // Spawn the building the player initially starts on top of
    buildings.push(new Building(
        -720 / canvas.width,
        new Rect(0, canvas.height * 0.5, canvas.width * 1.5, canvas.height),
        null
    ));

    // Add touch event listeners
    document.addEventListener("touchstart", Input.touchStartHandler, false);
    document.addEventListener("touchend", Input.touchEndHandler, false);

    music.play();
}

function update() {
    // Animate and update each entity
    for (var i = 0; i < entities.length; i++) {
        entities[i].animationTick();
        entities[i].update();
    }

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
}

// Handles rendering of sprites and UI elements
function render() {

    // Clear the canvas at the beginning of each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the background image
    ctx.drawImage(background, backgroundScroll, 0, backgroundWidth, background.height, 0, 0, canvas.width, canvas.height);

    for (let i = 0; i < buildings.length; i++) {
        let building = buildings[i];
        ctx.beginPath();
        ctx.rect(building.rect.x, building.rect.y, building.rect.width, building.rect.height);
        ctx.fillStyle = "#693996";
        ctx.fill();
        ctx.closePath();
    }

    // Cycle through all entities and draw them
    for (let i = 0; i < entities.length; i++) {
        entities[i].draw();
    }

    // Get the correct healthbar image for the players health and draw it on the canvas
    let healthbar = getHealthbarImage();
    ctx.drawImage(healthbar, canvas.width - canvas.width * 0.45 - 20, 20, canvas.width * 0.45, canvas.width * 0.12);

    // Set up the custom font and draw the players score on the canvas
    let fontSize = getFontSize(40);
    ctx.font = fontSize + 'px Score_Font';
    ctx.fillStyle = '#fff133';
    ctx.fillText("score: " + Math.round(score), canvas.width * 0.05, fontSize * 2.5);

    // Entity debugging
    //ctx.fillStyle = '#0000ff';
    //ctx.fillText("entites: " + entities.length, canvas.width * 0.05, fontSize * 4.5);
    //ctx.fillText("enemies: " + enemies.length, canvas.width * 0.05, fontSize * 6.5);
    //ctx.fillText("fireballs: " + fireballs.length, canvas.width * 0.05, fontSize * 8.5);
    //ctx.fillText("buildings: " + buildings.length, canvas.width * 0.05, fontSize * 10.5);

    // RequestAnimationFrame used instead to stop the flickering caused by calling the render function with setInterval();
    requestAnimationFrame(render);
}

function getRandomBuilding() {

}

function showMainMenu() {

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
    switch (sceneName) {
        case "main_menu":
            clearInterval(gameLoopInterval);
            showMainMenu();
            break;
        case "game_level":
            init(); // Sets up game variables
            gameLoopInterval = setInterval(gameLoop, 10); // Starts the game loop so the update and render functions are called every 10 milliseconds
            break;
        case "game_over":
            showGameOver();
            break;
        default:
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

ctx.imageSmoothingEnabled = false; // Ensures sprites are not drawn blurry

requestAnimationFrame(render); // Start drawing to the canvas
setScene("game_level"); // Start the game in the main menu scene