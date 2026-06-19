import Phaser from 'phaser'

import bgKitchenUrl  from '../../../assets/games/EF03CO03/bg-kitchen.png'
import bgLoadingUrl  from '../../../assets/games/EF03CO03/bg-loading.png'
import characterChefUrl from '../../../assets/games/EF03CO03/character-chef.png'
import cardSubtaskUrl from '../../../assets/games/EF03CO03/ard-subtask.png'
import missionBoardUrl from '../../../assets/games/EF03CO03/mission-board.png'
import timelineSlotUrl from '../../../assets/games/EF03CO03/timeline-slot.png'
import timelineSlotFilledUrl from '../../../assets/games/EF03CO03/timeline-slot-filled.png'
import timelineLaneParallelUrl from '../../../assets/games/EF03CO03/timeline-lane-parallel.png'
import iconCheckSubtaskUrl from '../../../assets/games/EF03CO03/icon-check-subtask.png'

const ASSETS: Array<[string, string]> = [
  ['bg-kitchen',       bgKitchenUrl],
  ['character-chef',    characterChefUrl],
  ['card-subtask',      cardSubtaskUrl],
  ['mission-board',     missionBoardUrl],
  ['timeline-slot',         timelineSlotUrl],
  ['timeline-slot-filled',  timelineSlotFilledUrl],
  ['timeline-lane-parallel', timelineLaneParallelUrl],
  ['icon-check-subtask',     iconCheckSubtaskUrl],
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
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x3e2723).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, '👨‍🍳  Chef dos Subproblemas', {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFF3E0',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Organizando a cozinha...', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#FFCC80',
    }).setOrigin(0.5).setDepth(1)

    const barW = 500
    const barBg = this.add.rectangle(640, 450, barW + 8, 20, 0x3e2723)
      .setStrokeStyle(2, 0xFFCC80).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 450, 4, 16, 0xFFCC80).setOrigin(0, 0.5).setDepth(1)
    void barBg

    this.load.on('progress', (v: number) => {
      bar.setSize(Math.max(4, barW * v), 16)
    })
  }
}
