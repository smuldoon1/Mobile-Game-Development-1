var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var previousDate;
var deltaTime;

var rightPressed;
var leftPressed;

var playerX;
var playerY;
var playerWidth;
var playerHeight;
var runSpeed;

var buildingsArray = [];
var timeSinceLastBuilding;
var buildingWidth;
var buildingHeight;

function init() {
    previousDate = performance.now();

    playerWidth = canvas.width * 0.1;
    playerHeight = playerWidth * 2;
    playerX = canvas.width * 0.1;
    playerY = canvas.height * 0.5 - playerHeight;

    timeSinceLastBuilding = 1750;
    runSpeed = 0.5;

    buildingsArray.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        width: canvas.width * 0.8,
        height: canvas.height
    });

    rightPressed = false;
    leftPressed = false;

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("touchstart", touchStartHandler, false);
    document.addEventListener("touchend", touchEndHandler, false);

    ctx.font = "100px Arial";
}

function update() {
    timeSinceLastBuilding += deltaTime;
    if (timeSinceLastBuilding > 2500) {
        buildingsArray.push({
            x: canvas.width * 1.5,
            y: (Math.random() * canvas.height * 0.5 + (canvas.height * 0.25)),
            width: Math.random() * canvas.width * 0.45 + canvas.width * 0.25,
            height: canvas.height
        });
        timeSinceLastBuilding = Math.random() * 750;
    }

    for (var i = 0; i < buildingsArray.length; i++) {
        buildingsArray[i].x -= deltaTime * runSpeed;
        if (buildingsArray[i].x < -canvas.width) {
            buildingsArray.splice(i, 1);
        }
    }
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

    ctx.beginPath();
    ctx.rect(playerX, playerY, playerWidth, playerHeight);
    ctx.fillStyle = "#0000ff";
    ctx.fill();
    ctx.closePath();

    ctx.strokeText("Buildings: " + buildingsArray.length, 10, 50);
}

function keyDownHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = true;
    }
    if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        rightPressed = false;
    }
    if (e.key == "Left" || e.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function touchStartHandler(e) {
    var touches = e.touches;

    for (var i = 0; i < touches.length; i++) {
        if (touches[i].pageX < canvas.width * 0.18) {
            leftPressed = true;
            rightPressed = false;
        }
        if (touches[i].pageX >= canvas.width * 0.18) {
            rightPressed = true;
            leftPressed = false;
        }
    }
}

function touchEndHandler(e) {
    if (e.touches.length == 0) {
        leftPressed = false;
        rightPressed = false;
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

// Starts the game loop so the input, update and render functions are called every millisecond
setInterval(gameLoop, 1);