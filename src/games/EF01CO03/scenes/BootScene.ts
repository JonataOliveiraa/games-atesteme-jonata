import Phaser from 'phaser';

import algorithmGameCoverUrl from '../../../assets/games/EF01CO03/algorithm-game-cover.png';
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
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
  }

  create() {
    this.scene.start('GameScene');
  }
}
