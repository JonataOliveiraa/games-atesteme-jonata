import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CODES, GUIDE_KEY, LEVELS, POINTS, TRAINING, deal, isRight, pairIndex } from '../data/levels'
import { BEAM, BOARD, SCHOOL } from '../data/layout'
import { C, CSS, HUE } from '../data/theme'
import type { ClueDef, LevelDef, Mark, Mode } from '../types'

import { createAudio, type Audio } from './audio'
import { createBoard, type Board } from './board'
import { createBoat, type Boat } from './boat'
import { createBucket, type Bucket } from './bucket'
import { createFishingGuide, type FishingGuide } from './guide'
import { createHud, type Hud } from './hud'
import { createLake, type Lake } from './lake'
import { createSail, type Sail } from './sail'
import { createSchool, type FishView, type School } from './school'

const GAME_ID = 'pescaria-dos-codigos'
const SPLASH_DELAY = 620
const SHOW_PAIR_MS = 900
const FINALE_MS = 900
const DEMO_STOP = 20

export class GameScene extends Phaser.Scene {
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private clues: ClueDef[] = []
    private clueIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private boardReady = false
    private guiding = false
    private pairs: [Mark, Mark][] = []

    private score = 0
    private hits = 0
    private errors = 0
    private cluesDone = 0

    private audio!: Audio
    private lake!: Lake
    private school!: School
    private boat!: Boat
    private sail!: Sail
    private board!: Board
    private bucket!: Bucket
    private hud!: Hud
    private guide!: FishingGuide

    private unsubPlatform?: () => void

