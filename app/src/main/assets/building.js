// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    static timeSinceLastBuilding; // Keep track of the time since the last building

    // Random buildings are chosen from this array
    static buildings = [
        { sprite: building16a, weight: 35, width: 0.2125 },
        { sprite: building16b, weight: 10, width: 0.2125 },
        { sprite: building16c, weight: 15, width: 0.2125 },
        { sprite: building48a, weight: 60, width: 0.85 },
        { sprite: building48b, weight: 60, width: 0.85 },
        { sprite: building48c, weight: 55, width: 0.85 },
        { sprite: building48d, weight: 20, width: 0.85 },
        { sprite: building64a, weight: 45, width: 1.1333 },
        { sprite: building64b, weight: 45, width: 1.1333 },
        { sprite: buildingCrane, weight: 10, width: 2 },
        { sprite: buildingPallet, weight: 1, width: 0.425 }
    ];
    static weightTotal = 0; // The total weight of all buildings used to get a random building

    // Setup building weights so they can be used to get random buildings
    static setup() {
        this.buildings.sort(this.compareWeights);
        for (let i = 0; i < this.buildings.length; i++) {
            this.weightTotal += this.buildings[i].weight;
        }
    }

    // Building spawning
    static attemptSpawn() {
        if (this.timeSinceLastBuilding <= 0) {

            // Spawn a random building
            let randomBuilding = this.getRandomBuilding();
            let newBuilding = new Building(
                -720 / canvas.width,
                new Rect(canvas.width * 1.5, Math.random() * canvas.height * 0.4 + (canvas.height * 0.2), canvas.width * randomBuilding.width, canvas.height),
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
            this.timeSinceLastBuilding += canvas.width * 1.9 * (speedMultiplier * 0.5) * Math.random() + (newBuilding.rect.width * 2) + 1.1;
        }
        this.timeSinceLastBuilding -= deltaTime;
    }

    // Get a random building sprite and return that sprite and building width as an object
    static getRandomBuilding() {
        let randomWeight = Math.random() * this.weightTotal;
        let currentWeight = 0;
        for (let i = 0; i < this.buildings.length; i++) {
            currentWeight += this.buildings[i].weight;
            if (randomWeight <= currentWeight)
                return this.buildings[i];
        }
        console.error("No building chosen");
    }

    // Compare two buildings weights
    static compareWeights(a, b) {
        return a.weight - b.weight;
    }
}