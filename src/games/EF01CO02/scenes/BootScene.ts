import Phaser from 'phaser';
import robotHead from '../../../assets/games/EF01CO02/CabecaMetabee.png';
import robotTorso from '../../../assets/games/EF01CO02/TroncoMetabee.png';
import robotLegs from '../../../assets/games/EF01CO02/PernasMetabee.png';
import robotFull from '../../../assets/games/EF01CO02/MetabeeCompleto.png';

export class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    preload() {
        this.load.image('robot_kbt_head', robotHead);
        this.load.image('robot_kbt_torso', robotTorso);
        this.load.image('robot_kbt_legs', robotLegs);
        this.load.image('robot_kbt_full_v2', robotFull);
    }
    create() { this.scene.start('GameScene'); }
}