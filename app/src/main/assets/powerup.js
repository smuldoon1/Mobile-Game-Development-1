// Powerup class handles all powerup functionality
class Powerup extends Entity {
    constructor(moveSpeed, rect, sprite, type) {
        super(moveSpeed, rect, sprite);
        this.type = type;
    }

    static rapidFireTimer = 0;

    // Updates the timers of time limited powerups
    static updateTimers(deltaTime) {
        this.rapidFireTimer -= deltaTime;
        if (this.rapidFireTimer < 0)
            this.rapidFireTimer = 0;
    }

    // Get a random powerup for the purpose of spawning a new powerup entity
    static getRandomPowerup() {
        let randomNumber = Math.random();
        if (randomNumber > 0.6)
            return "health";
        else
            return "rapid_fire";
    }

    // Get the correct sprite for a powerup
    static getPowerupSprite(powerupName) {
        switch (powerupName) {
            case "health":
                return healthPowerup;
            case "rapid_fire":
                return rapidFirePowerup;
            default:
                console.error("Invalid powerup name: " + powerupName);
                return null;
        }
    }

    onCollision(e) {
        super.onCollision(e);

        // Handle player collisions
        if (getType(e) == "Player") {
            switch (this.type) {
                // Health powerup
                case "health":
                    if (e.health < 3)
                        e.health++; // Heal player by one
                    break;
                // Rapid fire powerup
                case "rapid_fire":
                    Powerup.rapidFireTimer = 8000; // Give the player 8 seconds of rapid fire
                    break;                    
                default:
                    console.error("Invalid powerup type: " + type);
                    break;
            }
            powerupSFX.play(); // Play powerup pickup sound
            score += 100; // Give the player 100 score
            this.destroy(); // Destroy powerup
        }
    }
}