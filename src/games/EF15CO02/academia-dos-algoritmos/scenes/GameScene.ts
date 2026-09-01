import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { FX } from '../../../../shared/effects/FX'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import {
  ACTIONS,
  buildPieces,
  LEVELS,
  OBJECTS,
  simulate,
  TOTAL_PUZZLES,
} from '../data/puzzles'
import { C, TIMING } from '../data/theme'
import { BELT, BENCH, COLUMN, H, LANE, SHELF, STAGE, TRACK, W } from '../data/layout'
import {
  createBench,
  createColumn,
  createHud,
  createNotice,
  createShelf,
  createStage,
  createTrack,
  flyToTrack,
  type Column,
  type Hud,
  type Notice,
  type Shelf,
  type Stage,
  type Track,
} from './effects'
import {
  createBelt,
  createGarden,
  createPlay,
  createVersions,
  flyGesture,
  type Belt,
  type Garden,
  type PlayButton,
  type Version,
  type Versions,
} from './trail'
import { at } from '../types'
import type {
  BenchLevel,
  Level,
  Piece,
  Puzzle,
  Result,
  Station,
  TrailPuzzle,
  World,
} from '../types'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = '043'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A ACADEMIA DOS ALGORITMOS — UMA CENA SÓ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O jogo tem dois tabuleiros, e não duas cenas.
 *
 * ── POR QUE ISTO ESTAVA EM DUAS CENAS, E POR QUE VOLTOU A SER UMA ────────
 *
 * O nível 2 nasceu numa `GardenScene` própria porque o tabuleiro dele é
 * mesmo outro: no 1 há bancada, trilha de cartas e prateleira; no 2 há um
 * caminho que a Lia percorre. O que a separação não pagou foi o resto — som,
 * checkpoint, tutorial, mudo, desmonte e o ciclo de vitória/derrota eram os
 * mesmos, copiados. Duas cópias de um laço de execução é onde um conserto
 * entra num lado só e o bug fica vivo no outro.
 *
 * Agora o que muda entre os níveis é o TABULEIRO (`buildBench` ou
 * `buildTrail`) e o que ACONTECE ao apertar o botão (`runBench` ou
 * `runTrail`). Tudo o mais é comum, escrito uma vez.
 *
 * O `BootScene` continua abrindo aqui, com `faseInicial`, e trocar de nível
 * é `scene.restart` — não `scene.start` de outra cena.
 */
