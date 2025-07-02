import { Physics } from 'phaser';

const ATTACK_PROPERTIES = {
    light: {
        damage: 5,
        pushback: 250,
        range: 96,
        cost: 10,
        shake: .002,
        offset: {
            x: -5, y: 10
        }
    },
    heavy: {
        damage: 15,
        pushback: 600,
        range: 160,
        cost: 20,
        shake: .004,
        offset: {
            x: 0, y: 0
        }
    }
};

export class PlayerAttack extends Physics.Arcade.Sprite {

    game_data = {};

    constructor(config) {

        let player = config.scene.player;
        let attack_properties = ATTACK_PROPERTIES[config.type];

        let x = player.body.x + player.width/2 + attack_properties.offset.x;
        let y = player.body.y + attack_properties.offset.y;

        super(
            config.scene,
            x,
            y,
            "player_attack_" + config.type
        );
        
        config.scene.add.existing(this);
        config.scene.physics.add.existing(this);

        this.name = config.type;
        
        this.setBodySize(
            attack_properties.range, 
            attack_properties.range, 
            true
        );
        this.setOrigin(0.5);
        this.setImmovable();

        if (player.game_data.last_horizontal_direction === "left") {
            this.flipX = true;
        }
    }

    get damage() {
        return ATTACK_PROPERTIES[this.name].damage;
    }

    get pushback() {
        return ATTACK_PROPERTIES[this.name].pushback;
    }

    get properties() {
        return ATTACK_PROPERTIES[this.name];
    }

    push_back(enemy, strength) {

        enemy.game_data.damaged_by_current_attack = true;

        let player = this.scene.player;
        let enemy_x_distance = enemy.body.x - player.body.x;
        let enemy_y_distance = enemy.body.y - player.body.y;

        let distance_absolute_sum = 
            Math.abs(enemy_x_distance) + Math.abs(enemy_y_distance);

        enemy.body.setVelocity(
            (enemy_x_distance/distance_absolute_sum) * strength/enemy.game_data.mass, 
            (enemy_y_distance/distance_absolute_sum) * strength/enemy.game_data.mass
        );
    }

}