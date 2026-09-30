import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import { createVisualGuide, type VisualGuide } from '../../../../shared/guide/createVisualGuide'

import { GUIDE_KEY, LEVELS, POINTS, TRAINING, deal, helps, rightSide } from '../data/levels'
import { HAND, PIECE_CELL, PIECES } from '../data/files'
import { BOTH_ROOMS, DEVICE } from '../data/layout'
import { A, C, CSS, PARTY } from '../data/theme'
import type { DeviceId, LevelDef, Mode, RoundDef, Side } from '../types'

import { createAudio, type Audio } from './audio'
import { ensureArt, isFallback } from './fallback'
import { createHouse, type House } from './house'
import { createHud, type Hud } from './hud'
import { createLine, type Line } from './line'
import { createMachine, type Machine } from './machine'
import { createPresent, type Present } from './present'
import { createYard, type Yard } from './yard'

const GAME_ID = 'maquina-dos-ajudantes'
const FUNNY_MS = 1500
const AFTER_HELP_MS = 700
const FINALE_MS = 900

const LEVEL_MESSAGE: Record<number, string> = {
    1: 'Cada aparelho ajuda de um jeito!',
    2: 'Um aparelho pode ajudar muita gente de uma vez!',
    3: 'Um aparelho pode fazer mais de uma coisa!',
}

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private rounds: RoundDef[] = []
    private roundIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private coaching = false

    private score = 0
    private hits = 0
    private errors = 0
    private roundsDone = 0

    private audio!: Audio
    private yard!: Yard
    private line!: Line
    private machine!: Machine
    private house!: House
    private present!: Present
    private hud!: Hud
    private guide!: VisualGuide

    private unsubPlatform?: () => void

    private get round(): RoundDef {
        return this.rounds[this.roundIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 1)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.rounds = []
        this.roundIndex = 0
        this.mode = 'intro'
        this.coaching = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.roundsDone = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)

        this.audio = createAudio()
        this.yard = createYard(this)
        this.line = createLine(this)
        this.machine = createMachine(this, this.audio)
        this.house = createHouse(this)
        this.present = createPresent(this, this.audio)
        this.hud = createHud(this, {
            phases: this.level.rounds.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createVisualGuide(this, {
            depth: 8500,
            veilColor: C.shadow,
            veilAlpha: A.veil,
            rimColor: C.glow,
            captionColor: CSS.ink,
            ...(isFallback(this, PIECES)
                ? {}
                : { handTexture: { key: PIECES, frame: PIECE_CELL.guideHand, tipX: HAND.tipX, tipY: HAND.tipY, height: 120 } }),
        })
        this.rounds = deal(this.level)

        this.present.onTap(() => this.tapPresent())
        this.house.onTap(side => this.pickRoom(side))
        this.input.keyboard?.on('keydown', this.onKeyDown, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.registry.get(GUIDE_KEY)) void this.startRound(0)
        else {
            this.registry.set(GUIDE_KEY, true)
            void this.runGuide()
        }
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.guide?.destroy()
        this.hud?.destroy()
        this.present?.destroy()
        this.house?.destroy()
        this.machine?.destroy()
        this.line?.destroy()
        this.yard?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private onKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') this.tapPresent()
        else if (event.code === 'Digit1' || event.code === 'Numpad1') this.pickRoom(0)
        else if (event.code === 'Digit2' || event.code === 'Numpad2') this.pickRoom(1)
    }

    private until(check: () => boolean): Promise<void> {
        return new Promise(resolve => {
            const tick = () => {
                if (!check()) return
                this.events.off(Phaser.Scenes.Events.UPDATE, tick)
                resolve()
            }
            this.events.on(Phaser.Scenes.Events.UPDATE, tick)
            tick()
        })
    }

    private async deliver(rooms: RoundDef['rooms']) {
        const delivery = (async () => {
            await this.machine.insertCoin()
            await this.machine.openHatch()
            await this.present.deliver(this.machine.hatch)
            await this.machine.closeHatch()
        })()
        await Promise.all([this.house.show(rooms), delivery])
    }

    private async startRound(index: number) {
        const gen = ++this.gen
        this.roundIndex = index
        this.mode = 'deliver'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)

        await this.deliver(this.round.rooms)
        if (gen !== this.gen) return
        this.mode = 'closed'
        this.hud.setHelpEnabled(!this.coaching)
        if (this.coaching) void this.coach(gen)
    }

    private async coach(gen: number) {
        try {
            await this.guide.waitFor({ target: this.present.rect, gesture: { kind: 'tap' }, until: () => this.mode !== 'closed' })
            if (gen !== this.gen) return
            await this.guide.hide()
            await this.until(() => gen !== this.gen || this.mode !== 'reveal')
            if (gen !== this.gen || this.mode !== 'open') return
            await this.guide.waitFor({ target: BOTH_ROOMS, gesture: { kind: 'none' }, until: () => this.mode !== 'open' })
        } finally {
            await this.guide.hide()
            this.coaching = false
        }
    }

    private tapPresent() {
        if (this.mode === 'closed') void this.openPresent(this.round.device)
        else if (this.mode === 'open' && this.present.device && !this.present.device.performing) {
            this.audio.tap()
            void this.present.perform()
        }
    }

    private async openPresent(device: DeviceId) {
        const gen = this.gen
        this.mode = 'reveal'
        this.hud.setHelpEnabled(false)
        await this.present.open(device)
        if (gen !== this.gen) return
        await this.present.perform()
        if (gen !== this.gen) return
        this.mode = 'open'
        this.house.pulse(true)
        this.hud.setHelpEnabled(!this.coaching)
    }

    private pickRoom(side: Side) {
        if (this.mode === 'open') {
            void this.decide(side)
            return
        }
        if (this.mode === 'closed' || this.mode === 'reveal') {
            this.audio.nod()
            this.house.nod(side)
        }
    }

    private async bring(gen: number, side: Side): Promise<boolean> {
        this.house.pulse(false)
        await this.present.flyTo(this.house.landing(side), DEVICE.roomScale)
        if (gen !== this.gen) return false
        void this.present.perform()
        await FX.wait(this, 700)
        return gen === this.gen
    }

    private async decide(side: Side) {
        const gen = this.gen
        this.mode = 'fly'
        this.hud.setHelpEnabled(false)
        const round = this.round
        const right = helps(round.device, round.rooms[side])

        if (!(await this.bring(gen, side))) return
        if (right) await this.helped(gen, side, round)
        else await this.missed(gen, side, round)
    }

    private async helped(gen: number, side: Side, round: RoundDef) {
        this.score += POINTS
        this.hits += 1
        this.roundsDone += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()

        this.audio.plim()
        this.audio.bell()
        await this.house.helped(side)
        if (gen !== this.gen) return
        await FX.wait(this, AFTER_HELP_MS)
        if (gen !== this.gen) return

        const from = this.house.head(side)
        void this.present.vanish()
        await this.line.hang(this.roundIndex, round.rooms[side], round.device, from)
        if (gen !== this.gen) return
        void this.hud.celebrate(this.roundIndex)

        await Promise.all([this.house.clear(), this.present.clear()])
        if (gen !== this.gen) return

        const next = this.roundIndex + 1
        if (next < this.rounds.length) {
            void this.startRound(next)
            return
        }
        await this.finale(gen)
    }

    private async missed(gen: number, side: Side, round: RoundDef) {
        const person = round.rooms[side]
        if (person === 'baby') this.audio.cry()
        if (person === 'sleeper') this.audio.snore()
        await this.house.funny(side)
        this.audio.fomfom()
        await FX.wait(this, FUNNY_MS)
        if (gen !== this.gen) return
        await this.present.flyBack()
        if (gen !== this.gen) return
        this.house.hint(rightSide(round))
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async finale(gen: number) {
        this.mode = 'done'
        const swing: Record<DeviceId, () => void> = {
            clock: () => this.audio.ring(),
            lullaby: () => this.audio.lullaby(),
            dance: () => this.audio.dance(),
            phone: () => this.audio.phoneRing(),
            tablet: () => this.audio.boing(),
            'tablet-call': () => this.audio.phoneRing(),
        }
        await this.line.finale(device => swing[device]())
        if (gen !== this.gen) return
        void this.endLevel()
    }

    private async runGuide() {
        const gen = ++this.gen
        this.mode = 'guide'
        this.hud.setHelpEnabled(false)
        await this.playTraining(gen)
        if (gen !== this.gen) return
        this.coaching = true
        void this.startRound(0)
    }

    private async playTraining(gen: number) {
        const side = rightSide(TRAINING)
        try {
            await this.deliver(TRAINING.rooms)
            if (gen !== this.gen) return
            const opened = await this.guide.demo({
                target: this.present.rect,
                gesture: { kind: 'tap' },
                action: async () => {
                    await this.present.open(TRAINING.device)
                    await this.present.perform()
                },
            })
            if (!opened || gen !== this.gen) return
            this.house.pulse(true)
            await this.guide.demo({
                target: this.house.rect(side),
                gesture: { kind: 'tap' },
                action: async () => {
                    if (!(await this.bring(gen, side))) return
                    this.audio.plim()
                    await this.house.helped(side)
                    await FX.wait(this, 900)
                },
            })
        } finally {
            await this.guide.hide()
        }
        if (gen !== this.gen) return
        this.house.pulse(false)
        await Promise.all([this.house.clear(), this.present.clear()])
    }

    private async explain() {
        if (this.mode !== 'closed' && this.mode !== 'open') return
        const wasOpen = this.mode === 'open'
        const gen = ++this.gen
        this.mode = 'panel'
        this.hud.setHelpEnabled(false)
        this.present.stop()
        this.house.pulse(false)
        await Promise.all([this.house.clear(), this.present.clear()])
        if (gen !== this.gen) return

        await this.playTraining(gen)
        if (gen !== this.gen) return

        const round = this.round
        await this.house.show(round.rooms)
        if (gen !== this.gen) return
        if (wasOpen) {
            this.present.placeOpen(round.device)
            this.mode = 'open'
            this.house.pulse(true)
        } else {
            this.present.placeClosed()
            this.mode = 'closed'
        }
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
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
        void FX.confetti(this, { colors: [...PARTY, C.gold] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.mint,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: 'Todos ajudados!',
            message: LEVEL_MESSAGE[this.level.level] ?? LEVEL_MESSAGE[1],
            stars: 3,
            progress: { total: this.level.rounds.length, current: this.level.rounds.length },
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

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.roundsDone / this.level.rounds.length) * 100),
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
