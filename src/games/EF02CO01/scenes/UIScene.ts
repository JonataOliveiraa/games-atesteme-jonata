import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'

interface MissionUpdatePayload {
  instruction: string   // linha 1 — o que fazer agora
  hint: string          // linha 2 — dica/pergunta (amarelo)
  missionIndex: number  // missões concluídas até agora
  totalMissions: number
  level: number
}

/**
 * UIScene — HUD paralelo do Hangar dos Modelos.
 *
 * Layout (canvas 1280×720, y=0–112):
 *   ┌───────────────────────────────────────────────────────────────────────┐
 *   │  ✈️  Instrução da missão — centralizada, fonte grande               │  ← y=34
 *   │     👉 Dica / pergunta — centralizada, amarela                      │  ← y=78
 *   │                                           ●●○   ★★☆   🔊           │
 *   └───────────────────────────────────────────────────────────────────────┘
 *   ━━━━ timer bar (GameScene, y=118) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export class UIScene extends Phaser.Scene {
  private instructionText!: Phaser.GameObjects.Text
  private hintText!:        Phaser.GameObjects.Text
  private levelStars!:      Phaser.GameObjects.Text
  private missionDots: Phaser.GameObjects.Graphics[] = []

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.registerListeners()
  }

  shutdown() {
    EventBus.off('mission-update', undefined, this)
    EventBus.off('mute-audio',     undefined, this)
  }

  // ── Barra superior (112px de altura) ─────────────────────────────────────

  private createTopBar() {
    // Fundo escuro
    this.add.rectangle(640, 56, 1280, 112, 0x0D1B2A, 0.95)
    // Linha inferior
    this.add.rectangle(640, 112, 1280, 2, 0x4FC3F7, 0.6)

    // Ícone de missão (esquerda)
    this.add.text(18, 34, '✈️', { fontSize: '26px' }).setOrigin(0, 0.5)

    // Instrução — linha 1 (centralizada, fonte grande)
    this.instructionText = this.add.text(640, 34, 'Carregando...', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#0D1B2A',
      strokeThickness: 4,
      wordWrap: { width: 840 },
      align: 'center',
    }).setOrigin(0.5)

    // Separador sutil
    this.add.rectangle(640, 58, 800, 1, 0x4FC3F7, 0.22)

    // Ícone de dica (esquerda da linha 2)
    this.add.text(186, 80, '👉', { fontSize: '16px' }).setOrigin(0.5)

    // Dica / pergunta — linha 2 (amarela, menor)
    this.hintText = this.add.text(640, 80, '', {
      fontSize: '17px',
      fontFamily: 'Arial, sans-serif',
      color: '#F9E79F',
      stroke: '#0D1B2A',
      strokeThickness: 3,
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5)

    // Estrelas de nível (canto direito)
    this.add.text(1095, 22, 'Nível', {
      fontSize: '11px', color: '#607D8B', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1095, 46, '★☆☆', {
      fontSize: '22px', color: '#FFD700',
    }).setOrigin(0.5)

    // Botão mute (canto direito)
    this.createMuteButton()
  }

  // ── Botão mute ────────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1248, 56, 52, 60, 0x1A2A3A, 0.9)
      .setStrokeStyle(1.5, 0x4FC3F7)
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

  private registerListeners() {
    EventBus.on('mission-update', (data: MissionUpdatePayload) => {
      this.instructionText.setText(data.instruction)
      this.hintText.setText(data.hint)
      this.levelStars.setText('★'.repeat(data.level) + '☆'.repeat(3 - data.level))
      this.updateDots(data.missionIndex, data.totalMissions)
    }, this)
  }

  private updateDots(completedCount: number, total: number) {
    this.missionDots.forEach(d => d.destroy())
    this.missionDots = []

    const dotR   = 7
    const gap    = 20
    const totalW = total * (dotR * 2) + (total - 1) * (gap - dotR * 2)
    const startX = 1148 - totalW / 2 + dotR

    for (let i = 0; i < total; i++) {
      const dot    = this.add.graphics()
      const filled = i < completedCount
      dot.fillStyle(filled ? 0x4FC3F7 : 0x37474F, 1)
      dot.fillCircle(0, 0, dotR)
      if (filled) {
        dot.lineStyle(1.5, 0x29B6F6)
        dot.strokeCircle(0, 0, dotR)
      }
      dot.setPosition(startX + i * gap, 82)
      this.missionDots.push(dot)
    }
  }
}
