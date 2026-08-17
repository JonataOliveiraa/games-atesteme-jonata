import Phaser from 'phaser'
import { W, H } from './data'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { UIScene } from './scenes/UIScene'

export const EF05CO07Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: W,
    height: H,
    backgroundColor: '#081321',
    scene: [BootScene, GameScene, UIScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
    },
    input: {
        activePointers: 3,
    },
    audio: {
        disableWebAudio: false,
    },
    dom: {
        createContainer: false,
    },
}

export default EF05CO07Config
