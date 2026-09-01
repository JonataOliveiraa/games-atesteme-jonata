import Phaser from 'phaser';
import { indiceInicial } from '../../../../shared/level/faseInicial';

import fullRobot from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/full_robot.png';
import fullRobotSilhouette from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/full_robot_silhouette.png';
import fullRobotGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/full_robot_glow.png';
import menuScreen from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/menu_screen.png';

import robotArm from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_arm.png';

import robotBody from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_body.png';
import robotBodyAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_body_anchor.png';
import robotBodyAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_body_anchor_glow.png';
import robotFullbody from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_fullbody.png';

import robotThinking from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_thinking.png';
import robotHead from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_head.png';
import robotHeadAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_head_anchor.png';
import robotHeadAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_head_anchor_glow.png';

import robotLeftArmAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_left_arm_anchor.png';
import robotLeftArmAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_left_arm_anchor_glow.png';

import robotLeftLeg from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_leg.png';
import robotLeftLegAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_left_leg_anchor.png';
import robotLeftLegAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_left_leg_anchor_glow.png';

import robotRightArmAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_right_arm_anchor.png';
import robotRightArmAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_right_arm_anchor_glow.png';

import robotRightLegAnchor from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_right_leg_anchor.png';
import robotRightLegAnchorGlow from '../../../../assets/games/EF01CO02/trilha-do-passo-a-passo/robot_right_leg_anchor_glow.png';
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen';
import { preloadLives } from '../../../../shared/hud/createLives'

export class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Trilha do Passo a Passo',
            subtitle: 'Monte o robô',
            description: 'Preparando as peças...',
            theme: {
                background: { kind: 'grid', base: 0x0f1c3f, color: 0x2dd4bf, alpha: 0.12, size: 80 },
                card: 0x182a5c,
                cardShadow: 0x070d22,
                cardHighlight: 0xffffff,
                cardBorder: 0x2dd4bf,
                title: 0xffffff,
                subtitle: 0xffd166,
                description: 0xdbeafe,
                titleStroke: 0x070d22,
                progressTrack: 0x0b1533,
                progressBorder: 0x2dd4bf,
                progressFill: 0xff6fb1,
                progressHighlight: 0xffffff,
            },
        });

        this.load.image('full_robot', fullRobot);
        this.load.image('full_robot_glow', fullRobotGlow);
        this.load.image('full_robot_silhouette', fullRobotSilhouette)
        this.load.image('menu_screen', menuScreen);

        this.load.image('robot_thinking', robotThinking);
        this.load.image('robot_arm', robotArm);

        this.load.image('robot_body', robotBody);
        this.load.image('robot_body_anchor', robotBodyAnchor);
        this.load.image('robot_body_anchor_glow', robotBodyAnchorGlow);
        this.load.image('robot_fullbody', robotFullbody);

        this.load.image('robot_head', robotHead);
        this.load.image('robot_head_anchor', robotHeadAnchor);
        this.load.image('robot_head_anchor_glow', robotHeadAnchorGlow);

        this.load.image('robot_left_arm_anchor', robotLeftArmAnchor);
        this.load.image('robot_left_arm_anchor_glow', robotLeftArmAnchorGlow);

        this.load.image('robot_leg', robotLeftLeg);
        this.load.image('robot_left_leg_anchor', robotLeftLegAnchor);
        this.load.image('robot_left_leg_anchor_glow', robotLeftLegAnchorGlow);

        this.load.image('robot_right_arm_anchor', robotRightArmAnchor);
        this.load.image('robot_right_arm_anchor_glow', robotRightArmAnchorGlow);

        this.load.image('robot_right_leg_anchor', robotRightLegAnchor);
        this.load.image('robot_right_leg_anchor_glow', robotRightLegAnchorGlow);
        preloadLives(this)
    }

    create() {
        this.scene.launch('UIScene');
        // levelIndex e base ZERO aqui: ?stage=2 vira 1. Dai indiceInicial.
        this.scene.start('GameScene', { levelIndex: indiceInicial(this, 0) });
    }
}