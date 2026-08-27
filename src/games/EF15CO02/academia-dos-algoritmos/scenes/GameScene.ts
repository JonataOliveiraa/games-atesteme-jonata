import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { FX } from '../../../../shared/effects/FX'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { ACTIONS, LEVELS, simulate, TOTAL_PUZZLES } from '../data/puzzles'
import { C, TIMING } from '../data/theme'
import { BENCH, STAGE, COLUMN, SHELF, TRACK } from '../data/layout'
import {
  createNotice,
  createBench,
  createStage,
  createColumn,
  createHud,
  createShelf,
  createTrack,
  flyToTrack,
  type Notice,
  type Stage,
  type Column,
  type Hud,
  type Shelf,
  type Track,
} from './effects'
import type { Puzzle, World, BenchLevel, Piece, Result } from '../types'

const GAME_ID = '043'

export class GameScene extends Phaser.Scene {
  private level!: BenchLevel
  private puzzleIdx = 0
  private points = 0
  private hits = 0
  private misses = 0

  /** Every await is followed by `if (gen !== this.gen) return`. */
  private gen = 0

  private locked = false
  private running = false

  private world!: World
  private puzzle!: Puzzle

  private hud!: Hud
  private stage!: Stage
  private column!: Column
  private track!: Track
  private shelf!: Shelf
  private notice!: Notice

