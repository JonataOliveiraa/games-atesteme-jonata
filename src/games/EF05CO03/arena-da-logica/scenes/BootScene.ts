import Phaser from 'phaser'
import bgArenaUrl from '../../../../assets/games/EF05CO03/arena-da-logica/bg-arena.png'
import bgArenaMestreUrl from '../../../../assets/games/EF05CO03/arena-da-logica/bg-arena-mestre.png'

import portaoFechadoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/portao-fechado.png'
import portaoAbertoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/portao-aberto.png'
import portaoTravaUrl from '../../../../assets/games/EF05CO03/arena-da-logica/portao-trava.png'

import opNaoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-nao.png'
import opNaoOnUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-nao-on.png'
import opEUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-e.png'
import opEOnUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-e-on.png'
import opOuUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-ou.png'
import opOuOnUrl from '../../../../assets/games/EF05CO03/arena-da-logica/op-ou-on.png'

import btnVUrl from '../../../../assets/games/EF05CO03/arena-da-logica/btn-v.png'
import btnFUrl from '../../../../assets/games/EF05CO03/arena-da-logica/btn-f.png'
import seloVerdadeiroUrl from '../../../../assets/games/EF05CO03/arena-da-logica/selo-verdadeiro.png'
import seloFalsoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/selo-falso.png'
import iconeInterrogacaoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/icone-interrogacao.png'

import canoNoUrl from '../../../../assets/games/EF05CO03/arena-da-logica/cano-no.png'
import faiscaUrl from '../../../../assets/games/EF05CO03/arena-da-logica/faisca.png'
import brilhoRadialUrl from '../../../../assets/games/EF05CO03/arena-da-logica/brilho-radial.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import iconeAjudaUrl from '../../../../assets/games/EF05CO03/arena-da-logica/icone-ajuda.png'

const ASSETS: Array<[string, string]> = [
  ['bg-arena', bgArenaUrl],
  ['bg-arena-mestre', bgArenaMestreUrl],
  ['portao-fechado', portaoFechadoUrl],
  ['portao-aberto', portaoAbertoUrl],
  ['portao-trava', portaoTravaUrl],
  ['op-nao', opNaoUrl],
  ['op-nao-on', opNaoOnUrl],
  ['op-e', opEUrl],
  ['op-e-on', opEOnUrl],
  ['op-ou', opOuUrl],
  ['op-ou-on', opOuOnUrl],
  ['btn-v', btnVUrl],
  ['btn-f', btnFUrl],
  ['selo-verdadeiro', seloVerdadeiroUrl],
  ['selo-falso', seloFalsoUrl],
  ['icone-interrogacao', iconeInterrogacaoUrl],
  ['cano-no', canoNoUrl],
  ['faisca', faiscaUrl],
  ['brilho-radial', brilhoRadialUrl],
  ['icone-ajuda', iconeAjudaUrl],
]

/**
 * A PLACA, gerada por código e usada como nine-slice.
 *
 * ── O ENQUADRAMENTO ESTAVA TORTO NA PRÓPRIA TEXTURA ─────────────────────
 *
 * O desenho antigo era "cartão colado no canto de cima, sombra transbordando
 * para baixo e para a direita": o corpo ocupava 0..232 x 0..128 dentro de uma
 * imagem de 240x140. Ou seja, o centro VISÍVEL do cartão ficava em (116, 64) e
 * o centro da IMAGEM em (120, 70). Como a placa é colocada com `origin(0.5)`, o
 * retângulo azul aparecia 4px à esquerda e 6px acima de onde o código achava
 * que ele estava — e o nine-slice, ao esticar o miolo, espalhava esse desconto
 * de forma desigual entre as bordas.
 *
 * Agora o cartão é desenhado com MARGEM UNIFORME (`margem`) nos quatro lados, e
 * a sombra cabe dentro dessa margem. Centro visível = centro da imagem, e o
 * enquadramento passa a ser o mesmo em cima, embaixo, à esquerda e à direita.
 *
 * `slice` (44) precisa ser maior que `margem + radius + borda` (8+26+3 = 37),
 * senão o canto arredondado entra na faixa esticada e derrete.
 */
export const PLACA = {
  w: 240,
  h: 140,
  radius: 26,
  slice: 44,
  /** Margem igual nos quatro lados. É ela que centra o cartão na imagem. */
  margem: 8,
  /** O quanto a sombra desce. Tem que caber na margem. */
  sombraDY: 3,
  borda: 6,
}

const PLACA_VARIANTS: Array<[string, number]> = [
  ['bloco-placa', 0x1e3a8a],
  ['bloco-placa-v', 0x22c55e],
  ['bloco-placa-f', 0xef4444],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Arena da',
      subtitle: 'LÓGICA',
      description: 'Energizando os mecanismos...',
      theme: {
        background: { kind: 'rays', base: 0x0f2547, color: 0x8b5cf6, count: 20, alpha: 0.1 },
        card: 0x14213d,
        cardShadow: 0x000000,
        cardBorder: 0x8b5cf6,
        title: 0xf8fafc,
        subtitle: 0xc4b5fd,
        description: 0x93c5fd,
        titleStroke: 0x0f2547,
        progressTrack: 0x0f2547,
        progressBorder: 0x93c5fd,
        progressFill: 0x8b5cf6,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.buildPlacaTextures()

    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }

  private buildPlacaTextures() {
    const { w, h, radius, margem: m, sombraDY, borda, slice } = PLACA
    const cw = w - m * 2
    const ch = h - m * 2

    PLACA_VARIANTS.forEach(([key, border]) => {
      if (this.textures.exists(key)) return

      const g = this.make.graphics({ x: 0, y: 0 }, false)

      // a sombra é o MESMO retângulo, só descido — assim ela não puxa o
      // cartão para um lado, e cabe inteira dentro da margem
      g.fillStyle(0x0f2547, 0.3)
      g.fillRoundedRect(m, m + sombraDY, cw, ch, radius)

      g.fillStyle(0xf8fafc, 1)
      g.fillRoundedRect(m, m, cw, ch, radius)

      /*
       * O brilho de cima fica INTEIRO dentro da fatia superior do nine-slice.
       * Se ele cruzasse a linha de `slice`, a parte de baixo dele seria
       * esticada junto com o miolo e o reflexo apareceria deformado nas placas
       * mais largas.
       */
      const brilhoH = slice - m - 10
      g.fillStyle(0xffffff, 0.9)
      g.fillRoundedRect(m + 10, m + 6, cw - 20, brilhoH, radius / 2)

      g.lineStyle(borda, border, 1)
      g.strokeRoundedRect(m, m, cw, ch, radius)

      g.generateTexture(key, w, h)
      g.destroy()
    })
  }
}