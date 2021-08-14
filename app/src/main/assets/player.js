// Player class handles player movement and health
class Player extends Entity {
    constructor(moveSpeed, rect, runSprite, jumpSprite, attackSprite, deathSprite) {
        super(moveSpeed, rect, runSprite);
        this.runSprite = runSprite;
        this.jumpSprite = jumpSprite;
        this.attackSprite = attackSprite;
        this.deathSprite = deathSprite;
        this.health = 3;
        this.jumps = 2;
        this.velocity = initialVelocity;
        this.attackCooldown = 700; // The minimum time allowed between attacks
        this.attackCooldownTimer = 0; // Used to track time between player attacks
        this.isGrounded = true;
        this.isJumping = false;
        this.drawOrder = 0;
    }

    // Returns true if the player has more that 0 health
    get isAlive() {
        return this.health > 0;
    }

    update() {
        super.update();

        this.isGrounded = false;
        // Cycle through all buildings and check if the player should be grounded
        for (var i = 0; i < buildings.length; i++) {
            var building = buildings[i];

            // Check if the player is directly above a building and falling
            if (this.rect.y + this.rect.height < building.rect.y + 50 &&
                this.rect.y + this.rect.height > building.rect.y - 30 &&
                this.rect.x + this.rect.width >= building.rect.x &&
                this.rect.x <= building.rect.x + building.rect.width &&
                this.velocity > 0)
            {
                // If so, the player is grounded. Correct their y-position and play the running animation
                this.isGrounded = true;
                this.rect.y = building.rect.y - this.rect.height;
                if (this.sprite == this.jumpSprite) {
                    this.setSprite("run");
                }
            }
        }

        // If the player is grounded they should stop falling their allowed jumps reset to 2
        if (this.isGrounded) {
            this.jumps = 2;
            this.velocity = initialVelocity;
        }
        // Else, the player should fall and their maximum allowed jumps is set to 1
        else {
            if (this.jumps > 1)
                this.jumps = 1;

            this.velocity += deltaTime * gravity; // Increment velocity while falling to simulate acceleration
            this.rect.y += this.velocity * deltaTime; // Update players y position
        }

        // If the jump input is held down for a short time while the player is jumping, the jump height should increase slightly
        if (Input.leftMousePressed) {
            if (this.isJumping && jumpHeldTime < maxJumpHoldTime) {
                this.velocity -= jumpFoldForce * (jumpHeldTime / maxJumpHoldTime);
                jumpHeldTime += deltaTime;
            }
        }
        else {
            this.isJumping = false;
            jumpHeldTime = 0;
        }

        // If the player falls to the bottom of the screen, they are killed
        if (this.rect.y > canvas.height && this.isAlive)
            this.die();

        if (player.attackCooldownTimer > 0) {
            player.attackCooldownTimer -= deltaTime;
            if (player.attackCooldownTimer < 0) {
                player.attackCooldownTimer = 0;
            }
        }
    }

    // Override animationTick method so that the jump animation frame is dependant on the players velocity
    animationTick() {
        super.animationTick();
        if (!this.isGrounded) {
            this.sprite.animationFrame = Player.getJumpIndex(this.velocity);
        }
    }

    onAnimationEnd() {
        // Play the run animation at the end of the attack animation
        if (this.sprite === this.attackSprite) {
            this.setSprite("run");
        }
    }

    onCollision(e) {
        super.onCollision(e);

        // Take damage if the player collides with an enemy
        if (getType(e) == "Enemy") {
            if (e.canAttack == true) {
                e.setSprite("attack");
                e.isAttacking = true;
                e.canAttack = false;
                this.health--;
                playerDamagedSFX.play();
                if (this.health <= 0) {
                    this.die();
                }
            }
        }
    }

    // Lets the players sprite be changed
    setSprite(state) {
        super.setSprite(state);
        switch (state) {
            case "run":
                this.sprite = this.runSprite;
                break;
            case "jump":
                this.sprite = this.jumpSprite;
                break;
            case "attack":
                this.sprite = this.attackSprite;
                break;
            case "dead":
                this.sprite = this.deathSprite;
                break;
            default:
                console.error(state + " is an invalid player state.");
                break;
        }
    }

    // Called when the player is out of health or has fallen off the screen
    die() {
        this.health = 0;
        player.setSprite("dead");
        music.pause();
        playerDeathSFX.play();
    }

    // Called when the player taps the right-hand side of the screen
    attack() {
        if (this.attackCooldownTimer <= 0 && this.isAlive) {
            this.isPlayingAttackAnimation = true;
            this.setSprite("attack");
            this.attackCooldownTimer = player.attackCooldown;
            playerAttackSFX.play();
            fireballs.push(new Fireball(
                1728 / canvas.width,
                new Rect(this.rect.x + this.rect.width * 0.65, this.rect.y + this.rect.height * 0.2, canvas.width * 0.16, canvas.width * 0.16),
                new Sprite(fireballSprite, 64, 64, 1, 1, 80, 6, true)
            ));
        }
    }

    // Called when the player taps the left-hand side of the screen
    jump() {
        if (this.jumps > 0 && !this.isJumping && this.isAlive) {
            player.setSprite("jump");
            this.isJumping = true;
            this.jumps--;
            this.velocity = initialJumpForce;
            if (this.jumps == 0) {
                doubleJumpSFX.play();
            }
            else {
                jumpSFX.play();
            }
        }
    }

    static getJumpIndex(velocity) {
        if (velocity < -0.2) {
            return 0;
        }
        else if (velocity < 0) {
            return 1;
        }
        else if (velocity < 0.5) {
            return 2;
        }
        else {
            return 3;
        }
    }
}