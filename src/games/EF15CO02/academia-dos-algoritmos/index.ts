import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { GameScene } from './scenes/GameScene'
import { C, hex } from './data/theme'
import { H, W } from './data/layout'

/**
 * A tela é 1280x720 FIXOS, e o `Scale.FIT` estica.
 *
 * Todo layout deste jogo escreve posição em número absoluto, e é isso que
 * permite conferir o enquadramento por conta (ver `scripts/check-academia.ts`).
 * O preço é que a tela tem formato próprio, 16:9 — numa caixa de outro formato
 * sobra faixa, e a faixa não é defeito: é a caixa não ter a forma do jogo.
 *
 * Não há `UIScene`. O HUD é desenhado pela própria `GameScene`, num container
 * que ela controla — uma cena a mais só para desenhar cinco coisas cria dois
 * ciclos de vida para sincronizar, e foi de onde vieram bugs em outros jogos
 * do catálogo.
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: W,
  height: H,
  backgroundColor: hex(C.ink),

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  /** Três dedos: uma criança apoia a mão na tela enquanto toca. */
  input: { activePointers: 3 },

  audio: { disableWebAudio: false },
  dom: { createContainer: false },

  scene: [BootScene, GameScene],
}

export default config
