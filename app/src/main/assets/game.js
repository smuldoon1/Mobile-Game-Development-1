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

var rightPressed;
var leftPressed;

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

    fireballSpeed = 1728 / canvas.width;

    buildingsArray = [];
    timeSinceLastBuilding = 1080000 / canvas.width;
    maxTimeSinceLastBuilding = 1620000 / canvas.width;
    buildingGap = 972000 / canvas.width;

    player = new Player(
        0,
        new Rect(canvas.width * 0.1, canvas.height * 0.5 - canvas.width * 0.2, canvas.width * 0.2, canvas.width * 0.2),
        new Sprite(playerRunning, 32, 32, 100, 6, true),
        new Sprite(playerJumping, 31, 33, 100, 4, true),
        new Sprite(playerAttack, 36, 32, 100, 6, false),
        new Sprite(playerDeath, 23, 35, 150, 6, false)
    );

    buildings.push(new Building(
        -720 / canvas.width,
        new Rect(0, canvas.height * 0.5, canvas.width * 1.5, canvas.height),
        null
    ));

    rightPressed = false;
    leftPressed = false;

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
            player.velocity > 0)
        {
            player.rect.y = building.rect.y - player.rect.height;
            player.isGrounded = true;
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

    console.log(player.rect.x + ", " + player.rect.y)
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

function touchEndHandler(e) {
    if (e.touches.length == 0) {
        leftPressed = false;
        rightPressed = false;
    }
}

function getRandomBuilding() {

}

function getJumpIndex(velocity) {
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

function getFontSize(relativeSize) {
    return canvas.width * 0.001 * relativeSize;
}

function showMainMenu() {

}

function showGameOver() {

}

function gameLoop() {
    var dateNow = performance.now();
    deltaTime = dateNow - previousDate;
    previousDate = dateNow;

    update();
}

function setScene(sceneName) {
    switch (sceneName) {
        case "main_menu":
            clearInterval(gameLoopInterval);
            showMainMenu();
            break;
        case "game_level":
            init(); // Sets up game variables
            setInterval(gameLoop, 10); // Starts the game loop so the update and render functions are called every 10 milliseconds
            break;
        case "game_over":
            showGameOver();
            break;
        default:
            break;
    }
}

function getType(object) {
    return object.constructor.name;
}

class Entity {
    constructor(moveSpeed, rect, sprite) {
        this.moveSpeed = moveSpeed;
        this.rect = rect;
        this.sprite = sprite;
        entities.push(this);
    }

    update() {
        this.rect.x += deltaTime * this.moveSpeed * speedMultiplier;

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

    draw() {
        let sprite = this.sprite;
        if (sprite == null)
            return;
        ctx.drawImage(sprite.sprite, sprite.animationFrame * sprite.width, 0, sprite.width, sprite.height, this.rect.x, this.rect.y, this.rect.width, this.rect.height);
    }

    animationTick() {
        let sprite = this.sprite;
        if (sprite == null)
            return;
        sprite.animationTime += deltaTime;
        if (sprite.loop == true) {
            if (sprite.animationTime >= sprite.animationSpeed) {
                sprite.animationTime = 0;
                sprite.animationFrame++;
                if (sprite.animationFrame >= sprite.frameCount) {
                    sprite.animationFrame = 0;
                }
            }
        }
        else {
            if (sprite.animationTime >= sprite.animationSpeed && sprite.animationFrame < sprite.frameCount) {
                sprite.animationTime = 0;
                sprite.animationFrame++;
            }
            else {
                this.onAnimationEnd();
            }
        }
    }

    setSprite(state) {
        this.sprite.animationTime = 0;
        this.sprite.animationFrame = 0;
    }

    onAnimationEnd() {

    }

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

    animationTick() {
        super.animationTick();
        if (!this.isGrounded) {
            this.sprite.animationFrame = getJumpIndex(this.velocity);
        }
    }

    onCollision(e) {
        super.onCollision(e);
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

    onAnimationEnd() {
        if (this.sprite == this.attackSprite) {
            this.setSprite("run");
        }
    }
}

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

class Fireball extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    onCollision(e) {
        super.onCollision(e);
        if (getType(e) == "Enemy") {
            if (e.isAlive) {
                e.isAlive = false;
                e.canAttack = false;
                e.setSprite("dead");
                enemyDeathSFX.play();
                score += 50;
                // destroy this fireball
            }
        }
    }
}

class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }
}

class Rect {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

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

setScene("game_level"); // Start the game in the main menu scene

requestAnimationFrame(render);