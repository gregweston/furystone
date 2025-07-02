import { Physics } from 'phaser';

export class Player extends Physics.Arcade.Sprite {

    game_data = {};

    constructor(config) {
        super(
            config.scene,
            config.x,
            config.y,
            "player_idle"
        );
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        this.setPushable(false);
        this.game_data = {
            max_health: config.scene.level_data.player_max_health,
            current_health: config.scene.level_data.player_max_health,
            max_magic: config.scene.level_data.player_max_magic,
            current_magic: config.scene.level_data.player_max_magic,
            last_horizontal_direction: 'right',
            movement_speed: config.scene.level_data.player_speed
        }
        this.name = "player";
        this.setBodySize(26, 28);
        this.setOffset(3, 7);
        this.setActive(false).setVisible(false);
    }

    get magic() {
        return this.game_data.current_magic;
    }

    set magic(value) {
        if (value < 0) {
            value = 0;
        }
        if (value > this.game_data.max_magic) {
            value = this.game_data.max_magic;
        }
        this.game_data.current_magic = value;
    }

    get max_magic() {
        return this.game_data.max_magic;
    }

    get health() {
        return this.game_data.current_health;
    }

    get max_health() {
        return this.game_data.max_health;
    }

    set health(value) {
        if (value < 0) {
            value = 0;
        }
        if (value > this.game_data.max_health) {
            value = this.game_data.max_health;
        }
        this.game_data.current_health = value;
    }

    get attacking() {
        return this.game_data.is_attacking;
    }

    get speed() {
        return this.game_data.movement_speed;
    }

    set speed(value) {
        this.game_data.movement_speed = value;
    }

    increase_health(increment) {
        this.game_data.current_health = Math.min(
            this.game_data.current_health + increment,
            this.game_data.max_health
        );
    }

    decrease_health(decrement) {
        this.game_data.current_health = Math.max(
            this.game_data.current_health - decrement,
            0
        );
    }

    show_effect(type) {
        if (type === "damage") {
            this.scene.player_lose_health_sprite.setVisible(true);
            this.scene.player_lose_health_sprite.anims.play("player_lose_health");
        }
        if (type === "power_up") {
            this.scene.player_gain_magic_sprite.setVisible(true);
            this.scene.player_gain_magic_sprite.anims.play("player_gain_magic");
        }
    }

    increase_magic(increment) {
        this.game_data.current_magic = Math.min(
            this.game_data.current_magic + increment,
            this.game_data.max_magic
        );
    }

    decrease_magic(decrement) {
        this.game_data.current_magic = Math.max(
            this.game_data.current_magic - decrement,
            0
        );
    }

    attack(type) {
        this.scene.startPlayerAttack(type);
    }

    get_magic_percentage() {
        return this.game_data.current_magic/this.game_data.max_magic;
    }

}