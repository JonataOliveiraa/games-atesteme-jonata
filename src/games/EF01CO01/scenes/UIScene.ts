import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

/**
 * UIScene — HUD paralelo sobreposto à GameScene.
 *
 * Layout (baseado no design "Jardim Mágico das Cores"):
 *
 *   [sky — GameScene visível por trás (sem fundo opaco no topo)]
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │   ⭐           🌸 Energia do Jardim 🌸         [★★☆] [🔊]  │ y=0-105
 *   │                 [███████████████████░░░] 75%                 │
 *   └──────────────────────────────────────────────────────────────┘
 *   (área de jogo — sky/grass/items/bases visíveis por trás)
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ ✅ 0  ✖ 0    [═══ Progresso ═══]    🌿 Separe por COR       │ y=640-720
 *   └──────────────────────────────────────────────────────────────┘
 */
export class UIScene extends Phaser.Scene {
  private progressBar!:  Phaser.GameObjects.Rectangle
  private timerBar!:     Phaser.GameObjects.Rectangle
  private timerBarTotal  = 1
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
    EventBus.off('update-timer',    undefined, this)
    EventBus.off('init-timer',      undefined, this)
    EventBus.off('start-timer',     undefined, this)
    EventBus.off('mute-audio',      undefined, this)
  }

  // ── Barra superior (transparente — deixa o céu do GameScene aparecer) ────────

  private createTopBar() {
    // ── "Energia do Jardim" — placa decorativa de madeira ────────────────────
    const signW = 680
    const signH = 52
    const signX = 640 - signW / 2
    const signY = 8

    const signGfx = this.add.graphics()

    // Sombra da placa
    signGfx.fillStyle(0x000000, 0.25)
    signGfx.fillRoundedRect(signX + 4, signY + 5, signW, signH, 14)

    // Corpo da placa (madeira)
    signGfx.fillStyle(0xC8872A, 1)
    signGfx.fillRoundedRect(signX, signY, signW, signH, 12)

    // Gradiente de brilho superior
    signGfx.fillStyle(0xE5A84E, 0.7)
    signGfx.fillRoundedRect(signX + 3, signY + 3, signW - 6, signH * 0.42, { tl: 10, tr: 10, bl: 0, br: 0 })

    // Borda escura
    signGfx.lineStyle(4, 0x7A4A10, 1)
    signGfx.strokeRoundedRect(signX, signY, signW, signH, 12)

    // Decorações foliares nos cantos
    signGfx.fillStyle(0x4CAF50, 1)
    const leafPoints = [
      { x: signX - 12, y: signY + signH / 2 - 8 },
      { x: signX - 20, y: signY + signH / 2 },
      { x: signX - 12, y: signY + signH / 2 + 8 },
      { x: signX + signW + 12, y: signY + signH / 2 - 8 },
      { x: signX + signW + 20, y: signY + signH / 2 },
      { x: signX + signW + 12, y: signY + signH / 2 + 8 },
    ]
    leafPoints.forEach(p => signGfx.fillCircle(p.x, p.y, 7))

    // ícones de flor nos cantos internos da placa
    this.add.text(signX + 14, signY + signH / 2, '🌸', { fontSize: '18px' }).setOrigin(0, 0.5)
    this.add.text(signX + signW - 14, signY + signH / 2, '🌸', { fontSize: '18px' }).setOrigin(1, 0.5)

    // Título
    this.add.text(640, signY + signH / 2 + 1, 'Energia do Jardim', {
      fontSize: '26px',
      fontFamily: 'Arial Black, Arial',
      color: '#4A2000',
      stroke: '#F5D99B',
      strokeThickness: 2,
    }).setOrigin(0.5)

    // ── Timer bar ────────────────────────────────────────────────────────────
    const barY = signY + signH + 10   // = 70
    const barW = 860
    const barLeft = (1280 - barW) / 2 // = 210

    // Estrela à esquerda da barra
    const starL = this.add.text(barLeft - 22, barY + 14, '⭐', { fontSize: '22px' }).setOrigin(0.5)
    this.tweens.add({
      targets: starL,
      scaleX: 1.2, scaleY: 1.2,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // Trilho da barra
    const trackGfx = this.add.graphics()
    trackGfx.fillStyle(0x33190A, 0.82)
    trackGfx.fillRoundedRect(barLeft, barY, barW, 28, 14)
    trackGfx.lineStyle(3, 0x7A4A10, 0.9)
    trackGfx.strokeRoundedRect(barLeft, barY, barW, 28, 14)

    // Barra de progresso (timer)
    this.timerBar = this.add
      .rectangle(barLeft, barY + 14, barW, 28, 0x4CAF50)
      .setOrigin(0, 0.5)

    // Brilho superior da barra
    const shineGfx = this.add.graphics()
    shineGfx.fillStyle(0xFFFFFF, 0.16)
    shineGfx.fillRoundedRect(barLeft + 2, barY + 2, barW - 4, 10, { tl: 12, tr: 12, bl: 0, br: 0 })

    // ── Estrelas de nível (flutuantes no canto superior direito) ─────────────
    const levBg = this.add.graphics()
    levBg.fillStyle(0x1B5E20, 0.82)
    levBg.fillRoundedRect(1078, 8, 120, 52, 10)
    levBg.lineStyle(2, 0x4CAF50, 0.8)
    levBg.strokeRoundedRect(1078, 8, 120, 52, 10)

    this.add.text(1138, 16, 'Nível', {
      fontSize: '13px', color: '#A5D6A7', fontFamily: 'Arial',
    }).setOrigin(0.5)
    this.levelStars = this.add.text(1138, 44, '★☆☆', {
      fontSize: '24px', color: '#FFD700',
      stroke: '#1B5E20', strokeThickness: 3,
    }).setOrigin(0.5)

    // Ícones de exemplo (ocultos — mantidos apenas para updateExampleIcons funcionar)
    this.exampleIcons = this.add.text(0, -999, '', { fontSize: '1px' })

    // Texto de regra (movido para a barra inferior — placeholder aqui)
    this.ruleText = this.add.text(0, -999, '', { fontSize: '1px' })

    this.createMuteButton()
  }

  // ── Botão mute ────────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const drawBtn = (active: boolean, hover: boolean) => {
      btnGfx.clear()
      const fillColor = active ? 0x880000 : hover ? 0x2E7D32 : 0x1B5E20
      const borderColor = active ? 0xFF5252 : hover ? 0x81C784 : 0x4CAF50
      btnGfx.fillStyle(fillColor, 0.88)
      btnGfx.fillRoundedRect(1210, 10, 54, 50, 10)
      btnGfx.lineStyle(2, borderColor, 1)
      btnGfx.strokeRoundedRect(1210, 10, 54, 50, 10)
    }

    const btnGfx = this.add.graphics()
    drawBtn(false, false)

    const btn = this.add.rectangle(1237, 35, 54, 50, 0x000000, 0)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1237, 35, '🔊', { fontSize: '24px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
      drawBtn(muted, false)
    })
    btn.on('pointerover', () => drawBtn(muted, true))
    btn.on('pointerout',  () => drawBtn(muted, false))
  }

  // ── Barra inferior ────────────────────────────────────────────────────────

  private createBottomBar() {
    const BAR_Y = 680

    // Fundo verde da barra inferior
    const bgGfx = this.add.graphics()
    bgGfx.fillStyle(0x2E7D32, 0.97)
    bgGfx.fillRect(0, 640, 1280, 80)
    bgGfx.lineStyle(3, 0x1B5E20, 1)
    bgGfx.lineBetween(0, 640, 1280, 640)
    bgGfx.fillStyle(0x4CAF50, 0.28)
    bgGfx.fillEllipse(640, 640, 1280, 14)

    // Contador de acertos
    const hitsGfx = this.add.graphics()
    hitsGfx.fillStyle(0x1B5E20, 0.85)
    hitsGfx.fillRoundedRect(10, BAR_Y - 18, 90, 36, 10)
    hitsGfx.lineStyle(2, 0x81C784, 0.9)
    hitsGfx.strokeRoundedRect(10, BAR_Y - 18, 90, 36, 10)
    this.add.text(24, BAR_Y, '✅', { fontSize: '20px' }).setOrigin(0, 0.5)
    this.hitsText = this.add.text(54, BAR_Y, '0', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#A5D6A7',
    }).setOrigin(0, 0.5)

    // Contador de erros
    const errGfx = this.add.graphics()
    errGfx.fillStyle(0x1B5E20, 0.85)
    errGfx.fillRoundedRect(112, BAR_Y - 18, 90, 36, 10)
    errGfx.lineStyle(2, 0x81C784, 0.9)
    errGfx.strokeRoundedRect(112, BAR_Y - 18, 90, 36, 10)
    this.add.text(124, BAR_Y, '✖', { fontSize: '20px', color: '#EF9A9A' }).setOrigin(0, 0.5)
    this.errorsText = this.add.text(152, BAR_Y, '0', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#EF9A9A',
    }).setOrigin(0, 0.5)

    // Barra de progresso
    const barLeft = 218
    const barW    = 600
    const barCX   = barLeft + barW / 2

    this.add.text(barCX, BAR_Y - 18, 'Progresso', {
      fontSize: '12px', color: '#A5D6A7', fontFamily: 'Arial',
    }).setOrigin(0.5)

    const trackGfx = this.add.graphics()
    trackGfx.fillStyle(0x1B5E20, 0.85)
    trackGfx.fillRoundedRect(barLeft, BAR_Y - 2, barW, 26, 13)
    trackGfx.lineStyle(2, 0x4CAF50, 0.7)
    trackGfx.strokeRoundedRect(barLeft, BAR_Y - 2, barW, 26, 13)

    this.progressBar = this.add
      .rectangle(barLeft, BAR_Y + 11, 0, 26, 0x4CAF50)
      .setOrigin(0, 0.5)

    // Regra (lado direito da barra inferior, atualizado no scene-ready)
    this.ruleText = this.add.text(836, BAR_Y, '…', {
      fontSize: '20px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#1B5E20',
      strokeThickness: 4,
    }).setOrigin(0, 0.5)
  }

  // ── Listeners ─────────────────────────────────────────────────────────────

  private registerEventListeners() {
    EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
      this.levelConfig = data.levelConfig
      this.updateRuleText()
      this.updateLevelStars()
      // Reset progress bar
      this.progressBar.setSize(0, 26)
      this.hitsText.setText('0')
      this.errorsText.setText('0')
      // Reset timer bar to full (waits for start-timer to go live)
      if (this.timerBar && this.levelConfig.timeLimit) {
        this.timerBar.setSize(860, 28).setFillStyle(0x4CAF50)
      }
    }, this)

    EventBus.on('init-timer', (data: { total: number }) => {
      this.timerBarTotal = data.total
      this.timerBar.setSize(860, 28).setFillStyle(0x4CAF50)
    }, this)

    EventBus.on('start-timer', () => {
      // Timer bar is already visible and full; update-timer will drain it
    }, this)

    EventBus.on('update-timer', (data: { pct: number; color: number }) => {
      this.timerBar.setSize(860 * data.pct, 28)
      this.timerBar.setFillStyle(data.color)
    }, this)

    EventBus.on('update-progress', (data: { pct: number; hits: number; errors: number }) => {
      this.progressBar.setSize(600 * data.pct, 26)
      this.hitsText.setText(String(data.hits))
      this.errorsText.setText(String(data.errors))
    }, this)

    EventBus.on('mute-audio', () => {
      // áudio gerenciado pelo GameScene
    }, this)
  }

  // ── Atualizações de UI ────────────────────────────────────────────────────

  private updateRuleText() {
    if (!this.levelConfig) return
    const map: Record<string, string> = {
      cor:     '🌈 Separe por COR',
      forma:   '🔺 Separe por FORMA',
      tamanho: '📏 Separe por TAMANHO',
    }
    this.ruleText.setText(map[this.levelConfig.criterion] ?? '')
  }

  private updateLevelStars() {
    if (!this.levelConfig) return
    const filled = this.levelConfig.level
    this.levelStars.setText('★'.repeat(filled) + '☆'.repeat(3 - filled))
  }

  private getBaseIcon(attribute: string, value: string): string {
    if (attribute === 'cor') {
      const m: Record<string, string> = {
        vermelho: '🔴', azul: '🔵', verde: '🟢', amarelo: '🟡', roxo: '🟣',
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
