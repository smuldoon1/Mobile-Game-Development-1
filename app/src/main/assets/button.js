class Button extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
        this.a = 2;
        document.addEventListener('ctouch', this.checkTouch(this.rect), false);
    }

    draw() {
        ctx.beginPath();
        ctx.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        ctx.fillStyle = "#858f94";
        ctx.fill();
        ctx.closePath();
    }

    checkTouch(rect, currentTouches) {
        if (Button.isButtonTouched(rect)) {
            console.log("Button touched");
        }
    }

    static isButtonTouched(rect) {
        let touch = Input.getTouch();
        for (let i = 0; i < 1; i++) {
            if (touch.pageX > rect.x && touch.pageX < rect.x + rect.width &&
                touch.pageY > rect.y && touch.pageY < rect.y + rect.height) {
                console.log("true");
                return true;
            }
        }
        console.log("false");
        return false;
    }
}