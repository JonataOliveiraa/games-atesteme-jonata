import Phaser from "phaser"
import { EventBus } from "../../../shared/EventBus"
import { runtimeGameBridge } from "../../../shared/bridge/runtimeGameBridge"
import type { PlatformCommand } from "../../../shared/contracts/platformCommands"
import { showLevelComplete } from "../../../shared/level/showLevelComplete"
import { createTutorial, type TutorialStep } from "../../../shared/tutorial/createTutorial"
import { LEVELS } from "../data/levels"
import type {
  Direction, GameSceneData, GridPoint, RepeatLevel, RepeatPhase, RobotCommand,
} from "../types"
import {
  W, H, C, hex, label, paperCard, headerBand,
  chunkyButton, circleButton, floatingNote, confetti, type Btn,
} from "../ui/kit"

const GAME_ID = "desfile-do-robo-repetidor"

const HEADER_H = 76
const BOARD = { cx: 372, cy: 404, w: 664, h: 552 }
const SIDE = { cx: 992, cy: 404, w: 512, h: 552 }
const BAND_H = 54
const TAPE_Y = 170
const TAPE_ENTER_Y = TAPE_Y - 43

const DIR_W = 226, DIR_H = 92
const DIR_X = [SIDE.cx - 122, SIDE.cx + 122]
const DIR_Y = [262, 370]

const SLOT = 52, SLOT_GAP = 7, SLOT_COLS = 7
const SLOTS_Y = [502, 502 + SLOT + SLOT_GAP]

const ACTION_Y = 626
const ACTION_X0 = SIDE.cx - 232
const ACTION = {
  run: { x: ACTION_X0 + 95, w: 190 },
  undo: { x: ACTION_X0 + 263, w: 128 },
  clear: { x: ACTION_X0 + 400, w: 128 },
}

const DIRECTION_META: Record<Direction, { label: string; angle: number; dx: number; dy: number }> = {
  up: { label: "Cima", angle: -90, dx: 0, dy: -1 },
  right: { label: "Direita", angle: 0, dx: 1, dy: 0 },
  down: { label: "Baixo", angle: 90, dx: 0, dy: 1 },
  left: { label: "Esquerda", angle: 180, dx: -1, dy: 0 },
}

export class GameScene extends Phaser.Scene {
  private levelIdx = 0
  private phaseIdx = 0
  private score = 0
  private hits = 0
  private errors = 0

  private program: RobotCommand[] = []
  private running = false
  private ended = false
  private runningIndex = -1
  private failedIndex = -1

  private robot!: Phaser.GameObjects.Container
  private robotSprite!: Phaser.GameObjects.Image
  private robotShadow!: Phaser.GameObjects.Ellipse
  private robotBaseScale = 1
  private robotPos!: GridPoint

  private checkpointImg?: Phaser.GameObjects.Image
  private checkpointScale = 1
  private checkpointTaken = false

  private slotLayer!: Phaser.GameObjects.Graphics
  private blockLayer!: Phaser.GameObjects.Container
  private counterText!: Phaser.GameObjects.Text
  private footprints: Phaser.GameObjects.GameObject[] = []
  private railDots: Phaser.GameObjects.Graphics[] = []
  private goalLabel!: Phaser.GameObjects.Text

  private tapeRoot?: Phaser.GameObjects.Container
  private tapeChips: Array<{
    g: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
    x: number
    size: number
    iconScale: number
  }> = []
  private runBtn!: Btn
  private undoBtn!: Btn
  private clearBtn!: Btn
  private dirBtns: Btn[] = []

  private focusVeil?: Phaser.GameObjects.Graphics

  private timerFill!: Phaser.GameObjects.Graphics
  private timerText!: Phaser.GameObjects.Text
  private timeLeft = 0
  private timerOn = false

  private unsubPlatform?: () => void

  constructor() { super({ key: "GameScene" }) }

  init(data: GameSceneData) {
    this.levelIdx = Phaser.Math.Clamp((data?.level ?? 1) - 1, 0, LEVELS.length - 1)
    this.phaseIdx = Phaser.Math.Clamp(data?.phase ?? 0, 0, this.level.phases.length - 1)
    this.score = data?.score ?? 0
    this.hits = data?.hits ?? 0
    this.errors = data?.errors ?? 0

    this.focusVeil = undefined
    this.program = []
    this.running = false
    this.ended = false
    this.runningIndex = -1
    this.failedIndex = -1
    this.footprints = []
    this.railDots = []
    this.dirBtns = []
    this.checkpointImg = undefined
    this.checkpointTaken = false
    this.timeLeft = this.level.timeLimit
    this.timerOn = false
    this.robotPos = { ...this.phase.start }

    this.tapeRoot = undefined
    this.tapeChips = []
  }

  private get level(): RepeatLevel { return LEVELS[this.levelIdx] }
  private get phase(): RepeatPhase { return this.level.phases[this.phaseIdx] }

  create() {
    this.cameras.main.setZoom(1).centerOn(W / 2, H / 2)

    this.buildBackground()
    this.buildHeader()
    this.buildBoard()
    this.buildSidePanel()
    this.buildRobot()
    this.renderProgram()
    this.registerPlatform()

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unsubPlatform?.())

    runtimeGameBridge.emit({ type: "GAME_READY", gameId: GAME_ID })
    this.emitCheckpoint()

    const begin = () => {
      if (this.levelIdx === 0 && this.phaseIdx === 0) this.runTutorial(true, () => this.startPlay())
      else this.startPlay()
    }

