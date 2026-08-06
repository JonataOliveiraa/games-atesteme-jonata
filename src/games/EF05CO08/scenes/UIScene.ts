import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, hex } from '../data/theme'

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
  private helpBtn!: Phaser.GameObjects.Container

  private timerTrack!: Phaser.GameObjects.Graphics
  private timerBar!: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { p: 1 }

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.instructionText = this.add.text(W / 2, 42, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '30px',
      color: hex(C.blueDark),
      stroke: '#ffffff',
      strokeThickness: 7,
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5).setResolution(2)

    this.subText = this.add.text(W / 2, 90, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '22px',
      color: hex(C.inkSoft),
      stroke: '#ffffff',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 760 },
    }).setOrigin(0.5).setResolution(2)

    this.levelText = this.add.text(26, 32, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: hex(C.blueDark),
      stroke: '#ffffff',
      strokeThickness: 5,
    }).setOrigin(0, 0.5).setResolution(2)

    this.phaseText = this.add.text(26, 62, '', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '18px',
      color: hex(C.inkSoft),
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0, 0.5).setResolution(2)

    this.timerTrack = this.add.graphics()
    this.timerBar = this.add.graphics()

    this.helpBtn = this.buildHelpButton()
    this.helpBtn.setVisible(false)

    this.registry.events.on('changedata-hud', (_p: unknown, data: HudData) => this.applyHud(data))

    EventBus.on('timer-start', this.startTimer, this)
    EventBus.on('timer-stop', this.stopTimer, this)
    EventBus.on('tutorial-ready', this.revealHelp, this)

    const existing = this.registry.get('hud') as HudData | undefined
    if (existing) this.applyHud(existing)
  }

  shutdown() {
    this.stopTimer()
    this.registry.events.off('changedata-hud')
    EventBus.off('timer-start', this.startTimer, this)
    EventBus.off('timer-stop', this.stopTimer, this)
    EventBus.off('tutorial-ready', this.revealHelp, this)
  }

  update() {
    if (this.timerTween) this.drawTimer(this.timerState.p)
  }

  private buildHelpButton() {
    const btn = this.add.container(1224, 54)
    const g = this.add.graphics()
    g.fillStyle(C.shadow, 0.2)
    g.fillCircle(0, 6, 30)
    g.fillStyle(C.blue, 1)
    g.fillCircle(0, 0, 30)
    g.fillStyle(C.white, 0.22)
    g.fillEllipse(0, -12, 38, 18)
    const t = this.add.text(0, 0, '?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setResolution(2)
    btn.add([g, t])
    btn.setSize(68, 68)
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

  private applyHud(data: HudData) {
    this.instructionText.setText(data.instruction)
    this.subText.setText(data.sub)
    this.levelText.setText(`NÍVEL ${data.level}`)
    this.phaseText.setText(`Notícia ${data.phase} de ${data.totalPhases}`)
  }

  private startTimer = (seconds: number) => {
    this.stopTimer()
    this.timerState.p = 1

    this.timerTrack.clear()
    this.timerTrack.fillStyle(C.white, 0.9)
    this.timerTrack.fillRoundedRect(858, 26, 320, 32, 16)
    this.timerTrack.lineStyle(3, C.border, 1)
    this.timerTrack.strokeRoundedRect(858, 26, 320, 32, 16)
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

  private stopTimer = () => {
    this.timerTween?.stop()
    this.timerTween = undefined
    this.timerTrack.clear()
    this.timerBar.clear()
  }

  private drawTimer(p: number) {
    const w = 306 * Phaser.Math.Clamp(p, 0, 1)
    const color = p > 0.5 ? C.green : p > 0.25 ? C.amber : C.red
    this.timerBar.clear()
    if (w > 0) {
      this.timerBar.fillStyle(color, 1)
      this.timerBar.fillRoundedRect(865, 33, w, 18, 9)
    }
  }
}