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

var playerX;
var playerY;
var playerWidth;
var playerHeight;

var playerAnimationTime;
var playerAnimationFrame;
var isPlayingAttackAnimation;

var health;
var score;
var isPlayerDead;

var isJumping;
var isGrounded;
var jumpHeldTime;
var maxJumpHoldTime;
var jumps;
var runSpeed;
var speedMultiplier;

var velocity;

var gravity;
var initialVelocity;
var initialJumpForce;
var jumpFoldForce;

var fireballArray;
var fireballCooldown;
var fireballSize;
var fireballSpeed;

var fireballAnimationTime;
var fireballAnimationFrame;

var buildingsArray;
var timeSinceLastBuilding;
var maxTimeSinceLastBuilding;
var buildingGap;
var buildingWidth;
var buildingHeight;

var enemyArray;
var enemyWidth;
var enemyHeight;

function init() {
    previousDate = performance.now();

    backgroundScroll = 0;
    backgroundWidth = canvas.width / (canvas.height / background.height);

    playerWidth = canvas.width * 0.2;
    playerHeight = playerWidth;
    playerX = canvas.width * 0.1;
    playerY = canvas.height * 0.5 - playerHeight;

    playerAnimationTime = 0;
    playerAnimationFrame = 0;
    isPlayingAttackAnimation = false;

    health = 3;
    score = 0;
    isPlayerDead = false;

    isJumping = false;
    isGrounded = true;
    jumpHeldTime = 0;
    maxJumpHoldTime = 400;
    jumps = 2;
    runSpeed = 720 / canvas.width;
    speedMultiplier = 0.9;

    gravity = 8.88 / canvas.height;
    initialVelocity = 296 / canvas.height;
    initialJumpForce = -3350 / canvas.height;
    jumpFoldForce = 100 / canvas.height;

    velocity = initialVelocity;

    fireballArray = [];
    fireballCooldown = 0;
    fireballCooldownTimer = 700;
    fireballSize = canvas.width * 0.04;
    fireballSpeed = 1728 / canvas.width;

    fireballAnimationTime = 0;
    fireballAnimationFrame = 0;

    buildingsArray = [];
    timeSinceLastBuilding = 1080000 / canvas.width;
    maxTimeSinceLastBuilding = 1620000 / canvas.width;
    buildingGap = 972000 / canvas.width;

    buildingsArray.push({
        x: canvas.width * 0,
        y: canvas.height * 0.5,
        width: canvas.width * 1.5,
        height: canvas.height
    });

    enemyArray = [];
    enemyWidth = canvas.width * 0.15;
    enemyHeight = enemyWidth * 1.8333;

    rightPressed = false;
    leftPressed = false;

    document.addEventListener("touchstart", touchStartHandler, false);
    document.addEventListener("touchend", touchEndHandler, false);

    music.play();
}

