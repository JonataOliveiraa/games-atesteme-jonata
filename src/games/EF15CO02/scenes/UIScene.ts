import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { C, A, hex } from '../data/theme'
import { TOPBAR, W } from '../data/layout'
import type { LevelNumber, TrackId } from '../types'

export interface AlgorithmUiUpdatePayload {
  level: LevelNumber
  phaseIndex: number
  totalPhases: number
  title: string
  instruction: string
  track?: TrackId
  trackLabel?: string
  trackColor?: number
  blockCount?: number
  versions?: number
}

export interface AlgorithmTimerPayload {
  remaining: number
  total: number
}

export interface AlgorithmVersionPayload {
  versions: number
  blockCount: number
  success?: boolean
}

export class UIScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private instructionText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private metaText!: Phaser.GameObjects.Text
  private versionText!: Phaser.GameObjects.Text
  private timerText!: Phaser.GameObjects.Text
  private dotsG!: Phaser.GameObjects.Graphics
  private timerG!: Phaser.GameObjects.Graphics
  private helpBtn!: Phaser.GameObjects.Container

  private totalPhases = 1
  private phaseIndex = 0
  private currentTrackColor: number = C.accent
  private tutorialBusy = false

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.buildBar()
    this.registerListeners()
    EventBus.emit('ui-ready')
  }

  private buildBar() {
    const bar = this.add.graphics().setDepth(0)
    bar.fillStyle(C.shadow, A.shadow)
    bar.fillRect(0, TOPBAR.h, W, 8)
    bar.fillStyle(C.bgDeep, 1)
    bar.fillRect(0, 0, W, TOPBAR.h)
    bar.fillStyle(C.accent, 1)
    bar.fillRoundedRect(28, 22, 48, 48, 14)
    bar.fillStyle(C.white, 0.2)
    bar.fillRoundedRect(34, 28, 36, 16, 8)

    this.add.text(52, 47, '{}', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: hex(C.bgDeep),
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.levelText = this.add.text(92, 25, 'NIVEL 1', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: hex(C.accent),
      stroke: hex(C.shadow),
      strokeThickness: 4,
    }).setDepth(1).setResolution(2)

    this.titleText = this.add.text(92, 56, 'Academia dos Algoritmos', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '18px',
      color: hex(C.white),
      stroke: hex(C.shadow),
      strokeThickness: 4,
    }).setDepth(1).setResolution(2)

    this.instructionText = this.add.text(W / 2, 34, 'Monte, execute e melhore o algoritmo.', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '23px',
      color: hex(C.white),
      stroke: hex(C.shadow),
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 650 },
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.metaText = this.add.text(W / 2, 70, 'Sequencia', {
      fontFamily: 'Arial',
      fontStyle: 'bold',
      fontSize: '16px',
      color: hex(C.accent),
      stroke: hex(C.shadow),
      strokeThickness: 3,
      align: 'center',
    }).setOrigin(0.5).setDepth(1).setResolution(2)

    this.versionText = this.add.text(940, 33, 'Versoes: 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: hex(C.panel),
      stroke: hex(C.shadow),
      strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

    this.timerText = this.add.text(940, 62, '', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '16px',
      color: hex(C.warning),
      stroke: hex(C.shadow),
      strokeThickness: 4,
    }).setOrigin(0, 0.5).setDepth(1).setResolution(2)

    this.dotsG = this.add.graphics().setDepth(2)
    this.timerG = this.add.graphics().setDepth(2)
    this.helpBtn = this.buildHelpButton(1224, 46)
    this.helpBtn.setVisible(false)
    this.versionText.setVisible(false)
    this.timerText.setVisible(false)

    this.paintDots()
  }

  private buildHelpButton(x: number, y: number) {
    const btn = this.add.container(x, y).setDepth(3)
    const bg = this.add.graphics()
    const label = this.add.text(0, -1, '?', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: hex(C.white),
      stroke: hex(C.shadow),
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2)

    const paint = (hover = false) => {
      bg.clear()
      bg.fillStyle(C.shadow, A.shadow)
      bg.fillRoundedRect(-29, -24, 58, 58, 18)
      bg.fillStyle(hover ? C.accent : C.condition, 1)
      bg.fillRoundedRect(-29, -29, 58, 58, 18)
      bg.lineStyle(4, C.white, 0.92)
      bg.strokeRoundedRect(-29, -29, 58, 58, 18)
    }

    paint(false)
    btn.add([bg, label])
    btn.setSize(66, 66)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => paint(true))
    btn.on('pointerout', () => paint(false))
    btn.on('pointerdown', () => {
      if (this.tutorialBusy) return
      this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
      EventBus.emit('show-tutorial')
    })

    return btn
  }

  private registerListeners() {
    EventBus.on('algorithm-ui-update', this.handleUiUpdate, this)
    EventBus.on('algorithm-timer', this.handleTimer, this)
    EventBus.on('algorithm-timer-stop', this.clearTimer, this)
    EventBus.on('algorithm-version', this.handleVersion, this)
    EventBus.on('tutorial-ready', this.revealHelp, this)
    EventBus.on('tutorial-start', this.lockHelp, this)
    EventBus.on('tutorial-end', this.unlockHelp, this)

    const cleanup = () => {
      EventBus.off('algorithm-ui-update', this.handleUiUpdate, this)
      EventBus.off('algorithm-timer', this.handleTimer, this)
      EventBus.off('algorithm-timer-stop', this.clearTimer, this)
      EventBus.off('algorithm-version', this.handleVersion, this)
      EventBus.off('tutorial-ready', this.revealHelp, this)
      EventBus.off('tutorial-start', this.lockHelp, this)
      EventBus.off('tutorial-end', this.unlockHelp, this)
    }

    this.events.once('shutdown', cleanup)
    this.events.once('destroy', cleanup)
  }

  private handleUiUpdate = (data: AlgorithmUiUpdatePayload) => {
    this.levelText.setText(`NIVEL ${data.level}`)
    this.titleText.setText(data.title)
    this.instructionText.setText(data.instruction)

    const trackText = data.trackLabel ?? data.track ?? 'Algoritmo'
    const blockText = typeof data.blockCount === 'number' ? ` - ${data.blockCount} blocos` : ''
    this.metaText.setText(`${trackText}${blockText}`)

    this.currentTrackColor = data.trackColor ?? this.currentTrackColor
    this.totalPhases = Math.max(1, data.totalPhases)
    this.phaseIndex = Phaser.Math.Clamp(data.phaseIndex, 0, this.totalPhases - 1)
    this.paintDots()

    if (typeof data.versions === 'number') {
      this.versionText.setVisible(data.versions > 0)
      this.versionText.setText(`Versoes: ${data.versions}`)
    }
  }

  private handleVersion = (data: AlgorithmVersionPayload) => {
    const result = data.success === undefined ? '' : data.success ? ' - ok' : ' - revisar'
    this.versionText.setVisible(true)
    this.versionText.setText(`Versoes: ${data.versions} - ${data.blockCount} blocos${result}`)
    this.versionText.setColor(hex(data.success === false ? C.error : C.panel))
  }

  private handleTimer = (data: AlgorithmTimerPayload) => {
    const total = Math.max(1, data.total)
    const remaining = Phaser.Math.Clamp(data.remaining, 0, total)
    const progress = remaining / total

    this.timerText.setVisible(true)
    this.timerText.setText(`Tempo: ${Math.ceil(remaining)}s`)
    this.paintTimer(progress)
  }

  private clearTimer = () => {
    this.timerText.setVisible(false)
    this.timerText.setText('')
    this.timerG.clear()
  }

  private paintDots() {
    const gap = 25
    const y = 76
    const startX = 860 - ((this.totalPhases - 1) * gap) / 2

    this.dotsG.clear()
    for (let i = 0; i < this.totalPhases; i += 1) {
      const x = startX + i * gap
      const done = i < this.phaseIndex
      const current = i === this.phaseIndex

      this.dotsG.fillStyle(C.shadow, A.shadow)
      this.dotsG.fillCircle(x, y + 3, current ? 11 : 8)
      this.dotsG.fillStyle(done || current ? C.white : C.panel, done || current ? 1 : 0.38)
      this.dotsG.fillCircle(x, y, current ? 10 : 8)
      if (current) {
        this.dotsG.fillStyle(this.currentTrackColor, 1)
        this.dotsG.fillCircle(x, y, 6)
      }
    }
  }

  private paintTimer(progress: number) {
    const p = Phaser.Math.Clamp(progress, 0, 1)
    const y = TOPBAR.h - 8

    this.timerG.clear()
    this.timerG.fillStyle(C.shadow, 0.48)
    this.timerG.fillRect(0, y, W, 8)
    this.timerG.fillStyle(p > 0.25 ? C.accent : C.error, 1)
    this.timerG.fillRect(0, y, W * p, 8)
  }

  private lockHelp = () => {
    this.tutorialBusy = true
    this.helpBtn.setAlpha(0.46)
    this.helpBtn.disableInteractive()
  }

  private unlockHelp = () => {
    this.tutorialBusy = false
    this.helpBtn.setAlpha(1)
    this.helpBtn.setInteractive({ useHandCursor: true })
  }

  private revealHelp = () => {
    if (this.helpBtn.visible) return
    this.helpBtn.setVisible(true).setAlpha(0)
    this.tweens.add({ targets: this.helpBtn, alpha: 1, duration: 220 })
  }
}
