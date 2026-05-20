import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../shared/types/game'
import type { GameItem, LevelConfig, ClassifierBase } from '../types'
import { LEVELS } from '../data/levels'

interface DraggableItem extends Phaser.GameObjects.Image {
  itemData: GameItem
  originX_: number
  originY_: number
}

const ITEM_Y = 295       // linha única (n ≤ 9)
const ITEM_Y_ROW1 = 225  // primeira linha (n > 9)
const ITEM_Y_ROW2 = 350  // segunda linha  (n > 9)
const TIMER_BAR_Y = 78
const TIMER_BAR_W = 860
const GAME_ID = 'base-dos-classificadores'


export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private bases: Phaser.GameObjects.Container[] = []
  private itemSprites: DraggableItem[] = []
  private hits = 0
  private errors = 0
  private startTime = 0
  private currentPoints = 0
  private currentLives = 1
  private gameEnded = false
  private unsubscribePlatformCommands?: () => void

  private timerEvent?: Phaser.Time.TimerEvent

  private isMuted = false
  private lastWarningBeat = -1

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.hits = 0
    this.errors = 0
    this.startTime = Date.now()
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
    this.gameEnded = false
  }

  create() {
    // Launch the HUD scene in parallel (safe to call even if already active)
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene')
    }

    this.createBackground()
    this.createClouds()
    this.createItemTray()
    this.createBases()
    this.createItems()
    this.setupDrag()
    this.registerPlatformCommands()

    if (this.levelConfig.timeLimit) {
      EventBus.emit('init-timer', { total: this.levelConfig.timeLimit * 1000 })
    }

    EventBus.on('set-level', this.handleSetLevel, this)
    EventBus.on('mute-audio', this.handleMuteAudio, this)
    this.showStartScreen()
  }

  update() {
    if (this.timerEvent) {
      const remaining = this.timerEvent.getRemaining()
      const total = (this.levelConfig.timeLimit ?? 90) * 1000
      const pct = Math.max(0, remaining / total)

      const color = pct > 0.5 ? 0x4CAF50 : pct > 0.25 ? 0xFF9800 : 0xF44336
      EventBus.emit('update-timer', { pct, color })

      if (pct < 0.25 && pct > 0) {
        const beat = Math.ceil(remaining / 1000)
        if (beat !== this.lastWarningBeat) {
          this.lastWarningBeat = beat
          this.playTimerWarning()
        }
      }
    }
  }

  shutdown() {
    EventBus.off('set-level', this.handleSetLevel, this)
    EventBus.off('mute-audio', this.handleMuteAudio, this)
    this.timerEvent?.destroy()

    if (this.unsubscribePlatformCommands) {
      this.unsubscribePlatformCommands()
      this.unsubscribePlatformCommands = undefined
    }
  }

  private handleMuteAudio = (muted: boolean) => {
    this.isMuted = muted
  }

  private handleSetLevel = (data: { level: number }) => {
    this.scene.restart({
      level: data.level as 1 | 2 | 3,
      points: this.currentPoints,
      lives: this.currentLives,
    })
  }

  // ── Telas de fluxo ──────────────────────────────────────────────────────────

  private getLevelInstructions(): { objective: string; detail: string; tip: string } {
    const nItems = this.levelConfig.items.length
    const nBases = this.levelConfig.bases.length

    if (this.levelConfig.level === 1) {
      return {
        objective: `Separe ${nItems} itens em ${nBases} grupos de CORES.`,
        detail: 'As formas são diferentes — ignore-as! Use só a COR para classificar.',
        tip: 'Arraste cada item para a base com a mesma cor.',
      }
    }

    if (this.levelConfig.level === 2) {
      return {
        objective: `Classifique ${nItems} itens em ${nBases} grupos de CORES.`,
        detail: 'Agora são 4 cores e 3 formas. Foque na COR, não na forma!',
        tip: 'Arraste cada item para a base com a mesma cor.',
      }
    }

    return {
      objective: `Classifique ${nItems} itens em ${nBases} grupos de FORMAS.`,
      detail: 'Agora a FORMA é o critério — círculo, quadrado, triângulo ou retângulo!',
      tip: 'A cor não importa aqui. Observe a forma de cada item.',
    }
  }

  private showStartScreen() {
    const info = this.getLevelInstructions()
    const lvl = this.levelConfig.level

    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.78)
      .setDepth(60)
      .setInteractive()

    const starsStr =
      '★'.repeat(lvl) + '☆'.repeat(3 - lvl)
    const starsLbl = this.add
      .text(640, 155, starsStr, { fontSize: '48px', color: '#FFD700' })
      .setOrigin(0.5)
      .setDepth(61)

    const lvlTitle = this.add
      .text(640, 235, `NÍVEL ${lvl} — Primeiros Passos`, {
        fontSize: '56px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(61)

    const card = this.add
      .rectangle(640, 380, 900, 220, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0x2ecc71)
      .setDepth(61)

    const objective = this.add
      .text(640, 320, `🎯  ${info.objective}`, {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: '#AED6F1',
        wordWrap: { width: 820 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(62)

    const detail = this.add
      .text(640, 370, `✨  ${info.detail}`, {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#F9E79F',
        wordWrap: { width: 820 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(62)

    const tip = this.add
      .text(640, 420, `💡  ${info.tip}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#BDC3C7',
        wordWrap: { width: 820 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(62)

    const timerInfo = this.levelConfig.timeLimit
      ? `⏱  ${this.levelConfig.timeLimit} segundos`
      : ''
    const timerLbl = timerInfo ? this.add
      .text(640, 470, timerInfo, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#607D8B',
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(62) : null

    const btnBg = this.add
      .rectangle(640, 540, 280, 72, 0x2ecc71)
      .setStrokeStyle(3, 0x27ae60)
      .setDepth(61)
      .setInteractive({ useHandCursor: true })
    const btnText = this.add
      .text(640, 540, '▶  Iniciar', {
        fontSize: '30px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(62)

    const contentItems = [starsLbl, lvlTitle, card, objective, detail, tip, timerLbl, btnBg, btnText].filter(Boolean)

    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 },
      y: '+=6',
      duration: 400,
      ease: 'Back.Out',
    })

    this.tweens.add({
      targets: [btnBg, btnText],
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    const start = () => {
      this.playTone(523, 0.10, 'sine', 0.20)
      const all = [bg, ...contentItems]
      this.tweens.add({
        targets: all,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          all.forEach((o) => o?.destroy())
          runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
          EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
          this.emitCheckpoint()

          if (lvl === 1) {
            this.showTutorialStep(0)
          } else {
            this.revealItems()
            this.playGo()
            if (this.levelConfig.timeLimit) this.startTimer()
          }
        },
      })
    }

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x27ae60))
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x2ecc71))
    btnBg.on('pointerdown', start)
    btnText.setInteractive({ useHandCursor: true })
    btnText.on('pointerdown', start)
  }

  private showTutorialStep(stepIndex: number) {
    const steps = [
      {
        title: 'Observe os itens',
        description: 'Veja todos os itens na tela. Eles têm formas diferentes, mas o que importa é a COR!',
        emoji: '👀',
      },
      {
        title: 'Arraste para a base',
        description: 'Clique em um item e arraste-o até a base com a mesma COR.',
        emoji: '👆',
      },
      {
        title: 'Acerte a classificação',
        description: 'Se a COR estiver correta, você ganha um ponto! ✅',
        emoji: '🎯',
      },
      {
        title: 'Complete o nível',
        description: 'Classifique todos os itens pela COR antes do tempo acabar!',
        emoji: '⏰',
      },
    ]

    if (stepIndex >= steps.length) {
      this.revealItems()
      this.playGo()
      if (this.levelConfig.timeLimit) this.startTimer()
      return
    }

    const step = steps[stepIndex]

    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.82)
      .setDepth(60)
      .setInteractive()

    const emoji = this.add
      .text(640, 220, step.emoji, { fontSize: '80px' })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    const title = this.add
      .text(640, 310, step.title, {
        fontSize: '42px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    const description = this.add
      .text(640, 410, step.description, {
        fontSize: '26px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        stroke: '#000',
        strokeThickness: 3,
        wordWrap: { width: 900 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    const btnBg = this.add
      .rectangle(640, 530, 300, 64, 0x3498db)
      .setStrokeStyle(3, 0x2980b9)
      .setDepth(61)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0)

    const btnText = this.add
      .text(
        640,
        530,
        stepIndex === steps.length - 1 ? '▶  Começar!' : '▶  Próximo passo',
        {
          fontSize: '24px',
          fontFamily: 'Arial Black, Arial',
          color: '#FFFFFF',
        },
      )
      .setOrigin(0.5)
      .setDepth(62)
      .setAlpha(0)

    const contentItems = [emoji, title, description, btnBg, btnText]

    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.Out',
    })

    let done = false
    const advance = () => {
      if (done) return
      done = true
      autoTimer.destroy()
      this.playTone(523, 0.08, 'sine', 0.18)
      const all = [bg, ...contentItems]
      this.tweens.add({
        targets: all,
        alpha: 0,
        duration: 250,
        onComplete: () => {
          all.forEach((o) => o.destroy())
          this.showTutorialStep(stepIndex + 1)
        },
      })
    }

    const autoTimer = this.time.delayedCall(3000, advance)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x2980b9))
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x3498db))
    btnBg.on('pointerdown', advance)
    btnText.setInteractive({ useHandCursor: true })
    btnText.on('pointerdown', advance)
  }

  private showLevelCompleteScreen(nextLevel: 1 | 2 | 3) {
    this.playRoundComplete()

    const bg = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.65).setDepth(60)
    const starsLbl = this.add
      .text(640, 228, '⭐  ⭐  ⭐', { fontSize: '60px' })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)
    const mainLbl = this.add
      .text(640, 320, 'PARABÉNS! 🎉', {
        fontSize: '64px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 9,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)
    const subLbl = this.add
      .text(640, 405, `Nível ${this.levelConfig.level} concluído!`, {
        fontSize: '30px',
        color: '#FFFFFF',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    this.tweens.add({
      targets: starsLbl,
      alpha: 1,
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 },
      duration: 400,
      ease: 'Back.Out',
    })
    this.tweens.add({
      targets: mainLbl,
      alpha: 1,
      scaleX: { from: 0.4, to: 1 },
      scaleY: { from: 0.4, to: 1 },
      duration: 380,
      ease: 'Back.Out',
      delay: 100,
    })
    this.tweens.add({ targets: subLbl, alpha: 1, duration: 300, delay: 300 })

    const emojis = ['⭐', '🌟', '✨', '💫']
    for (let i = 0; i < 18; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-60, -10)
      const star = this.add
        .text(sx, sy, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(20, 40)}px`,
        })
        .setDepth(61)
      this.tweens.add({
        targets: star,
        y: Phaser.Math.Between(380, 680),
        x: sx + Phaser.Math.Between(-80, 80),
        alpha: { from: 1, to: 0.1 },
        angle: Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800),
        delay: Phaser.Math.Between(0, 500),
        onComplete: () => star.destroy(),
      })
    }

    this.time.delayedCall(1800, () => {
      ;[bg, starsLbl, mainLbl, subLbl].forEach((o) => o.destroy())
      this.scene.restart({
        level: nextLevel,
        points: this.currentPoints,
        lives: this.currentLives,
      })
    })
  }

  private showFinalCompleteScreen() {
    this.playRoundComplete()

    this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.78).setDepth(60)

    const starsLbl = this.add
      .text(640, 195, '⭐  ⭐  ⭐', { fontSize: '72px' })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)
    const mainLbl = this.add
      .text(640, 305, 'PARABÉNS! 🏆', {
        fontSize: '72px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)
    const subLbl = this.add
      .text(640, 400, 'Você completou todos os níveis!', {
        fontSize: '30px',
        color: '#FFFFFF',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    this.tweens.add({
      targets: starsLbl,
      alpha: 1,
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 },
      duration: 450,
      ease: 'Back.Out',
    })
    this.tweens.add({
      targets: mainLbl,
      alpha: 1,
      scaleX: { from: 0.4, to: 1 },
      scaleY: { from: 0.4, to: 1 },
      duration: 380,
      ease: 'Back.Out',
      delay: 150,
    })
    this.tweens.add({ targets: subLbl, alpha: 1, duration: 300, delay: 400 })

    this.time.delayedCall(700, () => {
      if (!starsLbl.active) return
      this.tweens.add({
        targets: starsLbl,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.easeInOut',
      })
    })

    const emojis = ['⭐', '🌟', '✨', '💫', '🎉', '🎊']
    for (let i = 0; i < 28; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-80, -10)
      const star = this.add
        .text(sx, sy, emojis[i % emojis.length], {
          fontSize: `${Phaser.Math.Between(22, 48)}px`,
        })
        .setDepth(61)
      this.tweens.add({
        targets: star,
        y: Phaser.Math.Between(400, 700),
        x: sx + Phaser.Math.Between(-100, 100),
        alpha: { from: 1, to: 0.05 },
        angle: Phaser.Math.Between(-60, 60),
        duration: Phaser.Math.Between(1000, 2200),
        delay: Phaser.Math.Between(0, 800),
        onComplete: () => star.destroy(),
      })
    }
  }

  // ── Background & Visuals ────────────────────────────────────────────────────

  private createBackground() {
    // Sky — two-tone gradient feel
    this.add.rectangle(640, 200, 1280, 400, 0x64B5F6)
    this.add.rectangle(640, 400, 1280, 200, 0x90CAF9)

    // Ground
    this.add.rectangle(640, 600, 1280, 240, 0x388E3C)

    // Grass edge bumps
    const grassGfx = this.add.graphics()
    grassGfx.fillStyle(0x66BB6A, 1)
    for (let x = 0; x < 1280; x += 72) {
      grassGfx.fillEllipse(x + 36, 486, 88, 22)
    }
    grassGfx.fillStyle(0x81C784, 0.55)
    for (let x = 36; x < 1280; x += 72) {
      grassGfx.fillEllipse(x + 18, 490, 52, 14)
    }

    // Cartoon sun with smiley face
    const sunX = 1160
    const sunY = 78
    const sunGfx = this.add.graphics()

    // Rays
    sunGfx.lineStyle(7, 0xFFE57F, 1)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      sunGfx.lineBetween(
        sunX + Math.cos(a) * 62, sunY + Math.sin(a) * 62,
        sunX + Math.cos(a) * 86, sunY + Math.sin(a) * 86,
      )
    }
    // Sun body
    sunGfx.fillStyle(0xFFD700, 1)
    sunGfx.fillCircle(sunX, sunY, 52)
    sunGfx.fillStyle(0xFFEC6E, 0.55)
    sunGfx.fillCircle(sunX - 14, sunY - 14, 22)
    // Eyes
    sunGfx.fillStyle(0x5D4037, 1)
    sunGfx.fillCircle(sunX - 16, sunY - 8, 6)
    sunGfx.fillCircle(sunX + 16, sunY - 8, 6)
    // Eye shine
    sunGfx.fillStyle(0xFFFFFF, 0.8)
    sunGfx.fillCircle(sunX - 14, sunY - 10, 2)
    sunGfx.fillCircle(sunX + 18, sunY - 10, 2)
    // Smile arc (dots)
    for (let i = 0; i <= 5; i++) {
      const a = Math.PI * 0.15 + (i / 5) * Math.PI * 0.7
      sunGfx.fillStyle(0x5D4037, 1)
      sunGfx.fillCircle(sunX + Math.cos(a) * 22, sunY + 12 + Math.sin(a) * 8, 3)
    }
    // Cheeks
    sunGfx.fillStyle(0xFF8A65, 0.45)
    sunGfx.fillCircle(sunX - 30, sunY + 8, 10)
    sunGfx.fillCircle(sunX + 30, sunY + 8, 10)

    // Decorative flowers on grass
    const flowerColors = [0xFF8F00, 0xE91E63, 0x9C27B0, 0xF44336, 0xFF5722, 0xFDD835]
    for (let i = 0; i < 9; i++) {
      const fx = 72 + i * 132 + Phaser.Math.Between(-12, 12)
      const fy = 511 + Phaser.Math.Between(-4, 8)
      const color = flowerColors[i % flowerColors.length]
      const flGfx = this.add.graphics()
      // Petals
      flGfx.fillStyle(color, 1)
      for (let p = 0; p < 5; p++) {
        const pa = (p / 5) * Math.PI * 2
        flGfx.fillEllipse(fx + Math.cos(pa) * 10, fy + Math.sin(pa) * 10, 13, 17)
      }
      // Center
      flGfx.fillStyle(0xFFF176, 1)
      flGfx.fillCircle(fx, fy, 7)
      flGfx.fillStyle(0xFFFFFF, 0.5)
      flGfx.fillCircle(fx - 2, fy - 2, 2)
      // Stem
      flGfx.lineStyle(3, 0x388E3C, 1)
      flGfx.lineBetween(fx, fy + 8, fx, fy + 26)
    }
  }

  private createClouds() {
    const positions = [
      { x: 130, y: 118 },
      { x: 390, y: 88 },
      { x: 660, y: 132 },
      { x: 940, y: 96 },
    ]

    positions.forEach((pos, i) => {
      const sc = 0.78 + (i % 2) * 0.26
      const gfx = this.add.graphics()

      // Shadow
      gfx.fillStyle(0xBBDEFB, 0.4)
      gfx.fillEllipse(4, 6, 128 * sc, 44 * sc)

      // Main cloud body — layered ellipses for fluffy look
      gfx.fillStyle(0xFFFFFF, 0.96)
      gfx.fillEllipse(0, 2, 134 * sc, 52 * sc)
      gfx.fillEllipse(-34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(-10 * sc, -12 * sc, 72 * sc, 50 * sc)
      gfx.fillEllipse(18 * sc, -14 * sc, 62 * sc, 44 * sc)

      // Inner highlight
      gfx.fillStyle(0xFFFFFF, 0.55)
      gfx.fillEllipse(-8 * sc, -6 * sc, 50 * sc, 28 * sc)

      gfx.setPosition(pos.x, pos.y)

      this.tweens.add({
        targets: gfx,
        x: pos.x + 26,
        duration: 5400 + i * 760,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })
  }

  private createItemTray() {
    const n = this.levelConfig.items.length
    const rows = n > 9 ? [ITEM_Y_ROW1, ITEM_Y_ROW2] : [ITEM_Y]

    for (const rowY of rows) {
      const trayY = rowY + 42
      const trayX = 28
      const trayW = 1224
      const trayH = 30
      const gfx = this.add.graphics()

      // Drop shadow
      gfx.fillStyle(0x000000, 0.2)
      gfx.fillRoundedRect(trayX + 4, trayY + 8, trayW, trayH, 8)

      // Main plank — dark warm wood
      gfx.fillStyle(0x795548, 1)
      gfx.fillRoundedRect(trayX, trayY, trayW, trayH, 7)

      // Highlight stripe across top (3D effect)
      gfx.fillStyle(0xA1887F, 1)
      gfx.fillRoundedRect(trayX, trayY, trayW, trayH * 0.40, { tl: 7, tr: 7, bl: 0, br: 0 })

      // Dark bottom edge
      gfx.fillStyle(0x4E342E, 1)
      gfx.fillRoundedRect(trayX, trayY + trayH * 0.72, trayW, trayH * 0.28, { tl: 0, tr: 0, bl: 7, br: 7 })

      // Nail rivets
      for (let x = 90; x < trayX + trayW - 30; x += 190) {
        gfx.fillStyle(0x6D4C41, 1)
        gfx.fillCircle(x, trayY + trayH / 2, 7)
        gfx.fillStyle(0xBCAAA4, 0.65)
        gfx.fillCircle(x - 2, trayY + trayH / 2 - 2, 3)
      }

      // Small leaf accents at each end
      gfx.fillStyle(0x66BB6A, 0.75)
      gfx.fillEllipse(trayX + 22, trayY + trayH + 10, 30, 13)
      gfx.fillEllipse(trayX + trayW - 22, trayY + trayH + 10, 30, 13)
    }
  }

  private createBases() {
    this.bases = []
    for (const baseData of this.levelConfig.bases) {
      this.bases.push(this.createBase(baseData))
    }
  }

  private createBase(baseData: ClassifierBase): Phaser.GameObjects.Container {
    const w        = 240
    const h        = 120
    const bColor   = this.getBaseColor(baseData)
    const bLight   = this.lightenColor(bColor, 0.32)
    const bDark    = this.darkenColor(bColor, 0.58)
    const rimH     = 16   // top rim "3D depth" strip
    const soilH    = 22   // dark soil strip
    const panelW   = w - 14
    const panelH   = 58
    const panelY   = 27   // center of cream panel (relative to container center y=0)

    // ── Layer A: box body ───────────────────────────────────────────────────
    const boxGfx = this.add.graphics()

    // 1. Drop shadow
    boxGfx.fillStyle(0x000000, 0.30)
    boxGfx.fillRoundedRect(-w / 2 + 7, -h / 2 + 9, w, h - 6, 12)

    // 2. Bottom depth face (darker variant, offset down for 3D)
    boxGfx.fillStyle(bDark, 1)
    boxGfx.fillRoundedRect(-w / 2, -h / 2 + rimH, w, h - rimH - 4, 10)

    // 3. Main front face (base color)
    boxGfx.fillStyle(bColor, 1)
    boxGfx.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 12)

    // 4. Top rim highlight (lighter — the "top surface" of the rim)
    boxGfx.fillStyle(bLight, 1)
    boxGfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, rimH - 5, { tl: 10, tr: 10, bl: 0, br: 0 })

    // 5. Dark soil in the inner opening
    const innerW = w - 22
    boxGfx.fillStyle(0x1E0E00, 1)
    boxGfx.fillRoundedRect(-innerW / 2, -h / 2 + rimH, innerW, soilH + 2, 4)

    // 6. Soil texture dots (moist earth look)
    boxGfx.fillStyle(0x5C3A1E, 0.65)
    for (let dx = -innerW / 2 + 12; dx < innerW / 2 - 6; dx += 17) {
      boxGfx.fillCircle(dx, -h / 2 + rimH + soilH / 2 + 1, 2)
    }

    // 7. Inner side walls (subtle shadows on left/right of opening)
    boxGfx.fillStyle(0x000000, 0.14)
    boxGfx.fillRect(-innerW / 2, -h / 2 + rimH, 5, soilH + 2)
    boxGfx.fillRect(innerW / 2 - 5, -h / 2 + rimH, 5, soilH + 2)

    // 8. Outer border
    boxGfx.lineStyle(3, bDark, 1)
    boxGfx.strokeRoundedRect(-w / 2, -h / 2, w, h - 8, 12)

    // ── Layer B: cream label panel ──────────────────────────────────────────
    // Panel drop shadow
    boxGfx.fillStyle(0x000000, 0.16)
    boxGfx.fillRoundedRect(-panelW / 2 + 2, panelY - panelH / 2 + 3, panelW, panelH, 10)
    // Panel cream body
    boxGfx.fillStyle(0xFFF8DC, 1)
    boxGfx.fillRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)
    // Panel inner gloss
    boxGfx.fillStyle(0xFFFFFF, 0.52)
    boxGfx.fillRoundedRect(-panelW / 2 + 4, panelY - panelH / 2 + 4, panelW - 8, panelH * 0.38, { tl: 7, tr: 7, bl: 0, br: 0 })
    // Panel border (slightly colored)
    boxGfx.lineStyle(2, bDark, 0.45)
    boxGfx.strokeRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)

    // ── children[1]: flashRect — gold overlay on correct drop ───────────────
    const flashRect = this.add.rectangle(0, 0, w, h, 0xFFD700)
    flashRect.setAlpha(0)

    // ── children[2]: flower (color levels) or shape icon (shape levels) ─────
    const flX = -panelW / 2 + 30
    const flY = panelY - 1
    const isColorRule = baseData.rule.attribute === 'cor'

    let iconChild: Phaser.GameObjects.GameObject
    if (isColorRule) {
      const flowerGfx = this.add.graphics()
      this.drawFlower(flowerGfx, flX, flY, bColor, bDark)
      iconChild = flowerGfx
    } else {
      iconChild = this.add
        .text(flX, flY, this.getAttributeIcon(baseData.rule.attribute, baseData.rule.value), {
          fontSize: '28px',
        })
        .setOrigin(0.5)
    }

    // ── children[3]: color/shape name label ─────────────────────────────────
    const label = this.add
      .text(flX + 28, panelY + 1, baseData.labelKey, {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: '#3E2723',
      })
      .setOrigin(0, 0.5)

    // ── children[4]: animated drop arrow ────────────────────────────────────
    const arrow = this.add
      .text(0, h / 2 + 12, '▼', { fontSize: '15px', color: '#8D6E63' })
      .setOrigin(0.5)

    this.tweens.add({
      targets: arrow,
      y: h / 2 + 18,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // ── children[5]: drop zone ──────────────────────────────────────────────
    const zone = this.add.zone(0, 0, w, h)
    zone.setRectangleDropZone(w, h)

    // ── children[6]: leaf clusters on both sides ─────────────────────────
    const leafGfx = this.add.graphics()
    this.drawLeafCluster(leafGfx, -w / 2 - 2, h / 2 - 10, false)
    this.drawLeafCluster(leafGfx, w / 2 + 2, h / 2 - 10, true)

    const container = this.add.container(baseData.x, baseData.y, [
      boxGfx, flashRect, iconChild, label, arrow, zone, leafGfx,
    ])
    container.setData('baseData', baseData)
    return container
  }

  // ── Asset drawing helpers ────────────────────────────────────────────────

  private drawFlower(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    petalColor: number,
    darkColor: number,
  ) {
    // Stem
    gfx.lineStyle(3, 0x2E7D32, 1)
    gfx.lineBetween(x, y + 8, x, y + 20)

    // Small stem leaves
    gfx.fillStyle(0x4CAF50, 1)
    gfx.fillEllipse(x - 7, y + 14, 12, 7)
    gfx.fillEllipse(x + 7, y + 15, 11, 6)

    // 5 petals arranged around center
    gfx.fillStyle(petalColor, 1)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      gfx.fillEllipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 12, 15)
    }

    // Petal outline for definition
    gfx.lineStyle(1.2, darkColor, 0.55)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      gfx.strokeEllipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 12, 15)
    }

    // Yellow center disc
    gfx.fillStyle(0xFFD700, 1)
    gfx.fillCircle(x, y, 7)

    // Center shading
    gfx.fillStyle(0xFFA000, 0.65)
    gfx.fillCircle(x + 1, y - 1, 3.5)

    // Center seed dots
    gfx.fillStyle(0xE65100, 0.5)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      gfx.fillCircle(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 1.5)
    }
  }

  private drawLeafCluster(
    gfx: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    rightSide: boolean,
  ) {
    const d = rightSide ? -1 : 1

    // Main leaf bodies
    gfx.fillStyle(0x4CAF50, 1)
    gfx.fillEllipse(x + d * 11, y - 7, 28, 14)
    gfx.fillEllipse(x + d * 17, y + 4, 22, 12)
    gfx.fillEllipse(x + d * 4, y + 6, 18, 10)

    // Darker leaf shading/outline
    gfx.lineStyle(1.5, 0x2E7D32, 0.7)
    gfx.strokeEllipse(x + d * 11, y - 7, 28, 14)
    gfx.strokeEllipse(x + d * 17, y + 4, 22, 12)
    gfx.strokeEllipse(x + d * 4, y + 6, 18, 10)

    // Vein lines
    gfx.lineStyle(1, 0x1B5E20, 0.55)
    gfx.lineBetween(x + d * 2, y - 7, x + d * 20, y - 7)
    gfx.lineBetween(x + d * 7, y + 4, x + d * 26, y + 4)
  }

  // ── Color helpers ────────────────────────────────────────────────────────

  private lightenColor(hex: number, amount: number): number {
    const r = (hex >> 16) & 0xFF
    const g = (hex >> 8) & 0xFF
    const b = hex & 0xFF
    return (
      (Math.min(255, Math.round(r + (255 - r) * amount)) << 16) |
      (Math.min(255, Math.round(g + (255 - g) * amount)) << 8) |
      Math.min(255, Math.round(b + (255 - b) * amount))
    )
  }

  private darkenColor(hex: number, factor: number): number {
    return (
      (Math.round(((hex >> 16) & 0xFF) * factor) << 16) |
      (Math.round(((hex >> 8) & 0xFF) * factor) << 8) |
      Math.round((hex & 0xFF) * factor)
    )
  }

  private createItems() {
    this.itemSprites = []
    const items = Phaser.Utils.Array.Shuffle([...this.levelConfig.items])
    const n = items.length

    if (n > 9) {
      const mid = Math.ceil(n / 2)
      this.createItemRow(items.slice(0, mid), ITEM_Y_ROW1)
      this.createItemRow(items.slice(mid), ITEM_Y_ROW2)
    } else {
      this.createItemRow(items, ITEM_Y)
    }
  }

  private createItemRow(items: typeof this.levelConfig.items, rowY: number) {
    const n = items.length
    const gap = Math.min(130, Math.floor(1100 / Math.max(1, n - 1)))
    const startX = 640 - ((n - 1) * gap) / 2
    const displayScale = Math.min(1.0, (gap - 10) / 120)

    items.forEach((item, i) => {
      const x = startX + i * gap
      const key = this.levelConfig.level === 1
        ? `item-${item.color}-swatch-${item.size}`
        : `item-${item.color}-${item.shape}-${item.size}`

      const sprite = this.add.image(x, rowY, key) as DraggableItem
      sprite.setScale(displayScale)
      sprite.itemData = item
      sprite.originX_ = x
      sprite.originY_ = rowY
      sprite.setAlpha(0)
      sprite.setInteractive()
      this.input.setDraggable(sprite)
      this.itemSprites.push(sprite)
    })
  }

  private startTimer() {
    EventBus.emit('start-timer', {})
    const timeLimit = this.levelConfig.timeLimit ?? 90
    this.timerEvent = this.time.addEvent({
      delay: timeLimit * 1000,
      callback: this.onTimeUp,
      callbackScope: this,
    })
  }

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  private setupDrag() {
    this.input.on('dragstart', (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image) => {
      // Kill the idle floating tween so it doesn't fight the drag position
      this.tweens.killTweensOf(obj)
      obj.setDepth(10)
      this.tweens.add({ targets: obj, scaleX: 1.15, scaleY: 1.15, duration: 120 })
    })

    this.input.on(
      'drag',
      (_: Phaser.Input.Pointer, obj: Phaser.GameObjects.Image, dragX: number, dragY: number) => {
        obj.setPosition(dragX, dragY)
        obj.setAngle(7)
      },
    )

    this.input.on('dragend', (_: Phaser.Input.Pointer, obj: DraggableItem, dropped: boolean) => {
      obj.setDepth(0).setAngle(0)
      this.tweens.add({ targets: obj, scaleX: 1, scaleY: 1, duration: 120 })

      if (!dropped) {
        const hitBase = this.findBaseAtPosition(obj.x, obj.y)
        if (hitBase) {
          const baseData = hitBase.getData('baseData') as ClassifierBase
          this.validateDrop(obj, hitBase, baseData)
        } else {
          this.returnItem(obj)
        }
      }
    })

    this.input.on(
      'drop',
      (_: Phaser.Input.Pointer, obj: DraggableItem, zone: Phaser.GameObjects.Zone) => {
        const container = zone.parentContainer
        if (!container) {
          this.returnItem(obj)
          return
        }

        const baseData = container.getData('baseData') as ClassifierBase
        this.validateDrop(obj, container, baseData)
      },
    )
  }

  private findBaseAtPosition(x: number, y: number): Phaser.GameObjects.Container | null {
    const HW = 120   // half of w=240
    const HH = 59    // half of h=118

    for (const container of this.bases) {
      if (
        x >= container.x - HW &&
        x <= container.x + HW &&
        y >= container.y - HH &&
        y <= container.y + HH
      ) {
        return container
      }
    }
    return null
  }

  private validateDrop(
    item: DraggableItem,
    baseContainer: Phaser.GameObjects.Container,
    base: ClassifierBase,
  ) {
    if (this.gameEnded) return

    const attrValue = this.getItemAttrValue(item.itemData, base.rule.attribute)
    const correct = attrValue === base.rule.value

    if (correct) {
      this.hits += 1
      this.currentPoints += 5

      runtimeGameBridge.emit({
        type: 'CORRECT_ANSWER',
        gameId: GAME_ID,
        pointsEarned: 5,
        stage: this.levelConfig.level,
      })

      this.onCorrectDrop(item, baseContainer)
      return
    }

    // Erro — deduz ponto e vida
    this.errors += 1
    this.currentPoints = Math.max(0, this.currentPoints - 5)
    this.currentLives = Math.max(0, this.currentLives - 1)

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: -5,
      stage: this.levelConfig.level,
    })

    this.onWrongDrop(item, baseContainer)

    // Se ficou sem vidas, emite GAME_OVER e congela a cena (React exibe modal bloqueante)
    if (this.currentLives <= 0) {
      runtimeGameBridge.emit({
        type: 'GAME_OVER',
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      })
      this.gameEnded = true
      this.input.enabled = false
      this.timerEvent?.destroy()
    }
  }

  private onCorrectDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    item.setVisible(false)
    item.disableInteractive()

    // list[1] is the flashRect — gold overlay flash
    const flashRect = baseContainer.list[1] as Phaser.GameObjects.Rectangle
    flashRect.setFillStyle(0xFFD700).setAlpha(0.5)
    this.tweens.add({
      targets: flashRect,
      alpha: 0,
      duration: 500,
      ease: 'Power2.Out',
    })

    this.tweens.add({
      targets: baseContainer,
      scaleX: { from: 1, to: 1.12 },
      scaleY: { from: 1, to: 1.12 },
      yoyo: true,
      duration: 140,
    })

    this.playCorrect()
    this.showCorrectEffect(item.originX_, item.originY_)
    this.emitProgress()
    this.checkRoundComplete()
  }

  private onWrongDrop(item: DraggableItem, baseContainer: Phaser.GameObjects.Container) {
    this.playWrong()
    this.returnItem(item)

    const origX = (baseContainer.getData('baseData') as ClassifierBase).x

    this.tweens.add({
      targets: baseContainer,
      x: { from: origX - 10, to: origX + 10 },
      yoyo: true,
      duration: 55,
      repeat: 4,
      onComplete: () => baseContainer.setX(origX),
    })

    const xText = this.add
      .text(item.x, item.y - 20, '✖', {
        fontSize: '36px',
        color: '#E74C3C',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: xText,
      y: item.y - 70,
      alpha: { from: 1, to: 0 },
      duration: 600,
      onComplete: () => xText.destroy(),
    })

    this.emitProgress()
  }

  private returnItem(item: DraggableItem) {
    this.tweens.add({
      targets: item,
      x: item.originX_,
      y: item.originY_,
      scaleX: 1,
      scaleY: 1,
      angle: 0,
      ease: 'Back.Out',
      duration: 380,
      onComplete: () => {
        if (!item.active || !item.visible) return
        this.tweens.add({
          targets: item,
          y: item.originY_ - 6,
          duration: 1100 + Math.random() * 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Math.random() * 400,
        })
      },
    })
  }

  private showCorrectEffect(x: number, y: number) {
    const emojis = ['⭐', '✨', '🌟', '🌸', '💛', '🍀']

    // Radial emoji burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const dist = 60 + Math.random() * 55
      const star = this.add
        .text(x, y, emojis[i % emojis.length], {
          fontSize: `${20 + Math.floor(Math.random() * 16)}px`,
        })
        .setOrigin(0.5)
        .setDepth(20)

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1.2, to: 0.1 },
        scaleY: { from: 1.2, to: 0.1 },
        duration: 580 + Math.random() * 280,
        ease: 'Power2',
        onComplete: () => star.destroy(),
      })
    }

    // Expanding ring burst
    const ringGfx = this.add.graphics().setDepth(19)
    ringGfx.lineStyle(4, 0xFFD700, 1)
    ringGfx.strokeCircle(x, y, 8)
    this.tweens.add({
      targets: ringGfx,
      scaleX: 4,
      scaleY: 4,
      alpha: { from: 1, to: 0 },
      duration: 380,
      ease: 'Power2.Out',
      onComplete: () => ringGfx.destroy(),
    })

    // Checkmark that floats up
    const check = this.add
      .text(x, y - 10, '✅', { fontSize: '46px' })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: check,
      y: y - 80,
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 720,
      ease: 'Power2.easeOut',
      onComplete: () => check.destroy(),
    })
  }

  private checkRoundComplete() {
    const remaining = this.itemSprites.filter((s) => s.visible).length

    if (remaining === 0) {
      runtimeGameBridge.emit({
        type: 'GAME_COMPLETED',
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      })

      this.endRound()
    }
  }

  private endRound() {
    this.gameEnded = true
    this.input.enabled = false
    this.timerEvent?.destroy()

    const result: RoundResult = {
      gameCode: 'EF01CO01',
      level: this.levelConfig.level,
      criterion: this.levelConfig.criterion,
      hits: this.hits,
      errors: this.errors,
      durationMs: Date.now() - this.startTime,
      timestamp: Date.now(),
    }

    this.time.delayedCall(1800, () => {
      EventBus.emit('round-complete', result)
    })

    if (this.levelConfig.level < 3) {
      const nextLevel = (this.levelConfig.level + 1) as 1 | 2 | 3
      this.showLevelCompleteScreen(nextLevel)
    } else {
      this.showFinalCompleteScreen()
    }
  }

  private onTimeUp() {
    this.gameEnded = true
    this.input.enabled = false
    this.timerEvent?.destroy()
    this.playTimeUp()
    this.errors += 1
    this.currentPoints = Math.max(0, this.currentPoints - 5)
    runtimeGameBridge.emit({
      type: 'GAME_OVER',
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    })
  }

  private revealItems() {
    this.itemSprites.forEach((sprite, i) => {
      this.tweens.add({
        targets: sprite,
        alpha: 1,
        scaleX: { from: 0.4, to: 1 },
        scaleY: { from: 0.4, to: 1 },
        y: { from: sprite.originY_ + 30, to: sprite.originY_ },
        delay: i * 85,
        duration: 320,
        ease: 'Back.Out',
        onComplete: () => {
          if (!sprite.active) return
          // Gentle floating idle — offset per item to avoid lockstep
          this.tweens.add({
            targets: sprite,
            y: sprite.originY_ - 6,
            duration: 1100 + Math.random() * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Math.random() * 700,
          })
        },
      })
    })
  }

  private emitProgress() {
    const total = this.itemSprites.length
    const remaining = this.itemSprites.filter((s) => s.visible).length
    const answered = total - remaining
    const pct = total > 0 ? answered / total : 0

    EventBus.emit('update-progress', {
      pct,
      hits: this.hits,
      errors: this.errors,
    })

    this.emitCheckpoint()
  }

  private emitCheckpoint() {
    const total = this.itemSprites.length
    const remaining = this.itemSprites.filter((s) => s.visible).length
    const answered = total - remaining
    const progress = total > 0 ? Math.round((answered / total) * 100) : 0

    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress,
      score: this.currentPoints,
      stage: this.levelConfig.level,
      hits: this.hits,
      errors: this.errors,
    })
  }

  private registerPlatformCommands() {
    this.unsubscribePlatformCommands = runtimeGameBridge.onCommand(
      (command: PlatformCommand) => {
        switch (command.type) {
          case 'START_GAME': {
            if (command.gameId !== GAME_ID) return

            const shouldRestart = command.stage !== this.levelConfig.level

            if (shouldRestart) {
              this.scene.restart({
                level: command.stage as 1 | 2 | 3,
                points: command.points,
                lives: command.lives,
              })
            } else {
              this.currentPoints = command.points
              this.currentLives = command.lives
            }

            return
          }

          case 'PAUSE_GAME': {
            if (!this.scene.isPaused()) {
              this.scene.pause()
            }
            return
          }

          case 'RESUME_GAME': {
            if (this.scene.isPaused()) {
              this.scene.resume()
            }
            return
          }

          case 'UNLOCK_GAME': {
            if (command.gameId !== GAME_ID) return
            return
          }
        }
      },
    )
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  private getItemAttrValue(item: GameItem, attribute: string): string {
    if (attribute === 'cor') return item.color
    if (attribute === 'forma') return item.shape
    if (attribute === 'tamanho') return item.size
    return ''
  }

  private getBaseColor(baseData: ClassifierBase): number {
    const { attribute, value } = baseData.rule

    if (attribute === 'cor') {
      const map: Record<string, number> = {
        vermelho: 0xe53935,
        azul:     0x1e88e5,
        verde:    0x43a047,
        amarelo:  0xfdd835,
        roxo:     0x8e24aa,
      }
      return map[value] ?? 0x9e9e9e
    }

    if (attribute === 'forma') {
      const map: Record<string, number> = {
        circulo:   0xab47bc,
        quadrado:  0xff7043,
        triangulo: 0x26c6da,
        retangulo: 0x8bc34a,
      }
      return map[value] ?? 0x9e9e9e
    }

    return 0xffb300
  }

  // ── Áudio sintético (Web Audio API) ─────────────────────────────────────────

  private getAudioContext(): AudioContext | null {
    if (!('context' in this.sound)) return null
    return (this.sound as Phaser.Sound.WebAudioSoundManager).context
  }

  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.25,
    delaySeconds = 0,
  ) {
    if (this.isMuted) return
    const ctx = this.getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delaySeconds)
    gain.gain.setValueAtTime(volume, ctx.currentTime + delaySeconds)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delaySeconds + duration)

    osc.start(ctx.currentTime + delaySeconds)
    osc.stop(ctx.currentTime + delaySeconds + duration + 0.01)
  }

  private playCorrect() {
    this.playTone(523, 0.12, 'sine', 0.28, 0.00)  // C5
    this.playTone(659, 0.12, 'sine', 0.28, 0.10)  // E5
    this.playTone(784, 0.20, 'sine', 0.32, 0.20)  // G5
  }

  private playWrong() {
    this.playTone(220, 0.10, 'square', 0.18, 0.00)
    this.playTone(196, 0.10, 'square', 0.14, 0.10)
    this.playTone(165, 0.18, 'square', 0.10, 0.20)
  }

  private playRoundComplete() {
    const notes = [262, 330, 392, 523]  // C4-E4-G4-C5
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.20, 'sine', 0.30, i * 0.13)
    })
  }

  private playTimeUp() {
    this.playTone(392, 0.15, 'sine', 0.24, 0.00)  // G4
    this.playTone(349, 0.15, 'sine', 0.20, 0.18)  // F4
    this.playTone(294, 0.30, 'sine', 0.18, 0.36)  // D4
  }

  private playGo() {
    this.playTone(784, 0.10, 'sine', 0.28, 0.00)  // G5
    this.playTone(1046, 0.20, 'sine', 0.32, 0.10) // C6
  }

  private playTimerWarning() {
    this.playTone(440, 0.07, 'sine', 0.12)  // A4 — beep sutil
  }

  // ─────────────────────────────────────────────────────────────────────────────

  private getAttributeIcon(attribute: string, value: string): string {
    if (attribute === 'cor') {
      const map: Record<string, string> = {
        vermelho: '🔴',
        azul: '🔵',
        verde: '🟢',
        amarelo: '🟡',
        roxo: '🟣',
      }
      return map[value] ?? '⬜'
    }

    if (attribute === 'forma') {
      const map: Record<string, string> = {
        circulo: '⭕',
        quadrado: '⬛',
        triangulo: '🔺',
        retangulo: '▬',
      }
      return map[value] ?? '?'
    }

    if (attribute === 'tamanho') {
      const map: Record<string, string> = {
        pequeno: '🔹',
        medio: '🔷',
        grande: '💠',
      }
      return map[value] ?? '?'
    }

    return '?'
  }
}
