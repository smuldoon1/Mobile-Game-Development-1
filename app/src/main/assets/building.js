// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    // Building spawning
    static attemptSpawn() {
        if (timeSinceLastBuilding > maxTimeSinceLastBuilding) {
            // Spawn a random building
            let randomBuilding = this.getRandomBuilding();
            let newBuilding = new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.25), canvas.width * randomBuilding.width, canvas.height),
                new Sprite(randomBuilding.sprite, randomBuilding.sprite.width, 256, 0, -canvas.height, 1, 2, 0, 0, false));

            // Occasionally spawn an enemy on top of the building
            if (newBuilding.rect.width > canvas.width * 0.4 && Math.random() > 0.55) {
                new Enemy(
                    -720 / canvas.width,
                    new Rect(newBuilding.rect.x + newBuilding.rect.width * 0.75 - canvas.width * 0.075, newBuilding.rect.y - canvas.width * 0.275, canvas.width * 0.15, canvas.width * 0.275),
                    new Sprite(enemyIdle, 36, 36, -30, 0, 1.8, 1, 150, 4, true),
                    new Sprite(enemyAttack, 36, 36, -30, 0, 1.8, 1, 100, 6, false),
                    new Sprite(enemyDeath, 36, 36, -30, 0, 1.8, 1, 100, 6, false)
                );
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

    // Get a random building sprite and return that sprite and building width as an object
    static getRandomBuilding() {
        let random = Math.random();
        if (random > 0.95)
            return { sprite: building16a, width: 0.2125 };
        else if (random > 0.925)
            return { sprite: building16b, width: 0.2125 };
        else if (random > 0.9)
            return { sprite: building16c, width: 0.2125 };
        else if (random > 0.625)
            return { sprite: building48a, width: 0.85 };
        else if (random > 0.35)
            return { sprite: building48b, width: 0.85 };
        else if (random > 0.1)
            return { sprite: building48c, width: 0.85 };
        return { sprite: building48d, width: 0.85 };
    }
}