function update() {
    if (timeSinceLastBuilding > maxTimeSinceLastBuilding) {
        var newBuilding = {
            x: canvas.width * 1.5,
            y: (Math.random() * canvas.height * 0.4 + (canvas.height * 0.25)),
            width: Math.random() * canvas.width * 0.6 + canvas.width * 0.25,
            height: canvas.height
        };
        buildingsArray.push(newBuilding);
        if (newBuilding.width > canvas.width * 0.4 && Math.random() > 0.6) {
            enemyArray.push({
                x: newBuilding.x + newBuilding.width * 0.75 - enemyWidth * 0.5,
                y: newBuilding.y - enemyHeight,
                canAttack: true,
                isAttacking: false,
                isDead: false,
                animationTime: 0,
                animationFrame: 0
            });
        }
        timeSinceLastBuilding = (Math.random() * buildingGap) - newBuilding.width;
    }
    timeSinceLastBuilding += deltaTime * speedMultiplier;

    isGrounded = false;
    for (var i = 0; i < buildingsArray.length; i++) {
        var building = buildingsArray[i];

        if (!isPlayerDead)
            building.x -= deltaTime * runSpeed * speedMultiplier;

        if (playerY + playerHeight < building.y + 30 &&
            playerY + playerHeight > building.y - 10 &&
            playerX + playerWidth >= building.x &&
            playerX <= building.x + building.width &&
            velocity > 0)
        {
            playerY = building.y - playerHeight;
            isGrounded = true;
        }

        if (building.x < -building.width) {
            buildingsArray.splice(i, 1);
        }
    }

    for (var i = 0; i < fireballArray.length; i++) {
        var fireball = fireballArray[i];
        fireball.x += deltaTime * fireballSpeed;

        if (fireball.x > canvas.width) {
            fireballArray.splice(i, 1);
        }

        for (var j = 0; j < enemyArray.length; j++) {
            var enemy = enemyArray[j];
            if (fireball.y + fireballSize > enemy.y &&
                fireball.y < enemy.y + enemyHeight &&
                fireball.x + fireballSize * 2 > enemy.x &&
                fireball.x < enemy.x + enemyWidth)
            {
                fireballArray.splice(i, 1);
                enemy.isDead = true;
                enemy.canAttack = false;
                enemy.animationTime = 0;
                enemy.animationFrame = 0;
                enemyDeathSFX.play();
                score += 50;
            }
        }
    }

    for (var i = 0; i < enemyArray.length; i++) {
        var enemy = enemyArray[i];

        if (!isPlayerDead)
            enemy.x -= deltaTime * runSpeed * speedMultiplier;

        if (playerY + playerHeight > enemy.y &&
            playerY < enemy.y + enemyHeight &&
            playerX + playerWidth > enemy.x &&
            playerX < enemy.x + enemyWidth &&
            enemy.canAttack == true) {
            health--;
            enemy.animationTime = 0;
            enemy.animationFrame = 0;
            enemy.isAttacking = true;
            enemy.canAttack = false;
            playerDamagedSFX.play();
            if (health <= 0) {
                die();
            }
        }

        if (enemy.x < -building.width) {
            enemyArray.splice(i, 1);
        }

        enemy.animationTime += deltaTime;
        if (enemy.isDead) {
            if (enemy.animationTime >= 100 && enemy.animationFrame < 5) {
                enemy.animationTime = 0;
                enemy.animationFrame++;
            }
        }
        else if (enemy.isAttacking) {
            if (enemy.animationTime >= 100) {
                enemy.animationTime = 0;
                enemy.animationFrame++;
                if (enemy.animationFrame > 5) {
                    enemy.isAttacking = false;
                    enemy.animationFrame = 0;
                }
            }
        }
        else {
            if (enemy.animationTime >= 150) {
                enemy.animationTime = 0;
                enemy.animationFrame++;
                if (enemy.animationFrame > 3) {
                    enemy.animationFrame = 0;
                }
            }
        }
    }

    if (fireballCooldown > 0) {
        fireballCooldown -= deltaTime;
        if (fireballCooldown < 0) {
            fireballCooldown = 0;
        }
    }

    if (isGrounded) {
        jumps = 2;
        velocity = initialVelocity;
    }
    else {
        if (jumps == 2) {
            jumps = 1;
        }
        velocity += deltaTime * gravity;
        playerY += velocity * deltaTime;
    }

    if (leftPressed) {
        if (isJumping && jumpHeldTime < maxJumpHoldTime) {
            velocity -= jumpFoldForce * (jumpHeldTime / maxJumpHoldTime);
            jumpHeldTime += deltaTime;
        }
    }
    else {
        isJumping = false;
        jumpHeldTime = 0;
    }

    if (playerY > canvas.height && !isPlayerDead) {
        die();
        health = 0;
    }

    if (!isPlayerDead) {
        backgroundScroll += deltaTime * 0.025 * speedMultiplier;
        if (backgroundScroll > background.width * 0.5) {
            backgroundScroll -= background.width * 0.5;
        }
    }

    playerAnimationTime += deltaTime;
    if (isPlayerDead) {
        if (playerAnimationTime >= 150 && playerAnimationFrame < 5) {
            playerAnimationTime = 0;
            playerAnimationFrame++;
        }
    }
    else
    {
        if (playerAnimationTime >= 100 / speedMultiplier) {
            playerAnimationTime = 0;
            playerAnimationFrame++;
            if (playerAnimationFrame > 5) {
                playerAnimationFrame = 0;
                if (isPlayingAttackAnimation) {
                    isPlayingAttackAnimation = false; 
                }
            }
        }
    }

    fireballAnimationTime += deltaTime;
    if (fireballAnimationTime >= 80) {
        fireballAnimationTime = 0;
        fireballAnimationFrame++;
        if (fireballAnimationFrame > 3) {
            fireballAnimationFrame = 0;
        }
    }

    if (!isPlayerDead) {
        score += deltaTime * 0.01 * speedMultiplier;
        speedMultiplier += deltaTime * 0.0000025;
        if (speedMultiplier > 1.5)
            speedMultiplier = 1.5;
    }
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(background, backgroundScroll, 0, backgroundWidth, background.height, 0, 0, canvas.width, canvas.height);

    for (var i = 0; i < buildingsArray.length; i++) {
        var building = buildingsArray[i];
        ctx.beginPath();
        ctx.rect(building.x, building.y, building.width, building.height);
        ctx.fillStyle = "#693996";
        ctx.fill();
        ctx.closePath();
    }

    for (var i = 0; i < enemyArray.length; i++) {
        var enemy = enemyArray[i];
        if (enemy.isDead) {
            ctx.drawImage(enemyDeath, enemy.animationFrame * 36, 0, 36, 34, enemy.x, enemy.y, enemyWidth * 2, enemyHeight);
        }
        else if (enemy.isAttacking) {
            ctx.drawImage(enemyAttack, enemy.animationFrame * 23, 0, 23, 34, enemy.x, enemy.y, enemyWidth, enemyHeight);
        }
        else {
            ctx.drawImage(enemyIdle, enemy.animationFrame * 18, 0, 18, 33, enemy.x, enemy.y, enemyWidth, enemyHeight);
        }
    }

    for (var i = 0; i < fireballArray.length; i++) {
        var fireball = fireballArray[i];
        ctx.drawImage(fireballSprite, fireballAnimationFrame * 64, 0, 64, 64, fireball.x, fireball.y, fireballSize * 4, fireballSize * 4);
    }

    if (isPlayerDead) {
        ctx.drawImage(playerDeath, playerAnimationFrame * 23, 0, 23, 35, playerX, playerY, playerWidth * 0.7, playerHeight);
    }
    else if (isPlayingAttackAnimation) {
        ctx.drawImage(playerAttack, playerAnimationFrame * 36, 0, 36, 32, playerX, playerY, playerWidth, playerHeight);
    }
    else if (!isGrounded) {
        ctx.drawImage(playerJumping, getJumpIndex(velocity) * 31, 0, 31, 33, playerX, playerY, playerWidth, playerHeight);
    }
    else {
        ctx.drawImage(playerRunning, playerAnimationFrame * 32, 0, 32, 32, playerX, playerY, playerWidth, playerHeight);
    }

    var healthbar = getHealthbarImage();
    ctx.drawImage(healthbar, canvas.width - canvas.width * 0.45 - 20, 20, canvas.width * 0.45, canvas.width * 0.12);

    var fontSize = getFontSize(40);
    ctx.font = fontSize + 'px Score_Font';
    ctx.fillStyle = '#fff133';
    ctx.fillText("score: " + Math.round(score), canvas.width * 0.05, fontSize * 2.5);
}

