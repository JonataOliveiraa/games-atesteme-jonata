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

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    const bar = this.add.graphics()
    bar.fillStyle(0x0f2547, 0.82)
    bar.fillRect(0, 0, W, 120)

    this.instructionText = this.add.text(W / 2, 40, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '25px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 1120 },
    }).setOrigin(0.5).setResolution(2)

    this.subText = this.add.text(W / 2, 82, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '18px',
      color: '#bfdbfe',
      align: 'center',
      wordWrap: { width: 1040 },
    }).setOrigin(0.5).setResolution(2)

    this.levelText = this.add.text(28, 26, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '15px',
      color: '#93c5fd',
    }).setOrigin(0, 0.5).setResolution(2)

    this.phaseText = this.add.text(28, 50, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '14px',
      color: '#64748b',
    }).setOrigin(0, 0.5).setResolution(2)

    this.timerTrack = this.add.graphics()
    this.timerBar = this.add.graphics()

    this.registry.events.on('changedata-hud', (_p: unknown, data: HudData) => {
      this.applyHud(data)
    })

    EventBus.on('timer-start', (seconds: number) => this.startTimer(seconds), this)
    EventBus.on('timer-stop', () => this.stopTimer(), this)

    const existing = this.registry.get('hud') as HudData | undefined
    if (existing) this.applyHud(existing)
  }

  shutdown() {
    this.stopTimer()
    this.registry.events.off('changedata-hud')
    EventBus.off('timer-start', undefined, this)
    EventBus.off('timer-stop', undefined, this)
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
    this.timerTrack.fillStyle(0x000000, 0.4)
    this.timerTrack.fillRoundedRect(W - 344, 34, 316, 20, 10)
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
}