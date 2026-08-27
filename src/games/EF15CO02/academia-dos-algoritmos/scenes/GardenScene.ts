import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { FX } from '../../../../shared/effects/FX'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { ACTIONS, buildPieces, LEVELS, OBJECTS, simulate, TOTAL_PUZZLES } from '../data/puzzles'
import { C, TIMING } from '../data/theme'
import { BELT, LANE } from '../data/layout'
import { createHud, type Hud } from './effects'
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
import type { Station, TrailLevel, TrailPuzzle, World } from '../types'

const GAME_ID = '043'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O NÍVEL 2 — A LIA ANDA O ALGORITMO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Aqui não há bancada, nem frase, nem rótulo. O caminho desenhado É o
 * enunciado: o colchete já abraça os três canteiros, a bifurcação já está
 * aberta com um "?" em cima da coisa que ninguém viu. A criança só escolhe os
 * gestos, aperta o botão, e a Lia anda aquilo.
 *
 * A tela do N1 (bancada, trilha de cartas, prateleira, botão escrito) não se
 * repete de propósito: lá o mundo e o algoritmo eram dois painéis separados,
 * aqui são o mesmo desenho. Andar por cima do próprio algoritmo é o que faz
 * laço e condição virarem forma em vez de palavra.
 */
export class GardenScene extends Phaser.Scene {
  private level!: TrailLevel
  private idx = 0
  private points = 0
  private hits = 0
  private misses = 0

  /** Every await is followed by `if (gen !== this.gen) return`. */
  private gen = 0

  private locked = false
  private running = false

  private world!: World
  private puzzle!: TrailPuzzle
  private versionsOf: Version[] = []

  private hud!: Hud
  private garden!: Garden
  private belt!: Belt
  private play!: PlayButton
  private board!: Versions

  private isMuted = false

  constructor() {
    super({ key: 'GardenScene' })
  }

  init(data: { level?: number; puzzle?: number; points?: number }) {
    const found = LEVELS.find((l): l is TrailLevel => l.kind === 'trail')
    this.level = found ?? (LEVELS[LEVELS.length - 1] as TrailLevel)
    this.idx = Phaser.Math.Clamp(data.puzzle ?? 0, 0, this.level.puzzles.length - 1)
    this.points = data.points ?? 0
    this.hits = 0
    this.misses = 0
    this.gen = 0
    this.running = false
  }

