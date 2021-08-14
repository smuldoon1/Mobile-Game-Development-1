// Powerup class handles all powerup functionality
class Powerup extends Entity {
    constructor(moveSpeed, rect, sprite, type) {
        super(moveSpeed, rect, sprite);
        this.type = type;
    }

    onCollision(e) {
        super.onCollision(e);

        // Handle player collisions
        if (getType(e) == "Player") {
            switch (this.type) {
                // Health powerup
                case "health":
                    if (e.health < 3)
                        e.health++;
                    break;
                default:
                    console.log("Invalid powerup type: " + type);
                    break;
            }
        }

        this.destroy(); // Destroy powerup
    }
}