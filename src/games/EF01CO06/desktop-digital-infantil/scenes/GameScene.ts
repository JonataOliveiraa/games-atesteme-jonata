import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import type { RoundResult } from '../../../../shared/types/game'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/levels'
import type { LevelConfig, Mission, MissionStep } from '../types'
import {
  W, H, C, hex, SKIN, label, paperCard, headerBand, glassBar,
  chunkyButton, circleButton, floatingNote, type AppId,
} from '../ui/kit'
import { APP_BUILDERS, type AppView, type Area } from '../apps/apps'

/**
 * Quantos desvios até o jogo contar um erro para a plataforma.
 *
 * Dois são exploração — a criança está descobrindo o que cada app faz, e é
 * isso que a habilidade pede. Do terceiro em diante é outra coisa.
 */
const DESVIOS_ATE_CONTAR = 3

const GAME_ID = 'desktop-digital-infantil'

const WIN_W = 640, WIN_H = 520
const WIN_HEADER = 74
const WIN_DY = 14

const AREA: Area = {
  top: -WIN_H / 2 + WIN_HEADER,
  h: WIN_H - WIN_HEADER,
  w: WIN_W,
  cy: -WIN_H / 2 + WIN_HEADER + (WIN_H - WIN_HEADER) / 2,
}

const HEADER_H = 92
const SHELF_H = 86

const CARD_X = 212, CARD_Y = 348
const CARD_W = 350, CARD_H = 344
const CARD_BAND_H = 56
const CARD_CONTENT_TOP = -CARD_H / 2 + CARD_BAND_H + 20
const CARD_TITLE_MAX_H = 116

/** Quanto tempo a criança pode hesitar antes do jogo acender o ícone certo. */
const HINT_AFTER_MS = 9000

export class GameScene extends Phaser.Scene {
  private cfg!: LevelConfig
  private missionIdx = 0
  private stepIdx = 0
  private done = 0

  private points = 0
  private lives = 1
  private startedAt = 0
  private muted = false
  private running = false
  private ended = false
  private errors = 0

  /**
   * Desvios desde a última vida cobrada. Separado de `errors`, que é
   * telemetria e não pode zerar.
   */
  private offTaskTaps = 0

  private unsubCommands?: () => void

  private wallpaper!: Phaser.GameObjects.Image
  private iconNodes = new Map<AppId, Phaser.GameObjects.Container>()
  private hintTimer?: Phaser.Time.TimerEvent
  private hintGlow?: Phaser.GameObjects.Graphics

  private taskCard!: Phaser.GameObjects.Container
  private taskTitle!: Phaser.GameObjects.Text
  private taskBody!: Phaser.GameObjects.Text
  private taskChip!: Phaser.GameObjects.Container
  private taskChipIcon!: Phaser.GameObjects.Image
  private taskChipText!: Phaser.GameObjects.Text
  private taskTyper?: Typewriter
  private railDots: Phaser.GameObjects.Graphics[] = []

  private windowRoot?: Phaser.GameObjects.Container
  private windowDim?: Phaser.GameObjects.Rectangle
  private activeApp?: AppView

  private clockLabel!: Phaser.GameObjects.Text
  private clockNow = { h: 8, m: 45 }

  constructor() { super({ key: 'GameScene' }) }

  init(data: { level?: number; points?: number; lives?: number }) {
    const lvl = (data?.level ?? 1) as 1 | 2 | 3
    this.cfg = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]

    this.missionIdx = 0
    this.stepIdx = 0
    this.done = 0
    this.errors = 0
    this.offTaskTaps = 0
    this.points = data?.points ?? 0
    this.lives = data?.lives ?? 1
    this.startedAt = Date.now()
    this.running = false
    this.ended = false

    this.iconNodes.clear()
    this.railDots = []
    this.windowRoot = undefined
    this.windowDim = undefined
    this.activeApp = undefined
    this.hintTimer = undefined
    this.hintGlow = undefined
    this.taskTyper = undefined

