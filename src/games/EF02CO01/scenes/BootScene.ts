import Phaser from 'phaser'
import { createLoadingScreen } from '../../../shared/loading/createLoadingScreen'

import hangarBgUrl from '../../../assets/games/EF02CO01/hangar-bg.png'
import aviaoUrl from '../../../assets/games/EF02CO01/aviao.png'
import barcoUrl from '../../../assets/games/EF02CO01/barco.png'
import bicicletaUrl from '../../../assets/games/EF02CO01/bicicleta.png'
import carroUrl from '../../../assets/games/EF02CO01/carro.png'
import fogueteUrl from '../../../assets/games/EF02CO01/foguete.png'
import helicopteroUrl from '../../../assets/games/EF02CO01/helicoptero.png'
import lanchaUrl from '../../../assets/games/EF02CO01/lancha.png'
import motoUrl from '../../../assets/games/EF02CO01/moto.png'
import navioUrl from '../../../assets/games/EF02CO01/navio.png'
import onibusUrl from '../../../assets/games/EF02CO01/onibus.png'
import patineteUrl from '../../../assets/games/EF02CO01/patinete.png'
import tremUrl from '../../../assets/games/EF02CO01/trem.png'

const ASSETS: Array<[string, string]> = [
  ['hangar-bg', hangarBgUrl],
  ['aviao', aviaoUrl],
  ['barco', barcoUrl],
  ['bicicleta', bicicletaUrl],
  ['carro', carroUrl],
  ['foguete', fogueteUrl],
  ['helicoptero', helicopteroUrl],
  ['lancha', lanchaUrl],
  ['moto', motoUrl],
  ['navio', navioUrl],
  ['onibus', onibusUrl],
  ['patinete', patineteUrl],
  ['trem', tremUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Hangar dos Transportes',
      subtitle: 'Preparando as pistas...',
      description: 'Organizando veículos por ar, terra, água e funcionamento',
      theme: {
        background: { kind: 'stripes', base: 0x071426, color: 0x4ea1ff, alpha: 0.14, size: 24, gap: 58, angle: 'diagonal' },
        card: 0x0f2238,
        cardShadow: 0x02070d,
        cardHighlight: 0x2e5275,
        cardBorder: 0x2e5275,
        title: 0xf4f8ff,
        subtitle: 0x4ea1ff,
        description: 0xb8c8d9,
        titleStroke: 0x071426,
        progressTrack: 0x142b45,
        progressBorder: 0x2e5275,
        progressFill: 0x4ea1ff,
        progressHighlight: 0xf4f8ff,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: 1, mission: 0, points: 0 })
  }
}