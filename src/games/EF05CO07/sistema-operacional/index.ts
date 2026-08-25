import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

/**
 * A `UIScene` saiu da lista, e o `components/SystemLayout` também.
 *
 * Os dois existiam para desenhar o topo e as caixas de fora da cena de jogo, e
 * para isso precisavam de canais de mensagem — `registry`, eventos — só para
 * mover números entre cenas que sempre viveram juntas. O custo aparecia quando
 * a tela quebrava: entender um enquadramento exigia abrir três arquivos, e o
 * enunciado não tinha como saber onde o relógio estava.
 *
 * Com tudo numa cena só, o HUD é um container e as coordenadas conversam.
 */
const EF05CO07Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#081422',
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

export default EF05CO07Config
