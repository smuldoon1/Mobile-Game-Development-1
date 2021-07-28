var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var playerRunning = document.getElementById('playerRunning');
var playerJumping = document.getElementById('playerJumping');

var scene = "main_menu";

var previousDate;
var deltaTime;

var rightPressed;
var leftPressed;

var playerX;
var playerY;
var playerWidth;
var playerHeight;

var animationTime;
var animationIndex;

var health;
var score;

var isJumping;
var isGrounded;
var jumpHeldTime;
var maxJumpHoldTime;
var jumps;
var runSpeed;

var velocity;

var gravity;
var initialVelocity;
var initialJumpForce;
var jumpFoldForce;

var fireballArray;
var fireballCooldown;
var fireballRadius;
var fireballSpeed;

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

    playerWidth = canvas.width * 0.2;
    playerHeight = playerWidth;
    playerX = canvas.width * 0.1;
    playerY = canvas.height * 0.5 - playerHeight;

    animationTime = 0;
    animationIndex = 0;

    health = 3;
    score = 0;

    isJumping = false;
    isGrounded = true;
    jumpHeldTime = 0;
    maxJumpHoldTime = 300;
    jumps = 2;
    runSpeed = 720 / canvas.width;

    gravity = 8.88 / canvas.height;
    initialVelocity = 296 / canvas.height;
    initialJumpForce = -3400 / canvas.height;
    jumpFoldForce = 70 / canvas.height;

    velocity = initialVelocity;

    fireballArray = [];
    fireballCooldown = 0;
    fireballCooldownTimer = 700;
    fireballRadius = canvas.width * 0.025;
    fireballSpeed = 1728 / canvas.width;

    buildingsArray = [];
    timeSinceLastBuilding = 1000;//200000 / canvas.width;
    maxTimeSinceLastBuilding = 1500;// 2200000 / canvas.width;
    buildingGap = 900;//1200000 / canvas.width;

    buildingsArray.push({
        x: canvas.width * 0,
        y: canvas.height * 0.5,
        width: canvas.width * 1.5,
        height: canvas.height
    });

    enemyArray = [];
    enemyWidth = canvas.width * 0.09;
    enemyHeight = enemyWidth * 2;

    rightPressed = false;
    leftPressed = false;

    document.addEventListener("touchstart", touchStartHandler, false);
    document.addEventListener("touchend", touchEndHandler, false);

    ctx.font = "100px Arial";
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
                y: newBuilding.y - enemyHeight
            });
        }
        timeSinceLastBuilding = (Math.random() * buildingGap) - newBuilding.width;
    }
    timeSinceLastBuilding += deltaTime;

    isGrounded = false;
    for (var i = 0; i < buildingsArray.length; i++) {
        var building = buildingsArray[i];
        building.x -= deltaTime * runSpeed;

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

    for (var i = 0; i < enemyArray.length; i++) {
        var enemy = enemyArray[i];
        enemy.x -= deltaTime * runSpeed;

        if (playerY + playerHeight > enemy.y &&
            playerY < enemy.y + enemyHeight &&
            playerX + playerWidth > enemy.x &&
            playerX < enemy.x + enemyWidth)
        {
            health--;
            enemyArray.splice(i, 1);
            if (health <= 0) {
                die();
            }
        }

        if (enemy.x < -building.width) {
            enemyArray.splice(i, 1);
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
            if (fireball.y + fireballRadius * 2 > enemy.y &&
                fireball.y < enemy.y + enemyHeight &&
                fireball.x + fireballRadius * 2 > enemy.x &&
                fireball.x < enemy.x + enemyWidth)
            {
                fireballArray.splice(i, 1);
                enemyArray.splice(j, 1);
                score += 50;
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

    if (playerY > canvas.height) {
        die();
    }

    animationTime += deltaTime;
    if (animationTime >= 100) {
        animationTime = 0;
        animationIndex++;
        if (animationIndex > 5) {
            animationIndex = 0;
        }
    }

    score += deltaTime * 0.01;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < buildingsArray.length; i++) {
        var building = buildingsArray[i];
        ctx.beginPath();
        ctx.rect(building.x, building.y, building.width, building.height);
        ctx.fillStyle = "#00ff00";
        ctx.fill();
        ctx.closePath();
    }

    for (var i = 0; i < enemyArray.length; i++) {
        var enemy = enemyArray[i];
        ctx.beginPath();
        ctx.rect(enemy.x, enemy.y, enemyWidth, enemyHeight);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();
    }

    for (var i = 0; i < fireballArray.length; i++) {
        var fireball = fireballArray[i];
        ctx.beginPath();
        ctx.arc(fireball.x, fireball.y, fireballRadius, 0, Math.PI * 2);
        ctx.fillStyle = "#fc8b0a";
        ctx.fill();
        ctx.closePath();
    }

    if (isGrounded) {
        ctx.drawImage(playerRunning, animationIndex * 32, 0, 32, 32, playerX, playerY, playerWidth, playerHeight);
    }
    else {
        ctx.drawImage(playerJumping, getJumpIndex(velocity) * 31, 0, 31, 33, playerX, playerY, playerWidth, playerHeight);
    }

    ctx.strokeText("Health: " + health, 30, 100);
    ctx.strokeText("Score: " + Math.round(score), 30, 210);
    ctx.strokeText("Velocity: " + velocity, 30, 320);
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

function jump() {
    if (jumps > 0 && !isJumping) {
        isJumping = true;
        jumps--;
        velocity = initialJumpForce;
    }
}

function attack() {
    if (fireballCooldown <= 0) {
        fireballCooldown = fireballCooldownTimer;
        fireballArray.push({
            x: playerX + playerWidth * 1.1,
            y: playerY + playerHeight * 0.3
        });
    }
}

function die() {
    clearInterval(gameLoopInterval);
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

function gameLoop() {
    var dateNow = performance.now();
    deltaTime = dateNow - previousDate;
    previousDate = dateNow;

    update();
    render();
}

// Sets up game variables
init();

// Starts the game loop so the update and render functions are called every 10 milliseconds
var gameLoopInterval = setInterval(gameLoop, 10);