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

var rightPressed = false;
var leftPressed = false;

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
    document.addEventListener("touchstart", touchStartHandler, false);
    document.addEventListener("touchend", touchEndHandler, false);

    music.play();
}

function update() {
    for (var i = 0; i < entities.length; i++) {
        entities[i].update();
        entities[i].animationTick();
    }

    if (timeSinceLastBuilding > maxTimeSinceLastBuilding) {
        let newBuilding = new Building(
            -720 / canvas.width,
            new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), Math.random() * canvas.width * 0.6 + canvas.width * 0.25, canvas.height),
            null
        );
        buildings.push(newBuilding);
        if (newBuilding.rect.width > canvas.width * 0.4 && Math.random() > 0.6) {
            enemies.push(new Enemy(
                -720 / canvas.width,
                new Rect(newBuilding.rect.x + newBuilding.rect.width * 0.75 - canvas.width * 0.075, newBuilding.rect.y - canvas.width * 0.275, canvas.width * 0.15, canvas.width * 0.275),
                new Sprite(enemyIdle, 18, 33, 150, 4, true),
                new Sprite(enemyAttack, 23, 34, 100, 6, false),
                new Sprite(enemyDeath, 36, 34, 100, 6, false)
            ));
        }
        timeSinceLastBuilding = (Math.random() * buildingGap) - newBuilding.rect.width;
    }
    timeSinceLastBuilding += deltaTime * speedMultiplier;

    player.isGrounded = false;
    for (var i = 0; i < buildings.length; i++) {
        var building = buildings[i];

        if (player.rect.y + player.rect.height < building.rect.y + 30 &&
            player.rect.y + player.rect.height > building.rect.y - 10 &&
            player.rect.x + player.rect.width >= building.rect.x &&
            player.rect.x <= building.rect.x + building.rect.width &&
            player.velocity > 0) {
            player.rect.y = building.rect.y - player.rect.height;
            player.isGrounded = true;
            if (player.sprite == player.jumpSprite) {
                player.setSprite("run");
            }
        }

        if (building.rect.x < -building.rect.width) {
            buildings.splice(i, 1);
        }
    }

    for (var i = 0; i < fireballs.length; i++) {
        let fireball = fireballs[i];

        if (fireball.rect.x > canvas.width) {
            fireballs.splice(i, 1);
        }
    }
    
    for (var i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];

        if (enemy.rect.x < -building.rect.width) {
            enemies.splice(i, 1);
        }
    }

    if (player.attackCooldownTimer > 0) {
        player.attackCooldownTimer -= deltaTime;
        if (player.attackCooldownTimer < 0) {
            player.attackCooldownTimer = 0;
        }
    }

    if (player.isGrounded) {
        player.jumps = 2;
        player.velocity = initialVelocity;
    }
    else {
        if (player.jumps == 2) {
            player.jumps = 1;
        }
        player.velocity += deltaTime * gravity;
        player.rect.y += player.velocity * deltaTime;
    }

    if (leftPressed) {
        if (player.isJumping && jumpHeldTime < maxJumpHoldTime) {
            player.velocity -= jumpFoldForce * (jumpHeldTime / maxJumpHoldTime);
            jumpHeldTime += deltaTime;
        }
    }
    else {
        player.isJumping = false;
        jumpHeldTime = 0;
    }

    if (player.rect.y > canvas.height && player.isAlive) {
        player.die();
        player.health = 0;
    }

    if (player.isAlive) {
        backgroundScroll += deltaTime * 0.025 * speedMultiplier;
        if (backgroundScroll > background.width * 0.5) {
            backgroundScroll -= background.width * 0.5;
        }
    }

    if (player.isAlive) {
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

    for (var i = 0; i < buildings.length; i++) {
        let building = buildings[i];
        ctx.beginPath();
        ctx.rect(building.rect.x, building.rect.y, building.rect.width, building.rect.height);
        ctx.fillStyle = "#693996";
        ctx.fill();
        ctx.closePath();
    }

    // Cycle through all entities and draw them
    for (var i = 0; i < entities.length; i++) {
        entities[i].draw();
    }

    // Get the correct healthbar image for the players health and draw it on the canvas
    var healthbar = getHealthbarImage();
    ctx.drawImage(healthbar, canvas.width - canvas.width * 0.45 - 20, 20, canvas.width * 0.45, canvas.width * 0.12);

    // Set up the custom font and draw the players score on the canvas
    var fontSize = getFontSize(40);
    ctx.font = fontSize + 'px Score_Font';
    ctx.fillStyle = '#fff133';
    ctx.fillText("score: " + Math.round(score), canvas.width * 0.05, fontSize * 2.5);

    // This is used to stop the flickering caused by calling the render function with setInterval();
    requestAnimationFrame(render);
}

