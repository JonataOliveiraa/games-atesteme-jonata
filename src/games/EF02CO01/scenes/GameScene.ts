import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type {
  FilterAttribute,
  FilterValue,
  LevelConfig,
  Vehicle,
  VehicleAttributes,
  GroupingMission,
  ComparisonPair,
} from '../types'
import { LEVELS } from '../data/levels'
import { vehicleById } from '../data/vehicles'

// ── Constantes de layout ─────────────────────────────────────────────────────

const GAME_ID      = 'hangar-dos-modelos'
const TOP_Y        = 95       // base da UIScene superior
const BOTTOM_Y     = 638      // topo da UIScene inferior
const MID_Y        = (TOP_Y + BOTTOM_Y) / 2

// Zona de veículos (esquerda)
const VEH_AREA_W   = 840
// Painel de filtros (direita)
const PANEL_LEFT_X = 860
const PANEL_W      = 400
//const PANEL_CX     = PANEL_LEFT_X + PANEL_W / 2   // 1060

// Cartão grande (nível 1 e 2)
const CARD_W       = 155
const CARD_H       = 125
const CARD_GAP     = 18

// Cartão pequeno (nível 3, grid 4×3)
const SCARD_W      = 120
const SCARD_H      = 98
const SCARD_GAP    = 12

// ── Tipos internos ────────────────────────────────────────────────────────────

interface VehicleCard {
  container: Phaser.GameObjects.Container
  vehicle: Vehicle
  homeX: number
  homeY: number
}

type MissionPhase =
  | 'intro'
  | 'waiting-filter'
  | 'animating'
  | 'question'
  | 'feedback-ok'
  | 'feedback-err'
  | 'next-mission'
  | 'level-complete'

