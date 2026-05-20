import Phaser from 'phaser';

import breadUrl from '../../../assets/games/EF01CO03/bread.png';
import cheeseUrl from '../../../assets/games/EF01CO03/cheese.png';
import sandwichUrl from '../../../assets/games/EF01CO03/sandwich.png';
import bgUrl from '../../../assets/games/EF01CO03/bg.3.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('bread', breadUrl);
    this.load.image('cheese', cheeseUrl);
    this.load.image('sandwich', sandwichUrl);

    this.load.image('bg-03', bgUrl);
  }

  create() {
    this.scene.start('GameScene');
  }
}