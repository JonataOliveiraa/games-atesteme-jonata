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

const ITEM_Y = 270       // linha única (n ≤ 9)
const ITEM_Y_ROW1 = 205  // primeira linha (n > 9)
const ITEM_Y_ROW2 = 320  // segunda linha  (n > 9)
const TIMER_BAR_Y = 100
const TIMER_BAR_W = 900
const GAME_ID = 'base-dos-classificadores'

const RULE_MAP: Record<string, string> = {
  cor: 'Separe por COR!',
  forma: 'Separe por FORMA!',
  tamanho: 'Separe por TAMANHO!',
}
const ICON_MAP: Record<string, string> = {
  cor: '🎨',
  forma: '🔷',
  tamanho: '📏',
}

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
  private timerBar?: Phaser.GameObjects.Rectangle
  private timerBarBg?: Phaser.GameObjects.Rectangle

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
    this.createBackground()
    this.createClouds()
    this.createItemTray()
    this.createBases()
    this.createItems()
    this.setupDrag()
    this.registerPlatformCommands()

    if (this.levelConfig.timeLimit) {
      this.createTimerBar()
    }

    EventBus.on('set-level', this.handleSetLevel, this)
    EventBus.on('mute-audio', this.handleMuteAudio, this)
    this.showStartScreen()
  }

  update() {
    if (this.timerEvent && this.timerBar && this.timerBarBg) {
      const remaining = this.timerEvent.getRemaining()
      const total = (this.levelConfig.timeLimit ?? 90) * 1000
      const pct = Math.max(0, remaining / total)

      this.timerBar.setSize(TIMER_BAR_W * pct, 22)

      if (pct > 0.5) this.timerBar.setFillStyle(0x2ecc71)
      else if (pct > 0.25) this.timerBar.setFillStyle(0xf39c12)
      else this.timerBar.setFillStyle(0xe74c3c)

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

  private showStartScreen() {
    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.78)
      .setDepth(60)
      .setInteractive()

    const starsStr =
      '★'.repeat(this.levelConfig.level) + '☆'.repeat(3 - this.levelConfig.level)
    const starsLbl = this.add
      .text(640, 155, starsStr, { fontSize: '48px', color: '#FFD700' })
      .setOrigin(0.5)
      .setDepth(61)

    const lvlLbl = this.add
      .text(640, 235, `NÍVEL ${this.levelConfig.level}`, {
        fontSize: '72px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(61)

    const ruleLbl = this.add
      .text(
        640,
        325,
        `${ICON_MAP[this.levelConfig.criterion] ?? ''}  ${RULE_MAP[this.levelConfig.criterion] ?? ''}`,
        {
          fontSize: '34px',
          fontFamily: 'Arial, sans-serif',
          color: '#FFF9C4',
          stroke: '#000000',
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5)
      .setDepth(61)

    const nItems = this.levelConfig.items.length
    const timerInfo = this.levelConfig.timeLimit
      ? `⏱ ${this.levelConfig.timeLimit}s`
      : 'Sem limite de tempo'
    const detailsLbl = this.add
      .text(640, 400, `${nItems} itens  •  ${timerInfo}`, {
        fontSize: '24px',
        color: '#B0BEC5',
      })
      .setOrigin(0.5)
      .setDepth(61)

    const btnBg = this.add
      .rectangle(640, 498, 270, 72, 0x2ecc71)
      .setStrokeStyle(3, 0x27ae60)
      .setDepth(61)
      .setInteractive({ useHandCursor: true })
    const btnText = this.add
      .text(640, 498, '▶  Iniciar', {
        fontSize: '30px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(62)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x27ae60))
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x2ecc71))
    btnBg.on('pointerdown', () => {
      ;[bg, starsLbl, lvlLbl, ruleLbl, detailsLbl, btnBg, btnText].forEach((o) => o.destroy())
      this.emitCheckpoint()
      runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
      EventBus.emit('scene-ready', { levelConfig: this.levelConfig })
      this.revealItems()
      this.playGo()
      if (this.levelConfig.timeLimit) this.startTimer()
    })
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
      this.showNextLevelScreen(nextLevel)
    })
  }

  private showNextLevelScreen(nextLevel: 1 | 2 | 3) {
    this.input.enabled = true

    const nextConfig = LEVELS.find((l) => l.level === nextLevel) ?? LEVELS[0]

    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.78)
      .setDepth(62)
      .setInteractive()

    const starsStr = '★'.repeat(nextLevel) + '☆'.repeat(3 - nextLevel)
    const starsLbl = this.add
      .text(640, 155, starsStr, { fontSize: '48px', color: '#FFD700' })
      .setOrigin(0.5)
      .setDepth(63)

    const titleLbl = this.add
      .text(640, 238, `PRÓXIMO: NÍVEL ${nextLevel}`, {
        fontSize: '52px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(63)

    const ruleLbl = this.add
      .text(
        640,
        320,
        `${ICON_MAP[nextConfig.criterion] ?? ''}  ${RULE_MAP[nextConfig.criterion] ?? ''}`,
        {
          fontSize: '30px',
          color: '#FFF9C4',
          stroke: '#000',
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5)
      .setDepth(63)

    const timerInfo = nextConfig.timeLimit
      ? `⏱ ${nextConfig.timeLimit}s`
      : 'Sem limite de tempo'
    const detailsLbl = this.add
      .text(640, 385, `${nextConfig.items.length} itens  •  ${timerInfo}`, {
        fontSize: '24px',
        color: '#B0BEC5',
      })
      .setOrigin(0.5)
      .setDepth(63)

    const btnBg = this.add
      .rectangle(640, 480, 270, 72, 0x3498db)
      .setStrokeStyle(3, 0x2980b9)
      .setDepth(63)
      .setInteractive({ useHandCursor: true })
    const btnText = this.add
      .text(640, 480, '▶  Avançar', {
        fontSize: '30px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(64)

    btnBg.on('pointerover', () => btnBg.setFillStyle(0x2980b9))
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x3498db))
    btnBg.on('pointerdown', () => {
      this.scene.restart({
        level: nextLevel,
        points: this.currentPoints,
        lives: this.currentLives,
      })
    })

    const objs = [bg, starsLbl, titleLbl, ruleLbl, detailsLbl, btnBg, btnText]
    objs.forEach((o) => (o as { setAlpha: (n: number) => void }).setAlpha(0))
    this.tweens.add({ targets: objs, alpha: 1, duration: 320 })
  }

  private showGameOverScreen() {
    this.input.enabled = true

    const bg = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.82)
      .setDepth(60)
      .setInteractive()

    const mainLbl = this.add
      .text(640, 210, 'GAME OVER', {
        fontSize: '84px',
        fontFamily: 'Arial Black, Arial',
        color: '#E74C3C',
        stroke: '#000000',
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    const causeLbl = this.add
      .text(640, 300, '⏰  Tempo esgotado!', {
        fontSize: '36px',
        color: '#FF6B35',
        stroke: '#000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    const statsLbl = this.add
      .text(
        640,
        368,
        `✅ ${this.hits} acerto${this.hits !== 1 ? 's' : ''}   ✖ ${this.errors} erro${this.errors !== 1 ? 's' : ''}`,
        { fontSize: '28px', color: '#FFFFFF', stroke: '#000', strokeThickness: 4 },
      )
      .setOrigin(0.5)
      .setDepth(61)
      .setAlpha(0)

    this.tweens.add({
      targets: mainLbl,
      alpha: 1,
      scaleX: { from: 0.4, to: 1 },
      scaleY: { from: 0.4, to: 1 },
      duration: 380,
      ease: 'Back.Out',
    })
    this.tweens.add({ targets: causeLbl, alpha: 1, duration: 300, delay: 200 })
    this.tweens.add({ targets: statsLbl, alpha: 1, duration: 300, delay: 350 })

    const retryBg = this.add
      .rectangle(510, 465, 260, 64, 0x2ecc71)
      .setStrokeStyle(3, 0x27ae60)
      .setDepth(61)
      .setInteractive({ useHandCursor: true })
    const retryLbl = this.add
      .text(510, 465, '↺  Tentar novamente', {
        fontSize: '19px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(62)

    const exitBg = this.add
      .rectangle(770, 465, 200, 64, 0x7f8c8d)
      .setStrokeStyle(3, 0x636e72)
      .setDepth(61)
      .setInteractive({ useHandCursor: true })
    const exitLbl = this.add
      .text(770, 465, '✕  Sair', {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
      })
      .setOrigin(0.5)
      .setDepth(62)

    retryBg.on('pointerover', () => retryBg.setFillStyle(0x27ae60))
    retryBg.on('pointerout', () => retryBg.setFillStyle(0x2ecc71))
    retryBg.on('pointerdown', () => {
      this.scene.restart({
        level: this.levelConfig.level,
        points: this.currentPoints,
        lives: this.currentLives,
      })
    })

    exitBg.on('pointerover', () => exitBg.setFillStyle(0x636e72))
    exitBg.on('pointerout', () => exitBg.setFillStyle(0x7f8c8d))
    exitBg.on('pointerdown', () => {
      EventBus.emit('exit-game')
    })

    const btns = [retryBg, retryLbl, exitBg, exitLbl]
    btns.forEach((o) => (o as { setAlpha: (n: number) => void }).setAlpha(0))
    this.tweens.add({ targets: btns, alpha: 1, duration: 300, delay: 500 })
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
    this.add.rectangle(640, 240, 1280, 480, 0x87ceeb)
    this.add.rectangle(640, 80, 1280, 160, 0xb3e5fc, 0.5)

    this.add.rectangle(640, 600, 1280, 240, 0x66bb6a)
    this.add.rectangle(640, 482, 1280, 8, 0x388e3c)

    this.add.circle(1180, 72, 48, 0xffd700)

    const sunGfx = this.add.graphics()
    sunGfx.lineStyle(5, 0xffd700, 0.8)

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      const r1 = 58
      const r2 = 78
      sunGfx.lineBetween(
        1180 + Math.cos(a) * r1,
        72 + Math.sin(a) * r1,
        1180 + Math.cos(a) * r2,
        72 + Math.sin(a) * r2,
      )
    }

    const flowerColors = [0xff8f00, 0xe91e63, 0x9c27b0, 0xf44336]

    for (let i = 0; i < 8; i++) {
      const x = 80 + i * 155 + Phaser.Math.Between(-20, 20)
      const y = 510 + Phaser.Math.Between(0, 20)
      const color = flowerColors[i % flowerColors.length]

      this.add.circle(x, y, 10, color)
      this.add.circle(x - 8, y, 7, color)
      this.add.circle(x + 8, y, 7, color)
      this.add.circle(x, y - 8, 7, color)
      this.add.circle(x, y + 8, 7, color)
      this.add.circle(x, y, 6, 0xffff88)
      this.add.rectangle(x, y + 20, 3, 18, 0x388e3c)
    }
  }

  private createClouds() {
    const positions = [
      { x: 130, y: 120 },
      { x: 380, y: 90 },
      { x: 660, y: 140 },
      { x: 950, y: 100 },
    ]

    positions.forEach((pos, i) => {
      const scale = 0.7 + (i % 2) * 0.3
      const gfx = this.add.graphics()
      gfx.fillStyle(0xffffff, 0.88)

      gfx.fillEllipse(0, 0, 120 * scale, 50 * scale)
      gfx.fillEllipse(-32 * scale, 6 * scale, 72 * scale, 44 * scale)
      gfx.fillEllipse(32 * scale, 6 * scale, 72 * scale, 44 * scale)

      gfx.setPosition(pos.x, pos.y)

      this.tweens.add({
        targets: gfx,
        x: pos.x + 22,
        duration: 5000 + i * 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    })
  }

  private createItemTray() {
    const n = this.levelConfig.items.length
    const rows = n > 9 ? [ITEM_Y_ROW1, ITEM_Y_ROW2] : [ITEM_Y]
    const gfx = this.add.graphics()

    for (const rowY of rows) {
      const trayY = rowY + 40

      gfx.fillStyle(0x000000, 0.15)
      gfx.fillRect(30, trayY + 6, 1220, 30)

      gfx.fillStyle(0xa0522d, 1)
      gfx.fillRect(30, trayY, 1220, 28)

      gfx.fillStyle(0xc4813a, 1)
      gfx.fillRect(30, trayY, 1220, 8)

      gfx.fillStyle(0x7b3f1a, 1)
      gfx.fillRect(30, trayY + 22, 1220, 6)

      gfx.fillStyle(0x8b6914, 1)
      for (let x = 80; x < 1220; x += 160) {
        gfx.fillCircle(x, trayY + 14, 6)
        gfx.fillStyle(0xd4af37, 0.6)
        gfx.fillCircle(x, trayY + 14, 4)
        gfx.fillStyle(0x8b6914, 1)
      }
    }
  }

  private createBases() {
    this.bases = []
    for (const baseData of this.levelConfig.bases) {
      this.bases.push(this.createBase(baseData))
    }
  }

  private createBase(baseData: ClassifierBase): Phaser.GameObjects.Container {
    const w = 210
    const h = 145
    const borderColor = this.getBaseColor(baseData)

    const shadow = this.add.rectangle(5, 5, w, h, 0x000000, 0.18)
    const panel = this.add.rectangle(0, 0, w, h, 0xffffff, 0.92)
    panel.setStrokeStyle(6, borderColor)

    const header = this.add.rectangle(0, -h / 2 + 22, w, 44, borderColor, 0.85)

    const icon = this.add
      .text(0, -h / 2 + 22, this.getAttributeIcon(baseData.rule.attribute, baseData.rule.value), {
        fontSize: '32px',
      })
      .setOrigin(0.5)

    const label = this.add
      .text(0, 22, baseData.labelKey, {
        fontSize: '22px',
        fontFamily: 'Arial Black, Arial',
        color: '#1A1A2E',
        stroke: '#FFFFFF',
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    const arrow = this.add
      .text(0, h / 2 - 16, '▼', {
        fontSize: '18px',
        color: '#888888',
      })
      .setOrigin(0.5)

    const zone = this.add.zone(0, 0, w, h)
    zone.setRectangleDropZone(w, h)

    const container = this.add.container(baseData.x, baseData.y, [
      shadow,
      panel,
      header,
      icon,
      label,
      arrow,
      zone,
    ])

    container.setData('baseData', baseData)
    return container
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
      const key = `item-${item.color}-${item.shape}-${item.size}`

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

  private createTimerBar() {
    this.timerBarBg = this.add
      .rectangle(640, TIMER_BAR_Y, TIMER_BAR_W + 8, 30, 0x263238, 0.5)
      .setStrokeStyle(2, 0x546e7a)
      .setDepth(5)
      .setAlpha(0)

    this.timerBar = this.add
      .rectangle(640 - TIMER_BAR_W / 2, TIMER_BAR_Y, 0, 22, 0x2ecc71)
      .setOrigin(0, 0.5)
      .setDepth(5)
      .setAlpha(0)
  }

  private startTimer() {
    if (!this.timerBar || !this.timerBarBg) return

    this.timerBarBg.setAlpha(1)
    this.timerBar.setAlpha(1).setSize(TIMER_BAR_W, 22)

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
    const HW = 118
    const HH = 82

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

    const panel = baseContainer.list[1] as Phaser.GameObjects.Rectangle
    const originalStroke = this.getBaseColor(
      baseContainer.getData('baseData') as ClassifierBase,
    )

    panel.setStrokeStyle(8, 0xffd700)

    this.time.delayedCall(500, () => {
      panel.setStrokeStyle(6, originalStroke)
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
    })
  }

  private showCorrectEffect(x: number, y: number) {
    const emojis = ['⭐', '✨', '🌟']

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2
      const dist = 55 + Math.random() * 45

      const star = this.add
        .text(x, y, emojis[i % emojis.length], {
          fontSize: `${18 + Math.floor(Math.random() * 14)}px`,
        })
        .setOrigin(0.5)
        .setDepth(20)

      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: { from: 1, to: 0 },
        scaleX: { from: 1, to: 0.2 },
        scaleY: { from: 1, to: 0.2 },
        duration: 550 + Math.random() * 250,
        ease: 'Power2',
        onComplete: () => star.destroy(),
      })
    }

    const check = this.add
      .text(x, y - 10, '✅', { fontSize: '42px' })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: check,
      y: y - 70,
      alpha: { from: 1, to: 0 },
      duration: 700,
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
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      pointsEarned: -5,
      stage: this.levelConfig.level,
    })

    this.showGameOverScreen()
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
        azul: 0x1e88e5,
        verde: 0x43a047,
        amarelo: 0xfdd835,
      }
      return map[value] ?? 0x9e9e9e
    }

    if (attribute === 'forma') {
      const map: Record<string, number> = {
        circulo: 0xab47bc,
        quadrado: 0xff7043,
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
