import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'
import { W, H } from './data/layout'

const EF05CO06Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#0b1220',
    scene: [BootScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { pixelArt: false, antialias: true, roundPixels: true },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
}

export default EF05CO06Config