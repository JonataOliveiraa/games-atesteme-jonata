import Phaser from 'phaser'

import hangarBgUrl    from '../../../assets/games/EF02CO01/hangar-bg.png'
import cardArUrl      from '../../../assets/games/EF02CO01/card-ar.png'
import cardTerraUrl   from '../../../assets/games/EF02CO01/card-terra.png'
import cardAguaUrl    from '../../../assets/games/EF02CO01/card-agua.png'
import panelFilterUrl from '../../../assets/games/EF02CO01/panel-filter.png'
import bgLoadingUrl   from '../../../assets/games/EF02CO01/bg-loading.png'
import aviaoUrl       from '../../../assets/games/EF02CO01/aviao.png'
import barcoUrl     from '../../../assets/games/EF02CO01/barco.png'
import bicicletaUrl from '../../../assets/games/EF02CO01/bicicleta.png'
import carroUrl     from '../../../assets/games/EF02CO01/carro.png'
import fogueteUrl   from '../../../assets/games/EF02CO01/foguete.png'
import helicopteroUrl from '../../../assets/games/EF02CO01/helicoptero.png'
import lanchaUrl    from '../../../assets/games/EF02CO01/lancha.png'
import motoUrl      from '../../../assets/games/EF02CO01/moto.png'
import navioUrl     from '../../../assets/games/EF02CO01/navio.png'
import onibusUrl    from '../../../assets/games/EF02CO01/onibus.png'
import patineteUrl  from '../../../assets/games/EF02CO01/patinete.png'
import tremUrl      from '../../../assets/games/EF02CO01/trem.png'

const ASSETS: Array<[string, string]> = [
  ['hangar-bg',    hangarBgUrl],
  ['card-ar',      cardArUrl],
  ['card-terra',   cardTerraUrl],
  ['card-agua',    cardAguaUrl],
  ['panel-filter', panelFilterUrl],
  ['veh-aviao',    aviaoUrl],
  ['veh-barco',      barcoUrl],
  ['veh-bicicleta',  bicicletaUrl],
  ['veh-carro',      carroUrl],
  ['veh-foguete',    fogueteUrl],
  ['veh-helicoptero', helicopteroUrl],
  ['veh-lancha',     lanchaUrl],
  ['veh-moto',       motoUrl],
  ['veh-navio',      navioUrl],
  ['veh-onibus',     onibusUrl],
  ['veh-patinete',   patineteUrl],
  ['veh-trem',       tremUrl],
]

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Load bg-loading first so we can swap it in once ready
    this.load.image('bg-loading', bgLoadingUrl)
    this.createLoadingScreen()
    ASSETS.forEach(([key, url]) => this.load.image(key, url))
  }

  create() {
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    // Dark fallback while bg-loading itself loads
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x1A2340).setDepth(0)

    // Swap in the real background image once it finishes loading
    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, '✈️  Hangar dos Modelos', {
      fontSize: '48px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Preparando os veículos...', {
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
