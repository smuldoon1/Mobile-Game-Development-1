// Input class handles player input
class Input {
    static leftMousePressed; // Keeps track of the left side of the screen being pressed
    static rightMousePressed; // Keeps track of the right side of the screen being pressed

    static lastTouch;

    // Handles user touch up events
    static touchStartHandler(e) {
        let touches = e.touches;
        for (let i = 0; i < touches.length; i++) {
            var event = new CustomEvent('ctouch');
            document.dispatchEvent(event);
            if (touches[i].pageX < screen.width * 0.5) {
                Input.leftMousePressed = true;
                if (scene == "game_level")
                    player.jump();
            }
            if (touches[i].pageX >= screen.width * 0.5) {
                Input.rightMousePressed = true;
                if (scene == "game_level")
                    player.attack();
            }
            if (scene == "main_menu") {
                setScene("game_level");
            }
            if (scene == "game_over") {
                setScene("main_menu");
            }
            Input.lastTouch = touches[i];
        }
    }

    // Handles user touch end events
    static touchEndHandler(e) {
        if (e.touches.length == 0) {
            Input.leftMousePressed = false;
            Input.rightMousePressed = false;
        }
    }

    static getTouch() {
        return Input.lastTouch;
    }
}