export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
  private level!: Level
  private idx = 0
  private points = 0
  private hits = 0
  private misses = 0

  /** Every await is followed by `if (gen !== this.gen) return`. */
  private gen = 0

  private locked = false
  private running = false

  private world!: World

  /*
   * O MUNDO DE PARTIDA, GUARDADO.
   *
   * O nível 2 tem enigmas que SORTEIAM o estado inicial (`maybe`): o regador
   * pode nascer cheio ou vazio, e é justamente isso que obriga a bifurcação a
   * existir. Só que `initialWorld()` sorteia A CADA CHAMADA — e o `run()`
   * chamava de novo a cada Executar.
   *
   * O efeito para a criança era o pior possível: ela preparava os dois ramos,
   * apertava, via "vazio", errava outra coisa, apertava de novo — e agora
   * estava "cheio". O jogo trocava a resposta embaixo dela, e nada na tela
   * dizia isso. Um enigma que muda sozinho não é enigma, é sorteio.
   *
   * Agora o sorteio acontece UMA VEZ, quando o enigma abre, e toda execução
   * parte de uma cópia deste mundo. Trocar de enigma sorteia de novo.
   */
  private startWorld!: World

  private benchPuzzle?: Puzzle
  private trailPuzzle?: TrailPuzzle
  private versionsOf: Version[] = []

  private hud!: Hud

  /* o tabuleiro do nível 1 */
  private stage?: Stage
  private track?: Track
  private shelf?: Shelf
  private notice?: Notice
  private column?: Column

  /* o tabuleiro do nível 2 */
  private garden?: Garden
  private belt?: Belt
  private play?: PlayButton
  private board?: Versions

  private isMuted = false

  constructor() {
    super({ key: 'GameScene' })
  }

  private get isTrail(): boolean {
    return this.level.kind === 'trail'
  }

  init(data: { level?: number; puzzle?: number; points?: number; lives?: number }) {
      this.livesTotal = vidasIniciais(this, 3)
      this.livesLeft = data?.lives ?? this.livesTotal
    const n = Phaser.Math.Clamp(data.level ?? 1, 1, LEVELS.length)
    this.level = LEVELS[n - 1]
    this.idx = Phaser.Math.Clamp(data.puzzle ?? 0, 0, this.level.puzzles.length - 1)
    this.points = data.points ?? 0
    this.hits = 0
    this.misses = 0
    this.gen = 0
    this.locked = false
    this.running = false

    /* Uma restart não limpa campos de instância: o tabuleiro do nível
     * anterior continuaria referenciado e o desmonte tentaria destruí-lo
     * duas vezes. */
    this.stage = undefined
    this.track = undefined
    this.shelf = undefined
    this.notice = undefined
    this.column = undefined
    this.garden = undefined
    this.belt = undefined
    this.play = undefined
    this.board = undefined
  }

  create() {
    if (this.isTrail) this.buildTrailBoard()
    else this.buildBenchBoard()

    this.hud = createHud(this, this.replayTutorial)
    this.hud.setLevel(this.level.number, this.level.idea)

    EventBus.on('mute-audio', this.onMute, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', this.shutdownScene, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.emitCheckpoint()

    void this.playPuzzle(this.idx === 0)

      /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
      this.lives = createLives(this, {
          total: this.livesTotal,
          remaining: this.livesLeft,
          gameId: GAME_ID,
          x: 40,
          y: 40,
          size: 30,
          stage: () => this.level.number,
      })
      this.events.once('shutdown', () => this.lives.destroy())
  }

  private buildBenchBoard() {
    const level = this.level as BenchLevel

    createBench(this)
    this.stage = createStage(this)
    this.track = createTrack(this, (i) => this.onSlotTap(i))
    this.shelf = createShelf(this, (p, i) => void this.onBlockTap(p, i))
    this.notice = createNotice(this)
    this.column = createColumn(this, () => void this.run())

    this.stage.dress(level)
    this.column.setMood('normal')
  }

  private buildTrailBoard() {
    this.garden = createGarden(this, (i) => this.onSlotTap(i))
    this.belt = createBelt(this, (id, i) => void this.onGestureTap(id, i))
    this.play = createPlay(this, () => void this.run())
    this.board = createVersions(this)
  }

  /* ───────────────────────────────────────────── abrir um enigma ─────── */

  /** Uma cópia funda: o `Set` precisa ser outro, senão os dois mundos andam juntos. */
  private static copy(w: World): World {
    return { inHand: w.inHand, counter: w.counter, facts: new Set(w.facts) }
  }

  private async playPuzzle(withTutorial: boolean) {
    const gen = ++this.gen

    this.locked = false
    this.running = false
    this.versionsOf = []

    /* O sorteio acontece AQUI, e só aqui. Ver `startWorld`. */
    const puzzle = this.level.puzzles[this.idx]
    this.startWorld = puzzle.initialWorld()
    this.world = GameScene.copy(this.startWorld)

    this.hud.setProgress(this.idx, this.level.puzzles.length)

    if (this.isTrail) this.openTrailPuzzle(puzzle as TrailPuzzle)
    else this.openBenchPuzzle(puzzle as Puzzle)

    await this.enterBoard()
    if (gen !== this.gen) return

    if (withTutorial) this.runTutorial(this.tutorialSteps(), false)
  }

  private openBenchPuzzle(puzzle: Puzzle) {
    this.benchPuzzle = puzzle

    this.notice?.clear()
    this.column?.setRequest(puzzle.request)
    this.column?.setMood('normal')

    this.track?.build(puzzle.slots)
    this.shelf?.build(puzzle.offer)
    this.stage?.build(puzzle.objects, this.world)

    /* run() switches these off; only the losing path turns them back on. */
    this.track?.setActive(true)
    this.shelf?.setActive(true)
    this.refreshButton()
  }

  private openTrailPuzzle(puzzle: TrailPuzzle) {
    this.trailPuzzle = puzzle

    this.garden?.build(puzzle, this.world)
    this.belt?.build(puzzle.belt)
    this.syncBelt()
    this.garden?.setActive(true)
    this.belt?.setActive(true)
    this.refreshButton()
  }

  /** Abertura discreta: a tela ganha entrada sem roubar a cena do Executar. */
  private openingZoom() {
    const cam = this.cameras.main
    cam.stopFollow()
    cam.setBounds(0, 0, W, H)
    cam.setZoom(1.12)
    cam.centerOn(W / 2, H / 2)
    cam.zoomTo(1, 560, 'Sine.easeOut')
  }

  /**
   * A CÂMERA ACOMPANHA A LIA ENQUANTO O ALGORITMO RODA.
   *
   * De longe, o gesto dela é um boneco de 100px fazendo alguma coisa em
   * cima de outra de 88px — a criança vê que ACONTECEU, não vê o QUÊ. É
   * justamente o instante em que ela precisa entender por que o passo
   * funcionou ou travou.
   *
   * `setBounds` prende a câmera à tela do jogo: por mais que a Lia ande
   * para a beirada, nunca aparece vazio ao lado dela.
   */
  private tracking = false
  private aim = { x: 0, y: 0 }

  /**
   * A CÂMERA É MOVIDA À MÃO, NO `update`, E NÃO POR `startFollow`.
   *
   * `startFollow` do Phaser gruda a câmera no alvo na hora em que é
   * chamado: depois de cada `pan` de enquadramento, retomar o follow dava
   * um salto seco até a Lia. Aqui a câmera persegue o alvo por interpolação
   * a cada quadro, então mudar de alvo no meio do caminho é só mudar para
   * onde ela está indo — nunca um corte.
   */
  private followWalker(on: boolean) {
    if (!this.isTrail) return
    const cam = this.cameras.main

    if (!on) {
      this.tracking = false
      this.tweens.killTweensOf(this.aim)
      cam.zoomTo(1, 480, 'Sine.easeInOut')
      cam.pan(W / 2, H / 2, 480, 'Sine.easeInOut')
      return
    }

    cam.setBounds(0, 0, W, H)
    cam.stopFollow()
    this.aim = { x: 0, y: 0 }
    this.tracking = true
    cam.zoomTo(1.36, 560, 'Sine.easeInOut')
  }

  update(_time: number, delta: number) {
    if (!this.tracking) return

    const lia = this.garden?.walker()
    const cam = this.cameras.main
    if (!lia || cam.panEffect.isRunning) return

    const t = 1 - Math.pow(0.91, delta / 16.67)
    cam.centerOn(
      Phaser.Math.Linear(cam.midPoint.x, lia.x + this.aim.x, t),
      Phaser.Math.Linear(cam.midPoint.y, lia.y + this.aim.y, t)
    )
  }

  /** Para onde a câmera olha, medido a partir da Lia. */
  private aimAt(x: number, y: number, duration = 340) {
    this.tweens.killTweensOf(this.aim)
    this.tweens.add({ targets: this.aim, x, y, duration, ease: 'Sine.easeInOut' })
  }

  /**
   * ENQUADRA OS DOIS: quem age e quem recebe.
   *
   * Seguir só a Lia funciona enquanto o gesto acontece na mão dela. Mas
   * `guardar` manda o caderno da mesa até a mochila, que fica noutra
   * estação — e a criança via a coisa sair e sumir da tela. O que ela
   * precisa ver é a chegada.
   *
   * A câmera solta a Lia, vai para o meio do caminho entre as duas, e a
   * retoma quando o passo termina.
   */
  private frameAction(to: { x: number; y: number }) {
    if (!this.isTrail || !this.tracking) return
    const lia = this.garden?.walker()
    if (!lia) return

    this.aimAt((to.x - lia.x) / 2, (to.y - lia.y) / 2)
  }

  private resumeFollow() {
    if (!this.isTrail || !this.running) return
    this.aimAt(0, 0)
  }

  private async enterBoard() {
    this.openingZoom()

    if (this.isTrail) {
      await FX.all(
        this.garden ? FX.slideIn(this, this.garden.container, { dy: 40, duration: 400 }) : Promise.resolve(),
        this.belt ? FX.slideIn(this, this.belt.container, { dy: 60, delay: 110, duration: 400 }) : Promise.resolve(),
        this.play ? FX.slideIn(this, this.play.container, { dy: 60, delay: 180, duration: 400 }) : Promise.resolve()
      )
      return
    }

    const floors = [this.stage?.container, this.track?.container, this.shelf?.container]
    await FX.all(
      ...floors.map((c, i) =>
        c ? FX.slideIn(this, c, { dy: 44, delay: i * 90, duration: 380 }) : Promise.resolve()
      )
    )
    await FX.wait(this, 140)
  }

  /* ───────────────────────────────────────────────────── os toques ─────── */

  /** Nível 1: um bloco da prateleira voa para o primeiro buraco livre. */
  private async onBlockTap(piece: Piece, index: number) {
    if (this.locked || this.running || !this.track || !this.shelf) return

    const empty = this.track.firstEmpty()
    if (empty < 0) {
      void this.notice?.show('A trilha está cheia. Toque num passo para tirar.', 'error')
      this.tone(240, 0.1, 'sine')
      return
    }

    /* Reserve before the await, or fast taps all read the same empty slot. */
    this.track.reserve(empty)

    this.notice?.clear()
    this.tone(660, 0.06, 'triangle')

    await flyToTrack(this, piece, this.shelf.cardPos(index), this.track.slotPos(empty))

    if (this.locked || this.running) return

    this.track.put(empty, piece)
    this.refreshButton()
  }

  /** Nível 2: um gesto do cinto voa para o buraco do caminho. */
  private async onGestureTap(actionId: string, index: number) {
    if (this.locked || this.running || !this.garden || !this.belt) return

    const empty = this.garden.firstEmpty()
    if (empty < 0) {
      this.tone(240, 0.1, 'sine')
      return
    }

    this.garden.reserve(empty)
    this.tone(660, 0.06, 'triangle')

    await flyGesture(this, actionId, this.belt.posOf(index), this.garden.slotPos(empty))

    if (this.locked || this.running) return

    this.garden.put(empty, actionId)
    this.syncBelt()
    this.refreshButton()
  }

  private onSlotTap(i: number) {
    if (this.locked || this.running) return

    if (this.isTrail) {
      if (!this.garden?.take(i)) return
    } else {
      if (!this.track?.take(i)) return
      this.notice?.clear()
    }

    this.tone(420, 0.06, 'sine')
    this.syncBelt()
    this.refreshButton()
  }

  private syncBelt() {
    if (!this.isTrail) return
    const inUse = (this.garden?.filled() ?? []).filter((a): a is string => !!a)
    this.belt?.setUsed(inUse)
  }

  private refreshButton() {
    if (this.isTrail) {
      const any = this.garden?.filled().some((a) => a !== null) ?? false
      this.play?.setReady(any && !this.running)
      return
    }
    const any = this.track?.pieces().some((p) => p !== null) ?? false
    this.column?.setButton(any && !this.running)
  }

  /* ─────────────────────────────────────────────────── a execução ─────── */

  private async run() {
    if (this.running || this.locked) return
    if (this.isTrail) await this.runTrail()
    else await this.runBench()
  }

  private async runBench() {
    const gen = ++this.gen
    const puzzle = this.benchPuzzle
    if (!puzzle || !this.track || !this.stage) return

    this.running = true
    this.track.setActive(false)
    this.shelf?.setActive(false)
    this.column?.setButton(false)
    this.column?.setMood('thinking')
    this.notice?.clear()

    this.world = GameScene.copy(this.startWorld)
    this.stage.build(puzzle.objects, this.world)

    /* simulate() writes into the world it gets: it must not be the one on screen. */
    const draft = GameScene.copy(this.world)
    const { result, beats } = simulate(this.track.pieces(), puzzle, draft)

    for (const b of beats) {
      await this.track.light(b.slot, b.loop)
      if (gen !== this.gen) return

      if (!b.error) ACTIONS[b.action]?.apply(this.world)

      await this.stage.play(b.action, !b.error, this.world)
      if (gen !== this.gen) return

      if (b.error) break
      await FX.wait(this, TIMING.beat * 0.2)
      if (gen !== this.gen) return
    }

    if (result.end === 'done') {
      await this.won(gen)
      return
    }
    await this.lostBench(gen, result)
  }

  private async runTrail() {
    const gen = ++this.gen
    const puzzle = this.trailPuzzle
    if (!puzzle || !this.garden) return

    this.running = true
    this.garden.setActive(false)
    this.belt?.setActive(false)
    this.play?.setReady(false)
    this.followWalker(true)

    const filling = this.garden.filled()

    /* Repõe o caminho no estado de partida — o MESMO de sempre, não um novo
     * sorteio — e devolve os gestos que a criança já tinha posto. */
    this.world = GameScene.copy(this.startWorld)
    this.garden.build(puzzle, this.world)
    filling.forEach((a, i) => a && this.garden?.put(i, a))
    this.syncBelt()
    this.garden.setActive(false)

    const draft = GameScene.copy(this.world)
    const pieces = buildPieces(puzzle.trail, filling)
    const { result, beats } = simulate(pieces, puzzle, draft)

    let lastStation = -1

    for (const b of beats) {
      const station = b.slot
      const st: Station | undefined = puzzle.trail[station]
      const slot = this.slotOf(puzzle, station, b.branch)

      if (station !== lastStation) {
        lastStation = station
        await this.garden.toLane()
        if (gen !== this.gen) return
      }

      if (st?.kind === 'fork') {
        await this.garden.walkTo(this.garden.stationCenter(station) + LANE.fork.postDx - 78)
        if (gen !== this.gen) return

        const yes = b.branch === 'then'
        this.frameAction({
          x: this.garden.stationCenter(station) + LANE.fork.cardDx,
          y: LANE.slotY,
        })
        await this.garden.reveal(station, yes)
        this.resumeFollow()
        if (gen !== this.gen) return

        this.tone(yes ? 720 : 380, 0.1, 'triangle')
        await this.garden.toBranch(station)
        if (gen !== this.gen) return
      } else if (st?.kind === 'loop') {
        const turn = (b.loop?.current ?? 1) - 1
        this.garden.loopPips(turn)
        const target = st.each[Math.min(turn, st.each.length - 1)]
        await this.garden.walkTo(this.garden.where(target, this.world).x - LANE.stand)
        if (gen !== this.gen) return
      } else {
        await this.garden.walkTo(this.garden.stationCenter(station))
        if (gen !== this.gen) return
      }

      this.garden.light(slot)

      if (!b.action) {
        await this.garden.hop()
        if (gen !== this.gen) return
        continue
      }

      /*
       * O ALVO SE RESOLVE ANTES DE O MUNDO ANDAR.
       *
       * `regar` mira em `canteiro-${contador + 1}`. Resolvendo depois do
       * `apply`, o contador já subiu e a Lia regaria o canteiro seguinte — a
       * segunda volta do laço molharia o terceiro pé, e o primeiro ficaria
       * seco na tela mesmo tendo sido regado na lógica.
       */
      const def = ACTIONS[b.action]
      const targetId = def ? at(def.target, this.world) : ''
      const sourceId = def?.source ? at(def.source, this.world) : null

      if (!b.error) def?.apply(this.world)

      await this.act(!b.error, b.action, targetId, sourceId)
      if (gen !== this.gen) return

      if (b.error) {
        this.garden.light(null)
        await this.stuck(gen, b.action, slot)
        return
      }

      if (b.loop) this.garden.loopPips(b.loop.current)
      await FX.wait(this, TIMING.beat * 0.15)
      if (gen !== this.gen) return
    }

    this.garden.light(null)
    await this.garden.toLane()
    if (gen !== this.gen) return

    this.followWalker(false)

    if (result.end === 'done') {
      this.versionsOf.push({ filling, stuckAt: null, won: true })
      await this.won(gen)
      return
    }

    this.versionsOf.push({ filling, stuckAt: null, won: false })
    this.misses += 1
    this.emitWrong()

    await this.garden.missGoal()
    if (gen !== this.gen) return

    this.tone(200, 0.18, 'sawtooth')
    this.backToBuilding()
  }

  /** Que buraco visual mora em cada estação lógica. A bifurcação tem dois. */
  private slotOf(puzzle: TrailPuzzle, station: number, branch?: 'then' | 'otherwise') {
    let slot = 0
    for (let i = 0; i < station; i++) {
      slot += puzzle.trail[i].kind === 'fork' ? 2 : 1
    }
    return branch === 'otherwise' ? slot + 1 : slot
  }

  /**
   * O GESTO, EM DESENHO.
   *
   * Quem tem origem conta a história andando: o caderno sai da mesa,
   * atravessa a tela e entra na mochila. Quem rega, derrama água em cima do
   * vaso. E o "seguir" é a Lia dando um pulinho e passando.
   */
  private async act(ok: boolean, actionId: string, targetId: string, sourceId: string | null) {
    if (!this.garden) return

    if (targetId === 'walker') {
      await this.garden.hop()
      this.tone(560, 0.07, 'triangle')
      return
    }

    const to = this.garden.where(targetId, this.world)
    this.frameAction(to)

    if (!ok) {
      this.tone(200, 0.16, 'sawtooth')
      await FX.ping(this, to.x, to.y, C.coral, { radius: 80 })
      this.resumeFollow()
      return
    }

    if (sourceId && sourceId !== targetId) {
      const consumed = OBJECTS[sourceId]?.hidden?.(this.world) ?? false
      await this.garden.carry(sourceId, to, this.world, consumed)
    }

    if (ACTIONS[actionId]?.glyph === 'drops') await this.garden.pour(to)

    this.tone(760, 0.07, 'triangle')
    this.garden.refresh(this.world)
    await FX.ping(this, to.x, to.y, C.green, { radius: 66 })
    this.resumeFollow()
  }

  /* ───────────────────────────────────────────── vitória e derrota ─────── */

  private async won(gen: number) {
    this.hits += 1
    this.points += 10

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 10,
    })

    if (this.isTrail) {
      await this.garden?.arrive()
      if (gen !== this.gen) return

      this.fanfare()
      await FX.confetti(this, { colors: [C.brass, C.green, C.cream] })
      if (gen !== this.gen) return

      /*
       * O QUADRO DE VERSÕES — "comparar diferentes soluções", da ficha.
       *
       * Só aparece quando houve mais de uma tentativa, porque é aí que existe
       * o que comparar: a que travou, e a que andou.
       */
      await this.board?.show(this.versionsOf)
      if (gen !== this.gen) return
    } else {
      this.column?.setMood('happy')

      await this.track?.celebrate()
      if (gen !== this.gen) return

      await this.notice?.show('Funcionou!', 'ok')
      this.fanfare()
      await this.stage?.celebrate()
      if (gen !== this.gen) return

      await FX.wait(this, 800)
      if (gen !== this.gen) return
    }

    this.emitCheckpoint()

    if (this.idx + 1 < this.level.puzzles.length) {
      this.idx += 1
      void this.playPuzzle(false)
      return
    }
    this.finishLevel()
  }

  private async lostBench(gen: number, result: Result) {
    this.misses += 1
    this.column?.setMood('thinking')
    this.emitWrong()

    if (result.end === 'stuck') {
      await this.track?.lock(result.atSlot)
      if (gen !== this.gen) return

      await this.notice?.show(`Passo ${result.atSlot + 1}: ${result.reason}`, 'error')
    } else if (result.end === 'missing') {
      await this.notice?.show(result.reason, 'error')
    }

    this.tone(200, 0.18, 'sawtooth')
    if (gen !== this.gen) return

    this.backToBuilding()
  }

  private async stuck(gen: number, actionId: string, slot: number) {
    this.misses += 1
    this.emitWrong()

    const def = ACTIONS[actionId]
    const blame = def ? at(def.blame ?? def.source ?? def.target, this.world) : ''

    await this.garden?.blame(slot)
    if (gen !== this.gen) return

    if (blame && blame !== 'walker') {
      await this.garden?.trouble(blame, this.world)
      if (gen !== this.gen) return
    }

    this.versionsOf.push({ filling: this.garden?.filled() ?? [], stuckAt: slot, won: false })
    this.backToBuilding()
  }

  /**
   * ERRAR NÃO LIMPA NADA.
   *
   * O tabuleiro volta a aceitar toque com os passos ainda onde ela pôs. É o
   * que torna isto depuração: ela troca UM gesto e roda de novo.
   */
  private backToBuilding() {
    this.running = false
    this.followWalker(false)

    this.garden?.light(null)
    this.garden?.setActive(true)
    this.belt?.setActive(true)

    this.track?.setActive(true)
    this.shelf?.setActive(true)

    this.refreshButton()
    this.emitCheckpoint()
  }

  private emitWrong() {
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 0,
    })
      this.lives.lose(); this.livesLeft = this.lives.remaining
  }

  /* ──────────────────────────────────────────────── fim do nível ─────── */

  private finishLevel() {
    this.levelChime()
    const next = LEVELS[this.level.number]

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.level.number,
      totalStages: LEVELS.length,
      isFinalStage: this.level.number >= LEVELS.length,
      score: this.points,
      errors: this.misses,
    })

    if (next) {
      showLevelComplete(this, {
        title: `Nível ${this.level.number} completo!`,
        subtitle: `${this.hits} de ${this.level.puzzles.length} algoritmos`,
        message: this.isTrail ? 'Agora vem um caminho novo.' : 'Agora vem um bloco novo.',
        accent: C.brass,
        panelColor: C.cream,
        overlayColor: C.ink,
        progress: { total: LEVELS.length, current: this.level.number },
        autoAdvance: {
          delay: 2400,
          label: 'Preparando o próximo treino...',
          onComplete: () =>
            this.scene.restart({ lives: this.livesLeft, 
              level: this.level.number + 1,
              puzzle: 0,
              points: this.points,
            }),
        },
      })
      return
    }

    void FX.confetti(this, { colors: [C.brass, C.green, C.cream] })

    showLevelComplete(this, {
      title: this.isTrail ? 'Você programou o jardim!' : 'Você é treinador de algoritmos!',
      subtitle: `${this.points} pontos`,
      message: this.isTrail
        ? 'Um laço faz de novo. Uma bifurcação decide.'
        : 'Um algoritmo é uma ordem de passos.',
      accent: C.green,
      panelColor: C.cream,
      overlayColor: C.ink,
      progress: { total: LEVELS.length, current: LEVELS.length },
      buttons: [
        {
          label: 'Jogar de novo',
          color: C.brass,
          onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, puzzle: 0, points: 0 }),
        },
        { label: 'Escolher jogo', color: C.matte, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  /* ────────────────────────────────────────────────── o tutorial ─────── */

  private tutorialSteps(): TutorialStep[] {
    return this.isTrail ? this.trailTutorial() : this.benchTutorial()
  }

  private benchTutorial(): TutorialStep[] {
    const tapAt = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })
    const middle = BENCH.x + BENCH.w / 2

    return [
      {
        text: 'Toque num bloco. Ele entra na trilha.',
        shape: 'rect' as const,
        x: middle, y: SHELF.cy, w: STAGE.w, h: SHELF.height + 30,
        balloonX: 470, balloonY: 300,
        pointer: tapAt(middle, SHELF.cy),
      },
      {
        text: 'Ponha os blocos na ordem certa, da esquerda para a direita.',
        shape: 'rect' as const,
        x: middle, y: TRACK.cy, w: STAGE.w, h: TRACK.slotHeight + 30,
        balloonX: 470, balloonY: 230,
      },
      {
        text: 'Aperte EXECUTAR e veja o que acontece.',
        shape: 'rect' as const,
        x: COLUMN.cx, y: COLUMN.button.cy, w: COLUMN.button.w + 30, h: COLUMN.button.h + 30,
        balloonX: 480, balloonY: 300,
        pointer: tapAt(COLUMN.cx, COLUMN.button.cy),
      },
    ]
  }

  private trailTutorial(): TutorialStep[] {
    const tapAt = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })

    return [
      {
        text: 'Toque num gesto do cinto.',
        shape: 'rect' as const,
        x: BELT.cx, y: BELT.cy + 20, w: 620, h: 210,
        balloonX: 470, balloonY: 300,
        pointer: tapAt(BELT.cx, BELT.cy),
      },
      {
        text: this.level.number === 3
          ? 'Olhe a coisa antes: a carta certa é a que combina com ela.'
          : 'Ele entra no buraco que está brilhando.',
        shape: 'rect' as const,
        x: 585,
        y: this.level.number === 3 ? LANE.object.cy : LANE.slotY,
        w: 1000, h: 240,
        balloonX: 470, balloonY: 560,
      },
      {
        text: 'Encha todos os buracos e aperte o play.',
        shape: 'circle' as const,
        x: BELT.play.cx, y: BELT.play.cy, w: 150, h: 150,
        balloonX: 620, balloonY: 330,
        pointer: tapAt(BELT.play.cx, BELT.play.cy),
      },
    ]
  }

  private runTutorial(steps: TutorialStep[], force: boolean) {
    this.locked = true
    this.setBoardActive(false)

    createTutorial(this, {
      key: `ef15co02-n${this.level.number}`,
      once: !force,
      accent: C.brass,
      safeTop: 80,
      steps,
      onFinish: () => {
        this.locked = false
        this.setBoardActive(true)
        this.refreshButton()
      },
    })
  }

  private setBoardActive(on: boolean) {
    this.track?.setActive(on)
    this.shelf?.setActive(on)
    this.garden?.setActive(on)
    this.belt?.setActive(on)
  }

  private replayTutorial = () => {
    if (this.running) return
    this.runTutorial(this.tutorialSteps(), true)
  }

  /* ───────────────────────────────────────────────────── o resto ─────── */

  private emitCheckpoint() {
    const before = LEVELS.slice(0, this.level.number - 1).reduce(
      (n, lv) => n + lv.puzzles.length,
      0
    )

    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress: Math.round(((before + this.idx) / TOTAL_PUZZLES) * 100),
      score: this.points,
      stage: this.level.number,
      hits: this.hits,
      errors: this.misses,
    })
  }

  private ctx: AudioContext | null = null

  private audio(): AudioContext | null {
    if (this.isMuted) return null
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      this.ctx = new Ctor()
    }
    return this.ctx
  }

  private tone(freq: number, duration: number, kind: OscillatorType, gain = 0.05) {
    const ctx = this.audio()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const volume = ctx.createGain()
    osc.type = kind
    osc.frequency.value = freq
    volume.gain.value = gain
    osc.connect(volume).connect(ctx.destination)
    osc.start()
    volume.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.stop(ctx.currentTime + duration)
  }

  private fanfare() {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.tone(f, 0.16, 'triangle'), i * 110)
    )
  }

  /** Mais grave e mais longa que a fanfarra do acerto: fecha o nivel. */
  private levelChime() {
    ;[392, 523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.tone(f, 0.32, 'triangle', 0.06), i * 150)
    )
  }

  private onMute = (silent: boolean) => {
    this.isMuted = silent
  }

  private shutdownScene() {
    this.gen++
    this.tracking = false
    this.tweens.killTweensOf(this.aim)
    this.cameras.main?.stopFollow()
    this.cameras.main?.setZoom(1)
    this.cameras.main?.centerOn(W / 2, H / 2)

    EventBus.off('mute-audio', this.onMute, this)
    EventBus.off('show-tutorial', this.replayTutorial, this)

    this.hud?.destroy()

    this.stage?.destroy()
    this.column?.destroy()
    this.track?.destroy()
    this.shelf?.destroy()
    this.notice?.destroy()

    this.garden?.destroy()
    this.belt?.destroy()
    this.play?.destroy()
    this.board?.destroy()

    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}