  create() {
    this.garden = createGarden(this, (i) => this.onSlotTap(i))
    this.belt = createBelt(this, (id, i) => void this.onGestureTap(id, i))
    this.play = createPlay(this, () => void this.run())
    this.board = createVersions(this)
    this.hud = createHud(this, this.replayTutorial)

    this.hud.setLevel(this.level.number, this.level.idea)

    EventBus.on('mute-audio', this.onMute, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', this.shutdownScene, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.emitCheckpoint()

    void this.playPuzzle(this.idx === 0)
  }

  private async playPuzzle(withTutorial: boolean) {
    const gen = ++this.gen

    this.puzzle = this.level.puzzles[this.idx]
    this.world = this.puzzle.initialWorld()
    this.versionsOf = []
    this.locked = false
    this.running = false

    this.hud.setProgress(this.idx, this.level.puzzles.length)
    this.garden.build(this.puzzle, this.world)
    this.belt.build(this.puzzle.belt)
    this.garden.setActive(true)
    this.belt.setActive(true)
    this.refreshPlay()

    await FX.all(
      FX.slideIn(this, this.garden.container, { dy: 40, duration: 400 }),
      FX.slideIn(this, this.belt.container, { dy: 60, delay: 110, duration: 400 }),
      FX.slideIn(this, this.play.container, { dy: 60, delay: 180, duration: 400 })
    )
    if (gen !== this.gen) return

    if (withTutorial) this.runTutorial(this.tutorialSteps(), false)
  }

  /* ─────────────────────────────────────── os toques ─────── */

  private async onGestureTap(actionId: string, index: number) {
    if (this.locked || this.running) return

    const empty = this.garden.firstEmpty()
    if (empty < 0) {
      this.tone(240, 0.1, 'sine')
      return
    }

    /* Reserve before the await, or fast taps all read the same empty slot. */
    this.garden.reserve(empty)
    this.tone(660, 0.06, 'triangle')

    await flyGesture(this, actionId, this.belt.posOf(index), this.garden.slotPos(empty))

    if (this.locked || this.running) return

    this.garden.put(empty, actionId)
    this.refreshPlay()
  }

  private onSlotTap(i: number) {
    if (this.locked || this.running) return
    if (!this.garden.take(i)) return

    this.tone(420, 0.06, 'sine')
    this.refreshPlay()
  }

  private refreshPlay() {
    this.play.setReady(this.garden.filled().some((a) => a !== null) && !this.running)
  }

  /* ─────────────────────────────────────── a caminhada ─────── */

  /** Que gesto visual mora em cada estação lógica. A bifurcação tem dois. */
  private slotOf(station: number, branch?: 'then' | 'otherwise') {
    let slot = 0
    for (let i = 0; i < station; i++) {
      slot += this.puzzle.trail[i].kind === 'fork' ? 2 : 1
    }
    return branch === 'otherwise' ? slot + 1 : slot
  }

  private async run() {
    if (this.running || this.locked) return
    const gen = ++this.gen

    this.running = true
    this.garden.setActive(false)
    this.belt.setActive(false)
    this.play.setReady(false)

    const filling = this.garden.filled()
    this.world = this.puzzle.initialWorld()
    this.garden.build(this.puzzle, this.world)
    filling.forEach((a, i) => a && this.garden.put(i, a))
    this.garden.setActive(false)

    /* simulate() writes into the world it gets: it must not be the one on screen. */
    const draft: World = { ...this.world, facts: new Set(this.world.facts) }
    const pieces = buildPieces(this.puzzle.trail, filling)
    const { result, beats } = simulate(pieces, this.puzzle, draft)

    let lastStation = -1

    for (const b of beats) {
      const station = b.slot
      const st: Station | undefined = this.puzzle.trail[station]
      const slot = this.slotOf(station, b.branch)

      if (station !== lastStation) {
        lastStation = station
        await this.garden.toLane()
        if (gen !== this.gen) return
      }

      if (st?.kind === 'fork') {
        await this.garden.walkTo(this.garden.stationCenter(station) + LANE.fork.postDx - 78)
        if (gen !== this.gen) return

        const yes = b.branch === 'then'
        await this.garden.reveal(station, yes)
        if (gen !== this.gen) return

        this.tone(yes ? 720 : 380, 0.1, 'triangle')
        await this.garden.toBranch(station, yes)
        if (gen !== this.gen) return
      } else if (st?.kind === 'loop') {
        const turn = (b.loop?.current ?? 1) - 1
        this.garden.loopPips(turn)
        const target = st.each[Math.min(turn, st.each.length - 1)]
        await this.garden.walkTo(this.garden.where(target, this.world).x)
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

      await this.act(!b.error, targetId, sourceId)
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

    if (result.end === 'done') {
      this.versionsOf.push({ filling, stuckAt: null, won: true })
      await this.won(gen)
      return
    }

    this.versionsOf.push({ filling, stuckAt: null, won: false })
    this.misses += 1
    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 0,
    })
    await this.garden.missGoal()
    if (gen !== this.gen) return
    this.tone(200, 0.18, 'sawtooth')
    this.backToBuilding()
  }

  /**
   * O GESTO, EM DESENHO.
   *
   * Quem tem origem conta a história andando: o brinquedo sai do canteiro,
   * atravessa a tela e entra na mochila. Quem não tem, acontece no lugar — e
   * o "seguir", que não mexe em nada, é a Lia dando um pulinho e passando.
   */
  private async act(ok: boolean, targetId: string, sourceId: string | null) {
    if (targetId === 'walker') {
      await this.garden.hop()
      this.tone(560, 0.07, 'triangle')
      return
    }

    const to = this.garden.where(targetId, this.world)

    if (!ok) {
      this.tone(200, 0.16, 'sawtooth')
      await FX.ping(this, to.x, to.y, C.coral, { radius: 80 })
      return
    }

    if (sourceId && sourceId !== targetId) {
      const consumed = OBJECTS[sourceId]?.hidden?.(this.world) ?? false
      await this.garden.carry(sourceId, to, this.world, consumed)
    }

    this.tone(760, 0.07, 'triangle')
    this.garden.refresh(this.world)
    await FX.ping(this, to.x, to.y, C.green, { radius: 66 })
  }

  private async stuck(gen: number, actionId: string, slot: number) {
    this.misses += 1

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 0,
    })

    const def = ACTIONS[actionId]
    const blame = def ? at(def.blame ?? def.source ?? def.target, this.world) : ''

    await this.garden.blame(slot)
    if (gen !== this.gen) return

    if (blame && blame !== 'walker') {
      await this.garden.trouble(blame, this.world)
      if (gen !== this.gen) return
    }