// ── GameScene ─────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {

  // Dados
  private levelConfig!: LevelConfig
  private currentMissionIndex = 0
  private hits   = 0
  private errors = 0
  private currentPoints = 0
  private currentLives  = 1
  private isMuted = false
  private phase: MissionPhase = 'intro'
  private gameEnded = false
  private shouldShowLevelStart = false
  private missionEffectActive = false

  // Objetos de jogo
  private vehicleCards: VehicleCard[] = []

  // Overlay (modais de fluxo)
  private overlayObjects: Phaser.GameObjects.GameObject[] = []

  // Container destruível entre pares (nível 2)
  private missionLayer?: Phaser.GameObjects.Container

  // UI temporária por missão (destruída ao avançar)
  private filterPanelContainer?: Phaser.GameObjects.Container
  private instructionBanner?: Phaser.GameObjects.Container
  private questionOverlay?: Phaser.GameObjects.Container
  private feedbackBanner?: Phaser.GameObjects.Text

  // Nível 2 — comparação
  private comparisonAnswers = new Map<string, boolean | null>()
  private comparisonBtns    = new Map<string, {
    igualBtn:     Phaser.GameObjects.Container
    diferenteBtn: Phaser.GameObjects.Container
  }>()

  // Timer (padrão EF01CO03)
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

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.levelConfig         = LEVELS.find((l) => l.level === lvl) ?? LEVELS[0]
    this.currentMissionIndex = 0
    this.hits                = 0
    this.errors              = 0
    this.currentPoints       = data?.points ?? 0
    this.currentLives        = data?.lives  ?? 1
    this.isMuted             = false
    this.phase               = 'intro'
    this.gameEnded           = false
    this.shouldShowLevelStart = data?.showLevelStart ?? false
    this.missionEffectActive = false
    this.vehicleCards        = []
    this.overlayObjects      = []
    this.comparisonAnswers.clear()
    this.comparisonBtns.clear()
    this.timerActive      = false
    this.timerWarned      = false
    this.timerState.progress = 1
    this.warningBeepTimer = null
  }

  create() {
    this.drawBackground()
    this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.broadcastMissionState()
    this.emitCheckpoint()

    switch (this.levelConfig.level) {
      case 1: this.startLevel1(); break
      case 2: this.startLevel2(); break
      case 3: this.startLevel3(); break
    }

    if (this.shouldShowLevelStart && this.levelConfig.level > 1) {
      this.showNextLevelStartScreen()
    } else {
      this.startTimer()
    }
  }

  update(_time: number, _delta: number) {
    // timer is tween-driven — no per-frame update needed
  }

  shutdown() {
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
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
  //  TIMER (padrão EF01CO06)
  // ══════════════════════════════════════════════════════════════════════════

  private createTimerBar() {
    const barX = 200, barY = 106, barW = 880, barH = 24

    const bg = this.add.graphics()
    bg.fillStyle(0xdff2bc, 1)
    bg.fillRoundedRect(barX, barY, barW, barH, 12)
    bg.setDepth(6)

    this.timeBarFill = this.add.graphics()
    this.timeBarFill.setDepth(7)
    this.drawTimeBar(1)
  }

  private drawTimeBar(progress: number) {
    if (!this.timeBarFill) return
    const barX = 200, barY = 106, barW = 880, barH = 24
    this.timeBarFill.clear()
    this.timeBarFill.fillStyle(0x7ed321, 1)
    const w = barW * Phaser.Math.Clamp(progress, 0, 1)
    if (w > 0) this.timeBarFill.fillRoundedRect(barX, barY, w, barH, 12)
  }

  private startTimer() {
    this.timerState.progress = 1
    this.timerActive = true
    this.timerWarned = false
    this.drawTimeBar(1)

    this.timerTween = this.tweens.add({
      targets:  this.timerState,
      progress: 0,
      duration: this.levelConfig.timeLimit * 1000,
      ease:     'Linear',
      onUpdate: () => {
        this.drawTimeBar(this.timerState.progress)
        if (!this.timerWarned && this.timerState.progress <= 0.25) {
          this.timerWarned = true
          this.startWarningBeeps()
        }
      },
      onComplete: () => {
        this.drawTimeBar(0)
        this.onTimeUp()
      },
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
    this.gameEnded   = true
    this.timerActive = false
    this.drawTimeBar(0)
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.input.enabled    = false

    runtimeGameBridge.emit({
      type:         'WRONG_ANSWER',
      gameId:       GAME_ID,
      pointsEarned: 0,
      stage:        this.levelConfig.level,
    })
    this.showGameOverScreen('timeout')
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  BROADCAST PARA UISCENE
  // ══════════════════════════════════════════════════════════════════════════

  private broadcastMissionState() {
    const lvl = this.levelConfig.level
    const idx = this.currentMissionIndex
    const total = (this.levelConfig.filterMissions?.length)
      ?? (this.levelConfig.comparisonPairs?.length)
      ?? (this.levelConfig.groupingMissions?.length)
      ?? 1

    let instruction = ''
    let hint = ''

    if (lvl === 1 && this.levelConfig.filterMissions) {
      const m = this.levelConfig.filterMissions[idx]
      instruction = m?.instruction ?? ''
      hint        = m?.question    ?? ''
    } else if (lvl === 2) {
      instruction = '🔍  Compare os dois veículos!'
      hint        = 'Marque IGUAL ou DIFERENTE para cada atributo.'
    } else if (lvl === 3 && this.levelConfig.groupingMissions) {
      const m = this.levelConfig.groupingMissions[idx]
      instruction = m?.instruction ?? ''
      hint        = m?.question    ?? ''
    }

    EventBus.emit('mission-update', {
      instruction,
      hint,
      missionIndex:  idx,
      totalMissions: total,
      level:         lvl,
    })
  }

  private emitCheckpoint() {
    const total = (this.levelConfig.filterMissions?.length)
      ?? (this.levelConfig.comparisonPairs?.length)
      ?? (this.levelConfig.groupingMissions?.length)
      ?? 1

    runtimeGameBridge.emit({
      type:     'CHECKPOINT',
      gameId:   GAME_ID,
      progress: this.currentMissionIndex / total,
      score:    this.hits * 20,
      stage:    this.levelConfig.level,
      hits:     this.hits,
      errors:   this.errors,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TELAS DE FEEDBACK DE NÍVEL (padrão EF01CO06)
  // ══════════════════════════════════════════════════════════════════════════

  private showMissionCompleteEffect(nextInstruction: string | null, onDone: () => void) {
    if (this.missionEffectActive) return
    this.missionEffectActive = true

    const wasTimerActive = this.timerActive
    this.timerActive = false
    this.timerTween?.pause()

    const resume = () => {
      this.missionEffectActive = false
      if (wasTimerActive) {
        this.timerActive = true
        this.timerTween?.resume()
      }
      onDone()
    }

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56)
      .setDepth(200).setInteractive()

    const modal = this.add.container(640, 360).setDepth(201)

    const shadow = this.add.graphics()
    shadow.fillStyle(0x000000, 0.18)
    shadow.fillRoundedRect(-270, -126, 540, nextInstruction ? 270 : 210, 28)

    const cardH = nextInstruction ? 258 : 198
    const bg = this.add.graphics()
    bg.fillStyle(0xfff6e8, 0.98)
    bg.fillRoundedRect(-278, -138, 556, cardH, 28)
    bg.lineStyle(5, 0xffffff, 0.95)
    bg.strokeRoundedRect(-278, -138, 556, cardH, 28)

    const topBar = this.add.graphics()
    topBar.fillStyle(0xff8a2a, 1)
    topBar.fillRoundedRect(-196, -154, 392, 28, 14)
    topBar.lineStyle(3, 0xffffff, 0.82)
    topBar.strokeRoundedRect(-196, -154, 392, 28, 14)

    const title = this.add.text(0, -76, 'Missão concluída!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '36px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const objs: Phaser.GameObjects.GameObject[] = [shadow, bg, topBar, title]

    if (nextInstruction) {
      const nextLabel = this.add.text(0, -14, 'Próximo desafio:', {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '17px', color: '#f57c00',
      }).setOrigin(0.5).setResolution(2)

      const nextTxt = this.add.text(0, 42, nextInstruction, {
        fontFamily: 'Arial', fontStyle: 'bold',
        fontSize: '20px', color: '#3b3b3b',
        align: 'center', wordWrap: { width: 460 },
      }).setOrigin(0.5).setResolution(2)

      objs.push(nextLabel, nextTxt)
    }

    modal.add(objs)
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

    this.time.delayedCall(nextInstruction ? 2400 : 1800, () => {
      this.tweens.add({
        targets: [overlay, modal], alpha: 0, duration: 280,
        onComplete: () => { overlay.destroy(); modal.destroy(); resume() },
      })
    })
  }

  private showLevelCompleteTransition(nextLevel: 1 | 2 | 3 | null) {
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.56).setDepth(450)
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
      fontSize: '40px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const completed = this.add.text(0, -50, 'Nível concluído', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '26px', color: '#f57c00',
      align: 'center', wordWrap: { width: 420 },
    }).setOrigin(0.5).setResolution(2)

    const successTexts: Record<number, string> = {
      1: 'Você aprendeu a separar veículos que voam e que têm rodas!',
      2: 'Você comparou veículos e identificou semelhanças e diferenças!',
      3: 'Você descobriu o que une cada grupo de veículos!',
    }
    const next = this.add.text(0, 8, successTexts[lvl] ?? '', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '17px', color: '#3b3b3b',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    // Dots de progresso de nível (igual EF01CO03)
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
      fontSize: '15px', color: '#25327a',
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
    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.58)
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
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const info = this.getLevelInfo(lvl)
    const objective = this.add.text(0, -42, info.objective, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '24px', color: '#f57c00',
      align: 'center', wordWrap: { width: 430 },
    }).setOrigin(0.5).setResolution(2)

    const detail = this.add.text(0, 12, info.tip, {
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
      this.startTimer()
    })

    modal.add([shadow, bg, topBar, title, objective, detail, button])
    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
  }

  private showGameCompleteScreen() {
    this.clearOverlay()
    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.62).setDepth(450)
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
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 6,
    }).setOrigin(0.5).setResolution(2)

    const subtitle = this.add.text(0, -74, 'Você explorou todos os veículos do hangar!', {
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
        stroke: '#25327a', strokeThickness: 4,
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

  private showGameOverScreen(reason: 'timeout' | 'wrong-answer' = 'timeout') {
    this.input.enabled = true
    this.clearOverlay()

    const overlay = this.addOverlayObject(
      this.add.rectangle(640, 360, 1280, 720, 0x12324a, 0.60).setDepth(450)
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

    const icon = this.add.text(0, -112, reason === 'timeout' ? '⏱' : '❌', {
      fontSize: '54px',
    }).setOrigin(0.5)

    const title = this.add.text(0, -50, 'Que pena!', {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '38px', color: '#25327a',
      stroke: '#ffffff', strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2)

    const reasonMsg = reason === 'timeout' ? 'O tempo acabou!' : 'Resposta incorreta!'
    const reasonTxt = this.add.text(0, 6, reasonMsg, {
      fontFamily: 'Arial', fontStyle: 'bold',
      fontSize: '22px', color: '#ef4444',
    }).setOrigin(0.5).setResolution(2)

    const total = (this.levelConfig.filterMissions?.length)
      ?? (this.levelConfig.comparisonPairs?.length)
      ?? (this.levelConfig.groupingMissions?.length)
      ?? 1

    const statsTxt = this.add.text(0, 52, `${this.currentMissionIndex} de ${total} missões concluídas`, {
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
  //  FUNDO
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    this.add.image(640, 360, 'hangar-bg').setDisplaySize(1280, 720).setDepth(-1)
    if (this.levelConfig.level !== 2) {
      const g = this.add.graphics()
      g.lineStyle(1, 0x4FC3F7, 0.2)
      g.lineBetween(PANEL_LEFT_X - 10, TOP_Y, PANEL_LEFT_X - 10, BOTTOM_Y)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  NÍVEL 1 — FILTRO BINÁRIO
  // ══════════════════════════════════════════════════════════════════════════

  private startLevel1() {
    this.buildVehicleGrid6()
    this.buildFilterPanel()
    this.showMissionIntro()
  }

  // ── Grid de 6 veículos (3×2) na área esquerda ────────────────────────────

  private buildVehicleGrid6() {
    const ids   = this.levelConfig.vehicleIds   // 6 veículos
    const cols  = 3
    const totalW = cols * (CARD_W + CARD_GAP) - CARD_GAP
    const startX = (VEH_AREA_W - totalW) / 2 + CARD_W / 2  // centra na área
    const startY = 195

    ids.forEach((id, idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      const cx  = startX + col * (CARD_W + CARD_GAP)
      const cy  = startY + row * (CARD_H + CARD_GAP + 20)
      this.vehicleCards.push(this.makeVehicleCard(vehicleById(id), cx, cy))
    })
  }

  private makeVehicleCard(vehicle: Vehicle, cx: number, cy: number): VehicleCard {
    const bg = this.add.image(0, 0, `card-${vehicle.attributes.meio}`)
      .setDisplaySize(CARD_W, CARD_H).setOrigin(0.5)

    const img = this.add.image(0, -10, `veh-${vehicle.id}`).setDisplaySize(76, 76).setOrigin(0.5)

    const nameBg = this.add.graphics()
    nameBg.fillStyle(0x000000, 0.45)
    nameBg.fillRoundedRect(-CARD_W / 2 + 4, CARD_H / 2 - 26, CARD_W - 8, 22, { tl: 0, tr: 0, bl: 12, br: 12 })

    const name = this.add.text(0, CARD_H / 2 - 15, vehicle.name, {
      fontSize: '13px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5)

    const container = this.add.container(cx, cy, [bg, nameBg, img, name])
    container.setSize(CARD_W, CARD_H)
    container.setAlpha(0).setScale(0.72)
    this.tweens.add({
      targets: container, alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.Out',
      delay: this.vehicleCards.length * 70,
    })
    return { container, vehicle, homeX: cx, homeY: cy }
  }

  // ── Painel de filtros ────────────────────────────────────────────────────

  private buildFilterPanel() {
    const mission = this.levelConfig.filterMissions![this.currentMissionIndex]
    const isYes   = mission.filterValue === true

    // Textos e cores por atributo + valor
    const attrCfg: Record<string, { subYes: string; subNo: string; btnYes: string; btnNo: string }> = {
      voa:      { subYes: 'Esse veículo VOA?',       subNo: 'Esse veículo NÃO voa?',       btnYes: '✈️  SIM — Voa!',        btnNo: '🚗  NÃO — Não voa'   },
      temRodas: { subYes: 'Esse veículo tem RODAS?',  subNo: 'Esse veículo NÃO tem rodas?', btnYes: '🔵  SIM — Tem rodas!',   btnNo: '⭕  NÃO — Sem rodas'  },
      temMotor: { subYes: 'Esse veículo tem MOTOR?',  subNo: 'Esse veículo NÃO tem motor?', btnYes: '⚙️  SIM — Tem motor!',   btnNo: '🔇  NÃO — Sem motor'  },
    }
    const cfg      = attrCfg[mission.filterAttribute] ?? attrCfg['voa']
    const subText  = isYes ? cfg.subYes  : cfg.subNo
    const btnLabel = isYes ? cfg.btnYes  : cfg.btnNo
    const btnColor = isYes ? 0x2E7D32   : 0xB71C1C
    const rimColor = isYes ? 0x4FC3F7   : 0xEF9A9A

    const panel = this.add.container(PANEL_LEFT_X, TOP_Y + 35)
    this.filterPanelContainer = panel

    // Fundo do painel
    const bg = this.add.image(PANEL_W / 2, 155, 'panel-filter')
      .setDisplaySize(PANEL_W, 310).setOrigin(0.5)
    panel.add(bg)

    // Cabeçalho
    const hdr = this.add.text(PANEL_W / 2, 28, '🔍  CLASSIFIQUE!', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
    }).setOrigin(0.5, 0)
    panel.add(hdr)

    // Sub-título dinâmico (atributo + valor)
    const sub = this.add.text(PANEL_W / 2, 70, subText, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#90CAF9',
    }).setOrigin(0.5, 0)
    panel.add(sub)

    // Divisor
    const div = this.add.graphics()
    div.lineStyle(1, 0x4FC3F7, 0.25)
    div.lineBetween(20, 104, PANEL_W - 20, 104)
    panel.add(div)

    // Único botão de ação para esta missão
    const btn = this.makeRoundedButton(btnLabel, btnColor, 340, 88, () => {
      if (this.phase !== 'waiting-filter') return
      this.applyFilter(mission.filterAttribute, mission.filterValue)
    })
    btn.setPosition(PANEL_W / 2, 180)
    panel.add(btn)

    // Dica discreta
    const hint = this.add.text(PANEL_W / 2, 250, '👆 Clique no botão para agrupar', {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#607D8B',
      align: 'center',
    }).setOrigin(0.5, 0)
    panel.add(hint)
  }

  // ── Banner de instrução da missão ────────────────────────────────────────

  private showMissionIntro() {
    this.instructionBanner?.destroy()
    this.instructionBanner = undefined

    // Reconstrói o painel para a missão atual (botão e texto corretos)
    this.filterPanelContainer?.destroy()
    this.filterPanelContainer = undefined
    this.buildFilterPanel()

    // UIScene já exibe instrução e dica via mission-update.
    const delay = this.vehicleCards.length * 70 + 200
    this.time.delayedCall(delay, () => { this.phase = 'waiting-filter' })
  }

  // ── Aplicar filtro ───────────────────────────────────────────────────────

  private applyFilter(attribute: FilterAttribute, value: FilterValue | null) {
    this.phase = 'animating'

    if (value === null) {
      // "Mostrar todos" → volta para posições originais
      this.vehicleCards.forEach((card) => {
        this.tweens.add({
          targets: card.container,
          x: card.homeX, y: card.homeY,
          alpha: 1, scaleX: 1, scaleY: 1,
          duration: 400, ease: 'Quad.Out',
        })
      })
      this.time.delayedCall(450, () => { this.phase = 'waiting-filter' })
      return
    }

    // Separa matching e non-matching
    const matching:    VehicleCard[] = []
    const nonMatching: VehicleCard[] = []

    this.vehicleCards.forEach((card) => {
      const attrVal = card.vehicle.attributes[attribute as keyof VehicleAttributes]
      ;(attrVal === value ? matching : nonMatching).push(card)
    })

    // Zona superior → matching (destaque)
    const MATCH_START_X = 95
    const MATCH_Y       = 205
    const MATCH_COLS    = 3

    matching.forEach((card, i) => {
      const col = i % MATCH_COLS
      const row = Math.floor(i / MATCH_COLS)
      const tx  = MATCH_START_X + col * (CARD_W + 10)
      const ty  = MATCH_Y + row * (CARD_H + 10)

      this.tweens.add({
        targets: card.container,
        x: tx, y: ty, alpha: 1, scaleX: 1.05, scaleY: 1.05,
        duration: 550, ease: 'Quad.Out',
      })
    })

    // Non-matching → desloca para baixo e esmaece
    const NM_START_X = 95
    const NM_Y       = 490
    nonMatching.forEach((card, i) => {
      const col = i % MATCH_COLS
      const tx  = NM_START_X + col * (CARD_W + 10)

      this.tweens.add({
        targets: card.container,
        x: tx, y: NM_Y, alpha: 0.25, scaleX: 0.78, scaleY: 0.78,
        duration: 480, ease: 'Quad.Out',
      })
    })

    // Zona de destaque (quadrado verde ao redor dos matching)
    this.drawGroupZone(matching.length, MATCH_Y)

    // Aguarda animação → exibe pergunta MCQ
    this.time.delayedCall(680, () => {
      const mission = this.levelConfig.filterMissions![this.currentMissionIndex]
      this.showCountQuestion(mission.question, mission.expectedCount)
    })
  }

  private drawGroupZone(count: number, topY: number) {
    if (count === 0) return
    const cols  = Math.min(count, 3)
    const rows  = Math.ceil(count / 3)
    const zoneW = cols * (CARD_W + 10) + 20
    const zoneH = rows * (CARD_H + 10) + 20
    const zx    = 85
    const zy    = topY - 16

    const zone = this.add.graphics()
    zone.fillStyle(0x1B5E20, 0.12)
    zone.fillRoundedRect(zx, zy, zoneW, zoneH, 16)
    zone.lineStyle(2, 0x66BB6A, 0.55)
    zone.strokeRoundedRect(zx, zy, zoneW, zoneH, 16)

    // Destrói após a questão ser respondida
    this.time.delayedCall(5000, () => zone.destroy())
  }

  // ── Pergunta MCQ de contagem ─────────────────────────────────────────────

  private showCountQuestion(question: string, correct: number) {
    this.questionOverlay?.destroy()
    this.phase = 'question'

    const CX     = VEH_AREA_W / 2
    const CY     = BOTTOM_Y - 72
    const overlay = this.add.container(CX, CY)
    this.questionOverlay = overlay

    // Fundo da pergunta
    const bg = this.add.graphics()
    bg.fillStyle(0x071320, 0.97)
    bg.fillRoundedRect(-380, -60, 760, 120, 18)
    bg.lineStyle(2, 0x4FC3F7, 0.65)
    bg.strokeRoundedRect(-380, -60, 760, 120, 18)
    overlay.add(bg)

    // Texto da pergunta
    const qTxt = this.add.text(0, -28, `❓  ${question}`, {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
    }).setOrigin(0.5)
    overlay.add(qTxt)

    // Opções MCQ
    const options = this.buildCountOptions(correct, this.levelConfig.vehicleIds.length)
    const spacing = 150
    options.forEach((opt, i) => {
      const isCorrect = opt === correct
      const bx = (i - 1) * spacing
      const btn = this.makeMCQButton(String(opt), () => this.answerCount(isCorrect))
      btn.setPosition(bx, 28)
      overlay.add(btn)
    })

    overlay.setAlpha(0)
    this.tweens.add({ targets: overlay, alpha: 1, duration: 280 })
  }

  private buildCountOptions(correct: number, total: number): number[] {
    const candidates = new Set([correct])
    const tries = [correct + 1, correct - 1, correct + 2, correct - 2]
    for (const c of tries) {
      if (c >= 1 && c <= total && candidates.size < 3) candidates.add(c)
    }
    return Phaser.Utils.Array.Shuffle([...candidates]).slice(0, 3) as number[]
  }

  private answerCount(correct: boolean) {
    if (this.phase !== 'question') return
    this.questionOverlay?.disableInteractive()
    this.questionOverlay?.getAll<Phaser.GameObjects.Container>().forEach((c) => {
      if (c.setInteractive) c.disableInteractive()
    })

    if (correct) {
      this.onCorrect()
    } else {
      this.onWrong()
    }
  }

  // ── Acerto / Erro ─────────────────────────────────────────────────────────

  private onCorrect() {
    if (this.gameEnded) return
    this.hits++
    this.phase = 'feedback-ok'
    this.playHit()
    this.showFeedback('✅  Muito bem!', 0x1B5E20)

    runtimeGameBridge.emit({
      type:         'CORRECT_ANSWER',
      gameId:       GAME_ID,
      pointsEarned: 20,
      stage:        this.levelConfig.level,
    })

    this.time.delayedCall(900, () => {
      this.questionOverlay?.destroy()
      this.questionOverlay = undefined
      this.feedbackBanner?.destroy()
      this.feedbackBanner = undefined
      this.advanceMissionWithEffect()
    })
  }

  private onWrong() {
    if (this.gameEnded) return
    this.gameEnded   = true
    this.timerActive = false
    this.timerTween?.stop()
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null

    this.errors++
    this.phase = 'feedback-err'
    this.playMiss()
    this.showFeedback('❌  Resposta incorreta!', 0x7F0000)

    runtimeGameBridge.emit({
      type:         'WRONG_ANSWER',
      gameId:       GAME_ID,
      pointsEarned: 0,
      stage:        this.levelConfig.level,
    })

    // Shake no overlay MCQ (nível 1 e 3)
    if (this.questionOverlay) {
      this.tweens.add({
        targets:  this.questionOverlay,
        x:        this.questionOverlay.x - 8,
        duration: 55, yoyo: true, repeat: 4,
      })
    }

    this.time.delayedCall(1200, () => {
      this.feedbackBanner?.destroy()
      this.feedbackBanner = undefined
      this.showGameOverScreen('wrong-answer')
    })
  }

  private enableOverlayButtons() {
    this.questionOverlay?.getAll<Phaser.GameObjects.Container>().forEach((child) => {
      if (child instanceof Phaser.GameObjects.Container && child.input) {
        child.setInteractive({ useHandCursor: true })
      }
    })
  }

  private showFeedback(msg: string, bgColor: number) {
    this.feedbackBanner?.destroy()
    const txt = this.add.text(VEH_AREA_W / 2, TOP_Y + 80, msg, {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color:    '#FFFFFF',
      backgroundColor: `#${bgColor.toString(16).padStart(6, '0')}cc`,
      padding:  { x: 24, y: 12 },
    }).setOrigin(0.5).setDepth(200).setAlpha(0)

    this.feedbackBanner = txt
    this.tweens.add({ targets: txt, y: TOP_Y + 60, alpha: 1, duration: 250 })
  }

  // ── Progressão de missões ────────────────────────────────────────────────

  private advanceMissionWithEffect() {
    const missions =
      this.levelConfig.filterMissions
      ?? this.levelConfig.comparisonPairs
      ?? this.levelConfig.groupingMissions
      ?? []

    const nextIndex = this.currentMissionIndex + 1
    const isLast    = nextIndex >= missions.length

    // Instrução da próxima missão (se houver)
    let nextInstruction: string | null = null
    if (!isLast) {
      const next = missions[nextIndex]
      nextInstruction = (next as { instruction?: string })?.instruction ?? null
    }

    this.showMissionCompleteEffect(isLast ? null : nextInstruction, () => {
      this.currentMissionIndex++
      if (this.currentMissionIndex >= missions.length) {
        this.endLevel()
        return
      }

      this.emitCheckpoint()
      this.broadcastMissionState()
      this.phase = 'next-mission'

      // Reset cards para posição home
      this.vehicleCards.forEach((card, i) => {
        this.tweens.add({
          targets: card.container,
          x: card.homeX, y: card.homeY,
          alpha: 1, scaleX: 1, scaleY: 1,
          duration: 380, ease: 'Quad.Out',
          delay: i * 40,
        })
      })

      this.time.delayedCall(500, () => {
        switch (this.levelConfig.level) {
          case 1: this.showMissionIntro();    break
          case 2: this.nextComparisonPair();  break
          case 3: this.nextGroupingMission(); break
        }
      })
    })
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.playFanfare()

    runtimeGameBridge.emit({
      type:  'GAME_COMPLETED',
      gameId: GAME_ID,
      stage:  this.levelConfig.level,
    })

    const nextLevel = this.levelConfig.level < 3
      ? (this.levelConfig.level + 1) as 1 | 2 | 3
      : null

    this.showLevelCompleteTransition(nextLevel)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  NÍVEL 2 — COMPARAÇÃO LADO A LADO
  // ══════════════════════════════════════════════════════════════════════════

  private startLevel2() {
    this.renderComparisonPair(this.levelConfig.comparisonPairs![0])
  }

  private nextComparisonPair() {
    this.vehicleCards.forEach((c) => c.container.destroy())
    this.vehicleCards = []
    this.comparisonAnswers.clear()
    this.comparisonBtns.clear()
    this.missionLayer?.destroy()
    this.missionLayer = undefined

    this.time.delayedCall(80, () => {
      this.renderComparisonPair(
        this.levelConfig.comparisonPairs![this.currentMissionIndex],
      )
    })
  }

  private renderComparisonPair(pair: ComparisonPair) {
    // TODOS os objetos do par vão para missionLayer para que nextComparisonPair()
    // destrua tudo com um único missionLayer.destroy()
    const layer = this.add.container(0, 0)
    this.missionLayer = layer

    const vA = vehicleById(pair.vehicleAId)
    const vB = vehicleById(pair.vehicleBId)

    // Instrução
    const instr = this.add.text(640, TOP_Y + 50,
      `🔍  Compare ${vA.name} e ${vB.name} — são iguais ou diferentes em cada item?`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 3,
      wordWrap: { width: 1100 },
      align: 'center',
    }).setOrigin(0.5, 0)
    layer.add(instr)

    // "VS" pulsante no centro
    const vs = this.add.text(640, MID_Y - 110, 'VS', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)
    this.tweens.add({ targets: vs, scaleX: 1.1, scaleY: 1.1, yoyo: true, repeat: -1, duration: 750 })
    layer.add(vs)

    // Cartões grandes dos veículos — retornam objetos para o layer
    this.buildLargeCard(vA, 200, MID_Y, layer)
    this.buildLargeCard(vB, 1080, MID_Y, layer)

    // Tabela de atributos
    const attrStartY = MID_Y - 90
    const rowH       = 82

    pair.attributes.forEach((attr, i) => {
      this.buildComparisonRow(attr, vA, vB, 640, attrStartY + i * rowH, layer)
    })

    // Botão confirmar — guarda contra cliques durante animação ou game over
    const confirm = this.makeRoundedButton('✔  Confirmar', 0x1565C0, 260, 72, () => {
      if (this.gameEnded || this.phase === 'feedback-ok' || this.phase === 'animating') return
      this.confirmComparison(vA, vB, pair.attributes)
    })
    confirm.setPosition(640, attrStartY + pair.attributes.length * rowH + 40)
    layer.add(confirm)

    // Entrada com fade
    layer.setAlpha(0)
    this.tweens.add({ targets: layer, alpha: 1, duration: 350 })
  }

  private buildLargeCard(vehicle: Vehicle, cx: number, cy: number, layer: Phaser.GameObjects.Container) {
    const W = 190, H = 185

    const bg = this.add.image(cx, cy, `card-${vehicle.attributes.meio}`)
      .setDisplaySize(W, H).setOrigin(0.5)

    const img = this.add.image(cx, cy - 20, `veh-${vehicle.id}`).setDisplaySize(110, 110).setOrigin(0.5)
    const name = this.add.text(cx, cy + 66, vehicle.name, {
      fontSize: '18px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5)

    layer.add([bg, img, name])
  }

  private buildComparisonRow(
    attr: FilterAttribute,
    vA:   Vehicle,
    vB:   Vehicle,
    cx:   number,
    cy:   number,
    layer: Phaser.GameObjects.Container,
  ) {
    const labels: Record<FilterAttribute, string> = {
      voa:      '✈️  Voa?',
      temRodas: '🔵  Tem rodas?',
      temMotor: '⚙️  Tem motor?',
      meio:     '🗺️  Meio de transporte',
    }

    const rowBg = this.add.graphics()
    rowBg.fillStyle(0x0D2137, 0.7)
    rowBg.fillRoundedRect(cx - 280, cy - 36, 560, 72, 10)
    rowBg.lineStyle(1, 0x37474F, 0.6)
    rowBg.strokeRoundedRect(cx - 280, cy - 36, 560, 72, 10)

    const labelTxt = this.add.text(cx, cy, labels[attr], {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#B0BEC5',
    }).setOrigin(0.5)

    const igualBtn     = this.makeOptionButton('IGUAL',     0x1B5E20, () => this.selectAnswer(attr, true))
    const diferenteBtn = this.makeOptionButton('DIFERENTE', 0x7F0000, () => this.selectAnswer(attr, false))

    igualBtn.setPosition(cx - 210, cy)
    diferenteBtn.setPosition(cx + 210, cy)

    this.comparisonAnswers.set(attr, null)
    this.comparisonBtns.set(attr, { igualBtn, diferenteBtn })

    layer.add([rowBg, labelTxt, igualBtn, diferenteBtn])
  }

  private makeOptionButton(label: string, color: number, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)
    const W = 150, H = 60

    const bg = this.add.graphics()
    bg.fillStyle(color, 0.5)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 10)
    bg.lineStyle(2, 0xFFFFFF, 0.2)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 10)

    const txt = this.add.text(0, 0, label, {
      fontSize: '17px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5)

    container.add([bg, txt])
    container.setSize(W, H)
    container.setInteractive({ useHandCursor: true })
    container.on('pointerdown', () => { this.playTick(); onClick() })
    return container
  }

  private selectAnswer(attr: FilterAttribute, isIgual: boolean) {
    this.comparisonAnswers.set(attr, isIgual)

    const btns = this.comparisonBtns.get(attr)
    if (!btns) return

    const redraw = (btn: Phaser.GameObjects.Container, active: boolean, color: number) => {
      const bg = btn.getAt(0) as Phaser.GameObjects.Graphics
      bg.clear()
      const W = 150, H = 60
      bg.fillStyle(color, active ? 1 : 0.3)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 10)
      bg.lineStyle(active ? 3 : 1, 0xFFFFFF, active ? 0.9 : 0.15)
      bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 10)
      if (active) {
        this.tweens.add({ targets: btn, scaleX: 1.08, scaleY: 1.08, yoyo: true, duration: 120 })
      }
    }

    redraw(btns.igualBtn,     isIgual,  0x1B5E20)
    redraw(btns.diferenteBtn, !isIgual, 0x7F0000)
    this.playTick()
  }

  private confirmComparison(vA: Vehicle, vB: Vehicle, attrs: FilterAttribute[]) {
    // Verifica se respondeu tudo
    const unanswered = attrs.filter((a) => this.comparisonAnswers.get(a) === null)
    if (unanswered.length > 0) {
      this.showToast('Responda todas as características! 😊', 0xF57F17)
      return
    }

    let allCorrect = true
    attrs.forEach((attr) => {
      const valA     = vA.attributes[attr as keyof VehicleAttributes]
      const valB     = vB.attributes[attr as keyof VehicleAttributes]
      const realIgual = valA === valB
      if (this.comparisonAnswers.get(attr) !== realIgual) allCorrect = false
    })

    if (allCorrect) {
      this.onCorrect()
    } else {
      // Shake dos botões errados antes de chamar onWrong()
      attrs.forEach((attr) => {
        const valA      = vA.attributes[attr as keyof VehicleAttributes]
        const valB      = vB.attributes[attr as keyof VehicleAttributes]
        const realIgual = valA === valB
        if (this.comparisonAnswers.get(attr) !== realIgual) {
          const btns = this.comparisonBtns.get(attr)
          if (btns) {
            const wrongBtn = realIgual ? btns.diferenteBtn : btns.igualBtn
            this.tweens.add({ targets: wrongBtn, x: wrongBtn.x - 6, duration: 50, yoyo: true, repeat: 5 })
          }
        }
      })
      this.onWrong()
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  NÍVEL 3 — DESCOBERTA DO ATRIBUTO
  // ══════════════════════════════════════════════════════════════════════════

  private startLevel3() {
    this.renderGroupingMission(this.levelConfig.groupingMissions![0])
  }

  private nextGroupingMission() {
    this.vehicleCards.forEach((c) => c.container.destroy())
    this.vehicleCards = []
    this.renderGroupingMission(
      this.levelConfig.groupingMissions![this.currentMissionIndex],
    )
  }

  private renderGroupingMission(mission: GroupingMission) {
    const ids = this.levelConfig.vehicleIds  // 12 veículos

    // Grid 4×3 de cartões pequenos (zona esquerda)
    const COLS  = 4
    const START_X = 40
    const START_Y = TOP_Y + 60

    ids.forEach((id, idx) => {
      const col = idx % COLS
      const row = Math.floor(idx / COLS)
      const cx  = START_X + col * (SCARD_W + SCARD_GAP) + SCARD_W / 2
      const cy  = START_Y + row * (SCARD_H + SCARD_GAP) + SCARD_H / 2

      const vehicle  = vehicleById(id)
      const attrVal  = vehicle.attributes[mission.highlightAttribute as keyof VehicleAttributes]
      const isMatch  = attrVal === mission.highlightValue

      this.vehicleCards.push(this.makeSmallCard(vehicle, cx, cy, isMatch))
    })

    // Instrução
    this.add.text(START_X + (COLS * (SCARD_W + SCARD_GAP)) / 2, TOP_Y + 40,
      `💬  ${mission.instruction}`, {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFDE7',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5, 0)

    // Painel da pergunta (direita)
    this.time.delayedCall(1300, () => this.showGroupingQuestion(mission))
  }

  private makeSmallCard(vehicle: Vehicle, cx: number, cy: number, highlight: boolean): VehicleCard {
    const scale = SCARD_W / CARD_W

    const bg = this.add.image(0, 0, `card-${vehicle.attributes.meio}`)
      .setDisplaySize(CARD_W, CARD_H).setOrigin(0.5)

    const img = this.add.image(0, -10, `veh-${vehicle.id}`).setDisplaySize(76, 76).setOrigin(0.5)

    const nameBg = this.add.graphics()
    nameBg.fillStyle(0x000000, 0.45)
    nameBg.fillRoundedRect(-CARD_W / 2 + 4, CARD_H / 2 - 26, CARD_W - 8, 22, { tl: 0, tr: 0, bl: 12, br: 12 })

    const name = this.add.text(0, CARD_H / 2 - 15, vehicle.name, {
      fontSize: '13px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5)

    const container = this.add.container(cx, cy, [bg, nameBg, img, name])
    container.setSize(CARD_W, CARD_H)
    container.setScale(scale)

    if (highlight) {
      const glow = this.add.graphics()
      glow.lineStyle(4 / scale, 0xFFD700, 1)
      glow.strokeRoundedRect(-CARD_W / 2 - 8, -CARD_H / 2 - 8, CARD_W + 16, CARD_H + 16, 22)
      container.addAt(glow, 0)
      this.tweens.add({
        targets: container,
        scaleX: scale * 1.06, scaleY: scale * 1.06,
        yoyo: true, repeat: -1, duration: 850, ease: 'Sine.InOut',
      })
    }

    container.setAlpha(0)
    this.tweens.add({
      targets: container, alpha: highlight ? 1 : 0.45,
      duration: 280, delay: this.vehicleCards.length * 40,
    })
    return { container, vehicle, homeX: cx, homeY: cy }
  }

  private showGroupingQuestion(mission: GroupingMission) {
    this.questionOverlay?.destroy()
    this.phase = 'question'

    const PX    = PANEL_LEFT_X
    const PY    = TOP_Y + 35
    const PH    = BOTTOM_Y - TOP_Y - 35

    const overlay = this.add.container(0, 0)
    this.questionOverlay = overlay

    // Fundo do painel
    const bg = this.add.graphics()
    bg.fillStyle(0x081524, 0.96)
    bg.fillRoundedRect(PX, PY, PANEL_W, PH, 20)
    bg.lineStyle(2, 0xFFD700, 0.6)
    bg.strokeRoundedRect(PX, PY, PANEL_W, PH, 20)
    overlay.add(bg)

    // Pergunta
    const qTxt = this.add.text(PX + PANEL_W / 2, PY + 40, `🔍  ${mission.question}`, {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      wordWrap: { width: PANEL_W - 40 },
      align: 'center',
    }).setOrigin(0.5, 0)
    overlay.add(qTxt)

    // Dica visual — destaque amarelo
    const hint = this.add.text(PX + PANEL_W / 2, PY + 110, 'Os veículos com borda\ndourada foram agrupados.\nO que eles têm em comum?', {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#90CAF9',
      align: 'center',
    }).setOrigin(0.5, 0)
    overlay.add(hint)

    // Opções 2×2
    const optW = PANEL_W - 40
    const optH = 58
    const optGap = 12
    const optStartY = PY + 185

    mission.options.forEach((opt, i) => {
      const row = Math.floor(i / 2)
      const col = i % 2
      const ox  = PX + 20 + col * ((optW / 2) + optGap / 2)
      const oy  = optStartY + row * (optH + optGap)
      const isCorrect = i === mission.correctOptionIndex

      const btn = this.makeGroupOptionButton(opt.label, isCorrect, optW / 2 - 6, 72, () => {
        if (this.phase !== 'question') return
        overlay.getAll<Phaser.GameObjects.Container>().forEach((c) => {
          if (c instanceof Phaser.GameObjects.Container) c.disableInteractive()
        })
        if (isCorrect) this.onCorrect()
        else           this.onWrong()
      })
      btn.setPosition(ox + (optW / 2 - 6) / 2, oy + optH / 2)
      overlay.add(btn)
    })

    overlay.setAlpha(0)
    this.tweens.add({ targets: overlay, alpha: 1, duration: 380 })
  }

  private makeGroupOptionButton(
    label: string,
    _isCorrect: boolean,
    W: number, H: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    const bg = this.add.graphics()
    bg.fillStyle(0x1565C0, 0.9)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
    bg.lineStyle(2, 0x90CAF9, 0.4)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 12)

    const txt = this.add.text(0, 0, label, {
      fontSize: '15px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      wordWrap: { width: W - 16 },
      align: 'center',
    }).setOrigin(0.5)

    container.add([bg, txt])
    container.setSize(W, H)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x1E88E5, 1)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
      bg.lineStyle(2, 0xE3F2FD, 0.8)
      bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 12)
    })
    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x1565C0, 0.9)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
      bg.lineStyle(2, 0x90CAF9, 0.4)
      bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 12)
    })
    container.on('pointerdown', () => { this.playTick(); onClick() })

    return container
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  UTILITÁRIOS DE UI
  // ══════════════════════════════════════════════════════════════════════════

  private makeRoundedButton(
    label: string,
    color: number,
    W: number, H: number,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    const bg = this.add.graphics()
    bg.fillStyle(color, 0.9)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 14)
    bg.lineStyle(2, 0xFFFFFF, 0.25)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 14)

    const txt = this.add.text(0, 0, label, {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5)

    container.add([bg, txt])
    container.setSize(W, H)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 110 })
      bg.clear()
      bg.fillStyle(Phaser.Display.Color.IntegerToColor(color).brighten(20).color, 1)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 14)
    })
    container.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 110 })
      bg.clear()
      bg.fillStyle(color, 0.9)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 14)
    })
    container.on('pointerdown', () => { this.playTick(); onClick() })

    return container
  }

  private makeMCQButton(label: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)
    const W = 120, H = 76

    const bg = this.add.graphics()
    bg.fillStyle(0x0D47A1, 1)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
    bg.lineStyle(2, 0x90CAF9, 0.5)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 12)

    const txt = this.add.text(0, 0, label, {
      fontSize: '34px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
    }).setOrigin(0.5)

    container.add([bg, txt])
    container.setSize(W, H)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerover', () => {
      bg.clear()
      bg.fillStyle(0x1565C0, 1)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
    })
    container.on('pointerout', () => {
      bg.clear()
      bg.fillStyle(0x0D47A1, 1)
      bg.fillRoundedRect(-W / 2, -H / 2, W, H, 12)
    })
    container.on('pointerdown', () => { this.playTick(); onClick() })

    return container
  }

  private showToast(message: string, color: number) {
    const toast = this.add.text(640, BOTTOM_Y - 30, message, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      backgroundColor: `#${color.toString(16).padStart(6, '0')}cc`,
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setDepth(250).setAlpha(0)

    this.tweens.add({
      targets: toast, alpha: 1,
      duration: 200, yoyo: true, hold: 1800,
      onComplete: () => toast.destroy(),
    })
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

  private getLevelInfo(lvl: number): { objective: string; tip: string } {
    if (lvl === 2) return {
      objective: 'Compare dois veículos e descubra semelhanças e diferenças.',
      tip: 'Marque IGUAL ou DIFERENTE para cada característica.',
    }
    return {
      objective: 'Descubra o que os veículos destacados têm em comum.',
      tip: 'Observe os veículos com borda dourada e escolha a resposta.',
    }
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

  private playTick()   { this.playTone(880, 0.07, 'sine', 0.12) }
  private playHit()    {
    this.playTone(523, 0.11, 'sine', 0.28)
    this.time.delayedCall(120, () => this.playTone(659, 0.11, 'sine', 0.28))
    this.time.delayedCall(240, () => this.playTone(784, 0.18, 'sine', 0.28))
  }
  private playMiss()   { this.playTone(200, 0.32, 'sawtooth', 0.28) }
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
