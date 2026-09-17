import Phaser from 'phaser'
import { H, W } from './data/layout'
import { BootScene } from './scenes/BootScene'
import { TutorialScene } from './scenes/TutorialScene'
import { GameScene } from './scenes/GameScene'

export const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#ffd9ae',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
    dom: { createContainer: false },
    scene: [BootScene, TutorialScene, GameScene],
}

export default config
