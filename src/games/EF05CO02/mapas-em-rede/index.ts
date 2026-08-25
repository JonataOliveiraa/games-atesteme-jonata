import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'

const EF05CO02Config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#33200f',
    /*
     * A `UIScene` SAIU da lista.
     *
     * Ela existia só para desenhar o topo, e conversava com a cena de jogo por
     * `registry.set('hud', ...)` e por três eventos de `EventBus` — três canais
     * de mensagem entre duas cenas que sempre viveram juntas. O HUD agora é um
     * container da própria `GameScene`, como nos outros jogos recriados.
     */
    scene: [BootScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    input: { activePointers: 3 },
    audio: { disableWebAudio: false },
    dom: { createContainer: false },
}

export default EF05CO02Config