    if (this.phaseIdx === 0) this.showLevelIntro(begin)
    else begin()
  }

  update(_t: number, dt: number) {
    if (!this.timerOn || this.ended) return
    this.timeLeft = Math.max(0, this.timeLeft - dt / 1000)
    this.paintTimer()
    if (this.timeLeft <= 0) {
      this.timerOn = false
      floatingNote(this, W / 2, 320, "O bônus de tempo acabou — siga com calma!",
        { tone: C.sun, deep: C.sunDeep })
    }
  }

  // ═════════════════════════════════════════════════ cenário

  private buildBackground() {
    this.add.image(W / 2, H / 2, "wallpaper")
      .setDisplaySize(W, H).setDepth(-100).setTint(0x8fa6c4)
  }

  private buildHeader() {
    // Faixa azul-roxa em duas camadas: base escura + luz na metade de cima
    const g = this.add.graphics().setDepth(40)
    g.fillStyle(C.headerDeep, 0.96)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H + 40, 24)
    g.fillStyle(C.header, 0.95)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H + 34, 24)
    g.fillStyle(C.headerGlow, 0.4)
    g.fillRoundedRect(-40, -40, W + 80, HEADER_H * 0.55 + 40, 24)
    g.fillStyle(C.sun, 1); g.fillRect(0, HEADER_H - 4, W, 4)

    // Chip compacto: "N1 · FASE 2/3"
    const chipW = 216
    const chip = this.add.graphics().setDepth(41)
    chip.fillStyle(C.white, 0.16); chip.fillRoundedRect(22, 16, chipW, 44, 22)
    chip.lineStyle(2, C.white, 0.3); chip.strokeRoundedRect(22, 16, chipW, 44, 22)
    label(this, 22 + chipW / 2, 38,
      `N${this.level.level} · FASE ${this.phaseIdx + 1}/${this.level.phases.length}`,
      { size: 19, color: C.white }).setDepth(42)

    const gap = 40
    const x0 = W / 2 - gap
    for (let i = 0; i < this.level.phases.length; i++) {
      this.railDots.push(this.add.graphics().setDepth(41))
      this.paintDot(i, x0 + i * gap, 38)
    }

    this.buildTimerPill(1012, 38)

    circleButton(this, 1210, 38, 26, C.sun, C.sunDeep,
      () => this.runTutorial(false, () => { })).setDepth(42)
    label(this, 1210, 39, "?", { size: 32, color: C.ink }).setDepth(43)
  }

  /** Pílula de tempo: trilho, preenchimento e leitura em segundos. */
  private buildTimerPill(cx: number, cy: number) {
    const w = 200, h = 40
    const g = this.add.graphics().setDepth(41)
    g.fillStyle(C.headerDeep, 0.9); g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2)
    g.lineStyle(2, C.white, 0.26); g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, h / 2)

    // Relógio desenhado: dá contexto sem depender de asset
    g.lineStyle(3, C.white, 0.85); g.strokeCircle(cx - w / 2 + 26, cy, 11)
    g.lineBetween(cx - w / 2 + 26, cy, cx - w / 2 + 26, cy - 6)
    g.lineBetween(cx - w / 2 + 26, cy, cx - w / 2 + 31, cy + 3)

    const trackX = cx - w / 2 + 46
    const trackW = w - 62
    g.fillStyle(C.white, 0.14)
    g.fillRoundedRect(trackX, cy + 6, trackW, 8, 4)

    this.timerFill = this.add.graphics().setDepth(42)
    this.timerFill.setData("x", trackX)
    this.timerFill.setData("y", cy + 6)
    this.timerFill.setData("w", trackW)

    this.timerText = label(this, trackX + trackW / 2, cy - 7, "", { size: 17, color: C.white })
      .setDepth(42)
    this.paintTimer()
  }

  private paintTimer() {
    const g = this.timerFill
    const x = g.getData("x") as number
    const y = g.getData("y") as number
    const w = g.getData("w") as number
    const p = this.level.timeLimit > 0
      ? Phaser.Math.Clamp(this.timeLeft / this.level.timeLimit, 0, 1) : 0

    g.clear()
    if (p > 0) {
      g.fillStyle(p > 0.4 ? C.mint : C.sun, 1)
      g.fillRoundedRect(x, y, Math.max(8, w * p), 8, 4)
    }

    const secs = Math.ceil(this.timeLeft)
    this.timerText.setText(
      secs > 0 ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}` : "sem bônus",
    )
    this.timerText.setColor(hex(p > 0.4 ? C.white : C.sun))
  }

  private paintDot(i: number, x: number, y: number) {
    const d = this.railDots[i]
    d.clear()
    if (i < this.phaseIdx) {
      d.fillStyle(C.mint, 1); d.fillCircle(x, y, 14)
      d.lineStyle(5, C.white, 1)
      d.lineBetween(x - 6, y, x - 2, y + 5)
      d.lineBetween(x - 2, y + 5, x + 6, y - 5)
    } else if (i === this.phaseIdx) {
      d.fillStyle(C.sun, 0.32); d.fillCircle(x, y, 15)
      d.lineStyle(5, C.sun, 1); d.strokeCircle(x, y, 15)
    } else {
      d.fillStyle(C.white, 0.16); d.fillCircle(x, y, 11)
      d.lineStyle(3, C.white, 0.42); d.strokeCircle(x, y, 11)
    }
  }

  // ═════════════════════════════════════════════════ tabuleiro

  private get cell() {
    const { cols, rows } = this.phase.gridSize
    return Math.floor(Math.min((BOARD.w - 70) / cols, (BOARD.h - 110) / rows))
  }

  private get boardOrigin() {
    const { cols, rows } = this.phase.gridSize
    const c = this.cell
    return { x: BOARD.cx - (cols * c) / 2, y: BOARD.cy - (rows * c) / 2 + 22 }
  }

  private gridToWorld(gx: number, gy: number) {
    const c = this.cell
    const o = this.boardOrigin
    return { x: o.x + gx * c + c / 2, y: o.y + gy * c + c / 2 }
  }

  private buildBoard() {
    paperCard(this, BOARD.cx, BOARD.cy, BOARD.w, BOARD.h, { edge: C.sky }).setDepth(0)
    headerBand(this, BOARD.cx, BOARD.cy - BOARD.h / 2, BOARD.w - 12, BAND_H, C.sky, C.skyDeep, 22)
      .setDepth(1)
    this.goalLabel = label(this, BOARD.cx, BOARD.cy - BOARD.h / 2 + BAND_H / 2 + 2,
      this.phase.goal, { size: 22, color: C.white, wrap: BOARD.w - 80 }).setDepth(2)

    const { cols, rows } = this.phase.gridSize
    const c = this.cell

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = this.gridToWorld(x, y)
        const dark = (x + y) % 2 === 1
        const tile = this.add.graphics().setDepth(2)
        tile.fillStyle(dark ? C.paperShade : C.paperEdge, dark ? 0.85 : 0.6)
        tile.fillRoundedRect(p.x - c / 2 + 3, p.y - c / 2 + 3, c - 6, c - 6, 10)
        this.add.image(p.x, p.y, "grid-tile")
          .setDisplaySize(c - 6, c - 6).setAlpha(0.4).setDepth(3)
      }
    }

    // Brilho do palco: Graphics posicionado, desenho em (0,0).
    // Desenhar em coordenada absoluta e escalar joga o objeto para o canto.
    const t = this.gridToWorld(this.phase.target.x, this.phase.target.y)
    const glow = this.add.graphics({ x: t.x, y: t.y }).setDepth(4)
    glow.fillStyle(C.sun, 0.28)
    glow.fillCircle(0, 0, c * 0.55)
    this.tweens.add({
      targets: glow, alpha: 0.4, scale: 1.14,
      duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    })
    this.add.image(t.x, t.y, "goal-stage").setDisplaySize(c - 8, c - 8).setDepth(5)

    if (this.phase.checkpoint) {
      const k = this.gridToWorld(this.phase.checkpoint.x, this.phase.checkpoint.y)
      this.checkpointImg = this.add.image(k.x, k.y, "path-mark")
        .setDisplaySize(c - 16, c - 16).setDepth(5).setAlpha(0.92)
      this.checkpointScale = this.checkpointImg.scaleX
      this.tweens.add({
        targets: this.checkpointImg, scale: this.checkpointScale * 1.08,
        duration: 780, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
      })
    }

    this.phase.obstacles.forEach((o) => {
      const p = this.gridToWorld(o.x, o.y)
      this.add.image(p.x, p.y, "obstacle-cone").setDisplaySize(c - 10, c - 10).setDepth(6)
    })
  }

  private buildRobot() {
    const c = this.cell
    const p = this.gridToWorld(this.robotPos.x, this.robotPos.y)

    this.robotShadow = this.add.ellipse(0, c * 0.34, c * 0.5, c * 0.18, 0x0a1626, 0.22)
    this.robotSprite = this.add.image(0, -c * 0.06,
      this.textures.exists("robot-cutout") ? "robot-cutout" : "robot")

    const src = this.robotSprite.texture.getSourceImage() as { width: number; height: number }
    this.robotBaseScale = (c * 0.86) / src.height
    this.robotSprite.setScale(this.robotBaseScale).setOrigin(0.5, 0.62)

    this.robot = this.add.container(p.x, p.y, [this.robotShadow, this.robotSprite]).setDepth(20)
    this.faceDirection(this.phase.direction, true)
  }

  // ═════════════════════════════════════════════════ painel lateral

  private buildSidePanel() {
    paperCard(this, SIDE.cx, SIDE.cy, SIDE.w, SIDE.h, { edge: C.grape }).setDepth(0)
    headerBand(this, SIDE.cx, SIDE.cy - SIDE.h / 2, SIDE.w - 12, BAND_H, C.grape, C.grapeDeep, 22)
      .setDepth(1)
    label(this, SIDE.cx, SIDE.cy - SIDE.h / 2 + BAND_H / 2 + 2, "MONTE O CAMINHO",
      { size: 22, color: C.white }).setDepth(2)

    label(this, SIDE.cx, 200, "Toque numa seta para dar um passo",
      { size: 18, color: C.inkSoft, weight: "bold" }).setDepth(2)

    const order: Direction[] = ["up", "right", "down", "left"]
    order.forEach((dir, i) => {
      const meta = DIRECTION_META[dir]
      const x = DIR_X[i % 2]
      const y = DIR_Y[Math.floor(i / 2)]
      const tone = i % 2 === 0 ? C.sky : C.grape
      const deep = i % 2 === 0 ? C.skyDeep : C.grapeDeep

      // labelX empurra o texto para a direita do ícone: "Esquerda" não cabia centralizado
      const btn = chunkyButton(this, x, y, DIR_W, DIR_H, meta.label, tone, deep,
        () => this.addCommand(dir), { size: 20, labelX: 32, wrap: 118 })
      btn.root.setDepth(3)

      const icon = this.add.image(-64, -3, "block-move").setAngle(meta.angle)
      this.fitImage(icon, 52, 46)
      btn.root.addAt(icon, 2)

      this.dirBtns.push(btn)
    })

    const sep = this.add.graphics().setDepth(2)
    sep.fillStyle(C.paperShade, 1)
    sep.fillRoundedRect(SIDE.cx - 210, 432, 420, 4, 2)

    label(this, SIDE.cx - 92, 466, "PROGRAMA", { size: 19, color: C.ink }).setDepth(2)
    this.counterText = label(this, SIDE.cx + 152, 466, "", { size: 19, color: C.mintDeep })
      .setDepth(2)

    this.slotLayer = this.add.graphics().setDepth(2)
    this.blockLayer = this.add.container(0, 0).setDepth(3)

    this.runBtn = chunkyButton(this, ACTION.run.x, ACTION_Y, ACTION.run.w, 66, "Executar",
      C.mint, C.mintDeep, () => this.execute(), { size: 22 })
    this.undoBtn = chunkyButton(this, ACTION.undo.x, ACTION_Y, ACTION.undo.w, 66, "Apagar",
      C.sun, C.sunDeep, () => this.undo(), { size: 19, textColor: C.ink })
    this.clearBtn = chunkyButton(this, ACTION.clear.x, ACTION_Y, ACTION.clear.w, 66, "Limpar",
      C.coral, C.coralDeep, () => this.clearProgram(), { size: 19 })

      ;[this.runBtn, this.undoBtn, this.clearBtn].forEach(b => b.root.setDepth(3))
  }

  private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    const src = image.texture.getSourceImage() as { width: number; height: number }
    const k = Math.min(maxW / (src.width || maxW), maxH / (src.height || maxH))
    image.setDisplaySize((src.width || maxW) * k, (src.height || maxH) * k)
    return image
  }

  // ═════════════════════════════════════════════════ fita de execução

  /** Monta a fita sobre a faixa do tabuleiro. O tamanho do chip encolhe
   *  conforme o programa cresce, para 14 comandos ainda caberem. */
  private buildTape() {
    this.destroyTape()
    const n = this.program.length
    if (!n) return

    const size = n <= 8 ? 52 : n <= 11 ? 44 : 38
    const gap = n <= 8 ? 8 : n <= 11 ? 6 : 5
    const totalW = n * size + (n - 1) * gap
    const bgW = totalW + 44
    const bgH = size + 24

    const root = this.add.container(BOARD.cx, TAPE_Y).setDepth(60)


    const bg = this.add.graphics()
    bg.fillStyle(C.sun, 0.16)
    bg.fillRoundedRect(-bgW / 2 - 12, -bgH / 2 - 12, bgW + 24, bgH + 24, (bgH + 24) / 2)
    bg.fillStyle(C.shadow, 0.32)
    bg.fillRoundedRect(-bgW / 2, -bgH / 2 + 7, bgW, bgH, bgH / 2)
    bg.fillStyle(C.headerDeep, 0.96)
    bg.fillRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, bgH / 2)
    bg.lineStyle(3, C.sun, 0.85)
    bg.strokeRoundedRect(-bgW / 2, -bgH / 2, bgW, bgH, bgH / 2)
    root.add(bg)

    const x0 = -totalW / 2 + size / 2
    this.program.forEach((cmd, i) => {
      const cx = x0 + i * (size + gap)
      const g = this.add.graphics()
      const icon = this.add.image(cx, 0, "block-move")
        .setAngle(DIRECTION_META[cmd.direction].angle)
      this.fitImage(icon, size * 0.6, size * 0.52)
      root.add([g, icon])
      this.tapeChips.push({ g, icon, x: cx, size, iconScale: icon.scaleX })
    })

    this.tapeRoot = root
    this.paintTape(-1)

    root.setAlpha(0).setY(TAPE_ENTER_Y)
    this.tweens.add({ targets: root, alpha: 1, y: TAPE_Y, duration: 300, ease: "Back.easeOut" })
  }

  private paintTape(active: number, failed = -1) {
    this.tapeChips.forEach((chip, i) => {
      const cmd = this.program[i]
      const done = i < active
      const isNow = i === active
      const isBad = i === failed

      const tone = isBad ? C.coral : isNow ? C.sun : done ? C.mint : this.commandTone(cmd)
      const deep = isBad ? C.coralDeep : isNow ? C.sunDeep : done ? C.mintDeep : this.commandDeep(cmd)
      const s = chip.size
      const g = chip.g

      g.clear()
      g.fillStyle(deep, 1)
      g.fillRoundedRect(chip.x - s / 2, -s / 2, s, s, 12)
      g.fillStyle(tone, done && !isNow ? 0.6 : 1)
      g.fillRoundedRect(chip.x - s / 2, -s / 2, s, s - 3, 12)
      g.fillStyle(C.white, done && !isNow ? 0.12 : 0.26)
      g.fillRoundedRect(chip.x - s / 2 + 6, -s / 2 + 4, s - 12, 10, 5)

      if (isNow || isBad) {
        g.lineStyle(4, isBad ? C.white : C.white, 1)
        g.strokeRoundedRect(chip.x - s / 2 - 4, -s / 2 - 4, s + 8, s + 8, 16)
      }

      chip.icon.setAlpha(done && !isNow ? 0.45 : 1)
      chip.icon.setScale(chip.iconScale)
    })
  }

  /** Acende o passo atual e dá um pulso no ícone. */
  private markTape(i: number) {
    this.paintTape(i)
    const chip = this.tapeChips[i]
    if (!chip) return
    this.tweens.add({
      targets: chip.icon,
      scale: chip.iconScale * 1.4,
      duration: 150, yoyo: true, ease: "Back.easeOut",
    })
  }

  private destroyTape() {
    this.tapeRoot?.destroy()
    this.tapeRoot = undefined
    this.tapeChips = []
  }

  private hideTape() {
    const root = this.tapeRoot
    this.tapeRoot = undefined
    this.tapeChips = []
    if (root) {
      this.tweens.add({
        targets: root, alpha: 0, y: TAPE_ENTER_Y, duration: 240, ease: "Sine.easeIn",
        onComplete: () => root.destroy(),
      })
    }
    this.tweens.add({ targets: this.goalLabel, alpha: 1, duration: 240 })
  }

  private slotPos(i: number) {
    const col = i % SLOT_COLS
    const row = Math.floor(i / SLOT_COLS)
    const rowW = SLOT_COLS * SLOT + (SLOT_COLS - 1) * SLOT_GAP
    return {
      x: SIDE.cx - rowW / 2 + SLOT / 2 + col * (SLOT + SLOT_GAP),
      y: SLOTS_Y[Math.min(row, SLOTS_Y.length - 1)],
    }
  }

  private renderProgram() {
    this.slotLayer.clear()
    this.blockLayer.removeAll(true)

    for (let i = 0; i < this.phase.maxBlocks; i++) {
      const p = this.slotPos(i)
      this.slotLayer.fillStyle(C.paperEdge, 1)
      this.slotLayer.fillRoundedRect(p.x - SLOT / 2, p.y - SLOT / 2, SLOT, SLOT, 12)
      this.slotLayer.lineStyle(3, C.paperShade, 1)
      this.slotLayer.strokeRoundedRect(p.x - SLOT / 2, p.y - SLOT / 2, SLOT, SLOT, 12)
    }

    this.program.forEach((cmd, i) => {
      const p = this.slotPos(i)
      const isRunning = i === this.runningIndex
      const isFailed = i === this.failedIndex
      const tone = isFailed ? C.coral : isRunning ? C.sun : this.commandTone(cmd)
      const deep = isFailed ? C.coralDeep : isRunning ? C.sunDeep : this.commandDeep(cmd)

      const g = this.add.graphics()
      g.fillStyle(deep, 1); g.fillRoundedRect(p.x - SLOT / 2, p.y - SLOT / 2, SLOT, SLOT, 12)
      g.fillStyle(tone, 1); g.fillRoundedRect(p.x - SLOT / 2, p.y - SLOT / 2, SLOT, SLOT - 4, 12)
      g.fillStyle(C.white, 0.26)
      g.fillRoundedRect(p.x - SLOT / 2 + 7, p.y - SLOT / 2 + 5, SLOT - 14, 12, 6)

      const icon = this.add.image(p.x, p.y, "block-move")
        .setAngle(DIRECTION_META[cmd.direction].angle)
      this.fitImage(icon, 30, 26)
      this.blockLayer.add([g, icon])

      if (isRunning || isFailed) {
        const ring = this.add.graphics({ x: p.x, y: p.y })
        ring.lineStyle(4, isFailed ? C.coralDeep : C.sunDeep, 1)
        ring.strokeRoundedRect(-SLOT / 2 - 4, -SLOT / 2 - 4, SLOT + 8, SLOT + 8, 15)
        this.blockLayer.add(ring)
        this.tweens.add({
          targets: ring, alpha: 0.3, scale: 1.06,
          duration: 420, yoyo: true, repeat: -1,
        })
      }
    })

    const full = this.program.length >= this.phase.maxBlocks
    this.counterText.setText(`${this.program.length} / ${this.phase.maxBlocks}`)
    this.counterText.setColor(hex(full ? C.coralDeep : C.mintDeep))

    const idle = !this.running && !this.ended
    this.runBtn.setEnabled(idle && this.program.length > 0)
    this.undoBtn.setEnabled(idle && this.program.length > 0)
    this.clearBtn.setEnabled(idle && this.program.length > 0)
    this.dirBtns.forEach(b => b.setEnabled(idle && !full))
  }

  private commandTone(cmd: RobotCommand) {
    return cmd.direction === "left" || cmd.direction === "right" ? C.grape : C.sky
  }
  private commandDeep(cmd: RobotCommand) {
    return cmd.direction === "left" || cmd.direction === "right" ? C.grapeDeep : C.skyDeep
  }

  private addCommand(direction: Direction) {
    if (this.running || this.ended) return
    if (this.program.length >= this.phase.maxBlocks) return

    this.failedIndex = -1
    this.program.push({ type: "move", direction })
    this.playClick()
    this.renderProgram()

    // Graphics posicionado + desenho relativo: sem isso o pulso escapa
    // para o canto inferior direito ao ser escalado.
    const p = this.slotPos(this.program.length - 1)
    const pop = this.add.graphics({ x: p.x, y: p.y }).setDepth(4)
    pop.lineStyle(4, C.white, 0.9)
    pop.strokeRoundedRect(-SLOT / 2, -SLOT / 2, SLOT, SLOT, 12)
    this.tweens.add({
      targets: pop, alpha: 0, scale: 1.35, duration: 280,
      onComplete: () => pop.destroy(),
    })
  }

  private undo() {
    if (this.running || !this.program.length) return
    this.program.pop()
    this.failedIndex = -1
    this.playClick()
    this.renderProgram()
  }

  private clearProgram() {
    if (this.running || !this.program.length) return
    this.program = []
    this.failedIndex = -1
    this.playClick()
    this.renderProgram()
  }

  // ═════════════════════════════════════════════════ execução

  private zoomIn() {
    this.cameras.main.pan(BOARD.cx, BOARD.cy + 10, 420, "Sine.easeInOut")
    this.cameras.main.zoomTo(1.24, 420, "Sine.easeInOut")
  }

  private zoomOut(): Promise<void> {
    this.cameras.main.pan(W / 2, H / 2, 380, "Sine.easeInOut")
    this.cameras.main.zoomTo(1, 380, "Sine.easeInOut")
    return new Promise(r => this.time.delayedCall(400, () => r()))
  }

  private async execute() {
    if (this.running || this.ended || !this.program.length) return

    this.running = true
    this.failedIndex = -1
    this.clearFootprints()
    this.resetRobot()
    this.renderProgram()

    this.tweens.add({ targets: this.goalLabel, alpha: 0, duration: 200 })
    this.buildTape()
    this.showFocus()
    this.zoomIn()
    await this.wait(520)

    const visited: GridPoint[] = [{ ...this.robotPos }]

    for (let i = 0; i < this.program.length; i++) {
      const cmd = this.program[i]
      this.runningIndex = i
      this.renderProgram()
      this.markTape(i)

      const next: GridPoint = {
        x: this.robotPos.x + DIRECTION_META[cmd.direction].dx,
        y: this.robotPos.y + DIRECTION_META[cmd.direction].dy,
      }

      await this.showDirectionCue(cmd.direction)
      await this.faceDirection(cmd.direction)

      if (!this.isInside(next.x, next.y)) {
        await this.bump(cmd.direction)
        await this.fail(i, "O robô saiu da pista aqui.")
        return
      }
      if (this.isObstacle(next.x, next.y)) {
        await this.bump(cmd.direction)
        await this.fail(i, "Tem um cone bloqueando este passo.")
        return
      }

      await this.stepTo(next, cmd.direction)
      this.robotPos = next
      visited.push({ ...next })

      if (this.phase.checkpoint
        && next.x === this.phase.checkpoint.x && next.y === this.phase.checkpoint.y) {
        this.burstCheckpoint()
      }
    }

    this.runningIndex = -1
    this.paintTape(this.program.length)   // tudo cumprido
    this.renderProgram()

    const onTarget = this.robotPos.x === this.phase.target.x
      && this.robotPos.y === this.phase.target.y
    const passedCheck = !this.phase.checkpoint
      || visited.some(p => p.x === this.phase.checkpoint!.x && p.y === this.phase.checkpoint!.y)

    if (onTarget && passedCheck) { await this.succeed(); return }

    this.errors += 1
    this.running = false
    this.renderProgram()
    runtimeGameBridge.emit({
      type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.level.level, pointsEarned: 0,
    })
    this.playWrong()
    this.cameras.main.shake(160, 0.004)

    this.hideTape()
    this.hideFocus()
    await this.zoomOut()

    floatingNote(this, W / 2, 320,
      onTarget
        ? "Chegou ao palco, mas pulou a pegada. Ajuste o caminho."
        : "O robô parou fora do palco. Confira o programa.",
      { tone: C.sun, deep: C.sunDeep })
    this.time.delayedCall(700, () => this.resetRobot())
  }

  private showFocus() {
    if (this.focusVeil) return

    const l = BOARD.cx - BOARD.w / 2 - 10
    const r = BOARD.cx + BOARD.w / 2 + 10
    const t = BOARD.cy - BOARD.h / 2 - 10
    const b = BOARD.cy + BOARD.h / 2 + 10

    const g = this.add.graphics().setDepth(45).setAlpha(0)

    g.fillStyle(C.deep, 0.78)
    g.fillRect(0, 0, W, t)
    g.fillRect(0, b, W, H - b)
    g.fillRect(0, t, l, b - t)
    g.fillRect(r, t, W - r, b - t)

    for (let i = 0; i < 6; i++) {
      g.lineStyle(9, C.deep, 0.4 * (1 - i / 6))
      g.strokeRoundedRect(
        l + 4 + i * 7, t + 4 + i * 7,
        (r - l) - 8 - i * 14, (b - t) - 8 - i * 14, 30,
      )
    }

    this.focusVeil = g
    this.tweens.add({ targets: g, alpha: 1, duration: 320, ease: "Sine.easeOut" })
  }

  private hideFocus() {
    const g = this.focusVeil
    if (!g) return
    this.focusVeil = undefined
    this.tweens.add({
      targets: g, alpha: 0, duration: 280, ease: "Sine.easeIn",
      onComplete: () => g.destroy(),
    })
  }

  private async fail(index: number, message: string) {
    this.errors += 1
    this.running = false
    this.runningIndex = -1
    this.failedIndex = index
    this.renderProgram()

    // O chip vermelho fica visível na fita por um instante antes de sair
    this.paintTape(index, index)

    runtimeGameBridge.emit({
      type: "WRONG_ANSWER", gameId: GAME_ID, stage: this.level.level, pointsEarned: 0,
    })
    this.playWrong()
    this.cameras.main.shake(180, 0.005)

    await this.wait(900)
    this.hideTape()
    await this.zoomOut()

    floatingNote(this, W / 2, 320, message, { tone: C.coral, deep: C.coralDeep })
    this.time.delayedCall(700, () => this.resetRobot())
  }

  private async succeed() {
    this.running = false
    this.hits += 1

    const efficient = this.program.length <= this.phase.minBlocks
    const inTime = this.timeLeft > 0
    const gained = 10 + (efficient ? 5 : 0) + (inTime ? 3 : 0)
    this.score += gained
    this.timerOn = false

    runtimeGameBridge.emit({
      type: "CORRECT_ANSWER", gameId: GAME_ID, stage: this.level.level, pointsEarned: gained,
    })
    this.emitCheckpoint()
    this.playCorrect()

    const t = this.gridToWorld(this.phase.target.x, this.phase.target.y)
    this.celebrate(t.x, t.y)

    await this.wait(700)
    this.hideTape()
    await this.zoomOut()

    await this.wait(700)
    await this.zoomOut()

    floatingNote(this, W / 2, 320,
      efficient ? `Perfeito! Caminho mais curto. +${gained}` : `Muito bem! +${gained}`,
      { tone: C.mint, deep: C.mintDeep })

    this.time.delayedCall(1300, () => this.advance())
  }

  private advance() {
    const lastPhase = this.phaseIdx + 1 >= this.level.phases.length
    const lastLevel = this.levelIdx + 1 >= LEVELS.length

    if (!lastPhase) {
      this.scene.restart({
        level: this.level.level, phase: this.phaseIdx + 1,
        score: this.score, hits: this.hits, errors: this.errors,
      } satisfies GameSceneData)
      return
    }

    this.ended = true

    if (!lastLevel) {
      showLevelComplete(this, {
        subtitle: `Nível ${this.level.level} concluído`,
        message: LEVELS[this.levelIdx + 1].objective,
        accent: C.sun,
        overlayColor: C.deep,
        titleColor: hex(C.ink),
        subtitleColor: hex(C.grapeDeep),
        progress: { total: LEVELS.length, current: this.level.level },
        autoAdvance: {
          delay: 2600,
          onComplete: () => this.scene.restart({
            level: this.level.level + 1, phase: 0,
            score: this.score, hits: this.hits, errors: this.errors,
          } satisfies GameSceneData),
        },
      })
      return
    }

    runtimeGameBridge.emit({ type: "GAME_COMPLETED", gameId: GAME_ID, stage: this.level.level })
    confetti(this)
    showLevelComplete(this, {
      title: "Desfile completo!",
      subtitle: `${this.score} pontos`,
      message: `Você programou o robô por 9 pistas — ${this.hits} acertos.`,
      accent: C.mint,
      overlayColor: C.deep,
      titleColor: hex(C.ink),
      subtitleColor: hex(C.mintDeep),
      progress: { total: LEVELS.length, current: LEVELS.length },
      buttons: [
        {
          label: "Jogar de novo", color: C.mintDeep,
          onClick: () => this.scene.restart({ level: 1, phase: 0, score: 0, hits: 0, errors: 0 }),
        },
        { label: "Outros jogos", color: C.grapeDeep, onClick: () => EventBus.emit("exit-game") },
      ],
    })
  }

  // ═════════════════════════════════════════════════ robô

  private wait(ms: number): Promise<void> {
    return new Promise(r => this.time.delayedCall(ms, () => r()))
  }

  /** Seta grande acima do robô: anuncia o passo antes de executá-lo. */
  private showDirectionCue(dir: Direction): Promise<void> {
    const c = this.cell
    const cue = this.add.image(this.robot.x, this.robot.y - c * 0.8, "block-move")
      .setAngle(DIRECTION_META[dir].angle).setDepth(40)
    this.fitImage(cue, c * 0.52, c * 0.46)

    const base = cue.scaleX
    cue.setScale(base * 0.3).setAlpha(0)

    return new Promise((resolve) => {
      this.tweens.add({
        targets: cue, scale: base, alpha: 1,
        duration: 170, ease: "Back.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: cue, alpha: 0, y: cue.y - 16,
            duration: 180, delay: 90,
            onComplete: () => { cue.destroy(); resolve() },
          })
        },
      })
    })
  }

  private faceDirection(dir: Direction, instant = false): Promise<void> {
    const flip = dir === "left"
    if (instant) { this.robotSprite.setFlipX(flip); return Promise.resolve() }
    if (this.robotSprite.flipX === flip) return Promise.resolve()

    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.robotSprite, scaleX: this.robotBaseScale * 0.25,
        duration: 90, ease: "Sine.easeIn",
        onComplete: () => {
          this.robotSprite.setFlipX(flip)
          this.tweens.add({
            targets: this.robotSprite, scaleX: this.robotBaseScale,
            duration: 120, ease: "Back.easeOut",
            onComplete: () => resolve(),
          })
        },
      })
    })
  }

  private stepTo(target: GridPoint, dir: Direction): Promise<void> {
    const from = { x: this.robot.x, y: this.robot.y }
    const to = this.gridToWorld(target.x, target.y)
    const c = this.cell
    const hop = c * 0.15
    const tilt = dir === "left" ? -1 : 1

    this.dropFootprint(from.x, from.y)
    this.playStep()

    const p = { t: 0 }
    return new Promise((resolve) => {
      this.tweens.add({
        targets: p, t: 1, duration: 380, ease: "Sine.easeInOut",
        onUpdate: () => {
          const t = p.t
          const bob = Math.abs(Math.sin(t * Math.PI * 2))
          this.robot.x = Phaser.Math.Linear(from.x, to.x, t)
          this.robot.y = Phaser.Math.Linear(from.y, to.y, t) - bob * hop
          this.robotSprite.setScale(
            this.robotBaseScale * (1 - bob * 0.05),
            this.robotBaseScale * (1 + bob * 0.08),
          )
          this.robotSprite.setAngle(Math.sin(t * Math.PI * 4) * 4 * tilt)
          this.robotShadow.setScale(1 - bob * 0.28, 1 - bob * 0.2)
          this.robotShadow.setAlpha(0.22 - bob * 0.09)
        },
        onComplete: () => {
          this.robot.setPosition(to.x, to.y)
          this.robotSprite.setScale(this.robotBaseScale).setAngle(0)
          this.robotShadow.setScale(1).setAlpha(0.22)
          resolve()
        },
      })
    })
  }

  private bump(dir: Direction): Promise<void> {
    const meta = DIRECTION_META[dir]
    const c = this.cell
    const from = { x: this.robot.x, y: this.robot.y }

    this.robotSprite.setTint(0xff9b8f)
    return new Promise((resolve) => {
      this.tweens.add({
        targets: this.robot,
        x: from.x + meta.dx * c * 0.32, y: from.y + meta.dy * c * 0.32,
        duration: 130, ease: "Quad.easeOut", yoyo: true,
        onComplete: () => {
          this.robot.setPosition(from.x, from.y)
          this.robotSprite.clearTint()
          resolve()
        },
      })
    })
  }

  /** A pegada estoura quando o robô pisa nela — confirma que o requisito foi cumprido. */
  private burstCheckpoint() {
    const img = this.checkpointImg
    if (!img || this.checkpointTaken) return
    this.checkpointTaken = true

    const x = img.x, y = img.y
    this.tweens.killTweensOf(img)
    this.tweens.add({
      targets: img, scale: this.checkpointScale * 2.1, alpha: 0, angle: 45,
      duration: 340, ease: "Back.easeOut",
    })

    const ring = this.add.graphics({ x, y }).setDepth(30)
    ring.lineStyle(6, C.sun, 1)
    ring.strokeCircle(0, 0, this.cell * 0.28)
    this.tweens.add({
      targets: ring, scale: 2.2, alpha: 0, duration: 420,
      ease: "Cubic.easeOut", onComplete: () => ring.destroy(),
    })

    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12
      const dot = this.add.circle(x, y, 6, i % 2 ? C.sun : C.mint).setDepth(31)
      this.tweens.add({
        targets: dot,
        x: x + Math.cos(a) * this.cell * 0.8,
        y: y + Math.sin(a) * this.cell * 0.8,
        alpha: 0, scale: 0.2, duration: 480, ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      })
    }

    this.tone(880, 0.1, "sine", 0.2)
    this.tone(1180, 0.12, "sine", 0.16, 0.08)
  }

  private restoreCheckpoint() {
    const img = this.checkpointImg
    if (!img) return
    this.checkpointTaken = false
    this.tweens.killTweensOf(img)
    img.setScale(this.checkpointScale).setAlpha(0.92).setAngle(0)
    this.tweens.add({
      targets: img, scale: this.checkpointScale * 1.08,
      duration: 780, yoyo: true, repeat: -1, ease: "Sine.easeInOut",
    })
  }

  private dropFootprint(x: number, y: number) {
    const c = this.cell
    const mark = this.add.image(x, y + c * 0.22, "path-mark")
      .setDisplaySize(c * 0.3, c * 0.3).setAlpha(0.55)
      .setAngle(Phaser.Math.Between(-16, 16)).setDepth(7)
    this.footprints.push(mark)
    this.tweens.add({ targets: mark, alpha: 0.28, duration: 600 })
  }

  private clearFootprints() {
    this.footprints.forEach(f => f.destroy())
    this.footprints = []
  }

  private resetRobot() {
    this.robotPos = { ...this.phase.start }
    const p = this.gridToWorld(this.robotPos.x, this.robotPos.y)
    this.clearFootprints()
    this.restoreCheckpoint()
    this.tweens.add({ targets: this.robot, x: p.x, y: p.y, duration: 260, ease: "Back.easeOut" })
    this.faceDirection(this.phase.direction, true)
  }

  private celebrate(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const a = (Math.PI * 2 * i) / 14
      const dot = this.add.circle(x, y, 7, [C.sun, C.mint, C.coral, C.sky][i % 4]).setDepth(30)
      this.tweens.add({
        targets: dot, x: x + Math.cos(a) * 90, y: y + Math.sin(a) * 90,
        alpha: 0, scale: 0.3, duration: 620, ease: "Cubic.easeOut",
        onComplete: () => dot.destroy(),
      })
    }
    this.tweens.add({
      targets: this.robot, y: this.robot.y - 24,
      duration: 220, yoyo: true, repeat: 2, ease: "Sine.easeOut",
    })
  }

  // ═════════════════════════════════════════════════ overlays

  private startPlay() {
    this.timerOn = true
    this.renderProgram()
  }

  private showLevelIntro(onStart: () => void) {
    const dim = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.6)
      .setDepth(300).setInteractive()
    const modal = this.add.container(W / 2, H / 2).setDepth(301)

    const MW = 620, MH = 400
    modal.add(paperCard(this, 0, 0, MW, MH, { edge: C.sun }))
    modal.add(headerBand(this, 0, -MH / 2 + 6, MW - 12, 48, C.sun, C.sunDeep, 22))
    modal.add(label(this, 0, -MH / 2 + 30, `NÍVEL ${this.level.level} DE ${LEVELS.length}`,
      { size: 20, color: C.ink }))
    modal.add(label(this, 0, -MH / 2 + 108, this.level.title, { size: 40, color: C.ink }))
    modal.add(label(this, 0, -MH / 2 + 176, this.level.objective,
      { size: 21, color: C.inkSoft, weight: "bold", wrap: MW - 110 }))
    modal.add(label(this, 0, -MH / 2 + 252, "3 pistas neste nível",
      { size: 18, color: C.grapeDeep }))

    const go = () => {
      this.tweens.add({
        targets: [modal, dim], alpha: 0, duration: 200,
        onComplete: () => { modal.destroy(); dim.destroy(); onStart() },
      })
    }
    modal.add(chunkyButton(this, 0, MH / 2 - 62, 280, 66, "Começar",
      C.mint, C.mintDeep, go, { size: 23 }).root)

    modal.setScale(0.9).setAlpha(0)
    this.tweens.add({ targets: modal, scale: 1, alpha: 1, duration: 280, ease: "Back.easeOut" })
  }

  private runTutorial(once: boolean, onDone: () => void) {
    const steps: TutorialStep[] = [
      {
        text: "O robô precisa chegar ao palco e pisar na pegada do caminho.",
        shape: "rect", x: BOARD.cx, y: BOARD.cy, w: BOARD.w + 24, h: BOARD.h + 24,
        balloonX: 990, balloonY: 250,
      },
      {
        text: "Toque nas setas. Cada toque é um passo do robô.",
        shape: "rect", x: SIDE.cx, y: 316, w: SIDE.w - 30, h: 230,
        balloonX: 400, balloonY: 250,
      },
      {
        text: "Os passos aparecem aqui, na ordem em que o robô vai obedecer.",
        shape: "rect", x: SIDE.cx, y: 514, w: SIDE.w - 30, h: 150,
        balloonX: 400, balloonY: 250,
      },
      {
        text: "Toque em Executar: a tela aproxima e cada seta acende antes do passo. Se errar, o passo fica vermelho — é só corrigir.",
        shape: "rect", x: ACTION.run.x, y: ACTION_Y, w: 210, h: 90,
        balloonX: 420, balloonY: 300,
        buttonLabel: "Vamos lá!",
      },
    ]
    createTutorial(this, {
      key: `robo-l${this.level.level}`, once, accent: C.sun,
      safeTop: HEADER_H + 12, steps, onFinish: onDone,
    })
  }

  private isInside(x: number, y: number) {
    return x >= 0 && x < this.phase.gridSize.cols && y >= 0 && y < this.phase.gridSize.rows
  }

  private isObstacle(x: number, y: number) {
    return this.phase.obstacles.some(o => o.x === x && o.y === y)
  }

  private emitCheckpoint() {
    const total = LEVELS.reduce((n, l) => n + l.phases.length, 0)
    const before = LEVELS.slice(0, this.levelIdx).reduce((n, l) => n + l.phases.length, 0)
    runtimeGameBridge.emit({
      type: "CHECKPOINT", gameId: GAME_ID, stage: this.level.level,
      progress: Math.round(((before + this.phaseIdx) / total) * 100),
      score: this.score, hits: this.hits, errors: this.errors,
    })
  }

  private registerPlatform() {
    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type !== "START_GAME" || cmd.gameId !== GAME_ID) return
      if (cmd.stage === this.level.level) return
      this.scene.restart({ level: cmd.stage, phase: 0, score: this.score })
    })
  }

  private tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.16, delay = 0) {
    const ctx = (this.sound as Phaser.Sound.WebAudioSoundManager).context
    if (!ctx) return
    const osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gain.gain.setValueAtTime(vol, ctx.currentTime + delay)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + dur + 0.01)
  }
  private playClick() { this.tone(520, 0.05, "sine", 0.1) }
  private playStep() { this.tone(Phaser.Math.Between(300, 360), 0.06, "triangle", 0.07) }
  private playWrong() { this.tone(240, 0.14, "square", 0.13); this.tone(180, 0.2, "square", 0.1, 0.12) }
  private playCorrect() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, "sine", 0.2, i * 0.1))
  }
}