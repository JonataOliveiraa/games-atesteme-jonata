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
    this.vehicleCards        = []
    this.comparisonAnswers.clear()
    this.comparisonBtns.clear()
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()

    EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    EventBus.emit('scene-ready', {
      levelConfig:  this.levelConfig,
      missionIndex: this.currentMissionIndex,
    })

    switch (this.levelConfig.level) {
      case 1: this.startLevel1(); break
      case 2: this.startLevel2(); break
      case 3: this.startLevel3(); break
    }
  }

  shutdown() {
    EventBus.off('mute-audio', undefined, this)
    this.unsubPlatform?.()
    this.unsubPlatform = undefined
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

    // Emoji grande
    const emoji = this.add.text(0, -16, vehicle.emoji, { fontSize: '44px' })
      .setOrigin(0.5)

    // Nome
    const name = this.add.text(0, 46, vehicle.name, {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial',
      color: '#1A2340',
      stroke: '#FFFFFF',
      strokeThickness: 3,
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
    const panel = this.add.container(PANEL_LEFT_X, TOP_Y + 10)
    this.filterPanelContainer = panel

    // Fundo do painel
    const bg = this.add.graphics()
    bg.fillStyle(0x081524, 0.95)
    bg.fillRoundedRect(0, 0, PANEL_W, 520, 20)
    bg.lineStyle(2, 0x4FC3F7, 0.45)
    bg.strokeRoundedRect(0, 0, PANEL_W, 520, 20)
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

    const mission = this.levelConfig.filterMissions?.[this.currentMissionIndex]
    if (!mission) return

    const banner = this.add.container(VEH_AREA_W / 2, TOP_Y + 30)
    this.instructionBanner = banner

    // Fundo da instrução
    const bg = this.add.graphics()
    bg.fillStyle(0x0D2137, 0.9)
    bg.fillRoundedRect(-380, -28, 760, 56, 14)
    bg.lineStyle(2, 0xFFD700, 0.6)
    bg.strokeRoundedRect(-380, -28, 760, 56, 14)
    banner.add(bg)

    const txt = this.add.text(0, 0,
      `🎯  Missão ${this.currentMissionIndex + 1}: ${mission.instruction}`, {
        fontSize: '19px',
        fontFamily: 'Arial, sans-serif',
        color: '#FFFDE7',
        wordWrap: { width: 720 },
      }).setOrigin(0.5)
    banner.add(txt)

    banner.setAlpha(0)
    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 400,
      delay: this.vehicleCards.length * 70 + 100,
      onComplete: () => { this.phase = 'waiting-filter' },
    })
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

    this.emitProgress()

    this.time.delayedCall(1100, () => {
      this.questionOverlay?.destroy()
      this.questionOverlay = undefined
      this.feedbackBanner?.destroy()
      this.feedbackBanner = undefined
      this.advanceMission()
    })
  }

  private onWrong() {
    this.errors++
    this.phase = 'feedback-err'
    this.playMiss()
    this.showFeedback('❌  Tente de novo!', 0x7F0000)

    runtimeGameBridge.emit({
      type:         'WRONG_ANSWER',
      gameId:       GAME_ID,
      pointsEarned: 0,
      stage:        this.levelConfig.level,
    })

    this.emitProgress()

    // Shake no overlay e libera para nova tentativa
    if (this.questionOverlay) {
      this.tweens.add({
        targets:  this.questionOverlay,
        x:        this.questionOverlay.x - 8,
        duration: 55, yoyo: true, repeat: 4,
        onComplete: () => {
          if (this.questionOverlay) {
            this.questionOverlay.x = VEH_AREA_W / 2
            this.enableOverlayButtons()
          }
        },
      })
    }

    this.time.delayedCall(1200, () => {
      this.feedbackBanner?.destroy()
      this.feedbackBanner = undefined
      this.phase = 'question'
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
    const txt = this.add.text(VEH_AREA_W / 2, TOP_Y + 70, msg, {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color:    '#FFFFFF',
      backgroundColor: `#${bgColor.toString(16).padStart(6, '0')}cc`,
      padding:  { x: 24, y: 12 },
    }).setOrigin(0.5).setDepth(200)

    this.feedbackBanner = txt
    this.tweens.add({ targets: txt, y: TOP_Y + 50, alpha: 1, duration: 250 })
  }

  private emitProgress() {
    const total =
      (this.levelConfig.filterMissions?.length)
      ?? (this.levelConfig.comparisonPairs?.length)
      ?? (this.levelConfig.groupingMissions?.length)
      ?? 1

    EventBus.emit('update-progress', {
      pct:    (this.currentMissionIndex + (this.phase === 'feedback-ok' ? 1 : 0)) / total,
      hits:   this.hits,
      errors: this.errors,
    })
  }

  // ── Progressão de missões ────────────────────────────────────────────────

  private advanceMission() {
    const missions =
      this.levelConfig.filterMissions
      ?? this.levelConfig.comparisonPairs
      ?? this.levelConfig.groupingMissions
      ?? []

    this.currentMissionIndex++

    if (this.currentMissionIndex >= missions.length) {
      this.endLevel()
      return
    }

    // Reset cards para posição home e inicia próxima missão
    this.phase = 'next-mission'
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
      EventBus.emit('scene-ready', {
        levelConfig:  this.levelConfig,
        missionIndex: this.currentMissionIndex,
      })

      switch (this.levelConfig.level) {
        case 1: this.showMissionIntro();    break
        case 2: this.nextComparisonPair();  break
        case 3: this.nextGroupingMission(); break
      }
    })
  }

  private endLevel() {
    this.phase = 'level-complete'
    this.playFanfare()

    // Overlay de parabéns
    const overlay = this.add.container(640, MID_Y).setDepth(300)

    const bg = this.add.graphics()
    bg.fillStyle(0x0A1628, 0.97)
    bg.fillRoundedRect(-340, -120, 680, 240, 28)
    bg.lineStyle(3, 0xFFD700, 0.9)
    bg.strokeRoundedRect(-340, -120, 680, 240, 28)
    overlay.add(bg)

    overlay.add(
      this.add.text(0, -68, '🏆', { fontSize: '72px' }).setOrigin(0.5),
    )
    overlay.add(
      this.add.text(0, 20, `Nível ${this.levelConfig.level} concluído!`, {
        fontSize: '36px',
        fontFamily: 'Arial Black, Arial',
        color: '#FFD700',
      }).setOrigin(0.5),
    )

    overlay.setAlpha(0)
    this.tweens.add({ targets: overlay, alpha: 1, duration: 400 })
    this.tweens.add({
      targets: overlay, scaleX: 1.06, scaleY: 1.06,
      yoyo: true, repeat: -1, duration: 800,
    })

    runtimeGameBridge.emit({
      type:    'GAME_COMPLETED',
      gameId:  GAME_ID,
      stage:   this.levelConfig.level,
    })

    if (this.levelConfig.level < 3) {
      const next = (this.levelConfig.level + 1) as 1 | 2 | 3
      this.time.delayedCall(2400, () => {
        this.scene.restart({ level: next, points: this.currentPoints, lives: this.currentLives })
      })
    }
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
    this.missionLayer = this.add.container(0, 0)

    const vA = vehicleById(pair.vehicleAId)
    const vB = vehicleById(pair.vehicleBId)

    // Instrução
    const instr = this.add.text(640, TOP_Y + 22, '🔍  Compare os dois veículos — eles são iguais ou diferentes?', {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#E3F2FD',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0)

    // "VS" pulsante no centro
    const vs = this.add.text(640, MID_Y - 110, 'VS', {
      fontSize: '56px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5)
    this.tweens.add({ targets: vs, scaleX: 1.1, scaleY: 1.1, yoyo: true, repeat: -1, duration: 750 })

    // Cartões grandes dos veículos
    this.buildLargeCard(vA, 200, MID_Y)
    this.buildLargeCard(vB, 1080, MID_Y)

    // Tabela de atributos
    const attrStartY = MID_Y - 90
    const rowH       = 82

    pair.attributes.forEach((attr, i) => {
      this.buildComparisonRow(attr, vA, vB, 640, attrStartY + i * rowH)
    })

    // Botão confirmar
    const confirm = this.makeRoundedButton('✔  Confirmar', 0x1565C0, 240, 56, () => {
      this.confirmComparison(vA, vB, pair.attributes)
    })
    confirm.setPosition(640, attrStartY + pair.attributes.length * rowH + 40)
    void instr
  }

  private buildLargeCard(vehicle: Vehicle, cx: number, cy: number) {
    const W = 190, H = 185

    const g = this.add.graphics()
    g.fillStyle(vehicle.bodyColor, 1)
    g.fillRoundedRect(cx - W / 2, cy - H / 2, W, H, 22)
    g.fillStyle(0xFFFFFF, 0.17)
    g.fillRoundedRect(cx - W / 2 + 8, cy - H / 2 + 8, W - 16, 55, { tl: 14, tr: 14, bl: 0, br: 0 })
    g.lineStyle(3, 0xFFFFFF, 0.5)
    g.strokeRoundedRect(cx - W / 2, cy - H / 2, W, H, 22)

    this.add.text(cx, cy - 24, vehicle.emoji, { fontSize: '60px' }).setOrigin(0.5)
    this.add.text(cx, cy + 66, vehicle.name, {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#1A2340',
      stroke: '#FFFFFF',
      strokeThickness: 3,
    }).setOrigin(0.5)
  }

  private buildComparisonRow(
    attr: FilterAttribute,
    vA:   Vehicle,
    vB:   Vehicle,
    cx:   number,
    cy:   number,
  ) {
    const labels: Record<FilterAttribute, string> = {
      voa:      '✈️  Voa?',
      temRodas: '🔵  Tem rodas?',
      temMotor: '⚙️  Tem motor?',
      meio:     '🗺️  Meio de transporte',
    }

    // Fundo da linha
    const rowBg = this.add.graphics()
    rowBg.fillStyle(0x0D2137, 0.7)
    rowBg.fillRoundedRect(cx - 230, cy - 28, 460, 56, 10)
    rowBg.lineStyle(1, 0x37474F, 0.6)
    rowBg.strokeRoundedRect(cx - 230, cy - 28, 460, 56, 10)

    this.add.text(cx, cy, labels[attr], {
      fontSize: '17px',
      fontFamily: 'Arial Black, Arial',
      color: '#B0BEC5',
    }).setOrigin(0.5)

    const igualBtn     = this.makeOptionButton('IGUAL',     0x1B5E20, () => this.selectAnswer(attr, true))
    const diferenteBtn = this.makeOptionButton('DIFERENTE', 0x7F0000, () => this.selectAnswer(attr, false))

    igualBtn.setPosition(cx - 145, cy)
    diferenteBtn.setPosition(cx + 145, cy)

    this.comparisonAnswers.set(attr, null)
    this.comparisonBtns.set(attr, { igualBtn, diferenteBtn })
    void rowBg
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
      this.onWrong()
      // Destaca linhas erradas
      attrs.forEach((attr) => {
        const valA      = vA.attributes[attr as keyof VehicleAttributes]
        const valB      = vB.attributes[attr as keyof VehicleAttributes]
        const realIgual = valA === valB
        const user      = this.comparisonAnswers.get(attr)
        if (user !== realIgual) {
          const btns = this.comparisonBtns.get(attr)
          if (btns) {
            const wrongBtn = realIgual ? btns.diferenteBtn : btns.igualBtn
            this.tweens.add({ targets: wrongBtn, x: wrongBtn.x - 6, duration: 50, yoyo: true, repeat: 5 })
          }
        }
      })
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
    this.add.text(START_X + (COLS * (SCARD_W + SCARD_GAP)) / 2, TOP_Y + 14,
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
    const W = SCARD_W, H = SCARD_H
    const g = this.add.graphics()

    if (highlight) {
      // Brilho dourado
      g.fillStyle(0xFFD700, 0.22)
      g.fillRoundedRect(-W / 2 - 7, -H / 2 - 7, W + 14, H + 14, 18)
    }

    g.fillStyle(vehicle.bodyColor, highlight ? 1 : 0.28)
    g.fillRoundedRect(-W / 2, -H / 2, W, H, 14)
    g.lineStyle(highlight ? 3 : 1, highlight ? 0xFFD700 : 0xFFFFFF, highlight ? 1 : 0.18)
    g.strokeRoundedRect(-W / 2, -H / 2, W, H, 14)

    const emoji = this.add.text(0, -10, vehicle.emoji, {
      fontSize: highlight ? '30px' : '22px',
    }).setOrigin(0.5).setAlpha(highlight ? 1 : 0.30)

    const name = this.add.text(0, 32, vehicle.name, {
      fontSize: '11px',
      fontFamily: 'Arial Black, Arial',
      color: highlight ? '#FFFFFF' : '#546E7A',
    }).setOrigin(0.5)

    const container = this.add.container(cx, cy, [g, emoji, name])
    container.setSize(W, H)

    if (highlight) {
      this.tweens.add({
        targets: container,
        scaleX: 1.06, scaleY: 1.06,
        yoyo: true, repeat: -1, duration: 850, ease: 'Sine.InOut',
      })
    }

    container.setAlpha(0)
    this.tweens.add({
      targets: container, alpha: 1,
      duration: 280, delay: this.vehicleCards.length * 40,
    })

    return { container, vehicle, homeX: cx, homeY: cy }
  }

  private showGroupingQuestion(mission: GroupingMission) {
    this.questionOverlay?.destroy()
    this.phase = 'question'

    const PX    = PANEL_LEFT_X
    const PY    = TOP_Y + 20
    const PH    = BOTTOM_Y - TOP_Y - 20

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
