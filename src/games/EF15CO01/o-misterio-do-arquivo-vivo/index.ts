import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { IntroScene } from './scenes/IntroScene'
import { GameScene } from './scenes/GameScene'
import { H, W } from './data/layout'

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#f3e2c8',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { activePointers: 3 },
    dom: { createContainer: false },
    scene: [BootScene, IntroScene, GameScene],
}

export default config
