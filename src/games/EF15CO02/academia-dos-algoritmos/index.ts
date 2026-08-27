import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { GardenScene } from './scenes/GardenScene'
import { C, hex } from './data/theme'
import { H, W } from './data/layout'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: hex(C.ink),

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  input: { activePointers: 3 },

  audio: { disableWebAudio: false },
  dom: { createContainer: false },

  scene: [BootScene, GameScene, GardenScene],
}

export default config
