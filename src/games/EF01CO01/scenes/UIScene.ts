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
  private timerPctText!: Phaser.GameObjects.Text
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
    // Layout vertical compacto:
    //   letreiro centrado em SIGN_CY       (y ≈ 0–56)
    //   barra de timer a partir de BAR_Y   (y ≈ 64–92)
    const SIGN_CY    = 70    // centro vertical do letreiro
    const SIGN_DW    = 920   // largura de exibição (inclui pontas com folhas)
    const SIGN_DH    = 199    // altura de exibição
    const BAR_Y      = SIGN_CY + SIGN_DH / 2 + 8  // 84 — imediatamente abaixo
    const barW       = 860
    const barLeft    = (1280 - barW) / 2            // 210

    // ── Letreiro ──────────────────────────────────────────────────────────────
    if (this.textures.exists('wood-sign')) {
      // Sem sombra programática — a imagem já traz profundidade própria
      this.add.image(640, SIGN_CY, 'wood-sign')
        .setDisplaySize(SIGN_DW, SIGN_DH)
        .setOrigin(0.5)
    } else {
      // Fallback programático
      const signW  = 680
      const signH  = 52
      const signX  = 640 - signW / 2
      const signGfx = this.add.graphics()
      signGfx.fillStyle(0x000000, 0.25)
      signGfx.fillRoundedRect(signX + 4, SIGN_CY - signH / 2 + 5, signW, signH, 14)
      signGfx.fillStyle(0xC8872A, 1)
      signGfx.fillRoundedRect(signX, SIGN_CY - signH / 2, signW, signH, 12)
      signGfx.fillStyle(0xE5A84E, 0.7)
      signGfx.fillRoundedRect(signX + 3, SIGN_CY - signH / 2 + 3, signW - 6, signH * 0.42, { tl: 10, tr: 10, bl: 0, br: 0 })
      signGfx.lineStyle(4, 0x7A4A10, 1)
      signGfx.strokeRoundedRect(signX, SIGN_CY - signH / 2, signW, signH, 12)

      const vineL = this.add.graphics()
      const rx = signX + signW
      vineL.fillStyle(0x2E7D32, 1)
      vineL.fillEllipse(signX - 28, SIGN_CY, 26, 13)
      vineL.fillEllipse(signX - 18, SIGN_CY - 14, 22, 11)
      vineL.fillEllipse(signX - 18, SIGN_CY + 14, 22, 11)
      vineL.fillStyle(0x4CAF50, 1)
      vineL.fillEllipse(signX - 36, SIGN_CY - 6, 18, 9)
      vineL.fillEllipse(signX - 36, SIGN_CY + 6, 16, 8)
      vineL.fillEllipse(signX - 26, SIGN_CY - 18, 16, 8)
      vineL.fillStyle(0x66BB6A, 0.55)
      vineL.fillEllipse(signX - 28, SIGN_CY, 14, 7)
      vineL.lineStyle(1.2, 0x1B5E20, 0.5)
      vineL.strokeEllipse(signX - 28, SIGN_CY, 26, 13)
      vineL.strokeEllipse(signX - 18, SIGN_CY - 14, 22, 11)
      vineL.strokeEllipse(signX - 18, SIGN_CY + 14, 22, 11)
      vineL.fillStyle(0x2E7D32, 1)
      vineL.fillEllipse(rx + 28, SIGN_CY, 26, 13)
      vineL.fillEllipse(rx + 18, SIGN_CY - 14, 22, 11)
      vineL.fillEllipse(rx + 18, SIGN_CY + 14, 22, 11)
      vineL.fillStyle(0x4CAF50, 1)
      vineL.fillEllipse(rx + 36, SIGN_CY - 6, 18, 9)
      vineL.fillEllipse(rx + 36, SIGN_CY + 6, 16, 8)
      vineL.fillEllipse(rx + 26, SIGN_CY - 18, 16, 8)
      vineL.fillStyle(0x66BB6A, 0.55)
      vineL.fillEllipse(rx + 28, SIGN_CY, 14, 7)
      vineL.lineStyle(1.2, 0x1B5E20, 0.5)
      vineL.strokeEllipse(rx + 28, SIGN_CY, 26, 13)
      vineL.strokeEllipse(rx + 18, SIGN_CY - 14, 22, 11)
      vineL.strokeEllipse(rx + 18, SIGN_CY + 14, 22, 11)

      this.add.text(signX + 14, SIGN_CY, '🌸', { fontSize: '18px' }).setOrigin(0, 0.5)
      this.add.text(signX + signW - 14, SIGN_CY, '🌸', { fontSize: '18px' }).setOrigin(1, 0.5)
    }

    // Texto centralizado no mesmo ponto da imagem
    this.add.text(640, SIGN_CY, 'Energia do Jardim', {
      fontSize: '30px',
      fontFamily: 'Arial Black, Arial',
      color: '#4A2000',
      stroke: '#F5D99B',
      strokeThickness: 2,
    }).setOrigin(0.5, 1)

    // ── Timer bar ────────────────────────────────────────────────────────────
    const starL = this.add.text(barLeft - 22, BAR_Y + 20, '⭐', { fontSize: '22px' }).setOrigin(0.5)
    this.tweens.add({
      targets: starL,
      scaleX: 1.2, scaleY: 1.2,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    const trackGfx = this.add.graphics()
    trackGfx.fillStyle(0x33190A, 0.82)
    trackGfx.fillRoundedRect(barLeft, BAR_Y, barW, 28, 14)
    trackGfx.lineStyle(3, 0x7A4A10, 0.9)
    trackGfx.strokeRoundedRect(barLeft, BAR_Y, barW, 28, 14)

    this.timerBar = this.add
      .rectangle(barLeft, BAR_Y + 14, barW, 28, 0x4CAF50)
      .setOrigin(0, 0.5)

    this.timerPctText = this.add.text(barLeft + barW - 10, BAR_Y + 14, '100%', {
      fontSize: '15px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFDE7',
      stroke: '#1A0A00',
      strokeThickness: 3,
    }).setOrigin(1, 0.5).setDepth(2)

    const shineGfx = this.add.graphics()
    shineGfx.fillStyle(0xFFFFFF, 0.16)
    shineGfx.fillRoundedRect(barLeft + 2, BAR_Y + 2, barW - 4, 10, { tl: 12, tr: 12, bl: 0, br: 0 })

    // ── Estrelas de nível (canto superior direito) ────────────────────────────
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

    this.exampleIcons = this.add.text(0, -999, '', { fontSize: '1px' })
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
      this.timerPctText.setText(`${Math.round(data.pct * 100)}%`)
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
