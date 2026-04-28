import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

/**
 * UIScene — HUD paralelo sobreposto à GameScene.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────────────────┐
 *   │ 📋 Regra: [texto]     [ícones de exemplo]    ★★☆ Nível   🔊  │ y=0-90
 *   ├─────────────────────────────────────────────────────────────────────┤
 *   │                        ÁREA DE JOGO                                  │
 *   ├─────────────────────────────────────────────────────────────────────┤
 *   │ ✅ 0   ✖ 0          [=== Progresso ===]               Nível 1   │ y=640-720
 *   └─────────────────────────────────────────────────────────────────────┘
 *
 * Neurodivergência:
 *  - Regra visível o tempo todo no topo
 *  - Ícones de cada base listados ao lado da regra
 *  - Cores de alto contraste (texto escuro em fundo claro)
 *  - Nível indicado por estrelas preenchidas (★★☆)
 */
export class UIScene extends Phaser.Scene {
  private progressBar!:  Phaser.GameObjects.Rectangle
  private ruleText!:     Phaser.GameObjects.Text
  private hitsText!:     Phaser.GameObjects.Text
  private errorsText!:   Phaser.GameObjects.Text
  private levelStars!:   Phaser.GameObjects.Text
  private exampleIcons!: Phaser.GameObjects.Text
  private levelConfig?:  LevelConfig

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createTopBar()
    this.createBottomBar()
    this.registerEventListeners()
  }

  shutdown() {
    EventBus.off('scene-ready',     undefined, this)
    EventBus.off('update-progress', undefined, this)
    EventBus.off('mute-audio',      undefined, this)
  }

  // ── Barra superior ────────────────────────────────────────────────────────

  private createTopBar() {
    // Fundo creme semi-transparente
    this.add.rectangle(640, 45, 1280, 90, 0xFFF8F0, 0.94)
      .setStrokeStyle(3, 0xDEB887)

    // Rótulo "Regra:"
    this.add.text(18, 45, '📋', { fontSize: '24px' }).setOrigin(0, 0.5)
    this.add.text(52, 45, 'Regra:', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#7F8C8D',
    }).setOrigin(0, 0.5)

    // Texto da regra (atualizado no scene-ready)
    this.ruleText = this.add.text(140, 45, '…', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#1A1A2E',
    }).setOrigin(0, 0.5)

    // Ícones de exemplo das bases (atualizado no scene-ready)
    this.exampleIcons = this.add.text(520, 45, '', {
      fontSize: '26px',
    }).setOrigin(0, 0.5)

    // Estrelas de nível
    this.add.text(1060, 26, 'Nível', {
      fontSize: '14px', color: '#95A5A6', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1060, 58, '★☆☆', {
      fontSize: '28px', color: '#F1C40F',
    }).setOrigin(0.5)

    // Botão mute
    this.createMuteButton()
  }

  // ── Botão mute ────────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1232, 45, 60, 52, 0xECF0F1, 0.9)
      .setStrokeStyle(2, 0xBDC3C7)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1232, 45, '🔊', { fontSize: '26px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })
    btn.on('pointerover', () => btn.setFillStyle(0xD5D8DC))
    btn.on('pointerout',  () => btn.setFillStyle(0xECF0F1))
  }

  // ── Barra inferior ────────────────────────────────────────────────────────

  private createBottomBar() {
    const BAR_Y = 680

    // Fundo creme
    this.add.rectangle(640, BAR_Y, 1280, 80, 0xFFF8F0, 0.94)
      .setStrokeStyle(3, 0xDEB887)

    // Acertos
    this.add.text(28, BAR_Y, '✅', { fontSize: '22px' }).setOrigin(0, 0.5)
    this.hitsText = this.add.text(58, BAR_Y, '0', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#27AE60',
    }).setOrigin(0, 0.5)

    // Erros
    this.add.text(110, BAR_Y, '✖', {
      fontSize: '22px', color: '#E74C3C',
    }).setOrigin(0, 0.5)
    this.errorsText = this.add.text(140, BAR_Y, '0', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#E74C3C',
    }).setOrigin(0, 0.5)

    // Rótulo Progresso
    this.add.text(310, BAR_Y - 16, 'Progresso', {
      fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial',
    }).setOrigin(0.5)

    // Barra de progresso
    const barX = 310
    const barW = 640
    this.add.rectangle(barX, BAR_Y + 4, barW, 22, 0xDFE6E9)
      .setStrokeStyle(1, 0xBDC3C7)
    this.progressBar = this.add.rectangle(barX - barW / 2, BAR_Y + 4, 0, 22, 0x2ECC71)
      .setOrigin(0, 0.5)

    // Indicador de nível (texto simples, lado direito)
    this.add.text(660, BAR_Y - 16, 'Fase', {
      fontSize: '13px', color: '#95A5A6', fontFamily: 'Arial',
    }).setOrigin(0, 0.5)
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  private registerEventListeners() {
    EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
      this.levelConfig = data.levelConfig
      this.updateRuleText()
      this.updateLevelStars()
      this.updateExampleIcons()
      // Reseta barra de progresso e contadores no início de cada nível
      this.progressBar.setSize(0, 22)
      this.hitsText.setText('0')
      this.errorsText.setText('0')
    }, this)

    EventBus.on('update-progress', (data: { pct: number; hits: number; errors: number }) => {
      const barW = 640
      this.progressBar.setSize(barW * data.pct, 22)
      this.hitsText.setText(String(data.hits))
      this.errorsText.setText(String(data.errors))
    }, this)

    EventBus.on('mute-audio', () => {
      // áudio gerenciado pelo GameScene via handleMuteAudio
    }, this)
  }

  // ── Atualizações de UI ────────────────────────────────────────────────────

  private updateRuleText() {
    if (!this.levelConfig) return
    const map: Record<string, string> = {
      cor:     'Separe por  COR',
      forma:   'Separe por  FORMA',
      tamanho: 'Separe por  TAMANHO',
    }
    this.ruleText.setText(map[this.levelConfig.criterion] ?? '')
  }

  private updateLevelStars() {
    if (!this.levelConfig) return
    const filled = this.levelConfig.level
    this.levelStars.setText('★'.repeat(filled) + '☆'.repeat(3 - filled))
  }

  /** Mostra os ícones das bases ao lado da regra (ex: 🔴 🔵 para cor) */
  private updateExampleIcons() {
    if (!this.levelConfig) return
    const icons = this.levelConfig.bases
      .map(b => this.getBaseIcon(b.rule.attribute, b.rule.value))
      .join('  ')
    this.exampleIcons.setText(icons)
  }

  private getBaseIcon(attribute: string, value: string): string {
    if (attribute === 'cor') {
      const m: Record<string, string> = {
        vermelho: '🔴', azul: '🔵', verde: '🟢', amarelo: '🟡',
      }
      return m[value] ?? '⬜'
    }
    if (attribute === 'forma') {
      const m: Record<string, string> = {
        circulo: '⭕', quadrado: '⬛', triangulo: '🔺', retangulo: '▬',
      }
      return m[value] ?? '?'
    }
    return '?'
  }
}
