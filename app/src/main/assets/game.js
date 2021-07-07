   var canvas = document.getElementById("gameCanvas");
   var ctx = canvas.getContext("2d");

   var playerX;
   var playerY;

   function init() {
        playerX = canvas.width / 2;
        playerY = canvas.height / 2;
   }

   function input() {

   }

   function update() {
        playerX += 1;
        playerY += 1;
   }

   function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(playerX, playerY, 100, 0, Math.PI*2);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.rect(playerX + 250, playerY, 200, 200);
        ctx.fillStyle = "#0000ff";
        ctx.fill();
        ctx.closePath();
   }

   function gameLoop() {
        input();
        update();
        render();
   }

   // Sets up game variables
   init();

   // Starts the game loop so the input, update and render functions are called every millisecond
   setInterval(gameLoop, 1);