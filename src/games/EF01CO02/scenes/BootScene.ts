import Phaser from 'phaser';
import startScreen from '../../../assets/games/EF01CO02/TelaInicial.png';

export class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.load.image('medabot_background_scene', '/assets/medabot/background_scene.png');
        this.load.image('medabot_top_timer_panel', '/assets/medabot/top_timer_panel.png');
        this.load.image('medabot_instruction_panel', '/assets/medabot/instruction_panel.png');
        this.load.image('medabot_left_panel', '/assets/medabot/left_panel.png');
        this.load.image('medabot_right_panel', '/assets/medabot/right_panel.png');
        this.load.image('medabot_card_part', '/assets/medabot/card_part.png');
        this.load.image('medabot_assembly_slot', '/assets/medabot/assembly_slot.png');
        this.load.image('robot_kbt_head', '/assets/medabot/robot_head.png');
        this.load.image('robot_kbt_torso', '/assets/medabot/robot_torso.png');
        this.load.image('robot_kbt_legs', '/assets/medabot/robot_legs.png');
        this.load.image('robot_kbt_full_v2', '/assets/medabot/robot_full.png');
        this.load.image('start_screen_ef01co02', startScreen);

        const fallbackKeys = [
            'robot_kwg_head',
            'robot_kwg_shoulder_l',
            'robot_kwg_shoulder_r',
            'robot_kwg_torso',
            'robot_kwg_sword',
            'robot_kwg_legs',
            'robot_stg_head',
            'robot_stg_torso',
            'robot_stg_legs',
        ];

        fallbackKeys.forEach((key) => {
            this.load.image(key, '/assets/medabot/robot_full.png');
        });
    }
    create() { this.scene.start('GameScene'); }
}
