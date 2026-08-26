import Phaser from 'phaser'

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
    this.createLoadingScreen()
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    this.cameras.main.setBackgroundColor('#0d1b2a')

    const bg = this.add.graphics().setDepth(0)
    bg.fillStyle(0x0d1b2a, 1)
    bg.fillRect(0, 0, 1280, 720)
    bg.fillStyle(0x2f80ed, 0.12)
    bg.fillRoundedRect(210, 158, 860, 382, 36)
    bg.lineStyle(4, 0x7fd4ff, 0.72)
    bg.strokeRoundedRect(210, 158, 860, 382, 36)

    this.add.text(640, 282, 'Central de Entrada e Saída', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      fontSize: '48px',
      color: '#f4f7fb',
      align: 'center',
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.add.text(640, 344, 'Ligando a central...', {
      fontFamily: 'DynaPuff, Arial, sans-serif',
      fontStyle: 'bold',
      fontSize: '24px',
      color: '#7fd4ff',
      align: 'center',
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    const barW = 480
    const barBg = this.add.graphics().setDepth(1)
    barBg.fillStyle(0xf4f7fb, 0.18)
    barBg.fillRoundedRect(640 - barW / 2, 414, barW, 20, 10)

    const bar = this.add.graphics().setDepth(2)
    const paint = (v: number) => {
      bar.clear()
      bar.fillStyle(0x2f80ed, 1)
      bar.fillRoundedRect(640 - barW / 2, 414, Math.max(16, barW * v), 20, 10)
    }
    paint(0.04)
    this.load.on('progress', paint)
  }
}