import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C } from '../data/theme'
import { W } from '../data/layout'

const BAR_W = 300
const BAR_H = 30
const BAR_X = W / 2 - BAR_W / 2
const BAR_Y = 18

export class UIScene extends Phaser.Scene {
  private track!: Phaser.GameObjects.Graphics
  private bar!: Phaser.GameObjects.Graphics
  private tween?: Phaser.Tweens.Tween
  private state = { p: 1 }

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.track = this.add.graphics()
    this.bar = this.add.graphics()

    EventBus.on('timer-start', this.startTimer, this)
    EventBus.on('timer-stop', this.stopTimer, this)
  }

  shutdown() {
    this.stopTimer()
    EventBus.off('timer-start', this.startTimer, this)
    EventBus.off('timer-stop', this.stopTimer, this)
  }

  update() {
    if (this.tween) this.draw(this.state.p)
  }

  private startTimer = (seconds: number) => {
    this.stopTimer()
    this.state.p = 1

    this.track.clear()
    this.track.fillStyle(C.white, 0.94)
    this.track.fillRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2)
    this.track.lineStyle(3, C.border, 1)
    this.track.strokeRoundedRect(BAR_X, BAR_Y, BAR_W, BAR_H, BAR_H / 2)
    this.draw(1)

    this.tween = this.tweens.add({
      targets: this.state,
      p: 0,
      duration: seconds * 1000,
      ease: 'Linear',
      onComplete: () => {
        this.draw(0)
        this.tween = undefined
        EventBus.emit('timer-end')
      },
    })
  }

  private stopTimer = () => {
    this.tween?.stop()
    this.tween = undefined
    this.track.clear()
    this.bar.clear()
  }

  private draw(p: number) {
    const clamped = Phaser.Math.Clamp(p, 0, 1)
    const w = (BAR_W - 12) * clamped
    const color = clamped > 0.5 ? C.green : clamped > 0.25 ? C.amber : C.red

    this.bar.clear()
    if (w <= 0) return
    this.bar.fillStyle(color, 1)
    this.bar.fillRoundedRect(BAR_X + 6, BAR_Y + 6, w, BAR_H - 12, (BAR_H - 12) / 2)
    this.bar.fillStyle(C.white, 0.3)
    this.bar.fillRoundedRect(BAR_X + 9, BAR_Y + 9, Math.max(6, w - 6), 5, 3)
  }
}