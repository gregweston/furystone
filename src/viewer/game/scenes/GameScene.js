import { Scene } from './Scene';
import { Player } from '../sprites/Player';
import { Enemy } from '../sprites/Enemy';
import { Potion } from '../sprites/Potion';
import { PlayerAttack } from '../sprites/PlayerAttack';

const ENEMY_HEALTH_BAR_WIDTH = 50;
const ENEMY_HEALTH_BAR_HEIGHT = 5;
const ENEMY_HEALTH_BAR_FILL_COLOR = 0xCC0000;
const ENEMY_HEALTH_BAR_VOID_COLOR = 0x000000;

const DEFAULT_STARTING_POINTS = {
    original: { x: 100, y: 100 },
    rectangle: { x: 100, y: 100 },
    scorpion: { x: 100, y: 100 },
    skull: { x: 100, y: 100 },
    stingray: { x: 800, y: 70 },
    rooms: { x: 400, y: 100 }
}

export class GameScene extends Scene {

    player;
    cursors;
    map;
    dungeon_layer;
    enemies;
    potions;
    fury_stones;
    seconds_remaining;
    timer_events = [];
    target = null;
    target_aura = null;
    target_chest = null;
    target_hit_by_current_attack = false;
    player_gain_magic_sprite;
    player_lose_health_sprite;
    player_teleport_sprite;
    game_has_started = false;
    game_is_over = false;
    level_data;

    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.level_data = this.game.registry.get("level_data");
        this.user_defined_callbacks = this.game.registry.get("callbacks");
    }

    preload() {

        let map_name = this.level_data.map_name;

        this.load.image('tiles', GAME_ASSET_PATH + '/tilesets/purple.png?1=6');
        this.load.tilemapCSV('map', GAME_ASSET_PATH + '/maps/' + map_name + '.csv?1=8');

        this.load.spritesheet('player_run', GAME_ASSET_PATH + '/sprites/player/run.png', { frameWidth: 32, frameHeight: 38 });
        this.load.spritesheet('player_idle', GAME_ASSET_PATH + '/sprites/player/idle.png', { frameWidth: 32, frameHeight: 34 });
        this.load.spritesheet('player_attack', GAME_ASSET_PATH + '/sprites/player/attack.png?1=1', { frameWidth: 34, frameHeight: 52 });

        this.load.spritesheet('player_attack_light', GAME_ASSET_PATH + '/sprites/effects/player_attack_light.png?1=6', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player_attack_heavy', GAME_ASSET_PATH + '/sprites/effects/player_attack_heavy.png', { frameWidth: 128, frameHeight: 128 });
        this.load.spritesheet('player_teleport', GAME_ASSET_PATH + '/sprites/effects/player_teleport.png', { frameWidth: 56, frameHeight: 56 });
        this.load.spritesheet('player_gain_magic', GAME_ASSET_PATH + '/sprites/effects/player_gain_magic.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('player_lose_health', GAME_ASSET_PATH + '/sprites/effects/player_lose_health.png?1=1', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('enemy_death_effect', GAME_ASSET_PATH + '/sprites/effects/enemy_death.png?1=1', { frameWidth: 64, frameHeight: 64 });

        this.load.spritesheet('potion_blue', GAME_ASSET_PATH + '/sprites/potions/blue.png', { frameWidth: 20, frameHeight: 22 });
        this.load.spritesheet('potion_green', GAME_ASSET_PATH + '/sprites/potions/green.png', { frameWidth: 20, frameHeight: 22 });
        this.load.spritesheet('potion_red', GAME_ASSET_PATH + '/sprites/potions/red.png', { frameWidth: 20, frameHeight: 22 });
        this.load.spritesheet('potion_gold', GAME_ASSET_PATH + '/sprites/potions/gold.png', { frameWidth: 20, frameHeight: 22 });
        this.load.spritesheet('potion_silver', GAME_ASSET_PATH + '/sprites/potions/silver.png', { frameWidth: 20, frameHeight: 22 });

        this.load.spritesheet('chomper_small_run', GAME_ASSET_PATH + '/sprites/enemies/chomper_small_run.png', { frameWidth: 32, frameHeight: 46 });
        this.load.spritesheet('chomper_small_idle', GAME_ASSET_PATH + '/sprites/enemies/chomper_small_idle.png', { frameWidth: 32, frameHeight: 46 });

        this.load.spritesheet('zombie_large_run', GAME_ASSET_PATH + '/sprites/enemies/zombie_large_run.png', { frameWidth: 40, frameHeight: 66 });
        this.load.spritesheet('zombie_large_idle', GAME_ASSET_PATH + '/sprites/enemies/zombie_large_idle.png', { frameWidth: 40, frameHeight: 54 });
        
        this.load.spritesheet('zombie_tiny_run', GAME_ASSET_PATH + '/sprites/enemies/zombie_tiny_run.png', { frameWidth: 22, frameHeight: 24 });
        this.load.spritesheet('zombie_tiny_idle', GAME_ASSET_PATH + '/sprites/enemies/zombie_tiny_idle.png', { frameWidth: 18, frameHeight: 20 });
        
        this.load.spritesheet('chomper_tiny_run', GAME_ASSET_PATH + '/sprites/enemies/chomper_tiny_run.png?1=1', { frameWidth: 22, frameHeight: 28 });
        this.load.spritesheet('chomper_tiny_idle', GAME_ASSET_PATH + '/sprites/enemies/chomper_tiny_idle.png?1=1', { frameWidth: 20, frameHeight: 24 });

        this.load.spritesheet('swampy_run', GAME_ASSET_PATH + '/sprites/enemies/swampy.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('swampy_idle', GAME_ASSET_PATH + '/sprites/enemies/swampy.png', { frameWidth: 32, frameHeight: 32 });
        
        this.load.spritesheet('chomper_large_run', GAME_ASSET_PATH + '/sprites/enemies/chomper_large_run.png', { frameWidth: 46, frameHeight: 68 });
        this.load.spritesheet('chomper_large_idle', GAME_ASSET_PATH + '/sprites/enemies/chomper_large_idle.png?1=1', { frameWidth: 52, frameHeight: 62 });

        this.load.spritesheet('skeleton_run', GAME_ASSET_PATH + '/sprites/enemies/skeleton_run.png', { frameWidth: 20, frameHeight: 32 });
        this.load.spritesheet('skeleton_idle', GAME_ASSET_PATH + '/sprites/enemies/skeleton_idle.png', { frameWidth: 20, frameHeight: 28 });
        
        this.load.spritesheet('warlock', GAME_ASSET_PATH + '/sprites/enemies/warlock.png?1=1', { frameWidth: 28, frameHeight: 34 });
        this.load.spritesheet('zombie_ice', GAME_ASSET_PATH + '/sprites/enemies/zombie_ice.png', { frameWidth: 24, frameHeight: 32 });

        this.load.spritesheet('ogre_run', GAME_ASSET_PATH + '/sprites/enemies/ogre_run.png', { frameWidth: 44, frameHeight: 56 });
        this.load.spritesheet('ogre_idle', GAME_ASSET_PATH + '/sprites/enemies/ogre_idle.png', { frameWidth: 44, frameHeight: 52 });

        this.load.spritesheet('masked_orc_run', GAME_ASSET_PATH + '/sprites/enemies/masked_orc_run.png?1=1', { frameWidth: 26, frameHeight: 36 });
        this.load.spritesheet('masked_orc_idle', GAME_ASSET_PATH + '/sprites/enemies/masked_orc_idle.png?1=1', { frameWidth: 24, frameHeight: 32 });

        this.load.spritesheet('lizard_man_run', GAME_ASSET_PATH + '/sprites/enemies/lizard_man_run.png?1=1', { frameWidth: 30, frameHeight: 42 });
        this.load.spritesheet('lizard_man_idle', GAME_ASSET_PATH + '/sprites/enemies/lizard_man_idle.png?1=1', { frameWidth: 32, frameHeight: 38 });

        this.load.spritesheet('fury_stone_idle_green', GAME_ASSET_PATH + '/sprites/stone-green.png?1=1', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fury_stone_idle_red', GAME_ASSET_PATH + '/sprites/stone-red.png?1=1', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fury_stone_idle_blue', GAME_ASSET_PATH + '/sprites/stone-blue.png?1=1', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fury_stone_idle_white', GAME_ASSET_PATH + '/sprites/stone-white.png?1=1', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('fury_stone_idle_black', GAME_ASSET_PATH + '/sprites/stone-black.png?1=1', { frameWidth: 32, frameHeight: 32 });
        
        this.load.spritesheet('target_aura', GAME_ASSET_PATH + '/sprites/effects/target_aura.png', { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet('target_chest', GAME_ASSET_PATH + '/sprites/chest_empty.png', { frameWidth: 48, frameHeight: 32 });
        this.load.spritesheet('target_destruction', GAME_ASSET_PATH + '/sprites/effects/target_destruction.png', { frameWidth: 256, frameHeight: 256 });
    }

    create() {

        const uiScene = this.scene.get('UIScene');

        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tiles');
        this.dungeon_layer = this.map.createLayer(0, tileset, 0, 0);

        this.map.setCollision([
            7, 27, 47, 
            76, 19, 39, 69, 59,
            67, 87, 89,
            56
        ]);

        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNumbers('player_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNumbers('player_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_attack',
            frames: this.anims.generateFrameNumbers('player_attack', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'player_attack_light',
            frames: this.anims.generateFrameNumbers('player_attack_light', { start: 0, end: 18 }),
            frameRate: 38,
            repeat: 0
        });
        this.anims.create({
            key: 'player_attack_heavy',
            frames: this.anims.generateFrameNumbers('player_attack_heavy', { start: 0, end: 24 }),
            frameRate: 50,
            repeat: 0
        });
        this.anims.create({
            key: 'player_teleport',
            frames: this.anims.generateFrameNumbers('player_teleport', { start: 0, end: 18 }),
            frameRate: 38,
            repeat: 0
        });
        this.anims.create({
            key: 'player_gain_magic',
            frames: this.anims.generateFrameNumbers('player_gain_magic', { start: 0, end: 20 }),
            frameRate: 42,
            repeat: 0
        });
        this.anims.create({
            key: 'player_lose_health',
            frames: this.anims.generateFrameNumbers('player_lose_health', { start: 0, end: 20 }),
            frameRate: 42,
            repeat: 0
        });

        this.anims.create({
            key: 'enemy_death_effect',
            frames: this.anims.generateFrameNumbers('enemy_death_effect', { start: 0, end: 21 }),
            frameRate: 29,
            repeat: 0
        });

        this.anims.create({
            key: 'potion_blue',
            frames: this.anims.generateFrameNumbers('potion_blue', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'potion_green',
            frames: this.anims.generateFrameNumbers('potion_green', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'potion_red',
            frames: this.anims.generateFrameNumbers('potion_red', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'potion_gold',
            frames: this.anims.generateFrameNumbers('potion_gold', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'potion_silver',
            frames: this.anims.generateFrameNumbers('potion_silver', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'chomper_small_run',
            frames: this.anims.generateFrameNumbers('chomper_small_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_small_idle',
            frames: this.anims.generateFrameNumbers('chomper_small_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_small_death',
            frames: this.anims.generateFrameNumbers('chomper_small_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie_large_run',
            frames: this.anims.generateFrameNumbers('zombie_large_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_large_idle',
            frames: this.anims.generateFrameNumbers('zombie_large_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_large_death',
            frames: this.anims.generateFrameNumbers('zombie_large_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie_tiny_run',
            frames: this.anims.generateFrameNumbers('zombie_tiny_run', { frames: [0, 1, 2, 3] }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_tiny_idle',
            frames: this.anims.generateFrameNumbers('zombie_tiny_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_tiny_death',
            frames: this.anims.generateFrameNumbers('zombie_tiny_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'chomper_tiny_run',
            frames: this.anims.generateFrameNumbers('chomper_tiny_run', { frames: [0, 1, 2, 3] }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_tiny_idle',
            frames: this.anims.generateFrameNumbers('chomper_tiny_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 15,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_tiny_death',
            frames: this.anims.generateFrameNumbers('chomper_tiny_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'chomper_large_run',
            frames: this.anims.generateFrameNumbers('chomper_large_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_large_idle',
            frames: this.anims.generateFrameNumbers('chomper_large_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'chomper_large_death',
            frames: this.anims.generateFrameNumbers('chomper_large_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'swampy_run',
            frames: this.anims.generateFrameNumbers('swampy_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'swampy_idle',
            frames: this.anims.generateFrameNumbers('swampy_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'swampy_death',
            frames: this.anims.generateFrameNumbers('swampy_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'skeleton_run',
            frames: this.anims.generateFrameNumbers('skeleton_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'skeleton_idle',
            frames: this.anims.generateFrameNumbers('skeleton_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'skeleton_death',
            frames: this.anims.generateFrameNumbers('skeleton_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'warlock_run',
            frames: this.anims.generateFrameNumbers('warlock', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'warlock_idle',
            frames: this.anims.generateFrameNumbers('warlock', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'warlock_death',
            frames: this.anims.generateFrameNumbers('warlock', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'zombie_ice_run',
            frames: this.anims.generateFrameNumbers('zombie_ice', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_ice_idle',
            frames: this.anims.generateFrameNumbers('zombie_ice', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'zombie_ice_death',
            frames: this.anims.generateFrameNumbers('zombie_ice', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'ogre_run',
            frames: this.anims.generateFrameNumbers('ogre_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'ogre_idle',
            frames: this.anims.generateFrameNumbers('ogre_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'ogre_death',
            frames: this.anims.generateFrameNumbers('ogre_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'masked_orc_run',
            frames: this.anims.generateFrameNumbers('masked_orc_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'masked_orc_idle',
            frames: this.anims.generateFrameNumbers('masked_orc_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'masked_orc_death',
            frames: this.anims.generateFrameNumbers('masked_orc_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'lizard_man_run',
            frames: this.anims.generateFrameNumbers('lizard_man_run', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'lizard_man_idle',
            frames: this.anims.generateFrameNumbers('lizard_man_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'lizard_man_death',
            frames: this.anims.generateFrameNumbers('lizard_man_idle', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'fury_stone_idle_green',
            frames: this.anims.generateFrameNumbers('fury_stone_idle_green', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'fury_stone_idle_red',
            frames: this.anims.generateFrameNumbers('fury_stone_idle_red', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'fury_stone_idle_blue',
            frames: this.anims.generateFrameNumbers('fury_stone_idle_blue', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'fury_stone_idle_black',
            frames: this.anims.generateFrameNumbers('fury_stone_idle_black', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: 'fury_stone_idle_white',
            frames: this.anims.generateFrameNumbers('fury_stone_idle_white', { frames: [0, 1, 2, 3] }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'target_aura',
            frames: this.anims.generateFrameNumbers('target_aura', { start: 0, end: 18 }),
            frameRate: 19,
            repeat: -1
        });
        this.anims.create({
            key: 'target_destruction',
            frames: this.anims.generateFrameNumbers('target_destruction', { start: 0, end: 18 }),
            frameRate: 19,
            repeat: 0
        });

        this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff0000 }});

        this.potions = this.physics.add.group();

        if (this.level_data.potions.length > 0) {

            for (let potion_data of this.level_data.potions) {

                this.addPotion(
                    potion_data.color,
                    potion_data.position.x,
                    potion_data.position.y
                );

            }

        }

        this.fury_stones = this.physics.add.group();
        this.fury_stone_chests = this.physics.add.group();
        this.fury_stone_auras = this.physics.add.group();

        if (this.level_data.fury_stones.length > 0) {

            let stone_count = 0;

            for (let fury_stone_data of this.level_data.fury_stones) {

                this.fury_stone_chests.create(
                    fury_stone_data.position.x, 
                    fury_stone_data.position.y + 20, 
                    'target_chest', 
                    0
                ).setImmovable();

                let aura = this.fury_stone_auras.create(
                    fury_stone_data.position.x, 
                    fury_stone_data.position.y - 5, 
                    'target_aura', 
                    0
                ).setPushable(false);
                aura.name = "fury_stone_aura_" + stone_count;
                aura.anims.play("target_aura");

                stone_count++;

            }
        }

        let starting_point;

        if (this.level_data.starting_point === null) {
            starting_point = DEFAULT_STARTING_POINTS[this.level_data.map_name];
        } else {
            starting_point = this.level_data.starting_point;
        }

        this.player = new Player({
            scene: this, 
            x: starting_point.x,
            y: starting_point.y
        });

        this.physics.add.overlap(this.player, this.dungeon_layer);
        this.physics.add.overlap(this.player, this.potions, this.playerCollectsPotion, null, this);

        this.player_gain_magic_sprite = this.physics.add.sprite(0, 0, 'player_gain_magic', 1)
            .setVisible(false);

        this.positionPlayerPowerEffectSprite(this.player, this.player_gain_magic_sprite);

        this.player_gain_magic_sprite.on('animationcomplete', () => {
            this.player_gain_magic_sprite.setVisible(false);
        });

        this.player_lose_health_sprite = this.physics.add.sprite(0, 0, 'player_lose_health', 1)
            .setVisible(false);

        this.positionPlayerPowerEffectSprite(this.player, this.player_lose_health_sprite);

        this.player_lose_health_sprite.on('animationcomplete', () => {
            this.player_lose_health_sprite.setVisible(false);
        });

        this.player_teleport_sprite = this.physics.add.sprite(
            this.player.body.x + 16, 
            this.player.body.y + 10, 
            'player_teleport', 
            1
        ).setVisible(false);
        this.player_teleport_sprite.on('animationcomplete', () => {
            this.player_teleport_sprite.setVisible(false);
        });

        if (this.level_data.fury_stones.length > 0) {

            let stone_count = 0;

            for (let fury_stone_data of this.level_data.fury_stones) {

                this.target = this.fury_stones.create(
                    fury_stone_data.position.x, 
                    fury_stone_data.position.y, 
                    'fury_stone_idle_' + fury_stone_data.color, 
                    0
                ).setPushable(false);
                this.target.name = "fury_stone_" + stone_count;
                this.target.anims.play('fury_stone_idle_' + fury_stone_data.color);

                stone_count++;
            
            }

            this.physics.add.collider(this.player, this.fury_stone_chests);

        }

        this.enemies = this.physics.add.group();

        if (this.level_data.enemies.length > 0) {

            for (let enemy_data of this.level_data.enemies) {

                this.addEnemy(enemy_data.type, enemy_data.position.x, enemy_data.position.y);

            }
        }

        this.physics.add.collider(this.player, this.dungeon_layer);

        this.physics.add.collider(this.player, this.enemies, this.enemyContactsPlayer, null, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);

        /*this.input.on('pointermove', pointer => {
            this.cameras.main.centerOnX(pointer.position.x);
            this.cameras.main.centerOnY(pointer.position.y);
        })*/

        this.cursors = this.input.keyboard.createCursorKeys();

        uiScene.events.on("game_start", () => {

            if (this.game_has_started) {
                return;
            }
            this.game_has_started = true;

            if (typeof this.user_defined_callbacks.event.game_start !== 'undefined') {
                for (let callback of this.user_defined_callbacks.event.game_start) {
                    callback(this.game);
                }
            }

            for (let ms in this.user_defined_callbacks.interval) {
                for (let callback of this.user_defined_callbacks.interval[ms]) {
                    let timer_event = this.time.addEvent({
                        delay: ms,
                        callback: () => { callback(this.game) },
                        callbackScope: this,
                        loop: true
                    });
                    this.timer_events.push(timer_event)
                }
            }

            this.player_teleport_sprite.setVisible(true);
            this.player_teleport_sprite.anims.play("player_teleport");
            this.player.setActive(true).setVisible(true);

            for (let key in this.user_defined_callbacks.event) {
                if (key.startsWith("keydown")) {
                    for (let callback of this.user_defined_callbacks.event[key]) {
                        this.input.keyboard.on(key, (event) => {
                            callback(this.game);
                        });
                    }
                }
            }

        });
    }

    addEnemy(type, x, y) {
        let enemy = new Enemy({
            scene: this,
            x: x, 
            y: y, 
            type: type
        });

        this.enemies.add(enemy);

        enemy.anims.play(type + '_idle', true);

        enemy.game_data.health_bar = this.createEnemyHealthBar();
        this.positionEnemyHealthBar(enemy, enemy.game_data.health_bar);

        this.physics.add.collider(enemy, this.dungeon_layer);

        return enemy;
    }

    addPotion(color, x, y) {

        let sprite_name = "potion_" + color;

        let potion = new Potion({
            scene: this,
            x: x, 
            y: y, 
            color: color
        });

        this.potions.add(potion);

        potion.anims.play(sprite_name, true);

        return potion;
    }

    startPlayerAttack(type) {

        if (this.player.game_data.is_attacking) {
            return;
        }

        this.player_attack = new PlayerAttack({
            scene: this,
            type: type
        });

        this.player_attack.anims.play('player_attack_' + type, true);

        if (typeof this.user_defined_callbacks.event.enemy_gets_attacked !== 'undefined') {
            this.physics.add.overlap(this.player_attack, this.enemies, this.enemyGetsAttacked, null, this);
        }

        if (this.fury_stones.children.size > 0) {
            this.physics.add.overlap(this.player_attack, this.fury_stones, this.targetGetsAttacked, null, this);
        }

        let attack_length = 500;
        this.player.anims.play('player_attack', true);
        if (this.level_data.screen_shake_enabled) {
            this.cameras.main.shake(attack_length, this.player_attack.properties.shake);
        }
        this.player.game_data.attack_time_remaining = attack_length;
        this.player.game_data.is_attacking = true;
    }

    update(time, delta) {

        if (this.game_is_over || !this.game_has_started) {
            return;
        }

        this.player.body.setVelocity(0);
        this.positionPlayerPowerEffectSprite(this.player, this.player_gain_magic_sprite);
        this.positionPlayerPowerEffectSprite(this.player, this.player_lose_health_sprite);

        if (this.player.game_data.attack_time_remaining > 0) {
            this.player.game_data.attack_time_remaining -= delta;
            if (this.player.game_data.attack_time_remaining <= 0) {
                this.player.game_data.attack_time_remaining = 0;
                this.player.game_data.is_attacking = false;
                this.player_attack.destroy();
                this.target_hit_by_current_attack = false;

                this.enemies.children.each((enemy) => {
                    enemy.game_data.damaged_by_current_attack = false
                });

                if (typeof this.user_defined_callbacks.event.player_attack_ends !== 'undefined') {
                    for (let callback of this.user_defined_callbacks.event.player_attack_ends) {
                        callback(this.game);
                    }
                }

            }
        }

        if (!this.player.game_data.is_attacking && !this.game_is_over) {

            let horizontalCursorDown = this.cursors.left.isDown || this.cursors.right.isDown;
            let verticalCursorDown = this.cursors.up.isDown || this.cursors.down.isDown;

            if (horizontalCursorDown || verticalCursorDown) {

                this.player.anims.play('player_run', true);

                if (typeof this.user_defined_callbacks.event.player_move !== 'undefined') {
                    for (let callback of this.user_defined_callbacks.event.player_move) {
                        callback(this.game);
                    }
                }

            } else {
                this.player.anims.play('player_idle', true);
            }

            if (this.cursors.left.isDown) {
                this.player.flipX = true;
                this.player.body.setVelocityX(-this.player.speed);
                this.player.game_data.last_horizontal_direction = 'left';
            }
            else if (this.cursors.right.isDown) {
                this.player.flipX = false;
                this.player.body.setVelocityX(this.player.speed);
                this.player.game_data.last_horizontal_direction = 'right';
            }

            if (this.cursors.up.isDown) {
                this.player.body.setVelocityY(-this.player.speed);
            }
            else if (this.cursors.down.isDown) {
                this.player.body.setVelocityY(this.player.speed);
            }
        }
        
        this.enemies.children.each((enemy) => {

            this.positionEnemyHealthBar(enemy, enemy.game_data.health_bar);

            if (enemy.game_data.damaged_by_current_attack) {
                return;
            }

            if (enemy.body.velocity.x < 0) {
                enemy.flipX = true;
            } else if (enemy.body.velocity.x > 0) {
                enemy.flipX = false;
            }

            if (enemy.body.touching.none && !enemy.body.embedded) {
                enemy.game_data.is_touching_player = false;
            }
                
            if (!enemy.game_data.is_dying && !enemy.game_data.is_touching_player) {
                let distance_from_player_x = this.player.body.x - enemy.body.x;
                let distance_from_player_y = this.player.body.y - enemy.body.y;

                let absolute_distance_from_player = Math.sqrt(
                    distance_from_player_x ** 2 + distance_from_player_y ** 2
                );

                if (absolute_distance_from_player < 300 
                && !this.game_is_over
                && enemy.game_data.can_see_player) {

                    if (!enemy.game_data.is_within_range_of_player) {
                        enemy.game_data.is_within_range_of_player = true;
                        enemy.anims.play(enemy.name + '_run', true);
                    }

                    this.physics.moveTo(
                        enemy, 
                        this.player.body.x + this.player.width/2, 
                        this.player.body.y + this.player.height/2, 
                        enemy.game_data.movement_speed
                    );

                } else {

                    if (enemy.game_data.is_within_range_of_player) {
                        enemy.game_data.is_within_range_of_player = false;
                        enemy.anims.play(enemy.name + '_idle', true);
                        enemy.body.setVelocity(0);
                    }

                }
            }

        });
    }

    endGame() {
        if (this.timer_events !== null) {
            for (let timer_event of this.timer_events) {
                timer_event.remove(); 
            }
        }
        this.game_is_over = true;
    }

    winGame(message_lines) {

        this.endGame();

        this.enemies.children.each((enemy) => {
            enemy.body.setVelocity(0);
            enemy.game_data.current_health = 0;
            enemy.game_data.is_dying = true;
            this.enemyDies(enemy);
        });

        this.player.anims.play("player_idle", true);
        this.player.body.setVelocity(0);

        setTimeout(() => {
            this.events.emit("win_game", message_lines);
        }, 1000);

    }

    loseGame(message_lines) {

        this.endGame();

        this.enemies.children.each((enemy) => {
            enemy.body.setVelocity(0);
            enemy.anims.play(enemy.name + "_idle");
        });

        this.player_teleport_sprite.body.x = this.player.body.x - 16;
        this.player_teleport_sprite.body.y = this.player.body.y - 16;
        this.player_teleport_sprite.setVisible(true);
        this.player_teleport_sprite.anims.play('player_teleport', true);

        this.player.setVisible(false);

        setTimeout(() => {
            this.events.emit("lose_game", message_lines);
        }, 1000);

    }

    createEnemyHealthBar() {
        let bar = this.add.graphics();
        this.setEnemyHealthBarValue(bar, 1);
        return bar;
    }

    setEnemyHealthBarValue(bar, health_percentage) {

        this.setBarValue(
            bar, 
            health_percentage, 
            ENEMY_HEALTH_BAR_WIDTH, 
            ENEMY_HEALTH_BAR_HEIGHT, 
            ENEMY_HEALTH_BAR_FILL_COLOR, 
            ENEMY_HEALTH_BAR_VOID_COLOR
        );

    }

    positionEnemyHealthBar(enemy, bar) {
        bar.x = enemy.x - ENEMY_HEALTH_BAR_WIDTH/2;
        bar.y = enemy.y - enemy.body.height/2 - 10;
    }

    positionPlayerPowerEffectSprite(player, sprite) {
        sprite.body.x = player.body.x - 16;
        sprite.body.y = player.body.y - 16;
    }

    enemyContactsPlayer(player, enemy) {

        if (this.game_is_over || enemy.game_data.is_dying) {
            return;
        }

        const now = new Date().getTime();
        let enemy_can_attack_now = false;

        if (!enemy.game_data.is_touching_player) {
            enemy.game_data.is_touching_player = true;
        }

        if (enemy.game_data.last_attack_time === null) {
            enemy_can_attack_now = true;
        }

        let time_since_last_enemy_attack = now - enemy.game_data.last_attack_time;
        if (time_since_last_enemy_attack >= enemy.game_data.attack_interval) {
            enemy_can_attack_now = true;
        }

        if (!this.game_is_over
        && !enemy.game_data.damaged_by_current_attack
        && enemy_can_attack_now) {

            enemy.game_data.last_attack_time = now;

            if (typeof this.user_defined_callbacks.event.player_gets_attacked !== 'undefined') {
                for (let callback of this.user_defined_callbacks.event.player_gets_attacked) {
                    callback(this.game, enemy);
                }
            }
        }
        
    }

    enemyGetsAttacked(attack, enemy) {

        if (enemy.game_data.damaged_by_current_attack || this.game_is_over) {
            return;
        }
        
        for (let callback of this.user_defined_callbacks.event.enemy_gets_attacked) {
            callback(this.game, enemy, attack);
        }

    }

    destroyTarget(stone) {

        let destruction_effect = this.physics.add.sprite(
            stone.x + 10,
            stone.y,
            'target_destruction', 
            0
        );

        destruction_effect.anims.play('target_destruction', true);

        destruction_effect.on('animationcomplete', () => {
            destruction_effect.destroy();
        });

        let stone_count = stone.name.replace("fury_stone_", "");

        stone.destroy();

        this.fury_stone_auras.children.each((aura) => {
            if (aura.name === "fury_stone_aura_" + stone_count) {
                aura.destroy();
            }
        });
    }

    targetGetsAttacked(attack, target) {
        if (this.target_hit_by_current_attack) {
            return;
        }
        this.target_hit_by_current_attack = true;
        if (typeof this.user_defined_callbacks.event.player_hits_stone !== 'undefined') {
            for (let callback of this.user_defined_callbacks.event.player_hits_stone) {
                callback(this.game, target);
            }
        }
    }

    enemyDies(enemy) {

        let death_effect = this.physics.add.sprite(
            enemy.x,
            enemy.y,
            'enemy_death_effect', 
            0
        ).setImmovable();

        death_effect.anims.play('enemy_death_effect', true);

        enemy.game_data.health_bar.destroy();
        enemy.destroy();

        death_effect.on('animationcomplete', () => {
            death_effect.destroy();
        });

    }

    playerCollectsPotion(player, potion) {
        if (typeof this.user_defined_callbacks.event.player_touches_potion !== 'undefined') {
            for (let callback of this.user_defined_callbacks.event.player_touches_potion) {
                callback(this.game, potion);
            }
        }
    }
}