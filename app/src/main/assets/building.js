// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    // Building spawning
    static attemptSpawn() {
        if (timeSinceLastBuilding > maxTimeSinceLastBuilding) {
            let newBuilding = new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), Math.random() * canvas.width * 0.6 + canvas.width * 0.25, canvas.height),
                null
            );
            buildings.push(newBuilding);

            // Occasionally spawn an enemy on top of the building
            if (newBuilding.rect.width > canvas.width * 0.4 && Math.random() > 0.6) {
                enemies.push(new Enemy(
                    -720 / canvas.width,
                    new Rect(newBuilding.rect.x + newBuilding.rect.width * 0.75 - canvas.width * 0.075, newBuilding.rect.y - canvas.width * 0.275, canvas.width * 0.15, canvas.width * 0.275),
                    new Sprite(enemyIdle, 36, 36, 1.8, 1, 150, 4, true),
                    new Sprite(enemyAttack, 36, 36, 1.8, 1, 100, 6, false),
                    new Sprite(enemyDeath, 36, 36, 1.8, 1, 100, 6, false)
                ));
            }
            // Rarely, a powerup is spawned above and to the right of a building
            if (Math.random() > 0.0) {
                let powerup = Powerup.getRandomPowerup();
                new Powerup(
                    -720 / canvas.width,
                    new Rect(newBuilding.rect.x + newBuilding.rect.width + canvas.width * 0.2, newBuilding.rect.y - canvas.width * 0.5, canvas.width * 0.08, canvas.width * 0.08),
                    new Sprite(Powerup.getPowerupSprite(powerup), 16, 16, 1, 1, 100, 8, true),
                    powerup
                );
            }
            timeSinceLastBuilding = (Math.random() * buildingGap) - newBuilding.rect.width;
        }
        timeSinceLastBuilding += deltaTime * speedMultiplier;
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        ctx.fillStyle = "#693996";
        ctx.fill();
        ctx.closePath();
    }

    destroy() {
        super.destroy();
        removeFromArray(buildings, this);
    }
}