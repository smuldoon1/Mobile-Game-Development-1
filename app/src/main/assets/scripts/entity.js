// Entity class is a superclass that the player, enemies and all other gameplay objects extend from
class Entity {
    constructor(moveSpeed, rect, sprite) {
        this.moveSpeed = moveSpeed;
        this.rect = rect;
        this.sprite = sprite;
        this.drawOrder = 0;
        this.toDestroy = false;
        entities.push(this);
        entities.sort(compareDrawOrder);
    }

    static showEntityRects = false; // Draw a transparent box representing all entities hitboxes, for debug use

    // Called at a set interval to update any physics or non-rendering functionality of the entity
    update() {

        // Workaround to make buildings and enemies stop moving once the player has died
        if (scene == "game_level" && (player.isAlive || this.moveSpeed > 0)) {
            // Move all entities to give the illusion that the player is moving
            this.rect.x += deltaTime * this.moveSpeed * speedMultiplier;
        }

        // If an entity goes out of bounds, it is destroyed
        if (this.rect.x < -this.rect.width * 2 || this.rect.y > canvas.height) {
            this.toDestroy = true;
        }

        // Check for collisions
        for (var i = 0; i < entities.length; i++) {
            let e = entities[i];
            if (e !== this) {
                if (this.rect.y + this.rect.height > e.rect.y &&
                    this.rect.y < e.rect.y + e.rect.height &&
                    this.rect.x + this.rect.width > e.rect.x &&
                    this.rect.x < e.rect.x + this.rect.width) {
                    this.onCollision(e);
                }
            }
        }
    }

    // Draws the entities current sprite and animation frame to the canvas
    draw() {
        let sprite = this.sprite;
        if (sprite == null)
            return;
        ctx.drawImage(sprite.sprite, sprite.animationFrame * sprite.width, 0, sprite.width, sprite.height, this.rect.x + sprite.xOffset, this.rect.y + sprite.yOffset, this.rect.width * sprite.xStretch, this.rect.height * sprite.yStretch);
        if (Entity.showEntityRects) {
            ctx.beginPath();
            ctx.lineWidth = "5";
            ctx.strokeStyle = "#00ff00";
            ctx.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
            ctx.stroke();
        }
    }

    // Animates sprites over time
    animationTick() {
        let sprite = this.sprite;
        if (sprite == null)
            return;

        // Loop the sprite animation if the sprites loop property is set to true
        if (sprite.loop == true) {
            if (sprite.animationTime >= sprite.animationSpeed) {
                sprite.animationTime = 0;
                sprite.animationFrame++;
                if (sprite.animationFrame >= sprite.frameCount) {
                    sprite.animationFrame = 0;
                }
            }
        }
        // If loop property is set to false, the animation should stop after the last frame is drawn
        // and the onAnimationEnd method is called
        else {
            if (sprite.animationTime >= sprite.animationSpeed) {
                if (sprite.animationFrame < sprite.frameCount - 1) {
                    sprite.animationTime = 0;
                    sprite.animationFrame++;
                }
                else {
                    this.onAnimationEnd();
                }
            }
        }
        sprite.animationTime += deltaTime;
    }

    // Whenever a sprite is changed, reset the animation time and frame variables
    setSprite(state) {
        this.sprite.animationTime = 0;
        this.sprite.animationFrame = 0;
    }

    // Allows for control of what entities are drawn first, a lower draw order is drawn before an entity with a higher draw order
    // Entities with the same draw order will be drawn in the order they were created
    setDrawOrder(drawOrder) {
        this.drawOrder = drawOrder;
        entities.sort(compareDrawOrder);
    }

    // Allows classes to handle what should happen after a non-looped animation ends
    onAnimationEnd() {

    }

    // Called every frame for every collision this entity is making with another
    onCollision(e) {
        if (this.toDestroy) // Ensure collisions dont happen when the object is scheduled to be destroyed
            return;

        // Used to debug collisions
        //console.log(getType(this) + " collided with " + getType(e));
    }

    checkToDestroy() {
        if (this.toDestroy)
            removeFromArray(entities, this);
    }
}