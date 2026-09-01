import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX, Ease } from '../../../../shared/effects/FX'
import { DEVICES, DEVICE_INFO, INFOS, LEVELS } from '../data/levels'
import { C, A, FONT, SIZE, hex, OP_NAME, ICON_FALLBACK } from '../data/theme'
import { W, H, HUD, BOARD, OP, COMPUTER, PORTS, SORT_CARD, TASK, RAIL, BANK } from '../data/layout'
import {
  paintPort, paintCard, paintSlot, paintBoard, badge, createFlow,
  makePacket, flyPacket, createScreen, createOpDialog,
  createBigButton, createRoundButton, cardAccept, cardReject, dealIn,
  flyToSlot,
  type OpDialog, type BigButton, type ScreenView,
} from './effects'
import { createCable, deviceSignal } from './signals'
import type { DeviceId, DeviceKind, OpFrame, PlayState } from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'central-de-entrada-e-saida'

/**
 * Profundidade dos cabos dentro do `stage`.
 *
 * Vale pouco, e é honesto dizer: `stage` é um Container, e Container do Phaser
 * desenha os filhos na ORDEM DE INSERÇÃO. `setDepth` num filho agenda a
 * ordenação da lista da cena, não a do pai. Como o cabo nasce depois do
 * computador, ele fica por cima por mais baixo que seja o número.
 *
 * Quem resolve a sobreposição é o traçado: o cabo contorna a máquina em vez de
 * cruzá-la. Ver `routeToPort` e `computerPlug`.
 */
const CABLE_DEPTH = 5

interface PortView {
  kind: DeviceKind
  x: number
  y: number
  bg: Phaser.GameObjects.Graphics
  box: Phaser.GameObjects.Container
}

interface CardView {
  id: DeviceId
  box: Phaser.GameObjects.Container
  bg: Phaser.GameObjects.Graphics
  x: number
  y: number
  w: number
  h: number
}

interface SlotView {
  kind: DeviceKind
  x: number
  y: number
  bg: Phaser.GameObjects.Graphics
  box: Phaser.GameObjects.Container
  deviceId?: DeviceId
  icon?: Phaser.GameObjects.Container
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
  private levelIdx = 0
  private roundIdx = 0
  private points = 0
  private hits = 0
  private errors = 0
  private state: PlayState = 'sort'
  private locked = false
  private ended = false
  private isMuted = false
  private stageGen = 0

  private stage?: Phaser.GameObjects.Container
  private hud?: Phaser.GameObjects.Container
  private opLayer?: Phaser.GameObjects.Container
  private actionLayer?: Phaser.GameObjects.Container
  private op?: Phaser.GameObjects.Image
  private dialog?: OpDialog
  private primary?: BigButton
  private idleTween?: Phaser.Tweens.Tween
  private opSpot = 0
  private unsubPlatform?: () => void

