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
  private missionEffectActive = false

  // Objetos de jogo
  private vehicleCards: VehicleCard[] = []

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

  // Timer (padrão EF01CO06)
  private timerBar!: Phaser.GameObjects.Rectangle
  private timeLeft = 0
  private timerActive = false
  private timerWarned = false
  private warningBeepTimer: Phaser.Time.TimerEvent | null = null

  private unsubPlatform?: () => void

  constructor() {
    super({ key: 'GameScene' })
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  init(data: { level?: number; points?: number; lives?: number }) {
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
    this.missionEffectActive = false
    this.vehicleCards        = []
    this.comparisonAnswers.clear()
    this.comparisonBtns.clear()
    this.timerActive  = false
    this.timerWarned  = false
    this.timeLeft     = 0
    this.warningBeepTimer = null
  }

  create() {
    this.drawBackground()
    this.createTimerBar()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)
    this.showStartScreen()
  }

  update(_time: number, delta: number) {
    if (this.timerActive) this.updateTimer(delta)
  }

  shutdown() {
    this.timerActive = false
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null
    EventBus.off('mute-audio', undefined, this)
    this.unsubPlatform?.()
    this.unsubPlatform = undefined
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TELA INICIAL (padrão EF01CO06)
  // ══════════════════════════════════════════════════════════════════════════

  private getLevelInstructions(): { objective: string; detail: string; tip: string } {
    const lvl = this.levelConfig.level
    if (lvl === 1) return {
      objective: 'Filtre os veículos e responda quantos têm cada característica.',
      detail:    '6 veículos do ar e da terra para classificar.',
      tip:       'Clique em SIM ou NÃO no painel, depois responda a pergunta.',
    }
    if (lvl === 2) return {
      objective: 'Compare dois veículos e descubra semelhanças e diferenças.',
      detail:    '2 pares de veículos com 4 atributos cada.',
      tip:       'Marque IGUAL ou DIFERENTE para cada característica.',
    }
    return {
      objective: 'Descubra o que os veículos destacados têm em comum.',
      detail:    '12 veículos — identifique o atributo que une cada grupo.',
      tip:       'Observe os veículos com borda dourada e escolha a resposta.',
    }
  }

  private showStartScreen() {
    const info = this.getLevelInstructions()
    const lvl  = this.levelConfig.level

    const bg = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A, 0.97)
      .setDepth(60).setInteractive()

    const stars = this.add.text(640, 160, '★'.repeat(lvl) + '☆'.repeat(3 - lvl), {
      fontSize: '44px', color: '#F1C40F',
    }).setOrigin(0.5).setDepth(61)

    const lvlTitle = this.add.text(640, 237, `Nível ${lvl} — Hangar dos Modelos`, {
      fontSize: '36px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#0D1B2A', strokeThickness: 6,
      align: 'center', wordWrap: { width: 900 },
    }).setOrigin(0.5).setDepth(61)

    const card = this.add.rectangle(640, 395, 900, 240, 0x1A2A3A, 1)
      .setStrokeStyle(2, 0x4FC3F7).setDepth(61)

    const objective = this.add.text(640, 315, `🎯  ${info.objective}`, {
      fontSize: '22px', fontFamily: 'Arial Black, Arial',
      color: '#AED6F1', wordWrap: { width: 820 }, align: 'center',
    }).setOrigin(0.5).setDepth(62)

    const detail = this.add.text(640, 388, `✈️  ${info.detail}`, {
      fontSize: '20px', fontFamily: 'Arial',
      color: '#F9E79F', wordWrap: { width: 820 }, align: 'center',
    }).setOrigin(0.5).setDepth(62)

    const tip = this.add.text(640, 450, `💡  ${info.tip}`, {
      fontSize: '18px', fontFamily: 'Arial',
      color: '#BDC3C7', wordWrap: { width: 820 }, align: 'center',
    }).setOrigin(0.5).setDepth(62)

    const timerInfo = this.add.text(640, 502, `⏱  ${this.levelConfig.timeLimit} segundos`, {
      fontSize: '16px', fontFamily: 'Arial',
      color: '#607D8B', align: 'center',
    }).setOrigin(0.5).setDepth(62)

    const btnBg = this.add.rectangle(640, 576, 280, 66, 0x2ECC71, 1)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })
      .setDepth(62)
    const btnTxt = this.add.text(640, 576, '▶  Iniciar', {
      fontSize: '28px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(63)

    const contentItems = [stars, lvlTitle, card, objective, detail, tip, timerInfo, btnBg, btnTxt]

    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 }, y: '+=6',
      duration: 400, ease: 'Back.Out',
    })
    this.tweens.add({
      targets: [btnBg, btnTxt],
      scaleX: 1.04, scaleY: 1.04,
      duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    const start = () => {
      this.playTick()
      const all = [bg, ...contentItems]
      this.tweens.add({
        targets: all, alpha: 0, duration: 300,
        onComplete: () => {
          all.forEach(o => o.destroy())
          runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
          this.broadcastMissionState()
          this.emitCheckpoint()
          this.showFirstMissionBanner()
        },
      })
    }

    btnBg.on('pointerdown', start)
    btnTxt.setInteractive({ useHandCursor: true })
    btnTxt.on('pointerdown', start)
    btnBg.on('pointerover', () => btnBg.setFillStyle(0x27AE60))
    btnBg.on('pointerout',  () => btnBg.setFillStyle(0x2ECC71))
    void bg
  }

  private showFirstMissionBanner() {
    this.input.enabled = false

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.55)
      .setDepth(200).setInteractive()

    const label = this.add.text(640, 285, 'PRIMEIRO DESAFIO:', {
      fontSize: '28px', fontFamily: 'Arial Black', color: '#AED6F1',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(201).setAlpha(0)

    const missions = this.levelConfig.filterMissions
      ?? this.levelConfig.groupingMissions
      ?? []
    const firstInstruction = (missions[0] as { instruction?: string })?.instruction
      ?? 'Compare os veículos!'

    const missionTxt = this.add.text(640, 370, firstInstruction, {
      fontSize: '30px', fontFamily: 'Arial Black', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 7,
      wordWrap: { width: 900 }, align: 'center',
    }).setOrigin(0.5).setDepth(201).setAlpha(0)

    const hint = this.add.text(640, 468, '⬆️  Veja a instrução na barra acima!', {
      fontSize: '18px', fontFamily: 'Arial', color: '#F9E79F',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(201).setAlpha(0)

    this.tweens.add({ targets: [label, missionTxt, hint], alpha: 1, duration: 350, ease: 'Power2' })
    this.playTone(784, 0.10, 'sine', 0.20)

    this.time.delayedCall(2200, () => {
      this.tweens.add({
        targets: [overlay, label, missionTxt, hint], alpha: 0, duration: 350,
        onComplete: () => {
          overlay.destroy(); label.destroy(); missionTxt.destroy(); hint.destroy()
          this.input.enabled = true
          this.startTimer()
          switch (this.levelConfig.level) {
            case 1: this.startLevel1(); break
            case 2: this.startLevel2(); break
            case 3: this.startLevel3(); break
          }
        },
      })
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  TIMER (padrão EF01CO06)
  // ══════════════════════════════════════════════════════════════════════════

  private createTimerBar() {
    this.add.rectangle(640, 118, 1280, 10, 0x0A1628).setDepth(8)
    this.timerBar = this.add.rectangle(0, 118, 1280, 10, 0x2ECC71).setOrigin(0, 0.5).setDepth(9)
  }

  private startTimer() {
    this.timeLeft    = this.levelConfig.timeLimit * 1000
    this.timerActive = true
    this.timerWarned = false
    this.timerBar.setSize(1280, 10)
    this.timerBar.setFillStyle(0x2ECC71)
  }

  private updateTimer(delta: number) {
    this.timeLeft -= delta
    if (this.timeLeft <= 0) {
      this.timeLeft    = 0
      this.timerActive = false
      this.onTimeUp()
      return
    }

    const ratio = this.timeLeft / (this.levelConfig.timeLimit * 1000)
    this.timerBar.setSize(Math.max(0, 1280 * ratio), 10)
    this.timerBar.setFillStyle(ratio > 0.5 ? 0x2ECC71 : ratio > 0.25 ? 0xF39C12 : 0xE74C3C)

    if (!this.timerWarned && ratio <= 0.25) {
      this.timerWarned = true
      this.startWarningBeeps()
    }
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
    this.timerBar.setSize(0, 10)
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

    const resume = () => {
      this.missionEffectActive = false
      if (wasTimerActive) this.timerActive = true
      onDone()
    }

    const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.5)
      .setDepth(200).setInteractive()

    const txt = this.add.text(640, 330, '🌟 Missão Concluída!', {
      fontSize: '62px', fontFamily: 'Arial Black', color: '#F1C40F',
      stroke: '#000', strokeThickness: 9,
    }).setOrigin(0.5).setDepth(201).setAlpha(0)

    this.tweens.add({
      targets: txt, alpha: 1,
      scaleX: { from: 0.5, to: 1 }, scaleY: { from: 0.5, to: 1 },
      duration: 380, ease: 'Back.Out',
    })

    for (let i = 0; i < 20; i++) {
      const sx = Phaser.Math.Between(60, 1220)
      const sy = Phaser.Math.Between(-60, -10)
      const em = ['⭐', '🌟', '✨', '💫'][i % 4]
      const star = this.add.text(sx, sy, em, { fontSize: `${Phaser.Math.Between(20, 44)}px` }).setDepth(201)
      this.tweens.add({
        targets: star, y: Phaser.Math.Between(350, 650), alpha: { from: 1, to: 0 },
        angle: Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800), delay: Phaser.Math.Between(0, 500),
        onComplete: () => star.destroy(),
      })
    }

    if (nextInstruction) {
      this.time.delayedCall(1900, () => {
        this.tweens.add({ targets: txt, alpha: 0, duration: 250 })

        const nextLabel = this.add.text(640, 290, 'PRÓXIMO DESAFIO:', {
          fontSize: '26px', fontFamily: 'Arial Black', color: '#AED6F1',
          stroke: '#000', strokeThickness: 5,
        }).setOrigin(0.5).setDepth(201).setAlpha(0)

        const nextTxt = this.add.text(640, 368, nextInstruction, {
          fontSize: '30px', fontFamily: 'Arial Black', color: '#FFFFFF',
          stroke: '#000', strokeThickness: 6,
          wordWrap: { width: 900 }, align: 'center',
        }).setOrigin(0.5).setDepth(201).setAlpha(0)

        this.tweens.add({ targets: [nextLabel, nextTxt], alpha: 1, duration: 300, ease: 'Power2' })

        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets: [overlay, nextLabel, nextTxt, txt], alpha: 0, duration: 300,
            onComplete: () => { overlay.destroy(); nextLabel.destroy(); nextTxt.destroy(); txt.destroy(); resume() },
          })
        })
      })
    } else {
      this.time.delayedCall(1900, () => {
        this.tweens.add({
          targets: [overlay, txt], alpha: 0, duration: 300,
          onComplete: () => { overlay.destroy(); txt.destroy(); resume() },
        })
      })
    }
  }

  private showLevelCompleteScreen(nextLevel: 1 | 2 | 3 | null) {
    this.timerActive = false
    this.warningBeepTimer?.destroy()
    this.warningBeepTimer = null

    const lvl = this.levelConfig.level
    const bg  = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A, 0.97).setDepth(500)

    const starsEm = this.add.text(640, 180, '⭐'.repeat(lvl), {
      fontSize: '56px',
    }).setOrigin(0.5).setDepth(501)

    const title = this.add.text(640, 280, 'Parabéns!', {
      fontSize: '70px', fontFamily: 'Arial Black, Arial',
      color: '#F1C40F', stroke: '#000000', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(501)

    const subtitle = this.add.text(640, 372, `Você concluiu o Nível ${lvl}!`, {
      fontSize: '32px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 5,
      wordWrap: { width: 900 }, align: 'center',
    }).setOrigin(0.5).setDepth(501)

    const stats = this.add.text(640, 440, `✅ ${this.hits} acertos   ✖ ${this.errors} erros`, {
      fontSize: '22px', fontFamily: 'Arial', color: '#AED6F1',
    }).setOrigin(0.5).setDepth(501)

    const contentItems = [starsEm, title, subtitle, stats]

    // Confetti
    for (let i = 0; i < 20; i++) {
      const em   = ['⭐', '🌟', '✨', '💫'][i % 4]
      const star = this.add.text(
        Phaser.Math.Between(60, 1220), Phaser.Math.Between(130, 200),
        em, { fontSize: `${Phaser.Math.Between(20, 44)}px` },
      ).setDepth(502)
      this.tweens.add({
        targets: star, y: Phaser.Math.Between(400, 680), alpha: 0,
        angle: Phaser.Math.Between(-45, 45),
        duration: Phaser.Math.Between(900, 1800), delay: Phaser.Math.Between(0, 500),
        onComplete: () => star.destroy(),
      })
    }

    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 }, y: '+=6',
      duration: 400, ease: 'Back.Out',
    })

    this.time.delayedCall(1800, () => {
      this.tweens.add({
        targets: [bg, ...contentItems], alpha: 0, duration: 350,
        onComplete: () => {
          bg.destroy(); contentItems.forEach(o => o.destroy())
          if (nextLevel) this.showNextLevelScreen(nextLevel)
        },
      })
    })
  }

  private showNextLevelScreen(nextLevel: 1 | 2 | 3) {
    this.input.enabled = true

    const nextConfig = LEVELS.find(l => l.level === nextLevel) ?? LEVELS[nextLevel - 1]
    const nextInfo   = this.getLevelInstructionsFor(nextLevel)

    const bg = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A, 0.97)
      .setDepth(500).setInteractive()

    const stars = this.add.text(640, 160, '★'.repeat(nextLevel) + '☆'.repeat(3 - nextLevel), {
      fontSize: '44px', color: '#F1C40F',
    }).setOrigin(0.5).setDepth(501)

    const lvlTitle = this.add.text(640, 244, `Próximo: Nível ${nextLevel}`, {
      fontSize: '48px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(501)

    const card = this.add.rectangle(640, 395, 900, 200, 0x1A2A3A, 1)
      .setStrokeStyle(2, 0x4FC3F7).setDepth(501)

    const obj = this.add.text(640, 340, `🎯  ${nextInfo.objective}`, {
      fontSize: '22px', fontFamily: 'Arial Black, Arial', color: '#AED6F1',
      wordWrap: { width: 820 }, align: 'center',
    }).setOrigin(0.5).setDepth(502)

    const tip = this.add.text(640, 398, `💡  ${nextInfo.tip}`, {
      fontSize: '18px', fontFamily: 'Arial', color: '#F9E79F',
      wordWrap: { width: 820 }, align: 'center',
    }).setOrigin(0.5).setDepth(502)

    const timeInfo = this.add.text(640, 450, `⏱  ${nextConfig.timeLimit} segundos`, {
      fontSize: '17px', fontFamily: 'Arial', color: '#607D8B',
    }).setOrigin(0.5).setDepth(502)

    const advBg = this.add.rectangle(640, 550, 280, 66, 0x4FC3F7, 1)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })
      .setDepth(502)
    const advTxt = this.add.text(640, 550, '▶  Avançar', {
      fontSize: '28px', fontFamily: 'Arial Black, Arial', color: '#0D1B2A',
    }).setOrigin(0.5).setDepth(503)

    const contentItems = [stars, lvlTitle, card, obj, tip, timeInfo, advBg, advTxt]
    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 }, y: '+=6',
      duration: 400, ease: 'Back.Out',
    })
    this.tweens.add({
      targets: [advBg, advTxt],
      scaleX: 1.04, scaleY: 1.04,
      duration: 750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    const advance = () => {
      this.playTick()
      this.scene.restart({ level: nextLevel, points: this.currentPoints, lives: this.currentLives })
    }
    advBg.on('pointerdown', advance)
    advTxt.setInteractive({ useHandCursor: true })
    advTxt.on('pointerdown', advance)
    advBg.on('pointerover', () => advBg.setFillStyle(0x29B6F6))
    advBg.on('pointerout',  () => advBg.setFillStyle(0x4FC3F7))
    void bg
  }

  private getLevelInstructionsFor(lvl: number): { objective: string; tip: string } {
    if (lvl === 2) return {
      objective: 'Compare dois veículos e descubra suas diferenças.',
      tip:       'Marque IGUAL ou DIFERENTE para cada característica.',
    }
    return {
      objective: 'Descubra o que os veículos destacados têm em comum.',
      tip:       'Observe os veículos com borda dourada e escolha a resposta.',
    }
  }

  private showGameOverScreen(reason: 'timeout' | 'wrong-answer' = 'timeout') {
    this.input.enabled = true

    this.playTone(330, 0.30, 'square', 0.18)
    this.time.delayedCall(100, () => this.playTone(220, 0.40, 'square', 0.16))

    const bg = this.add.rectangle(640, 360, 1280, 720, 0x0D1B2A, 0.97)
      .setDepth(500).setInteractive()

    const title = this.add.text(640, 215, 'GAME OVER', {
      fontSize: '80px', fontFamily: 'Arial Black, Arial',
      color: '#E74C3C', stroke: '#000000', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(501)

    const reasonMsg = reason === 'timeout' ? '⏱  O tempo acabou!' : '❌  Resposta incorreta!'
    const timeupTxt = this.add.text(640, 315, reasonMsg, {
      fontSize: '32px', fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF', stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(501)

    const total = (this.levelConfig.filterMissions?.length)
      ?? (this.levelConfig.comparisonPairs?.length)
      ?? (this.levelConfig.groupingMissions?.length)
      ?? 1

    const statsTxt = this.add.text(640, 390, `Você completou ${this.currentMissionIndex} de ${total} missões.`, {
      fontSize: '22px', fontFamily: 'Arial',
      color: '#BDC3C7', wordWrap: { width: 800 }, align: 'center',
    }).setOrigin(0.5).setDepth(501)

    const retryBg = this.add.rectangle(450, 510, 300, 66, 0x2ECC71, 1)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true }).setDepth(502)
    const retryTxt = this.add.text(450, 510, '🔄  Tentar Novamente', {
      fontSize: '20px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(503)

    const exitBg = this.add.rectangle(830, 510, 220, 66, 0xE74C3C, 1)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true }).setDepth(502)
    const exitTxt = this.add.text(830, 510, 'Sair', {
      fontSize: '26px', fontFamily: 'Arial Black, Arial', color: '#FFFFFF',
    }).setOrigin(0.5).setDepth(503)

    const contentItems = [title, timeupTxt, statsTxt, retryBg, retryTxt, exitBg, exitTxt]
    this.tweens.add({
      targets: contentItems,
      alpha: { from: 0, to: 1 }, y: '+=8',
      duration: 450, ease: 'Back.Out',
    })

    const retry = () => {
      this.playTick()
      this.scene.restart({ level: this.levelConfig.level, points: this.currentPoints, lives: this.currentLives })
    }
    const exit = () => {
      this.playTick()
      EventBus.emit('game-back-to-start')
    }

    retryBg.on('pointerdown', retry)
    retryTxt.setInteractive({ useHandCursor: true })
    retryTxt.on('pointerdown', retry)
    exitBg.on('pointerdown', exit)
    exitTxt.setInteractive({ useHandCursor: true })
    exitTxt.on('pointerdown', exit)
    retryBg.on('pointerover', () => retryBg.setFillStyle(0x27AE60))
    retryBg.on('pointerout',  () => retryBg.setFillStyle(0x2ECC71))
    exitBg.on('pointerover',  () => exitBg.setFillStyle(0xC0392B))
    exitBg.on('pointerout',   () => exitBg.setFillStyle(0xE74C3C))
    void bg
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FUNDO
  // ══════════════════════════════════════════════════════════════════════════

  private drawBackground() {
    const g = this.add.graphics()

    // Gradiente de céu
    g.fillGradientStyle(0x0A1628, 0x0A1628, 0x162744, 0x162744, 1)
    g.fillRect(0, 0, 1280, 720)

    // Chão do hangar
    g.fillStyle(0x08111E, 1)
    g.fillRect(0, BOTTOM_Y, 1280, 720 - BOTTOM_Y)

    // Linhas de perspectiva do chão
    g.lineStyle(1, 0x4FC3F7, 0.12)
    for (let i = 1; i <= 8; i++) {
      g.lineBetween(i * 142, BOTTOM_Y, 640, BOTTOM_Y - 20)
    }

    // Focos de luz no teto
    const lampX = [100, 320, 540, 760, 980, 1200]
    lampX.forEach((lx) => {
      g.fillStyle(0xFFEB3B, 0.65)
      g.fillCircle(lx, 28, 12)
      // Cone de luz
      g.fillStyle(0xFFEB3B, 0.04)
      g.fillTriangle(lx - 80, BOTTOM_Y, lx + 80, BOTTOM_Y, lx, 40)
    })

    // Separador vertical (nível 1 e 3 têm painel à direita)
    if (this.levelConfig.level !== 2) {
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
    const key = `vehicle-${vehicle.id}`

    // Fundo do cartão (textura do BootScene)
    const img = this.add.image(0, 0, key).setOrigin(0.5)

    // Emoji grande — posicionado no spotlight da textura
    const emoji = this.add.text(0, -16, vehicle.emoji, { fontSize: '52px' })
      .setOrigin(0.5)

    // Nome — sobre a banda escura da textura
    const name = this.add.text(0, 44, vehicle.name, {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5)

    const container = this.add.container(cx, cy, [img, emoji, name])
    container.setSize(CARD_W, CARD_H)

    // Animação de entrada
    container.setAlpha(0).setScale(0.72)
    this.tweens.add({
      targets: container,
      alpha: 1, scaleX: 1, scaleY: 1,
      duration: 380, ease: 'Back.Out',
      delay: this.vehicleCards.length * 70,
    })

    return { container, vehicle, homeX: cx, homeY: cy }
  }

  // ── Painel de filtros ────────────────────────────────────────────────────

  private buildFilterPanel() {
    const panel = this.add.container(PANEL_LEFT_X, TOP_Y + 35)
    this.filterPanelContainer = panel

    // Fundo do painel
    const bg = this.add.graphics()
    bg.fillStyle(0x081524, 0.95)
    bg.fillRoundedRect(0, 0, PANEL_W, 495, 20)
    bg.lineStyle(2, 0x4FC3F7, 0.45)
    bg.strokeRoundedRect(0, 0, PANEL_W, 495, 20)
    panel.add(bg)

    // Cabeçalho
    const hdr = this.add.text(PANEL_W / 2, 26, '🔍  CLASSIFIQUE!', {
      fontSize: '24px',
      fontFamily: 'Arial Black, Arial',
      color: '#E3F2FD',
    }).setOrigin(0.5, 0)
    panel.add(hdr)

    // Sub-título do atributo
    const sub = this.add.text(PANEL_W / 2, 64, 'Esse veículo VOA?', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#90CAF9',
    }).setOrigin(0.5, 0)
    panel.add(sub)

    // Divisor
    const div = this.add.graphics()
    div.lineStyle(1, 0x4FC3F7, 0.25)
    div.lineBetween(20, 98, PANEL_W - 20, 98)
    panel.add(div)

    // Botões de filtro
    const btnData = [
      { label: '✈️  SIM — Voa!',      value: true as FilterValue,  color: 0x2E7D32, y: 130 },
      { label: '🚗  NÃO — Não voa',  value: false as FilterValue, color: 0xB71C1C, y: 230 },
      { label: '🔄  Mostrar todos',   value: null,                  color: 0x1565C0, y: 340 },
    ]

    btnData.forEach(({ label, value, color, y }) => {
      const btn = this.makeRoundedButton(label, color, 340, 64, () => {
        if (this.phase !== 'waiting-filter') return
        this.applyFilter('voa', value)
      })
      btn.setPosition(PANEL_W / 2, y)
      panel.add(btn)
    })

    // Dica visual
    const hint = this.add.text(PANEL_W / 2, 420, '👆 Clique em SIM ou NÃO\npara agrupar os veículos', {
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

    // UIScene já exibe instrução e dica via mission-update.
    // Só aguardamos as animações dos cards terminarem para liberar interação.
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

    this.showLevelCompleteScreen(nextLevel)
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
      fontSize: '19px',
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
    const confirm = this.makeRoundedButton('✔  Confirmar', 0x1565C0, 240, 56, () => {
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

    const g = this.add.graphics()
    g.fillStyle(vehicle.bodyColor, 1)
    g.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, 22)
    g.fillStyle(0xFFFFFF, 0.17)
    g.fillRoundedRect(cx - W / 2 + 8, cy - H / 2 + 8, W - 16, 55, { tl: 14, tr: 14, bl: 0, br: 0 })
    g.lineStyle(3, 0xFFFFFF, 0.5)
    g.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, 22)

    const emoji = this.add.text(cx, cy - 24, vehicle.emoji, { fontSize: '60px' }).setOrigin(0.5)
    const name  = this.add.text(cx, cy + 66, vehicle.name, {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#1A2340',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5)

    layer.add([g, emoji, name])
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
    rowBg.fillRoundedRect(cx - 265, cy - 28, 530, 56, 10)
    rowBg.lineStyle(1, 0x37474F, 0.6)
    rowBg.strokeRoundedRect(cx - 265, cy - 28, 530, 56, 10)

    const labelTxt = this.add.text(cx, cy, labels[attr], {
      fontSize: '17px',
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

  private makeOptionButton(label: string, color: number, onClick: () => void) {
    const container = this.add.container(0, 0)
    const W = 130, H = 42

    const bg = this.add.graphics()
    bg.fillStyle(color, 0.5)
    bg.fillRoundedRect(-W / 2, -H / 2, W, H, 10)
    bg.lineStyle(2, 0xFFFFFF, 0.2)
    bg.strokeRoundedRect(-W / 2, -H / 2, W, H, 10)

    const txt = this.add.text(0, 0, label, {
      fontSize: '14px',
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
      const W = 130, H = 42
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
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFDE7',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5, 0)

    // Painel da pergunta (direita)
    this.time.delayedCall(1300, () => this.showGroupingQuestion(mission))
  }

  private makeSmallCard(vehicle: Vehicle, cx: number, cy: number, highlight: boolean): VehicleCard {
    // Usa a mesma textura do BootScene (igual N1 e N2), escalada para SCARD_W/CARD_W
    const scale = SCARD_W / CARD_W  // 120/155 ≈ 0.774
    const key   = `vehicle-${vehicle.id}`

    const img = this.add.image(0, 0, key).setOrigin(0.5)

    const emoji = this.add.text(0, -16, vehicle.emoji, { fontSize: '52px' }).setOrigin(0.5)

    const name = this.add.text(0, 44, vehicle.name, {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5)

    const container = this.add.container(cx, cy, [img, emoji, name])
    container.setSize(CARD_W, CARD_H)  // tamanho local antes do scale
    container.setScale(scale)

    if (highlight) {
      // Borda dourada: lineStyle divide por scale para compensar o zoom do container
      const glow = this.add.graphics()
      glow.lineStyle(4 / scale, 0xFFD700, 1)
      glow.strokeRoundedRect(-CARD_W / 2 - 8, -CARD_H / 2 - 8, CARD_W + 16, CARD_H + 16, 22)
      container.addAt(glow, 0)  // atrás dos outros elementos

      this.tweens.add({
        targets: container,
        scaleX: scale * 1.06, scaleY: scale * 1.06,
        yoyo: true, repeat: -1, duration: 850, ease: 'Sine.InOut',
      })
    }

    const targetAlpha = highlight ? 1 : 0.45
    container.setAlpha(0)
    this.tweens.add({
      targets: container, alpha: targetAlpha,
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

      const btn = this.makeGroupOptionButton(opt.label, isCorrect, optW / 2 - 6, optH, () => {
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
    const W = 120, H = 58

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
