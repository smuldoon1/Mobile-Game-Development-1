// Enemy class handles enemy functionality
class Enemy extends Entity {
    constructor(moveSpeed, rect, idleSprite, attackSprite, deathSprite) {
        super(moveSpeed, rect, idleSprite);
        this.idleSprite = idleSprite;
        this.attackSprite = attackSprite;
        this.deathSprite = deathSprite;
        this.isAlive = true;
        this.canAttack = true;
        this.isAttacking = false;
    }

    // Lets enemy sprites be changed
    setSprite(state) {
        super.setSprite(state);
        switch (state) {
            case "idle":
                this.sprite = this.idleSprite;
                break;
            case "attack":
                this.sprite = this.attackSprite;
                break;
            case "dead":
                this.sprite = this.deathSprite;
                break;
            default:
                console.error(state + " is an invalid enemy state.");
                break;
        }
    }

    onAnimationEnd() {
        // Play the idle animation at the end of the attack animation
        if (this.sprite === this.attackSprite) {
            this.setSprite("idle");
        }
    }

    destroy() {
        super.toDestroy = true;
        removeFromArray(enemies, this);
    }
}