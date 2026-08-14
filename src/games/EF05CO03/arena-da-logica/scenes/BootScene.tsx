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

/** Placa gerada por código. Desenhada em 2x e usada como nine-slice. */
export const PLACA = {
  w: 240,
  h: 140,
  radius: 26,
  slice: 44,
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
    const { w, h, radius } = PLACA

    PLACA_VARIANTS.forEach(([key, border]) => {
      if (this.textures.exists(key)) return

      const g = this.make.graphics({ x: 0, y: 0 }, false)

      g.fillStyle(0x0f2547, 0.28)
      g.fillRoundedRect(4, 8, w - 8, h - 8, radius)

      g.fillStyle(0xf8fafc, 1)
      g.fillRoundedRect(0, 0, w - 8, h - 12, radius)

      g.fillStyle(0xffffff, 0.9)
      g.fillRoundedRect(10, 10, w - 28, (h - 12) * 0.32, radius / 2)

      g.lineStyle(6, border, 1)
      g.strokeRoundedRect(3, 3, w - 14, h - 18, radius)

      g.generateTexture(key, w, h)
      g.destroy()
    })
  }
}