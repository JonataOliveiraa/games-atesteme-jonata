import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

interface MissionUpdatePayload {
  missionText: string
  stepHint: string
  missionIndex: number
  totalMissions: number
  level: number
}

/**
 * UIScene — HUD paralelo do Desktop Digital Infantil.
 *
 * Layout (canvas 1280×720, y=0–90):
 *   ┌──────────────────────────────────────────────────────────────────────┐
 *   │ 💬 [Missão: texto]        [Passo atual: hint]    ●●○  ★★☆   🔊   │
 *   └──────────────────────────────────────────────────────────────────────┘
 */
export class UIScene extends Phaser.Scene {
  private missionText!: Phaser.GameObjects.Text
  private stepHint!: Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []
  private levelStars!: Phaser.GameObjects.Text
  private currentLevel = 1

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.registerEventListeners()
  }

  shutdown() {
    EventBus.off('mission-update', undefined, this)
    EventBus.off('mute-audio', undefined, this)
  }

  // ── Barra superior ────────────────────────────────────────────────────────

  private createTopBar() {
    // Fundo escuro translúcido (estilo barra de sistema)
    this.add.rectangle(640, 45, 1280, 90, 0x0A1628, 0.92)
      .setStrokeStyle(2, 0x2E86C1)

    // Ícone de missão
    this.add.text(18, 45, '💬', { fontSize: '28px' }).setOrigin(0, 0.5)

    // Texto da missão
    this.missionText = this.add.text(58, 32, 'Carregando...', {
      fontSize: '17px',
      fontFamily: 'Arial Black, Arial',
      color: '#AED6F1',
      wordWrap: { width: 480 },
    }).setOrigin(0, 0.5)

    // Separador
    this.add.rectangle(560, 45, 2, 60, 0x2E86C1, 0.5)

    // Hint do passo atual
    this.add.text(575, 32, '👉', { fontSize: '18px' }).setOrigin(0, 0.5)
    this.stepHint = this.add.text(608, 32, '', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#F9E79F',
      wordWrap: { width: 380 },
    }).setOrigin(0, 0.5)

    // Dots de progresso (placeholder — recriados em updateDots)
    this.missionDots = []
    for (let i = 0; i < 3; i++) {
      const dot = this.add.graphics()
      dot.fillStyle(0x4A4A4A, 1)
      dot.fillCircle(0, 0, 8)
      dot.setPosition(1020 + i * 26, 45)
      dot.setAlpha(0)
      this.missionDots.push(dot)
    }

    // Estrelas de nível
    this.add.text(1100, 30, 'Nível', {
      fontSize: '12px', color: '#7F8C8D', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1100, 58, '★☆☆', {
      fontSize: '22px', color: '#F1C40F',
    }).setOrigin(0.5)

    // Botão mute
    this.createMuteButton()
  }

  // ── Botão mute ────────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1248, 45, 56, 56, 0x1A2A3A, 0.9)
      .setStrokeStyle(2, 0x2E86C1)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1248, 45, '🔊', { fontSize: '24px' }).setOrigin(0.5)

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
      this.currentLevel = data.level
      this.levelStars.setText('★'.repeat(data.level) + '☆'.repeat(3 - data.level))
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    // Recria dots conforme o total de missões do nível
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const startX = 1020
    const gap = 26

    for (let i = 0; i < total; i++) {
      const dot = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0x2ECC71 : 0x4A4A4A, 1)
      dot.fillCircle(0, 0, 8)
      if (filled) {
        dot.lineStyle(2, 0x27AE60)
        dot.strokeCircle(0, 0, 8)
      }
      dot.setPosition(startX + i * gap, 45)
      this.missionDots.push(dot)
    }
  }
}
