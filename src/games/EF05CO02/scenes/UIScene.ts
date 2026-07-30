import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

const W = 1280

interface HudData {
  instruction: string
  sub: string
  level: number
  phase: number
  totalPhases: number
}

export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private subText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private phaseText!: Phaser.GameObjects.Text

  private timerTrack!: Phaser.GameObjects.Graphics
  private timerBar!: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { p: 1 }
  private helpBtn!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.instructionText = this.add.text(W / 2, 40, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '25px',
      color: '#ffffff',
      stroke: '#0f2547',
      strokeThickness: 6,
      align: 'center',
      wordWrap: { width: 1120 },
    }).setOrigin(0.5).setResolution(2)

    this.subText = this.add.text(W / 2, 82, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#0f2547',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 1040 },
    }).setOrigin(0.5).setResolution(2)

    this.levelText = this.add.text(28, 26, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#0f2547',
      strokeThickness: 4,
    }).setOrigin(0, 0.5).setResolution(2)

    this.phaseText = this.add.text(28, 50, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      color: '#e2e8f0',
      stroke: '#0f2547',
      strokeThickness: 3,
    }).setOrigin(0, 0.5).setResolution(2)

    this.timerTrack = this.add.graphics()
    this.timerBar = this.add.graphics()

    this.registry.events.on('changedata-hud', (_p: unknown, data: HudData) => {
      this.applyHud(data)
    })

    EventBus.on('timer-start', (seconds: number) => this.startTimer(seconds), this)
    EventBus.on('timer-stop', () => this.stopTimer(), this)

    this.helpBtn = this.buildHelpButton(W - 46, 44)
    this.helpBtn.setVisible(false)

    EventBus.on('tutorial-ready', () => {
      if (this.helpBtn.visible) return
      this.helpBtn.setVisible(true).setAlpha(0)
      this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 260 })
    }, this)

    const existing = this.registry.get('hud') as HudData | undefined
    if (existing) this.applyHud(existing)
  }

  shutdown() {
    this.stopTimer()
    this.registry.events.off('changedata-hud')
    EventBus.off('timer-start', undefined, this)
    EventBus.off('timer-stop', undefined, this)
    EventBus.off('tutorial-ready', undefined, this)
    EventBus.off('show-tutorial', undefined, this)
  }

  update() {
    if (this.timerTween) this.drawTimer(this.timerState.p)
  }

  private applyHud(data: HudData) {
    this.instructionText.setText(data.instruction)
    this.subText.setText(data.sub)
    this.levelText.setText(`NÍVEL ${data.level}`)
    this.phaseText.setText(`Fase ${data.phase} de ${data.totalPhases}`)
  }

  private startTimer(seconds: number) {
    this.stopTimer()
    this.timerState.p = 1

    this.timerTrack.clear()
    this.timerTrack.fillStyle(0x0f2547, 0.55)

    this.timerTrack.fillRoundedRect(W - 418, 30, 324, 28, 14)
    this.timerTrack.lineStyle(2, 0x3b82f6, 0.7)
    this.timerTrack.strokeRoundedRect(W - 418, 30, 324, 28, 14)
    this.drawTimer(1)

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      p: 0,
      duration: seconds * 1000,
      ease: 'Linear',
      onComplete: () => {
        this.drawTimer(0)
        this.timerTween = undefined
        EventBus.emit('timer-end')
      },
    })
  }

  private stopTimer() {
    this.timerTween?.stop()
    this.timerTween = undefined
    this.timerTrack.clear()
    this.timerBar.clear()
  }

  private drawTimer(p: number) {
    const w = 312 * Phaser.Math.Clamp(p, 0, 1)
    const color = p > 0.5 ? 0x22c55e : p > 0.25 ? 0xf59e0b : 0xef4444
    this.timerBar.clear()
    if (w > 0) {
      this.timerBar.fillStyle(color, 1)
      this.timerBar.fillRoundedRect(W - 342, 36, w, 16, 8)
    }
  }

  private buildHelpButton(x: number, y: number) {
    const s = 52
    const box = this.add.container(0, 0).setDepth(40)
    const g = this.add.graphics()

    const paint = (hover: boolean) => {
      g.clear()
      g.fillStyle(0x0f2547, 0.6)
      g.fillRoundedRect(x - s / 2, y - s / 2 + 5, s, s, 16)
      g.fillStyle(hover ? 0x3b82f6 : 0x1e3a8a, 1)
      g.fillRoundedRect(x - s / 2, y - s / 2, s, s, 16)
      g.fillStyle(0xffffff, 0.16)
      g.fillRoundedRect(x - s / 2 + 5, y - s / 2 + 4, s - 10, s * 0.32, 9)
      g.lineStyle(3, 0x93c5fd, 0.95)
      g.strokeRoundedRect(x - s / 2, y - s / 2, s, s, 16)
    }
    paint(false)

    const text = this.add.text(x, y, '?', {
      fontFamily: 'Arial Black, Arial', fontSize: '26px',
      color: '#ffffff', stroke: '#0f2547', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const zone = this.add.zone(x, y, s + 10, s + 10)
      .setInteractive({ useHandCursor: true })

    zone.on('pointerover', () => paint(true))
    zone.on('pointerout', () => paint(false))
    zone.on('pointerdown', () => {
      paint(true)
      this.tweens.add({ targets: text, scale: 0.88, duration: 70, yoyo: true })
      EventBus.emit('show-tutorial')
    })
    zone.on('pointerup', () => paint(false))

    box.add([g, text, zone])
    return box
  }
}