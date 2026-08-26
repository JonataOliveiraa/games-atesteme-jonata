import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import type { LevelConfig, MuseumItem, ItemCard, DropZoneDef, ZoneKind, ConfirmMode } from '../types'
import { LEVELS } from '../data/levels'
import { ALL_ITEMS } from '../data/items'

const GAME_ID = 'museu-vivo-do-computador'

const TIMER_X = 200, TIMER_Y = 88, TIMER_W = 880, TIMER_H = 20
const TRAY_Y = 190
const CARD_W = 132, CARD_H = 132
const ZONE_TOP = 278, ZONE_H = 356
const ZONE_HEAD = 54
const FACT_Y = 676
const SLOT = 104
const BAR_Y = 670

const C = {
  blue: 0x3B82F6,
  blueDark: 0x1E3A8A,
  purple: 0x8B5CF6,
  white: 0xFFFFFF,
  offWhite: 0xF8FAFC,
  ink: 0x1E293B,
  green: 0x22C55E,
  red: 0xEF4444,
  amber: 0xF59E0B,
  slate: 0x94A3B8,
}

interface ZoneView {
  def: DropZoneDef
  x: number
  y: number
  w: number
  h: number
  frame: Phaser.GameObjects.Graphics
  filled: number
  staged: ItemCard[]
}

