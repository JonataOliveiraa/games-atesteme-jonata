import Phaser from 'phaser'

import wallpaperUrl   from '../../../assets/games/EF03CO02/wallpaper.png'
import bgLoadingUrl   from '../../../assets/games/EF03CO02/bg-loading.png'
import tileFloorUrl   from '../../../assets/games/EF03CO02/tile-floor.png'
import tileWallUrl    from '../../../assets/games/EF03CO02/tile-wall.png'
import tileGoalUrl    from '../../../assets/games/EF03CO02/tile-goal.png'
import robotIdleUrl   from '../../../assets/games/EF03CO02/robot-idle.png'
import robotWalkUrl   from '../../../assets/games/EF03CO02/robot-walk.png'
import blockWhileUrl     from '../../../assets/games/EF03CO02/block-while.png'
import blockConditionUrl from '../../../assets/games/EF03CO02/block-condition.png'
import blockActionUrl    from '../../../assets/games/EF03CO02/block-action.png'

const ASSETS: Array<[string, string]> = [
  ['wallpaper',   wallpaperUrl],
  ['tile-floor',  tileFloorUrl],
  ['tile-wall',   tileWallUrl],
  ['tile-goal',   tileGoalUrl],
  ['robot-idle',  robotIdleUrl],
  ['robot-walk',  robotWalkUrl],
  ['block-while',     blockWhileUrl],
  ['block-condition', blockConditionUrl],
  ['block-action',    blockActionUrl],
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
    const fallback = this.add.rectangle(640, 360, 1280, 720, 0x1a2340).setDepth(0)

    this.load.once('filecomplete-image-bg-loading', () => {
      fallback.destroy()
      this.add.image(640, 360, 'bg-loading').setDisplaySize(1280, 720).setDepth(0)
    })

    this.add.text(640, 310, '🤖  Labirinto do Enquanto', {
      fontSize: '40px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 390, 'Montando o circuito do robô...', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#90CAF9',
    }).setOrigin(0.5).setDepth(1)

    const barW = 500
    const barBg = this.add.rectangle(640, 450, barW + 8, 20, 0x1a2340)
      .setStrokeStyle(2, 0x4FC3F7).setDepth(1)
    const bar = this.add.rectangle(640 - barW / 2, 450, 4, 16, 0x4FC3F7).setOrigin(0, 0.5).setDepth(1)
    void barBg

    this.load.on('progress', (v: number) => {
      bar.setSize(Math.max(4, barW * v), 16)
    })
  }
}
