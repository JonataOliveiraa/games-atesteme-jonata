import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

/**
 * A `UIScene` saiu da lista: ela era uma classe vazia registrada no config,
 * herdada de um esqueleto. O HUD nasce e morre junto da cena que conhece o
 * estado.
 */
const EF03CO05Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#1b2a41',
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

export default EF03CO05Config
