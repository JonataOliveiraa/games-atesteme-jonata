import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX, Ease } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { LEVELS, POINTS, TOOLS, TOOL_FOR, guideKey, placeKey, totalThings } from '../data/levels'
import { PILOT, PILOT_CELL, PILOT_FRAME } from '../data/files'
import {
    DEMO_Y,
    DEPTH,
    H,
    JOYSTICK,
    JOYSTICK_RECT,
    PARADE_X,
    PILOT_VIEW,
    REACH,
    SHIP_VIEW,
    THING_VIEW,
    TOOLS_RECT,
    TOOL_BUTTONS,
    W,
    pilotRect,
    reachRect,
    slotX,
    thingRect,
    toolRect,
} from '../data/layout'
import { C, CONFETTI, CSS } from '../data/theme'
import { END, END_BY_LEVEL, PAIRS, PLACE_HELLO, TEACH, TOOLS_HELP } from '../data/words'
import type { Kind, LevelDef, Mode, Place, ThingDef, Tool } from '../types'

import { createAudio, type Audio } from './audio'
import { createControls, type Controls } from './controls'
import { ensureArt } from './fallback'
import { spot, tap, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createShip, type Ship } from './ship'
import { createThings, type ThingView, type Things } from './things'
import { createWorld, type World } from './world'

const GAME_ID = 'nave-multiuso'
const WAVE_PAUSE_MS = 900
const MISS_POINTS = 5
const WHEEL_MS = 180
const LOW_BALLOON_Y = 380
const HIGH_BALLOON_Y = 150
const SPEAKER = { scale: 0.55, left: 160, right: 1120, depth: 9005 } as const
const PAIRS_ORDER: [Kind, Tool][] = [
    ['leaves', 'blower'],
    ['fire', 'water'],
    ['sheep', 'pull'],
]

