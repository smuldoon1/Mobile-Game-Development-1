// Building class handles all building spawning functionality
class Building extends Entity {
    constructor(moveSpeed, rect, sprite) {
        super(moveSpeed, rect, sprite);
    }

    destroy() {
        super.destroy();
        removeFromArray(buildings, this);
    }
}