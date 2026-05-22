import Phaser from 'phaser';

import algorithmGameCoverUrl from '../../../assets/games/EF01CO03/algorithm-game-cover.png';
import bgLevelTwoUrl from '../../../assets/games/EF01CO03/bg.3.2.png';
import bgLevelThreeUrl from '../../../assets/games/EF01CO03/bg.3.3.png';
import bgUrl from '../../../assets/games/EF01CO03/bg.3.png';
import bloomingFlowerUrl from '../../../assets/games/EF01CO03/blooming-flower.png';
import breadUrl from '../../../assets/games/EF01CO03/bread.png';
import brushingTeethUrl from '../../../assets/games/EF01CO03/brushing-teeth.png';
import candyDistractorUrl from '../../../assets/games/EF01CO03/candy-distractor.png';
import cheeseUrl from '../../../assets/games/EF01CO03/cheese.png';
import coverSeedUrl from '../../../assets/games/EF01CO03/cover-seed.png';
import cutFlowerDistractorUrl from '../../../assets/games/EF01CO03/cut-flower-distractor.png';
import flowerPotUrl from '../../../assets/games/EF01CO03/flower-pot.png';
import rinseMouthUrl from '../../../assets/games/EF01CO03/rinse-mouth.png';
import sandwichUrl from '../../../assets/games/EF01CO03/sandwich.png';
import seedlingUrl from '../../../assets/games/EF01CO03/seedling.png';
import slotUrl from '../../../assets/games/EF01CO03/slot.png';
import soilUrl from '../../../assets/games/EF01CO03/soil.png';
import storeToothbrushUrl from '../../../assets/games/EF01CO03/store-toothbrush.png';
import toothbrushUrl from '../../../assets/games/EF01CO03/toothbrush.png';
import toothpasteUrl from '../../../assets/games/EF01CO03/toothpaste.png';
import trashDistractorUrl from '../../../assets/games/EF01CO03/trash-distractor.png';
import wateringPlantUrl from '../../../assets/games/EF01CO03/watering-plant.png';

const ASSETS: Array<[string, string]> = [
  ['algorithm-game-cover', algorithmGameCoverUrl],
  ['bg-03', bgUrl],
  ['bg-03-level-2', bgLevelTwoUrl],
  ['bg-03-level-3', bgLevelThreeUrl],
  ['blooming-flower', bloomingFlowerUrl],
  ['bread', breadUrl],
  ['brushing-teeth', brushingTeethUrl],
  ['candy-distractor', candyDistractorUrl],
  ['cheese', cheeseUrl],
  ['cover-seed', coverSeedUrl],
  ['cut-flower-distractor', cutFlowerDistractorUrl],
  ['flower-pot', flowerPotUrl],
  ['rinse-mouth', rinseMouthUrl],
  ['sandwich', sandwichUrl],
  ['seedling', seedlingUrl],
  ['slot', slotUrl],
  ['soil', soilUrl],
  ['store-toothbrush', storeToothbrushUrl],
  ['toothbrush', toothbrushUrl],
  ['toothpaste', toothpasteUrl],
  ['trash-distractor', trashDistractorUrl],
  ['watering-plant', wateringPlantUrl],
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.createLoadingScreen();
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start('GameScene');
  }

  private createLoadingScreen() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor('#fff6e8');

    const bg = this.add.graphics();
    bg.fillStyle(0xfff6e8, 1);
    bg.fillRect(0, 0, width, height);

    const title = this.add
      .text(width / 2, height / 2 - 58, 'Oficina dos Algoritmos', {
        fontFamily: 'Arial',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#25327a',
        stroke: '#ffffff',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setResolution(2);

    const label = this.add
      .text(width / 2, height / 2 - 14, 'Carregando...', {
        fontFamily: 'Arial',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#f57c00',
      })
      .setOrigin(0.5)
      .setResolution(2);

    const barWidth = 360;
    const barHeight = 22;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 + 26;

    const track = this.add.graphics();
    track.fillStyle(0xffffff, 0.95);
    track.fillRoundedRect(barX, barY, barWidth, barHeight, barHeight / 2);
    track.lineStyle(3, 0xffffff, 1);
    track.strokeRoundedRect(barX, barY, barWidth, barHeight, barHeight / 2);

    const fill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      fill.clear();
      fill.fillStyle(0x7ed321, 1);
      fill.fillRoundedRect(barX, barY, barWidth * value, barHeight, barHeight / 2);
    });

    this.load.once('complete', () => {
      fill.clear();
      fill.fillStyle(0x7ed321, 1);
      fill.fillRoundedRect(barX, barY, barWidth, barHeight, barHeight / 2);
      label.setText('Pronto!');
    });
  }
}
