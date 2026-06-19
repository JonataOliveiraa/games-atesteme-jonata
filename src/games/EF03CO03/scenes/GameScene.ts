import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type { LevelConfig, DecompChallenge, Subtask } from '../types'
import { LEVELS } from '../data/challenges'

const GAME_ID = 'chef-dos-subproblemas'
const MAX_CONSECUTIVE_ERRORS = 3
const BUCKET_W = 130
const BUCKET_H = 86
const BUCKET_GAP = 10
const GROUP_GAP = 34
const POOL_Y = 300
const TIMELINE_Y = 470

type RoundPhase = 'intro' | 'placing' | 'checking' | 'level-complete'

interface BucketInfo {
  container: Phaser.GameObjects.Container
  slotIndex: number
  filledId: string | null
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
  private shouldShowLevelStart = false

  private poolCards = new Map<string, Phaser.GameObjects.Container>()
  private buckets: BucketInfo[] = []
  private confirmBtn?: Phaser.GameObjects.Container
  private missionText?: Phaser.GameObjects.Text
  private poolRowY = POOL_Y

  private overlayObjects: Phaser.GameObjects.GameObject[] = []
  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig           = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentChallengeIndex = 0
    this.hits                  = 0
    this.errors                = 0
    this.consecutiveErrors     = 0
    this.currentPoints         = data?.points ?? 0
    this.currentLives          = data?.lives  ?? 1
    this.isMuted               = false
    this.phase                 = 'intro'
    this.gameEnded             = false
    this.shouldShowLevelStart  = data?.showLevelStart ?? false
    this.poolCards             = new Map()
    this.buckets               = []
    this.overlayObjects        = []
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    this.buildMissionBoard()
    this.buildConfirmButton()

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.startChallenge()
    }
  }

  update() {}

  shutdown() {
    this.clearOverlay()
    EventBus.off('mute-audio', undefined, this)
    this.unsubPlatform?.()
    this.unsubPlatform = undefined
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  OVERLAY MANAGEMENT
  // ══════════════════════════════════════════════════════════════════════════

  private addOverlayObject<T extends Phaser.GameObjects.GameObject>(obj: T): T {
    this.overlayObjects.push(obj)
    return obj
  }

  private clearOverlay() {
    this.overlayObjects.forEach(o => o.destroy())
    this.overlayObjects = []
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    EventBus.emit('mission-update', {
      instruction: this.levelConfig.title,
      hint: this.levelConfig.tip,
      missionIndex:  this.currentChallengeIndex,
      totalMissions: this.levelConfig.challenges.length,
      level:         this.levelConfig.level,
    })
  }

  private emitCheckpoint() {
    const progress = Math.round((this.currentChallengeIndex / this.levelConfig.challenges.length) * 100)
    runtimeGameBridge.emit({
      type:     'CHECKPOINT',
      gameId:   GAME_ID,
      progress,
      score:    this.currentPoints,
      stage:    this.levelConfig.level,
      hits:     this.hits,
      errors:   this.errors,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FUNDO
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    this.add.image(640, 400, 'bg-kitchen').setDisplaySize(1280, 608).setDepth(-1)
  }

  private buildMissionBoard() {
    const board = this.add.image(640, 165, 'mission-board').setDisplaySize(820, 110).setDepth(2)
    void board
    this.missionText = this.add.text(640, 165, '', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '24px', color: '#3e2723',
      align: 'center', wordWrap: { width: 680 },
    }).setOrigin(0.5).setDepth(3).setResolution(2)
  }

  private buildConfirmButton() {
    this.confirmBtn = this.add.container(640, 600).setDepth(5)
    const bg = this.add.graphics()
    bg.fillStyle(0x42d640, 1)
    bg.fillRoundedRect(-150, -28, 300, 56, 26)
    bg.lineStyle(3, 0xffffff, 1)
    bg.strokeRoundedRect(-150, -28, 300, 56, 26)
    const txt = this.add.text(0, 0, '👨‍🍳  Executar Plano', {
      fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#ffffff',
      stroke: '#00000040', strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2)
    this.confirmBtn.add([bg, txt])
    this.confirmBtn.setSize(300, 64)
    this.confirmBtn.setData('bg', bg)
    this.confirmBtn.on('pointerdown', () => this.checkPlan())
    this.setConfirmEnabled(false)
  }

  private setConfirmEnabled(enabled: boolean) {
    if (!this.confirmBtn) return
    const bg = this.confirmBtn.getData('bg') as Phaser.GameObjects.Graphics
    bg.clear()
    bg.fillStyle(enabled ? 0x42d640 : 0xb8c0cc, 1)
    bg.fillRoundedRect(-150, -28, 300, 56, 26)
    bg.lineStyle(3, 0xffffff, enabled ? 1 : 0.8)
    bg.strokeRoundedRect(-150, -28, 300, 56, 26)
    if (enabled) this.confirmBtn.setInteractive({ useHandCursor: true })
    else this.confirmBtn.disableInteractive()
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  MONTAGEM DO DESAFIO
  // ══════════════════════════════════════════════════════════════════════════

  private startChallenge() {
    this.phase = 'placing'
    this.clearChallengeObjects()

    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    this.missionText?.setText(challenge.mainTask)

    const shuffled = [...challenge.subtasks]
    Phaser.Utils.Array.Shuffle(shuffled)
    this.layoutPool(shuffled)
    this.layoutTimeline(challenge)
    this.setConfirmEnabled(false)

    this.broadcastMissionState()
  }

  private clearChallengeObjects() {
    this.poolCards.forEach(c => c.destroy())
    this.poolCards.clear()
    this.buckets.forEach(b => b.container.destroy())
    this.buckets = []
    // remove group background images (tagged)
    this.children.list
      .filter(o => o.getData && o.getData('groupBg'))
      .forEach(o => o.destroy())
  }

  private layoutPool(subtasks: Subtask[]) {
    const cardW = 150, gap = 16
    const totalW = subtasks.length * cardW + (subtasks.length - 1) * gap
    const startX = 640 - totalW / 2 + cardW / 2

    subtasks.forEach((st, i) => {
      const x = startX + i * (cardW + gap)
      const card = this.makePoolCard(st, x, this.poolRowY)
      this.poolCards.set(st.id, card)
    })
  }

  private makePoolCard(subtask: Subtask, x: number, y: number): Phaser.GameObjects.Container {
    const card = this.add.image(0, 0, 'card-subtask').setDisplaySize(150, 88).setOrigin(0.5)
    const label = this.add.text(0, 0, subtask.label, {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#3e2723',
      align: 'center', wordWrap: { width: 130 },
    }).setOrigin(0.5)

    const container = this.add.container(x, y, [card, label]).setDepth(6)
    container.setSize(150, 88)
    container.setData('subtaskId', subtask.id)
    container.setInteractive({ useHandCursor: true })
    container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.05, duration: 80 }))
    container.on('pointerout',  () => this.tweens.add({ targets: container, scale: 1, duration: 80 }))
    container.on('pointerdown', () => this.placeSubtask(subtask.id))

    container.setAlpha(0).setScale(0.7)
    this.tweens.add({ targets: container, alpha: 1, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.Out' })

    return container
  }

  private layoutTimeline(challenge: DecompChallenge) {
    const groupWidths = challenge.slots.map(slot => slot.length * BUCKET_W + (slot.length - 1) * BUCKET_GAP)
    const totalW = groupWidths.reduce((a, b) => a + b, 0) + (challenge.slots.length - 1) * GROUP_GAP
    let runningX = 640 - totalW / 2

    challenge.slots.forEach((slot, slotIndex) => {
      const groupW = groupWidths[slotIndex]
      const groupCenterX = runningX + groupW / 2

      const bgKey = slot.length > 1 ? 'timeline-lane-parallel' : 'timeline-slot'
      const bgImg = this.add.image(groupCenterX, TIMELINE_Y, bgKey)
        .setDisplaySize(groupW + 12, BUCKET_H + 14).setDepth(4)
      bgImg.setData('groupBg', true)

      slot.forEach((_, bucketIdx) => {
        const bx = runningX + bucketIdx * (BUCKET_W + BUCKET_GAP) + BUCKET_W / 2
        const bucket = this.makeBucket(slotIndex, bx, TIMELINE_Y)
        this.buckets.push(bucket)
      })

      runningX += groupW + GROUP_GAP
    })
  }

  private makeBucket(slotIndex: number, x: number, y: number): BucketInfo {
    const container = this.add.container(x, y).setDepth(5)
    const placeholder = this.add.text(0, 0, '+', {
      fontFamily: 'Arial Black, Arial', fontSize: '28px', color: '#9e9e9e',
    }).setOrigin(0.5)
    const label = this.add.text(0, 0, '', {
      fontFamily: 'Arial Black, Arial', fontSize: '13px', color: '#3e2723',
      align: 'center', wordWrap: { width: BUCKET_W - 14 },
    }).setOrigin(0.5).setAlpha(0)
    const checkIcon = this.add.image(BUCKET_W / 2 - 12, -BUCKET_H / 2 + 12, 'icon-check-subtask')
      .setDisplaySize(22, 22).setAlpha(0)
    const wrongMark = this.add.text(BUCKET_W / 2 - 14, -BUCKET_H / 2 + 8, '❌', { fontSize: '18px' }).setOrigin(0.5).setAlpha(0)

    container.add([placeholder, label, checkIcon, wrongMark])
    container.setSize(BUCKET_W, BUCKET_H)
    container.setInteractive({ useHandCursor: true })
    container.setData('placeholder', placeholder)
    container.setData('label', label)
    container.setData('checkIcon', checkIcon)
    container.setData('wrongMark', wrongMark)
    container.on('pointerdown', () => this.removeFromBucket(container))

    return { container, slotIndex, filledId: null }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  COLOCAR / REMOVER SUBTAREFAS
  // ══════════════════════════════════════════════════════════════════════════

  private placeSubtask(subtaskId: string) {
    if (this.gameEnded || this.phase !== 'placing') return
    const card = this.poolCards.get(subtaskId)
    if (!card) return

    const emptyBucket = this.buckets.find(b => b.filledId === null)
    if (!emptyBucket) return

    const subtask = this.findSubtaskById(subtaskId)
    if (!subtask) return

    emptyBucket.filledId = subtaskId
    const label = emptyBucket.container.getData('label') as Phaser.GameObjects.Text
    const placeholder = emptyBucket.container.getData('placeholder') as Phaser.GameObjects.Text
    label.setText(subtask.label).setAlpha(1)
    placeholder.setAlpha(0)
    emptyBucket.container.setData('subtaskId', subtaskId)

    card.destroy()
    this.poolCards.delete(subtaskId)
    this.playTick()

    this.setConfirmEnabled(this.buckets.every(b => b.filledId !== null))
  }

  private removeFromBucket(container: Phaser.GameObjects.Container) {
    if (this.gameEnded || this.phase !== 'placing') return
    const bucket = this.buckets.find(b => b.container === container)
    if (!bucket || bucket.filledId === null) return

    const subtask = this.findSubtaskById(bucket.filledId)
    if (!subtask) return

    const label = container.getData('label') as Phaser.GameObjects.Text
    const placeholder = container.getData('placeholder') as Phaser.GameObjects.Text
    label.setAlpha(0)
    placeholder.setAlpha(1)

    const card = this.makePoolCard(subtask, this.nextPoolSlotX(), this.poolRowY)
    this.poolCards.set(subtask.id, card)

    bucket.filledId = null
    this.playTick()
    this.setConfirmEnabled(false)
  }

  private nextPoolSlotX(): number {
    const cardW = 150, gap = 16
    const count = this.poolCards.size + 1
    const totalW = count * cardW + (count - 1) * gap
    const startX = 640 - totalW / 2 + cardW / 2
    return startX + (count - 1) * (cardW + gap)
  }

  private findSubtaskById(id: string): Subtask | undefined {
    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    return challenge.subtasks.find(s => s.id === id)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  VALIDAÇÃO
  // ══════════════════════════════════════════════════════════════════════════

  private checkPlan() {
    if (this.phase !== 'placing') return
    const challenge = this.levelConfig.challenges[this.currentChallengeIndex]
    this.phase = 'checking'
    this.confirmBtn?.disableInteractive()

    let allCorrect = true
    const slotGroups = new Map<number, BucketInfo[]>()
    this.buckets.forEach(b => {
      const arr = slotGroups.get(b.slotIndex) ?? []
      arr.push(b)
      slotGroups.set(b.slotIndex, arr)
    })

    slotGroups.forEach((bucketsInSlot, slotIndex) => {
      const placedIds = bucketsInSlot.map(b => b.filledId).filter(Boolean) as string[]
      const requiredIds = challenge.slots[slotIndex]
      const correct =
        placedIds.length === requiredIds.length &&
        [...requiredIds].every(id => placedIds.includes(id))

      if (!correct) allCorrect = false

      bucketsInSlot.forEach((b, i) => {
        const checkIcon = b.container.getData('checkIcon') as Phaser.GameObjects.Image
        const wrongMark = b.container.getData('wrongMark') as Phaser.GameObjects.Text
        if (correct) {
          checkIcon.setAlpha(0)
          this.tweens.add({ targets: checkIcon, alpha: 1, duration: 200, delay: (slotIndex * 2 + i) * 120 })
        } else {
          wrongMark.setAlpha(1)
        }
      })
    })

    if (allCorrect) {
      this.hits++
      this.consecutiveErrors = 0
      this.playCorrect()
      this.time.delayedCall(1400, () => this.advanceChallenge())
    } else {
      this.errors++
      this.consecutiveErrors++
      this.playError()
      runtimeGameBridge.emit({
        type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level,
      })
      this.emitCheckpoint()

      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.time.delayedCall(1800, () => this.onTooManyErrors())
      } else {
        this.time.delayedCall(1800, () => {
          this.phase = 'placing'
          this.startChallenge()
        })
      }
    }
  }

  private advanceChallenge() {
    this.currentChallengeIndex++
    if (this.currentChallengeIndex >= this.levelConfig.challenges.length) {
      this.endLevel()
      return
    }
    this.phase = 'placing'
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

    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
    this.emitCheckpoint()

    const nextLevel = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null
    this.time.delayedCall(400, () => this.showLevelCompleteTransition(nextLevel))
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TELAS DE FEEDBACK DE NÍVEL (padrão EF02CO01/04/06)
  // ══════════════════════════════════════════════════════════════════════════

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.56).setDepth(450)
    )
    overlay.setInteractive()

    const modal = this.addOverlayObject(this.add.container(640, 360).setDepth(451))
    const lvl = this.levelConfig.level

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 330, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 330, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xff8a2a, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const title = this.add.text(0, -110, 'Parabéns!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '40px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#f57c00',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você organizou as subtarefas na ordem certa!',
      2: 'Você decompôs planos maiores em etapas corretas!',
      3: 'Você descobriu quais tarefas podem acontecer juntas!',
    }
    const next = this.add.text(0, 8, successTexts[lvl] ?? '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const nextLvl = nextLevel ?? (lvl + 1)
    const dots = [1, 2, 3].map((level, index) => {
      const dot = this.add.graphics()
      dot.fillStyle(
        level <= lvl ? 0x42d640
          : level === nextLvl ? 0xff8a2a
          : 0xd8dde8,
        1
      )
      dot.fillCircle(-28 + index * 28, 72, 8)
      dot.lineStyle(2, 0xffffff, 0.9)
      dot.strokeCircle(-28 + index * 28, 72, 8)
      return dot
    })

    const waitText = this.add.text(0, 116, nextLevel ? 'Preparando o próximo nível...' : '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '15px', color: '#3e2723',
    }).setOrigin(0.5).setResolution(2)

    modal.add([shadow, bg, topBar, title, completed, next, ...dots, waitText])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(2300, () => {
      if (nextLevel) {
        this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives, showLevelStart: true })
      } else {
        this.showGameCompleteScreen()
      }
    })
  }

  private showNextLevelStartScreen() {
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.58)
      .setDepth(450).setInteractive()

    const modal = this.add.container(640, 360).setDepth(451)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -154, 540, 312, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -166, 556, 312, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -166, 556, 312, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0x42d640, 1)
    topBar.fillRoundedRect(-196, -182, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -182, 392, 28, 14)

    const lvl = this.levelConfig.level
    const title = this.add.text(0, -102, `Nível ${lvl}`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const objective = this.add.text(0, -42, this.levelConfig.objective, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '24px', color: '#f57c00',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 12, this.levelConfig.tip, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '16px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const button = this.add.container(0, 104)
    const buttonShadow = this.add.graphics()
    buttonShadow.fillStyle(0x000000, 0.16)
    buttonShadow.fillRoundedRect(-136, -20, 272, 48, 24)
    const buttonBg = this.add.graphics()
    buttonBg.fillStyle(0xf57c00, 1)
    buttonBg.fillRoundedRect(-140, -26, 280, 52, 26)
    buttonBg.lineStyle(4, 0xffffff, 1)
    buttonBg.strokeRoundedRect(-140, -26, 280, 52, 26)
    const buttonText = this.add.text(0, 0, 'Iniciar nível', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#ffffff',
      stroke: '#9a3f00', strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2)
    button.add([buttonShadow, buttonBg, buttonText])

    const buttonHitbox = this.add.zone(640, 360 + 104, 280, 58)
    buttonHitbox.setDepth(452).setInteractive({ useHandCursor: true })
    buttonHitbox.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' })
    })
    buttonHitbox.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' })
    })
    buttonHitbox.on('pointerdown', () => {
      this.playTick()
      overlay.destroy()
      buttonHitbox.destroy()
      modal.destroy()
      this.startChallenge()
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.62).setDepth(450)
    )
    overlay.setInteractive()

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-292, -178, 584, 366, 34)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-304, -190, 608, 370, 34)
    bg.lineStyle(6, 0xffffff, 0.96)
    bg.strokeRoundedRect(-304, -190, 608, 370, 34)

    const ribbon = this.add.graphics()
    ribbon.fillStyle(0x42d640, 1)
    ribbon.fillRoundedRect(-214, -208, 428, 34, 17)
    ribbon.lineStyle(4, 0xffffff, 0.9)
    ribbon.strokeRoundedRect(-214, -208, 428, 34, 17)

    const title = this.add.text(0, -128, 'Jogo concluído!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você decompôs todos os planos da cozinha!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 500 },
    }).setOrigin(0.5).setResolution(2)

    const levelLabels = [1, 2, 3].map((level, index) => {
      const item = this.add.container(-190 + index * 190, 54)
      const badge = this.add.graphics()
      badge.fillStyle(index === 0 ? 0xff8a2a : index === 1 ? 0x45c6f0 : 0x42d640, 1)
      badge.fillRoundedRect(-54, -42, 108, 84, 18)
      badge.lineStyle(4, 0xffffff, 0.95)
      badge.strokeRoundedRect(-54, -42, 108, 84, 18)
      const number = this.add.text(0, -13, String(level), {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '30px', color: '#ffffff',
        stroke: '#3e2723', strokeThickness: 4,
      }).setOrigin(0.5).setResolution(2)
      const label = this.add.text(0, 23, 'concluído', {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '12px', color: '#ffffff',
      }).setOrigin(0.5).setResolution(2)
      item.add([badge, number, label])
      return item
    })

    const createFinalButton = (x: number, label: string, color: number, stroke: string, onClick: () => void) => {
      const button = this.add.container(x, 138)
      const buttonShadow = this.add.graphics()
      buttonShadow.fillStyle(0x000000, 0.16)
      buttonShadow.fillRoundedRect(-128, -20, 256, 48, 24)
      const buttonBg = this.add.graphics()
      buttonBg.fillStyle(color, 1)
      buttonBg.fillRoundedRect(-132, -26, 264, 52, 26)
      buttonBg.lineStyle(4, 0xffffff, 1)
      buttonBg.strokeRoundedRect(-132, -26, 264, 52, 26)
      const buttonText = this.add.text(0, 0, label, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '20px', color: '#ffffff',
        stroke, strokeThickness: 3,
      }).setOrigin(0.5).setResolution(2)
      button.add([buttonShadow, buttonBg, buttonText])

      const buttonHitbox = this.add.zone(640 + x, 360 + 138, 264, 58)
      buttonHitbox.setDepth(452).setInteractive({ useHandCursor: true })
      buttonHitbox.on('pointerover', () => {
        this.tweens.add({ targets: button, scale: 1.04, duration: 90, ease: 'Sine.easeOut' })
      })
      buttonHitbox.on('pointerout', () => {
        this.tweens.add({ targets: button, scale: 1, duration: 90, ease: 'Sine.easeOut' })
      })
      buttonHitbox.on('pointerdown', () => {
        this.playTick()
        onClick()
      })
      return { button, buttonHitbox }
    }

    const playAgain = createFinalButton(-142, 'Jogar novamente', 0x42d640, '#1b7d1c', () => {
      this.scene.restart({ level: 1, points: 0, lives: 1 })
    })
    const exitBtn = createFinalButton(142, 'Voltar aos jogos', 0xf57c00, '#9a3f00', () => {
      EventBus.emit('exit-game')
    })

    const sparkles = Array.from({ length: 14 }, (_, i) => {
      const sp = this.add.graphics()
      const x = Phaser.Math.Between(-278, 278)
      const y = Phaser.Math.Between(-168, 158)
      sp.fillStyle([0x38bdf8, 0xff8a2a, 0x42d640][i % 3], 0.9)
      sp.fillCircle(x, y, Phaser.Math.Between(4, 8))
      this.tweens.add({
        targets: sp, alpha: { from: 0.35, to: 1 }, scale: { from: 0.8, to: 1.35 },
        duration: 520 + i * 30, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      })
      return sp
    })

    panel.add([shadow, bg, ribbon, ...sparkles, title, subtitle, ...levelLabels, playAgain.button, exitBtn.button])
    panel.setScale(0.88).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
  }

  private showGameOverScreen() {
    this.input.enabled = true
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x3e2723, 0.60).setDepth(450)
    )
    overlay.setInteractive()

    const panel = this.addOverlayObject(this.add.container(640, 360).setDepth(451))

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -166, 540, 330, 28)

    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -178, 556, 332, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -178, 556, 332, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xef4444, 1)
    topBar.fillRoundedRect(-196, -194, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -194, 392, 28, 14)

    const icon = this.add.text(0, -112, '❌', { fontSize: '54px' }).setOrigin(0.5)

    const title = this.add.text(0, -50, 'Que pena!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#3e2723',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const reasonTxt = this.add.text(0, 6, '3 planos errados seguidos!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '20px', color: '#ef4444',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const statsTxt = this.add.text(0, 52, `${this.currentChallengeIndex} de ${this.levelConfig.challenges.length} planos concluídos`, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 440 },
    }).setOrigin(0.5).setResolution(2)

    const retryBtn = this.createModalButton(-140, 118, '🔄 Tentar novamente', 0x42d640, () => {
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    })
    const exitBtn = this.createModalButton(140, 118, 'Sair', 0xf57c00, () => {
      EventBus.emit('exit-game')
    })

    panel.add([shadow, bg, topBar, icon, title, reasonTxt, statsTxt, retryBtn, exitBtn])
    panel.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  HELPERS DE MODAL
  // ══════════════════════════════════════════════════════════════════════════

  private createModalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
    const button = this.add.container(x, y)
    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-124, -24, 248, 48, 24)
    bg.lineStyle(4, 0xffffff, 1)
    bg.strokeRoundedRect(-124, -24, 248, 48, 24)
    const text = this.add.text(0, 0, label, {
      fontSize: '17px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff', stroke: '#0f172a', strokeThickness: 3,
    }).setOrigin(0.5)
    button.add([bg, text])
    button.setSize(256, 68)
    button.setInteractive({ useHandCursor: true })
    button.on('pointerover', () => this.tweens.add({ targets: button, scale: 1.05, duration: 90 }))
    button.on('pointerout', () => this.tweens.add({ targets: button, scale: 1, duration: 90 }))
    button.on('pointerdown', () => { this.playTick(); onClick() })
    return button
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ÁUDIO SINTÉTICO
  // ══════════════════════════════════════════════════════════════════════════

  private getAudioCtx(): AudioContext | null {
    if (this.isMuted) return null
    try {
      return (this.sound as Phaser.Sound.WebAudioSoundManager).context
    } catch {
      return null
    }
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

  private playTick()   { this.playTone(520, 0.04, 'sine', 0.08) }
  private playCorrect() {
    this.playTone(660, 0.08, 'sine', 0.15)
    this.time.delayedCall(100, () => this.playTone(880, 0.08, 'sine', 0.12))
  }
  private playError()  { this.playTone(330, 0.20, 'square', 0.15) }
  private playFanfare() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.time.delayedCall(i * 125, () => this.playTone(f, 0.22, 'sine', 0.32)),
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
