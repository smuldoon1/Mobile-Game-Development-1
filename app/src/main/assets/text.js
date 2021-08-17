class Text extends Entity {
    constructor(moveSpeed, rect, sprite, text, colour) {
        super(moveSpeed, rect, sprite);
        this.text = text;
        this.colour = colour;
        this.age = 0;
        this.velocity = -1;
        this.setDrawOrder(1000);
    }
    
    update() {
        super.update();
        if (this.age > 1000)
            this.toDestroy = true;
        this.rect.y += this.velocity;
        this.velocity /= 1.01;
        this.age += deltaTime;
    }
    
    draw() {
        ctx.beginPath();
        let fontSize = getFontSize(40);
        ctx.font = fontSize + 'px Score_Font';
        ctx.fillStyle = this.colour;
        ctx.fillText(this.text, this.rect.x + this.rect.width * 0.5, this.rect.y + this.rect.height * 0.5);
        ctx.closePath();
    }
}