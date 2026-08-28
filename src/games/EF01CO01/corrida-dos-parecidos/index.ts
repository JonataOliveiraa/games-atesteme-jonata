import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { H, W } from './data/layout'

const CorridaDosParecidosConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#63b552',
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { pixelArt: false, antialias: true, roundPixels: true },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
}

export default CorridaDosParecidosConfig
