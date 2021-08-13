// Input class handles player input
class Input {
    static leftMousePressed; // Keeps track of the left side of the screen being pressed
    static rightMousePressed; // Keeps track of the right side of the screen being pressed

    // Handles user touch up events
    static touchStartHandler(e) {
        let touches = e.touches;

        for (let i = 0; i < touches.length; i++) {
            if (touches[i].pageX < canvas.width * 0.18) {
                Input.leftMousePressed = true;
                Input.rightMousePressed = false;
                player.jump();
            }
            if (touches[i].pageX >= canvas.width * 0.18) {
                Input.rightMousePressed = true;
                Input.leftMousePressed = false;
                player.attack();
            }
        }
    }

    // Handles user touch end events
    static touchEndHandler(e) {
        if (e.touches.length == 0) {
            Input.leftMousePressed = false;
            Input.rightMousePressed = false;
        }
    }
}