  private computer?: Phaser.GameObjects.Image
  private screen?: ScreenView
  private ports: PortView[] = []
  private cards = new Map<DeviceId, CardView>()
  private slots: SlotView[] = []
  private sortCardPos = { x: SORT_CARD.cx, y: SORT_CARD.cy }

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; points?: number; lives?: number }) {
      this.livesTotal = vidasIniciais(this, 3)
      this.livesLeft = data?.lives ?? this.livesTotal
    this.levelIdx = Phaser.Math.Clamp(data.level ?? 1, 1, 3) - 1
    this.roundIdx = 0
    this.points = data.points ?? 0
    this.hits = 0
    this.errors = 0
    this.locked = false
    this.ended = false
  }

  create() {
    this.drawBackground()
    this.registerPlatformCommands()
    EventBus.on('mute-audio', this.onMuteAudio, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', this.shutdownScene, this)

    this.opLayer = this.add.container(0, 0).setDepth(12)
    this.actionLayer = this.add.container(0, 0).setDepth(13)
    this.buildOp()

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.emitCheckpoint()
    this.startLevel()

      /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
      this.lives = createLives(this, {
          total: this.livesTotal,
          remaining: this.livesLeft,
          gameId: GAME_ID,
          x: 40,
          y: 40,
          size: 30,
          stage: () => this.level.level,
      })
      this.events.once('shutdown', () => this.lives.destroy())
  }

  private get level() { return LEVELS[this.levelIdx] }

  private get totalRounds() {
    const l = this.level
    return (l.sortRounds ?? l.pickRounds ?? l.chainRounds ?? []).length
  }

  private shutdownScene() {
    EventBus.off('mute-audio', this.onMuteAudio, this)
    EventBus.off('show-tutorial', this.replayTutorial, this)
    this.idleTween?.remove()
    this.dialog?.destroy()
    this.unsubPlatform?.()
  }

  private registerPlatformCommands() {
    this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
      if (cmd.type === 'START_GAME') this.points = cmd.points ?? this.points
    })
  }

  private onMuteAudio(muted: boolean) {
    this.isMuted = muted
  }

  private drawBackground() {
    const bg = this.add.image(W / 2, H / 2, 'bg-central').setDepth(-20)
    bg.setScale(Math.max(W / bg.width, H / bg.height))
    const veil = this.add.graphics().setDepth(-19)
    veil.fillStyle(C.ink, A.veil)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.ink, 0.18)
    veil.fillRect(0, 0, W, 60)
    veil.fillRect(0, H - 60, W, 60)
  }

  private buildOp() {
    if (!this.opLayer) return
    const home = OP.spots[0]
    this.op = this.add.image(home.x, home.y, 'op-01')
    this.fit(this.op, OP.maxW, OP.maxH)
    this.opLayer.add(this.op)
    this.dialog = createOpDialog(this, this.opLayer, this.op, 12)
    this.startIdle()
  }

  private startIdle() {
    if (!this.op) return
    this.idleTween?.remove()
    this.idleTween = FX.float(this, this.op, { amount: 7, duration: 2200 })
  }

  /**
   * Troca a pose.
   *
   * `flip` existe por causa da arte: na `op-02` o Vico aponta para a DIREITA,
   * e ele mora na coluna direita da tela — apontar para a direita é apontar
   * para fora do jogo. Espelhado, o mesmo desenho aponta para o tabuleiro, que
   * é onde está a coisa de que ele está falando.
   */
  private setPose(frame: OpFrame, flip = false) {
    if (!this.op) return
    this.op.setTexture(frame)
    this.op.setFlipX(flip)
    this.fit(this.op, OP.maxW, OP.maxH)
    FX.impact(this, this.op, 0.1)
  }

  /** Aponta para alguma coisa da tela, virando-se para o lado certo. */
  private pointAt(x: number) {
    if (!this.op) return
    this.setPose('op-02', x < this.op.x)
  }

  /**
   * Salta para o ponto da rodada.
   *
   * O `float` do repouso também mexe em `y`; deixar os dois correndo juntos
   * faz o boneco tremer no ar e aterrissar fora do lugar. Por isso o idle
   * morre antes do salto e só volta depois de ele assentar.
   */
  private async hopToSpot(index: number) {
    if (!this.op) return
    const spot = OP.spots[index % OP.spots.length]
    if (Math.abs(this.op.x - spot.x) < 2 && Math.abs(this.op.y - spot.y) < 2) return

    const gen = this.stageGen
    this.idleTween?.remove()
    this.idleTween = undefined

    await FX.arcTo(this, this.op, spot, { height: OP.hopH, duration: 420 })
    if (gen !== this.stageGen || !this.op) return

    /*
     * Nada de `FX.impact` no pouso.
     *
     * O `setPose` do apontar dispara um impacto de ~530ms e o pouso cai no
     * meio dele. Dois impactos sobrepostos no mesmo alvo fazem o segundo
     * gravar como "escala de repouso" um valor que ainda estava animando, e o
     * boneco fica permanentemente de outro tamanho. O `fit` devolve a escala
     * certa, e o arco já dá o peso do salto sem ajuda.
     */
    this.fit(this.op, OP.maxW, OP.maxH)
    this.startIdle()
  }

  /**
   * Abertura de rodada: o Vico troca de lugar e aponta para o tabuleiro.
   *
   * Depois volta sozinho para a pose neutra — sem isso ele ficava congelado
   * apontando enquanto a criança pensava, que é quando ele deveria só esperar.
   */
  private openRound() {
    const gen = this.stageGen
    this.opSpot += 1
    void this.hopToSpot(this.opSpot)
    this.pointAt(BOARD.cx)

    this.time.delayedCall(1200, () => {
      if (gen !== this.stageGen) return
      if (this.dialog?.isBusy()) return
      this.setPose('op-01')
    })
  }

  private react(frame: OpFrame, line: string) {
    this.setPose(frame)
    this.dialog?.react(line)
  }

  /** Reage e, passado o tempo de leitura, volta ao repouso. */
  private reactThenIdle(frame: OpFrame, line: string, backAfter = 2000) {
    const gen = this.stageGen
    this.react(frame, line)
    this.time.delayedCall(backAfter, () => {
      if (gen !== this.stageGen) return
      if (this.dialog?.isBusy()) return
      this.setPose('op-01')
    })
  }

  private async speak(frame: OpFrame, ...lines: Array<string | undefined>) {
    const gen = this.stageGen
    this.setPose(frame)
    this.locked = true
    this.syncPrimary()
    await this.dialog?.speak(lines.filter((l): l is string => !!l))
    if (gen !== this.stageGen) return
    this.setPose('op-01')
    this.locked = false
    this.syncPrimary()
  }

  private renderHud() {
    this.hud?.destroy()
    this.hud = this.add.container(0, 0).setDepth(80)

    const bg = this.add.graphics()
    bg.fillStyle(C.ink, 0.94)
    bg.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 24)
    bg.fillStyle(C.cream, 0.08)
    bg.fillRoundedRect(HUD.x + 14, HUD.y + 10, HUD.w - 28, 20, 10)
    bg.lineStyle(3, C.glow, 0.8)
    bg.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 24)
    this.hud.add(bg)

    const pill = this.add.graphics()
    pill.fillStyle(C.inBlue, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.26)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 6, HUD.pillW - 20, 12, 6)
    this.hud.add(pill)

    this.hud.add(this.add.text(HUD.pillX + HUD.pillW / 2, HUD.cy, `NÍVEL ${this.level.level}`, {
      fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: hex(C.white),
    }).setOrigin(0.5).setResolution(2))

    const total = this.totalRounds
    const dots = this.add.graphics()
    for (let i = 0; i < total; i += 1) {
      const dx = HUD.phaseX + i * 30
      const done = i < this.roundIdx
      const now = i === this.roundIdx
      dots.fillStyle(done ? C.green : now ? C.inBlue : C.cream, done || now ? 1 : 0.3)
      if (now) dots.fillRoundedRect(dx - 14, HUD.cy - 8, 28, 16, 8)
      else dots.fillCircle(dx, HUD.cy, 8)
    }
    this.hud.add(dots)

    this.hud.add(this.add.text(HUD.titleX, HUD.cy, this.level.title, {
      fontFamily: FONT.black, fontSize: SIZE.hudTitle, color: hex(C.cream),
      align: 'center', wordWrap: { width: 520 },
    }).setOrigin(0.5).setResolution(2))

    this.hud.add(createRoundButton(this, HUD.helpX, HUD.cy, HUD.helpR, '?', () => this.replayTutorial()))

    FX.slideIn(this, this.hud, { dy: 26, duration: 340 })
  }

  private startLevel() {
    const gen = this.stageGen
    if (this.level.sortRounds) this.showSort()
    else if (this.level.pickRounds) this.showPick()
    else this.showChain()

    void this.speak('op-03', ...this.level.opening).then(() => {
      if (gen !== this.stageGen) return
      this.runTutorial(false)
    })
  }

  private drawComputer(y: number, maxW: number, maxH: number) {
    this.computer = this.add.image(COMPUTER.cx, y, 'computador-central').setDepth(8)
    this.fit(this.computer, maxW, maxH)
    this.stage?.add(this.computer)
    if (this.stage) this.screen = createScreen(this, this.stage, this.computer, COMPUTER.screen)
    FX.popIn(this, this.computer, { from: 0.85, duration: 380 })
  }

  private showSort() {
    this.clearStage()
    this.renderHud()
    this.drawBoard(this.level.helper)
    this.state = 'sort'
    this.locked = false

    const round = this.level.sortRounds?.[this.roundIdx]
    if (!round) return

    this.drawComputer(COMPUTER.sortY, COMPUTER.maxW, COMPUTER.maxH)
    this.drawSortCard(round.deviceId)
    this.drawPorts()
    this.emitCheckpoint()
    this.openRound()
  }

  private drawSortCard(id: DeviceId) {
    const device = DEVICES[id]
    const { w, h, r, cx, cy } = SORT_CARD
    const box = this.add.container(cx, cy).setDepth(20)

    const bg = this.add.graphics()
    paintCard(bg, w, h, r, 'normal')

    const icon = this.add.image(SORT_CARD.iconX, 0, this.safeTex(device.textureKey))
    this.fit(icon, SORT_CARD.iconSize, SORT_CARD.iconSize)

    const label = this.add.text(SORT_CARD.labelX, 0, device.label, {
      fontFamily: FONT.black, fontSize: '28px', color: hex(C.ink),
      wordWrap: { width: w - 150 },
    }).setOrigin(0, 0.5).setResolution(2)

    box.add([bg, icon, label])
    this.stage?.add(box)
    this.sortCardPos = { x: cx, y: cy }
    FX.popIn(this, box, { from: 0.8, duration: 380 })
    FX.float(this, icon, { amount: 5, duration: 2000 })
  }

  private drawPorts() {
    const defs: Array<{ kind: DeviceKind; label: string; tone: number; dir: 1 | -1 }> = [
      // ENTRADA aponta para cima: a informação sobe para dentro do computador.
      { kind: 'input', label: 'ENTRADA', tone: C.inBlue, dir: -1 },
      { kind: 'output', label: 'SAÍDA', tone: C.outAmber, dir: 1 },
    ]

    const startX = BOARD.cx - (PORTS.w + PORTS.gap) / 2

    defs.forEach((def, i) => {
      const x = startX + i * (PORTS.w + PORTS.gap)
      const box = this.add.container(x, PORTS.cy).setDepth(14)
      const bg = this.add.graphics()
      paintPort(bg, PORTS.w, PORTS.h, PORTS.r, def.tone, 'normal')

      const label = this.add.text(0, PORTS.labelDY, def.label, {
        fontFamily: FONT.black, fontSize: SIZE.portLabel, color: hex(C.white),
      }).setOrigin(0.5).setResolution(2)

      const flow = createFlow(this, {
        dir: def.dir,
        tone: def.tone,
        w: PORTS.chevW,
        thick: PORTS.chevThick,
        gap: PORTS.chevGap,
      })
      flow.setY(PORTS.flowY)

      box.add([bg, label, flow])

      const hit = this.add.zone(0, 0, PORTS.w, PORTS.h).setOrigin(0.5).setInteractive({ useHandCursor: true })
      hit.on('pointerdown', () => this.tapPort(def.kind))
      hit.on('pointerover', () => {
        if (this.locked) return
        paintPort(bg, PORTS.w, PORTS.h, PORTS.r, def.tone, 'hover')
        FX.to(this, box, { scale: 1.04 }, { duration: 130 })
      })
      hit.on('pointerout', () => {
        if (this.locked) return
        paintPort(bg, PORTS.w, PORTS.h, PORTS.r, def.tone, 'normal')
        FX.to(this, box, { scale: 1 }, { duration: 130 })
      })
      box.add(hit)

      this.stage?.add(box)
      this.ports.push({ kind: def.kind, x, y: PORTS.cy, bg, box })
      FX.popIn(this, box, { from: 0.82, delay: 140 + i * 90, duration: 400 })
    })
  }

  /**
   * Onde o cabo pluga na máquina: a borda de BAIXO, no meio.
   *
   * Antes ele terminava 60px dentro do corpo do computador, então a ponta e o
   * plugue ficavam desenhados sobre a carcaça. Encostando na silhueta o cabo
   * parece entrar no aparelho.
   */
  private computerPlug(fallbackY: number) {
    const c = this.computer
    if (!c) return { x: COMPUTER.cx, y: fallbackY }
    return { x: c.x, y: c.y + c.displayHeight / 2 - 6 }
  }

  /** Caixa que o cabo não pode invadir. */
  private computerBox() {
    const c = this.computer
    if (!c) return null
    return {
      left: c.x - c.displayWidth / 2,
      right: c.x + c.displayWidth / 2,
      top: c.y - c.displayHeight / 2,
    }
  }

  /**
   * Rota do cartão até a porta, passando POR FORA do computador.
   *
   * A máquina fica exatamente entre os dois: o cartão no topo do meio, as
   * portas embaixo nos cantos. Uma curva direta corta a carcaça no caminho.
   * Os dois pontos de passagem levam o cabo para fora da largura do
   * computador antes de descer — sai pela lateral, desce rente à borda do
   * tabuleiro e entra na porta por cima.
   */
  private routeToPort(portX: number) {
    const box = this.computerBox()
    if (!box) return undefined

    const side = portX < COMPUTER.cx ? -1 : 1
    // 26px de folga da carcaça: o cabo passa ao lado, não encostado nela
    const clearX = side < 0 ? Math.min(box.left - 26, portX) : Math.max(box.right + 26, portX)

    return [
      { x: clearX, y: box.top - 14 },
      { x: portX, y: (box.top + PORTS.cy) / 2 + 40 },
    ]
  }

  private async tapPort(kind: DeviceKind) {
    if (this.locked || this.ended) return
    const round = this.level.sortRounds?.[this.roundIdx]
    if (!round) return

    const gen = this.stageGen
    this.locked = true
    const device = DEVICES[round.deviceId]
    const port = this.ports.find(p => p.kind === kind)
    if (!port) return

    const tone = kind === 'input' ? C.inBlue : C.outAmber
    const cable = createCable(
      this,
      this.stage!,
      { x: this.sortCardPos.x, y: this.sortCardPos.y + SORT_CARD.h / 2 },
      { x: port.x, y: port.y + PORTS.plugDY },
      tone,
      { via: this.routeToPort(port.x), sag: 70, depth: CABLE_DEPTH },
    )
    await cable.plugIn(380)
    if (gen !== this.stageGen) { cable.destroy(); return }

    if (kind !== device.kind) {
      this.errors += 1
      runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.level.level })
      this.lives.lose(); this.livesLeft = this.lives.remaining
      this.emitCheckpoint()
      this.playError()
      paintPort(port.bg, PORTS.w, PORTS.h, PORTS.r, tone, 'wrong')
      FX.shakeCam(this, 'leve')
      this.reactThenIdle('op-05', round.wrongLine)
      await cable.fault()
      if (gen !== this.stageGen) { cable.destroy(); return }
      await cable.unplug(280)
      if (gen !== this.stageGen) return
      paintPort(port.bg, PORTS.w, PORTS.h, PORTS.r, tone, 'normal')
      this.locked = false
      return
    }

    paintPort(port.bg, PORTS.w, PORTS.h, PORTS.r, tone, 'correct')

    /*
     * `sag` positivo: a barriga do fio cai PARA BAIXO.
     *
     * Era -46, ou seja, arqueava para cima — e como o destino já ficava dentro
     * da máquina, o fio subia por dentro dela. Caindo, ele passa por baixo do
     * computador e encosta na borda inferior.
     */
    const wireUp = createCable(
      this,
      this.stage!,
      { x: port.x, y: port.y - PORTS.h / 2 },
      this.computerPlug(COMPUTER.sortY + 70),
      tone,
      { sag: 46, depth: CABLE_DEPTH },
    )
    const infoKey = INFOS[DEVICE_INFO[round.deviceId]].textureKey
    const signalX = this.sortCardPos.x + SORT_CARD.iconX
    const bail = () => { cable.destroy(); wireUp.destroy() }

    await wireUp.plugIn(300)
    if (gen !== this.stageGen) { bail(); return }

    if (kind === 'input') {
      await deviceSignal(this, this.stage!, signalX, this.sortCardPos.y, round.deviceId)
      if (gen !== this.stageGen) { bail(); return }
      await cable.pulse({ duration: 720, iconKey: infoKey })
      if (gen !== this.stageGen) { bail(); return }
      await wireUp.pulse({ duration: 620, iconKey: infoKey })
      if (gen !== this.stageGen) { bail(); return }
      await this.screen?.show(infoKey, tone)
      if (gen !== this.stageGen) return
    } else {
      await this.screen?.show(infoKey, tone)
      if (gen !== this.stageGen) { bail(); return }
      await wireUp.pulse({ reverse: true, duration: 620, iconKey: infoKey })
      if (gen !== this.stageGen) { bail(); return }
      await cable.pulse({ reverse: true, duration: 720, iconKey: infoKey })
      if (gen !== this.stageGen) { bail(); return }
      await deviceSignal(this, this.stage!, signalX, this.sortCardPos.y, round.deviceId)
      if (gen !== this.stageGen) return
    }

    this.award(20)
    this.react(this.cheerFrame(), round.successLine)
    cardAccept(this, port.box, port.x, port.y)
    FX.sparks(this, port.x, port.y, { color: C.green, count: 16, spread: 150 })

    this.time.delayedCall(1500, () => {
      if (gen !== this.stageGen) return
      this.nextRound()
    })
  }

  private showPick() {
    this.clearStage()
    this.renderHud()
    this.drawBoard(this.level.helper)
    this.state = 'pick'
    this.locked = false

    const round = this.level.pickRounds?.[this.roundIdx]
    if (!round) return

    this.drawTaskCard(round.taskLabel, INFOS[round.taskInfoId].textureKey, C.inBlue)
    this.drawComputer(COMPUTER.pickY, COMPUTER.maxW, COMPUTER.maxH)
    this.drawBank(round.options, id => this.tapPick(id))
    this.emitCheckpoint()
    this.openRound()
  }

  private async tapPick(id: DeviceId) {
    if (this.locked || this.ended) return
    const round = this.level.pickRounds?.[this.roundIdx]
    if (!round) return

    const gen = this.stageGen
    const card = this.cards.get(id)
    const device = DEVICES[id]
    if (!card) return

    if (id !== round.answerId) {
      this.errors += 1
      runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.level.level })
      this.lives.lose(); this.livesLeft = this.lives.remaining
      this.emitCheckpoint()
      this.playError()
      paintCard(card.bg, card.w, card.h, BANK.r, 'wrong')
      cardReject(this, card.box)
      const line = `O ${device.label.toLowerCase()} ${device.action}.`
      this.reactThenIdle('op-05', line)
      this.time.delayedCall(900, () => {
        if (gen !== this.stageGen) return
        paintCard(card.bg, card.w, card.h, BANK.r, 'normal')
      })
      return
    }

    this.locked = true
    paintCard(card.bg, card.w, card.h, BANK.r, 'correct')
    cardAccept(this, card.box, card.x, card.y)

    const tone = device.kind === 'input' ? C.inBlue : C.outAmber
    const packet = makePacket(this, card.x, card.y - card.h / 2, tone)
    const dest = device.kind === 'input'
      ? { x: COMPUTER.cx, y: COMPUTER.pickY }
      : { x: card.x, y: card.y - card.h / 2 }

    if (device.kind === 'input') {
      await flyPacket(this, packet, dest, 560)
      if (gen !== this.stageGen) { packet.destroy(); return }
      await FX.to(this, packet.node, { alpha: 0, scale: 0.5 }, { duration: 180 })
      packet.destroy()
      await this.screen?.show(INFOS[round.taskInfoId].textureKey, tone)
    } else {
      packet.destroy()
      await this.screen?.show(INFOS[round.taskInfoId].textureKey, tone)
      if (gen !== this.stageGen) return
      const out = makePacket(this, COMPUTER.cx, COMPUTER.pickY, tone, INFOS[round.taskInfoId].textureKey)
      await flyPacket(this, out, { x: card.x, y: card.y - card.h / 2 }, 620)
      if (gen !== this.stageGen) { out.destroy(); return }
      FX.impact(this, card.box, 0.18)
      await FX.to(this, out.node, { alpha: 0, scale: 0.5 }, { duration: 180 })
      out.destroy()
    }

    if (gen !== this.stageGen) return

    const mark = badge(this, card.x, card.y - card.h / 2 - 8, device.kind === 'input' ? 'entrada' : 'saída', tone)
    mark.setDepth(60)
    this.stage?.add(mark)
    FX.popIn(this, mark, { from: 0.6, duration: 300 })

    this.award(20)
    this.react(this.cheerFrame(), round.successLine)
    FX.sparks(this, card.x, card.y, { color: C.green, count: 16, spread: 150 })

    this.time.delayedCall(1600, () => {
      if (gen !== this.stageGen) return
      this.nextRound()
    })
  }

  private showChain() {
    this.clearStage()
    this.renderHud()
    this.drawBoard(this.level.helper)
    this.state = 'chain'
    this.locked = false

    const round = this.level.chainRounds?.[this.roundIdx]
    if (!round) return

    this.drawTaskCard(round.taskLabel, INFOS[round.inInfoId].textureKey, C.inBlue)
    this.drawRail()
    this.drawComputer(COMPUTER.chainY, COMPUTER.chainMaxW, COMPUTER.chainMaxH)
    this.drawBank(round.options, id => this.tapChain(id))
    this.primary = this.makePrimary('Ligar a central', () => this.runChain())
    this.syncPrimary()
    this.emitCheckpoint()
    this.openRound()
  }

  private drawRail() {
    const defs: Array<{ kind: DeviceKind; label: string; tone: number; x: number }> = [
      { kind: 'input', label: 'ENTRADA', tone: C.inBlue, x: BOARD.cx - RAIL.offsetX },
      { kind: 'output', label: 'SAÍDA', tone: C.outAmber, x: BOARD.cx + RAIL.offsetX },
    ]

    defs.forEach((def, i) => {
      /*
       * Mesmas setas em "V" das portas do Nível 1, deitadas.
       * O `createFlow` nasce apontando para baixo; girar -90° manda para a
       * direita, que é o sentido do percurso: entrada -> computador -> saída.
       */
      const arrowX = def.kind === 'input'
        ? def.x + RAIL.slotW / 2 + 48
        : def.x - RAIL.slotW / 2 - 48
      const flow = createFlow(this, {
        dir: 1, tone: def.tone, w: 44, thick: 11, gap: 18,
      })
      flow.setPosition(arrowX, RAIL.cy).setRotation(-Math.PI / 2).setDepth(6)
      this.stage?.add(flow)
      FX.fadeIn(this, flow, 300, 260 + i * 80)

      const box = this.add.container(def.x, RAIL.cy).setDepth(14)
      const bg = this.add.graphics()
      paintSlot(bg, RAIL.slotW, RAIL.slotH, RAIL.r, def.tone, false)

      const label = this.add.text(0, RAIL.labelDY, def.label, {
        fontFamily: FONT.black, fontSize: SIZE.railLabel, color: hex(def.tone),
      }).setOrigin(0.5).setResolution(2)

      /*
       * O "toque um aparelho" saiu dos dois encaixes. Era a mesma frase duas
       * vezes na mesma linha, e o encaixe vazio já se explica: moldura
       * tracejada, fundo rebaixado e o rótulo ENTRADA/SAÍDA em cima.
       */
      box.add([bg, label])

      const hit = this.add.zone(0, 0, RAIL.slotW, RAIL.slotH).setOrigin(0.5).setInteractive({ useHandCursor: true })
      hit.on('pointerdown', () => this.clearSlot(def.kind))
      box.add(hit)

      this.stage?.add(box)
      this.slots.push({ kind: def.kind, x: def.x, y: RAIL.cy, bg, box })
      FX.popIn(this, box, { from: 0.82, delay: 140 + i * 90, duration: 400 })
    })
  }

  private async tapChain(id: DeviceId) {
    if (this.locked || this.ended) return
    const device = DEVICES[id]
    const slot = this.slots.find(s => s.kind === device.kind)
    const card = this.cards.get(id)
    if (!slot || !card) return

    if (slot.deviceId) {
      cardReject(this, card.box)
      this.reactThenIdle('op-05', 'Esse lado já está cheio. Toque no encaixe para tirar.', 1600)
      return
    }

    const gen = this.stageGen
    this.cards.delete(id)
    slot.deviceId = id
    this.playDrop()
    this.syncPrimary()

    card.box.setDepth(120)
    FX.kill(this, card.box)
    await flyToSlot(this, card.box, { x: slot.x, y: slot.y }, 0.9)
    if (gen !== this.stageGen) { card.box.destroy(); return }

    const tone = device.kind === 'input' ? C.inBlue : C.outAmber
    paintSlot(slot.bg, RAIL.slotW, RAIL.slotH, RAIL.r, tone, true)

    const holder = this.add.container(slot.x, slot.y).setDepth(30)
    const icon = this.add.image(0, -14, this.safeTex(device.textureKey))
    this.fit(icon, 104, 104)
    const name = this.add.text(0, 66, device.label, {
      fontFamily: FONT.black, fontSize: SIZE.cardLabel, color: hex(C.ink),
      align: 'center', wordWrap: { width: RAIL.slotW - 26 },
    }).setOrigin(0.5).setResolution(2)
    holder.add([icon, name])
    this.stage?.add(holder)
    slot.icon = holder
    FX.popIn(this, holder, { from: 0.7, duration: 260 })

    cardAccept(this, slot.box, slot.x, slot.y)
    await FX.to(this, card.box, { alpha: 0, scale: card.box.scale * 0.86 }, { duration: 140 })
    card.box.destroy()
    this.syncPrimary()
  }

  private clearSlot(kind: DeviceKind) {
    if (this.locked || this.state !== 'chain') return
    const slot = this.slots.find(s => s.kind === kind)
    if (!slot?.deviceId) return

    const id = slot.deviceId
    const home = this.bankHome(id)
    slot.icon?.destroy()
    slot.icon = undefined
    slot.deviceId = undefined
    paintSlot(slot.bg, RAIL.slotW, RAIL.slotH, RAIL.r, kind === 'input' ? C.inBlue : C.outAmber, false)

    if (home) {
      const card = this.makeCard(id, home.x, home.y, home.w, home.h, target => this.tapChain(target))
      FX.popIn(this, card.box, { from: 0.6, duration: 300 })
    }
    this.playClick()
    this.syncPrimary()
  }

  private async runChain() {
    const round = this.level.chainRounds?.[this.roundIdx]
    const inSlot = this.slots.find(s => s.kind === 'input')
    const outSlot = this.slots.find(s => s.kind === 'output')
    if (!round || !inSlot?.deviceId || !outSlot?.deviceId || this.locked) return

    const gen = this.stageGen
    this.locked = true
    this.syncPrimary()

    if (inSlot.deviceId !== round.inputId || outSlot.deviceId !== round.outputId) {
      this.errors += 1
      runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.level.level })
      this.lives.lose(); this.livesLeft = this.lives.remaining
      this.emitCheckpoint()
      this.playError()
      FX.shakeCam(this, 'leve')

      const bad = inSlot.deviceId !== round.inputId ? inSlot : outSlot
      const line = `O ${DEVICES[bad.deviceId!].label.toLowerCase()} ${DEVICES[bad.deviceId!].action}. Esse pedido pede outro.`
      paintSlot(bad.bg, RAIL.slotW, RAIL.slotH, RAIL.r, C.red, true)
      FX.shake(this, bad.box, { amount: 10, times: 3 })
      this.reactThenIdle('op-05', line)

      this.time.delayedCall(1100, () => {
        if (gen !== this.stageGen) return
        this.clearSlot(bad.kind)
        this.locked = false
        this.syncPrimary()
      })
      return
    }

    this.state = 'run'
    // op-02 aponta para a direita na arte; o computador está à esquerda dele,
    // então o `pointAt` espelha e o gesto passa a mirar a máquina.
    this.pointAt(COMPUTER.cx)
    this.dialog?.react('Ligando a central...')

    const c = this.computer
    const plugL = c
      ? { x: c.x - c.displayWidth / 2 + c.displayWidth * COMPUTER.plugIn.fx, y: c.y - c.displayHeight / 2 + c.displayHeight * COMPUTER.plugIn.fy }
      : { x: COMPUTER.cx - 120, y: COMPUTER.chainY }
    const plugR = c
      ? { x: c.x - c.displayWidth / 2 + c.displayWidth * COMPUTER.plugOut.fx, y: c.y - c.displayHeight / 2 + c.displayHeight * COMPUTER.plugOut.fy }
      : { x: COMPUTER.cx + 120, y: COMPUTER.chainY }

    const inCable = createCable(this, this.stage!, { x: inSlot.x + RAIL.slotW / 2 - 20, y: inSlot.y + 40 }, plugL, C.inBlue, { sag: 58, depth: CABLE_DEPTH })
    const outCable = createCable(this, this.stage!, plugR, { x: outSlot.x - RAIL.slotW / 2 + 20, y: outSlot.y + 40 }, C.outAmber, { sag: 58, depth: CABLE_DEPTH })
    await inCable.plugIn(360)
    if (gen !== this.stageGen) { inCable.destroy(); outCable.destroy(); return }
    await outCable.plugIn(360)
    if (gen !== this.stageGen) { inCable.destroy(); outCable.destroy(); return }

    FX.impact(this, inSlot.box, 0.16)
    await deviceSignal(this, this.stage!, inSlot.x, inSlot.y, round.inputId)
    if (gen !== this.stageGen) { inCable.destroy(); outCable.destroy(); return }

    await inCable.pulse({ duration: 820, iconKey: INFOS[round.inInfoId].textureKey })
    if (gen !== this.stageGen) { inCable.destroy(); outCable.destroy(); return }

    await this.screen?.show(INFOS[round.inInfoId].textureKey, C.inBlue)
    if (gen !== this.stageGen) return
    await this.screen?.process()
    if (gen !== this.stageGen) return
    await this.screen?.show(INFOS[round.outInfoId].textureKey, C.outAmber)
    if (gen !== this.stageGen) return

    await outCable.pulse({ duration: 820, iconKey: INFOS[round.outInfoId].textureKey })
    if (gen !== this.stageGen) { inCable.destroy(); outCable.destroy(); return }

    FX.impact(this, outSlot.box, 0.2)
    await deviceSignal(this, this.stage!, outSlot.x, outSlot.y, round.outputId)
    if (gen !== this.stageGen) return
    FX.ping(this, outSlot.x, outSlot.y, C.outAmber, { radius: 100 })

    if (gen !== this.stageGen) return
    paintSlot(inSlot.bg, RAIL.slotW, RAIL.slotH, RAIL.r, C.green, true)
    paintSlot(outSlot.bg, RAIL.slotW, RAIL.slotH, RAIL.r, C.green, true)

    this.award(40)
    this.react(this.cheerFrame(), round.successLine)
    FX.flash(this, C.cream, { duration: 300, peak: 0.3 })
    FX.sparks(this, COMPUTER.cx, COMPUTER.chainY, { color: C.green, count: 26, spread: 240 })

    this.time.delayedCall(1700, () => {
      if (gen !== this.stageGen) return
      this.nextRound()
    })
  }

  private drawTaskCard(label: string, iconKey: string, tone: number) {
    const box = this.add.container(TASK.cx, TASK.cy).setDepth(20)
    const { w, h, r } = TASK

    const bg = this.add.graphics()
    bg.fillStyle(C.shadow, 0.18)
    bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, r)
    bg.fillStyle(C.cream, 0.99)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    bg.fillStyle(tone, 0.2)
    bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 12, w - 28, 18, 9)
    bg.lineStyle(5, tone, 0.95)
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

    const halo = this.add.graphics()
    halo.fillStyle(tone, 0.24)
    halo.fillCircle(TASK.iconX, 0, 46)

    const icon = this.add.image(TASK.iconX, 0, this.safeTex(iconKey))
    this.fit(icon, TASK.iconSize, TASK.iconSize)

    /*
     * "Pedido da central" saiu. Era um rótulo que não informava nada: o cartão
     * já é o pedido, tem moldura própria, ícone e fica sempre no mesmo lugar.
     * Sem ele o pedido de verdade ocupa o centro do cartão e cresce.
     */
    const text = this.add.text(TASK.titleX, 0, label, {
      fontFamily: FONT.black, fontSize: SIZE.taskTitle, color: hex(C.ink),
      wordWrap: { width: w - 200 },
    }).setOrigin(0, 0.5).setResolution(2)

    box.add([bg, halo, icon, text])
    this.stage?.add(box)
    FX.slideIn(this, box, { dy: 30, duration: 420 })
    FX.float(this, icon, { amount: 5, duration: 2000 })
  }

  private drawBank(ids: DeviceId[], onTap: (id: DeviceId) => void) {
    const n = ids.length
    const w = Math.min(BANK.cardW, (BANK.maxW - (n - 1) * BANK.gap) / n)
    const total = n * w + (n - 1) * BANK.gap
    const start = BANK.cx - total / 2 + w / 2

    const made = ids.map((id, i) =>
      this.makeCard(id, start + i * (w + BANK.gap), BANK.singleY, w, BANK.cardH, onTap).box)

    dealIn(this, made)
  }

  private makeCard(id: DeviceId, x: number, y: number, w: number, h: number, onTap: (id: DeviceId) => void) {
    this.cards.get(id)?.box.destroy()
    this.cards.delete(id)

    const device = DEVICES[id]
    const box = this.add.container(x, y).setDepth(20)

    const bg = this.add.graphics()
    paintCard(bg, w, h, BANK.r, 'normal')

    const icon = this.add.image(0, BANK.iconDY, this.safeTex(device.textureKey))
    this.fit(icon, w * 0.56, h * 0.5)

    const label = this.add.text(0, BANK.labelDY, device.label, {
      fontFamily: FONT.black, fontSize: SIZE.cardLabel, color: hex(C.ink),
      align: 'center', wordWrap: { width: w - 20 },
    }).setOrigin(0.5).setResolution(2)

    box.add([bg, icon, label])

    const alive = () => !this.locked && this.cards.has(id)
    const hit = this.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true })
    hit.on('pointerdown', () => { if (alive()) { this.playClick(); onTap(id) } })
    hit.on('pointerover', () => {
      if (!alive()) return
      paintCard(bg, w, h, BANK.r, 'hover')
      FX.to(this, box, { scale: 1.06, y: y - 6 }, { duration: 130 })
    })
    hit.on('pointerout', () => {
      if (!alive()) return
      paintCard(bg, w, h, BANK.r, 'normal')
      FX.to(this, box, { scale: 1, y }, { duration: 130 })
    })
    box.add(hit)

    this.stage?.add(box)
    const view: CardView = { id, box, bg, x, y, w, h }
    this.cards.set(id, view)
    return view
  }

  private bankHome(id: DeviceId) {
    const round = this.level.chainRounds?.[this.roundIdx]
    if (!round) return null
    const ids = round.options
    const n = ids.length
    const index = ids.indexOf(id)
    if (index < 0) return null
    const w = Math.min(BANK.cardW, (BANK.maxW - (n - 1) * BANK.gap) / n)
    const total = n * w + (n - 1) * BANK.gap
    const start = BANK.cx - total / 2 + w / 2
    return { x: start + index * (w + BANK.gap), y: BANK.singleY, w, h: BANK.cardH }
  }

  private syncPrimary() {
    if (this.state !== 'chain') {
      this.primary?.setEnabled(false)
      return
    }
    const ready = this.slots.every(s => !!s.deviceId)
    this.primary?.setEnabled(ready && !this.locked)
  }

  private nextRound() {
    this.roundIdx += 1
    if (this.roundIdx >= this.totalRounds) {
      this.endLevel()
      return
    }
    if (this.level.sortRounds) this.showSort()
    else if (this.level.pickRounds) this.showPick()
    else this.showChain()
  }

  /** Última rodada do nível? Então o acerto vale comemoração, não só um "ok". */
  private cheerFrame(): OpFrame {
    return this.roundIdx + 1 >= this.totalRounds ? 'op-06' : 'op-04'
  }

  private award(value: number) {
    this.points += value
    this.hits += 1
    runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: value, stage: this.level.level })
    this.emitCheckpoint()
    this.playCorrect()
    FX.popText(this, BOARD.cx, TASK.cy + 70, `+${value}`, { color: hex(C.green), size: '40px' })
  }

  private endLevel() {
    this.ended = true
    this.locked = true
    this.state = 'complete'
    this.setPose('op-06')
    runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length })
    this.emitCheckpoint(true)

    const next = this.level.level < 3 ? this.level.level + 1 : null
    if (next) {
      showLevelComplete(this, {
        title: `Nível ${this.level.level} completo`,
        subtitle: this.level.title,
        message: this.level.successMessage,
        accent: C.inBlue,
        panelColor: C.cream,
        overlayColor: C.ink,
        progress: { total: 3, current: this.level.level },
        autoAdvance: {
          delay: 1800,
          label: `Preparando nível ${next}...`,
          onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
        },
      })
      return
    }

    FX.confetti(this, { colors: [C.inBlue, C.outAmber, C.green, C.cream] })
    showLevelComplete(this, {
      title: 'Central completa',
      subtitle: 'Central de Entrada e Saída',
      message: 'A informação entra, o computador trabalha e ela sai mudada.',
      accent: C.green,
      panelColor: C.cream,
      overlayColor: C.ink,
      progress: { total: 3, current: 3 },
      buttons: [
        { label: 'Jogar de novo', color: C.green, onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }) },
        { label: 'Escolher jogo', color: C.inBlue, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  private runTutorial(force: boolean) {
    const steps: TutorialStep[] = this.state === 'sort'
      ? [
        { text: 'Este é o aparelho da vez.', shape: 'rect', x: SORT_CARD.cx, y: SORT_CARD.cy, w: SORT_CARD.w + 30, h: SORT_CARD.h + 26, balloonY: 470 },
        { text: 'Toque na porta certa: entra ou sai.', shape: 'rect', x: BOARD.cx, y: PORTS.cy, w: PORTS.w * 2 + PORTS.gap + 30, h: PORTS.h + 30, balloonY: 300 },
      ]
      : this.state === 'pick'
        ? [
          { text: 'O pedido fica aqui em cima.', shape: 'rect', x: TASK.cx, y: TASK.cy, w: TASK.w + 26, h: TASK.h + 26, balloonY: 470 },
          { text: 'Toque no aparelho que faz o pedido.', shape: 'rect', x: BANK.cx, y: BANK.singleY, w: BANK.maxW + 24, h: BANK.cardH + 30, balloonY: 300 },
        ]
        : [
          { text: 'A informação entra aqui e sai ali.', shape: 'rect', x: BOARD.cx, y: RAIL.cy, w: BANK.maxW + 24, h: RAIL.slotH + 34, balloonY: 590 },
          { text: 'Escolha um aparelho de cada lado.', shape: 'rect', x: BANK.cx, y: BANK.singleY, w: BANK.maxW + 24, h: BANK.cardH + 30, balloonY: 250 },
          { text: 'Depois ligue a central.', shape: 'rect', x: OP.cx, y: OP.btnY, w: OP.btnW + 30, h: OP.btnH + 26, balloonX: 520, balloonY: 336 },
        ]

    this.locked = true
    this.setPose('op-03')
    createTutorial(this, {
      key: `central-${this.state}`,
      once: !force,
      accent: C.inBlue,
      safeTop: HUD.y + HUD.h + 14,
      steps,
      onFinish: () => { this.locked = false; this.syncPrimary() },
    })
  }

  private replayTutorial() {
    if (this.state === 'sort' || this.state === 'pick' || this.state === 'chain') this.runTutorial(true)
  }

  private clearStage() {
    this.stageGen += 1
    this.stage?.destroy()
    this.stage = this.add.container(0, 0).setDepth(5)
    this.ports = []
    this.slots = []
    this.cards.clear()
    this.screen = undefined
    this.computer = undefined
    this.primary?.destroy()
    this.primary = undefined
  }

  /**
   * O cabeçalho do tabuleiro perdeu o título.
   *
   * Ele repetia, palavra por palavra, o título que já está no HUD a 70px de
   * distância — duas vezes "Entra ou sai?" na mesma tela. Ficou só a linha de
   * apoio, que é a única das duas que diz o que fazer agora.
   */
  private drawBoard(helper: string) {
    const g = this.add.graphics()
    paintBoard(g, BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r)

    this.stage?.add(g)
    FX.fadeIn(this, g, 320)

    // Nível sem linha de apoio não ganha cabeçalho vazio: o painel entra limpo.
    if (!helper) return

    const helperText = this.add.text(BOARD.cx, BOARD.y + 22, helper, {
      fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.boardHelper, color: hex(C.cream),
      align: 'center', wordWrap: { width: BOARD.w - 120 },
    }).setOrigin(0.5).setResolution(2)

    this.stage?.add(helperText)
  }

  private makePrimary(label: string, onClick: () => void) {
    if (!this.actionLayer) return undefined
    const btn = createBigButton(
      this, this.actionLayer,
      OP.cx, OP.btnY, OP.btnW, OP.btnH,
      label,
      () => { this.playClick(); onClick() },
    )
    btn.setEnabled(false)
    return btn
  }

  private safeTex(key: string) {
    return this.textures.exists(key) ? key : ICON_FALLBACK
  }

  private fit(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
    image.setScale(Math.min(maxW / image.width, maxH / image.height))
  }

  private emitCheckpoint(forceComplete = false) {
    const before = LEVELS.slice(0, this.levelIdx)
      .reduce((sum, l) => sum + (l.sortRounds ?? l.pickRounds ?? l.chainRounds ?? []).length, 0)
    const total = LEVELS
      .reduce((sum, l) => sum + (l.sortRounds ?? l.pickRounds ?? l.chainRounds ?? []).length, 0)
    const completed = before + this.roundIdx + (forceComplete ? 1 : 0)
    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress: Math.round((completed / total) * 100),
      score: this.points,
      stage: this.level.level,
      hits: this.hits,
      errors: this.errors,
    })
  }

  private getAudioCtx(): AudioContext | null {
    if (this.isMuted) return null
    try { return (this.sound as Phaser.Sound.WebAudioSoundManager).context } catch { return null }
  }

  private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
    const ctx = this.getAudioCtx()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g)
    g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start()
    osc.stop(ctx.currentTime + dur)
  }

  private playClick() { this.playTone(420, 0.045, 'sine', 0.07) }
  private playDrop() { this.playTone(560, 0.06, 'triangle', 0.08) }
  private playCorrect() {
    this.playTone(620, 0.08, 'sine', 0.13)
    this.time.delayedCall(85, () => this.playTone(820, 0.1, 'sine', 0.1))
  }
  private playError() { this.playTone(210, 0.18, 'square', 0.11) }
}