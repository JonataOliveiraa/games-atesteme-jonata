import Phaser from 'phaser';
import { EventBus } from '../../../shared/EventBus';
import type { LevelConfig } from '../types';

export class UIScene extends Phaser.Scene {
  private levelConfig?: LevelConfig;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    EventBus.on('level-started', (config: LevelConfig) => {
      this.levelConfig = config;
    }, this);

    EventBus.on('game-metrics', () => {
      return;
    }, this);
  }

  destroy() {
    EventBus.off('level-started');
    EventBus.off('game-metrics');
  }
}
