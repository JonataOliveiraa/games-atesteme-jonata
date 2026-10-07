import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BG, formatOf } from '../data/files'
import { buildWorld, clampPull, demoPull, fly, type Flight, type World } from '../data/flight'
import { LEVELS, POINTS_SCORE, guideKey } from '../data/levels'
import { BOX, DEPTH, FLIGHT, H, W, ZONE } from '../data/layout'
import { C, CSS } from '../data/theme'
import { DISGUISED, GUIDE_WRONG, SAY, TEACH, WRONG } from '../data/words'
import type { FileDef, Format, LevelDef, Mode, Payload, PhaseDef, Rect, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { ensureArt } from './fallback'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createBox, type Box } from './props'
import { createScenery, registerPieceFrames, type Scenery } from './scenery'
import { createRobots, type Robots } from './robots'
import { createSling, type Sling } from './sling'
import { createBalloon, createFinale, type Balloon, type Finale } from './ui'

const GAME_ID = 'robos-famintos'
const SHOW_ERROR_MS = 700
const NEXT_MS = 450
const PHASE_PAUSE_MS = 900
const FINALE_MS = 2200

type Shot = 'right' | 'wrong' | 'miss'

const SIDE = { balloonX: 300, balloonY: 280 }

const grow = (r: Rect, by: number): Rect => ({ x: r.x, y: r.y, w: r.w + by * 2, h: r.h + by * 2 })

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private teaching = false
    private guiding = false
    private onRight?: () => void
    private warnDisguise = false

    private queue: FileDef[] = []
    private current?: FileDef
    private world!: World
    private pressAt: Vec = { x: 0, y: 0 }
    private flight?: Flight
    private eaten: Partial<Record<Format, Payload[]>> = {}

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private audio!: Audio
    private robots!: Robots
    private sling!: Sling
    private box!: Box
    private scenery!: Scenery
    private balloon!: Balloon
    private finale!: Finale
    private hud!: Hud

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.phaseIndex = 0
        this.mode = 'intro'
        this.teaching = false
        this.guiding = false
        this.onRight = undefined
        this.warnDisguise = false
        this.queue = []
        this.current = undefined
        this.flight = undefined
        this.eaten = {}
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)
        this.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)

        this.audio = createAudio()
        registerPieceFrames(this)
        this.scenery = createScenery(this)
        this.robots = createRobots(this)
        this.box = createBox(this)
        this.sling = createSling(this)
        this.balloon = createBalloon(this)
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

        this.input.on('pointerdown', this.onDown, this)
        this.input.on('pointermove', this.onMove, this)
        this.input.on('pointerup', this.onUp, this)
        this.input.on('pointerupoutside', this.onUp, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.teaching = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.onRight = undefined
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointermove', this.onMove, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.hud?.destroy()
        this.finale?.destroy()
        this.balloon?.destroy()
        this.sling?.destroy()
        this.box?.destroy()
        this.robots?.destroy()
        this.scenery?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.queue = [...this.phase.files]
        this.world = buildWorld(this.phase)
        this.scenery.load(this.phase)
        this.robots.load(this.phase.robots)
        this.box.fill(this.queue.length)
        await this.robots.enter()
        if (gen !== this.gen) return
        if (this.teaching && this.level.level < 3) {
            await this.teachFirst(gen)
            return
        }
        if (this.teaching) {
            this.teaching = false
            this.warnDisguise = true
        }
        await this.next(gen)
    }

    private async next(gen: number) {
        const file = this.queue.shift()
        if (!file) {
            await this.phaseDone(gen)
            return
        }
        this.current = file
        this.audio.pop()
        const from = await this.box.pop()
        await this.sling.load(file, from)
        if (gen !== this.gen) return
        if (this.warnDisguise && file.disguise) {
            this.warnDisguise = false
            this.mode = 'busy'
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.disguise, ...spot(this.sling.cartRect()), buttonLabel: 'Próximo' },
                { text: TEACH.look, ...spot(this.sling.cartRect()), buttonLabel: 'Ok' },
            ])
            if (gen !== this.gen) return
        }
        this.aimReady()
    }

    private async reload(gen: number) {
        const file = this.current
        if (!file) return
        await this.scenery.restore()
        if (gen !== this.gen) return
        this.audio.pop()
        await this.sling.load(file, { x: BOX.x, y: 560 })
        if (gen !== this.gen) return
        this.aimReady()
    }

    private aimReady() {
        this.mode = 'aim'
        if (!this.guiding && !this.teaching) this.hud.setHelpEnabled(true)
    }

    private onDown(p: Phaser.Input.Pointer) {
        if (this.mode !== 'aim') return
        if (p.x > ZONE.maxX || p.y < ZONE.minY) return
        this.mode = 'pull'
        this.pressAt = { x: p.x, y: p.y }
        this.sling.clearTrail()
        this.hud.setHelpEnabled(false)
        this.aimAt({ x: 0, y: 0 })
    }

    private onMove(p: Phaser.Input.Pointer) {
        if (this.mode !== 'pull') return
        this.aimAt({ x: p.x - this.pressAt.x, y: p.y - this.pressAt.y })
    }

    private onUp() {
        if (this.mode !== 'pull') return
        const flight = this.flight
        if (!flight) {
            this.sling.rest()
            this.robots.aim(undefined)
            this.aimReady()
            return
        }
        void this.shoot(flight)
    }

    private aimAt(raw: Vec) {
        const d = clampPull(raw)
        const len = Math.hypot(d.x, d.y)
        if (len < FLIGHT.minPull) {
            this.flight = undefined
            this.sling.pull(d, { points: [], hit: { kind: 'out', at: { x: 0, y: 0 } } })
            this.robots.aim(undefined)
            return
        }
        const flight = fly(d, this.world)
        this.flight = flight
        this.sling.pull(d, flight)
        this.robots.aim(flight.hit.kind === 'robot' ? flight.hit.format : undefined)
        this.audio.stretch(len / FLIGHT.maxPull)
    }

    private async shoot(flight: Flight) {
        const gen = this.gen
        const shot = await this.resolve(flight)
        if (gen !== this.gen) return
        if (shot === 'wrong') {
            await this.fail(gen)
            return
        }
        if (shot === 'miss') {
            await this.reload(gen)
            return
        }
        if (this.onRight) {
            const done = this.onRight
            this.onRight = undefined
            done()
            return
        }
        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        await this.next(gen)
    }

    private async resolve(flight: Flight): Promise<Shot> {
        const gen = this.gen
        const file = this.current
        this.mode = 'fly'
        this.flight = undefined
        this.hud.setHelpEnabled(false)
        this.balloon.hide()
        this.audio.launch()
        await this.sling.release(flight)
        if (gen !== this.gen || !file) return 'miss'
        const hit = flight.hit

        if (hit.kind !== 'robot') {
            this.robots.aim(undefined)
            if (hit.kind === 'piece') {
                this.audio.knock()
                void this.scenery.knock(hit.index, 70)
            } else {
                this.audio.thud()
            }
            await this.sling.fall(hit.at)
            return 'miss'
        }

        const real = formatOf(file.payload)
        const mouth = this.robots.mouth(hit.format)
        if (real === hit.format) {
            await this.sling.swallow(mouth)
            this.audio.nhac()
            this.audio.play(real, 'samples' in file.payload ? file.payload.samples : undefined)
            ;(this.eaten[real] ??= []).push(file.payload)
            await this.robots.eat(hit.format, file.payload, true)
            return 'right'
        }

        if (this.guiding) {
            await this.robots.refuse(hit.format)
            const r = this.robots.rect(hit.format)
            void this.balloon.say({ x: r.x, y: r.y - r.h / 2 - 50 }, GUIDE_WRONG)
            await this.sling.fall(hit.at)
            return 'miss'
        }

        this.mode = 'busy'
        await this.sling.swallow(mouth, true)
        this.audio.nhac()
        await this.robots.eat(hit.format, file.payload, false)
        this.audio.yuck()
        void this.sling.spit(mouth)
        const r = this.robots.rect(hit.format)
        await this.balloon.say({ x: r.x, y: r.y - r.h / 2 - 50 }, file.disguise ? DISGUISED[real] : WRONG[real], 'oops')
        return 'wrong'
    }

    private async phaseDone(gen: number) {
        this.mode = 'busy'
        this.hud.setHelpEnabled(false)
        this.audio.win()
        const all = this.robots.allRect()
        void this.balloon.say({ x: all.x, y: all.y - all.h / 2 - 40 }, SAY.yum)
        await this.robots.cheer()
        if (gen !== this.gen) return

        this.score += POINTS_SCORE
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS_SCORE, stage: this.level.level })
        this.emitCheckpoint()
        await this.hud.celebrate(this.phaseIndex)
        await FX.wait(this, PHASE_PAUSE_MS)
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }
        await FX.curtain(
            this,
            () => {
                this.balloon.hide()
                this.sling.clearTrail()
                this.phaseIndex = next
                this.robots.load({})
                this.scenery.load(this.level.phases[next])
            },
            C.white,
        )
        void this.startPhase(next)
    }

    private async fail(gen: number) {
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

    private async teachFirst(gen: number) {
        const key = guideKey(this.level.level)
        const first = this.level.level === 1
        const lines: Record<Format, string> = { music: TEACH.music, photo: TEACH.photo, text: TEACH.text, video: TEACH.video }
        this.guiding = true
        if (first) {
            await teach(this, key, [{ text: TEACH.hungry, ...spot(grow(this.robots.allRect(), 10)), ...SIDE, buttonLabel: 'Próximo' }])
        } else {
            const fresh = this.phase.files.slice(0, 2).map(f => {
                const r = this.robots.rect(formatOf(f.payload))
                return { ...r, y: r.y + 30, h: r.h + 60 }
            })
            await teach(this, key, [{ text: TEACH.newRobots, ...spot(grow(union(fresh[0], fresh[1]), 14)), buttonLabel: 'Próximo' }])
        }
        if (gen !== this.gen) return

        await this.next(gen)
        if (gen !== this.gen || !this.current) return
        this.mode = 'busy'
        await teach(this, key, [{ text: lines[formatOf(this.current.payload)], ...spot(this.sling.cartRect()), buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        await this.demo(gen, formatOf(this.current.payload))
        if (gen !== this.gen) return

        await FX.wait(this, NEXT_MS)
        if (gen !== this.gen) return
        await this.next(gen)
        if (gen !== this.gen || !this.current) return
        this.mode = 'busy'
        const target = formatOf(this.current.payload)
        await teach(this, key, [
            { text: lines[target], ...spot(this.sling.cartRect()), buttonLabel: 'Ok' },
            ...(first ? [{ text: TEACH.pull, ...spot(union(this.sling.pullRect(), grow(this.robots.rect(target), 12))), buttonLabel: 'Ok' }] : []),
        ])
        if (gen !== this.gen) return

        await new Promise<void>(resolve => {
            this.onRight = resolve
            this.aimReady()
        })
        if (gen !== this.gen) return
        this.guiding = false
        await teach(this, key, [{ text: TEACH.go, ...spot(grow(this.robots.allRect(), 10)), ...SIDE, buttonLabel: 'Vamos começar!' }])
        if (gen !== this.gen) return
        this.teaching = false
        await this.next(gen)
    }

    private async demo(gen: number, format: Format) {
        const pull = demoPull(this.world, format)
        if (!pull) return
        this.mode = 'busy'
        const t = { k: 0 }
        await new Promise<void>(resolve =>
            this.tweens.add({
                targets: t,
                k: 1,
                duration: 900,
                ease: 'Sine.easeInOut',
                onUpdate: () => this.aimAt({ x: pull.x * t.k, y: pull.y * t.k }),
                onComplete: () => resolve(),
            }),
        )
        if (gen !== this.gen) return
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        const flight = this.flight ?? fly(pull, this.world)
        await this.resolve(flight)
    }

    private async explain() {
        if (this.mode !== 'aim' || this.guiding || this.teaching) return
        const gen = this.gen
        this.mode = 'panel'
        this.hud.setHelpEnabled(false)
        const robots = grow(this.robots.allRect(), 10)
        const level = this.level.level
        const rules = [TEACH.helpN1, ...(level >= 2 ? [TEACH.helpN2] : []), ...(level >= 3 ? [TEACH.helpN3] : [])]
        await teach(this, `${guideKey(level)}-help`, [
            { text: TEACH.helpPull, ...spot(union(this.sling.pullRect(), robots)) },
            { text: TEACH.helpLook, ...spot(this.sling.cartRect()) },
            ...rules.map((text, i) => ({ text, ...spot(robots), ...(i === rules.length - 1 ? { buttonLabel: 'Continuar' } : {}) })),
        ])
        if (gen !== this.gen) return
        this.aimReady()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.balloon.hide()
        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        await this.finale.show(this.eaten, this.level.robots)
        if (gen !== this.gen) return
        void this.balloon.say({ x: 640, y: 120 }, SAY.summary)
        void FX.confetti(this, { colors: [C.blue, C.yellow, C.orange, C.purple] })
        await FX.wait(this, FINALE_MS)
        if (gen !== this.gen) return

        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.blue,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.blueDark,
            messageColor: CSS.inkSoft,
            title: last ? 'Robôs de barriga cheia!' : `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
            ...(last
                ? {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.blue,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }
                : {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
                      },
                  }),
        })
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.cleared / this.level.phases.length) * 100),
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
