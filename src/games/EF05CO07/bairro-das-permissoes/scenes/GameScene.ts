import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BAG, DEPTH, HEADER, HOUSE, PANEL, RUN, VIEW, ZOOM } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { PLACES } from '../data/places'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, SAY } from '../data/words'
import type { Answer, AppId, CallDef, LevelDef, PartId, PlaceId, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBag, type Bag } from './bag'
import { createBanner, type Banner } from './banner'
import { createCaption, type Caption } from './caption'
import { createDoor, type Door } from './door'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createMarkers, type Markers } from './markers'
import { createRunner, type Runner } from './runner'
import { createSwap, type Swap } from './swap'
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
    private settling = false
    private lastDoor: string | null = null
    private lastBump = 0
    private steerPointer: Phaser.Input.Pointer | null = null
    private headerK = 0
    private headerHidden = false
    private moveMs = 0
    private stillMs = 0
    private captionToken = 0
    private bagTold = false
    private fullTold = false
    private homeTold = false
    private fetchList: PartId[] = []

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private town!: Town
    private runner!: Runner
    private bag!: Bag
    private markers!: Markers
    private header!: Header
    private door!: Door
    private swap!: Swap
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
        this.settling = false
        this.lastDoor = null
        this.lastBump = 0
        this.steerPointer = null
        this.headerK = 0
        this.headerHidden = false
        this.moveMs = 0
        this.stillMs = 0
        this.captionToken = 0
        this.bagTold = false
        this.fullTold = false
        this.homeTold = false
        this.fetchList = []
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
        this.level.using.forEach(u => this.town.use(u.part, u.app))
        this.runner = createRunner(this, this.view, this.level.start, this.level.world)
        this.aimDot = this.view.world(this.add.circle(0, 0, 26, C.white, 0.35).setStrokeStyle(5, C.white, 0.9).setDepth(DEPTH.pointer).setVisible(false))
        this.bag = createBag(this)
        this.markers = createMarkers(this, this.view, this.bag.rect())
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
        this.swap = createSwap(this)
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
        this.swap?.destroy()
        this.door?.destroy()
        this.header?.destroy()
        this.markers?.destroy()
        this.bag?.destroy()
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
        const free = this.isFree()
        if (free || this.state === 'ask' || this.state === 'swap' || this.demoMove || this.settling) {
            const dir = free ? this.steerDir() : this.demoMove ? this.demoDir() : null
            if (dir) {
                this.runner.steer(dir)
                this.idleSince = time
                if (free && this.nudging) {
                    this.nudging = false
                    this.hand.stop()
                }
            } else if (free || this.demoMove) this.runner.steer(null)
            const step = this.runner.update(dt, this.town.solids)
            if (step.bumped > 140 && time - this.lastBump > 260) {
                this.lastBump = time
                this.audio.bump()
            }
            if (step.stride) this.audio.step()
            if (step.skidding) this.audio.skid()
            if (free) this.checkDoors()
            if (this.settling && !free && this.runner.speed === 0) this.settling = false
        }
        if (this.camOnKid) this.view.follow(this.runner.at, dt)
        this.paintAim(free)
        const target = free ? this.targetId() : null
        this.markers.update(target ? this.town.door(target) : null, target ? PLACES[target].icon : null)
        this.slideHeader(dt, free || this.demoMove)
        if (free && !this.nudging && !this.steerPointer && time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            void this.nudge()
        }
    }

    private isFree() {
        return this.state === 'run' || this.state === 'fetch' || this.state === 'bring'
    }

    private slideHeader(dt: number, running: boolean) {
        if (running && this.runner.speed > HEADER.moving) {
            this.moveMs += dt
            this.stillMs = 0
        } else {
            this.stillMs += dt
            this.moveMs = 0
        }
        if (!running || this.stillMs > HEADER.showAfter) this.headerHidden = false
        else if (this.moveMs > HEADER.hideAfter) this.headerHidden = true
        const target = this.headerHidden ? 1 : 0
        if (this.headerK === target) return
        this.headerK += (target - this.headerK) * (1 - Math.exp(-dt / HEADER.ease))
        if (Math.abs(target - this.headerK) < 0.004) this.headerK = target
        this.header.setCompact(this.headerK)
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

    private targetId(): PlaceId {
        const call = this.current()
        return this.state === 'fetch' && this.fetchList.length ? this.fetchList[0] : call.app
    }

    private onDown(pointer: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) {
        if (this.demoing) {
            if (this.view.onMap(pointer.x, pointer.y)) this.skip = true
            return
        }
        this.idleSince = this.time.now
        if (over.length) return
        if (!this.isFree()) return
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
        if (this.state === 'bring' && id === call.app) {
            void this.bringIn()
            return
        }
        if (this.state === 'fetch' && this.fetchList.includes(id as PartId)) {
            void this.fetchIn(id as PartId)
            return
        }
        if (id === this.lastDoor) return
        this.lastDoor = id
        if (PLACES[id].family === 'peca') this.collect(id as PartId)
    }

    private collect(id: PartId) {
        if (this.bag.has(id)) return
        if (this.town.holder(id)) {
            this.town.nope(id)
            this.audio.click()
            return
        }
        if (this.bag.full()) {
            this.town.nope(id)
            this.bag.shake()
            this.audio.click()
            if (!this.fullTold) {
                this.fullTold = true
                this.flash(CAPTION.full, C.oops)
            }
            return
        }
        const gen = this.gen
        this.town.peek(id, BAG.peek)
        this.audio.gate()
        void this.bag.add(id, this.view.toScreen(this.town.gateAt(id))).then(() => {
            if (gen === this.gen) this.audio.pop()
        })
        this.tellBag()
    }

    private tellBag() {
        if (this.bagTold) return
        this.bagTold = true
        this.flash(CAPTION.bag, C.accent)
    }

    private current(): CallDef {
        return this.level.calls[Math.min(this.callIndex, this.level.calls.length - 1)]
    }

    private say(text: string, tone?: number) {
        this.captionToken++
        this.caption.say(text, tone)
    }

    private unsay() {
        this.captionToken++
        this.caption.hide()
    }

    private flash(text: string, tone?: number) {
        this.say(text, tone)
        const token = this.captionToken
        void FX.wait(this, TIMING.caption).then(() => {
            if (token === this.captionToken) this.unsay()
        })
    }

    private doorShot(id: PlaceId): Vec {
        const foot = this.town.foot(id)
        return { x: foot.x, y: foot.y - PANEL.focus }
    }

    private houseShot(id: PlaceId, zoom: number): Vec {
        const foot = this.town.foot(id)
        return { x: foot.x, y: foot.y - HOUSE.shot - VIEW.top / 2 / zoom }
    }

    private async reveal(gen: number, id: PlaceId, happy = false) {
        if (this.view.inView(this.town.door(id), 60)) return
        this.camOnKid = false
        await this.view.zoomTo(this.houseShot(id, ZOOM.call), ZOOM.call, TIMING.pan)
        if (gen !== this.gen) return
        if (happy) this.town.happy(id)
        await FX.wait(this, 700)
        if (gen !== this.gen) return
        await this.view.zoomTo(this.runner.at, 1, TIMING.pan)
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
        const app = PLACES[call.app]
        this.town.aim(null)
        this.town.call(call.app)
        this.header.goal(app.icon, app.calling ?? '', true)
        this.audio.call()
        this.state = 'intro'
        await this.reveal(gen, call.app, true)
        if (gen !== this.gen) return
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
        void this.view.zoomTo(this.doorShot(call.app), 1, TIMING.pan)
        this.header.goal(null, this.level.wait ? LABEL.askWait : LABEL.ask)
        const answer = await this.door.ask({
            app: PLACES[call.app].icon,
            wants: call.wants.map(p => {
                const holder = this.town.holder(p)
                return { icon: PLACES[p].icon, busy: holder && holder !== call.app ? PLACES[holder].icon : null }
            }),
            says: call.says,
            wait: this.level.wait,
        })
        if (gen !== this.gen) return
        this.door.glow(answer)
        this.audio.click()
        if (answer !== call.answer) {
            await this.wrong(gen, call, answer)
            return
        }
        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        if (answer === 'pode') await this.grant(gen, call)
        else if (answer === 'espera') await this.hold(gen, call)
        else await this.refuse(gen, call)
    }

    private wantsText(call: CallDef) {
        return call.wants.map(p => PLACES[p].the).join(' e ')
    }

    private async grant(gen: number, call: CallDef) {
        this.state = 'show'
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        await this.door.hide()
        if (gen !== this.gen) return
        await this.serve(gen, call)
    }

    private async serve(gen: number, call: CallDef) {
        this.town.call(null)
        this.fetchList = call.wants.filter(p => !this.bag.has(p))
        if (!this.fetchList.length) {
            await this.give(gen, call)
            return
        }
        await this.nextFetch(gen)
    }

    private async nextFetch(gen: number) {
        const part = this.fetchList[0]
        const want = PLACES[part]
        this.state = 'show'
        this.town.aim(part)
        this.audio.pop()
        this.header.goal(want.icon, want.fetch ?? '', true)
        await this.reveal(gen, part)
        if (gen !== this.gen) return
        this.camOnKid = true
        this.state = 'fetch'
        this.header.setHelpEnabled(true)
        this.idleSince = this.time.now
    }

    private async fetchIn(part: PartId) {
        const gen = this.gen
        const call = this.current()
        const app = PLACES[call.app]
        const want = PLACES[part]
        this.state = 'show'
        this.release()
        this.runner.brake()
        this.settling = true
        this.lastDoor = part
        this.header.setHelpEnabled(false)
        this.town.aim(null)
        if (this.bag.full()) {
            this.state = 'swap'
            this.audio.arrive()
            this.header.goal(want.icon, SAY.full(want.the))
            const out = await this.swap.ask(
                this.bag.items.map(id => ({ icon: id ? PLACES[id].icon : 0, name: id ? PLACES[id].name : '' })),
            )
            if (gen !== this.gen) return
            this.state = 'show'
            this.audio.click()
            await FX.wait(this, 220)
            if (gen !== this.gen) return
            await this.swap.hide()
            if (gen !== this.gen) return
            const leaving = this.bag.items[out]
            if (leaving) {
                this.audio.whoosh()
                await this.bag.drop(out, this.view.toScreen(this.town.door(leaving)))
                if (gen !== this.gen) return
                if (call.wants.includes(leaving) && !this.fetchList.includes(leaving)) this.fetchList.push(leaving)
            }
        }
        this.town.gate(part, true)
        this.audio.gate()
        await this.bag.add(part, this.view.toScreen(this.town.gateAt(part)))
        if (gen !== this.gen) return
        this.audio.pop()
        this.tellBag()
        this.fetchList = this.fetchList.filter(p => p !== part)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.town.gate(part, false)
        if (this.fetchList.length) {
            await this.nextFetch(gen)
            return
        }
        this.town.aim(call.app)
        this.header.goal(app.icon, SAY.bring(this.wantsText(call), app.the), true)
        await this.reveal(gen, call.app)
        if (gen !== this.gen) return
        this.camOnKid = true
        this.state = 'bring'
        this.header.setHelpEnabled(true)
        this.idleSince = this.time.now
    }

    private async bringIn() {
        const gen = this.gen
        this.state = 'show'
        this.release()
        this.runner.brake()
        this.settling = true
        this.audio.arrive()
        await this.give(gen, this.current())
    }

    private async give(gen: number, call: CallDef) {
        const app = PLACES[call.app]
        this.state = 'show'
        this.header.setHelpEnabled(false)
        this.town.aim(null)
        this.town.call(null)
        this.camOnKid = false
        await this.view.zoomTo(this.doorShot(call.app), 1, TIMING.pan / 2)
        if (gen !== this.gen) return
        for (const part of call.wants) {
            this.audio.whoosh()
            await this.bag.take(part, this.view.toScreen(this.town.plate(call.app)))
            if (gen !== this.gen) return
        }
        const works = app.works ?? 'glow'
        if (works === 'flash') this.audio.shutter()
        else if (works === 'notes') this.audio.melody()
        else this.audio.hum()
        this.say(CAPTION.yes, C.yes)
        await this.town.works(call.app, works)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.unsay()
        if (call.keep) {
            call.wants.forEach(p => this.town.use(p, call.app))
            this.audio.pop()
            this.flash(CAPTION.busy, C.wait)
            await FX.wait(this, TIMING.caption)
            if (gen !== this.gen) return
        } else await this.sendHome(gen, call.app, call.wants, !this.homeTold)
        if (gen !== this.gen) return
        await this.view.zoomTo(this.runner.at, 1, TIMING.pan / 2)
        if (gen !== this.gen) return
        this.camOnKid = true
        await this.finishCall(gen)
    }

    private async sendHome(gen: number, app: AppId, parts: PartId[], show: boolean) {
        const from = this.town.plate(app)
        if (show) {
            this.homeTold = true
            const shot = this.framing(from, this.town.plate(parts[0]))
            await this.view.zoomTo(shot.at, shot.zoom, TIMING.pan)
            if (gen !== this.gen) return
            this.say(CAPTION.home, C.accent)
        }
        this.audio.release()
        const flights = parts.map((p, i) =>
            FX.wait(this, i * 260).then(() => this.town.home(p, this.town.holder(p) === app ? this.town.usedAt(app, p) : from)),
        )
        parts.forEach(p => this.town.use(p, null))
        await FX.all(...flights)
        if (gen !== this.gen) return
        if (show) {
            await FX.wait(this, TIMING.beat)
            this.unsay()
        }
    }

    private async hold(gen: number, call: CallDef) {
        this.state = 'show'
        this.audio.tick()
        await this.door.hourglass()
        if (gen !== this.gen) return
        this.say(CAPTION.wait, C.wait)
        await FX.wait(this, TIMING.recap)
        if (gen !== this.gen) return
        await this.door.hide()
        this.unsay()
        if (gen !== this.gen) return
        this.town.call(null)
        const holders = new Map<AppId, PartId[]>()
        call.wants.forEach(p => {
            const h = this.town.holder(p)
            if (h && h !== call.app) holders.set(h, [...(holders.get(h) ?? []), p])
        })
        for (const [holder, parts] of holders) {
            const shot = this.framing(this.town.plate(holder), this.town.plate(parts[0]))
            await this.view.zoomTo(shot.at, shot.zoom, TIMING.pan)
            if (gen !== this.gen) return
            const works = PLACES[holder].works ?? 'glow'
            if (works === 'flash') this.audio.shutter()
            else if (works === 'notes') this.audio.melody()
            else this.audio.hum()
            await this.town.works(holder, works)
            if (gen !== this.gen) return
            this.say(SAY.free(parts.map(p => PLACES[p].the).join(' e ')), C.yes)
            await this.sendHome(gen, holder, parts, false)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            this.unsay()
        }
        await this.view.zoomTo(this.runner.at, 1, TIMING.pan / 2)
        if (gen !== this.gen) return
        this.camOnKid = true
        await this.serve(gen, call)
    }

    private async refuse(gen: number, call: CallDef) {
        this.state = 'show'
        await this.door.stamp()
        if (gen !== this.gen) return
        this.audio.stamp()
        this.town.call(null)
        this.town.nope(call.app)
        this.say(CAPTION.no, C.yes)
        await FX.wait(this, TIMING.recap)
        if (gen !== this.gen) return
        await this.door.hide()
        this.unsay()
        if (gen !== this.gen) return
        await this.view.zoomTo(this.runner.at, 1, TIMING.pan / 2)
        if (gen !== this.gen) return
        this.camOnKid = true
        await this.finishCall(gen)
    }

    private framing(a: Vec, b: Vec) {
        const dx = Math.abs(a.x - b.x) + 560
        const dy = Math.abs(a.y - b.y) + 540
        const zoom = Phaser.Math.Clamp(Math.min(VIEW.w / dx, (VIEW.h - VIEW.top) / dy), ZOOM.show, 1)
        return { at: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 90 - VIEW.top / 2 / zoom }, zoom }
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

    private async wrong(gen: number, call: CallDef, answer: Answer) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        const part = call.wants.find(p => this.town.holder(p) && this.town.holder(p) !== call.app) ?? call.wants[0]
        const want = PLACES[part]
        let why = call.why
        if (answer === 'pode') {
            await this.door.hide()
            if (gen !== this.gen) return
            this.town.call(null)
            const b = this.town.plate(call.app)
            const holder = this.town.holder(part)
            if (this.bag.has(part)) {
                this.audio.whoosh()
                await this.bag.take(part, this.view.toScreen(b))
            } else {
                const a = holder ? this.town.usedAt(holder, part) : this.town.plate(part)
                const shot = this.framing(a, b)
                await this.view.zoomTo(shot.at, shot.zoom, TIMING.pan)
                if (gen !== this.gen) return
                this.audio.whoosh()
                if (holder) this.town.use(part, null)
                await this.town.fly(want.icon, a, b, 80)
            }
            if (gen !== this.gen) return
            this.audio.zap()
            if (holder) {
                this.town.dim(holder, true)
                this.town.nope(holder)
            } else this.town.happy(call.app)
            const s = this.view.toScreen(holder ? this.town.plate(holder) : b)
            void FX.sparks(this, s.x, s.y, { color: C.coral, count: 22, spread: 140, depth: DEPTH.door - 1 })
            FX.shakeCam(this, 'leve')
        } else if (answer === 'espera') {
            this.audio.tick()
            await this.door.hourglass()
            if (gen !== this.gen) return
            this.town.call(null)
            this.town.dim(call.app, true)
            this.audio.zap()
            await FX.wait(this, 380)
            if (gen !== this.gen) return
            await this.door.hide()
            if (gen !== this.gen) return
            if (call.answer === 'pode') why = `${SAY.wasFree(this.wantsText(call))} ${call.why}`
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
        this.banner.say(`${LABEL.oops} ${why}`)
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
        this.bag.visible(false)
        this.header.setHelpEnabled(false)
        this.release()
        this.runner.stop()
        const on = () => gen === this.gen && !this.skip
        const { w, h } = this.level.world
        try {
            this.camOnKid = false
            if (first) this.runner.visible(false)
            const zoom = Math.min(VIEW.w / w, (VIEW.h - VIEW.top) / h) * ZOOM.town
            await this.view.zoomTo({ x: w / 2, y: h / 2 - VIEW.top / 2 / zoom }, zoom, TIMING.zoom)
            if (!on()) return
            const intro = this.level.intro
            if (intro === 'full') {
                this.town.demo(true)
                this.audio.call()
                this.say(CAPTION.alone)
                await FX.wait(this, TIMING.caption + 400)
                if (!on()) return
                this.say(CAPTION.nobody, C.oops)
                this.level.houses.forEach(hs => {
                    if (PLACES[hs.id].family === 'peca') this.town.nope(hs.id)
                })
                this.audio.bump()
            } else if (intro === 'grow') {
                this.audio.wake()
                this.say(CAPTION.grow, C.accent)
                await FX.wait(this, TIMING.caption + 400)
                if (!on()) return
                this.town.demo(true)
                this.audio.call()
                this.say(CAPTION.two)
            } else {
                const use = this.level.using[0]
                if (use) {
                    await this.view.zoomTo(this.houseShot(use.app, ZOOM.call), ZOOM.call, TIMING.zoom)
                    if (!on()) return
                    this.town.happy(use.app)
                    this.audio.hum()
                }
                this.say(CAPTION.busy, C.wait)
                await FX.wait(this, TIMING.caption + 400)
                if (!on()) return
                this.say(CAPTION.once, C.accent)
            }
            await FX.wait(this, TIMING.caption + 400)
            if (!on()) return
            this.town.demo(false)
            this.unsay()
            await this.view.zoomTo(this.runner.at, 1, TIMING.zoom)
            if (!on()) return
            if (first) {
                await this.runner.drop()
                this.audio.wake()
            } else this.runner.cheer()
            if (intro === 'full') {
                this.say(CAPTION.you, C.accent)
                await FX.wait(this, TIMING.caption + 200)
                if (!on()) return
            }

            this.camOnKid = true
            this.say(CAPTION.hold)
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
            this.say(CAPTION.yourTurn, C.yes)
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
        this.unsay()
        this.town.demo(false)
        this.runner.visible(true)
        this.runner.stop()
        await this.view.zoomTo(this.runner.at, 1, TIMING.zoom / 2)
        this.camOnKid = true
        this.markers.visible(true)
        this.bag.visible(true)
        this.demoing = false
        this.skip = false
    }

    private async explain() {
        if (!this.isFree()) return
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