    // A hora inicial da barra vem da primeira missão de relógio do nível
    const firstClock = this.cfg.missions
      .flatMap(m => m.steps)
      .find(s => s.clockStart)
    this.clockNow = firstClock?.clockStart ?? { h: 8, m: 45 }
  }

  create() {
    this.buildDesk()
    this.buildHeader()
    this.buildTaskCard()
    this.buildIcons()
    this.buildShelf()
    this.registerCommands()

    this.events.once('shutdown', () => {
      this.hintTimer?.remove()
      this.unsubCommands?.()
    })

    this.showIntro()
  }

  update(_t: number, dt: number) {
    this.activeApp?.tick?.(dt)
  }

  // ═══════════════════════════════════════════════ cenário

  private buildDesk() {
    this.wallpaper = this.add.image(W / 2, H / 2, 'desktop-bg').setDepth(-4)
    this.wallpaper.setDisplaySize(W, H)
    // Escurece a própria imagem: assim o recorte do glassBar já sai escuro
    // e as barras não ficam mais claras que a mesa em volta.
    this.wallpaper.setTint(0x9fb3c0)
  }

  private buildHeader() {
    glassBar(this, 0, 0, W, HEADER_H, this.wallpaper, { edge: 'bottom', accent: C.sky })
      .setDepth(40)

    const chip = this.add.graphics().setDepth(41)
    chip.fillStyle(C.white, 0.14); chip.fillRoundedRect(28, 22, 172, 48, 24)
    chip.lineStyle(2, C.white, 0.35); chip.strokeRoundedRect(28, 22, 172, 48, 24)
    label(this, 114, 46, `NÍVEL ${this.cfg.level}`, { size: 21, color: C.white }).setDepth(42)

    for (let i = 0; i < this.cfg.missions.length; i++) {
      this.railDots.push(this.add.graphics().setDepth(41))
    }
    this.repaintRail()

    const helpBtn = circleButton(this, W - 60, 46, 28, C.sun, C.sunDeep,
      () => { },
      () => this.replayTutorial())

    helpBtn.addAt(label(this, 0, 1, '?', { size: 34, color: C.ink }), 1)
    helpBtn.setDepth(42)
  }

  private railX(i: number) {
    const total = this.cfg.missions.length
    const gap = 40
    return W / 2 - ((total - 1) * gap) / 2 + i * gap
  }

  private repaintRail() {
    for (let i = 0; i < this.railDots.length; i++) {
      const d = this.railDots[i]
      const x = this.railX(i), y = 46
      d.clear()
      if (i < this.done) {
        d.fillStyle(C.mint, 1); d.fillCircle(x, y, 15)
        d.lineStyle(5, C.white, 1)
        d.lineBetween(x - 7, y, x - 2, y + 6)
        d.lineBetween(x - 2, y + 6, x + 7, y - 6)
      } else {
        d.fillStyle(C.white, 0.16); d.fillCircle(x, y, 13)
        d.lineStyle(3, C.white, 0.5); d.strokeCircle(x, y, 13)
      }
    }
  }

  private buildShelf() {
    const y = H - SHELF_H

    glassBar(this, 0, y, W, SHELF_H, this.wallpaper, { edge: 'top', accent: C.sky })
      .setDepth(30)

    this.clockLabel = label(this, W - 96, y + SHELF_H / 2, this.clockText(),
      { size: 32, color: C.white }).setDepth(31)

    label(this, 200, y + SHELF_H / 2, 'Meu Computador',
      { size: 21, color: C.white }).setDepth(31).setAlpha(0.82)

    const logo = this.add.graphics().setDepth(31)
    const lx = 34, ly = y + SHELF_H / 2
    logo.fillStyle(C.sun, 1); logo.fillRoundedRect(lx, ly - 25, 22, 22, 7)
    logo.fillStyle(C.mint, 1); logo.fillRoundedRect(lx, ly + 1, 22, 22, 7)
    logo.fillStyle(C.coral, 1); logo.fillRoundedRect(lx + 26, ly - 25, 22, 22, 7)
    logo.fillStyle(C.sky, 1); logo.fillRoundedRect(lx + 26, ly + 1, 22, 22, 7)
  }

  private clockText() {
    return `${this.clockNow.h}:${String(this.clockNow.m).padStart(2, '0')}`
  }

  private buildTaskCard() {
    const root = this.add.container(CARD_X, CARD_Y).setDepth(20)
    root.setAngle(-2)   // levemente torto: parece bilhete pregado, não HUD
    this.taskCard = root

    const card = paperCard(this, CARD_W, CARD_H, { fill: C.paper, edge: C.sun })
    const band = headerBand(this, CARD_W, CARD_BAND_H, -CARD_H / 2, C.sun, C.sunDeep)
    const bandTxt = label(this, 0, -CARD_H / 2 + CARD_BAND_H / 2, 'A TURMA PRECISA',
      { size: 19, color: C.ink })

    this.taskTitle = label(this, 0, CARD_CONTENT_TOP, '',
      { size: 24, color: C.ink, wrap: CARD_W - 56 })
    this.taskTitle.setOrigin(0.5, 0)

    this.taskBody = label(this, 0, CARD_CONTENT_TOP + 60, '',
      { size: 18, color: C.inkSoft, weight: 'bold', wrap: CARD_W - 56 })
    this.taskBody.setOrigin(0.5, 0)

    this.taskChip = this.add.container(0, CARD_H / 2 - 48).setAlpha(0)
    const chipG = this.add.graphics()
    chipG.fillStyle(C.paperEdge, 1); chipG.fillRoundedRect(-136, -30, 272, 60, 30)
    this.taskChipIcon = this.add.image(-102, 0, 'icon-relogio').setDisplaySize(46, 46)
    this.taskChipText = label(this, 22, 0, '', { size: 17, color: C.ink, wrap: 150 })
    this.taskChip.add([chipG, this.taskChipIcon, this.taskChipText])

    const skip = this.add.zone(0, 0, CARD_W, CARD_H).setInteractive({ useHandCursor: true })
    skip.on('pointerdown', () => this.taskTyper?.skip())

    root.add([card, band, bandTxt, this.taskTitle, this.taskBody, this.taskChip, skip])
  }

  private get mission(): Mission | undefined { return this.cfg.missions[this.missionIdx] }
  private get step(): MissionStep | undefined { return this.mission?.steps[this.stepIdx] }

  private refreshTask() {
    const m = this.mission, st = this.step
    if (!m || !st) return

    this.taskTyper?.skip()

    for (const size of [24, 21, 18, 16]) {
      this.taskTitle.setFontSize(size)
      this.taskTitle.setText(m.text)
      if (this.taskTitle.height <= CARD_TITLE_MAX_H) break
    }

    this.taskBody.setY(CARD_CONTENT_TOP + this.taskTitle.height + 14)

    const multi = m.steps.length > 1
    this.taskBody.setText(multi
      ? `Passo ${this.stepIdx + 1} de ${m.steps.length}: ${st.hint}`
      : st.hint)

    this.taskTyper = FX.type(this, this.taskTitle, m.text, { delay: 26 })

    this.taskChip.setAlpha(0)
    const skin = SKIN[st.appId]
    this.taskChipIcon.setTexture(skin.texture)
    this.taskChipText.setText(`Abra o ${skin.label}`)

    this.hintTimer?.remove()
    this.hintTimer = this.time.delayedCall(HINT_AFTER_MS, () => this.revealHint())

    EventBus.emit('mission-update', {
      missionText: m.text, stepHint: st.hint,
      missionIndex: this.done, totalMissions: this.cfg.missions.length, level: this.cfg.level,
    })
  }

  /** Andaime: só depois de hesitar é que o jogo entrega qual ferramenta usar. */
  private revealHint() {
    const st = this.step
    if (!st || this.ended) return

    this.tweens.add({ targets: this.taskChip, alpha: 1, duration: 320 })

    const node = this.iconNodes.get(st.appId)
    if (!node) return

    this.hintGlow?.destroy()
    const glow = this.add.graphics().setDepth(9)
    glow.fillStyle(C.sun, 0.35); glow.fillCircle(node.x, node.y, 96)
    this.hintGlow = glow

    this.tweens.add({ targets: glow, alpha: 0.25, scale: 1.12, duration: 800, yoyo: true, repeat: -1 })
    FX.float(this, node, { amount: 10, duration: 600 })
  }

  private clearHint() {
    this.hintTimer?.remove()
    this.hintGlow?.destroy()
    this.hintGlow = undefined
    this.iconNodes.forEach(n => {
      this.tweens.killTweensOf(n)
      n.setY(n.getData('homeY') as number)
    })
  }

  // ═══════════════════════════════════════════════ ícones

  private async buildIcons() {
    const apps = this.cfg.availableApps
    const cols = 3
    const CELL_X = 178, CELL_Y = 196
    const rows = Math.ceil(apps.length / cols)
    const originX = 800 - ((cols - 1) * CELL_X) / 2
    const originY = 320 - ((rows - 1) * CELL_Y) / 2

    // Cria tudo de forma síncrona: buildTutorial precisa de iconNodes já preenchido
    apps.forEach((id, i) => {
      const x = originX + (i % cols) * CELL_X
      const y = originY + Math.floor(i / cols) * CELL_Y
      this.iconNodes.set(id, this.buildIcon(id, x, y))
    })

    await FX.stagger(this, [...this.iconNodes.values()], n => FX.popIn(this, n), 70)
  }

  private buildIcon(id: AppId, x: number, y: number) {
    const skin = SKIN[id]
    const SIZE = 118
    const root = this.add.container(x, y).setDepth(10)
    root.setData('homeY', y)
    root.setAlpha(0)   // FX.popIn cuida da escala

    const plate = this.add.graphics()
    plate.fillStyle(C.shadow, 0.22); plate.fillRoundedRect(-SIZE / 2, -SIZE / 2 + 9, SIZE, SIZE, 30)
    plate.fillStyle(skin.deep, 1); plate.fillRoundedRect(-SIZE / 2, -SIZE / 2 + 5, SIZE, SIZE, 30)
    plate.fillStyle(skin.tint, 1); plate.fillRoundedRect(-SIZE / 2, -SIZE / 2, SIZE, SIZE, 30)
    plate.fillStyle(C.white, 0.24); plate.fillRoundedRect(-SIZE / 2 + 12, -SIZE / 2 + 10, SIZE - 24, SIZE * 0.32, 18)

    // Máscara arredondada mata o fundo quadrado dos PNGs
    const mask = this.make.graphics({}, false)
    mask.fillStyle(0xffffff)
    mask.fillRoundedRect(x - SIZE / 2 + 12, y - SIZE / 2 + 12, SIZE - 24, SIZE - 24, 20)
    const art = this.add.image(0, 0, skin.texture).setDisplaySize(SIZE - 24, SIZE - 24)
    art.setMask(mask.createGeometryMask())

    const tag = label(this, 0, SIZE / 2 + 26, skin.label, { size: 19, color: C.ink })
    const tagG = this.add.graphics()
    tagG.fillStyle(C.paper, 0.95)
    tagG.fillRoundedRect(-(tag.width + 26) / 2, SIZE / 2 + 10, tag.width + 26, 32, 16)

    const hit = this.add.zone(0, 8, SIZE + 20, SIZE + 56).setInteractive({ useHandCursor: true })
    hit.on('pointerover', () => { if (this.running) FX.to(this, root, { scale: 1.07 }, { duration: 130 }) })
    hit.on('pointerout', () => { if (this.running) FX.to(this, root, { scale: 1 }, { duration: 130 }) })
    hit.on('pointerdown', () => {
      if (!this.running || this.ended || this.windowRoot) return
      FX.press(this, root)
      this.tone(760, 0.05)
      if (id === 'power') this.askShutdown()
      else this.openApp(id)
    })

    root.add([plate, art, tagG, tag, hit])
    return root
  }

  // ═══════════════════════════════════════════════ janela de app

  /** Converte coordenada local da janela em coordenada de tela. */
  private winPoint(lx: number, ly: number) {
    return { x: W / 2 + lx, y: H / 2 + WIN_DY + ly }
  }

  private openApp(id: AppId) {
    if (this.windowRoot) return
    this.clearHint()
    this.tone(880, 0.06); this.tone(1180, 0.07, 'sine', 0.1, 0.05)

    const skin = SKIN[id]
    const isTarget = this.step?.appId === id

    this.windowDim = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0)
      .setDepth(100).setInteractive()

    const root = this.add.container(W / 2, H / 2 + WIN_DY).setDepth(101)
    this.windowRoot = root

    root.add(paperCard(this, WIN_W, WIN_H, { radius: 30, edge: skin.tint, lift: 12 }))
    root.add(headerBand(this, WIN_W, WIN_HEADER, -WIN_H / 2, skin.tint, skin.deep, 30))

    const badge = this.add.image(-WIN_W / 2 + 52, -WIN_H / 2 + WIN_HEADER / 2, skin.texture)
      .setDisplaySize(42, 42)
    const title = label(this, -WIN_W / 2 + 96, -WIN_H / 2 + WIN_HEADER / 2, skin.label,
      { size: 26, color: C.white })
    title.setOrigin(0, 0.5)
    root.add([badge, title])

    root.add(circleButton(this, WIN_W / 2 - 46, -WIN_H / 2 + WIN_HEADER / 2, 24,
      C.paper, C.paperShade, g => {
        g.lineStyle(6, C.ink, 1)
        g.lineBetween(-8, -8, 8, 8)
        g.lineBetween(8, -8, -8, 8)
      }, () => this.closeApp()))

    const build = APP_BUILDERS[id]
    if (build) {
      const view = build({
        scene: this,
        step: isTarget ? (this.step ?? null) : null,
        done: (key) => this.completeAction(id, key),
        offTask: () => this.nudgeOffTask(),
      }, AREA)
      this.activeApp = view
      root.add(view.objects)
    }

    root.setScale(0.82).setAlpha(0)
    FX.to(this, this.windowDim, { alpha: 0.45 }, { duration: 200 })
    FX.to(this, root, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
      .then(() => this.maybeAppTutorial(id, skin.tint))
  }

  private closeApp() {
    const root = this.windowRoot
    if (!root) return
    this.tone(620, 0.06); this.tone(430, 0.08, 'sine', 0.1, 0.05)

    this.activeApp?.dispose?.()
    this.activeApp = undefined
    this.windowRoot = undefined

    const dim = this.windowDim
    this.windowDim = undefined

    FX.to(this, root, { scale: 0.85, alpha: 0 }, { duration: 180 }).then(() => root.destroy())
    if (dim) FX.to(this, dim, { alpha: 0 }, { duration: 180 }).then(() => dim.destroy())

    if (this.running && !this.ended) {
      this.hintTimer?.remove()
      this.hintTimer = this.time.delayedCall(HINT_AFTER_MS, () => this.revealHint())
    }
  }

  /**
   * Agiu num app que não é o da tarefa: redireciona sem punir.
   *
   * ── E, A PARTIR DO TERCEIRO, TAMBÉM AVISA LÁ FORA ────────────────────
   *
   * Este jogo era o ÚNICO dos 45 que não emitia erro nenhum — e, sem erro,
   * a plataforma não tinha como reprovar ninguém: ele só podia ser aprovado.
   *
   * Emitir no primeiro desvio quebraria o que este método é: os dois
   * primeiros continuam sendo um empurrãozinho, com o bilhete gentil e a
   * dica aparecendo. Do terceiro em diante a criança não está explorando,
   * está perdida — e aí vale contar, porque é o sinal de que a atividade não
   * está funcionando para ela.
   *
   * Quem decide o que fazer com esse sinal é a plataforma, pelas `lives` que
   * ela mandou. Aqui dentro nada muda: o jogo continua sem tela de derrota,
   * e continua sendo possível terminar.
   */
  private nudgeOffTask() {
    this.errors++
    this.offTaskTaps++

    floatingNote(this, W / 2, 240, 'Legal! Mas agora precisamos de outra coisa',
      { tone: C.sky, deep: C.skyDeep })
    FX.shake(this, this.taskCard, { amount: 9, times: 2 })
    this.revealHint()

    if (this.offTaskTaps < DESVIOS_ATE_CONTAR) return

    // zera o grupo: a regra é uma vida a cada três desvios, não uma vida por
    // toque a partir do terceiro
    this.offTaskTaps = 0
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.cfg.level,
    })
  }

  // ═══════════════════════════════════════════════ progressão

  private completeAction(appId: AppId, actionKey: string) {
    const st = this.step
    if (!st || this.ended) return
    if (st.appId !== appId || st.actionKey !== actionKey) { this.nudgeOffTask(); return }

    this.clearHint()

    // O relógio da barra obedece ao que a criança acertou
    if (actionKey === 'set-time' && st.clockTarget) {
      this.clockNow = { ...st.clockTarget }
      this.clockLabel.setText(this.clockText())
      FX.impact(this, this.clockLabel, 0.22)
    }

    this.stepIdx++
    const m = this.mission!

    // Passo intermediário de uma missão de vários passos
    if (this.stepIdx < m.steps.length) {
      this.tone(700, 0.07); this.tone(900, 0.09, 'sine', 0.14, 0.07)
      FX.seq(
        () => FX.wait(this, 520),
        () => this.closeApp(),
        () => this.refreshTask(),
        () => floatingNote(this, CARD_X, 210, 'Falta mais um passo!',
          { tone: C.sky, deep: C.skyDeep }),
      )
      return
    }

    // Missão concluída
    this.done++
    this.points += 5
    this.repaintRail()
    FX.impact(this, this.railDots[this.done - 1], 0.3)

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 5, stage: this.cfg.level,
    })
    this.chime()

    FX.seq(
      () => FX.popText(this, CARD_X, 300, '+5'),
      () => this.closeApp(),
      () => FX.stars(this, CARD_X, 320),
      () => FX.wait(this, 260),
      () => {
        this.missionIdx++
        this.stepIdx = 0
        if (this.missionIdx >= this.cfg.missions.length) { this.finish(); return }
        this.flipTaskCard()
        this.emitCheckpoint()
      },
    )
  }

  /** O bilhete vira como folha de bloco — é o único efeito de transição. */
  private flipTaskCard() {
    FX.seq(
      () => FX.to(this, this.taskCard, { scaleY: 0, angle: 0 }, { duration: 200, ease: 'Sine.easeIn' }),
      () => this.refreshTask(),
      () => FX.to(this, this.taskCard, { scaleY: 1, angle: -2 }, { duration: 300, ease: 'Back.easeOut' }),
    )
  }

  // ═══════════════════════════════════════════════ desligar

  private askShutdown() {
    const dim = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.5).setDepth(200).setInteractive()
    const modal = this.add.container(W / 2, H / 2).setDepth(201)

    modal.add(paperCard(this, 520, 260, { edge: C.coral }))
    modal.add(headerBand(this, 520, 56, -130, C.coral, C.coralDeep))
    modal.add(label(this, 0, -102, 'DESLIGAR', { size: 21, color: C.white }))
    modal.add(label(this, 0, -34, 'Quer mesmo desligar o computador?',
      { size: 24, color: C.ink, wrap: 440 }))

    const close = () => {
      FX.to(this, [modal, dim], { alpha: 0 }, { duration: 160 })
        .then(() => { modal.destroy(); dim.destroy() })
    }

    modal.add(chunkyButton(this, -118, 62, 'Agora não', close,
      { w: 200, h: 60, tone: C.slate, deep: C.slateDeep }).root)

    modal.add(chunkyButton(this, 118, 62, 'Desligar', () => {
      close()
      this.time.delayedCall(180, () => this.completeAction('power', 'shutdown'))
    }, { w: 200, h: 60, tone: C.coral, deep: C.coralDeep }).root)

    modal.setScale(0.9).setAlpha(0)
    FX.to(this, modal, { scale: 1, alpha: 1 }, { duration: 220, ease: 'Back.easeOut' })
  }

  // ═══════════════════════════════════════════════ tutoriais

  private replayTutorial() {
    if (this.ended || this.windowRoot) return
    const wasRunning = this.running
    this.running = false
    this.buildTutorial(false, () => { this.running = wasRunning })
  }

  private runTutorial(onDone: () => void) { this.buildTutorial(true, onDone) }

  private buildTutorial(once: boolean, onDone: () => void) {
    const first = this.iconNodes.get(this.cfg.availableApps[0])
    const steps: TutorialStep[] = [
      {
        text: 'Este bilhete diz o que a turma precisa agora.',
        shape: 'rect', x: CARD_X, y: CARD_Y, w: CARD_W + 30, h: CARD_H + 30,
        balloonX: 830, balloonY: 300,
      },
      {
        text: 'Você escolhe o aplicativo. Toque uma vez para abrir.',
        shape: 'rect', x: 800, y: 320, w: 560, h: 400,
        pointer: first
          ? { fromX: 640, fromY: 580, toX: first.x, toY: first.y, textureKey: 'cursor_tutorial' }
          : undefined,
      },
      {
        text: 'Se ficar em dúvida, espere um pouquinho: o ícone certo vai brilhar.',
        shape: 'none', balloonY: 380,
      },
    ]
    createTutorial(this, {
      key: `desktop-l${this.cfg.level}`, once: false, accent: C.sky,
      safeTop: HEADER_H + 14, steps, onFinish: onDone,
    })
  }

  private maybeAppTutorial(id: AppId, accent: number) {
    const steps = this.appTutorialSteps(id)
    if (!steps) return

    const stopDemo = this.activeApp?.demo?.()
    createTutorial(this, {
      key: `app-${id}`, once: true, accent, steps,
      onFinish: () => stopDemo?.(),
    })
  }

  private appTutorialSteps(id: AppId): TutorialStep[] | null {
    if (id !== 'relogio') return null

    const face = this.winPoint(-160, 20)
    const goal = this.winPoint(155, -44)
    const ok = this.winPoint(155, 196)

    return [
      {
        text: 'Este é o relógio da sala.',
        shape: 'circle', x: face.x, y: face.y, w: 290, h: 290,
        balloonX: 900, balloonY: 185,
      },
      {
        text: 'E esta é a hora que a turma precisa. Compare os dois.',
        shape: 'circle', x: goal.x, y: goal.y, w: 142, h: 142,
        balloonX: 400, balloonY: 530,
      },
      {
        text: 'Arraste a bolinha azul, como o dedo está fazendo. Uma volta inteira muda a hora.',
        shape: 'circle', x: face.x, y: face.y, w: 290, h: 290,
        balloonX: 900, balloonY: 185,
      },
      {
        text: 'Quando o número ficar verde, toque em Está certo!',
        shape: 'rect', x: ok.x, y: ok.y, w: 270, h: 92,
        balloonX: 400, balloonY: 235,
        buttonLabel: 'Vou tentar!',
      },
    ]
  }

  private showIntro() {
    const dim = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.55).setDepth(300).setInteractive()
    const modal = this.add.container(W / 2, H / 2).setDepth(301)

    const n = this.cfg.missions.length
    const MH = 300 + n * 40

    modal.add(paperCard(this, 640, MH, { edge: C.sky }))
    modal.add(headerBand(this, 640, 60, -MH / 2, C.sky, C.skyDeep))
    modal.add(label(this, 0, -MH / 2 + 31, `NÍVEL ${this.cfg.level} DE 3`, { size: 21, color: C.white }))
    modal.add(label(this, 0, -MH / 2 + 108, 'Ajude a turma a organizar o dia',
      { size: 30, color: C.ink, wrap: 540 }))
    modal.add(label(this, 0, -MH / 2 + 160,
      'Leia o bilhete e escolha, sozinho, qual aplicativo resolve cada pedido.',
      { size: 19, color: C.inkSoft, weight: 'bold', wrap: 520 }))

    this.cfg.missions.forEach((m, i) => {
      const y = -MH / 2 + 216 + i * 40
      const g = this.add.graphics()
      g.fillStyle(C.sun, 1); g.fillCircle(-256, y, 15)
      modal.add(g)
      modal.add(label(this, -256, y, String(i + 1), { size: 17, color: C.ink }))
      const t = label(this, -228, y, m.text,
        { size: 18, color: C.ink, weight: 'bold', wrap: 470, align: 'left' })
      t.setOrigin(0, 0.5)
      modal.add(t)
    })

    const go = () => {
      FX.to(this, [modal, dim], { alpha: 0 }, { duration: 200 }).then(() => {
        modal.destroy(); dim.destroy()
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        EventBus.emit('scene-ready', { levelConfig: this.cfg })
        this.refreshTask()
        this.emitCheckpoint()
        if (this.cfg.level === 1) this.runTutorial(() => { this.running = true })
        else this.running = true
      })
    }

    modal.add(chunkyButton(this, 0, MH / 2 - 56, 'Começar', go,
      { w: 280, h: 64, tone: C.mint, deep: C.mintDeep, size: 23 }).root)

    modal.setScale(0.9).setAlpha(0)
    FX.to(this, modal, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
  }

  private finish() {
    this.ended = true
    this.running = false

    const elapsed = Date.now() - this.startedAt
    // O tempo dá bônus, não game over. Troque esta linha se quiser tempo como falha.
    if (elapsed <= this.cfg.timeLimit * 1000) this.points += 5

    const result: RoundResult = {
      gameCode: 'EF01CO06',
      level: this.cfg.level,
      criterion: 'uso-de-apps',
      hits: this.done,
      errors: this.errors,
      durationMs: elapsed,
      timestamp: Date.now(),
    }
    EventBus.emit('round-complete', result)
    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.cfg.level, totalStages: LEVELS.length })

    FX.flash(this, C.white, { peak: 0.4 })
    FX.confetti(this, { colors: [C.sun, C.mint, C.coral, C.sky] })
    this.chime()

    const last = this.cfg.level >= 3
    showLevelComplete(this, {
      title: last ? 'Computador dominado!' : undefined,
      subtitle: last ? `${this.points} pontos` : `Nível ${this.cfg.level} concluído`,
      message: last
        ? 'Você soube escolher a ferramenta certa para cada pedido.'
        : LEVELS[this.cfg.level]?.missions[0]?.text ?? '',
      accent: C.mint,
      overlayColor: C.deskDeep,
      titleColor: hex(C.ink),
      subtitleColor: hex(C.mintDeep),
      progress: { total: 3, current: this.cfg.level },
      ...(last ? {
        buttons: [
          { label: 'Jogar de novo', color: C.mintDeep, onClick: () => this.scene.restart({ level: 1 }) },
          { label: 'Outros jogos', color: C.slateDeep, onClick: () => EventBus.emit('exit-game') },
        ],
      } : {
        autoAdvance: {
          delay: 2400,
          onComplete: () => this.scene.restart({ 
            level: this.cfg.level + 1, points: this.points, lives: this.lives,
          }),
        },
      }),
    })
  }

  private emitCheckpoint() {
    const total = this.cfg.missions.length
    runtimeGameBridge.emit({
      type: 'CHECKPOINT', gameId: GAME_ID,
      progress: total ? Math.round((this.done / total) * 100) : 0,
      score: this.points, stage: this.cfg.level,
      hits: this.done, errors: this.errors,
    })
  }

  private registerCommands() {
    this.unsubCommands = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME' && cmd.gameId === GAME_ID) {
        if (cmd.stage !== this.cfg.level) {
          this.scene.restart({ level: cmd.stage, points: cmd.points, lives: cmd.lives })
        } else {
          this.points = cmd.points; this.lives = cmd.lives
        }
        return
      }
      if (cmd.type === 'PAUSE_GAME' && !this.scene.isPaused()) this.scene.pause()
      if (cmd.type === 'RESUME_GAME' && this.scene.isPaused()) this.scene.resume()
    })
  }

  // ═══════════════════════════════════════════════ áudio

  private tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.16, delay = 0) {
    if (this.muted) return
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

  private chime() {
    [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.2, i * 0.11))
  }
}