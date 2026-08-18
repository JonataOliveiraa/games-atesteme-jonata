import Phaser from 'phaser'

import bgMuseumUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/bg-museum.png'

import hwKeyboardUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-keyboard.png'
import hwMouseUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-mouse.png'
import hwMonitorUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-monitor.png'
import hwHdUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-hd.png'
import hwSpeakerUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-speaker.png'
import hwPrinterUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/hw-printer.png'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import swGameUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-game.png'
import swBrowserUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-browser.png'
import swMusicUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-music.png'
import swPhotoUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-photo.png'
import swTextUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-text.png'
import swPrinterDriverUrl from '../../../../assets/games/EF02CO04/museu-vivo-do-computador/sw-printer-driver.png'

const ASSETS: Array<[string, string]> = [
  ['bg-museum', bgMuseumUrl],
  ['hw-keyboard', hwKeyboardUrl],
  ['hw-mouse', hwMouseUrl],
  ['hw-monitor', hwMonitorUrl],
  ['hw-hd', hwHdUrl],
  ['hw-speaker', hwSpeakerUrl],
  ['hw-printer', hwPrinterUrl],
  ['sw-game', swGameUrl],
  ['sw-browser', swBrowserUrl],
  ['sw-music', swMusicUrl],
  ['sw-photo', swPhotoUrl],
  ['sw-text', swTextUrl],
  ['sw-printer-driver', swPrinterDriverUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Museu Vivo do',
      subtitle: 'COMPUTADOR',
      description: 'Organizando as peças do museu...',
      theme: {
        background: { kind: 'grid', base: 0x0D1B2A, color: 0x4FC3F7, size: 64, alpha: 0.14 },
        card: 0x122436,
        cardShadow: 0x000000,
        cardBorder: 0x4FC3F7,
        title: 0xE3F2FD,
        subtitle: 0x4FC3F7,
        description: 0x90CAF9,
        titleStroke: 0x0D1B2A,
        progressTrack: 0x0D1B2A,
        progressBorder: 0x4FC3F7,
        progressFill: 0x4FC3F7,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene')
  }
}
