import Phaser from 'phaser'
import wallpaperUrl     from '../../../assets/games/EF03CO02/wallpaper.png'
import robotIdleUrl    from '../../../assets/games/EF03CO02/robot-idle.png'
import robotHappyUrl   from '../../../assets/games/EF03CO02/robot-happy.png'
import robotBumpUrl    from '../../../assets/games/EF03CO02/robot-bump.png'
import blockKeywordUrl from '../../../assets/games/EF03CO02/block-keyword.png'
import blockCondUrl    from '../../../assets/games/EF03CO02/block-conditional.png'
import blockActionUrl  from '../../../assets/games/EF03CO02/block-action.png'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.image('wallpaper',      wallpaperUrl)
    this.load.image('robot-idle',     robotIdleUrl)
    this.load.image('robot-happy',    robotHappyUrl)
    this.load.image('robot-bump',     robotBumpUrl)
    this.load.image('block-keyword',  blockKeywordUrl)
    this.load.image('block-condition', blockCondUrl)
    this.load.image('block-action',   blockActionUrl)
    this.createLoadingScreen()
  }

  create() {
    this.scene.start('GameScene')
  }

  private createLoadingScreen() {
    this.add.rectangle(640, 360, 1280, 720, 0x0d1b2a)

    // Subtle circuit grid
    const grid = this.add.graphics().setAlpha(0.10)
    grid.lineStyle(1, 0x4fc3f7)
    for (let x = 0; x <= 1280; x += 80) grid.lineBetween(x, 0, x, 720)
    for (let y = 0; y <= 720; y += 80) grid.lineBetween(0, y, 1280, y)

    // Drawn robot icon
    const rx = 640, ry = 210
    const bot = this.add.graphics().setDepth(1)
    bot.fillStyle(0x1e40af, 1)
    bot.fillRoundedRect(rx - 40, ry - 2, 80, 62, 12)       // body
    bot.lineStyle(2, 0x93c5fd, 0.5)
    bot.strokeRoundedRect(rx - 40, ry - 2, 80, 62, 12)
    bot.fillStyle(0x2563eb, 1)
    bot.fillRoundedRect(rx - 34, ry - 60, 68, 54, 12)       // head
    bot.lineStyle(2, 0x93c5fd, 0.5)
    bot.strokeRoundedRect(rx - 34, ry - 60, 68, 54, 12)
    bot.fillStyle(0xffffff, 1)
    bot.fillCircle(rx - 13, ry - 38, 9)                      // left eye white
    bot.fillCircle(rx + 13, ry - 38, 9)                      // right eye white
    bot.fillStyle(0x1e3a8a, 1)
    bot.fillCircle(rx - 13, ry - 38, 5)                      // left pupil
    bot.fillCircle(rx + 13, ry - 38, 5)                      // right pupil
    bot.lineStyle(3, 0x93c5fd, 1)
    bot.lineBetween(rx, ry - 60, rx, ry - 78)                // antenna stem
    bot.fillStyle(0x38bdf8, 1)
    bot.fillCircle(rx, ry - 82, 7)                           // antenna tip
    bot.fillStyle(0x1e3a8a, 1)
    bot.fillRoundedRect(rx - 36, ry + 62, 26, 14, 5)        // left leg
    bot.fillRoundedRect(rx + 10, ry + 62, 26, 14, 5)        // right leg

    this.add.text(640, 326, 'Labirinto do Enquanto', {
      fontSize: '44px',
      fontFamily: 'Arial Black, Arial',
      color: '#e0f2fe',
      stroke: '#0d1b2a',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setDepth(1)

    this.add.text(640, 396, 'Robô se preparando para o desafio...', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#90caf9',
    }).setOrigin(0.5).setDepth(1)

    const barW = 520
    const track = this.add.graphics().setDepth(1)
    track.fillStyle(0x1e3a5f, 1)
    track.fillRoundedRect(640 - barW / 2, 448, barW, 22, 11)
    track.lineStyle(2, 0x4fc3f7, 0.6)
    track.strokeRoundedRect(640 - barW / 2, 448, barW, 22, 11)

    const fill = this.add.graphics().setDepth(2)
    this.load.on('progress', (v: number) => {
      fill.clear()
      fill.fillStyle(0x38bdf8, 1)
      fill.fillRoundedRect(640 - barW / 2 + 2, 450, Math.max(6, (barW - 4) * v), 18, 9)
    })
  }
}
