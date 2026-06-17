import Phaser from 'phaser';
import startScreen from '../../../assets/games/EF01CO02/TelaInicial.png';
import metaBee2Abdomen from '../../../assets/games/EF01CO02/MetaBee2_Abdomen.png';
import metaBee2BracoDireito from '../../../assets/games/EF01CO02/MetaBee2_BracoDireito.png';
import metaBee2BracoEsquerdo from '../../../assets/games/EF01CO02/MetaBee2_BracoEsquerdo.png';
import metaBee2Cabeca from '../../../assets/games/EF01CO02/MetaBee2_Cabeca.png';
import metaBee2Cintura from '../../../assets/games/EF01CO02/MetaBee2_Cintura.png';
import metaBee2PernaDireita from '../../../assets/games/EF01CO02/MetaBee2_PernaDireita.png';

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
        this.load.image('robot_metabee2_head', metaBee2Cabeca);
        this.load.image('robot_metabee2_arm_l', metaBee2BracoEsquerdo);
        this.load.image('robot_metabee2_arm_r', metaBee2BracoDireito);
        this.load.image('robot_metabee2_abdomen', metaBee2Abdomen);
        this.load.image('robot_metabee2_waist', metaBee2Cintura);
        this.load.image('robot_metabee2_leg_r', metaBee2PernaDireita);

        // TODO: substituir os assets STG por imagens reais.
        const fallbackKeys = [
            'robot_stg_head',
            'robot_stg_torso',
            'robot_stg_legs',
        ];

        fallbackKeys.forEach((key) => {
            this.load.image(key, '/assets/medabot/robot_full.png');
        });
    }
    create() {
        this.scene.launch('UIScene');
        this.scene.start('GameScene', { levelIndex: 0 });
    }
}
