import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEPTH, PANEL, RUN, VIEW, ZOOM } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { PLACES } from '../data/places'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL } from '../data/words'
import type { CallDef, LevelDef, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createCaption, type Caption } from './caption'
import { createDoor, type Door } from './door'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createMarkers, type Markers } from './markers'
import { createRunner, type Runner } from './runner'
import { createTown, type Town } from './town'
import { createView, type View } from './view'

const GAME_ID = 'bairro-das-permissoes'

type Keys = Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private callIndex = 0
    private demoing = false
    private demoSteer: Vec | null = null
    private demoMove = false
    private skip = false
    private idleSince = 0
    private nudging = false
    private camOnKid = true
    private lastDoor: string | null = null
    private lastBump = 0
    private steerPointer: Phaser.Input.Pointer | null = null

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private town!: Town
    private runner!: Runner
    private markers!: Markers
    private header!: Header
    private door!: Door
    private banner!: Banner
    private caption!: Caption
    private hand!: Hand
    private aimDot!: Phaser.GameObjects.Arc
    private keys?: Keys

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.state = 'intro'
        this.introduce = false
        this.callIndex = 0
        this.demoing = false
        this.demoSteer = null
        this.demoMove = false
        this.skip = false
        this.idleSince = 0
        this.nudging = false
        this.camOnKid = true
        this.lastDoor = null
        this.lastBump = 0
        this.steerPointer = null
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, this.level.world, this.level.start)
        this.audio = createAudio()
        this.town = createTown(this, this.view, this.level)
        this.runner = createRunner(this, this.view, this.level.start, this.level.world)
        this.aimDot = this.view.world(this.add.circle(0, 0, 26, C.white, 0.35).setStrokeStyle(5, C.white, 0.9).setDepth(DEPTH.pointer).setVisible(false))
        this.markers = createMarkers(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.calls.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.door = createDoor(this)
        this.banner = createBanner(this)
        this.caption = createCaption(this)
        this.hand = createHand(this, this.view)
        this.header.setHelpEnabled(false)

        const kb = this.input.keyboard
        if (kb)
            this.keys = kb.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.UP,
                down: Phaser.Input.Keyboard.KeyCodes.DOWN,
                left: Phaser.Input.Keyboard.KeyCodes.LEFT,
                right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                w: Phaser.Input.Keyboard.KeyCodes.W,
                a: Phaser.Input.Keyboard.KeyCodes.A,
                s: Phaser.Input.Keyboard.KeyCodes.S,
                d: Phaser.Input.Keyboard.KeyCodes.D,
            }) as Keys

        this.input.on('pointerdown', this.onDown, this)
        this.input.on('pointerup', this.onUp, this)
        this.input.on('pointerupoutside', this.onUp, this)

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.steerPointer = null
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hand?.destroy()
        this.caption?.destroy()
        this.banner?.destroy()
        this.door?.destroy()
        this.header?.destroy()
        this.markers?.destroy()
        this.runner?.destroy()
        this.town?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number, deltaMs: number) {
        if (!this.runner) return
        const dt = Math.min(deltaMs, 50)
        const free = this.state === 'run' || this.state === 'fetch'
        if (free || this.state === 'ask' || this.demoMove) {
            const dir = free ? this.steerDir() : this.demoMove ? this.demoDir() : null
            if (dir) {
                this.runner.steer(dir)
                this.idleSince = time
            } else if (free || this.demoMove) this.runner.steer(null)
            const step = this.runner.update(dt, this.town.solids)
            if (step.bumped > 140 && time - this.lastBump > 260) {
                this.lastBump = time
                this.audio.bump()
            }
            if (step.stride) this.audio.step()
            if (step.skidding) this.audio.skid()
            if (free) this.checkDoors()
        }
        if (this.camOnKid) this.view.follow(this.runner.at, dt)
        this.paintAim(free)
        this.markers.update(free ? this.town.door(this.targetId()) : null)
        if (free && !this.nudging && !this.steerPointer && time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            void this.nudge()
        }
    }

    private steerDir(): Vec | null {
        const k = this.keys
        if (k) {
            const x = (k.right.isDown || k.d.isDown ? 1 : 0) - (k.left.isDown || k.a.isDown ? 1 : 0)
            const y = (k.down.isDown || k.s.isDown ? 1 : 0) - (k.up.isDown || k.w.isDown ? 1 : 0)
            if (x || y) {
                const len = Math.hypot(x, y)
                return { x: x / len, y: y / len }
            }
        }
        const p = this.steerPointer
        if (!p || !p.isDown) return null
        return this.toward(this.view.toWorld(p.x, p.y))
    }

    private demoDir(): Vec | null {
        return this.demoSteer ? this.toward(this.demoSteer) : null
    }

    private toward(target: Vec): Vec | null {
        const at = this.runner.at
        const dx = target.x - at.x
        const dy = target.y - at.y
        const len = Math.hypot(dx, dy)
        if (len < RUN.deadZone) return null
        return { x: dx / len, y: dy / len }
    }

    private paintAim(free: boolean) {
        const p = this.steerPointer
        if (!free || !p || !p.isDown) {
            this.aimDot.setVisible(false)
            return
        }
        const at = this.view.toWorld(p.x, p.y)
        this.aimDot.setPosition(at.x, at.y).setVisible(true)
    }

    private targetId() {
        const call = this.current()
        return this.state === 'fetch' ? call.wants : call.app
    }

    private onDown(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) {
        if (this.demoing) {
            if (this.view.onMap(pointer.x, pointer.y)) this.skip = true
            return
        }
        this.idleSince = this.time.now
        if (over.length) return
        if (this.state !== 'run' && this.state !== 'fetch') return
        if (!this.view.onMap(pointer.x, pointer.y)) return
        this.steerPointer = pointer
        this.nudging = false
        this.hand.stop()
    }

    private onUp(pointer: Phaser.Input.Pointer) {
        if (this.steerPointer === pointer) this.steerPointer = null
    }

    private release() {
        this.steerPointer = null
        this.runner.steer(null)
        this.nudging = false
        this.hand.stop()
    }

    private checkDoors() {
        const id = this.town.nearDoor(this.runner.at)
        if (!id) {
            this.lastDoor = null
            return
        }
        const call = this.current()
        if (this.state === 'run' && id === call.app) {
            void this.arrive()
            return
        }
        if (this.state === 'fetch' && id === call.wants) {
            void this.deliver()
            return
        }
        if (id === this.lastDoor) return
        this.lastDoor = id
        if (PLACES[id].family === 'peca') {
            this.town.nope(id)
            this.audio.click()
        }
    }

    private current(): CallDef {
        return this.level.calls[Math.min(this.callIndex, this.level.calls.length - 1)]
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        if (this.introduce) {
            await this.demo(gen, true)
            if (gen !== this.gen) return
        }
        await this.startCall(gen, 0)
    }

    private async startCall(gen: number, index: number) {
        this.callIndex = index
        this.lastDoor = null
        this.header.setPhase(index)
        const call = this.current()
        this.town.aim(null)
        this.town.call(call.app)
        this.header.ask(PLACES[call.app].calling ?? '', true)
        this.audio.call()
        const door = this.town.door(call.app)
        if (!this.view.inView(door, 60)) {
            this.state = 'intro'
            this.camOnKid = false
            await this.view.zoomTo(door, 0.8, TIMING.pan)
            if (gen !== this.gen) return
            this.town.happy(call.app)
            await FX.wait(this, 700)
            if (gen !== this.gen) return
            await this.view.zoomTo(this.runner.at, 1, TIMING.pan)
            if (gen !== this.gen) return
        }
        this.camOnKid = true
        this.state = 'run'
        this.header.setHelpEnabled(true)
        this.idleSince = this.time.now
    }

    private async arrive() {
        const gen = this.gen
        const call = this.current()
        this.state = 'ask'
        this.release()
        this.runner.brake()
        this.camOnKid = false
        this.header.setHelpEnabled(false)
        this.audio.arrive()
        const foot = this.town.foot(call.app)
        void this.view.zoomTo({ x: foot.x, y: foot.y - PANEL.focus }, 1, TIMING.pan)
        this.header.ask(LABEL.ask)
        const yes = await this.door.ask({ app: PLACES[call.app].icon, want: PLACES[call.wants].icon, says: call.says })
        if (gen !== this.gen) return
        this.door.glow(yes)
        this.audio.click()
        if (yes !== call.ok) {
            await this.wrong(gen, call, yes)
            return
        }
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        if (yes) await this.grant(gen, call)
        else await this.refuse(gen, call)
    }

    private async grant(gen: number, call: CallDef) {
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        await this.door.hide()
        if (gen !== this.gen) return
        this.town.call(null)
        this.town.aim(call.wants)
        this.runner.carry(PLACES[call.wants].icon)
        this.audio.pop()
        this.header.ask(PLACES[call.wants].fetch ?? '', true)
        this.camOnKid = true
        this.state = 'fetch'
        this.header.setHelpEnabled(true)
        this.idleSince = this.time.now
    }

    private async refuse(gen: number, call: CallDef) {
        this.state = 'show'
        await this.door.stamp()
        if (gen !== this.gen) return
        this.audio.stamp()
        this.town.call(null)
        this.town.nope(call.app)
        this.caption.say(CAPTION.no, C.yes)
        await FX.wait(this, TIMING.recap)
        if (gen !== this.gen) return
        await this.door.hide()
        this.caption.hide()
        if (gen !== this.gen) return
        await this.view.zoomTo(this.runner.at, 1, TIMING.pan / 2)
        if (gen !== this.gen) return
        this.camOnKid = true
        await this.finishCall(gen)
    }

    private framing(a: Vec, b: Vec) {
        const dx = Math.abs(a.x - b.x) + 560
        const dy = Math.abs(a.y - b.y) + 540
        const zoom = Phaser.Math.Clamp(Math.min(VIEW.w / dx, VIEW.h / dy), ZOOM.show, 1)
        return { at: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 90 }, zoom }
    }

    private async deliver() {
        const gen = this.gen
        const call = this.current()
        const app = PLACES[call.app]
        const want = PLACES[call.wants]
        this.state = 'show'
        this.release()
        this.runner.stop()
        this.header.setHelpEnabled(false)
        this.town.aim(null)
        this.town.gate(call.wants, true)
        this.audio.gate()
        const gate = this.town.door(call.wants)
        const from = this.runner.carryAt()
        this.runner.carry(null)
        await this.town.fly(want.icon, from, { x: gate.x, y: gate.y - 150 }, 64)
        if (gen !== this.gen) return
        this.camOnKid = false
        const a = this.town.plate(call.wants)
        const b = this.town.plate(call.app)
        const shot = this.framing(a, b)
        await this.view.zoomTo(shot.at, shot.zoom, TIMING.zoom)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.town.beam({ x: gate.x, y: gate.y - 150 }, b)
        if (gen !== this.gen) return
        const works = app.works ?? 'glow'
        if (works === 'flash') this.audio.shutter()
        else if (works === 'notes') this.audio.melody()
        else this.audio.hum()
        this.caption.say(CAPTION.yes, C.yes)
        await this.town.works(call.app, works)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.caption.hide()
        this.town.gate(call.wants, false)
        await this.view.zoomTo(this.runner.at, 1, TIMING.zoom)
        if (gen !== this.gen) return
        this.camOnKid = true
        await this.finishCall(gen)
    }

    private async finishCall(gen: number) {
        this.state = 'show'
        this.done += 1
        this.audio.good()
        this.emitCheckpoint()
        this.runner.cheer()
        await this.header.celebrate(this.callIndex)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        if (this.callIndex + 1 >= this.level.calls.length) {
            void this.endLevel()
            return
        }
        await this.startCall(gen, this.callIndex + 1)
    }

    private async wrong(gen: number, call: CallDef, yes: boolean) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        const want = PLACES[call.wants]
        if (yes) {
            await this.door.hide()
            if (gen !== this.gen) return
            this.town.call(null)
            const a = this.town.plate(call.wants)
            const b = this.town.plate(call.app)
            const shot = this.framing(a, b)
            await this.view.zoomTo(shot.at, shot.zoom, TIMING.pan)
            if (gen !== this.gen) return
            this.audio.whoosh()
            await this.town.fly(want.icon, a, b, 80)
            if (gen !== this.gen) return
            this.town.happy(call.app)
            this.audio.zap()
            const s = this.view.toScreen(b)
            void FX.sparks(this, s.x, s.y, { color: C.coral, count: 22, spread: 140, depth: DEPTH.door - 1 })
            FX.shakeCam(this, 'leve')
        } else {
            await this.door.stamp()
            if (gen !== this.gen) return
            this.audio.stamp()
            this.town.call(null)
            this.town.dim(call.app, true)
            this.audio.zap()
            await FX.wait(this, 380)
            if (gen !== this.gen) return
            await this.door.hide()
            if (gen !== this.gen) return
        }
        this.banner.say(`${LABEL.oops} ${call.why}`)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.release()
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    private async nudge() {
        this.nudging = true
        const dir = this.toward(this.town.door(this.targetId()))
        if (!dir) {
            this.nudging = false
            return
        }
        const at = this.runner.at
        await this.hand.hold({ x: at.x + dir.x * 230, y: at.y + dir.y * 230 }, 1100)
        if (!this.nudging) return
        await this.hand.lift()
        this.nudging = false
    }

    private async demo(gen: number, first: boolean) {
        this.demoing = true
        this.skip = false
        this.markers.visible(false)
        this.header.setHelpEnabled(false)
        this.release()
        this.runner.stop()
        const on = () => gen === this.gen && !this.skip
        const { w, h } = this.level.world
        try {
            this.camOnKid = false
            if (first) this.runner.visible(false)
            await this.view.zoomTo({ x: w / 2, y: h / 2 }, Math.min(VIEW.w / w, VIEW.h / h) * ZOOM.town, TIMING.zoom)
            if (!on()) return
            this.town.demo(true)
            this.audio.call()
            this.caption.say(CAPTION.alone)
            await FX.wait(this, TIMING.caption + 400)
            if (!on()) return
            this.caption.say(CAPTION.nobody, C.oops)
            this.level.houses.forEach(hs => {
                if (PLACES[hs.id].family === 'peca') this.town.nope(hs.id)
            })
            this.audio.bump()
            await FX.wait(this, TIMING.caption + 400)
            if (!on()) return
            this.town.demo(false)
            this.caption.hide()
            await this.view.zoomTo(this.runner.at, 1, TIMING.zoom)
            if (!on()) return
            if (first) {
                await this.runner.drop()
                this.audio.wake()
            } else this.runner.cheer()
            this.caption.say(CAPTION.you, C.accent)
            await FX.wait(this, TIMING.caption + 200)
            if (!on()) return

            this.camOnKid = true
            this.caption.say(CAPTION.hold)
            const at = this.runner.at
            const dir = this.toward(this.town.door(this.targetId())) ?? { x: 1, y: 0 }
            const goal = { x: at.x + dir.x * 320, y: at.y + dir.y * 320 }
            await this.hand.press(goal)
            if (!on()) return
            this.demoSteer = goal
            this.demoMove = true
            await FX.wait(this, TIMING.demoRun)
            this.demoSteer = null
            if (!on()) return
            await this.hand.lift()
            await FX.wait(this, 700)
            this.demoMove = false
            if (!on()) return
            this.caption.say(CAPTION.yourTurn, C.yes)
            this.audio.wake()
            await FX.wait(this, TIMING.caption)
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    private async endDemo() {
        this.demoSteer = null
        this.demoMove = false
        this.hand.stop()
        this.caption.hide()
        this.town.demo(false)
        this.runner.visible(true)
        this.runner.stop()
        await this.view.zoomTo(this.runner.at, 1, TIMING.zoom / 2)
        this.camOnKid = true
        this.markers.visible(true)
        this.demoing = false
        this.skip = false
    }

    private async explain() {
        if (this.state !== 'run' && this.state !== 'fetch') return
        const gen = this.gen
        const back = this.state
        this.state = 'help'
        await this.demo(gen, false)
        if (gen !== this.gen) return
        this.state = back
        this.header.setHelpEnabled(true)
        this.idleSince = this.time.now
    }

    private onShowTutorial() {
        void this.explain()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.audio.win()
        void FX.confetti(this, { colors: [C.yes, C.accent, C.accentYellow, C.accentPink, C.shirt] })
        await FX.wait(this, TIMING.finale)
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()
        this.state = 'done'
        const last = this.level.level >= LEVELS.length
        showLevelComplete(this, {
            accent: C.accent,
            panelColor: C.cream,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.accent,
            messageColor: CSS.inkSoft,
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.calls.length, current: this.level.calls.length },
            ...(!last
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
            progress: Math.min(100, Math.round((this.done / this.level.calls.length) * 100)),
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
