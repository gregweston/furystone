import { Game as PhaserGame } from "phaser";

export class Game extends PhaserGame {

    text_objects = {};
    user_supplied_data = {};

    get player() {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.player;
    }

    get enemies() {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.enemies.children.entries;
    }

    get potions() {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.potions.children.entries;
    }

    get fury_stones() {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.fury_stones.children.entries;
    }

    get width() {
        return this.config.width;
    }

    get height() {
        return this.config.height;
    }

    get is_over() {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.game_is_over;
    }

    set_data(key, value) {
        this.user_supplied_data[key] = value;
    }

    get_data(key) {
        return this.user_supplied_data[key];
    }

    has_text(key) {
        return typeof this.text_objects[key] !== "undefined";
    }

    add_text(key, x, y, content, size) {
        const uiScene = this.scene.getScene("UIScene");
        this.text_objects[key] = uiScene.add.text(x, y, content, { 
            fontSize: size + 'px',
            fontFamily: 'Monogram',
            fill: '#FFF'
        });
    }

    update_text(key, new_content) {
        this.text_objects[key].setText(new_content);
    }

    update_text_color(key, color) {
        this.text_objects[key].setColor(color);
    }

    add_enemy(type, x, y) {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.addEnemy(type, x, y);
    }

    add_potion(color, x, y) {
        const gameScene = this.scene.getScene("GameScene");
        return gameScene.addPotion(color, x, y);
    }

    update_magic_bar(new_value) {
        const uiScene = this.scene.getScene("UIScene");
        if (new_value < 0) {
            new_value = 0;
        }
        if (new_value > this.player.game_data.max_magic) {
            new_value = this.player.game_data.max_magic;
        }
        uiScene.setPlayerMagicBarValue(new_value/this.player.game_data.max_magic);
    }

    update_health_bar(new_value) {
        const uiScene = this.scene.getScene("UIScene");
        if (new_value < 0) {
            new_value = 0;
        }
        if (new_value > this.player.game_data.max_health) {
            new_value = this.player.game_data.max_health;
        }
        uiScene.setPlayerHealthBarValue(new_value/this.player.game_data.max_health);
    }

    destroy_stone(stone) {
        const gameScene = this.scene.getScene("GameScene");
        gameScene.destroyTarget(stone);
    }

    win(message_lines) {
        const gameScene = this.scene.getScene("GameScene");
        gameScene.winGame(message_lines);
    }

    lose(message_lines) {
        const gameScene = this.scene.getScene("GameScene");
        gameScene.loseGame(message_lines);
    }

}