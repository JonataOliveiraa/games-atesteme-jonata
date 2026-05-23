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

const ITEM_Y = 295          // linha única (n ≤ 9)
const ITEM_Y_ROW1 = 180     // primeira linha (n > 9)
const ITEM_Y_ROW2 = 320     // segunda linha  (n > 9)
const ITEM_SCALE_MAX = 0.70 // escala máxima dos itens — diminua para figuras menores
const GAME_ID = 'base-dos-classificadores'

const DEV_START_LEVEL: 1 | 2 | 3 = 1  // ← mude para 2 ou 3 para testar; volte para 1 antes de publicar
const DEV_NO_TIMER    = false           // ← true = pula tela inicial e não inicia timer (ajuste visual)


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
    const lvl = (data?.level ?? DEV_START_LEVEL) as 1 | 2 | 3
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

    if (DEV_NO_TIMER) {
      this.revealItems()
    } else {
      this.showStartScreen()
    }
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
    if (this.textures.exists('bg-garden')) {
      this.add.image(640, 360, 'bg-garden').setDisplaySize(1280, 720).setDepth(0)
    } else {
      this.add.rectangle(640, 360, 1280, 720, 0x5BB8F5)
      const hillGfx = this.add.graphics()
      hillGfx.fillStyle(0x6DB46C, 1)
      hillGfx.fillEllipse(180, 506, 680, 200)
      hillGfx.fillEllipse(680, 492, 920, 195)
      hillGfx.fillEllipse(1160, 510, 660, 196)
      this.add.rectangle(640, 626, 1280, 228, 0x43A047)
    }

    // ── Sol (top-right) ───────────────────────────────────────────────────────
    const sunX = 1165
    const sunY = 90
    const sunSize = 200
    if (this.textures.exists('sun')) {
      // Máscara circular para cortar cantos brancos do fundo da imagem
      const maskGfx = this.make.graphics({ x: 0, y: 0 }, false)
      maskGfx.fillStyle(0xffffff)
      maskGfx.fillCircle(sunX, sunY, sunSize * 0.56)
      this.add.image(sunX, sunY, 'sun')
        .setDisplaySize(sunSize, sunSize)
        .setMask(maskGfx.createGeometryMask())
        .setDepth(1)
    } else {
      // Fallback programático
      const sunGfx = this.add.graphics().setDepth(1)
      sunGfx.fillStyle(0xFFE082, 0.28)
      sunGfx.fillCircle(sunX, sunY, 70)
      sunGfx.lineStyle(7, 0xFFE57F, 1)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        sunGfx.lineBetween(sunX + Math.cos(a) * 62, sunY + Math.sin(a) * 62,
          sunX + Math.cos(a) * 90, sunY + Math.sin(a) * 90)
      }
      sunGfx.fillStyle(0xFFD700, 1)
      sunGfx.fillCircle(sunX, sunY, 52)
    }
  }

  private createClouds() {
    // Nuvens incorporadas no bg-garden.png — sem nuvens programáticas quando imagem carregada
    if (this.textures.exists('bg-garden')) return

    const positions = [
      { x: 130, y: 118 },
      { x: 390, y: 88 },
      { x: 660, y: 132 },
      { x: 940, y: 96 },
    ]

    positions.forEach((pos, i) => {
      const sc = 0.78 + (i % 2) * 0.26
      const gfx = this.add.graphics()
      gfx.fillStyle(0xBBDEFB, 0.4)
      gfx.fillEllipse(4, 6, 128 * sc, 44 * sc)
      gfx.fillStyle(0xFFFFFF, 0.96)
      gfx.fillEllipse(0, 2, 134 * sc, 52 * sc)
      gfx.fillEllipse(-34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(34 * sc, 10 * sc, 82 * sc, 56 * sc)
      gfx.fillEllipse(-10 * sc, -12 * sc, 72 * sc, 50 * sc)
      gfx.fillEllipse(18 * sc, -14 * sc, 62 * sc, 44 * sc)
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
    const useImage = this.textures.exists('shelf-wood')

    // shelf-wood.png 1536×1024 — branco removido em BootScene.removeWhiteBackground()
    // Ajuste fino: SHELF_H controla a altura total; PLANK_FRAC é a % do topo até a tábua.
    // Se a tábua aparecer alta demais → aumentar PLANK_FRAC; baixa demais → diminuir.
    const SHELF_H     = 370    // altura total de exibição no canvas (px)
    const PLANK_FRAC  = 0.40   // fração da imagem até o topo da tábua (~22% de 1024px)

    // Y do topo da imagem para que a tábua fique logo abaixo dos itens
    const plankOffset = Math.round(SHELF_H * PLANK_FRAC)  // px do topo da img até a tábua

    for (const rowY of rows) {
      // items centrados em rowY; com ITEM_SCALE_MAX=0.70, item grande (120px) → bottom ≈ rowY+42
      // offset 36 → tábua em rowY+36, tocando o fundo dos itens médios/grandes
      const imgTopY = rowY + 30 - plankOffset

      if (useImage) {
        // Fundo já transparente — sem setCrop, sem blend mode especial
        this.add.image(640, imgTopY, 'shelf-wood')
          .setOrigin(0.5, 0)
          .setDisplaySize(1280, SHELF_H)
          .setDepth(2)
      } else {
        const trayY = rowY + 42
        // Fallback programático
        const trayX = 28
        const trayW = 1224
        const trayH = 30
        const gfx = this.add.graphics()
        gfx.fillStyle(0x000000, 0.2)
        gfx.fillRoundedRect(trayX + 4, trayY + 8, trayW, trayH, 8)
        gfx.fillStyle(0x795548, 1)
        gfx.fillRoundedRect(trayX, trayY, trayW, trayH, 7)
        gfx.fillStyle(0xA1887F, 1)
        gfx.fillRoundedRect(trayX, trayY, trayW, trayH * 0.40, { tl: 7, tr: 7, bl: 0, br: 0 })
        gfx.fillStyle(0x4E342E, 1)
        gfx.fillRoundedRect(trayX, trayY + trayH * 0.72, trayW, trayH * 0.28, { tl: 0, tr: 0, bl: 7, br: 7 })
        for (let x = 90; x < trayX + trayW - 30; x += 190) {
          gfx.fillStyle(0x6D4C41, 1)
          gfx.fillCircle(x, trayY + trayH / 2, 7)
          gfx.fillStyle(0xBCAAA4, 0.65)
          gfx.fillCircle(x - 2, trayY + trayH / 2 - 2, 3)
        }
        const edgeY = trayY + trayH
        const vineGfx = this.add.graphics()
        for (let lx = trayX + 65; lx < trayX + trayW - 30; lx += 110) {
          const jitter = ((lx * 7) % 9) - 4
          vineGfx.lineStyle(2, 0x33691E, 0.7)
          vineGfx.lineBetween(lx + jitter, edgeY, lx + jitter, edgeY + 9)
          vineGfx.fillStyle(0x558B2F, 1)
          vineGfx.fillEllipse(lx + jitter, edgeY + 13, 30, 14)
          vineGfx.fillEllipse(lx + jitter - 20, edgeY + 9, 22, 11)
          vineGfx.fillEllipse(lx + jitter + 20, edgeY + 10, 20, 11)
        }
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
    const w = 240
    const h = 120

    // ── children[0]: imagem do vaso ──────────────────────────────────────────
    const specificKey = this.getPlanterKey(baseData)
    let boxBody: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

    if (specificKey) {
      boxBody = this.add.image(0, 0, specificKey).setDisplaySize(w + 60, h + 50)
    } else {
      // Fallback programático (sem imagem disponível)
      const bColor = this.getBaseColor(baseData)
      const bDark  = this.darkenColor(bColor, 0.58)
      const bLight = this.lightenColor(bColor, 0.32)
      const rimH   = 16
      const soilH  = 22
      const innerW = w - 22
      const panelW = w - 14
      const panelH = 58
      const panelY = 27
      const gfx    = this.add.graphics()

      gfx.fillStyle(0x000000, 0.30)
      gfx.fillRoundedRect(-w / 2 + 7, -h / 2 + 9, w, h - 6, 12)
      gfx.fillStyle(bDark, 1)
      gfx.fillRoundedRect(-w / 2, -h / 2 + rimH, w, h - rimH - 4, 10)
      gfx.fillStyle(bColor, 1)
      gfx.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 12)
      gfx.fillStyle(bLight, 1)
      gfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, rimH - 5, { tl: 10, tr: 10, bl: 0, br: 0 })
      gfx.fillStyle(0x1E0E00, 1)
      gfx.fillRoundedRect(-innerW / 2, -h / 2 + rimH, innerW, soilH + 2, 4)
      gfx.fillStyle(0x5C3A1E, 0.65)
      for (let dx = -innerW / 2 + 12; dx < innerW / 2 - 6; dx += 17) {
        gfx.fillCircle(dx, -h / 2 + rimH + soilH / 2 + 1, 2)
      }
      gfx.fillStyle(0x000000, 0.14)
      gfx.fillRect(-innerW / 2, -h / 2 + rimH, 5, soilH + 2)
      gfx.fillRect(innerW / 2 - 5, -h / 2 + rimH, 5, soilH + 2)
      gfx.lineStyle(3, bDark, 1)
      gfx.strokeRoundedRect(-w / 2, -h / 2, w, h - 8, 12)
      gfx.fillStyle(0x000000, 0.16)
      gfx.fillRoundedRect(-panelW / 2 + 2, panelY - panelH / 2 + 3, panelW, panelH, 10)
      gfx.fillStyle(0xFFF8DC, 1)
      gfx.fillRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)
      gfx.fillStyle(0xFFFFFF, 0.52)
      gfx.fillRoundedRect(-panelW / 2 + 4, panelY - panelH / 2 + 4, panelW - 8, panelH * 0.38, { tl: 7, tr: 7, bl: 0, br: 0 })
      gfx.lineStyle(2, bDark, 0.45)
      gfx.strokeRoundedRect(-panelW / 2, panelY - panelH / 2, panelW, panelH, 9)

      const flX     = -panelW / 2 + 30
      const flY     = panelY - 1
      const swatch  = this.add.graphics()
      swatch.fillStyle(0x000000, 0.22)
      swatch.fillRoundedRect(flX - 14 + 2, flY - 10 + 2, 28, 20, 5)
      swatch.fillStyle(bColor, 1)
      swatch.fillRoundedRect(flX - 14, flY - 10, 28, 20, 5)
      swatch.lineStyle(2, bDark, 0.65)
      swatch.strokeRoundedRect(flX - 14, flY - 10, 28, 20, 5)

      const label = this.add.text(flX + 28, panelY + 1, baseData.labelKey, {
        fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#3E2723',
      }).setOrigin(0, 0.5)

      const leafGfx = this.add.graphics()
      this.drawLeafCluster(leafGfx, -w / 2 - 2, h / 2 - 10, false)
      this.drawLeafCluster(leafGfx, w / 2 + 2, h / 2 - 10, true)

      // No fallback, o flashRect fica no índice 1 — os extras vêm depois
      const flashRectFb = this.add.rectangle(0, 0, w, h, 0xFFD700).setAlpha(0)
      const arrowFb = this.add.text(0, h / 2 + 12, '▼', { fontSize: '15px', color: '#8D6E63' }).setOrigin(0.5)
      this.tweens.add({ targets: arrowFb, y: h / 2 + 18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
      const zoneFb = this.add.zone(0, 0, w, h).setRectangleDropZone(w, h)

      const container = this.add.container(baseData.x, baseData.y,
        [gfx, flashRectFb, swatch, label, arrowFb, zoneFb, leafGfx])
      container.setData('baseData', baseData)
      return container
    }

    // ── children[1]: flashRect — obrigatoriamente no índice 1 ────────────────
    const flashRect = this.add.rectangle(0, 0, w, h, 0xFFD700).setAlpha(0)

    // ── children[2]: seta animada ─────────────────────────────────────────────
    const arrow = this.add.text(0, h / 2 + 12, '▼', { fontSize: '15px', color: '#8D6E63' }).setOrigin(0.5)
    this.tweens.add({ targets: arrow, y: h / 2 + 18, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    // ── children[3]: drop zone ────────────────────────────────────────────────
    const zone = this.add.zone(0, 0, w, h).setRectangleDropZone(w, h)

    const container = this.add.container(baseData.x, baseData.y, [boxBody, flashRect, arrow, zone])
    container.setData('baseData', baseData)
    return container
  }

  // ── Asset drawing helpers ────────────────────────────────────────────────

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
    const displayScale = Math.min(ITEM_SCALE_MAX, (gap - 10) / 120)

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

  private getPlanterKey(baseData: ClassifierBase): string | null {
    const { attribute, value } = baseData.rule
    if (attribute === 'cor') {
      const map: Record<string, string> = {
        vermelho: 'planter-box-red',
        azul:     'planter-box-blue',
        verde:    'planter-box-green',
        amarelo:  'planter-box-yellow',
      }
      const key = map[value]
      return key && this.textures.exists(key) ? key : null
    }
    if (attribute === 'forma') {
      const map: Record<string, string> = {
        circulo:   'planter-box-purple-circle',
        quadrado:  'planter-box-red-square',
        triangulo: 'planter-box-blue-triangle',
        retangulo: 'planter-box-green-rectangle',
      }
      const key = map[value]
      return key && this.textures.exists(key) ? key : null
    }
    return null
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

}
