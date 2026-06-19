import Phaser from 'phaser'

import bgMuseumUrl   from '../../../assets/games/EF02CO04/bg-museum.png'
import bgLoadingUrl  from '../../../assets/games/EF02CO04/bg-loading.png'
import categoryHwUrl from '../../../assets/games/EF02CO04/category-hw.png'
import categorySwUrl from '../../../assets/games/EF02CO04/category-sw.png'

import hwKeyboardUrl from '../../../assets/games/EF02CO04/hw-keyboard.png'
import hwMouseUrl    from '../../../assets/games/EF02CO04/hw-mouse.png'
import hwMonitorUrl  from '../../../assets/games/EF02CO04/hw-monitor.png'
import hwHdUrl       from '../../../assets/games/EF02CO04/hw-hd.png'
import hwSpeakerUrl  from '../../../assets/games/EF02CO04/hw-speaker.png'
import hwPrinterUrl  from '../../../assets/games/EF02CO04/hw-printer.png'

import swGameUrl          from '../../../assets/games/EF02CO04/sw-game.png'
import swBrowserUrl       from '../../../assets/games/EF02CO04/sw-browser.png'
import swMusicUrl         from '../../../assets/games/EF02CO04/sw-music.png'
import swPhotoUrl         from '../../../assets/games/EF02CO04/sw-photo.png'
import swTextUrl          from '../../../assets/games/EF02CO04/sw-text.png'
import swPrinterDriverUrl from '../../../assets/games/EF02CO04/sw-printer-driver.png'

const ASSETS: Array<[string, string]> = [
  ['bg-museum',    bgMuseumUrl],
  ['category-hw',  categoryHwUrl],
  ['category-sw',  categorySwUrl],
  ['hw-keyboard',  hwKeyboardUrl],
  ['hw-mouse',     hwMouseUrl],
  ['hw-monitor',   hwMonitorUrl],
  ['hw-hd',        hwHdUrl],
  ['hw-speaker',   hwSpeakerUrl],
  ['hw-printer',   hwPrinterUrl],
  ['sw-game',           swGameUrl],
  ['sw-browser',         swBrowserUrl],
  ['sw-music',           swMusicUrl],
  ['sw-photo',           swPhotoUrl],
  ['sw-text',            swTextUrl],
  ['sw-printer-driver',  swPrinterDriverUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('bg-loading', bgLoadingUrl)
    this.createLoadingScreen()
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, '🏛️  Museu Vivo do Computador', {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Organizando as peças do museu...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#90CAF9',
    }).setOrigin(0.5).setDepth(1)

    const barW = 500
    const barBg = this.add.rectangle(640, 450, barW + 8, 20, 0x0D1B2A)
      .setStrokeStyle(2, 0x4FC3F7).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 450, 4, 16, 0x4FC3F7).setOrigin(0, 0.5).setDepth(1)
    void barBg

    this.load.on('progress', (v: number) => {
      bar.setSize(Math.max(4, barW * v), 16)
    })
  }
}
