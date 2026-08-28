import Phaser from 'phaser'
import { faseInicial } from '../../../../shared/level/faseInicial'

import bgCentralUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/bg-central.png'
import computadorCentralUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/computador-central.png'
import coverUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/cover-central-entrada-saida.png'

import devAltoFalanteUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-alto-falante.png'
import devCameraUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-camera.png'
import devImpressoraUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-impressora.png'
import devMicrofoneUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-microfone.png'
import devMonitorUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-monitor.png'
import devMouseUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-mouse.png'
import devTecladoUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/dev-teclado.png'

import icFotoUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-foto.png'
import icImpressoUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-impresso.png'
import icSomUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-som.png'
import icTelaUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-tela.png'
import icTextoUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-texto.png'
import icVozUrl from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/ic-voz.png'

import op01Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-01.png'
import op02Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-02.png'
import op03Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-03.png'
import op04Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-04.png'
import op05Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-05.png'
import op06Url from '../../../../assets/games/EF03CO06/central-de-entrada-e-saida/op-06.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

const ASSETS: Array<[string, string]> = [
  ['bg-central', bgCentralUrl],
  ['computador-central', computadorCentralUrl],
  ['cover-central-de-entrada-e-saida', coverUrl],
  ['dev-alto-falante', devAltoFalanteUrl],
  ['dev-camera', devCameraUrl],
  ['dev-impressora', devImpressoraUrl],
  ['dev-microfone', devMicrofoneUrl],
  ['dev-monitor', devMonitorUrl],
  ['dev-mouse', devMouseUrl],
  ['dev-teclado', devTecladoUrl],
  ['ic-foto', icFotoUrl],
  ['ic-impresso', icImpressoUrl],
  ['ic-som', icSomUrl],
  ['ic-tela', icTelaUrl],
  ['ic-texto', icTextoUrl],
  ['ic-voz', icVozUrl],
  ['op-01', op01Url],
  ['op-02', op02Url],
  ['op-03', op03Url],
  ['op-04', op04Url],
  ['op-05', op05Url],
  ['op-06', op06Url],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Central de Entrada e Saída',
      subtitle: 'Entra e sai',
      description: 'Ligando a central...',
      theme: {
        background: { kind: 'grid', base: 0x0d1b2a, color: 0x7fd4ff, alpha: 0.12, size: 72 },
        card: 0x13324f,
        cardShadow: 0x05101c,
        cardHighlight: 0xffffff,
        cardBorder: 0x7fd4ff,
        title: 0xf4f7fb,
        subtitle: 0x7fd4ff,
        description: 0xd7e6f5,
        titleStroke: 0x05101c,
        progressTrack: 0x05101c,
        progressBorder: 0x7fd4ff,
        progressFill: 0x2f80ed,
        progressHighlight: 0xffffff,
      },
    })
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene', { level: faseInicial(this, 1) })
  }
}