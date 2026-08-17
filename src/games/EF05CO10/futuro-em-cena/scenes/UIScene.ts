import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, A } from '../data/theme'

export class UIScene extends Phaser.Scene {
  private helpBtn!: Phaser.GameObjects.Container
  private tutorialBusy = false

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.helpBtn = this.buildHelpButton()
    this.helpBtn.setVisible(false)

    EventBus.on('tutorial-ready', this.revealHelp, this)
    EventBus.on('tutorial-start', this.lockHelp, this)
    EventBus.on('tutorial-end', this.unlockHelp, this)
    EventBus.emit('ui-ready')
  }

  shutdown() {
    EventBus.off('tutorial-ready', this.revealHelp, this)
    EventBus.off('tutorial-start', this.lockHelp, this)
    EventBus.off('tutorial-end', this.unlockHelp, this)
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
      if (this.tutorialBusy) return
      this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    return btn
  }

  private lockHelp = () => {
    this.tutorialBusy = true
    this.helpBtn.setAlpha(0.45)
    this.helpBtn.disableInteractive()
  }

  private unlockHelp = () => {
    this.tutorialBusy = false
    this.helpBtn.setAlpha(1)
    this.helpBtn.setInteractive({ useHandCursor: true })
  }

  private revealHelp = () => {
    this.helpBtn.setVisible(true)
  }
}