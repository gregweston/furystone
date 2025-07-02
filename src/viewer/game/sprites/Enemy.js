import { Physics } from 'phaser';

const ENEMY_PROPERTIES = {
    chomper_small: {
        body_size: {
            x: 22, y: 26
        },
        offset: {
            x: 5, y: 16
        },
        max_health: 10,
        movement_speed: 50,
        mass: 1,
        attack_damage: 5,
        attack_interval: 1000
    },
    zombie_ice: {
        body_size: {
            x: 18, y: 28
        },
        offset: {
            x: 4, y: 4
        },
        max_health: 20,
        movement_speed: 35,
        mass: 1,
        attack_damage: 0,
        attack_interval: 1000
    },
    masked_orc: {
        body_size: {
            x: 22, y: 22
        },
        offset: {
            x: 1, y: 6
        },
        max_health: 20,
        movement_speed: 55,
        mass: 1.2,
        attack_damage: 2,
        attack_interval: 1000
    },
    lizard_man: {
        body_size: {
            x: 26, y: 32
        },
        offset: {
            x: 1, y: 8
        },
        max_health: 90,
        movement_speed: 55,
        mass: 1.2,
        attack_damage: 7,
        attack_interval: 1000
    },
    skeleton: {
        body_size: {
            x: 14, y: 22
        },
        offset: {
            x: 3, y: 6
        },
        max_health: 10,
        movement_speed: 70,
        mass: .6,
        attack_damage: 3,
        attack_interval: 1000
    },
    warlock: {
        body_size: {
            x: 14, y: 22
        },
        offset: {
            x: 3, y: 6
        },
        max_health: 80,
        movement_speed: 35,
        mass: .8,
        attack_damage: 0,
        attack_interval: 1000
    },
    swampy: {
        body_size: {
            x: 28, y: 26
        },
        offset: {
            x: 2, y: 4
        },
        max_health: 5,
        movement_speed: 5,
        mass: 2,
        attack_damage: 10,
        attack_interval: 1000
    },
    zombie_large: {
        body_size: {
            x: 36, y: 46
        },
        offset: {
            x: 2, y: 14
        },
        max_health: 50,
        movement_speed: 20,
        mass: 1.8,
        attack_damage: 15,
        attack_interval: 1000
    },
    ogre: {
        body_size: {
            x: 36, y: 46
        },
        offset: {
            x: 2, y: 14
        },
        max_health: 70,
        movement_speed: 35,
        mass: 1.5,
        attack_damage: 20,
        attack_interval: 1000
    },
    zombie_tiny: {
        body_size: {
            x: 18, y: 18
        },
        offset: {
            x: 2, y: 2
        },
        max_health: 10,
        movement_speed: 85,
        mass: .5,
        attack_damage: 5,
        attack_interval: 1000
    },
    chomper_tiny: {
        body_size: {
            x: 18, y: 18
        },
        offset: {
            x: 2, y: 2
        },
        max_health: 15,
        movement_speed: 75,
        mass: .7,
        attack_damage: 6,
        attack_interval: 1000
    },
    chomper_large: {
        body_size: {
            x: 36, y: 46
        },
        offset: {
            x: 2, y: 14
        },
        max_health: 100,
        movement_speed: 40,
        mass: 2,
        attack_damage: 50,
        attack_interval: 1000
    }
};

export class Enemy extends Physics.Arcade.Sprite {

    game_data = {};

    constructor(config) {
        super(
            config.scene,
            config.x,
            config.y,
            config.type + "_idle"
        );
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        const this_enemy_properties = ENEMY_PROPERTIES[config.type];

        if (Math.random() > 0.5) {
            this.flipX = true;
        }

        this.game_data = {
            max_health: this_enemy_properties.max_health,
            current_health: this_enemy_properties.max_health,
            damaged_by_current_attack: false,
            last_attack_time: null,
            is_touching_player: false,
            is_within_range_of_player: false,
            movement_speed: this_enemy_properties.movement_speed,
            attack_interval: this_enemy_properties.attack_interval,
            attack_damage: this_enemy_properties.attack_damage,
            mass: this_enemy_properties.mass,
            is_dying: false,
            can_see_player: true
        }

        this.name = config.type;
        this.setPushable(false);
        this.setBodySize(this_enemy_properties.body_size.x, this_enemy_properties.body_size.y);
        this.setOffset(this_enemy_properties.offset.x, this_enemy_properties.offset.y);

    }

    get health() {
        return this.game_data.current_health;
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

    get attack_damage() {
        return this.game_data.attack_damage;
    }

    set is_stunned(value) {
        this.game_data.damaged_by_current_attack = value;
    }

    get velocity() {
        return this.body.velocity;
    }

    get can_see_player() {
        return this.game_data.can_see_player;
    }

    set can_see_player(value) {
        this.game_data.can_see_player = value;
    }

    set_velocity(x, y) {
        this.body.setVelocity(x, y);
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

    update_health_bar(new_value) {
        let percentage = new_value/this.game_data.max_health;
        if (percentage < 0 || percentage > 100) {
            return;
        }
        this.scene.setEnemyHealthBarValue(
            this.game_data.health_bar,
            percentage
        );
    }

    die() {
        this.game_data.is_dying = true;
        this.anims.play(this.name + '_death', true);
        this.body.setVelocity(0);
        setTimeout(() => {
            this.scene.enemyDies(this);
        }, 1000);
    }

}