import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import type { LevelConfig } from '../types'

/**
 * UIScene — HUD paralelo sobreposto à GameScene.
 *
 * Responsabilidades:
 * - Cartão de regra ativa (qual atributo classificar + botão repetir narração)
 * - Barra de progresso de itens entregues
 * - Contador de acertos e erros
 * - Botão mute (futuro: quando áudio existir)
 *
 * Roda em paralelo com GameScene — nunca pausar a GameScene a partir daqui.
 */
export class UIScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle
  private ruleText!: Phaser.GameObjects.Text
  private hitsText!: Phaser.GameObjects.Text
  private errorsText!: Phaser.GameObjects.Text
  private levelConfig?: LevelConfig

  constructor() {
    super({ key: 'UIScene' })
  }

  create() {
    this.createRuleCard()
    this.createProgressBar()
    this.createCounters()
    this.createMuteButton()
    this.registerEventListeners()
  }

  shutdown() {
    EventBus.off('scene-ready',      undefined, this)
    EventBus.off('update-progress',  undefined, this)
    EventBus.off('mute-audio',       undefined, this)
  }

  // ─── Cartão de regra ──────────────────────────────────────────────────────

  private createRuleCard() {
    // Fundo do cartão
    this.add.rectangle(220, 650, 380, 100, 0x2d1b69, 0.95)
      .setStrokeStyle(2, 0x7c3aed)

    this.add.text(60, 620, 'Regra:', {
      fontSize: '16px',
      color: '#a78bfa',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    })

    this.ruleText = this.add.text(60, 642, 'Aguardando…', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      wordWrap: { width: 300 },
    })

    // Botão de repetir narração
    const repeatBtn = this.add.rectangle(390, 650, 44, 44, 0x7c3aed)
      .setStrokeStyle(2, 0xc4b5fd)
      .setInteractive({ useHandCursor: true })

    this.add.text(390, 650, '🔊', { fontSize: '20px' }).setOrigin(0.5)

    repeatBtn.on('pointerdown', () => {
      // TODO: this.sound.play(this.levelConfig?.bases[0]?.audioKey ?? '')
    })

    repeatBtn.on('pointerover',  () => repeatBtn.setFillStyle(0x9c3aed))
    repeatBtn.on('pointerout',   () => repeatBtn.setFillStyle(0x7c3aed))
  }

  // ─── Barra de progresso ───────────────────────────────────────────────────

  private createProgressBar() {
    const x = 640
    const y = 695
    const w = 500
    const h = 18

    this.add.text(x, y - 20, 'Progresso', {
      fontSize: '14px',
      color: '#a78bfa',
      fontFamily: 'Arial',
    }).setOrigin(0.5)

    this.add.rectangle(x, y, w, h, 0x333344)
    this.progressBar = this.add.rectangle(x - w / 2, y, 0, h, 0x7c3aed)
    this.progressBar.setOrigin(0, 0.5)
  }

  // ─── Contadores ───────────────────────────────────────────────────────────

  private createCounters() {
    this.add.text(1020, 620, '✅ Acertos:', {
      fontSize: '16px', color: '#86efac', fontFamily: 'Arial',
    })
    this.hitsText = this.add.text(1150, 620, '0', {
      fontSize: '20px', color: '#86efac', fontFamily: 'Arial', fontStyle: 'bold',
    })

    this.add.text(1020, 650, '❌ Erros:', {
      fontSize: '16px', color: '#fca5a5', fontFamily: 'Arial',
    })
    this.errorsText = this.add.text(1150, 650, '0', {
      fontSize: '20px', color: '#fca5a5', fontFamily: 'Arial', fontStyle: 'bold',
    })
  }

  // ─── Botão Mute ───────────────────────────────────────────────────────────

  private createMuteButton() {
    let muted = false

    const btn = this.add.rectangle(1240, 695, 52, 36, 0x333344)
      .setStrokeStyle(2, 0x7c3aed)
      .setInteractive({ useHandCursor: true })

    const icon = this.add.text(1240, 695, '🔊', { fontSize: '18px' }).setOrigin(0.5)

    btn.on('pointerdown', () => {
      muted = !muted
      icon.setText(muted ? '🔇' : '🔊')
      EventBus.emit('mute-audio', muted)
    })

    btn.on('pointerover', () => btn.setFillStyle(0x4a3f6b))
    btn.on('pointerout',  () => btn.setFillStyle(0x333344))
  }

  // ─── Listeners do EventBus ────────────────────────────────────────────────

  private registerEventListeners() {
    EventBus.on('scene-ready', (data: { levelConfig: LevelConfig }) => {
      this.levelConfig = data.levelConfig
      this.updateRuleText()
    }, this)

    EventBus.on('update-progress', (pct: number) => {
      const w = 500
      this.progressBar.setSize(w * pct, 18)

      // Atualiza contadores ouvindo hits/errors via progresso
      const gameScene = this.scene.get('GameScene') as unknown as { hits: number; errors: number }
      if (gameScene) {
        this.hitsText.setText(String(gameScene.hits ?? 0))
        this.errorsText.setText(String(gameScene.errors ?? 0))
      }
    }, this)

    EventBus.on('mute-audio', (_muted: boolean) => {
      // TODO: this.sound.setMute(muted) quando áudio existir
    }, this)
  }

  private updateRuleText() {
    if (!this.levelConfig) return
    const attrLabel: Record<string, string> = {
      cor:     'Separe por COR',
      forma:   'Separe por FORMA',
      tamanho: 'Separe por TAMANHO',
    }
    this.ruleText.setText(attrLabel[this.levelConfig.criterion] ?? '')
  }
}
