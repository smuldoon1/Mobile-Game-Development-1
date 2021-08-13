// Sprite class handles sprite animation methods
class Sprite {
    constructor(sprite, width, height, animationSpeed, frameCount, loop) {
        this.sprite = sprite;
        this.width = width;
        this.height = height;
        this.animationSpeed = animationSpeed;
        this.frameCount = frameCount;
        this.loop = loop;
        this.animationTime = 0;
        this.animationFrame = 0;
    }
}