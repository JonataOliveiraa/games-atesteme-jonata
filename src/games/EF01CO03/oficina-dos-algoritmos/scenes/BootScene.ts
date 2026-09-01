import Phaser from 'phaser';
import { faseInicial } from '../../../../shared/level/faseInicial';

import algorithmGameCoverUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/algorithm-game-cover.png';
import bgLevelTwoUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/bg.3.2.png';
import bgLevelThreeUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/bg.3.3.png';
import bgUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/bg.3.png';
import bloomingFlowerUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/blooming-flower.png';
import breadUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/bread.png';
import brushingTeethUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/brushing-teeth.png';
import candyDistractorUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/candy-distractor.png';
import cheeseUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/cheese.png';
import coverSeedUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/cover-seed.png';
import cutFlowerDistractorUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/cut-flower-distractor.png';
import flowerPotUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/flower-pot.png';
import rinseMouthUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/rinse-mouth.png';
import sandwichUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/sandwich.png';
import seedlingUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/seedling.png';
import slotUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/slot.png';
import soilUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/soil.png';
import storeToothbrushUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/store-toothbrush.png';
import toothbrushUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/toothbrush.png';
import toothpasteUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/toothpaste.png';
import trashDistractorUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/trash-distractor.png';
import wateringPlantUrl from '../../../../assets/games/EF01CO03/oficina-dos-algoritmos/watering-plant.png';
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen';
import { preloadLives } from '../../../../shared/hud/createLives'

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
    createLoadingScreen(this, {
      title: 'Oficina dos Algoritmos',
      subtitle: 'Passo a passo',
      description: 'Carregando...',
      theme: {
        background: { kind: 'dots', base: 0xfff6e8, color: 0xf57c00, alpha: 0.14, size: 64, radius: 6 },
        card: 0x25327a,
        cardShadow: 0x141c48,
        cardHighlight: 0xffffff,
        cardBorder: 0xffb74d,
        title: 0xffffff,
        subtitle: 0xffd166,
        description: 0xe8ecff,
        titleStroke: 0x141c48,
        progressTrack: 0x141c48,
        progressBorder: 0xffffff,
        progressFill: 0x7ed321,
        progressHighlight: 0xffffff,
      },
    });
    ASSETS.forEach(([key, url]) => this.load.image(key, url));
      preloadLives(this)
  }

  create() {
    // A plataforma manda ?stage=N; fora do embed continua abrindo no 1.
    this.scene.start('GameScene', { level: faseInicial(this, 1) });
  }
}
