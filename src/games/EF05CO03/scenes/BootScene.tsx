import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import bgArenaUrl from '../../../assets/games/EF05CO03/bg-arena.png'
import bgArenaMestreUrl from '../../../assets/games/EF05CO03/bg-arena-mestre.png'

import portaoFechadoUrl from '../../../assets/games/EF05CO03/portao-fechado.png'
import portaoAbertoUrl from '../../../assets/games/EF05CO03/portao-aberto.png'
import portaoTravaUrl from '../../../assets/games/EF05CO03/portao-trava.png'

import opNaoUrl from '../../../assets/games/EF05CO03/op-nao.png'
import opNaoOnUrl from '../../../assets/games/EF05CO03/op-nao-on.png'
import opEUrl from '../../../assets/games/EF05CO03/op-e.png'
import opEOnUrl from '../../../assets/games/EF05CO03/op-e-on.png'
import opOuUrl from '../../../assets/games/EF05CO03/op-ou.png'
import opOuOnUrl from '../../../assets/games/EF05CO03/op-ou-on.png'

import btnVUrl from '../../../assets/games/EF05CO03/btn-v.png'
import btnFUrl from '../../../assets/games/EF05CO03/btn-f.png'
import seloVerdadeiroUrl from '../../../assets/games/EF05CO03/selo-verdadeiro.png'
import seloFalsoUrl from '../../../assets/games/EF05CO03/selo-falso.png'
import iconeInterrogacaoUrl from '../../../assets/games/EF05CO03/icone-interrogacao.png'

import canoNoUrl from '../../../assets/games/EF05CO03/cano-no.png'
import faiscaUrl from '../../../assets/games/EF05CO03/faisca.png'
import brilhoRadialUrl from '../../../assets/games/EF05CO03/brilho-radial.png'

import iconeAjudaUrl from '../../../assets/games/EF05CO03/icone-ajuda.png'

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
      title: 'Arena da Lógica',
      subtitle: 'Energizando os mecanismos...',
      accent: 0x8b5cf6,
      background: 0x0f2547,
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.buildPlacaTextures()

    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, phase: 0 })
  }

  /**
   * Gera as três variações da placa de sentença (neutra, certa, errada).
   * Não existe arquivo PNG para isso: a placa precisa esticar conforme o
   * tamanho da frase, então é desenhada aqui e consumida via nineslice.
   */
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