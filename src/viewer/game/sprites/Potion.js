import { Physics } from 'phaser';

export class Potion extends Physics.Arcade.Sprite {

    constructor(config) {
        super(
            config.scene,
            config.x,
            config.y,
            "potion_" + config.color
        );
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);
        this.name = config.color;
    }

    get color() {
        return this.name;
    }

}