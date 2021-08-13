// Fireball class handles players ranged attack collisions
class Fireball extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    update() {
        super.update();
        // Destroy fireballs as soon as they go off the right side of the screen
        if (this.rect.x > canvas.width)
            this.destroy();
    }

    onCollision(e) {
        super.onCollision(e);

        // Destroy enemies when a fireball collides with them
        if (getType(e) == "Enemy") {
            if (e.isAlive) {
                e.isAlive = false;
                e.canAttack = false;
                e.setSprite("dead");
                enemyDeathSFX.play();
                score += 50;
                this.destroy();
            }
        }
    }

    destroy() {
        super.destroy();
        removeFromArray(fireballs, this);
    }
}