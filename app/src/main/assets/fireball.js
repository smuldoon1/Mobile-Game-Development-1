// Fireball class handles players ranged attack collisions
class Fireball extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    update() {
        super.update();
        // Destroy fireballs as soon as they go off the right side of the screen
        if (this.rect.x > canvas.width)
            this.toDestroy = true;
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
                new Text(-720 / canvas.width, new Rect(e.rect.x, e.rect.y, e.rect.width, e.rect.height), null, "+50", '#fff712');
                this.toDestroy = true;
            }
        }
    }

    destroy() {
        super.toDestroy = true;
        removeFromArray(fireballs, this);
    }
}