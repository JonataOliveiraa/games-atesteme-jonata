import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'

interface MissionUpdatePayload {
  missionText: string
  stepHint: string
  missionIndex: number
  totalMissions: number
  level: number
}

export class UIScene extends Phaser.Scene {
  private missionText!: Phaser.GameObjects.Text
  private stepHint!: Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []
  private levelStars!: Phaser.GameObjects.Text
  private timerFill?: Phaser.GameObjects.Graphics
  private readonly TIMER_X = 240
  private readonly TIMER_Y = 115
  private readonly TIMER_W = 800
  private readonly TIMER_H = 18

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.registerEventListeners()
  }

  shutdown() {
    EventBus.off('mission-update', undefined, this)
    EventBus.off('mute-audio',     undefined, this)
    EventBus.off('timer-tick',     undefined, this)
  }

  // ── Barra superior (112px de altura) ─────────────────────────────────────

  private createTopBar() {
    // Fundo escuro
    this.add.rectangle(640, 56, 1280, 112, 0x0A1628, 0.95)
    // Linha inferior de separação
    this.add.rectangle(640, 112, 1280, 2, 0x2E86C1, 0.7)

    // Ícone de missão (esquerda)
    this.add.text(18, 34, '🎯', { fontSize: '28px' }).setOrigin(0, 0.5)

    // Texto da missão — centralizado, fonte grande
    this.missionText = this.add.text(640, 34, 'Carregando...', {
      fontSize: '26px',
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
      color: '#FFFFFF',
      stroke: '#0A1628',
      strokeThickness: 4,
      wordWrap: { width: 860 },
      align: 'center',
    }).setOrigin(0.5, 0.5)

    // Separador horizontal sutil
    this.add.rectangle(640, 60, 820, 1, 0x2E86C1, 0.30)

    // Ícone de passo
    this.add.text(190, 82, '👉', { fontSize: '18px' }).setOrigin(0.5, 0.5)

    // Dica do passo atual — centralizada, cor amarela
    this.stepHint = this.add.text(640, 82, '', {
      fontSize: '17px',
      fontFamily: 'DynaPuff, Arial, sans-serif',
      color: '#F9E79F',
      stroke: '#0A1628',
      strokeThickness: 3,
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5, 0.5)

    // Dots de progresso (recriados em updateDots)
    this.missionDots = []

    // Estrelas de nível (canto direito)
    this.add.text(1095, 24, 'Nível', {
      fontSize: '11px', color: '#7F8C8D', fontFamily: 'DynaPuff, Arial, sans-serif',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1095, 48, '★☆☆', {
      fontSize: '20px', color: '#F1C40F',
    }).setOrigin(0.5)

    // Barra de timer (bottom do HUD, acima do separador)
    this.createTimerBar()

    // Botão instruções (canto direito, à esquerda do mute)
    this.createInstructionsButton()

    // Botão mute (canto direito)
    this.createMuteButton()
  }

  // ── Timer bar ─────────────────────────────────────────────────────────────

  private createTimerBar() {
    const { TIMER_X: x, TIMER_Y: y, TIMER_W: w, TIMER_H: h } = this

    const bg = this.add.graphics()
    bg.fillStyle(0x33190A, 0.82)
    bg.fillRoundedRect(x, y, w, h, 6)
    bg.lineStyle(2, 0x7A4A10, 0.9)
    bg.strokeRoundedRect(x, y, w, h, 6)

    this.timerFill = this.add.graphics()
    this.drawTimer(1)

    const shine = this.add.graphics()
    shine.fillStyle(0xFFFFFF, 0.15)
    shine.fillRoundedRect(x + 1, y + 1, w - 2, 5, { tl: 5, tr: 5, bl: 0, br: 0 })
  }

  private drawTimer(progress: number) {
    if (!this.timerFill) return
    const { TIMER_X: x, TIMER_Y: y, TIMER_W: w, TIMER_H: h } = this
    const fill = progress > 0.5 ? 0x2ECC71 : progress > 0.25 ? 0xF39C12 : 0xE74C3C
    const width = w * Phaser.Math.Clamp(progress, 0, 1)
    this.timerFill.clear()
    if (width > 0) {
      this.timerFill.fillStyle(fill, 1)
      this.timerFill.fillRoundedRect(x, y, width, h, h / 2)
    }
  }

  // ── Botão instruções ──────────────────────────────────────────────────────

  private createInstructionsButton() {
    const btn = this.add.rectangle(1185, 56, 52, 60, 0x1A2A3A, 0.9)
      .setStrokeStyle(1.5, 0x2E86C1)
      .setInteractive({ useHandCursor: true })

    this.add.text(1185, 56, '❓', { fontSize: '22px' }).setOrigin(0.5)

    btn.on('pointerdown', () => EventBus.emit('show-instructions'))
    btn.on('pointerover',  () => btn.setFillStyle(0x243447))
    btn.on('pointerout',   () => btn.setFillStyle(0x1A2A3A, 0.9))
  }

  // ── Botão mute ────────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1248, 56, 52, 60, 0x1A2A3A, 0.9)
      .setStrokeStyle(1.5, 0x2E86C1)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1248, 56, '🔊', { fontSize: '22px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover',  () => btn.setFillStyle(0x243447))
    btn.on('pointerout',   () => btn.setFillStyle(0x1A2A3A, 0.9))
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  private registerEventListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.missionText.setText(data.missionText)
      this.stepHint.setText(data.stepHint)
      this.levelStars.setText('★'.repeat(data.level) + '☆'.repeat(3 - data.level))
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)

    EventBus.on('timer-tick', (progress: number) => {
      this.drawTimer(progress)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const dotR = 7
    const gap = 20
    const totalW = total * (dotR * 2) + (total - 1) * (gap - dotR * 2)
    const startX = 1148 - totalW / 2 + dotR

    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0x2ECC71 : 0x394A59, 1)
      dot.fillCircle(0, 0, dotR)
      if (filled) {
        dot.lineStyle(1.5, 0x27AE60)
        dot.strokeCircle(0, 0, dotR)
      }
      dot.setPosition(startX + i * gap, 82)
      this.missionDots.push(dot)
    }
  }
}
