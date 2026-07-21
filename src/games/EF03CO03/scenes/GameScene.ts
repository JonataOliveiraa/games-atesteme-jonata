import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, DecompChallenge, ActionCard } from '../types'
import { LEVELS } from '../data/challenges'

const GAME_ID = 'chef-dos-subproblemas'
const MAX_CONSECUTIVE_ERRORS = 3

// Panel accent colors per subproblem index
const SP_FILL = [0xff8a2a, 0x29b6f6, 0x4caf50] as const
const SP_DARK = [0xe65100, 0x0277bd, 0x2e7d32] as const

// Layout
const PANEL_TOP   = 82
const HEADER_H    = 56
const SLOT_H      = 92
const SLOT_GAP    = 10
const PANEL_PAD   = 14
const PANEL_R     = 18
const POOL_Y_SOLO = 548   // single-row pool (N1/N2, 6 cards)
const POOL_Y_R1   = 516   // two-row pool top row (N3, 9 cards)
const POOL_Y_R2   = 602   // two-row pool bottom row
const CONFIRM_Y   = 658

type RoundPhase = 'intro' | 'placing' | 'checking' | 'level-complete'

interface SlotInfo {
  container: Phaser.GameObjects.Container
  slotBg: Phaser.GameObjects.Image
  panelIndex: number
  slotIndex: number
  cardId: string | null
  labelText: Phaser.GameObjects.Text
  placeholder: Phaser.GameObjects.Text
  slotW: number
}

export class GameScene extends Phaser.Scene {
  private levelConfig!: LevelConfig
  private currentChallengeIndex = 0
  private hits   = 0
  private errors = 0
  private consecutiveErrors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: RoundPhase = 'intro'
  private gameEnded = false

  // Drag state
  private dragCard: Phaser.GameObjects.Container | null = null
  private dragCardId: string | null = null

  private poolCards = new Map<string, Phaser.GameObjects.Container>()
  private cardHomePos = new Map<string, { x: number; y: number }>()
  private slots: SlotInfo[] = []
  private confirmBtn?: Phaser.GameObjects.Container

  private challengeObjects: Phaser.GameObjects.GameObject[] = []
  private overlayObjects: Phaser.GameObjects.GameObject[] = []
  private unsubPlatform?: () => void

  constructor() { super({ key: 'GameScene' }) }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig           = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
    this.currentChallengeIndex = 0
    this.hits                  = 0
    this.errors                = 0
    this.consecutiveErrors     = 0
    this.currentPoints         = data?.points ?? 0
    this.currentLives          = data?.lives  ?? 1
    this.isMuted               = false
    this.phase                 = 'intro'
    this.gameEnded             = false
    this.dragCard              = null
    this.dragCardId            = null
    this.poolCards             = new Map()
    this.cardHomePos           = new Map()
    this.slots                 = []
    this.challengeObjects      = []
    this.overlayObjects        = []
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    // Global drag listeners
    this.input.on('pointermove', this.onDragMove,  this)
    this.input.on('pointerup',   this.onDragEnd,   this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.buildConfirmButton()
    this.showStartScreen()
  }

  update() {}

  shutdown() {
    this.input.off('pointermove', this.onDragMove, this)
    this.input.off('pointerup',   this.onDragEnd,  this)
    this.clearOverlay()
    this.clearChallenge()
    EventBus.off('mute-audio', undefined, this)
    this.unsubPlatform?.()
    this.unsubPlatform = undefined
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  OBJECT LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.overlayObjects.push(obj); return obj
  }

