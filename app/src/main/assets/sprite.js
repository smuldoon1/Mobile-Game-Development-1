// Sprite class handles sprite animation methods
class Sprite {
    constructor(sprite, width, height, xStretch, yStretch, animationSpeed, frameCount, loop) {
        this.sprite = sprite; // The sprite or spritesheet used to draw on to the game canvas
        this.width = width; // Width of the sprite in pixels
        this.height = height; // Height of the sprite in pixels
        this.xStretch = xStretch; // How wide the sprite should be drawn compared to the entities actual size (ex. 0.5 = half, 2 = double)
        this.yStretch = yStretch; // How tall the sprite should be drawn compared to the entities actual size (ex. 0.5 = half, 2 = double)
        this.frameCount = frameCount; // The number of animation frames in the sprite, set to 1 for no animation
        this.animationSpeed = animationSpeed; // The length of time each animation frame should last
        this.loop = loop; // Set to true for animation to loop back to the first frame after it ends
        this.animationFrame = 0; // Keeps track of the current animation frame
        this.animationTime = 0; // Keeps track of the amount of time the current animation frame has been drawn
    }
}