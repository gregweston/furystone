import { Scene as PhaserScene } from 'phaser';

export class Scene extends PhaserScene {

    setBarValue(bar, percentage, width, height, fill_color, void_color) {

        let scaled_value = percentage * width;
        bar.clear();
        bar.fillStyle(fill_color, 1);
        bar.fillRect(0, 0, scaled_value, height);
        bar.fillStyle(void_color, 1);
        bar.fillRect(scaled_value, 0, width - scaled_value, height);
    
    }

}