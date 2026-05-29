import Phaser from 'phaser';
import robotHead from '../Imagens Games EF01CO02/Cabeça Metabee.png';
import robotTorso from '../Imagens Games EF01CO02/Tronco Metabee.png';
import robotLegs from '../Imagens Games EF01CO02/Pernas Metabee.png';
import robotFull from '../Imagens Games EF01CO02/Metabee completo.png';

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