type Side = 'left' | 'right'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private waveIndex = 0
    private pending: ThingDef[] = []
    private distSince = 0
    private streak = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private solvedWaiter?: () => void
    private perched: Side | null = null
    private speedMul = 1
    private lastWheel = 0

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private world!: World
    private things!: Things
    private ship!: Ship
    private controls!: Controls
    private hud!: Hud
    private pilot!: Phaser.GameObjects.Sprite

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 1)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.waveIndex = 0
        this.pending = []
        this.distSince = 0
        this.streak = 0
        this.mode = 'intro'
        this.guiding = false
        this.solvedWaiter = undefined
        this.perched = null
        this.speedMul = 1
        this.lastWheel = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        ensureArt(this)

        const first = this.level.waves[0].place
        this.audio = createAudio()
        this.world = createWorld(this, first)
        this.things = createThings(this)
        this.things.setPlace(first)
        this.ship = createShip(this)
        this.controls = createControls(this)
        this.hud = createHud(this, {
            phases: this.level.waves.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.pilot = this.add
            .sprite(PILOT_VIEW.x, PILOT_VIEW.y, PILOT, PILOT_FRAME.talk)
            .setScale(PILOT_VIEW.scale)
            .setDepth(DEPTH.pilot)
            .setVisible(false)

        this.controls.onTool(tool => this.equip(tool))
        this.controls.select(this.ship.tool)
        this.input.keyboard?.on('keydown', this.onKeyDown, this)
        this.input.on('wheel', this.onWheel, this)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.begin()
    }

    update(time: number, delta: number) {
        this.ship.update(time, this.lockTarget())
        this.things.update(time)
        if (this.mode !== 'fly' && this.mode !== 'wave') return

        const dt = Math.min(delta, 50) / 1000
        if (!this.guiding) this.ship.drive(this.controls.vector, dt)
        const dy = this.level.speed * this.speedMul * dt
        this.world.scroll(dy)
        const gone = this.things.scroll(dy)
        if (this.mode === 'wave') return
        if (!this.guiding && gone.length) {
            this.lose()
            return
        }

        this.distSince += dy
        while (this.pending.length && this.distSince >= this.pending[0].gap) {
            const next = this.pending.shift()!
            this.things.spawn(next)
            this.distSince = 0
        }

        const nose = this.ship.noseY
        this.things.list.forEach(view => {
            if (view.resolved || Math.abs(view.x - this.ship.x) > REACH.hitX) return
            if (view.y + THING_VIEW.half < nose - REACH.len || view.y - THING_VIEW.half > nose) return
            void this.act(view)
        })

        if (!this.guiding && !this.pending.length && !this.things.list.some(view => !view.resolved || view.spoiled)) void this.endWave()
    }

    private shutdownScene() {
        this.gen++
        this.input.keyboard?.off('keydown', this.onKeyDown, this)
        this.input.off('wheel', this.onWheel, this)
        this.hud?.destroy()
        this.controls?.destroy()
        this.things?.destroy()
        this.ship?.destroy()
        this.world?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private lockTarget() {
        if (this.mode !== 'fly' && this.mode !== 'guide') return null
        const nose = this.ship.noseY
        let best: ThingView | null = null
        for (const view of this.things.list) {
            if (view.resolved || Math.abs(view.x - this.ship.x) > REACH.hitX) continue
            if (view.y - THING_VIEW.half > nose || view.y + THING_VIEW.half < nose - REACH.len - REACH.lockAhead) continue
            if (!best || view.y > best.y) best = view
        }
        return best ? { x: best.x, y: best.y } : null
    }

    private get live() {
        return this.mode === 'fly' && !this.guiding
    }

    private get place(): Place {
        return this.world.place
    }

    private onWheel(_pointer: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number) {
        if (!this.live || Math.abs(dy) < 1 || this.time.now - this.lastWheel < WHEEL_MS) return
        this.lastWheel = this.time.now
        const i = TOOLS.indexOf(this.ship.tool)
        const next = TOOLS[(i + (dy > 0 ? 1 : TOOLS.length - 1)) % TOOLS.length]
        this.controls.press(next)
        this.equip(next)
    }

    private onKeyDown(event: KeyboardEvent) {
        const digit = ['Digit1', 'Digit2', 'Digit3'].indexOf(event.code)
        const pad = ['Numpad1', 'Numpad2', 'Numpad3'].indexOf(event.code)
        const i = digit >= 0 ? digit : pad
        if (i < 0 || !this.live) return
        this.controls.press(TOOLS[i])
        this.equip(TOOLS[i])
    }

    private equip(tool: Tool) {
        if (!this.live) return
        this.setTool(tool)
    }

    private setTool(tool: Tool) {
        if (tool === this.ship.tool) return
        this.ship.setTool(tool)
        this.ship.swap()
        this.controls.select(tool)
        this.audio.swap()
    }

    private nose() {
        return { x: this.ship.x, y: this.ship.noseY }
    }

    private async begin() {
        const gen = ++this.gen
        const first = this.level.waves[0].place
        if (this.level.level === 1 && !this.registry.get(guideKey(1))) {
            this.registry.set(guideKey(1), true)
            this.registry.set(placeKey('earth'), true)
            await this.runGuide(gen)
            return
        }
        if (!this.registry.get(guideKey(this.level.level))) {
            this.registry.set(guideKey(this.level.level), true)
            await this.remindStick(gen)
            if (gen !== this.gen) return
        }
        if (!this.registry.get(placeKey(first))) {
            await this.placeIntro(gen, first)
            if (gen !== this.gen) return
        }
        this.startWave(0)
    }

    private startWave(index: number) {
        this.waveIndex = index
        this.pending = this.level.waves[index].things.map(def => ({ ...def }))
        this.distSince = 0
        this.streak = 0
        this.hud.setPhase(index)
        this.mode = 'fly'
        this.guiding = false
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private toolSound(tool: Tool) {
        if (tool === 'blower') this.audio.blow()
        else if (tool === 'water') this.audio.splash()
        else this.audio.pull()
    }

    private async act(view: ThingView) {
        const gen = this.gen
        const tool = this.ship.tool
        const kind = view.def.kind
        const nose = () => this.nose()
        const target = () => ({ x: view.x, y: view.y + 20 })
        view.resolved = true
        this.toolSound(tool)

        if (TOOL_FOR[kind] === tool) {
            if (!this.guiding) this.solved()
            const ms = kind === 'leaves' ? 380 : kind === 'fire' ? 720 : 620
            await Promise.all([this.ship.blast(tool, target, ms), this.things.solve(view, nose)])
            if (gen !== this.gen || !this.guiding) return
            this.mode = 'guide'
            this.solvedWaiter?.()
            return
        }

        this.audio.fomfom()
        this.missed()
        void this.controls.hint(TOOL_FOR[kind])
        await Promise.all([
            this.ship.blast(tool, target, 560),
            this.things.spoil(view, tool, nose, () => this.ship.shake(), () => this.ship.heat()),
        ])
    }

    private solved() {
        this.score += POINTS
        this.hits += 1
        this.done += 1
        this.audio.plim(this.streak)
        this.streak += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
    }

    private missed() {
        this.errors += 1
        this.streak = 0
        this.score = Math.max(0, this.score - MISS_POINTS)
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -MISS_POINTS, stage: this.level.level })
        this.emitCheckpoint()
    }

    private async endWave() {
        const gen = this.gen
        this.mode = 'wave'
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.wave()
        void this.hud.celebrate(this.waveIndex)
        await FX.wait(this, WAVE_PAUSE_MS)
        if (gen !== this.gen) return
        const next = this.waveIndex + 1
        if (next >= this.level.waves.length) {
            void this.endLevel()
            return
        }
        const place = this.level.waves[next].place
        if (place !== this.place) {
            await this.travel(gen, place)
            if (gen !== this.gen) return
            if (!this.registry.get(placeKey(place))) {
                await this.placeIntro(gen, place)
                if (gen !== this.gen) return
            } else {
                await this.hidePilot()
                if (gen !== this.gen) return
            }
        }
        this.startWave(next)
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.guiding = false
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        void this.showPilot(PILOT_FRAME.oops)
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: 0, stage: this.level.level })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private ramp(ms: number, step: (t: number) => void) {
        return new Promise<void>(resolve =>
            this.tweens.addCounter({
                from: 0,
                to: 1,
                duration: ms,
                ease: 'Sine.easeInOut',
                onUpdate: tween => step(tween.getValue() ?? 0),
                onComplete: () => {
                    step(1)
                    resolve()
                },
            }),
        )
    }

    private bigMoon() {
        const g = this.add.graphics().setDepth(DEPTH.scenery + 2)
        g.fillStyle(C.white, 0.12)
        g.fillCircle(0, 0, 250)
        g.fillStyle(0xd9d5ea, 1)
        g.fillCircle(0, 0, 220)
        g.lineStyle(8, C.ink, 1)
        g.strokeCircle(0, 0, 220)
        ;[
            [-80, -60, 44],
            [70, 30, 56],
            [-30, 100, 30],
            [110, -110, 22],
            [-140, 40, 18],
        ].forEach(([x, y, r]) => {
            g.fillStyle(0xb7b3cc, 1)
            g.fillCircle(x, y, r)
            g.lineStyle(4, C.ink, 0.35)
            g.strokeCircle(x, y, r)
        })
        return g.setPosition(W / 2, -280)
    }

    private async travel(gen: number, place: Place) {
        const toSpace = place === 'space'
        const veil = this.add.rectangle(0, 0, W, H, toSpace ? 0xcff4ff : 0xe4e1f2, 0).setOrigin(0).setDepth(DEPTH.scenery + 3)
        this.guiding = true
        void this.showPilot(PILOT_FRAME.win)
        let moon: Phaser.GameObjects.Graphics | null = null
        if (!toSpace) {
            moon = this.bigMoon()
            await FX.to(this, moon, { y: 170 }, { duration: 1400, ease: Ease.smooth })
            if (gen !== this.gen) return
        }
        this.audio.powerUp()
        await Promise.all([
            this.ship.glide(W / 2, SHIP_VIEW.y + 10, 700),
            this.ramp(1100, t => this.ship.setBoost(t * 0.6)),
        ])
        if (gen !== this.gen) return
        this.audio.whoosh()
        const climbY = SHIP_VIEW.minY + 60
        void this.ship.glide(W / 2, climbY, 1400)
        await this.ramp(1500, t => {
            this.ship.setBoost(0.6 + t * 0.4)
            this.speedMul = 1 + t * t * 11
            this.world.rush(t)
            veil.setFillStyle(veil.fillColor, t * 0.92)
            if (moon) moon.setScale(1 + t * t * 4).setY(170 + t * 180)
        })
        if (gen !== this.gen) return
        this.things.setPlace(place)
        await this.world.setPlace(place, false)
        moon?.destroy()
        if (toSpace) veil.setFillStyle(0x1b1446, 0.92)
        void this.ship.glide(W / 2, SHIP_VIEW.y, 1300)
        await this.ramp(1300, t => {
            this.ship.setBoost(1 - t)
            this.speedMul = 12 - t * 11
            this.world.rush(1 - t)
            veil.setFillStyle(veil.fillColor, 0.92 * (1 - t))
        })
        veil.destroy()
        this.speedMul = 1
        this.ship.setBoost(0)
        this.world.rush(0)
        this.guiding = false
    }

    private async showPilot(frame: number) {
        this.tweens.killTweensOf(this.pilot)
        this.perched = null
        this.pilot.setFrame(frame).setDepth(DEPTH.pilot).setScale(PILOT_VIEW.scale).setFlipX(false).setAlpha(1).setY(PILOT_VIEW.y)
        if (this.pilot.visible && this.pilot.x === PILOT_VIEW.x) return
        this.pilot.setVisible(true).setX(PILOT_VIEW.x - 420)
        await FX.to(this, this.pilot, { x: PILOT_VIEW.x }, { duration: 420, ease: Ease.back(1.4) })
    }

    private async hidePilot() {
        this.tweens.killTweensOf(this.pilot)
        const away = this.pilot.x < W / 2 ? -420 : W + 420
        await FX.to(this, this.pilot, { x: away }, { duration: 300, ease: 'Sine.easeIn' })
        this.pilot.setVisible(false).setDepth(DEPTH.pilot).setScale(PILOT_VIEW.scale)
        this.perched = null
    }

    private async perch(side: Side, frame: number) {
        const x = side === 'left' ? SPEAKER.left : SPEAKER.right
        const y = H - (PILOT_CELL.bottom - PILOT_CELL.h / 2) * SPEAKER.scale
        const off = side === 'left' ? -300 : W + 300
        this.pilot.setFrame(frame)
        if (this.perched === side) return
        this.tweens.killTweensOf(this.pilot)
        if (this.perched || this.pilot.visible) await this.hidePilot()
        this.perched = side
        this.pilot.setVisible(true).setDepth(SPEAKER.depth).setScale(SPEAKER.scale).setFlipX(side === 'right').setPosition(off, y)
        await FX.to(this, this.pilot, { x }, { duration: 320, ease: Ease.back(1.4) })
    }

    private async talk(key: string, steps: TutorialStep[], frame: number = PILOT_FRAME.talk) {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i]
            const last = i === steps.length - 1
            await this.perch((step.x ?? W / 2) >= W * 0.42 ? 'left' : 'right', frame)
            await teach(this, key, [{ ...step, buttonLabel: step.buttonLabel ?? (last ? undefined : 'Próximo') }])
        }
    }

    private flyUntilSolved(gen: number) {
        return new Promise<void>(resolve => {
            this.solvedWaiter = () => {
                this.solvedWaiter = undefined
                resolve()
            }
            if (gen === this.gen) this.mode = 'fly'
        })
    }

    private async parade(gen: number, place: Place, kind: Kind, tool: Tool) {
        const y = TOOL_BUTTONS.y[tool]
        const view = this.things.spawn({ kind, slot: 2, gap: 0 }, y, PARADE_X)
        view.sprite.setScale(0)
        await FX.to(this, view.sprite, { scale: THING_VIEW.scale }, { duration: 320, ease: Ease.back(2) })
        if (gen !== this.gen) return
        await this.talk(placeKey(place), [
            { text: PAIRS[place][tool], ...spot(union(toolRect(tool), thingRect(PARADE_X, y))), balloonY: HIGH_BALLOON_Y, buttonLabel: 'Próximo' },
        ])
        if (gen !== this.gen) return
        await this.things.fadeAll()
    }

    private async hello(gen: number, key: string, text: string) {
        await this.showPilot(PILOT_FRAME.talk)
        if (gen !== this.gen) return
        await teach(this, key, [{ text, ...spot(pilotRect()), buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return
        await this.hidePilot()
    }

    private async placeIntro(gen: number, place: Place) {
        this.registry.set(placeKey(place), true)
        this.mode = 'guide'
        this.guiding = true
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        await this.hello(gen, placeKey(place), PLACE_HELLO[place])
        for (const [kind, tool] of PAIRS_ORDER) {
            if (gen !== this.gen) return
            await this.parade(gen, place, kind, tool)
        }
        if (gen !== this.gen) return
        await this.hidePilot()
        this.guiding = false
    }

    private async remindStick(gen: number) {
        this.mode = 'guide'
        this.guiding = true
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        await this.talk(guideKey(this.level.level), [
            {
                text: TEACH.stickHelp,
                ...spot(JOYSTICK_RECT),
                pointer: { fromX: JOYSTICK.x, fromY: JOYSTICK.y, toX: JOYSTICK.x + 70, toY: JOYSTICK.y - 40 },
                balloonY: LOW_BALLOON_Y,
            },
        ])
        if (gen !== this.gen) return
        await this.hidePilot()
        this.guiding = false
    }

    private async runGuide(gen: number) {
        const key = guideKey(1)
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        this.controls.setEnabled(false)
        this.ship.place(slotX(1), SHIP_VIEW.y)

        await this.hello(gen, key, TEACH.hello)
        for (const [kind, tool] of PAIRS_ORDER) {
            if (gen !== this.gen) return
            await this.parade(gen, 'earth', kind, tool)
        }
        if (gen !== this.gen) return

        await this.talk(key, [{ text: TEACH.reach, ...spot(reachRect(this.ship.x, this.ship.y)), buttonLabel: 'Próximo' }])
        if (gen !== this.gen) return

        this.things.spawn({ kind: 'leaves', slot: 3, gap: 0 }, DEMO_Y)
        await this.talk(key, [
            { text: TEACH.leavesLook, ...spot(thingRect(slotX(3), DEMO_Y)), buttonLabel: 'Próximo' },
            {
                text: TEACH.stick,
                ...spot(JOYSTICK_RECT),
                pointer: { fromX: JOYSTICK.x, fromY: JOYSTICK.y, toX: JOYSTICK.x + 80, toY: JOYSTICK.y },
                balloonY: LOW_BALLOON_Y,
                buttonLabel: 'Ver',
            },
        ])
        if (gen !== this.gen) return
        void this.controls.pushStick({ x: 1, y: 0 }, 300)
        await this.ship.glide(slotX(3), SHIP_VIEW.y, 600)
        if (gen !== this.gen) return
        await this.flyUntilSolved(gen)
        if (gen !== this.gen) return

        this.mode = 'guide'
        await this.things.fadeAll()
        if (gen !== this.gen) return
        this.things.spawn({ kind: 'fire', slot: 3, gap: 0 }, DEMO_Y)
        await this.talk(key, [
            { text: TEACH.fireLook, ...spot(thingRect(slotX(3), DEMO_Y)), buttonLabel: 'Próximo' },
            { text: TEACH.fire, ...spot(toolRect('water')), pointer: tap(toolRect('water')), balloonY: LOW_BALLOON_Y, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.controls.press('water')
        this.setTool('water')
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        await this.flyUntilSolved(gen)
        if (gen !== this.gen) return

        this.mode = 'guide'
        await this.talk(key, [{ text: TEACH.back, ...spot(toolRect('blower')), pointer: tap(toolRect('blower')), balloonY: LOW_BALLOON_Y, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return
        this.controls.press('blower')
        this.setTool('blower')
        await FX.wait(this, 400)
        if (gen !== this.gen) return

        await this.talk(key, [{ text: TEACH.careful, ...spot(TOOLS_RECT), balloonY: LOW_BALLOON_Y }])
        if (gen !== this.gen) return
        await Promise.all([this.hidePilot(), this.things.fadeAll()])
        if (gen !== this.gen) return
        this.startWave(0)
    }

    private async explain() {
        if (!this.live) return
        const gen = this.gen
        this.mode = 'panel'
        this.guiding = true
        this.controls.setEnabled(false)
        this.hud.setHelpEnabled(false)
        await this.talk(`${guideKey(this.level.level)}-help`, [
            { text: TOOLS_HELP[this.place], ...spot(TOOLS_RECT), balloonY: LOW_BALLOON_Y, buttonLabel: 'Próximo' },
            { text: TEACH.stickHelp, ...spot(JOYSTICK_RECT), balloonY: LOW_BALLOON_Y, buttonLabel: 'Continuar' },
        ])
        await this.hidePilot()
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = 'fly'
        this.controls.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.controls.setEnabled(false)
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
        void FX.confetti(this, { colors: CONFETTI })
        await this.showPilot(PILOT_FRAME.win)
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        const words = END_BY_LEVEL[this.level.level] ?? END
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.white,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            messageColor: CSS.inkSoft,
            title: words.title,
            message: words.message,
            stars: this.errors === 0 ? 3 : this.errors <= 2 ? 2 : 1,
            progress: { total: this.level.waves.length, current: this.level.waves.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () => this.scene.restart({ level: this.level.level + 1, points: this.score, lives: this.livesLeft }),
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
            progress: Math.round((this.done / totalThings(this.level)) * 100),
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
