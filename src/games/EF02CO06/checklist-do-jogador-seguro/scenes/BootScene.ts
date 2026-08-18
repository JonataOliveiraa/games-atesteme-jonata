import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgDeviceUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/bg-device.png'

import iconShieldOkUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-shield-ok.png'
import iconShieldWarnUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-shield-warn.png'
import iconPasswordUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-password.png'
import iconLocationUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-location.png'
import iconCameraUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-camera.png'
import iconPurchasesUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-purchases.png'
import iconStrangersUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-strangers.png'
import iconPrivacityUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/icon-privacity.png'

import toggleOnUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/toggle-on.png'
import toggleOffUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/toggle-off.png'

import characterPlayersUrl from '../../../../assets/games/EF02CO06/checklist-do-jogador-seguro/character-players.png'

const C = {
  bg: 0x0d47a1,
  bgDeep: 0x0b2f6b,

  panel: 0xe3f2fd,
  shadow: 0x000000,
  white: 0xffffff,

  blue: 0x1565c0,
  blueDark: 0x0d47a1,

  yellow: 0xffd166,
  yellowDark: 0xf59e0b,

  ink: 0x102a43,
  muted: 0x35516d,
}

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
    createLoadingScreen(this, {
      title: 'Checklist',
      subtitle: 'DO JOGADOR SEGURO',
      description: 'Preparando as configuracoes de seguranca',
      theme: {
        background: {
          kind: 'stripes',
          base: C.bg,
          color: C.yellow,
          alpha: 0.12,
          size: 24,
          gap: 54,
          angle: 'diagonal',
        },

        card: C.panel,
        cardShadow: C.shadow,
        cardHighlight: C.white,
        cardBorder: C.yellow,

        title: C.blueDark,
        subtitle: C.yellowDark,
        description: C.muted,
        titleStroke: C.white,

        progressTrack: C.bgDeep,
        progressBorder: C.white,
        progressFill: C.yellow,
        progressHighlight: C.white,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene')
  }
}