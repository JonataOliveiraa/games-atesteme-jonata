import Phaser from 'phaser'

import bgKitchenUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/bg-kitchen.png'
import bgLoadingUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/bg-loading.png'
import characterChefUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/character-chef.png'
import iconCheckUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/icon-check-subtask.png'
import cardTaskUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/ard-subtask.png'
import slotBgUrl from '../../../../assets/games/EF03CO03/chef-dos-subproblemas/slot-bg.png'

const ASSETS: Array<[string, string]> = [
  ['bg-kitchen', bgKitchenUrl],
  ['character-chef', characterChefUrl],
  ['icon-check', iconCheckUrl],
  ['card-task', cardTaskUrl],
  ['slot-bg', slotBgUrl],
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
    this.scene.launch('UIScene')
  }

  private createLoadingScreen() {
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x3e2723).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 296, 'Chef dos Subproblemas', {
      fontSize: '48px', fontFamily: 'Arial Black, Arial',
      color: '#FFF3E0', stroke: '#000000', strokeThickness: 7,
      align: 'center',
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Preparando os subproblemas...', {
      fontSize: '26px', fontFamily: 'Arial', color: '#FFCC80',
    }).setOrigin(0.5).setDepth(1)

    const barW = 500
    const barBg = this.add.rectangle(640, 450, barW + 8, 20, 0x3e2723)
      .setStrokeStyle(2, 0xFFCC80).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 450, 4, 16, 0xFFCC80)
      .setOrigin(0, 0.5).setDepth(2)
    void barBg
    this.load.on('progress', (v: number) => { bar.setSize(Math.max(4, barW * v), 16) })
  }
}