function touchStartHandler(e) {
    var touches = e.touches;

    for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX < canvas.width * 0.18) {
            leftPressed = true;
            rightPressed = false;
            jump();
        }
        if (touches[i].pageX >= canvas.width * 0.18) {
            rightPressed = true;
            leftPressed = false;
            attack();
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

function jump() {
    if (jumps > 0 && !isJumping && !isPlayerDead) {
        isJumping = true;
        jumps--;
        velocity = initialJumpForce;
        if (jumps == 0) {
            doubleJumpSFX.play();
        }
        else {
            jumpSFX.play();
        }
    }
}

function attack() {
    if (fireballCooldown <= 0 && !isPlayerDead) {
        playerAnimationTime = 0;
        playerAnimationFrame = 0;
        isPlayingAttackAnimation = true;
        fireballCooldown = fireballCooldownTimer;
        playerAttackSFX.play();
        fireballArray.push({
            x: playerX + playerWidth * 0.65,
            y: playerY + playerHeight * 0.2
        });
    }
}

function die() {
    isPlayerDead = true;
    animationTime = 0;
    animationFrame = 0;
    music.pause();
    playerDeathSFX.play();
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
    switch (health) {
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
    render();
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

ctx.imageSmoothingEnabled = false; // Ensures sprites are not drawn blurry

setScene("game_level"); // Start the game in the main menu scene