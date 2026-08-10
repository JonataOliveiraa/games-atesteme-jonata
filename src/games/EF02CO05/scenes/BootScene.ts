import Phaser from 'phaser'

import bgCityMapUrl from '../../../assets/games/EF02CO05/bg-city-map.png'
import bgLoadingUrl from '../../../assets/games/EF02CO05/bg-loading.png'

import locationHouseUrl  from '../../../assets/games/EF02CO05/location-house.png'
import locationSchoolUrl from '../../../assets/games/EF02CO05/location-school.png'
import locationStreetUrl from '../../../assets/games/EF02CO05/location-street.png'
import locationStoreUrl  from '../../../assets/games/EF02CO05/location-store.png'
import locationBankUrl  from '../../../assets/games/EF02CO05/location-bank.png'

import locationHouseSelectUrl  from '../../../assets/games/EF02CO05/location-house-select.png'
import locationSchoolSelectUrl from '../../../assets/games/EF02CO05/location-school-select.png'
import locationStreetSelectUrl from '../../../assets/games/EF02CO05/location-street-select.png'
import locationStoreSelectUrl  from '../../../assets/games/EF02CO05/location-store-select.png'
import locationBankSelectUrl  from '../../../assets/games/EF02CO05/location-bank-select.png'

import techTvUrl         from '../../../assets/games/EF02CO05/tech-tv.png'
import techComputerUrl   from '../../../assets/games/EF02CO05/tech-computer.png'
import techTabletUrl     from '../../../assets/games/EF02CO05/tech-tablet.png'
import techSmartphoneUrl from '../../../assets/games/EF02CO05/tech-smartphone.png'
import techRadioUrl      from '../../../assets/games/EF02CO05/tech-radio.png'
import techCameraUrl     from '../../../assets/games/EF02CO05/tech-camera.png'
import techGpsUrl        from '../../../assets/games/EF02CO05/tech-gps.png'
import techAtmUrl        from '../../../assets/games/EF02CO05/tech-atm.png'

const ASSETS: Array<[string, string]> = [
  ['bg-city-map', bgCityMapUrl],
  ['location-house',  locationHouseUrl],
  ['location-school', locationSchoolUrl],
  ['location-street', locationStreetUrl],
  ['location-bank',   locationBankUrl],
  ['location-store',  locationStoreUrl],
  ['location-house-select',  locationHouseSelectUrl],
  ['location-school-select', locationSchoolSelectUrl],
  ['location-street-select', locationStreetSelectUrl],
  ['location-bank-select',   locationBankSelectUrl],
  ['location-store-select',  locationStoreSelectUrl],
  ['tech-tv',         techTvUrl],
  ['tech-computer',   techComputerUrl],
  ['tech-tablet',     techTabletUrl],
  ['tech-smartphone', techSmartphoneUrl],
  ['tech-radio',      techRadioUrl],
  ['tech-camera',     techCameraUrl],
  ['tech-gps',        techGpsUrl],
  ['tech-atm',        techAtmUrl],
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
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x0c3b2e).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, '🏙️  Cidade das Tecnologias', {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial',
      color: '#E8F5E9',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Montando o mapa da cidade...', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#A5D6A7',
    }).setOrigin(0.5).setDepth(1)

    const barW = 500
    const barBg = this.add.rectangle(640, 450, barW + 8, 20, 0x0c3b2e)
      .setStrokeStyle(2, 0xA5D6A7).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 450, 4, 16, 0xA5D6A7).setOrigin(0, 0.5).setDepth(1)
    void barBg

    this.load.on('progress', (v: number) => {
      bar.setSize(Math.max(4, barW * v), 16)
    })
  }
}