type MissionPhase = 'intro' | 'tutorial' | 'playing' | 'feedback' | 'level-complete'

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private currentMissionIndex = 0
  private hits = 0
  private errors = 0
  private currentPoints = 0
  private currentLives = 1
  private isMuted = false
  private phase: MissionPhase = 'intro'
  private gameEnded = false
  private missionEffectActive = false

  private questionText?: Phaser.GameObjects.Text
  private factText?: Phaser.GameObjects.Text

  private pending?: { card: ItemCard; zone: ZoneView }
  private suppressDropForCard?: ItemCard
  private confirmBar?: Phaser.GameObjects.Container
  private confirmMsg?: Phaser.GameObjects.Text

  private itemCards: ItemCard[] = []
  private zones: ZoneView[] = []
  private requiredCount = 0
  private placedCount = 0

  private overlayObjects: Phaser.GameObjects.GameObject[] = []
  private tutorialObjects: Phaser.GameObjects.GameObject[] = []

  private timeBarFill?: Phaser.GameObjects.Graphics
  private timerTween?: Phaser.Tweens.Tween
  private timerState = { progress: 1 }
  private timerActive = false
  private timerWarned = false
  private warningBeepTimer: Phaser.Time.TimerEvent | null = null

  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
    this.currentMissionIndex = 0
    this.hits = 0
    this.errors = 0
    this.currentPoints = data?.points ?? 0
    this.currentLives = data?.lives ?? 1
    this.isMuted = false
    this.phase = 'intro'
    this.gameEnded = false
    this.pending = undefined
    this.suppressDropForCard = undefined
    this.confirmBar = undefined
    this.confirmMsg = undefined
    this.missionEffectActive = false
    this.itemCards = []
    this.zones = []
    this.overlayObjects = []
    this.tutorialObjects = []
    this.requiredCount = 0
    this.placedCount = 0
    this.timerActive = false
    this.timerWarned = false
    this.timerState.progress = 1
    this.warningBeepTimer = null
  }

  create() {
    this.drawBackground()
    this.createTimerBar()
    this.createHeaderTexts()
    this.registerPlatformCommands()

    EventBus.on('mute-audio', this.onMuteAudio, this)
    EventBus.on('show-tutorial', this.onShowTutorial, this)

    // Phaser não chama `shutdown()` da classe automaticamente: sem este vínculo com o
    // evento do ciclo de vida os listeners acima sobrevivem à destruição da cena.
    this.events.once('shutdown', this.handleShutdown, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })

    this.broadcastMissionState()
    this.emitCheckpoint()
    this.buildMission()
    this.showLevelIntroScreen()
  }

  private onMuteAudio(muted: boolean) {
    this.isMuted = muted
  }

  private onShowTutorial() {
    this.replayTutorial()
  }

  private handleShutdown() {
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null

    this.clearOverlay()
    this.clearTutorial()

    EventBus.off('mute-audio', this.onMuteAudio, this)
    EventBus.off('show-tutorial', this.onShowTutorial, this)

    this.unsubPlatform?.()
    this.unsubPlatform = undefined
  }

  private get confirmMode(): ConfirmMode {
    return this.levelConfig.confirmMode ?? 'imediato'
  }

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.overlayObjects.push(obj)
    return obj
  }

  private clearOverlay() {
    this.overlayObjects.forEach(o => o.destroy())
    this.overlayObjects = []
  }

  private drawBackground() {
    this.add.image(640, 360, 'bg-museum').setDisplaySize(1280, 720).setDepth(-2)
  }

  private createHeaderTexts() {
    this.factText = this.add.text(640, FACT_Y, '', {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#A7F3D0',
      stroke: '#0F172A', strokeThickness: 4,
      align: 'center', wordWrap: { width: 1100 },
    }).setOrigin(0.5).setDepth(12).setResolution(2)
  }

  private createTimerBar() {
    const bg = this.add.graphics().setDepth(6)
    bg.fillStyle(C.blueDark, 0.85)
    bg.fillRoundedRect(TIMER_X - 4, TIMER_Y - 4, TIMER_W + 8, TIMER_H + 8, 13)
    bg.lineStyle(2, C.blue, 0.8)
    bg.strokeRoundedRect(TIMER_X - 4, TIMER_Y - 4, TIMER_W + 8, TIMER_H + 8, 13)

    this.timeBarFill = this.add.graphics().setDepth(7)
    this.drawTimeBar(1)
  }

  private replayTutorial() {
    if (this.phase !== 'playing') return
    if (!this.itemCards.length || !this.zones.length) return

    this.timerActive = false
    this.timerTween?.pause()

    this.showTutorial(() => {
      this.phase = 'playing'
      this.timerActive = true
      this.timerTween?.resume()
    })
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return
    const color = progress > 0.5 ? C.green : progress > 0.25 ? C.amber : C.red
    const w = TIMER_W * Phaser.Math.Clamp(progress, 0, 1)
    this.timeBarFill.clear()
    if (w > 0) {
      this.timeBarFill.fillStyle(color, 1)
      this.timeBarFill.fillRoundedRect(TIMER_X, TIMER_Y, w, TIMER_H, TIMER_H / 2)
    }
  }

  private startTimer() {
    this.timerState.progress = 1
    this.timerActive = true
    this.timerWarned = false
    this.drawTimeBar(1)
    this.phase = 'playing'

    this.timerTween = this.tweens.add({
      targets: this.timerState,
      progress: 0,
      duration: this.levelConfig.timeLimit * 1000,
      ease: 'Linear',
      onUpdate: () => {
        this.drawTimeBar(this.timerState.progress)
        if (!this.timerWarned && this.timerState.progress <= 0.25) {
          this.timerWarned = true
          this.startWarningBeeps()
        }
      },
      onComplete: () => { this.drawTimeBar(0); this.onTimeUp() },
    })
  }

  private startWarningBeeps() {
    this.warningBeepTimer = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
        if (!this.timerActive) { this.warningBeepTimer?.destroy(); this.warningBeepTimer = null; return }
        this.playTone(880, 0.06, 'sine', 0.12)
      },
    })
  }

  private onTimeUp() {
    if (this.gameEnded) return
    this.gameEnded = true
    this.timerActive = false
    this.drawTimeBar(0)
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER', gameId: GAME_ID,
      pointsEarned: 0, stage: this.levelConfig.level,
    })
    this.showGameOverScreen()
  }

  private buildMission() {
    this.clearMission()

    const mission = this.levelConfig.missions[this.currentMissionIndex]
    this.factText?.setText('')

    this.buildZones(mission.zones)
    this.buildTray(mission.itemIds)

    const accepted = new Set(mission.zones.flatMap(z => z.acceptIds))
    this.requiredCount = mission.itemIds.filter(id => accepted.has(id)).length
    this.placedCount = 0

    this.broadcastMissionState()
  }

  private clearMission() {
    this.hideConfirmBar()
    this.pending = undefined
    this.suppressDropForCard = undefined
    this.itemCards.forEach(c => c.container.destroy())
    this.itemCards = []
    this.zones.forEach(z => z.frame.destroy())
    this.zones = []
    this.children.list
      .filter(o => o.getData?.('missionScoped') === true)
      .forEach(o => o.destroy())
  }

  private zoneColor(kind: ZoneKind): number {
    if (kind === 'pecas') return C.blue
    if (kind === 'programas') return C.purple
    return C.amber
  }

  private buildZones(defs: DropZoneDef[]) {
    const n = defs.length
    const totalW = n === 1 ? 780 : 1180
    const gap = 36
    const zoneW = n === 1 ? totalW : (totalW - gap * (n - 1)) / n
    const startX = 640 - totalW / 2

    defs.forEach((def, i) => {
      const x = startX + i * (zoneW + gap)

      const frame = this.add.graphics().setDepth(3)
      frame.setData('missionScoped', true)
      frame.setData('label', def.label)
      this.drawZoneFrame(frame, x, ZONE_TOP, zoneW, ZONE_H, this.zoneColor(def.kind), false)

      const label = this.add.text(x + zoneW / 2, ZONE_TOP + ZONE_HEAD / 2, def.label.toUpperCase(), {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '22px', color: '#FFFFFF',
        stroke: '#0F172A', strokeThickness: 5,
        align: 'center', wordWrap: { width: zoneW - 40 },
      }).setOrigin(0.5).setDepth(5).setResolution(2)
      label.setData('missionScoped', true)

      this.zones.push({ def, x, y: ZONE_TOP, w: zoneW, h: ZONE_H, frame, filled: 0, staged: [] })
    })
  }

  private drawZoneFrame(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    color: number, highlight: boolean,
  ) {
    g.clear()

    g.fillStyle(0x0B1220, 0.45)
    g.fillRoundedRect(x + 4, y + 8, w, h, 24)

    g.fillStyle(C.blueDark, highlight ? 0.55 : 0.38)
    g.fillRoundedRect(x, y, w, h, 24)

    g.fillStyle(color, highlight ? 1 : 0.9)
    g.fillRoundedRect(x, y, w, ZONE_HEAD, { tl: 24, tr: 24, bl: 0, br: 0 })
    g.fillStyle(C.white, 0.18)
    g.fillRoundedRect(x + 8, y + 6, w - 16, ZONE_HEAD * 0.42, 12)

    const iy = y + ZONE_HEAD + 12
    const ih = h - ZONE_HEAD - 24
    this.dashedRoundRect(g, x + 14, iy, w - 28, ih, highlight ? color : C.slate, highlight ? 1 : 0.45)

    g.lineStyle(highlight ? 8 : 5, color, highlight ? 1 : 0.85)
    g.strokeRoundedRect(x, y, w, h, 24)
  }

  private dashedRoundRect(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    color: number, alpha: number,
  ) {
    const dash = 16, gap = 12
    g.lineStyle(4, color, alpha)

    const line = (x1: number, y1: number, x2: number, y2: number) => {
      const len = Math.hypot(x2 - x1, y2 - y1)
      const steps = Math.max(1, Math.floor(len / (dash + gap)))
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len
      for (let i = 0; i < steps; i++) {
        const s = i * (dash + gap)
        g.lineBetween(x1 + ux * s, y1 + uy * s, x1 + ux * (s + dash), y1 + uy * (s + dash))
      }
    }

    line(x, y, x + w, y)
    line(x + w, y, x + w, y + h)
    line(x + w, y + h, x, y + h)
    line(x, y + h, x, y)
  }

  private buildTray(itemIds: string[]) {
    const items = itemIds
      .map(id => ALL_ITEMS.find(it => it.id === id)!)
      .filter(Boolean)
    Phaser.Utils.Array.Shuffle(items)

    const gap = 24
    const totalW = items.length * CARD_W + (items.length - 1) * gap
    const startX = 640 - totalW / 2 + CARD_W / 2

    items.forEach((item, i) => {
      const x = startX + i * (CARD_W + gap)
      this.itemCards.push(this.makeDraggableCard(item, x, TRAY_Y, i))
    })
  }

  private makeDraggableCard(item: MuseumItem, cx: number, cy: number, idx: number): ItemCard {
    const bg = this.add.graphics()
    bg.fillStyle(C.white, 0.97)
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
    bg.lineStyle(4, C.slate, 1)
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)

    const img = this.add.image(0, -14, item.textureKey).setDisplaySize(80, 80)

    const name = this.add.text(0, CARD_H / 2 - 22, item.name, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '14px', color: '#1E293B',
      align: 'center', wordWrap: { width: CARD_W - 14 },
    }).setOrigin(0.5).setResolution(2)

    const container = this.add.container(cx, cy, [bg, img, name]).setDepth(10)
    container.setSize(CARD_W, CARD_H)
    container.setInteractive({ useHandCursor: true, draggable: true })
    this.input.setDraggable(container)

    const card: ItemCard = { container, item, homeX: cx, homeY: cy, placed: false }

    container.on('pointerdown', () => {
      if (this.phase !== 'playing') return
      if (this.confirmMode !== 'porItem') return
      if (this.pending?.card !== card || !card.staged) return
      this.suppressDropForCard = card
      this.cancelPending()
    })

    container.on('dragstart', () => {
      if (this.phase !== 'playing') return
      if (this.suppressDropForCard === card) return
      container.setDepth(60)
      this.tweens.add({ targets: container, scale: 1.08, duration: 90 })
    })

    container.on('drag', (_p: Phaser.Input.Pointer, dx: number, dy: number) => {
      if (this.phase !== 'playing') return
      if (this.suppressDropForCard === card) return
      container.setPosition(dx, dy)
      this.highlightZoneUnder(dx, dy)
    })

    container.on('dragend', (pointer: Phaser.Input.Pointer) => {
      container.setDepth(10)
      this.tweens.add({ targets: container, scale: 1, duration: 90 })
      this.clearZoneHighlights()
      if (card.placed) return
      if (this.suppressDropForCard === card) { this.suppressDropForCard = undefined; return }
      if (this.phase !== 'playing') { this.tweenCardHome(card); return }
      this.resolveDrop(card, pointer.x, pointer.y)
    })

    container.setAlpha(0).setScale(0.75)
    this.tweens.add({
      targets: container, alpha: 1, scale: 1,
      duration: 320, ease: 'Back.Out', delay: idx * 60,
    })

    return card
  }

  private zoneAt(x: number, y: number): ZoneView | null {
    return this.zones.find(z =>
      x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) ?? null
  }

  private highlightZoneUnder(x: number, y: number) {
    const target = this.zoneAt(x, y)
    this.zones.forEach(z => {
      this.drawZoneFrame(z.frame, z.x, z.y, z.w, z.h, this.zoneColor(z.def.kind), z === target)
    })
  }

  private clearZoneHighlights() {
    this.zones.forEach(z => {
      this.drawZoneFrame(z.frame, z.x, z.y, z.w, z.h, this.zoneColor(z.def.kind), false)
    })
  }

  private tweenCardHome(card: ItemCard) {
    card.staged = false
    this.tweens.add({
      targets: card.container, x: card.homeX, y: card.homeY, scale: 1,
      duration: 260, ease: 'Back.Out',
    })
  }

  private resolveDrop(card: ItemCard, px: number, py: number) {
    const zone = this.zoneAt(px, py)
    const mode = this.confirmMode

    if (this.pending?.card === card) {
      this.pending = undefined
      this.hideConfirmBar()
    }
    if (card.staged) this.unstage(card)

    if (!zone) {
      this.tweenCardHome(card)
      return
    }

    if (mode === 'imediato') { this.judgeDrop(card, zone); return }
    if (mode === 'porItem') { this.stagePending(card, zone); return }
    this.stageForAssembly(card, zone)
  }

  private judgeDrop(card: ItemCard, zone: ZoneView) {
    if (!zone.def.acceptIds.includes(card.item.id)) {
      this.rejectCard(card)
      return
    }
    this.placeCorrect(card, zone)
  }

  private rejectCard(card: ItemCard) {
    this.errors++
    this.playError()
    this.cameras.main.shake(140, 0.005)
    this.tweenCardHome(card)
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER', gameId: GAME_ID,
      pointsEarned: -2, stage: this.levelConfig.level,
    })
    this.emitCheckpoint()
  }

  private placeCorrect(card: ItemCard, zone: ZoneView) {
    card.placed = true
    card.staged = false
    card.container.disableInteractive()
    this.playCorrect()

    const slot = this.slotPosition(zone, zone.filled)
    zone.filled++
    this.placedCount++

    this.tweens.add({
      targets: card.container,
      x: slot.x, y: slot.y, scale: SLOT / CARD_W,
      duration: 280, ease: 'Back.Out',
    })

    this.showFact(card.item.fact)

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER', gameId: GAME_ID,
      pointsEarned: 5, stage: this.levelConfig.level,
    })
    this.currentPoints += 5

    if (this.placedCount >= this.requiredCount) this.finishMission()
  }

  private showFact(fact: string) {
    this.factText?.setText(fact)
    this.factText?.setAlpha(0)
    this.tweens.add({ targets: this.factText, alpha: 1, duration: 200 })
  }

  private finishMission() {
    this.hits++
    this.phase = 'feedback'
    this.time.delayedCall(900, () => this.celebrateZones())
  }

  private stagePending(card: ItemCard, zone: ZoneView) {
    if (this.pending && this.pending.card !== card) {
      this.pending.card.staged = false
      this.input.setDraggable(this.pending.card.container, true)
      this.tweenCardHome(this.pending.card)
    }
    this.pending = { card, zone }
    card.staged = true
    this.input.setDraggable(card.container, false)
    this.playTick()

    const slot = this.slotPosition(zone, zone.filled)
    this.tweens.add({
      targets: card.container,
      x: slot.x, y: slot.y, scale: SLOT / CARD_W,
      duration: 260, ease: 'Back.Out',
    })
    this.drawZoneFrame(zone.frame, zone.x, zone.y, zone.w, zone.h, this.zoneColor(zone.def.kind), true)

    this.showConfirmBar('', 'Escolher', () => this.confirmPending())
  }

  private confirmPending() {
    if (!this.pending) return
    const { card, zone } = this.pending
    this.pending = undefined
    this.hideConfirmBar()
    this.clearZoneHighlights()
    card.staged = false
    this.input.setDraggable(card.container, true)
    this.judgeDrop(card, zone)
  }

  private cancelPending() {
    if (!this.pending) return
    const { card } = this.pending
    this.pending = undefined
    this.hideConfirmBar()
    this.clearZoneHighlights()
    card.staged = false
    this.input.setDraggable(card.container, false)
    this.playTick()
    this.tweenCardHome(card)
    this.time.delayedCall(280, () => {
      if (!card.placed) this.input.setDraggable(card.container, true)
      if (this.suppressDropForCard === card) this.suppressDropForCard = undefined
    })
  }

  private stageForAssembly(card: ItemCard, zone: ZoneView) {
    zone.staged.push(card)
    card.staged = true
    this.playTick()
    this.reflowZone(zone)
    this.showAssemblyBar()
  }

  private unstage(card: ItemCard) {
    const zone = this.zones.find(z => z.staged.includes(card))
    if (!zone) return
    zone.staged = zone.staged.filter(c => c !== card)
    card.staged = false
    this.reflowZone(zone)
    if (!this.zones.some(z => z.staged.length)) this.hideConfirmBar()
  }

  private reflowZone(zone: ZoneView) {
    zone.staged.forEach((c, i) => {
      const slot = this.slotPosition(zone, i)
      this.tweens.add({
        targets: c.container,
        x: slot.x, y: slot.y, scale: SLOT / CARD_W,
        duration: 240, ease: 'Back.Out',
      })
    })
  }

  private showAssemblyBar() {
    const total = this.zones.reduce((acc, z) => acc + z.staged.length, 0)
    const msg = total === 1
      ? '1 item na máquina. Arraste para fora para tirar.'
      : `${total} itens na máquina. Arraste para fora para tirar.`

    if (this.confirmBar) {
      this.confirmMsg?.setText(msg)
      return
    }

    this.showConfirmBar(msg, 'Está pronto', () => this.confirmAssembly())
  }

  private confirmAssembly() {
    const zone = this.zones[0]
    const staged = [...zone.staged]
    const wrong = staged.filter(c => !zone.def.acceptIds.includes(c.item.id))

    if (wrong.length) {
      this.errors += wrong.length
      this.playError()
      this.cameras.main.shake(160, 0.005)
      wrong.forEach(c => {
        zone.staged = zone.staged.filter(s => s !== c)
        this.tweenCardHome(c)
      })
      this.reflowZone(zone)
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER', gameId: GAME_ID,
        pointsEarned: -2, stage: this.levelConfig.level,
      })
      this.emitCheckpoint()
      this.confirmMsg?.setText(
        wrong.length === 1
          ? 'Um item não é desta máquina. Ele voltou para cima.'
          : 'Alguns itens não são desta máquina. Eles voltaram para cima.')
      return
    }

    const faltam = this.requiredCount - staged.length
    if (faltam > 0) {
      this.playError()
      this.confirmMsg?.setText(faltam === 1
        ? 'Está quase! Ainda falta 1 item.'
        : `Está quase! Ainda faltam ${faltam} itens.`)
      return
    }

    this.hideConfirmBar()
    this.playCorrect()

    staged.forEach((c, i) => {
      c.placed = true
      c.staged = false
      c.container.disableInteractive()
      zone.filled = i + 1
    })
    this.placedCount = staged.length
    zone.staged = []

    this.showFact(staged[staged.length - 1].item.fact)
    this.currentPoints += 5 * staged.length

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER', gameId: GAME_ID,
      pointsEarned: 5 * staged.length, stage: this.levelConfig.level,
    })

    this.finishMission()
  }

  private slotPosition(zone: ZoneView, index: number) {
    const perRow = Math.max(1, Math.floor((zone.w - 40) / (SLOT + 16)))
    const col = index % perRow
    const row = Math.floor(index / perRow)
    const rowW = perRow * SLOT + (perRow - 1) * 16
    const startX = zone.x + zone.w / 2 - rowW / 2 + SLOT / 2
    return {
      x: startX + col * (SLOT + 16),
      y: zone.y + ZONE_HEAD + 30 + SLOT / 2 + row * (SLOT + 18),
    }
  }

  private celebrateZones() {
    this.playFanfare()
    this.zones.forEach(z => {
      this.drawZoneFrame(z.frame, z.x, z.y, z.w, z.h, C.green, true)
      this.tweens.add({
        targets: z.frame, alpha: { from: 1, to: 0.45 },
        duration: 260, yoyo: true, repeat: 2,
        onComplete: () => z.frame.setAlpha(1),
      })
    })
    this.time.delayedCall(1200, () => this.advanceMission())
  }

  // ══════════════════════════════════════════════════════════════════════
  //  TUTORIAL GUIADO
  // ══════════════════════════════════════════════════════════════════════

  private clearTutorial() {
    this.tutorialObjects.forEach(o => o.destroy())
    this.tutorialObjects = []
  }

  private tut<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.tutorialObjects.push(obj)
    return obj
  }

  /** Escurece a tela inteira, deixando apenas `rect` visível. */
  private drawSpotlight(g: Phaser.GameObjects.Graphics, r: Phaser.Geom.Rectangle) {
    const pad = 12
    const x = r.x - pad, y = r.y - pad
    const w = r.width + pad * 2, h = r.height + pad * 2

    g.clear()
    g.fillStyle(0x0B1220, 0.82)
    g.fillRect(0, 0, 1280, y)
    g.fillRect(0, y + h, 1280, 720 - (y + h))
    g.fillRect(0, y, x, h)
    g.fillRect(x + w, y, 1280 - (x + w), h)

    g.strokeRoundedRect(x, y, w, h, 18)
  }

  private trayBounds(): Phaser.Geom.Rectangle {
    const xs = this.itemCards.map(c => c.homeX)
    const left = Math.min(...xs) - CARD_W / 2
    const right = Math.max(...xs) + CARD_W / 2
    return new Phaser.Geom.Rectangle(left, TRAY_Y - CARD_H / 2, right - left, CARD_H)
  }

  private zonesBounds(): Phaser.Geom.Rectangle {
    const left = Math.min(...this.zones.map(z => z.x))
    const right = Math.max(...this.zones.map(z => z.x + z.w))
    return new Phaser.Geom.Rectangle(left, ZONE_TOP, right - left, ZONE_H)
  }

  private showTutorial(onDone: () => void) {
    this.phase = 'tutorial'

    const spot = this.tut(this.add.graphics().setDepth(300))
    const blocker = this.tut(
      this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.001).setDepth(299).setInteractive())

    const balloon = this.tut(this.add.container(640, 0).setDepth(320))
    const balloonBg = this.add.graphics()
    const balloonTxt = this.add.text(0, 0, '', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px', color: '#0F172A',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)
    balloon.add([balloonBg, balloonTxt])

    const setBalloon = (text: string, y: number) => {
      balloonTxt.setText(text)
      const w = 580, h = Math.max(72, balloonTxt.height + 40)
      balloonBg.clear()
      balloonBg.fillStyle(C.white, 0.98)
      balloonBg.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
      balloonBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
      balloon.setY(y)
      balloon.setAlpha(0)
      this.tweens.add({ targets: balloon, alpha: 1, duration: 200 })
    }

    const nextBtn = this.tut(this.createModalButton(640, 0, 'Próximo', C.blue, () => { }))
    nextBtn.setDepth(321)

    const setNext = (y: number, label: string, action: () => void) => {
      nextBtn.setY(y)
      const txt = nextBtn.getAt(1) as Phaser.GameObjects.Text
      txt.setText(label)
      nextBtn.removeAllListeners('pointerdown')
      nextBtn.on('pointerdown', () => { this.playTick(); action() })
    }

    // ── Passo 1: a bandeja de itens ────────────────────────────────
    const step1 = () => {
      const r = this.trayBounds()
      this.drawSpotlight(spot, r)
      setBalloon('Aqui em cima ficam os itens do museu.', 420)
      setNext(520, 'Próximo', step2)
    }

    // ── Passo 2: as caixas de destino ──────────────────────────────
    const step2 = () => {
      const r = this.zonesBounds()
      this.drawSpotlight(spot, r)
      setBalloon('Embaixo ficam as caixas. Cada item pertence a uma delas.', 210)
      setNext(268, 'Próximo', step3)
    }

    // ── Passo 3: demonstração animada do arrasto ───────────────────
    const step3 = () => {
      spot.clear()
      spot.fillStyle(0x0B1220, 0.72)
      spot.fillRect(0, 0, 1280, 720)

      setBalloon('Arraste o item até a caixa certa, assim:', 178)
      setNext(660, 'Entendi, vamos jogar!', finish)

      const from = this.itemCards[0]
      const zone = this.zones[0]
      const toX = zone.x + zone.w / 2
      const toY = zone.y + zone.h / 2

      const ghost = this.tut(this.add.container(from.homeX, from.homeY).setDepth(310))
      const gBg = this.add.graphics()
      gBg.fillStyle(C.white, 0.98)
      gBg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
      gBg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 16)
      const gImg = this.add.image(0, -14, from.item.textureKey).setDisplaySize(80, 80)
      ghost.add([gBg, gImg])

      const hand = this.tut(this.add.graphics().setDepth(311))
      const drawHand = (x: number, y: number) => {
        hand.clear()
        hand.fillStyle(C.white, 0.35)
        hand.fillCircle(x, y, 26)
        hand.lineStyle(4, C.white, 0.95)
        hand.strokeCircle(x, y, 26)
        hand.fillStyle(C.white, 0.95)
        hand.fillCircle(x, y, 8)
      }
      drawHand(from.homeX, from.homeY)

      this.tweens.add({
        targets: ghost,
        x: toX, y: toY,
        duration: 1400,
        ease: 'Sine.easeInOut',
        repeat: -1,
        repeatDelay: 500,
        hold: 400,
        onUpdate: () => drawHand(ghost.x, ghost.y),
        onRepeat: () => {
          ghost.setPosition(from.homeX, from.homeY)
          drawHand(from.homeX, from.homeY)
        },
      })
    }

    const finish = () => {
      this.tweens.add({
        targets: this.tutorialObjects, alpha: 0, duration: 220,
        onComplete: () => { this.clearTutorial(); onDone() },
      })
    }

    void blocker
    step1()
  }

  // ── Fluxo ──────────────────────────────────────────────────────────────

  private advanceMission() {
    const missions = this.levelConfig.missions
    const isLast = this.currentMissionIndex >= missions.length - 1
    const next = isLast ? null : missions[this.currentMissionIndex + 1].question

    this.showMissionCompleteEffect(next, () => {
      this.currentMissionIndex++
      if (this.currentMissionIndex >= missions.length) {
        this.endLevel()
        return
      }
      this.buildMission()
      this.phase = 'playing'
      this.emitCheckpoint()
    })
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.playFanfare()

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level,
    })
    this.emitCheckpoint()

    const nextLevel = this.levelConfig.level < 3
      ? (this.levelConfig.level + 1) as 2 | 3
      : null

    this.time.delayedCall(400, () => this.showLevelCompleteTransition(nextLevel))
  }

  private broadcastMissionState() {
    const missions = this.levelConfig.missions
    const mission = missions[this.currentMissionIndex] ?? missions[0]
    EventBus.emit('mission-update', {
      instruction: mission.question,
      hint: '',
      missionIndex: this.currentMissionIndex,
      totalMissions: missions.length,
      level: this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentMissionIndex / this.levelConfig.missions.length) * 100)
    runtimeGameBridge.emit({
      type: 'CHECKPOINT', gameId: GAME_ID, progress,
      score: this.currentPoints, stage: this.levelConfig.level,
      hits: this.hits, errors: this.errors,
    })
  }

  // ── Modais ─────────────────────────────────────────────────────────────

  private showLevelIntroScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, C.blueDark, 0.72)
      .setDepth(450).setInteractive()
    const modal = this.add.container(640, 360).setDepth(451)

    const bg = this.add.graphics()
    bg.fillStyle(C.offWhite, 0.99)
    bg.fillRoundedRect(-300, -170, 600, 340, 28)
    bg.lineStyle(6, C.blue, 0.9)
    bg.strokeRoundedRect(-300, -170, 600, 340, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(C.blue, 1)
    topBar.fillRoundedRect(-300, -170, 600, 66, { tl: 28, tr: 28, bl: 0, br: 0 })

    const title = this.add.text(0, -137, `Nível ${this.levelConfig.level}`, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '32px', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -66, this.levelConfig.title, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '26px', color: '#1E3A8A',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, 4, this.levelConfig.objective, {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '21px', color: '#1E293B',
      align: 'center', wordWrap: { width: 500 },
    }).setOrigin(0.5).setResolution(2)

    const btn = this.createModalButton(0, 112, 'Começar', C.blue, () => {
      overlay.destroy(); modal.destroy()
      if (this.levelConfig.level === 1) {
        this.showTutorial(() => this.startTimer())
      } else {
        this.startTimer()
      }
    })

    modal.add([bg, topBar, title, subtitle, objective, btn])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showMissionCompleteEffect(nextInstruction: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    const wasActive = this.timerActive
    this.timerActive = false
    this.timerTween?.pause()

    const overlay = this.add.rectangle(640, 360, 1280, 720, C.blueDark, 0.6)
      .setDepth(200).setInteractive()
    const modal = this.add.container(640, 360).setDepth(201)

    const h = nextInstruction ? 300 : 220
    const bg = this.add.graphics()
    bg.fillStyle(C.offWhite, 0.99)
    bg.fillRoundedRect(-290, -h / 2, 580, h, 26)
    bg.lineStyle(6, C.green, 0.9)
    bg.strokeRoundedRect(-290, -h / 2, 580, h, 26)

    const title = this.add.text(0, -h / 2 + 56, 'Muito bem!', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '34px', color: '#1E3A8A',
    }).setOrigin(0.5).setResolution(2)

    const objs: Phaser.GameObjects.GameObject[] = [bg, title]

    if (nextInstruction) {
      objs.push(this.add.text(0, -h / 2 + 108, 'Próximo desafio:', {
        fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '17px', color: '#3B82F6',
      }).setOrigin(0.5).setResolution(2))
      objs.push(this.add.text(0, -h / 2 + 160, nextInstruction, {
        fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#1E293B',
        align: 'center', wordWrap: { width: 490 },
      }).setOrigin(0.5).setResolution(2))
    }

    const btn = this.createModalButton(0, h / 2 - 48, 'Continuar', C.blue, () => {
      overlay.destroy(); modal.destroy()
      this.missionEffectActive = false
      if (wasActive) { this.timerActive = true; this.timerTween?.resume() }
      onDone()
    })
    objs.push(btn)

    modal.add(objs)
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.timerActive = false
    this.timerTween?.stop()
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, C.blueDark, 0.68).setDepth(450))
    overlay.setInteractive()
    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const bg = this.add.graphics()
    bg.fillStyle(C.offWhite, 0.99)
    bg.fillRoundedRect(-290, -180, 580, 360, 28)
    bg.lineStyle(6, C.blue, 0.9)
    bg.strokeRoundedRect(-290, -180, 580, 360, 28)

    const title = this.add.text(0, -118, 'Parabéns!', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '40px', color: '#1E3A8A',
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você aprendeu a separar peças de programas!',
      2: 'Você descobriu qual programa faz cada peça funcionar!',
      3: 'Você montou máquinas completas que funcionam!',
    }
    const msg = this.add.text(0, -46, successTexts[this.levelConfig.level] ?? '', {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#1E293B',
      align: 'center', wordWrap: { width: 480 },
    }).setOrigin(0.5).setResolution(2)

    const dots = [1, 2, 3].map((lv, i) => {
      const d = this.add.graphics()
      d.fillStyle(lv <= this.levelConfig.level ? C.green : C.slate, 1)
      d.fillCircle(-30 + i * 30, 32, 9)
      return d
    })

    const btn = this.createModalButton(0, 116,
      nextLevel ? 'Próximo nível' : 'Ver resultado', C.blue, () => {
        if (nextLevel) {
          this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives })
        } else {
          overlay.destroy(); modal.destroy()
          this.showGameCompleteScreen()
        }
      })

    modal.add([bg, title, msg, ...dots, btn])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, C.blueDark, 0.75).setDepth(450))
    overlay.setInteractive()
    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const bg = this.add.graphics()
    bg.fillStyle(C.offWhite, 0.99)
    bg.fillRoundedRect(-320, -200, 640, 400, 32)
    bg.lineStyle(7, C.blue, 0.9)
    bg.strokeRoundedRect(-320, -200, 640, 400, 32)

    const title = this.add.text(0, -136, 'Jogo concluído!', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '38px', color: '#1E3A8A',
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -76, 'Você explorou todo o museu do computador!', {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#1E293B',
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2)

    const badges = [1, 2, 3].map((lv, i) => {
      const item = this.add.container(-170 + i * 170, 6)
      const b = this.add.graphics()
      b.fillStyle(i === 0 ? C.blue : i === 1 ? C.blueDark : C.green, 1)
      b.fillRoundedRect(-52, -40, 104, 80, 16)
      const num = this.add.text(0, -12, String(lv), {
        fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '28px', color: '#FFFFFF',
      }).setOrigin(0.5).setResolution(2)
      const lbl = this.add.text(0, 20, 'concluído', {
        fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '12px', color: '#FFFFFF',
      }).setOrigin(0.5).setResolution(2)
      item.add([b, num, lbl])
      return item
    })

    const again = this.createModalButton(-150, 136, 'Jogar novamente', C.green, () => {
      this.scene.restart({ level: 1, points: 0, lives: 1 })
    })
    const exit = this.createModalButton(150, 136, 'Outros jogos', C.blue, () => {
      EventBus.emit('exit-game')
    })

    panel.add([bg, title, subtitle, ...badges, again, exit])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
  }

  private showGameOverScreen() {
    this.clearOverlay()
    this.clearTutorial()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, C.blueDark, 0.72).setDepth(450))
    overlay.setInteractive()
    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const bg = this.add.graphics()
    bg.fillStyle(C.offWhite, 0.99)
    bg.fillRoundedRect(-290, -180, 580, 360, 28)
    bg.lineStyle(6, C.red, 0.9)
    bg.strokeRoundedRect(-290, -180, 580, 360, 28)

    const title = this.add.text(0, -110, 'O tempo acabou!', {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '36px', color: '#1E3A8A',
    }).setOrigin(0.5).setResolution(2)

    const total = this.levelConfig.missions.length
    const stats = this.add.text(0, -36,
      `${this.currentMissionIndex} de ${total} desafios concluídos`, {
      fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '20px', color: '#1E293B',
    }).setOrigin(0.5).setResolution(2)

    const retry = this.createModalButton(-140, 110, 'Tentar novamente', C.green, () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })
    const exit = this.createModalButton(140, 110, 'Sair', C.blue, () => {
      EventBus.emit('exit-game')
    })

    panel.add([bg, title, stats, retry, exit])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))
  }

  private showConfirmBar(
    message: string,
    okLabel: string,
    onOk: () => void,
    cancelLabel?: string,
    onCancel?: () => void,
  ) {
    this.hideConfirmBar()

    const hasMessage = message.trim().length > 0
    const bar = this.add.container(640, BAR_Y).setDepth(80)

    if (!hasMessage) {
      bar.add(this.smallButton(0, 0, 220, okLabel, C.green, onOk))
      bar.setAlpha(0).setY(BAR_Y + 20)
      this.tweens.add({ targets: bar, alpha: 1, y: BAR_Y, duration: 180, ease: 'Back.easeOut' })
      this.confirmBar = bar
      this.confirmMsg = undefined
      return
    }

    const bg = this.add.graphics()
    bg.fillStyle(0x0B1220, 0.55)
    bg.fillRoundedRect(-404, -35, 808, 78, 22)
    bg.fillStyle(C.offWhite, 0.98)
    bg.fillRoundedRect(-400, -39, 800, 78, 22)
    bg.lineStyle(5, C.blue, 0.95)
    bg.strokeRoundedRect(-400, -39, 800, 78, 22)

    this.confirmMsg = this.add.text(-376, 0, message, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: '#1E293B',
      wordWrap: { width: 400 },
    }).setOrigin(0, 0.5).setResolution(2)

    const parts: Phaser.GameObjects.GameObject[] = [bg, this.confirmMsg]

    if (cancelLabel && onCancel) {
      parts.push(this.smallButton(110, 0, 170, cancelLabel, C.slate, onCancel))
      parts.push(this.smallButton(300, 0, 180, okLabel, C.green, onOk))
    } else {
      parts.push(this.smallButton(290, 0, 200, okLabel, C.green, onOk))
    }

    bar.add(parts)
    bar.setAlpha(0).setY(BAR_Y + 26)
    this.tweens.add({ targets: bar, alpha: 1, y: BAR_Y, duration: 220, ease: 'Back.easeOut' })
    this.confirmBar = bar
  }
  private hideConfirmBar() {
    if (!this.confirmBar) return
    const bar = this.confirmBar
    this.confirmBar = undefined
    this.confirmMsg = undefined
    this.tweens.add({
      targets: bar, alpha: 0, y: BAR_Y + 20, duration: 180,
      onComplete: () => bar.destroy(),
    })
  }

  private smallButton(x: number, y: number, w: number, label: string, color: number, onClick: () => void) {
    const btn = this.add.container(x, y)
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-w / 2, -25, w, 50, 25)
    bg.fillStyle(C.white, 0.2)
    bg.fillRoundedRect(-w / 2 + 7, -20, w - 14, 15, 8)
    const text = this.add.text(0, 0, label, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: '#FFFFFF',
      align: 'center', wordWrap: { width: w - 20 },
    }).setOrigin(0.5).setResolution(2)
    btn.add([bg, text])
    btn.setSize(w, 56)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 90 }))
    btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 90 }))
    btn.on('pointerdown', () => { this.playTick(); onClick() })
    return btn
  }

  private createModalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y)
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-130, -26, 260, 52, 26)
    bg.lineStyle(4, C.white, 1)
    bg.strokeRoundedRect(-130, -26, 260, 52, 26)
    const text = this.add.text(0, 0, label, {
      fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: '#FFFFFF',
    }).setOrigin(0.5).setResolution(2)
    button.add([bg, text])
    button.setSize(260, 60)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerover', () => this.tweens.add({ targets: button, scale: 1.05, duration: 90 }))
    button.on('pointerout', () => this.tweens.add({ targets: button, scale: 1, duration: 90 }))
    button.on('pointerdown', () => { this.playTick(); onClick() })
    return button
  }

  // ── Áudio ──────────────────────────────────────────────────────────────

  private getAudioCtx(): AudioContext | null {
    if (this.isMuted) return null
    try {
      return (this.sound as Phaser.Sound.WebAudioSoundManager).context
    } catch { return null }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.25) {
    const ctx = this.getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  }

  private playTick() { this.playTone(520, 0.04, 'sine', 0.08) }
  private playCorrect() {
    this.playTone(660, 0.08, 'sine', 0.15)
    this.time.delayedCall(100, () => this.playTone(880, 0.08, 'sine', 0.12))
  }
  private playError() { this.playTone(330, 0.20, 'square', 0.15) }
  private playFanfare() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.time.delayedCall(i * 125, () => this.playTone(f, 0.22, 'sine', 0.32)))
  }

  private registerPlatformCommands() {
    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME') {
        this.currentPoints = cmd.points ?? 0
        this.currentLives = cmd.lives ?? 1
      }
    })
  }
}