    this.versionsOf.push({ filling: this.garden.filled(), stuckAt: slot, won: false })
    this.backToBuilding()
  }

  /**
   * ERRAR NÃO LIMPA NADA.
   *
   * O caminho volta a aceitar toque com os gestos ainda onde ela pôs. É o que
   * torna isto depuração: ela troca UM gesto e roda de novo.
   */
  private backToBuilding() {
    this.running = false
    this.garden.light(null)
    this.garden.setActive(true)
    this.belt.setActive(true)
    this.refreshPlay()
    this.emitCheckpoint()
  }

  private async won(gen: number) {
    this.hits += 1
    this.points += 10

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 10,
    })

    await this.garden.arrive()
    if (gen !== this.gen) return

    this.fanfare()
    await FX.confetti(this, { colors: [C.brass, C.green, C.cream] })
    if (gen !== this.gen) return

    /*
     * O QUADRO DE VERSÕES — "comparar diferentes soluções", da ficha.
     *
     * Só aparece quando houve mais de uma tentativa, porque é aí que existe o
     * que comparar: a que travou, e a que andou.
     */
    await this.board.show(this.versionsOf)
    if (gen !== this.gen) return

    this.emitCheckpoint()

    if (this.idx + 1 < this.level.puzzles.length) {
      this.idx += 1
      void this.playPuzzle(false)
      return
    }
    this.finishLevel()
  }

  private finishLevel() {
    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.level.number,
      totalStages: LEVELS.length,
      isFinalStage: this.level.number >= LEVELS.length,
      score: this.points,
      errors: this.misses,
    })

    void FX.confetti(this, { colors: [C.brass, C.green, C.cream] })

    showLevelComplete(this, {
      title: 'Você programou o jardim!',
      subtitle: `${this.points} pontos`,
      message: 'Um laço faz de novo. Uma bifurcação decide.',
      accent: C.green,
      panelColor: C.cream,
      overlayColor: C.ink,
      progress: { total: LEVELS.length, current: this.level.number },
      buttons: [
        {
          label: 'Jogar de novo',
          color: C.brass,
          onClick: () => this.scene.restart({ puzzle: 0, points: 0 }),
        },
        { label: 'Escolher jogo', color: C.matte, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  /* ─────────────────────────────────────── o tutorial ─────── */

  private tutorialSteps(): TutorialStep[] {
    const tapAt = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })
    const steps: TutorialStep[] = [
      {
        text: 'A Lia anda por aqui. Ponha um gesto em cada buraco.',
        shape: 'rect' as const,
        x: 585, y: LANE.cy, w: 980, h: 150,
        balloonX: 470, balloonY: 210,
      },
      {
        text: 'Toque num gesto do cinto.',
        shape: 'rect' as const,
        x: BELT.cx, y: BELT.cy, w: 560, h: 130,
        balloonX: 470, balloonY: 380,
        pointer: tapAt(BELT.cx, BELT.cy),
      },
    ]

    const hasLoop = this.puzzle.trail.some((s) => s.kind === 'loop')
    const forkAt = this.puzzle.trail.findIndex((s) => s.kind === 'fork')

    if (hasLoop) {
      steps.push({
        text: 'O colchete faz o mesmo gesto em cada coisa.',
        shape: 'rect' as const,
        x: this.garden.stationCenter(this.puzzle.trail.findIndex((s) => s.kind === 'loop')),
        y: 300, w: 340, h: 230,
        balloonX: 470, balloonY: 560,
      })
    }
    if (forkAt >= 0) {
      steps.push({
        text: 'Ninguém sabe o que tem embaixo do "?". Prepare os dois caminhos.',
        shape: 'rect' as const,
        x: this.garden.stationCenter(forkAt), y: LANE.cy, w: 380, h: 300,
        balloonX: 470, balloonY: 200,
      })
    }

    steps.push({
      text: 'Aperte o botão e veja a Lia andar.',
      shape: 'circle' as const,
      x: BELT.play.cx, y: BELT.play.cy, w: 140, h: 140,
      balloonX: 700, balloonY: 400,
      pointer: tapAt(BELT.play.cx, BELT.play.cy),
    })

    return steps
  }

  private runTutorial(steps: TutorialStep[], force: boolean) {
    this.locked = true
    this.garden.setActive(false)
    this.belt.setActive(false)

    createTutorial(this, {
      key: `ef15co02-n${this.level.number}`,
      once: !force,
      accent: C.brass,
      safeTop: 80,
      steps,
      onFinish: () => {
        this.locked = false
        this.garden.setActive(true)
        this.belt.setActive(true)
        this.refreshPlay()
      },
    })
  }

  private replayTutorial = () => {
    if (this.running) return
    this.runTutorial(this.tutorialSteps(), true)
  }

  /* ─────────────────────────────────────── o resto ─────── */

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

  private onMute = (silent: boolean) => {
    this.isMuted = silent
  }

  private shutdownScene() {
    this.gen++

    EventBus.off('mute-audio', this.onMute, this)
    EventBus.off('show-tutorial', this.replayTutorial, this)

    this.hud?.destroy()
    this.garden?.destroy()
    this.belt?.destroy()
    this.play?.destroy()
    this.board?.destroy()

    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}