  private isMuted = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { level?: number; puzzle?: number; points?: number }) {
    const idx = Phaser.Math.Clamp(data.level ?? 1, 1, LEVELS.length) - 1
    const lv = LEVELS[idx]
    this.level = lv.kind === 'bench' ? lv : (LEVELS[0] as BenchLevel)
    this.puzzleIdx = Phaser.Math.Clamp(data.puzzle ?? 0, 0, this.level.puzzles.length - 1)
    this.points = data.points ?? 0
    this.hits = 0
    this.misses = 0
    this.gen = 0
    this.running = false
  }

  create() {
    createBench(this)
    this.stage = createStage(this)
    this.track = createTrack(this, (i) => this.onSlotTap(i))
    this.shelf = createShelf(this, (p, i) => void this.onBlockTap(p, i))
    this.notice = createNotice(this)
    this.column = createColumn(this, () => void this.run())
    this.hud = createHud(this, this.replayTutorial)

    this.stage.dress(this.level)
    this.column.setMood('normal')
    this.hud.setLevel(this.level.number, this.level.idea)

    EventBus.on('mute-audio', this.onMute, this)
    EventBus.on('show-tutorial', this.replayTutorial, this)
    this.events.once('shutdown', this.shutdownScene, this)

    runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
    this.emitCheckpoint()

    void this.playPuzzle(this.puzzleIdx === 0)
  }

  private async playPuzzle(withTutorial: boolean) {
    const gen = ++this.gen

    this.puzzle = this.level.puzzles[this.puzzleIdx]
    this.world = this.puzzle.initialWorld()
    this.locked = false
    this.running = false

    this.notice.clear()
    this.column.setRequest(this.puzzle.request)
    this.column.setMood('normal')
    this.hud.setProgress(this.puzzleIdx, this.level.puzzles.length)

    this.track.build(this.puzzle.slots)
    this.shelf.build(this.puzzle.offer)
    this.stage.build(this.puzzle.objects, this.world)

    /* run() switches these off; only the losing path turns them back on. */
    this.track.setActive(true)
    this.shelf.setActive(true)
    this.refreshButton()

    const floors = [this.stage.container, this.track.container, this.shelf.container]
    await FX.all(
      ...floors.map((c, i) => FX.slideIn(this, c, { dy: 44, delay: i * 90, duration: 380 }))
    )
    if (gen !== this.gen) return

    await FX.wait(this, 140)
    if (gen !== this.gen) return

    if (withTutorial) this.runTutorial(this.tutorialSteps(), false, () => {})
  }

  private async onBlockTap(piece: Piece, index: number) {
    if (this.locked || this.running) return

    const empty = this.track.firstEmpty()
    if (empty < 0) {
      void this.notice.show('A trilha está cheia. Toque num passo para tirar.', 'error')
      this.tone(240, 0.1, 'sine')
      return
    }

    /* Reserve before the await, or fast taps all read the same empty slot. */
    this.track.reserve(empty)

    this.notice.clear()
    this.tone(660, 0.06, 'triangle')

    await flyToTrack(
      this,
      piece,
      this.shelf.cardPos(index),
      this.track.slotPos(empty)
    )

    if (this.locked || this.running) return

    this.track.put(empty, piece)
    this.refreshButton()
  }

  private onSlotTap(i: number) {
    if (this.locked || this.running) return
    if (!this.track.take(i)) return

    this.notice.clear()
    this.tone(420, 0.06, 'sine')
    this.refreshButton()
  }

  private refreshButton() {
    const hasAny = this.track.pieces().some((p) => p !== null)
    this.column.setButton(hasAny && !this.running)
  }

  private async run() {
    if (this.running || this.locked) return
    const gen = ++this.gen

    this.running = true
    this.track.setActive(false)
    this.shelf.setActive(false)
    this.column.setButton(false)
    this.column.setMood('thinking')
    this.notice.clear()

    this.world = this.puzzle.initialWorld()
    this.stage.build(this.puzzle.objects, this.world)

    /* simulate() writes into the world it gets: it must not be the one on screen. */
    const draft: World = { ...this.world, facts: new Set(this.world.facts) }
    const { result, beats } = simulate(this.track.pieces(), this.puzzle, draft)

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
    await this.lost(gen, result)
  }

  private async won(gen: number) {
    this.hits += 1
    this.points += 10
    this.column.setMood('happy')

    runtimeGameBridge.emit({
      type: 'CORRECT_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 10,
    })

    await this.track.celebrate()
    if (gen !== this.gen) return

    await this.notice.show('Funcionou!', 'ok')
    this.fanfare()
    await this.stage.celebrate()
    if (gen !== this.gen) return

    await FX.wait(this, 800)
    if (gen !== this.gen) return

    this.emitCheckpoint()

    if (this.puzzleIdx + 1 < this.level.puzzles.length) {
      this.puzzleIdx += 1
      void this.playPuzzle(false)
      return
    }
    this.finishLevel()
  }

  private async lost(gen: number, result: Result) {
    this.misses += 1
    this.column.setMood('thinking')

    runtimeGameBridge.emit({
      type: 'WRONG_ANSWER',
      gameId: GAME_ID,
      stage: this.level.number,
      pointsEarned: 0,
    })

    if (result.end === 'stuck') {
      await this.track.lock(result.atSlot)
      if (gen !== this.gen) return

      await this.notice.show(`Passo ${result.atSlot + 1}: ${result.reason}`, 'error')
    } else if (result.end === 'missing') {
      await this.notice.show(result.reason, 'error')
    }

    this.tone(200, 0.18, 'sawtooth')
    if (gen !== this.gen) return

    this.running = false
    this.track.setActive(true)
    this.shelf.setActive(true)
    this.refreshButton()
    this.emitCheckpoint()
  }

  private finishLevel() {
    const nextLevel = LEVELS[this.level.number]

    runtimeGameBridge.emit({
      type: 'GAME_COMPLETED',
      gameId: GAME_ID,
      stage: this.level.number,
      totalStages: LEVELS.length,
      isFinalStage: this.level.number >= LEVELS.length,
      score: this.points,
      errors: this.misses,
    })

    if (nextLevel) {
      showLevelComplete(this, {
        title: `Nível ${this.level.number} completo!`,
        subtitle: `${this.hits} de ${this.level.puzzles.length} algoritmos`,
        message: 'Agora vem um bloco novo.',
        accent: C.brass,
        panelColor: C.cream,
        overlayColor: C.ink,
        progress: { total: LEVELS.length, current: this.level.number },
        autoAdvance: {
          delay: 2400,
          label: 'Preparando o próximo treino...',
          onComplete: () => this.startNext(),
        },
      })
      return
    }

    void FX.confetti(this, { colors: [C.brass, C.green, C.cream] })

    showLevelComplete(this, {
      title: 'Você é treinador de algoritmos!',
      subtitle: `${this.points} pontos`,
      message: 'Um algoritmo é uma ordem de passos. Você montou três.',
      accent: C.green,
      panelColor: C.cream,
      overlayColor: C.ink,
      progress: { total: LEVELS.length, current: LEVELS.length },
      buttons: [
        {
          label: 'Jogar de novo',
          color: C.brass,
          onClick: () => this.scene.restart({ level: 1, puzzle: 0, points: 0 }),
        },
        { label: 'Escolher jogo', color: C.matte, onClick: () => EventBus.emit('exit-game') },
      ],
    })
  }

  /** O nível 2 é outra cena: outro tabuleiro, outra gramática. */
  private startNext() {
    const next = LEVELS[this.level.number]
    if (next?.kind === 'trail') {
      this.scene.start('GardenScene', { puzzle: 0, points: this.points })
      return
    }
    this.scene.restart({ level: this.level.number + 1, puzzle: 0, points: this.points })
  }

  private tutorialSteps(): TutorialStep[] {
    const tapAt = (x: number, y: number) => ({ fromX: x, fromY: y, toX: x, toY: y, tap: true })
    const middle = BENCH.x + BENCH.w / 2

    return [
      {
        text: 'O treinador pede uma coisa. Leia aqui.',
        shape: 'rect' as const,
        x: COLUMN.cx, y: COLUMN.bubble.cy, w: COLUMN.bubble.w + 24, h: COLUMN.bubble.hMax,
        balloonX: 480, balloonY: 320,
      },
      {
        text: 'O desenho de cada coisa mostra como ela está.',
        shape: 'rect' as const,
        x: middle, y: STAGE.object.cy + 30, w: STAGE.w, h: 190,
        balloonX: 470, balloonY: 560,
      },
      {
        text: 'Toque num bloco para pôr ele na trilha.',
        shape: 'rect' as const,
        x: middle, y: SHELF.cy, w: STAGE.w, h: SHELF.height + 30,
        balloonX: 470, balloonY: 300,
        pointer: tapAt(middle, SHELF.cy),
      },
      {
        text: 'A ordem importa! Toque num passo para tirar.',
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

  private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
    this.locked = true
    this.track.setActive(false)
    this.shelf.setActive(false)

    createTutorial(this, {
      key: `ef15co02-n${this.level.number}`,
      once: !force,
      accent: C.brass,
      safeTop: 80,
      steps,
      onFinish: () => {
        this.locked = false
        this.track.setActive(true)
        this.shelf.setActive(true)
        this.refreshButton()
        onFinish()
      },
    })
  }

  private replayTutorial = () => {
    if (this.running) return
    this.runTutorial(this.tutorialSteps(), true, () => {})
  }

  private emitCheckpoint() {
    const before = LEVELS.slice(0, this.level.number - 1).reduce((n, lv) => n + lv.puzzles.length, 0)
    const done = before + this.puzzleIdx

    runtimeGameBridge.emit({
      type: 'CHECKPOINT',
      gameId: GAME_ID,
      progress: Math.round((done / TOTAL_PUZZLES) * 100),
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
    this.stage?.destroy()
    this.column?.destroy()
    this.track?.destroy()
    this.shelf?.destroy()
    this.notice?.destroy()

    this.ctx?.close().catch(() => {})
    this.ctx = null
  }
}
