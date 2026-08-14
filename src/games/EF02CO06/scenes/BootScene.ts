import Phaser from 'phaser'

import bgDeviceUrl from '../../../assets/games/EF02CO06/bg-device.png'
import bgLoadingUrl from '../../../assets/games/EF02CO06/bg-loading.png'

import iconShieldOkUrl from '../../../assets/games/EF02CO06/icon-shield-ok.png'
import iconShieldWarnUrl from '../../../assets/games/EF02CO06/icon-shield-warn.png'
import iconPasswordUrl from '../../../assets/games/EF02CO06/icon-password.png'
import iconLocationUrl from '../../../assets/games/EF02CO06/icon-location.png'
import iconCameraUrl from '../../../assets/games/EF02CO06/icon-camera.png'
import iconPurchasesUrl from '../../../assets/games/EF02CO06/icon-purchases.png'
import iconStrangersUrl from '../../../assets/games/EF02CO06/icon-strangers.png'
import iconPrivacityUrl from '../../../assets/games/EF02CO06/icon-privacity.png'

import toggleOnUrl from '../../../assets/games/EF02CO06/toggle-on.png'
import toggleOffUrl from '../../../assets/games/EF02CO06/toggle-off.png'

import characterPlayersUrl from '../../../assets/games/EF02CO06/character-players.png'

const ASSETS: Array<[string, string]> = [
  ['bg-device', bgDeviceUrl],
  ['icon-shield-ok', iconShieldOkUrl],
  ['icon-shield-warn', iconShieldWarnUrl],
  ['icon-password', iconPasswordUrl],
  ['icon-location', iconLocationUrl],
  ['icon-camera', iconCameraUrl],
  ['icon-purchases', iconPurchasesUrl],
  ['icon-strangers', iconStrangersUrl],
  ['icon-privacity', iconPrivacityUrl],
  ['toggle-on', toggleOnUrl],
  ['toggle-off', toggleOffUrl],
  ['character-players', characterPlayersUrl],
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
    this.scene.launch('UIScene')
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, 'Checklist do Jogador Seguro', {
      fontSize: '38px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Preparando as configurações de segurança...', {
      fontSize: '22px',
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
