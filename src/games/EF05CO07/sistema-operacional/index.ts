import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

/**
 * A `UIScene` e o `components/SystemLayout` saíram da lista.
 *
 * Os dois existiam para desenhar coisas fora da cena de jogo, e para isso
 * precisavam de canais de mensagem só para mover números entre cenas que sempre
 * viveram juntas. Com tudo numa cena só, as coordenadas conversam.
 */
const EF05CO07Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#08131f',
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
}

export default EF05CO07Config
