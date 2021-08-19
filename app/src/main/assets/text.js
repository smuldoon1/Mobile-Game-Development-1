class Text extends Entity {
    constructor(moveSpeed, rect, text, colour, velocity, age) {
        super(moveSpeed, rect, null);
        this.text = text;
        this.colour = colour;
        this.velocity = velocity;
        this.age = age;
        this.setDrawOrder(1000);
    }
    
    update() {
        super.update();

        // Move upwards slightly and be destroyed after 1 second
        if (this.age <= 0)
            this.toDestroy = true;
        this.rect.y += this.velocity;
        this.velocity /= 1.01;
        if (this.age != null)
            this.age -= deltaTime;
    }

    // Overridden draw method to draw text instead of a sprite
    draw() {
        ctx.beginPath();
        let fontSize = getFontSize(40);
        ctx.font = fontSize + 'px Score_Font';
        ctx.fillStyle = this.colour;
        ctx.fillText(this.text, this.rect.x + this.rect.width * 0.5, this.rect.y + this.rect.height * 0.5);
        ctx.closePath();
    }
}