  private addChallengeObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.challengeObjects.push(obj); return obj
  }

  private clearOverlay() {
    this.overlayObjects.forEach(o => { if (o.active) o.destroy() })
    this.overlayObjects = []
  }

  private clearChallenge() {
    this.challengeObjects.forEach(o => { if (o.active) o.destroy() })
    this.challengeObjects = []
    this.poolCards.forEach(c => { if (c.active) c.destroy() })
    this.poolCards.clear()
    this.cardHomePos.clear()
    this.slots = []
    this.dragCard = null
    this.dragCardId = null
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BRIDGE / HUD
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    EventBus.emit('mission-update', {
      instruction:   this.levelConfig.title,
      hint:          this.levelConfig.tip,
      missionIndex:  this.currentChallengeIndex,
      totalMissions: this.levelConfig.challenges.length,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentChallengeIndex / this.levelConfig.challenges.length) * 100)
    runtimeGameBridge.emit({
      type: 'CHECKPOINT', gameId: GAME_ID,
      progress, score: this.currentPoints, stage: this.levelConfig.level,
      hits: this.hits, errors: this.errors,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BACKGROUND
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    this.add.image(640, 360, 'bg-kitchen').setDisplaySize(1280, 720).setDepth(-1)
    this.add.image(1202, 598, 'character-chef').setDisplaySize(124, 162).setDepth(1).setAlpha(0.78)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CONFIRM BUTTON
  // ══════════════════════════════════════════════════════════════════════════

  private buildConfirmButton() {
    this.confirmBtn = this.add.container(640, CONFIRM_Y).setDepth(5)
    const bg = this.add.graphics()
    this.redrawConfirmBg(bg, false)
    const txt = this.add.text(0, 0, '✅  Confirmar plano', {
      fontFamily: 'Arial Black, Arial', fontSize: '21px', color: '#ffffff',
      stroke: '#1b7d1c', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    this.confirmBtn.add([bg, txt])
    this.confirmBtn.setSize(320, 64)
    this.confirmBtn.setData('bg', bg)
    this.confirmBtn.on('pointerdown', () => this.checkPlan())
    this.setConfirmEnabled(false)
  }

  private redrawConfirmBg(g: Phaser.GameObjects.Graphics, enabled: boolean) {
    g.clear()
    g.fillStyle(enabled ? 0x42d640 : 0x9ca3af, 1)
    g.fillRoundedRect(-160, -30, 320, 60, 30)
    g.lineStyle(3, 0xffffff, enabled ? 1 : 0.4)
    g.strokeRoundedRect(-160, -30, 320, 60, 30)
  }

  private setConfirmEnabled(enabled: boolean) {
    if (!this.confirmBtn) return
    this.redrawConfirmBg(this.confirmBtn.getData('bg'), enabled)
    if (enabled) this.confirmBtn.setInteractive({ useHandCursor: true })
    else this.confirmBtn.disableInteractive()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CHALLENGE SETUP
  // ══════════════════════════════════════════════════════════════════════════

  private startChallenge() {
    this.clearChallenge()
    this.phase = 'placing'

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const shuffled  = Phaser.Utils.Array.Shuffle([...challenge.allCards]) as ActionCard[]

    // Challenge banner at top (mission-board PNG)
    const bannerImg = this.addChallengeObject(
      this.add.image(540, 38, 'mission-board').setDisplaySize(860, 58).setDepth(4)
    )
    void bannerImg
    this.addChallengeObject(
      this.add.text(540, 38, `Como resolver: ${challenge.mainTask}?`, {
        fontFamily: 'Arial Black, Arial', fontSize: '18px', color: '#3e2723',
        stroke: '#ffffff', strokeThickness: 2, align: 'center',
        wordWrap: { width: 820 },
      }).setOrigin(0.5).setDepth(5).setResolution(2)
    )

    this.buildPanels(challenge)
    this.buildPool(shuffled)
    this.setConfirmEnabled(false)
    this.broadcastMissionState()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  SUBPROBLEM PANELS
  // ══════════════════════════════════════════════════════════════════════════

  private panelH(slotCount: number): number {
    return HEADER_H + PANEL_PAD + slotCount * SLOT_H + (slotCount - 1) * SLOT_GAP + PANEL_PAD
  }

  private buildPanels(challenge: DecompChallenge) {
    const n      = challenge.subproblems.length
    const panelW = n === 2 ? 560 : 358
    const gap    = 20
    const totalW = n * panelW + (n - 1) * gap
    const startX = 640 - totalW / 2

    challenge.subproblems.forEach((sp, pi) => {
      const cx     = startX + pi * (panelW + gap) + panelW / 2
      const slotCt = sp.correctCardIds.length
      const pH     = this.panelH(slotCt)
      const slotW  = panelW - 40

      // ── Panel background (drawn, keeps per-panel color flexibility) ──
      const shadow = this.addChallengeObject(this.add.graphics().setDepth(2))
      shadow.fillStyle(0x000000, 0.10)
      shadow.fillRoundedRect(cx - panelW / 2 + 5, PANEL_TOP + 5, panelW, pH, PANEL_R)

      const panelBg = this.addChallengeObject(this.add.graphics().setDepth(3))
      panelBg.fillStyle(0xfff9f4, 0.97)
      panelBg.fillRoundedRect(cx - panelW / 2, PANEL_TOP, panelW, pH, PANEL_R)
      panelBg.lineStyle(3, SP_FILL[pi % 3], 0.9)
      panelBg.strokeRoundedRect(cx - panelW / 2, PANEL_TOP, panelW, pH, PANEL_R)

      // ── Colored header using PNG (tinted per panel) ──
      const headerImg = this.addChallengeObject(
        this.add.image(cx, PANEL_TOP + HEADER_H / 2, 'panel-header')
          .setDisplaySize(panelW, HEADER_H)
          .setTint(SP_FILL[pi % 3])
          .setDepth(4)
      )
      void headerImg

      // Number badge on header
      const badgeBg = this.addChallengeObject(this.add.graphics().setDepth(5))
      badgeBg.fillStyle(SP_DARK[pi % 3], 1)
      badgeBg.fillCircle(cx - panelW / 2 + 22, PANEL_TOP + HEADER_H / 2, 14)
      this.addChallengeObject(
        this.add.text(cx - panelW / 2 + 22, PANEL_TOP + HEADER_H / 2, `${pi + 1}`, {
          fontFamily: 'Arial Black, Arial', fontSize: '16px', color: '#ffffff',
        }).setOrigin(0.5).setDepth(6).setResolution(2)
      )

      // Subproblem label in header
      this.addChallengeObject(
        this.add.text(cx + 8, PANEL_TOP + HEADER_H / 2, sp.label, {
          fontFamily: 'Arial Black, Arial', fontSize: '15px', color: '#ffffff',
          align: 'center', wordWrap: { width: panelW - 60 },
          stroke: `#${SP_DARK[pi % 3].toString(16).padStart(6, '0')}`, strokeThickness: 1,
        }).setOrigin(0.5).setDepth(6).setResolution(2)
      )

      // ── Slots ──
      for (let si = 0; si < slotCt; si++) {
        const slotTop = PANEL_TOP + HEADER_H + PANEL_PAD + si * (SLOT_H + SLOT_GAP)
        const slotCY  = slotTop + SLOT_H / 2

        // Slot PNG background (empty state)
        const slotBg = this.addChallengeObject(
          this.add.image(cx, slotCY, 'slot-bg')
            .setDisplaySize(slotW, SLOT_H)
            .setDepth(4)
        ) as Phaser.GameObjects.Image

        // Slot number for N2 (ordered)
        if (challenge.orderedWithin) {
          this.addChallengeObject(
            this.add.text(cx - slotW / 2 + 18, slotCY, `${si + 1}`, {
              fontFamily: 'Arial Black, Arial', fontSize: '20px',
              color: `#${SP_FILL[pi % 3].toString(16).padStart(6, '0')}`,
            }).setOrigin(0.5).setDepth(5).setAlpha(0.5).setResolution(2)
          )
        }

        // Placeholder text
        const placeholder = this.addChallengeObject(
          this.add.text(cx, slotCY, '+ soltar aqui', {
            fontFamily: 'Arial', fontSize: '17px', color: '#bdbdbd',
          }).setOrigin(0.5).setDepth(5).setResolution(2)
        )

        // Label shown when filled
        const labelTxt = this.addChallengeObject(
          this.add.text(cx, slotCY, '', {
            fontFamily: 'Arial Black, Arial', fontSize: '15px', color: '#3e2723',
            align: 'center', wordWrap: { width: slotW - 28 },
          }).setOrigin(0.5).setDepth(5).setAlpha(0).setResolution(2)
        )

        // Invisible hit zone for slot (tap to return card)
        const hitZone = this.addChallengeObject(
          this.add.zone(cx, slotCY, slotW, SLOT_H).setDepth(6).setInteractive({ useHandCursor: true })
        )

        const slotInfo: SlotInfo = {
          container: hitZone as unknown as Phaser.GameObjects.Container,
          slotBg,
          panelIndex: pi,
          slotIndex: si,
          cardId: null,
          labelText: labelTxt,
          placeholder,
          slotW,
        }
        hitZone.on('pointerdown', () => this.onTapSlot(slotInfo))
        this.slots.push(slotInfo)
      }
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CARD POOL
  // ══════════════════════════════════════════════════════════════════════════

  private buildPool(cards: ActionCard[]) {
    const n        = cards.length
    const use2Rows = n > 6
    const CARD_W   = use2Rows ? 130 : 152
    const CARD_H   = 88
    const GAP      = use2Rows ? 12 : 16

    if (use2Rows) {
      this.layoutPoolRow(cards.slice(0, 5), CARD_W, CARD_H, GAP, POOL_Y_R1)
      this.layoutPoolRow(cards.slice(5),    CARD_W, CARD_H, GAP, POOL_Y_R2)
    } else {
      this.layoutPoolRow(cards, CARD_W, CARD_H, GAP, POOL_Y_SOLO)
    }
  }

  private layoutPoolRow(cards: ActionCard[], cw: number, ch: number, gap: number, rowY: number) {
    const totalW = cards.length * cw + (cards.length - 1) * gap
    const startX = 640 - totalW / 2 + cw / 2
    cards.forEach((card, i) => {
      const x = startX + i * (cw + gap)
      this.makePoolCard(card, x, rowY, cw, ch, i * 40)
    })
  }

  private makePoolCard(card: ActionCard, x: number, y: number, w: number, h: number, delay = 0) {
    const container = this.addChallengeObject(
      this.add.container(x, y).setDepth(8)
    ) as Phaser.GameObjects.Container
    container.setSize(w, h)

    // PNG background for the card
    const bg = this.add.image(0, 0, 'card-task').setDisplaySize(w, h)

    const label = this.add.text(0, 0, card.label, {
      fontFamily: 'Arial Black, Arial', fontSize: w >= 148 ? '14px' : '12px', color: '#3e2723',
      align: 'center', wordWrap: { width: w - 20 },
    }).setOrigin(0.5).setResolution(2)

    container.add([bg, label])
    container.setData('cardId', card.id)
    container.setData('w', w)
    container.setData('h', h)
    container.setInteractive({ useHandCursor: true })

    // Drag starts on pointerdown
    container.on('pointerdown', () => this.beginDrag(container, card.id))

    // Store home for snap-back
    this.cardHomePos.set(card.id, { x, y })
    this.poolCards.set(card.id, container)

    container.setAlpha(0).setScale(0.8)
    this.tweens.add({ targets: container, alpha: 1, scale: 1, duration: 220, delay, ease: 'Back.Out' })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  DRAG & DROP
  // ══════════════════════════════════════════════════════════════════════════

  private beginDrag(card: Phaser.GameObjects.Container, cardId: string) {
    if (this.phase !== 'placing' || this.gameEnded) return
    this.dragCard   = card
    this.dragCardId = cardId
    card.setDepth(20)
    this.tweens.killTweensOf(card)
    this.tweens.add({ targets: card, scale: 1.1, duration: 90, ease: 'Sine.Out' })
    this.playTick()
  }

  private onDragMove(pointer: Phaser.Input.Pointer) {
    if (!this.dragCard || this.phase !== 'placing') return
    this.dragCard.x = pointer.x
    this.dragCard.y = pointer.y
  }

  private onDragEnd(pointer: Phaser.Input.Pointer) {
    if (!this.dragCard || !this.dragCardId) return
    const card   = this.dragCard
    const cardId = this.dragCardId
    this.dragCard   = null
    this.dragCardId = null

    card.setDepth(8)
    this.tweens.add({ targets: card, scale: 1, duration: 90 })

    // Find valid empty slot under the drop point
    const dropSlot = this.slots.find(s => s.cardId === null && this.hitTestSlot(pointer.x, pointer.y, s))

    if (dropSlot) {
      this.placeCardInSlot(cardId, dropSlot)
      card.destroy()
      this.poolCards.delete(cardId)
    } else {
      // Snap back to pool home position
      const home = this.cardHomePos.get(cardId)!
      this.tweens.add({ targets: card, x: home.x, y: home.y, duration: 220, ease: 'Sine.Out' })
    }
  }

  private hitTestSlot(px: number, py: number, slot: SlotInfo): boolean {
    // Zone stores x/y as world position (Phaser.GameObjects.Zone)
    const zone = slot.container as unknown as Phaser.GameObjects.Zone
    const hw = slot.slotW / 2 + 12   // +12 for touch tolerance
    const hh = SLOT_H / 2 + 10
    return Math.abs(px - zone.x) <= hw && Math.abs(py - zone.y) <= hh
  }

  private placeCardInSlot(cardId: string, slot: SlotInfo) {
    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const cardData  = challenge.allCards.find(c => c.id === cardId)
    if (!cardData) return

    slot.cardId = cardId
    slot.labelText.setText(cardData.label).setAlpha(1)
    slot.placeholder.setAlpha(0)

    // Visual: tint slot-bg to filled state
    slot.slotBg.setTint(0xffe0b2)

    this.playTick()
    this.setConfirmEnabled(this.slots.every(s => s.cardId !== null))
  }

  // Tap on filled slot → return card to pool
  private onTapSlot(slot: SlotInfo) {
    if (this.phase !== 'placing' || this.gameEnded || !slot.cardId) return

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    const cardData  = challenge.allCards.find(c => c.id === slot.cardId)
    if (!cardData) return

    const cardId = slot.cardId
    slot.cardId  = null
    slot.labelText.setAlpha(0)
    slot.placeholder.setAlpha(1)
    slot.slotBg.clearTint()

    // Return card to its home position
    const home = this.cardHomePos.get(cardId) ?? { x: 640, y: POOL_Y_SOLO }
    const n    = challenge.allCards.length
    const cw   = n > 6 ? 130 : 152
    const ch   = 88
    this.makePoolCard(cardData, home.x, home.y, cw, ch, 0)

    this.setConfirmEnabled(false)
    this.playTick()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  VALIDATION
  // ══════════════════════════════════════════════════════════════════════════

  private checkPlan() {
    if (this.phase !== 'placing' || this.gameEnded) return
    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    this.phase = 'checking'
    this.confirmBtn?.disableInteractive()

    let allCorrect = true

    challenge.subproblems.forEach((sp, pi) => {
      const panelSlots = this.slots.filter(s => s.panelIndex === pi)
      const placedIds  = panelSlots.map(s => s.cardId).filter(Boolean) as string[]

      const panelOk = challenge.orderedWithin
        ? sp.correctCardIds.every((id, idx) => placedIds[idx] === id)
        : placedIds.length === sp.correctCardIds.length && sp.correctCardIds.every(id => placedIds.includes(id))

      if (!panelOk) allCorrect = false

      panelSlots.forEach((slot, si) => {
        const slotOk = challenge.orderedWithin
          ? slot.cardId === sp.correctCardIds[si]
          : sp.correctCardIds.includes(slot.cardId ?? '')

        const zone = slot.container as unknown as Phaser.GameObjects.Zone
        if (slotOk) {
          const check = this.addChallengeObject(
            this.add.image(zone.x + slot.slotW / 2 - 14, zone.y - SLOT_H / 2 + 14, 'icon-check')
              .setDisplaySize(26, 26).setDepth(9).setAlpha(0)
          )
          this.tweens.add({ targets: check, alpha: 1, duration: 180, delay: (pi * 3 + si) * 100 })
        } else {
          this.addChallengeObject(
            this.add.text(zone.x + slot.slotW / 2 - 14, zone.y - SLOT_H / 2 + 14, '❌', { fontSize: '20px' })
              .setOrigin(0.5).setDepth(9)
          )
        }
      })
    })

    if (allCorrect) {
      this.hits++
      this.consecutiveErrors = 0
      this.playCorrect()
      runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 10, stage: this.levelConfig.level })
      this.emitCheckpoint()
      this.time.delayedCall(1700, () => this.advanceChallenge())
    } else {
      this.errors++
      this.consecutiveErrors++
      this.playError()
      runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level })
      this.emitCheckpoint()
      this.time.delayedCall(2000, () => {
        if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.onTooManyErrors()
        else this.startChallenge()
      })
    }
  }

  private advanceChallenge() {
    this.currentChallengeIndex++
    if (this.currentChallengeIndex >= this.levelConfig.challenges.length) { this.endLevel(); return }
    this.startChallenge()
  }

  private onTooManyErrors() {
    if (this.gameEnded) return
    this.gameEnded = true
    this.showGameOverScreen()
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.gameEnded = true
    this.playFanfare()
    this.emitCheckpoint()
    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
    const next = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null
    this.time.delayedCall(400, () => next ? this.showLevelCompleteScreen(next) : this.showFinalCompleteScreen())
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FLOW SCREENS
  // ══════════════════════════════════════════════════════════════════════════

  private showStartScreen() {
    this.clearOverlay()
    const lvl = this.levelConfig.level

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.52).setDepth(60).setInteractive()
    )
    void overlay

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(62))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-272, -186, 544, 368, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-280, -198, 560, 368, 28)
    bg.lineStyle(5, 0xff8a2a, 0.9)
    bg.strokeRoundedRect(-280, -198, 560, 368, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xff8a2a, 1)
    topBar.fillRoundedRect(-198, -214, 396, 30, 15)

    const titleTxt = this.add.text(0, -130, `Nível ${lvl} — ${this.levelConfig.title}`, {
      fontFamily: 'Arial Black, Arial', fontSize: '25px', color: '#3e2723',
      align: 'center', wordWrap: { width: 510 },
    }).setOrigin(0.5).setResolution(2)

    const objTxt = this.add.text(0, -56, this.levelConfig.objective, {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: '#f57c00',
      align: 'center', wordWrap: { width: 500 },
    }).setOrigin(0.5).setResolution(2)

    const tipTxt = this.add.text(0, 26, `💡 ${this.levelConfig.tip}`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#5d4037',
      align: 'center', wordWrap: { width: 510 },
    }).setOrigin(0.5).setResolution(2)

    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x42d640, 1)
    btnBg.fillRoundedRect(-132, -27, 264, 54, 27)
    btnBg.lineStyle(4, 0xffffff, 1)
    btnBg.strokeRoundedRect(-132, -27, 264, 54, 27)
    const btnTxt = this.add.text(0, 0, '▶  Iniciar', {
      fontFamily: 'Arial Black, Arial', fontSize: '22px', color: '#ffffff',
      stroke: '#1b7d1c', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    const btn = this.add.container(0, 122, [btnBg, btnTxt])
    btn.setSize(264, 62)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 80 }))
    btn.on('pointerout',  () => this.tweens.add({ targets: btn, scale: 1,    duration: 80 }))
    btn.on('pointerdown', () => { this.playTick(); this.clearOverlay(); this.startChallenge() })

    modal.add([shadow, bg, topBar, titleTxt, objTxt, tipTxt, btn])
    modal.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
  }

  private showLevelCompleteScreen(nextLevel: 2 | 3) {
    this.clearOverlay()
    const lvl = this.levelConfig.level

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.56).setDepth(60).setInteractive()
    )
    void overlay
    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(62))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-262, -160, 524, 320, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-270, -172, 540, 320, 28)
    bg.lineStyle(5, 0xffffff, 0.9)
    bg.strokeRoundedRect(-270, -172, 540, 320, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x42d640, 1)
    topBar.fillRoundedRect(-188, -188, 376, 28, 14)

    const stars = this.add.text(0, -110, '⭐⭐⭐', { fontSize: '48px' }).setOrigin(0.5)
    this.tweens.add({ targets: stars, scale: 1.12, duration: 680, yoyo: true, repeat: -1 })

    const title = this.add.text(0, -48, 'Parabéns!', {
      fontFamily: 'Arial Black, Arial', fontSize: '38px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const msgs: Record<number, string> = {
      1: 'Você distribuiu as ações nos subproblemas certos!',
      2: 'Você classificou E ordenou cada subproblema!',
    }
    const sub = this.add.text(0, 14, msgs[lvl] ?? '', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#5d4037',
      align: 'center', wordWrap: { width: 460 },
    }).setOrigin(0.5).setResolution(2)

    const next = this.add.text(0, 70, `Preparando nível ${nextLevel}...`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#f57c00',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, stars, title, sub, next])
    modal.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    this.time.delayedCall(1800, () => {
      this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives })
    })
  }

  private showFinalCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.62).setDepth(60).setInteractive()
    )
    void overlay
    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(62))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-294, -192, 588, 380, 34)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-302, -204, 604, 380, 34)
    bg.lineStyle(6, 0xffffff, 0.9)
    bg.strokeRoundedRect(-302, -204, 604, 380, 34)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0x42d640, 1)
    ribbon.fillRoundedRect(-212, -222, 424, 34, 17)

    const stars = this.add.text(0, -144, '⭐⭐⭐', { fontSize: '56px' }).setOrigin(0.5)
    this.tweens.add({ targets: stars, scaleX: 1.14, scaleY: 1.14, duration: 700, yoyo: true, repeat: -1 })

    const title = this.add.text(0, -74, 'Parabéns, Chef!', {
      fontFamily: 'Arial Black, Arial', fontSize: '42px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const sub = this.add.text(0, -12, 'Você dominou a decomposição em subproblemas!', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: '#5d4037',
      align: 'center', wordWrap: { width: 540 },
    }).setOrigin(0.5).setResolution(2)

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics()
      sp.fillStyle([0xff8a2a, 0x29b6f6, 0x42d640][i % 3], 0.9)
      sp.fillCircle(Phaser.Math.Between(-276, 276), Phaser.Math.Between(-180, 110), Phaser.Math.Between(4, 9))
      this.tweens.add({ targets: sp, alpha: { from: 0.3, to: 1 }, scale: { from: 0.7, to: 1.4 }, duration: 500 + i * 28, yoyo: true, repeat: -1 })
      return sp
    })

    const retryBtn = this.makeModalBtn(-140, 98, '🔄 Jogar novamente', 0x42d640, '#1b7d1c', () =>
      this.scene.restart({ level: 1, points: 0, lives: 1 })
    )
    const exitBtn = this.makeModalBtn(140, 98, '🚪 Sair', 0xf57c00, '#9a3f00', () =>
      EventBus.emit('exit-game')
    )

    panel.add([shadow, bg, ribbon, ...sparkles, stars, title, sub, retryBtn, exitBtn])
    panel.setAlpha(0).setScale(0.88)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
  }

  private showGameOverScreen() {
    this.input.enabled = true
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.62).setDepth(60).setInteractive()
    )
    void overlay
    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(62))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-266, -170, 532, 336, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-274, -182, 548, 336, 28)
    bg.lineStyle(5, 0xffffff, 0.9)
    bg.strokeRoundedRect(-274, -182, 548, 336, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xef4444, 1)
    topBar.fillRoundedRect(-190, -198, 380, 28, 14)

    const icon   = this.add.text(0, -116, '😓', { fontSize: '56px' }).setOrigin(0.5)
    const title  = this.add.text(0, -56, 'Que pena!', {
      fontFamily: 'Arial Black, Arial', fontSize: '36px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)
    const reason = this.add.text(0, 0, '3 planos errados seguidos!', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: '#ef4444',
    }).setOrigin(0.5).setResolution(2)
    const stats  = this.add.text(0, 46, `${this.currentChallengeIndex} de ${this.levelConfig.challenges.length} tarefas concluídas`, {
      fontFamily: 'Arial', fontSize: '17px', color: '#5d4037',
    }).setOrigin(0.5).setResolution(2)

    const retryBtn = this.makeModalBtn(-136, 114, '🔄 Tentar novamente', 0x42d640, '#1b7d1c', () =>
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    )
    const exitBtn = this.makeModalBtn(136, 114, 'Sair', 0xf57c00, '#9a3f00', () =>
      EventBus.emit('exit-game')
    )

    panel.add([shadow, bg, topBar, icon, title, reason, stats, retryBtn, exitBtn])
    panel.setAlpha(0).setScale(0.9)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))
  }

  private makeModalBtn(x: number, y: number, label: string, color: number, stroke: string, onClick: () => void) {
    const btn = this.add.container(x, y)
    const bg  = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-122, -25, 244, 50, 25)
    bg.lineStyle(4, 0xffffff, 1)
    bg.strokeRoundedRect(-122, -25, 244, 50, 25)
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Arial Black, Arial', fontSize: '16px', color: '#ffffff', stroke, strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    btn.add([bg, txt])
    btn.setSize(252, 62)
    btn.setInteractive({ useHandCursor: true })
    btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 80 }))
    btn.on('pointerout',  () => this.tweens.add({ targets: btn, scale: 1,    duration: 80 }))
    btn.on('pointerdown', () => { this.playTick(); onClick() })
    return btn
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  AUDIO
  // ══════════════════════════════════════════════════════════════════════════

  private getAudioCtx(): AudioContext | null {
    if (this.isMuted) return null
    try { return (this.sound as Phaser.Sound.WebAudioSoundManager).context } catch { return null }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.25) {
    const ctx = this.getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g   = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  }

  private playTick()    { this.playTone(520, 0.04, 'sine', 0.08) }
  private playCorrect() {
    this.playTone(660, 0.08, 'sine', 0.15)
    this.time.delayedCall(100, () => this.playTone(880, 0.10, 'sine', 0.12))
  }
  private playError()   { this.playTone(330, 0.20, 'square', 0.15) }
  private playFanfare() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.time.delayedCall(i * 125, () => this.playTone(f, 0.22, 'sine', 0.32))
    )
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  PLATFORM BRIDGE
  // ══════════════════════════════════════════════════════════════════════════

  private registerPlatformCommands() {
    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME') {
        this.currentPoints = cmd.points ?? 0
        this.currentLives  = cmd.lives  ?? 1
      }
    })
  }
}
