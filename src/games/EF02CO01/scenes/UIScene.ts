import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

/**
 * UIScene — HUD paralelo sobreposto à GameScene.
 *
 * Topo (y=0-90):
 *   ✈️ Hangar dos Modelos  |  missão atual  |  ★★☆ Nível  |  🔊
 *
 * Rodapé (y=640-720):
 *   ✅ 0   ✖ 0   [=== Progresso ===]   Fase N
 */
export class UIScene extends Phaser.Scene {
  private progressBar!:   Phaser.GameObjects.Rectangle
  private hitsText!:      Phaser.GameObjects.Text
  private errorsText!:    Phaser.GameObjects.Text
  private levelStars!:    Phaser.GameObjects.Text
  private missionLabel!:  Phaser.GameObjects.Text
  private levelConfig?:   LevelConfig

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.createBottomBar()
    this.registerListeners()
  }

  shutdown() {
    EventBus.off('scene-ready',      undefined, this)
    EventBus.off('update-progress',  undefined, this)
    EventBus.off('mute-audio',       undefined, this)
  }

  // ── Barra superior ────────────────────────────────────────────────────────

  private createTopBar() {
    // Fundo escuro semi-transparente
    this.add.rectangle(640, 45, 1280, 90, 0x0D1B2A, 0.92)
      .setStrokeStyle(2, 0x4FC3F7)

    // Título do jogo
    this.add.text(22, 45, '✈️  Hangar dos Modelos', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
    }).setOrigin(0, 0.5)

    // Missão atual (atualizado em scene-ready)
    this.missionLabel = this.add.text(300, 45, '', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#90CAF9',
      wordWrap: { width: 680 },
    }).setOrigin(0, 0.5)

    // Estrelas de nível
    this.add.text(1065, 26, 'Nível', {
      fontSize: '13px', color: '#607D8B', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1065, 58, '★☆☆', {
      fontSize: '28px', color: '#FFD700',
    }).setOrigin(0.5)

    // Botão mute
    this.createMuteButton()
  }

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1232, 45, 60, 52, 0x1565C0, 0.8)
      .setStrokeStyle(2, 0x90CAF9)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1232, 45, '🔊', { fontSize: '26px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover', () => btn.setFillStyle(0x1976D2))
    btn.on('pointerout',  () => btn.setFillStyle(0x1565C0))
  }

  // ── Barra inferior ────────────────────────────────────────────────────────

  private createBottomBar() {
    const BAR_Y = 680

    this.add.rectangle(640, BAR_Y, 1280, 80, 0x0D1B2A, 0.92)
      .setStrokeStyle(2, 0x4FC3F7)

    // Acertos
    this.add.text(28, BAR_Y, '✅', { fontSize: '22px' }).setOrigin(0, 0.5)
    this.hitsText = this.add.text(58, BAR_Y, '0', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#66BB6A',
    }).setOrigin(0, 0.5)

    // Erros
    this.add.text(110, BAR_Y, '✖', { fontSize: '22px', color: '#EF5350' }).setOrigin(0, 0.5)
    this.errorsText = this.add.text(140, BAR_Y, '0', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#EF5350',
    }).setOrigin(0, 0.5)

    // Rótulo progresso
    this.add.text(450, BAR_Y - 16, 'Progresso', {
      fontSize: '13px', color: '#607D8B', fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Barra de progresso
    const barX = 450, barW = 560
    this.add.rectangle(barX, BAR_Y + 4, barW, 22, 0x1A2F4A)
      .setStrokeStyle(1, 0x37474F)
    this.progressBar = this.add
      .rectangle(barX - barW / 2, BAR_Y + 4, 0, 22, 0x4FC3F7)
      .setOrigin(0, 0.5)
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  private registerListeners() {
    EventBus.on(
      'scene-ready',
      (data: { levelConfig: LevelConfig; missionIndex: number }) => {
        this.levelConfig = data.levelConfig
        this.updateLevelStars()
        this.updateMissionLabel(data.missionIndex)
        this.progressBar.setSize(0, 22)
        this.hitsText.setText('0')
        this.errorsText.setText('0')
      },
      this,
    )

    EventBus.on(
      'update-progress',
      (data: { pct: number; hits: number; errors: number }) => {
        const barW = 560
        this.progressBar.setSize(barW * data.pct, 22)
        this.hitsText.setText(String(data.hits))
        this.errorsText.setText(String(data.errors))
      },
      this,
    )
  }

  private updateLevelStars() {
    if (!this.levelConfig) return
    const filled = this.levelConfig.level
    this.levelStars.setText('★'.repeat(filled) + '☆'.repeat(3 - filled))
  }

  private updateMissionLabel(missionIndex: number) {
    if (!this.levelConfig) return

    const lvl = this.levelConfig.level
    if (lvl === 1 && this.levelConfig.filterMissions) {
      const m = this.levelConfig.filterMissions[missionIndex]
      this.missionLabel.setText(m ? `📋  ${m.question}` : '')
    } else if (lvl === 2 && this.levelConfig.comparisonPairs) {
      this.missionLabel.setText('📋  Compare os dois veículos!')
    } else if (lvl === 3 && this.levelConfig.groupingMissions) {
      const m = this.levelConfig.groupingMissions[missionIndex]
      this.missionLabel.setText(m ? `📋  ${m.question}` : '')
    }
  }
}
