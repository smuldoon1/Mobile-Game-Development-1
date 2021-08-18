// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    // Building spawning
    static attemptSpawn() {
        if (timeSinceLastBuilding > maxTimeSinceLastBuilding) {
            let newBuilding = Building.getRandomBuilding();
            buildings.push(newBuilding);

            // Occasionally spawn an enemy on top of the building
            if (newBuilding.rect.width > canvas.width * 0.4 && Math.random() > 0.6) {
                enemies.push(new Enemy(
                    -720 / canvas.width,
                    new Rect(newBuilding.rect.x + newBuilding.rect.width * 0.75 - canvas.width * 0.075, newBuilding.rect.y - canvas.width * 0.275, canvas.width * 0.15, canvas.width * 0.275),
                    new Sprite(enemyIdle, 36, 36, 0, 0, 1.8, 1, 150, 4, true),
                    new Sprite(enemyAttack, 36, 36, 0, 0, 1.8, 1, 100, 6, false),
                    new Sprite(enemyDeath, 36, 36, 0, 0, 1.8, 1, 100, 6, false)
                ));
            }
            // Rarely, a powerup is spawned above and to the right of a building
            if (Math.random() > 0.9) {
                let powerup = Powerup.getRandomPowerup();
                new Powerup(
                    -720 / canvas.width,
                    new Rect(newBuilding.rect.x + newBuilding.rect.width + canvas.width * 0.2, newBuilding.rect.y - canvas.width * 0.5, canvas.width * 0.08, canvas.width * 0.08),
                    new Sprite(Powerup.getPowerupSprite(powerup), 16, 16, 0, 0, 1, 1, 100, 8, true),
                    powerup
                );
            }
            timeSinceLastBuilding = (Math.random() * buildingGap) - newBuilding.rect.width;
        }
        timeSinceLastBuilding += deltaTime * speedMultiplier;
    }

    static getRandomBuilding() {
        let random = Math.random();
        if (random > 0.7)
            return new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), canvas.width * 0.6 + canvas.width * 0.25, canvas.height),
                new Sprite(building48a, 48, 256, 0, -canvas.height, 1, 2, 0, 0, false));
        else if (random > 0.4)
            return new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), canvas.width * 0.6 + canvas.width * 0.25, canvas.height),
                new Sprite(building48b, 48, 256, 0, -canvas.height, 1, 2, 0, 0, false));
        else 
            return new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), canvas.width * 0.6 + canvas.width * 0.25, canvas.height),
                new Sprite(building48c, 48, 256, 0, -canvas.height, 1, 2, 0, 0, false));
    }

    draw() {
        if (this.sprite != null)
            super.draw();
        else {
            ctx.beginPath();
            ctx.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
            ctx.fillStyle = "#4b4352";
            ctx.fill();
            ctx.closePath();
        }
    }

    destroy() {
        super.toDestroy = true;
        removeFromArray(buildings, this);
    }
}