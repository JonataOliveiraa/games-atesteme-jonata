import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'

import bgSaguaoUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/bg-saguao.png'
import bgSalaUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/bg-sala.png'

import porta1Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-1.png'
import porta2Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-2.png'
import porta3Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-3.png'
import porta4Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-4.png'
import porta5Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-5.png'
import porta6Url from '../../../../assets/games/EF15CO01/museu-das-estruturas/porta-6.png'

import roboNormalUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/robo-normal.png'
import roboApontandoUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/robo-apontando.png'
import roboDuvidaUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/robo-duvida.png'
import roboFelizUrl from '../../../../assets/games/EF15CO01/museu-das-estruturas/robo-feliz.png'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

const ASSETS: Array<[string, string]> = [
  ['bg-saguao', bgSaguaoUrl],
  ['bg-sala', bgSalaUrl],

  ['porta-1', porta1Url],
  ['porta-2', porta2Url],
  ['porta-3', porta3Url],
  ['porta-4', porta4Url],
  ['porta-5', porta5Url],
  ['porta-6', porta6Url],

  ['robo-normal', roboNormalUrl],
  ['robo-apontando', roboApontandoUrl],
  ['robo-duvida', roboDuvidaUrl],
  ['robo-feliz', roboFelizUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    createLoadingScreen(this, {
      title: 'Museu das Estruturas',
      subtitle: 'Abrindo as salas',
      description: 'O Tino está acendendo as luzes...',
      theme: {
        background: { kind: 'stripes', base: 0xb8a2d9, color: 0xf9eff2, alpha: 0.16, size: 40, gap: 60, angle: 'diagonal' },
        card: 0xf9eff2,
        cardShadow: 0x8a72b5,
        cardHighlight: 0xffffff,
        cardBorder: 0x8a72b5,
        title: 0x4a3a63,
        subtitle: 0x8a72b5,
        description: 0x7a6a93,
        titleStroke: 0xffffff,
        progressTrack: 0xefe9f4,
        progressBorder: 0x8a72b5,
        progressFill: 0xfbe9ac,
        progressHighlight: 0xffffff,
      },
    })

    ASSETS.forEach(([key, url]) => this.load.image(key, url))
      preloadLives(this)
  }

    create() {
    this.scene.launch('UIScene')
    this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
  }
}