    private get clue(): ClueDef {
        return this.clues[this.clueIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.clues = []
        this.clueIndex = 0
        this.mode = 'intro'
        this.boardReady = false
        this.guiding = false
        this.pairs = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cluesDone = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.lake = createLake(this)
        this.school = createSchool(this, this.level)
        this.boat = createBoat(this)
        this.sail = createSail(this, CODES[this.level.code], BOARD.beatMs)
        this.board = createBoard(this)
        this.bucket = createBucket(this)
        this.hud = createHud(this, {
            phases: this.level.clues,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createFishingGuide(this, { board: this.board, sail: this.sail, school: this.school })
        this.clues = deal(this.level)

        this.board.onTap(() => this.replayClue())
        this.bindInput()

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.registry.get(GUIDE_KEY)) void this.startClue(0)
        else {
            this.registry.set(GUIDE_KEY, true)
            void this.runGuide()
        }
    }

    update(_time: number, delta: number) {
        this.school.update(delta)
        this.boat.update()
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.guide?.destroy()
        this.hud?.destroy()
        this.bucket?.destroy()
        this.board?.destroy()
        this.sail?.destroy()
        this.boat?.destroy()
        this.school?.destroy()
        this.lake?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            this.cast()
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') this.cast()
        else if (event.code === 'KeyR') this.replayClue()
        else if (event.code === 'KeyH') void this.explain()
    }

    private drum = () => this.audio.drum()

    private replayClue() {
        const open = this.mode === 'fish' || (this.mode === 'intro' && this.boardReady)
        if (!open || this.board.playing) return
        void this.board.play(this.drum)
    }

    private async startClue(index: number) {
        const gen = ++this.gen
        this.clueIndex = index
        this.mode = 'intro'
        this.boardReady = false
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.board.setEnabled(false)
        this.boat.setPose('idle')

        const clue = this.clue
        this.school.set(clue.school)
        await Promise.all([this.board.show(clue.clue), this.school.enter()])
        if (gen !== this.gen) return

        this.board.setEnabled(true)
        await this.board.play(this.drum)
        if (gen !== this.gen) return
        this.boardReady = true

        this.fish()
    }

    private fish() {
        this.mode = 'fish'
        this.school.setMoving(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.board.setEnabled(false)
        this.boat.setPose('idle')

        try {
            this.school.set(TRAINING.school)
            await Promise.all([this.board.show(TRAINING.clue), this.school.enter()])
            if (gen !== this.gen) return

            const told = await this.guide.intro(this.drum)
            if (gen !== this.gen) return
            if (told) {
                this.school.setMoving(true)
                await this.guide.catchDemo({
                    isTarget: fish =>
                        isRight(this.level.code, TRAINING.clue, fish.mark) && fish.container.x >= BEAM.x - DEMO_STOP,
                    onSpotted: () => this.school.setMoving(false),
                    catchLit: () => this.trainCatch(gen),
                })
            }
        } finally {
            await this.guide.hide()
        }
        if (gen !== this.gen) return

        this.school.setMoving(false)
        await Promise.all([this.board.lift(), this.school.leave()])
        if (gen !== this.gen) return
        this.guiding = false
        void this.startClue(0)
    }

    private async trainCatch(gen: number) {
        const index = this.school.lit()
        if (index === null) return
        const fish = await this.reelIn(gen, index)
        if (!fish || gen !== this.gen) return
        await this.landRight(gen, fish, TRAINING.clue)
    }

    private cast() {
        if (this.mode !== 'fish') return
        const index = this.school.lit()
        void this.hook(index)
    }

    private async reelIn(gen: number, index: number): Promise<FishView | undefined> {
        this.school.setMoving(false)
        this.boat.setPose('cast')
        this.audio.cast()
        const fish = this.school.take(index)
        if (!fish) return undefined

        await this.boat.drop(fish.mouth())
        if (gen !== this.gen) return undefined
        this.audio.plop()
        fish.setPose('hooked')
        this.boat.carry(fish)
        this.boat.setPose('reel')
        this.audio.reel()
        await this.boat.reel()
        if (gen !== this.gen) return undefined
        return fish
    }

    private async landRight(gen: number, fish: FishView, clue: Mark) {
        fish.setPose('happy')
        this.boat.carry(null)
        this.boat.setPose('cheer')
        this.audio.plim()
        void FX.wait(this, SPLASH_DELAY).then(() => {
            if (gen === this.gen) this.audio.splash()
        })
        await Promise.all([
            this.bucket.catchFish(fish),
            this.board.compare(fish.mark, true, this.drum),
            this.sail.light(pairIndex(this.level.code, clue)),
            this.boat.rest(),
        ])
    }

    private async hook(index: number | null) {
        const gen = this.gen
        this.mode = 'hook'
        this.hud.setHelpEnabled(false)

        if (index === null) {
            this.school.setMoving(false)
            this.boat.setPose('cast')
            this.audio.cast()
            await this.boat.drop({ x: BEAM.x, y: SCHOOL.y })
            if (gen !== this.gen) return
            this.audio.plop()
            this.boat.bubbles()
            this.audio.blup()
            await this.boat.rest()
            if (gen !== this.gen) return
            this.boat.setPose('idle')
            this.fish()
            return
        }

        const fish = await this.reelIn(gen, index)
        if (!fish || gen !== this.gen) return

        const clue = this.clue
        if (isRight(this.level.code, clue.clue, fish.mark)) await this.caught(gen, fish, clue)
        else await this.missed(gen, fish, clue)
    }

    private async caught(gen: number, fish: FishView, clue: ClueDef) {
        this.pairs.push([clue.clue, fish.mark])
        this.score += POINTS
        this.hits += 1
        this.cluesDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: POINTS,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.landRight(gen, fish, clue.clue)
        if (gen !== this.gen) return
        void this.hud.celebrate(this.clueIndex)

        await FX.wait(this, SHOW_PAIR_MS)
        if (gen !== this.gen) return

        this.board.setEnabled(false)
        await Promise.all([this.board.lift(), this.school.leave()])
        if (gen !== this.gen) return

        const next = this.clueIndex + 1
        if (next < this.clues.length) {
            void this.startClue(next)
            return
        }
        this.mode = 'done'
        this.boat.setPose('cheer')
        await this.bucket.finale(this.pairs)
        if (gen !== this.gen) return
        void this.endLevel()
    }

    private async missed(gen: number, fish: FishView, clue: ClueDef) {
        fish.setPose('yuck')
        this.boat.setPose('oops')
        this.audio.fail()
        void this.sail.light(pairIndex(this.level.code, clue.clue), 2)
        await this.board.compare(fish.mark, false, this.drum)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.school.setMoving(false)
        this.board.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        this.audio.win()
        void FX.confetti(this, { colors: [HUE.red, HUE.blue, HUE.yellow, C.mint] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.mint,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: 'Pescaria completa!',
            message: 'Dá para dizer a mesma coisa com sons e cores!',
            stars: 3,
            progress: { total: this.level.clues, current: this.level.clues },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.mint,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private async explain() {
        if (this.mode !== 'fish' || this.guiding) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.school.setMoving(false)
        this.hud.setHelpEnabled(false)

        await this.guide.replay(this.drum)
        this.guiding = false
        if (gen !== this.gen) return
        this.fish()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.cluesDone / this.level.clues) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
