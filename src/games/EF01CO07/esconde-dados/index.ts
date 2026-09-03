import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

const EF01CO07EscondeDadosConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#bfe7ff',
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: {
        activePointers: 3,
    },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
}

export default EF01CO07EscondeDadosConfig
