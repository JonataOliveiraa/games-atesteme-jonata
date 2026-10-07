import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { has } from '../data/cast'
import { LEVELS, POINTS, guideKey, ownerOf } from '../data/levels'
import { NINA } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, LEVEL_INTRO, SAY, TEACH } from '../data/words'
import type { LevelDef, Mode, PhaseDef, Solved, TraitId } from '../types'

import { createAudio, type Audio } from './audio'
import { createBather, type BatherView } from './bather'
import { bayAt, bayPos, bayRect, createBeach, rectOf, type Beach } from './beach'
import { createBoard, type Board } from './board'
import { createOwnerCard, type OwnerCard } from './card'
import { createDog, type Dog } from './dog'
import { createFinale, type Finale } from './finale'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createLifeguard, type Lifeguard } from './lifeguard'

const GAME_ID = 'praia-dos-dados'
const NEXT_DATUM_MS = 600
const SHOW_ERROR_MS = 900
const FINALE_MS = 2400
const RADIO_FROM = { x: NINA.x + 48, y: NINA.feet - 150 }
const LOW_BALLOON = { balloonY: 560 }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private dataIndex = -1
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private debut = false
    private onDatumDone?: () => Promise<void>

    private bathers: BatherView[] = []
    private left = new Set<number>()
    private pending = new Set<number>()
    private removedNow = 0
    private useless: TraitId[] = []
    private solved: Solved[] = []

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private beach!: Beach
    private board!: Board
    private nina!: Lifeguard
    private dog!: Dog
    private card!: OwnerCard
    private finale!: Finale
    private hud!: Hud

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get trait(): TraitId {
        return this.phase.data[this.dataIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.dataIndex = -1
        this.mode = 'intro'
        this.guiding = false
        this.debut = false
        this.onDatumDone = undefined
        this.bathers = []
        this.left = new Set()
        this.pending = new Set()
        this.solved = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.beach = createBeach(this)
        this.nina = createLifeguard(this)
        this.dog = createDog(this)
        this.board = createBoard(this)
        this.card = createOwnerCard(this, i => this.audio.fly(i))
        this.finale = createFinale(this)
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

        this.bindInput()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        const introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startPhase(0, introduce)
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.bathers.forEach(b => b.destroy())
        this.hud?.destroy()
        this.finale?.destroy()
        this.card?.destroy()
        this.board?.destroy()
        this.dog?.destroy()
        this.nina?.destroy()
        this.beach?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private bindInput() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
            if (over.length) return
            if (this.nina.radioContains(pointer.x, pointer.y)) {
                this.pressRadio()
                return
            }
            const bay = bayAt(pointer.x, pointer.y)
            if (bay >= 0) this.tapBay(bay)
        })
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
    }

    private onKeyDown(event: KeyboardEvent) {
        const digit = Number(event.key)
        if (digit >= 1 && digit <= 6) {
            this.tapBay(digit - 1)
            return
        }
        if (event.code !== 'Space' && event.code !== 'Enter' && event.code !== 'NumpadEnter') return
        event.preventDefault()
        if (this.mode === 'radio') this.nina.advance()
        else if (this.mode === 'reunion') this.card.press()
        else this.pressRadio()
    }

    // ───────────────────────────────────────────── fase

    private async startPhase(index: number, introduce: boolean) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.dataIndex = -1
        this.mode = 'intro'
        this.useless = []
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.nina.pose('talk')
        this.bathers.forEach(b => b.destroy())

        const phase = this.phase
        this.bathers = phase.bays.map((id, bay) => createBather(this, id, bay))
        this.left = new Set(phase.bays.map((_, bay) => bay))
        this.pending = new Set()
        this.emitCheckpoint()

        await Promise.all([
            this.board.reset(phase.dog),
            this.dog.show(phase.dog),
            ...this.bathers.map((b, i) => b.enter(i * 90)),
            this.nina.showRadio(this.level.manualRadio),
        ])
        if (gen !== this.gen) return

        if (introduce && this.level.level === 1) {
            await this.guideFirst(gen)
            return
        }
        if (introduce && this.level.manualRadio) {
            this.debut = true
            await this.lesson(gen, [{ text: TEACH.radio, ...spot(this.nina.radioRect()), buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return
        }

        this.mode = 'radio'
        await this.nina.say(SAY.found(phase.dog), 'Vamos lá!')
        if (gen !== this.gen) return

        const intro = LEVEL_INTRO[this.level.level]
        if (introduce && intro) {
            await this.lesson(gen, [{ text: intro, ...spot(this.board.rect()), ...LOW_BALLOON }])
            if (gen !== this.gen) return
        }
        await this.nextDatum(gen)
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        this.guiding = false
        if (gen === this.gen) this.mode = before
    }

    private async nextDatum(gen: number, speak = true) {
        this.dataIndex += 1
        this.removedNow = 0
        if (this.left.size === 1 || this.dataIndex >= this.phase.data.length) {
            await this.reunion(gen)
            return
        }
        const trait = this.trait
        this.mode = 'radio'
        this.hud.setHelpEnabled(false)
        this.nina.pose('talk')
        this.audio.radio()
        const flying = this.board.add(trait, RADIO_FROM.x, RADIO_FROM.y)
        if (speak) await this.nina.say(SAY.datum(trait))
        await flying
        if (gen !== this.gen) return

        this.pending = new Set([...this.left].filter(bay => !has(this.phase.bays[bay], trait)))

        if (this.debut && this.pending.size === 0) {
            this.debut = false
            const remaining = rectOf([...this.left])
            await this.lesson(gen, [
                {
                    text: TEACH.useless(trait, this.left.size),
                    ...spot(union(remaining, this.board.chipRect(this.dataIndex))),
                    ...LOW_BALLOON,
                    buttonLabel: 'Ok',
                },
            ])
            if (gen !== this.gen) return
        }
        this.mode = 'play'
        this.hud.setHelpEnabled(true)
    }

    private tapBay(bay: number) {
        if (this.mode !== 'play' || !this.left.has(bay)) return
        if (!this.pending.has(bay)) {
            void this.jam(bay, 'kept')
            return
        }
        this.removeBather(bay)
        if (this.pending.size === 0) void this.datumCleared(this.gen)
    }

    private removeBather(bay: number) {
        this.left.delete(bay)
        this.pending.delete(bay)
        this.removedNow += 1
        this.audio.hop()
        void this.bathers[bay].leave(SAY.leave, (x, y) => {
            this.beach.splash(x, y)
            this.audio.splash()
        })
    }

    private async datumCleared(gen: number) {
        if (this.left.size === 1) {
            this.mode = 'reunion'
            this.board.chip(this.dataIndex)?.solved()
            this.audio.solved()
            await FX.wait(this, NEXT_DATUM_MS)
            if (gen === this.gen) await this.reunion(gen)
            return
        }
        if (this.level.manualRadio) {
            if (this.debut && this.dataIndex === 0) {
                await this.lesson(gen, [{ text: TEACH.radioGo, ...spot(this.nina.radioRect()), buttonLabel: 'Ok' }])
                if (gen === this.gen) this.hud.setHelpEnabled(true)
            }
            return
        }
        this.mode = 'radio'
        this.hud.setHelpEnabled(false)
        this.board.chip(this.dataIndex)?.solved()
        this.audio.solved()
        const hook = this.onDatumDone
        this.onDatumDone = undefined
        await FX.wait(this, NEXT_DATUM_MS)
        if (gen !== this.gen) return
        if (hook) {
            await hook()
            if (gen !== this.gen) return
        }
        await this.nextDatum(gen)
    }

    private pressRadio() {
        if (this.mode !== 'play' || !this.level.manualRadio) return
        this.nina.pressRadio()
        this.audio.click()
        const missed = [...this.pending]
        if (missed.length) {
            void this.jam(missed[0], 'missed')
            return
        }
        void this.radioNext(this.gen)
    }

    private async radioNext(gen: number) {
        this.mode = 'radio'
        this.hud.setHelpEnabled(false)
        const chip = this.board.chip(this.dataIndex)
        if (this.removedNow === 0) {
            this.useless.push(this.trait)
            chip?.useless()
            await this.nina.say(SAY.nobody(this.trait))
            if (gen !== this.gen) return
        } else {
            chip?.solved()
            this.audio.solved()
        }
        await this.nextDatum(gen)
    }

    private async reunion(gen: number) {
        this.mode = 'reunion'
        this.hud.setHelpEnabled(false)
        const phase = this.phase
        const ownerBay = [...this.left][0]
        const owner = phase.bays[ownerBay]
        const { x, feet } = bayPos(ownerBay)

        this.nina.pose('cheer')
        this.audio.bark()
        await this.dog.runTo(x - 82, feet + 4)
        if (gen !== this.gen) return
        this.beach.hearts(x - 30, feet - 150)
        this.audio.bark()
        await this.dog.jump()
        if (gen !== this.gen) return

        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.solved.push({ dog: phase.dog, owner, data: phase.data.slice(), useless: this.useless.slice() })
        void this.hud.celebrate(this.phaseIndex)

        await this.card.show(phase.dog, owner, this.board.take())
        if (gen !== this.gen) return
        await Promise.all([this.card.hide(), this.dog.hide(), ...this.bathers.map(b => b.exit())])
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 < this.level.phases.length) {
            void this.startPhase(this.phaseIndex + 1, false)
            return
        }
        this.phaseIndex += 1
        this.emitCheckpoint()
        void this.endLevel()
    }

    // ───────────────────────────────────────────── erro

    private async jam(bay: number, kind: 'kept' | 'missed') {
        const gen = ++this.gen
        this.mode = 'jam'
        this.hud.setHelpEnabled(false)
        const trait = this.trait
        const id = this.phase.bays[bay]
        const text =
            kind === 'missed'
                ? SAY.missed(trait)
                : id === ownerOf(this.phase)
                  ? SAY.keptOwner(trait, this.phase.dog)
                  : SAY.kept(trait)

        this.dog.cry()
        this.nina.pose('worry')
        this.audio.whine()
        await Promise.all([this.bathers[bay].protest(text), this.board.chip(this.dataIndex)?.shake()])
        if (gen !== this.gen) return
        this.audio.fail()
        await FX.wait(this, SHOW_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── tutorial

    private async guideFirst(gen: number) {
        const phase = this.phase
        await this.lesson(gen, [
            { text: TEACH.lost(phase.dog), ...spot(union(this.nina.rect(), this.dog.rect())), buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return

        this.dataIndex = 0
        this.removedNow = 0
        const trait = this.trait
        this.audio.radio()
        await this.board.add(trait, RADIO_FROM.x, RADIO_FROM.y)
        if (gen !== this.gen) return
        this.pending = new Set([...this.left].filter(bay => !has(phase.bays[bay], trait)))
        await this.lesson(gen, [
            { text: TEACH.datum(trait), ...spot(this.board.chipRect(0)), ...LOW_BALLOON, buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return

        const demo = [...this.pending][0]
        await this.lesson(gen, [{ text: TEACH.who(trait), ...spot(bayRect(demo)), ...LOW_BALLOON, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.removeBather(demo)
        await FX.wait(this, 1300)
        if (gen !== this.gen) return

        await this.lesson(gen, [{ text: TEACH.rest(trait), ...spot(rectOf([0, 1, 2, 3, 4, 5])), balloonY: 118, buttonLabel: 'Vamos lá!' }])
        if (gen !== this.gen) return
        this.onDatumDone = async () => {
            await this.lesson(gen, [
                { text: TEACH.notEnough(this.left.size), ...spot(rectOf([...this.left])), balloonY: 118, buttonLabel: 'Próximo' },
            ])
        }
        this.mode = 'play'
        this.hud.setHelpEnabled(true)
    }

    private async explain() {
        if (this.mode !== 'play' || this.guiding) return
        const gen = this.gen
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.board, ...spot(this.board.rect()), ...LOW_BALLOON, buttonLabel: 'Próximo' },
            { text: HELP.grid, ...spot(rectOf([0, 1, 2, 3, 4, 5])), balloonY: 118 },
        ]
        if (this.level.manualRadio) steps.push({ text: HELP.radio, ...spot(this.nina.radioRect()) })
        steps[steps.length - 1].buttonLabel = 'Continuar'
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'play'
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'finale'
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })

        await this.finale.show(this.solved, i => this.audio.pop(i))
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.cap, C.bucket, C.ring, C.fins, C.heart] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        this.mode = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: last ? 'Todos os cachorros em casa!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(!last
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
                              color: C.accent,
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
            progress: Math.min(100, Math.round((this.phaseIndex / this.level.phases.length) * 100)),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') this.score = command.points ?? this.score
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