// Handles user touch up events
function touchStartHandler(e) {
    var touches = e.touches;

    for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX < canvas.width * 0.18) {
            leftPressed = true;
            rightPressed = false;
            player.jump();
        }
        if (touches[i].pageX >= canvas.width * 0.18) {
            rightPressed = true;
            leftPressed = false;
            player.attack();
        }
    }
}

// Handles user touch end events
function touchEndHandler(e) {
    if (e.touches.length == 0) {
        leftPressed = false;
        rightPressed = false;
    }
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
    var dateNow = performance.now();
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

// Entity class is a superclass that the player, enemies and all other gameplay objects extend from
class Entity {
    constructor(moveSpeed, rect, sprite) {
        this.moveSpeed = moveSpeed;
        this.rect = rect;
        this.sprite = sprite;
        entities.push(this);
    }

    // Called at a set interval to update any physics or non-rendering functionality of the entity
    update() {

        // Move entities to give the illusion that the player is moving
        this.rect.x += deltaTime * this.moveSpeed * speedMultiplier;

        // Check for collisions
        for (var i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e !== this) {
                if (this.rect.y + this.rect.height > e.rect.y &&
                    this.rect.y < e.rect.y + e.rect.height &&
                    this.rect.x + this.rect.width > e.rect.x &&
                    this.rect.x < e.rect.x + this.rect.width)
                {
                    this.onCollision(e);
                }
            }
        }
    }

    // Draws the entities current sprite and animation frame to the canvas
    draw() {
        let sprite = this.sprite;
        if (sprite == null)
            return;
        ctx.drawImage(sprite.sprite, sprite.animationFrame * sprite.width, 0, sprite.width, sprite.height, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    // Animates sprites over time
    animationTick() {
        let sprite = this.sprite;
        if (sprite == null)
            return;

        // Loop the sprite animation if the sprites loop property is set to true
        if (sprite.loop == true) {
            if (sprite.animationTime >= sprite.animationSpeed) {
                sprite.animationTime = 0;
                sprite.animationFrame++;
                if (sprite.animationFrame >= sprite.frameCount) {
                    sprite.animationFrame = 0;
                }
            }
        }
        // If loop property is set to false, the animation should stop after the last frame is drawn
        // and the onAnimationEnd method is called
        else {
            if (sprite.animationTime >= sprite.animationSpeed) {
                if (sprite.animationFrame < sprite.frameCount - 1) {
                    sprite.animationTime = 0;
                    sprite.animationFrame++;
                }
                else {
                    this.onAnimationEnd();
                }
            }
        }
        sprite.animationTime += deltaTime;
    }

    // Whenever a sprite is changed, reset the animation time and frame variables
    setSprite(state) {
        this.sprite.animationTime = 0;
        this.sprite.animationFrame = 0;
    }

    // Allows classes to handle what should happen after a non-looped animation ends
    onAnimationEnd() {

    }

    // Called every frame for every collision this entity is making with another
    onCollision(e) {
        // Used to debug collisions
        //console.log(getType(this) + " collided with " + getType(e));
    }
}

// Player class handles player movement and health
class Player extends Entity {
    constructor(moveSpeed, rect, runSprite, jumpSprite, attackSprite, deathSprite) {
        super(moveSpeed, rect, runSprite);
        this.runSprite = runSprite;
        this.jumpSprite = jumpSprite;
        this.attackSprite = attackSprite;
        this.deathSprite = deathSprite;
        this.health = 3;
        this.jumps = 2;
        this.velocity = initialVelocity;
        this.attackCooldown = 700; // The minimum time allowed between attacks
        this.attackCooldownTimer = 0; // Used to track time between player attacks
        this.isGrounded = true;
        this.isJumping = false;
    }

    // Returns true if the player has more that 0 health
    get isAlive() {
        return this.health > 0;
    }

    // Override animationTick method so that the jump animation frame is dependant on the players velocity
    animationTick() {
        super.animationTick();
        if (this.isJumping) {
            this.sprite.animationFrame = Player.getJumpIndex(this.velocity);
        }
    }

    onAnimationEnd() {
        // Play the run animation at the end of the attack animation
        if (this.sprite === this.attackSprite) {
            this.setSprite("run");
        }
    }

    onCollision(e) {
        super.onCollision(e);

        // Take damage if the player collides with an enemy
        if (getType(e) == "Enemy") {
            if (e.canAttack == true) {
                e.setSprite("attack");
                e.isAttacking = true;
                e.canAttack = false;
                this.health--;
                playerDamagedSFX.play();
                if (this.health <= 0) {
                    this.die();
                }
            }
        }
    }

    // Lets the players sprite be changed
    setSprite(state) {
        super.setSprite(state);
        switch (state) {
            case "run":
                this.sprite = this.runSprite;
                break;
            case "jump":
                this.sprite = this.jumpSprite;
                break;
            case "attack":
                this.sprite = this.attackSprite;
                break;
            case "dead":
                this.sprite = this.deathSprite;
                break;
            default:
                console.error(state + " is an invalid player state.");
                break;
        }
    }

    // Called when the player is out of health or has fallen off the screen
    die() {
        this.health = 0;
        player.setSprite("dead");
        music.pause();
        playerDeathSFX.play();
    }

    // Called when the player taps the right-hand side of the screen
    attack() {
        if (this.attackCooldownTimer <= 0 && this.isAlive) {
            this.isPlayingAttackAnimation = true;
            this.setSprite("attack");
            this.attackCooldownTimer = player.attackCooldown;
            playerAttackSFX.play();
            fireballs.push(new Fireball(
                1728 / canvas.width,
                new Rect(this.rect.x + this.rect.width * 0.65, this.rect.y + this.rect.height * 0.2, canvas.width * 0.16, canvas.width * 0.16),
                new Sprite(fireballSprite, 64, 64, 80, 6, true)
            ));
        }
    }

    // Called when the player taps the left-hand side of the screen
    jump() {
        if (this.jumps > 0 && !this.isJumping && this.isAlive) {
            player.setSprite("jump");
            this.isJumping = true;
            this.jumps--;
            this.velocity = initialJumpForce;
            if (this.jumps == 0) {
                doubleJumpSFX.play();
            }
            else {
                jumpSFX.play();
            }
        }
    }

    static getJumpIndex(velocity) {
        if (velocity < -0.2) {
            return 0;
        }
        else if (velocity < 0) {
            return 1;
        }
        else if (velocity < 0.5) {
            return 2;
        }
        else {
            return 3;
        }
    }
}

// Enemy class handles enemy functionality
class Enemy extends Entity {
    constructor(moveSpeed, rect, idleSprite, attackSprite, deathSprite) {
        super(moveSpeed, rect, idleSprite);
        this.idleSprite = idleSprite;
        this.attackSprite = attackSprite;
        this.deathSprite = deathSprite;
        this.isAlive = true;
        this.canAttack = true;
        this.isAttacking = false;
    }

    // Lets enemy sprites be changed
    setSprite(state) {
        super.setSprite(state);
        switch (state) {
            case "idle":
                this.sprite = this.idleSprite;
                break;
            case "attack":
                this.sprite = this.attackSprite;
                break;
            case "dead":
                this.sprite = this.deathSprite;
                break;
            default:
                console.error(state + " is an invalid enemy state.");
                break;
        }
    }
}

// Fireball class handles players ranged attack collisions
class Fireball extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    onCollision(e) {
        super.onCollision(e);

        // Destroy enemies when a fireball collides with them
        if (getType(e) == "Enemy") {
            if (e.isAlive) {
                e.isAlive = false;
                e.canAttack = false;
                e.setSprite("dead");
                enemyDeathSFX.play();
                score += 50;
                // destroy this fireball on collision with enemy
            }
        }
    }
}

// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }
}

// All entities have a rect that is used to store their position and size
class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

// Sprite class handles sprite animation methods
class Sprite {
    constructor(sprite, width, height, animationSpeed, frameCount, loop) {
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.animationSpeed = animationSpeed;
        this.frameCount = frameCount;
        this.loop = loop;
        this.animationTime = 0;
        this.animationFrame = 0;
    }
}

ctx.imageSmoothingEnabled = false; // Ensures sprites are not drawn blurry

requestAnimationFrame(render); // Start drawing to the canvas
setScene("game_level"); // Start the game in the main menu scene