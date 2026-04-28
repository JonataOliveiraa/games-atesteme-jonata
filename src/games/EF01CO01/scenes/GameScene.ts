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

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private bases: Phaser.GameObjects.Container[] = []
  private itemSprites: DraggableItem[] = []
  private hits = 0
  private errors = 0
  private startTime = 0
  private currentPoints = 0
  private currentLives = 1
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
    this.showLevelIntro()
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

  private showLevelIntro() {
    this.input.enabled = false

    const overlay = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.65)
      .setDepth(50)

    const starsStr =
      '★'.repeat(this.levelConfig.level) + '☆'.repeat(3 - this.levelConfig.level)

    this.add
      .text(640, 200, starsStr, {
        fontSize: '52px',
        color: '#FFD700',
      })
      .setOrigin(0.5)
      .setDepth(51)

    const lvlLabel = this.add
      .text(640, 280, `NÍVEL  ${this.levelConfig.level}`, {
        fontSize: '82px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(51)

    const ruleMap: Record<string, string> = {
      cor: '🎨  Separe por COR!',
      forma: '🔷  Separe por FORMA!',
      tamanho: '📏  Separe por TAMANHO!',
    }

    this.add
      .text(640, 380, ruleMap[this.levelConfig.criterion] ?? '', {
        fontSize: '36px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFF9C4',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(51)

    this.playCountdownTick()

    let count = 3
    const countText = this.add
      .text(640, 490, '3', {
        fontSize: '96px',
        fontFamily: 'Arial Black, Arial',
        color: '#FF6B35',
        stroke: '#000000',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(51)

    this.tweens.add({
      targets: countText,
      scaleX: 1.25,
      scaleY: 1.25,
      yoyo: true,
      duration: 400,
    })

    const countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--

        if (count > 0) {
          countText.setText(String(count))
          this.tweens.add({
            targets: countText,
            scaleX: 1.25,
            scaleY: 1.25,
            yoyo: true,
            duration: 400,
          })
          this.playCountdownTick()
          return
        }

        const introObjects = [overlay, lvlLabel, countText]

        this.tweens.add({
          targets: introObjects,
          alpha: 0,
          duration: 350,
          onComplete: () => {
            introObjects.forEach((o) => o.destroy())
            countdownEvent.destroy()
            this.input.enabled = true
            this.revealItems()
            this.playGo()

            EventBus.emit('scene-ready', { levelConfig: this.levelConfig })

            runtimeGameBridge.emit({
              type: 'GAME_READY',
              gameId: GAME_ID,
            })

            this.emitCheckpoint()

            if (this.levelConfig.timeLimit) {
              this.startTimer()
            }
          },
        })

        this.children.list
          .filter(
            (o) => (o as { depth?: number }).depth === 51 && o !== lvlLabel && o !== countText,
          )
          .forEach((o) => {
            this.tweens.add({
              targets: o,
              alpha: 0,
              duration: 350,
            })
          })
      },
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
      })
    })
  }

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

  private onTimeUp() {
    this.playTimeUp()
    runtimeGameBridge.emit({
      type: 'GAME_OVER',
      gameId: GAME_ID,
      stage: this.levelConfig.level,
    })

    this.endRound()
  }

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
      if (!dropped) this.returnItem(obj)
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

  private validateDrop(
    item: DraggableItem,
    baseContainer: Phaser.GameObjects.Container,
    base: ClassifierBase,
  ) {
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

    if (this.currentLives <= 0) {
      this.errors += 1
      this.currentPoints = Math.max(0, this.currentPoints - 5)

      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER',
        gameId: GAME_ID,
        pointsEarned: -5,
        stage: this.levelConfig.level,
      })

      this.onWrongDrop(item, baseContainer)

      runtimeGameBridge.emit({
        type: 'GAME_OVER',
        gameId: GAME_ID,
        stage: this.levelConfig.level,
      })

      this.endRound()
      return
    }

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
      .text(x, y - 10, '✅', {
        fontSize: '42px',
      })
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
    this.input.enabled = false
    this.timerEvent?.destroy()

    this.showRoundComplete()

    this.time.delayedCall(1800, () => {
      const result: RoundResult = {
        gameCode: 'EF01CO01',
        level: this.levelConfig.level,
        criterion: this.levelConfig.criterion,
        hits: this.hits,
        errors: this.errors,
        durationMs: Date.now() - this.startTime,
        timestamp: Date.now(),
      }

      EventBus.emit('round-complete', result)
    })
  }

  private showRoundComplete() {
    this.playRoundComplete()

    const overlay = this.add
      .rectangle(640, 360, 1280, 720, 0x000000, 0.55)
      .setDepth(45)

    const mainText = this.add
      .text(640, 290, 'INCRÍVEL! 🌟', {
        fontSize: '78px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 9,
      })
      .setOrigin(0.5)
      .setDepth(46)
      .setAlpha(0)

    this.tweens.add({
      targets: mainText,
      alpha: 1,
      scaleX: { from: 0.4, to: 1 },
      scaleY: { from: 0.4, to: 1 },
      duration: 380,
      ease: 'Back.Out',
    })

    const resultText = this.add
      .text(640, 400, `✅  ${this.hits}   ✖  ${this.errors}`, {
        fontSize: '38px',
        color: '#FFFFFF',
        stroke: '#000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(46)
      .setAlpha(0)

    this.tweens.add({
      targets: resultText,
      alpha: 1,
      delay: 300,
      duration: 300,
    })

    const starEmojis = ['⭐', '🌟', '✨', '💫']

    for (let i = 0; i < 22; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-60, -10)
      const em = starEmojis[i % starEmojis.length]
      const sz = `${Phaser.Math.Between(20, 44)}px`

      const star = this.add.text(sx, sy, em, { fontSize: sz }).setDepth(46)

      this.tweens.add({
        targets: star,
        y: Phaser.Math.Between(380, 680),
        x: sx + Phaser.Math.Between(-80, 80),
        alpha: { from: 1, to: 0.1 },
        angle: Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800),
        delay: Phaser.Math.Between(0, 600),
        onComplete: () => star.destroy(),
      })
    }

    this.time.delayedCall(2200, () => {
      overlay.destroy()
      mainText.destroy()
      resultText.destroy()
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

  private playCountdownTick() {
    this.playTone(880, 0.07, 'sine', 0.20)  // A5 — tick
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