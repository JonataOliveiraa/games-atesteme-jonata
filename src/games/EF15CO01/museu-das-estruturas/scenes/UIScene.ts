import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { C, A } from '../data/theme'
import { W } from '../data/layout'

const BAR_W = 320
const BAR_H = 28
const BAR_X = W / 2 - BAR_W / 2
const BAR_Y = 16

export class UIScene extends Phaser.Scene {
  private track!: Phaser.GameObjects.Graphics
  private bar!: Phaser.GameObjects.Graphics
  private curtain!: Phaser.GameObjects.Graphics
  private tween?: Phaser.Tweens.Tween
  private state = { p: 1 }

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.track = this.add.graphics().setDepth(10)
    this.bar = this.add.graphics().setDepth(11)
    this.curtain = this.add.graphics().setDepth(950)

    EventBus.on('timer-start', this.startTimer, this)
    EventBus.on('timer-stop', this.stopTimer, this)
    EventBus.on('curtain', this.playCurtain, this)

    this.events.once('shutdown', () => {
      this.stopTimer()
      EventBus.off('timer-start', this.startTimer, this)
      EventBus.off('timer-stop', this.stopTimer, this)
      EventBus.off('curtain', this.playCurtain, this)
    })
  }

  update() {
    if (this.tween) this.draw(this.state.p)
  }

  private startTimer = (seconds: number) => {
    this.stopTimer()
    this.state.p = 1

    this.track.clear()
    this.track.fillStyle(C.panel, 0.96)
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
    const color = clamped > 0.5 ? C.good : clamped > 0.25 ? C.warn : C.stroke

    this.bar.clear()
    if (w <= 0) return
    this.bar.fillStyle(color, 1)
    this.bar.fillRoundedRect(BAR_X + 6, BAR_Y + 6, w, BAR_H - 12, (BAR_H - 12) / 2)
    this.bar.fillStyle(C.white, A.gloss)
    this.bar.fillRoundedRect(BAR_X + 9, BAR_Y + 9, Math.max(6, w - 6), 4, 2)
  }

  private playCurtain = (onMid?: () => void) => {
    const state = { v: 0 }
    this.tweens.add({
      targets: state,
      v: 1,
      duration: 260,
      ease: 'Sine.easeIn',
      onUpdate: () => this.paintCurtain(state.v),
      onComplete: () => {
        onMid?.()
        this.tweens.add({
          targets: state,
          v: 0,
          duration: 300,
          delay: 80,
          ease: 'Sine.easeOut',
          onUpdate: () => this.paintCurtain(state.v),
          onComplete: () => this.curtain.clear(),
        })
      },
    })
  }

  private paintCurtain(v: number) {
    const half = (W / 2) * v
    this.curtain.clear()
    this.curtain.fillStyle(C.lilac, 1)
    this.curtain.fillRect(0, 0, half, 720)
    this.curtain.fillRect(W - half, 0, half, 720)
    this.curtain.fillStyle(C.stroke, 0.35)
    this.curtain.fillRect(half - 8, 0, 8, 720)
    this.curtain.fillRect(W - half, 0, 8, 720)
  }
}