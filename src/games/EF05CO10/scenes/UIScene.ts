import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, A } from '../data/theme'

export class UIScene extends Phaser.Scene {
  private helpBtn!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.helpBtn = this.buildHelpButton()
    this.helpBtn.setVisible(false)

    EventBus.on('tutorial-ready', this.revealHelp, this)
    EventBus.emit('ui-ready')
  }

  shutdown() {
    EventBus.off('tutorial-ready', this.revealHelp, this)
  }

  private buildHelpButton() {
    const btn = this.add.container(1218, 50)
    const g = this.add.graphics()
    g.fillStyle(C.shadow, 0.22)
    g.fillCircle(0, 6, 27)
    g.fillStyle(C.violet, 1)
    g.fillCircle(0, 0, 27)
    g.fillStyle(C.white, A.gloss)
    g.fillEllipse(0, -11, 36, 16)
    const t = this.add.text(0, 0, '?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '29px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    btn.add([g, t])
    btn.setSize(62, 62)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerdown', () => {
      this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    return btn
  }

  private revealHelp = () => {
    this.helpBtn.setVisible(true)
  }
}