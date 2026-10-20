import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES, MISSING } from '../data/devices'
import { DEPTH, DEVICE, PC, SOCKET, SPOT, VIEW, ZOOM } from '../data/layout'
import { BASICS_KEY, LEVELS, POINTS, devicesOf, onTable, teachKey } from '../data/levels'
import { Net, type Hop, type Route } from '../data/route'
import { C, CSS, KIND_COLOR } from '../data/theme'
import { TIMING } from '../data/timing'
import { CAPTION, LABEL, SAY, TEACH } from '../data/words'
import type { DeviceId, Kind, LevelDef, MissionDef, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBoard, type Board } from './board'
import { createBubble, type Bubble } from './bubble'
import { createCaption, type Caption } from './caption'
import { createFlow, type Flow } from './flow'
import { createFocus, type Focus, type Spot } from './focus'
import { createGear, type Gear } from './gear'
import { createTouch, type Touch } from './touch'
import { createHeader, type Header } from './header'
import { createMarkers, type Markers } from './markers'
import { createView, type View } from './view'

const GAME_ID = 'cabo-certo'

/** Quanto o dedo anda antes de um toque virar arraste. */
const DRAG_START = 14

const KINDS: Kind[] = ['entrada', 'saida', 'armazenamento', 'memoria']

const HOME: Vec = { x: PC.x, y: PC.y - 10 }

/** Parado tanto tempo depois do arraste (ou das setas), o cabeçalho volta. */
const ASIDE_BACK = 200

type Press =
    | { kind: 'pan'; start: Vec; last: Vec; moved: boolean }
    | { kind: 'device'; id: DeviceId; start: Vec; last: Vec }
    | { kind: 'carry'; id: DeviceId; last: Vec }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private mission = 0
    private press: Press | null = null
    private hooked = new Set<DeviceId>()
    private hinted: DeviceId | null = null
    private demoing = false
    private skip = false
    private idleSince = 0
    /** Quando as setas andaram o mapa pela última vez (0 = paradas). */
    private keysAt = 0
    private asideBack?: Phaser.Time.TimerEvent

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private net!: Net
    private board!: Board
    private gear!: Gear
    private flow!: Flow
    private markers!: Markers
    private header!: Header
    private bubble!: Bubble
    private banner!: Banner
    private caption!: Caption
    private focus!: Focus
    private touch!: Touch
    private keys?: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>

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
        this.mission = 0
        this.press = null
        this.hooked = new Set()
        this.hinted = null
        this.demoing = false
        this.skip = false
        this.idleSince = 0
        this.keysAt = 0
        this.asideBack = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        // Tomada própria de aparelho (o monitor que leva o alto-falante) é coisa dos níveis altos.
        const defs = devicesOf(this.level).map(id => (this.level.nested ? DEVICES[id] : { ...DEVICES[id], sockets: undefined }))
        this.view = createView(this, HOME)
        this.audio = createAudio()
        this.net = new Net(this.level.pc, defs)
        this.board = createBoard(this, this.view, this.net, this.level.plates)
        this.gear = createGear(this, this.view, defs)
        this.flow = createFlow(this, this.view)
        this.markers = createMarkers(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.missions.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.caption = createCaption(this)
        this.focus = createFocus(this, this.view, this.header, this.caption)
        this.touch = createTouch(this, this.view)
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
            }) as GameScene['keys']

        this.input.on('pointerdown', this.onDown, this)
        this.input.on('pointermove', this.onMove, this)
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

        this.introduce = !this.registry.get(BASICS_KEY)
        this.registry.set(BASICS_KEY, true)
        void this.openLevel()
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.press = null
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointermove', this.onMove, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.touch?.destroy()
        this.focus?.destroy()
        this.caption?.destroy()
        this.banner?.destroy()
        this.bubble?.destroy()
        this.header?.destroy()
        this.markers?.destroy()
        this.flow?.destroy()
        this.gear?.destroy()
        this.board?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(time: number, deltaMs: number) {
        if (!this.gear) return
        const delta = Math.min(deltaMs, 50)
        if (this.state === 'play' && this.keys) {
            const k = this.keys
            const step = VIEW.keySpeed * delta
            const dx = (k.left.isDown || k.a.isDown ? 1 : 0) - (k.right.isDown || k.d.isDown ? 1 : 0)
            const dy = (k.up.isDown || k.w.isDown ? 1 : 0) - (k.down.isDown || k.s.isDown ? 1 : 0)
            if (dx || dy) {
                this.view.pan(dx * step, dy * step)
                this.stepAside()
                this.keysAt = time
            }
        }
        // As setas pararam: o cabeçalho volta (o dedo no mapa cuida de si no `onUp`).
        if (this.keysAt && time - this.keysAt > ASIDE_BACK) {
            this.keysAt = 0
            if (!this.press) this.comeBack()
        }
        if (this.state === 'drag' && this.press?.kind === 'carry') this.edgePan(delta)
        if (this.state === 'flow') this.follow(delta)
        if (this.state === 'play' && !this.hinted && !this.press && time - this.idleSince > TIMING.idle) {
            this.idleSince = time
            void this.nudge()
        }
        const loose = this.gear
            .ids()
            .filter(id => this.gear.visible(id) && this.current().needs.includes(id))
            .filter(id => id === this.hinted || (!this.net.socketOf(id) && this.press?.kind !== 'carry'))
            .map(id => ({ id, at: this.gear.at(id) }))
        this.markers.update(this.state === 'intro' ? [] : loose)
        this.spotHint()
        // Por último: a vinheta mede a câmera já no lugar deste quadro.
        this.focus.update(delta)
    }

    /**
     * Tudo ligado, o jogo espera o toque num aparelho só: o resto da mesa
     * escurece em volta dele, com o cabeçalho no lugar (é ele que diz o que
     * tocar). Mexeu em outra coisa (arrastar), a luz volta enquanto mexe.
     */
    private spotHint() {
        const id = this.state === 'play' && !this.press ? this.hinted : null
        if (id && !this.focus.on) this.focus.aim(this.gear.at(id), this.spotOf(id))
        this.focus.glow(Boolean(id))
    }

    /** A câmera vai atrás da bolinha, macia (o foco segue a mesma bolinha). */
    private follow(delta: number) {
        const lead = this.flow.lead()
        if (!lead || this.view.busy) return
        const center = this.view.center()
        const k = (1 - Math.exp(-delta / 340)) * this.view.zoom
        this.view.pan((center.x - lead.x) * k, (center.y - lead.y) * k)
    }

    /** Arrastando o cabo perto da borda, o mapa anda sozinho. */
    private edgePan(delta: number) {
        if (this.press?.kind !== 'carry') return
        const p = this.press.last
        const r = this.view.rect()
        const speed = VIEW.edgeSpeed * delta
        const push = (v: number, lo: number, hi: number) =>
            v < lo + VIEW.edge ? ((lo + VIEW.edge - v) / VIEW.edge) * speed : v > hi - VIEW.edge ? -((v - (hi - VIEW.edge)) / VIEW.edge) * speed : 0
        const dx = push(p.x, r.x, r.x + r.w)
        const dy = push(p.y, r.y, r.y + r.h)
        if (!dx && !dy) return
        this.view.pan(dx, dy)
        this.holdCarry(this.press.id, p)
    }

    // ───────────────────────────────────────────── o dedo

    private onDown(pointer: Phaser.Input.Pointer) {
        // Só um toque no mapa pula: o toque no "?" que abriu a demonstração
        // chega aqui logo depois dela começar, e não pode encerrá-la.
        if (this.demoing) {
            if (this.view.onMap(pointer.x, pointer.y)) this.skip = true
            return
        }
        this.idleSince = this.time.now
        if (!this.hinted) this.touch.stop()
        if (this.state !== 'play' || this.press) return
        if (!this.view.onMap(pointer.x, pointer.y)) return
        const here = { x: pointer.x, y: pointer.y }
        const at = this.view.toWorld(here.x, here.y)
        const plug = this.gear.plugUnder(at)
        if (plug) {
            this.startCarry(plug, here)
            return
        }
        const device = this.gear.deviceUnder(at)
        if (device) {
            this.press = { kind: 'device', id: device, start: here, last: here }
            return
        }
        this.press = { kind: 'pan', start: here, last: here, moved: false }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
        const press = this.press
        if (!press || !pointer.isDown) return
        const here = { x: pointer.x, y: pointer.y }
        if (press.kind === 'pan') {
            this.view.pan(here.x - press.last.x, here.y - press.last.y)
            press.last = here
            // Um toque que não virou arraste não esconde nada.
            if (!press.moved && Phaser.Math.Distance.BetweenPoints(here, press.start) >= DRAG_START) {
                press.moved = true
                this.stepAside()
            }
            return
        }
        if (press.kind === 'device') {
            if (Phaser.Math.Distance.BetweenPoints(here, press.start) < DRAG_START) return
            // Sem cabo, arrastar o aparelho é levá-lo (e tirá-lo da tomada, se estiver nela).
            // Com cabo, arrastar o aparelho solto puxa o cabo; o ligado anda o mapa.
            if (this.gear.def(press.id).dock || !this.net.socketOf(press.id)) this.startCarry(press.id, here, press.start)
            else {
                this.press = { kind: 'pan', start: press.start, last: press.last, moved: true }
                this.stepAside()
            }
            return
        }
        press.last = here
        this.holdCarry(press.id, here)
    }

    private onUp() {
        const press = this.press
        this.press = null
        if (!press) return
        if (press.kind === 'device') void this.tap(press.id)
        if (press.kind === 'carry') void this.drop(press.id)
        if (press.kind === 'pan' && press.moved) this.comeBack()
    }

    // ───────────────────────────────────────────── o cabeçalho sai do caminho

    /** O dedo (ou as setas) começou a mexer no mapa: o cabeçalho sai de cima dele. */
    private stepAside() {
        this.asideBack?.remove()
        this.asideBack = undefined
        this.focus.aside(true)
    }

    /** Parou de mexer: o cabeçalho volta logo depois, sem piscar entre um arraste e outro. */
    private comeBack() {
        this.asideBack?.remove()
        this.asideBack = this.time.delayedCall(ASIDE_BACK, () => {
            this.asideBack = undefined
            if (!this.press) this.focus.aside(false)
        })
    }

    // ───────────────────────────────────────────── o cabo (ou o aparelho sem cabo)

    /**
     * A criança pegou o plugue, ou o aparelho que não tem cabo. `from` é onde o
     * dedo encostou (no aparelho sem cabo, o ponto por onde ele é segurado).
     */
    private startCarry(id: DeviceId, here: Vec, from: Vec = here) {
        if (this.net.socketOf(id)) {
            this.net.unplug(id)
            this.updatePower()
            this.audio.pop()
            this.checkReady()
        }
        this.state = 'drag'
        this.press = { kind: 'carry', id, last: here }
        this.bubble.hide()
        this.stepAside()
        this.board.dragging(this.net)
        this.audio.grab()
        this.gear.lift(id, this.view.toWorld(from.x, from.y))
        this.holdCarry(id, here)
    }

    private holdCarry(id: DeviceId, screen: Vec) {
        this.gear.hold(id, this.view.toWorld(screen.x, screen.y))
        this.board.hover(this.nearest(id, this.gear.plugAt(id))?.socket ?? null)
    }

    /** A tomada mais perto do plugue: livre primeiro, ocupada só se não houver livre. */
    private nearest(id: DeviceId, at: Vec): { socket: string; busy: boolean } | null {
        let free: { socket: string; d: number } | null = null
        let busy: { socket: string; d: number } | null = null
        this.net.sockets.forEach(info => {
            if (info.owner === id || !this.net.open(info.id)) return
            if (info.owner !== 'pc' && !this.nestOn()) return
            const d = Phaser.Math.Distance.BetweenPoints(at, this.board.socketAt(info.id))
            if (d > SOCKET.snap) return
            const taken = this.net.occupant(info.id)
            if (taken && taken !== id) {
                if (!busy || d < busy.d) busy = { socket: info.id, d }
            } else if (!free || d < free.d) free = { socket: info.id, d }
        })
        const pick = (free ?? busy) as { socket: string; d: number } | null
        return pick ? { socket: pick.socket, busy: !free } : null
    }

    private async drop(id: DeviceId) {
        const gen = this.gen
        this.comeBack()
        this.board.dragging(null)
        this.board.hover(null)
        const hit = this.nearest(id, this.gear.plugAt(id))
        if (!hit) {
            this.state = 'play'
            await this.gear.retract(id)
            return
        }
        if (hit.busy) {
            this.state = 'play'
            this.audio.blip()
            void this.gear.retract(id)
            this.sayBusy(id, hit.socket)
            return
        }
        if (!this.net.fits(DEVICES[id], hit.socket)) {
            await this.wrong(gen, id, hit.socket)
            return
        }
        await this.connect(gen, id, hit.socket)
    }

    private sayBusy(id: DeviceId, socket: string) {
        const kind = DEVICES[id].kind
        const other = this.ownSocket(kind, id)
        if (other && other.owner !== 'pc' && this.net.kindOf(socket) === kind) {
            this.board.point(other.id)
            void this.board.ping(other.id)
            this.think(TEACH.nest(DEVICES[other.owner]), this.board.socketAt(socket), 2600)
            return
        }
        this.think(SAY.busy, this.board.socketAt(socket), TIMING.hint)
    }

    private async connect(gen: number, id: DeviceId, socket: string) {
        this.state = 'flow'
        const at = this.board.socketAt(socket)
        await this.gear.snap(id, at)
        if (gen !== this.gen) return
        this.net.plug(id, socket)
        this.audio.click()
        const s = this.view.toScreen(at)
        const kind = this.net.kindOf(socket) ?? 'entrada'
        void FX.sparks(this, s.x, s.y, { color: KIND_COLOR[kind], count: 14, spread: 90, depth: DEPTH.bubble - 1 })
        this.updatePower()
        if (!this.hooked.has(id)) {
            this.hooked.add(id)
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        }
        if (await this.reveal(gen)) return
        this.state = 'play'
        this.checkReady()
    }

    private updatePower() {
        this.gear.ids().forEach(id => {
            this.gear.setPowered(id, this.net.powered(id))
            this.gear.invite(id, !this.net.socketOf(id))
        })
        this.board.refresh(this.net, this.nestOn())
        this.board.point(null)
    }

    // ───────────────────────────────────────────── o aparelho funcionando

    private async tap(id: DeviceId) {
        if (this.state !== 'play') return
        const def = DEVICES[id]
        const at = this.gear.at(id)
        const above = { x: at.x, y: at.y - (def.size ?? 170) * 0.42 }
        if (!this.net.socketOf(id)) {
            this.gear.nope(id)
            this.audio.blip()
            this.think(SAY.noCable, above, TIMING.hint)
            return
        }
        if (!this.net.powered(id)) {
            const owner = this.net.sockets.get(this.net.socketOf(id) ?? '')?.owner
            this.gear.nope(id)
            this.think(SAY.noPower(owner && owner !== 'pc' ? DEVICES[owner] : null), above, TIMING.hint)
            return
        }
        const full = this.net.route(id)
        const route = full && { ...full, down: full.down.filter(d => this.current().needs.includes(d.to)) }
        if (!route) {
            this.gear.press(id)
            this.audio.blip()
            return
        }
        await this.run(id, route)
    }

    /**
     * O aparelho funciona. A câmera chega perto dele, o cabeçalho sai e a
     * vinheta acende em volta: dali em diante o círculo claro e a câmera vão
     * atrás da bolinha, param no processador enquanto ele pensa e chegam com
     * ela no destino. No fim tudo volta para onde a criança estava.
     */
    private async run(id: DeviceId, route: Route) {
        const gen = this.gen
        const mission = this.current()
        const back = this.view.center()
        this.state = 'flow'
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        this.touch.stop()
        this.hinted = null
        this.gear.hint(null)
        const source = this.gear.at(id)
        await FX.all(this.focusIn(source, this.spotOf(id)), this.view.zoomTo(source, Math.max(ZOOM.flow, this.view.zoom), TIMING.flowZoom))
        if (gen !== this.gen) return
        this.gear.send(id)
        this.sendSound(id)

        this.focus.track(() => this.flow.lead(), SPOT.packet)
        await this.flow.travel(this.upPath(id, route.up), route.payload)
        if (gen !== this.gen) return
        const chip = this.board.chip()
        this.focus.aim(chip, SPOT.chip)
        void this.view.panTo(chip, TIMING.pan)
        this.board.think(true)
        this.board.blink()
        this.audio.think()
        await FX.wait(this, TIMING.think)
        if (gen !== this.gen) return
        this.board.think(false)

        const goal = mission.goal
        const reached = route.down.some(d => d.to === goal.at)
        const missing = !route.down.length || (route.payload === goal.payload && !reached)
        if (missing) this.think(MISSING[goal.at] ?? MISSING.monitor ?? '', chip, 2600)
        if (route.down.length) this.focus.track(() => this.flow.lead(), SPOT.packet)
        await Promise.all(
            route.down.map(async d => {
                await this.flow.travel(this.downPath(d.hops, d.to), route.payload)
                if (gen !== this.gen) return
                // Outra bolinha ainda correndo (a música passa pelo monitor): o foco fica nela.
                if (!this.flow.lead()) {
                    const to = this.gear.at(d.to)
                    this.focus.aim(to, this.spotOf(d.to))
                    void this.view.panTo(to, TIMING.pan)
                }
                this.takeSound(d.to)
                await this.gear.take(d.to, route.payload)
            }),
        )
        if (gen !== this.gen) return
        if (route.payload === goal.payload && reached) {
            await this.finishMission(gen, id)
            return
        }
        await FX.wait(this, missing ? TIMING.hint : TIMING.beat)
        if (gen !== this.gen) return
        await FX.all(this.focusOut(), this.view.zoomTo(back, 1, TIMING.zoom / 2))
        if (gen !== this.gen) return
        this.play()
    }

    private center(id: DeviceId): Vec {
        return this.gear.at(id)
    }

    /** Do aparelho até o processador, cabo por cabo. */
    private upPath(source: DeviceId, hops: Hop[]): Vec[] {
        const pts: Vec[] = [this.center(source)]
        hops.forEach((hop, i) => {
            pts.push(...this.gear.cable(hop.device))
            const owner = this.net.sockets.get(hop.socket)?.owner
            if (i < hops.length - 1 && owner && owner !== 'pc') pts.push(this.center(owner))
        })
        pts.push(this.board.chip())
        return pts
    }

    /** Do processador até o destino: sai pela tomada e desce cada cabo ao contrário. */
    private downPath(hops: Hop[], to: DeviceId): Vec[] {
        const pts: Vec[] = [this.board.chip()]
        hops.forEach(hop => {
            pts.push(...[...this.gear.cable(hop.device)].reverse())
            pts.push(this.center(hop.device))
        })
        if (!hops.length) pts.push(this.center(to))
        return pts
    }

    private sendSound(id: DeviceId) {
        if (id === 'teclado') this.audio.type()
        else if (id === 'camera') this.audio.shutter()
        else if (id === 'microfone') this.audio.voice()
        else this.audio.blip()
    }

    private takeSound(id: DeviceId) {
        if (id === 'pendrive') this.audio.gulp()
        else if (id === 'altofalante') this.audio.melody()
        else this.audio.pop()
    }

    // ───────────────────────────────────────────── o foco

    /** O jogo vai MOSTRAR: o cabeçalho sai e a vinheta acende em volta de `at`. */
    private focusIn(at?: Vec, spot?: Spot): Promise<void> {
        this.markers.visible(false)
        if (at) this.focus.aim(at, spot)
        return this.focus.enter()
    }

    /** O jogo volta a PEDIR: o cabeçalho volta e a mesa aparece inteira. */
    private async focusOut() {
        await this.focus.exit()
        if (!this.focus.on) this.markers.visible(true)
    }

    /** O círculo claro que cabe o aparelho inteiro, com o nome embaixo. */
    private spotOf(id: DeviceId): number {
        return (this.gear.def(id).size ?? DEVICE.size) / 2 + SPOT.device
    }

    /** O círculo (ou a elipse) que cabe dois pontos e o que está em volta deles. */
    private spotAround(a: Vec, b: Vec, pad: number): { at: Vec; spot: Spot } {
        return {
            at: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
            spot: { rx: Math.abs(a.x - b.x) / 2 + pad, ry: Math.abs(a.y - b.y) / 2 + pad },
        }
    }

    // ───────────────────────────────────────────── os pedidos

    private current(): MissionDef {
        return this.level.missions[Math.min(this.mission, this.level.missions.length - 1)]
    }

    private ready(m: MissionDef) {
        return m.needs.every(id => this.net.powered(id))
    }

    private checkReady() {
        if (this.state !== 'play') return
        const m = this.current()
        this.hinted = this.ready(m) ? m.use : null
        this.gear.hint(this.hinted)
        if (this.hinted) {
            this.header.ask(LABEL.tapNow(DEVICES[m.use]), true)
            this.touch.tapLoop(this.gear.at(m.use))
        } else {
            this.header.ask(m.ask)
            this.touch.stop()
        }
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.gear.ids().forEach(id => void this.gear.hide(id))
        await this.setTable(gen, 0)
        if (gen !== this.gen) return
        if (this.introduce) {
            await this.demo(gen)
            if (gen !== this.gen) return
        }
        await this.teachMemory(gen)
        if (gen !== this.gen) return
        await this.teachCarry(gen)
        if (gen !== this.gen) return
        this.play()
    }

    /** A novidade aparece com demonstração só na primeira vez da sessão. */
    private firstTime(topic: string): boolean {
        const key = teachKey(topic)
        if (this.registry.get(key)) return false
        this.registry.set(key, true)
        return true
    }

    /**
     * A estreia da MEMÓRIA, ao lado do ARMAZENAMENTO: a bolinha entra na
     * tomada da memória e some ("só agora"); entra no baú e fica ("para sempre").
     */
    private async teachMemory(gen: number) {
        const m = this.current()
        if (m.teach !== 'memoria' || !this.firstTime(m.teach)) return
        this.demoing = true
        this.skip = false
        this.header.setHelpEnabled(false)
        this.touch.stop()
        const on = () => gen === this.gen && !this.skip
        const chip = this.board.chip()
        try {
            for (const kind of ['memoria', 'armazenamento'] as Kind[]) {
                const id = this.board.pcSocket(kind)
                if (!id) continue
                const s = this.board.socketAt(id)
                const away = this.awayFrom(kind, s)
                const frame = { x: Phaser.Math.Linear(s.x, chip.x, 0.35), y: Phaser.Math.Linear(s.y, chip.y, 0.35) }
                await FX.all(this.focusIn(s, SPOT.socket), this.view.zoomTo(frame, ZOOM.bottom, TIMING.zoom))
                if (!on()) return
                this.caption.say(CAPTION[kind], KIND_COLOR[kind])
                void this.board.ping(id)
                this.audio.blip()
                this.focus.track(() => this.flow.lead(), SPOT.packet)
                await this.flow.travel([chip, s, away], 'texto', KIND_COLOR[kind])
                if (!on()) return
                this.focus.aim(away, SPOT.socket)
                const dot = this.view.world(this.add.circle(away.x, away.y, 18, KIND_COLOR[kind], 1).setDepth(DEPTH.fx))
                dot.setStrokeStyle(5, C.white, 1)
                if (kind === 'memoria') {
                    this.caption.say(CAPTION.forget, KIND_COLOR[kind])
                    await FX.wait(this, 500)
                    await FX.to(this, dot, { alpha: 0, scale: 0.2 }, { duration: 700 })
                } else {
                    this.audio.gulp()
                    this.caption.say(CAPTION.keep, KIND_COLOR[kind])
                    await FX.to(this, dot, { scale: 1.3 }, { duration: 260, yoyo: true })
                    await FX.wait(this, 900)
                }
                dot.destroy()
                if (!on()) return
                await FX.wait(this, 350)
                if (!on()) return
            }
            this.audio.wake()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.all(this.focusOut(), this.view.zoomTo(HOME, 1, TIMING.zoom), FX.wait(this, TIMING.caption))
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    /**
     * A estreia de um aparelho que dá tomada (o HUB) ou de uma cadeia de dois
     * cabos (o cartão na câmera, que está no hub): a bolinha percorre o caminho
     * entre o processador e a tomada nova.
     */
    private async teachNest(gen: number, owner: DeviceId, socket: string, kind: Kind) {
        const down = [...this.downPath(this.net.chain(owner).reverse(), owner), this.board.socketAt(socket)]
        const path = kind === 'entrada' ? [...down].reverse() : down
        const xs = path.map(p => p.x)
        const ys = path.map(p => p.y)
        const w = Math.max(...xs) - Math.min(...xs)
        const h = Math.max(...ys) - Math.min(...ys)
        const frame = { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }
        const r = this.view.rect()
        const zoom = Phaser.Math.Clamp(Math.min(r.w / (w + 360), r.h / (h + 300)), 0.8, ZOOM.socket)
        this.focus.aim(frame, { rx: w / 2 + 120, ry: h / 2 + 120 })
        await FX.all(this.focusIn(), this.view.zoomTo(frame, zoom, TIMING.zoom))
        if (gen !== this.gen) return
        this.caption.say(owner === 'hub' ? CAPTION.hub : CAPTION.chain, KIND_COLOR[kind])
        this.audio.blip()
        if (owner === 'hub') {
            for (const s of DEVICES.hub.sockets ?? []) {
                void this.board.ping(s.id)
                await FX.wait(this, 180)
            }
        }
        this.focus.track(() => this.flow.lead(), SPOT.packet)
        await this.flow.travel(path, 'texto', KIND_COLOR[kind])
        if (gen !== this.gen) return
        this.focus.aim(path[path.length - 1], SPOT.socket)
        await FX.wait(this, 500)
    }

    /**
     * A demonstração, quase sem texto: zoom no processador, zoom em cada tomada
     * com a informação de luz entrando, saindo e indo para o baú, e a mãozinha
     * puxando um cabo até a frente do computador ("qual tomada?"). Ela não
     * encaixa o plugue: a escolha fica para a criança. Um toque pula tudo.
     */
    private async demo(gen: number) {
        this.demoing = true
        this.skip = false
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        this.touch.stop()
        this.gear.hint(null)
        const on = () => gen === this.gen && !this.skip
        const chip = this.board.chip()
        try {
            await FX.all(this.focusIn(chip, SPOT.chip), this.view.zoomTo(chip, ZOOM.chip, TIMING.zoom))
            if (!on()) return
            this.caption.say(CAPTION.chip)
            this.board.think(true)
            this.audio.think()
            await FX.wait(this, TIMING.caption)
            this.board.think(false)
            if (!on()) return

            for (const kind of KINDS) {
                const id = this.board.pcSocket(kind)
                if (!id) continue
                const s = this.board.socketAt(id)
                const away = this.awayFrom(kind, s)
                // O enquadramento fica perto da tomada, mas ainda pega o processador.
                const frame = { x: Phaser.Math.Linear(s.x, chip.x, 0.35), y: Phaser.Math.Linear(s.y, chip.y, 0.35) }
                this.focus.aim(s, SPOT.socket)
                await this.view.zoomTo(frame, kind === 'entrada' || kind === 'saida' ? ZOOM.socket : ZOOM.bottom, TIMING.zoom)
                if (!on()) return
                this.caption.say(CAPTION[kind], KIND_COLOR[kind])
                this.audio.blip()
                void this.board.ping(id)
                this.focus.track(() => this.flow.lead(), SPOT.packet)
                await this.flow.travel(kind === 'entrada' ? [away, s, chip] : [chip, s, away], 'texto', KIND_COLOR[kind])
                this.focus.aim(kind === 'entrada' ? chip : away, SPOT.socket)
                if (kind === 'armazenamento') this.audio.gulp()
                await FX.wait(this, 450)
                if (!on()) return
            }

            // Agora o gesto: o foco vai para o plugue e acompanha a mãozinha puxando.
            const id = this.current().needs.find(d => this.gear.visible(d) && !this.net.socketOf(d))
            if (id) this.focus.aim(this.gear.grabAt(id), SPOT.socket)
            await this.view.zoomTo(HOME, 1, TIMING.zoom)
            if (!on() || !id) return
            if (!(await this.showCarry(id, on))) return
            // "Sua vez!" chega junto com a luz: o cabeçalho volta e a mesa aparece inteira.
            this.audio.wake()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.all(this.focusOut(), this.view.zoomTo(HOME, 1, TIMING.zoom / 2), FX.wait(this, TIMING.caption))
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    /**
     * O gesto, feito pela mãozinha: puxa o cabo (ou pega o aparelho sem cabo)
     * até a frente do computador, as tomadas pulam ("qual tomada?") e ele volta.
     * Nunca encaixa: a escolha fica para a criança. Devolve `false` se foi pulado.
     */
    private async showCarry(id: DeviceId, on: () => boolean): Promise<boolean> {
        const dock = Boolean(this.gear.def(id).dock)
        this.caption.say(dock ? CAPTION.carry : CAPTION.drag)
        this.audio.grab()
        const from = this.gear.grabAt(id)
        this.gear.lift(id, from)
        this.focus.track(() => this.gear.grabAt(id), dock ? this.spotOf(id) : SPOT.socket)
        await this.touch.drag(from, this.frontOf(from), TIMING.demoDrag, at => this.gear.hold(id, at))
        if (!on()) return false
        // "Qual tomada?": o círculo abre e pega o computador inteiro, com as tomadas e o que está na mão.
        this.caption.say(CAPTION.which)
        this.focus.aim({ x: PC.x, y: PC.y + 40 }, SPOT.pc)
        for (const kind of KINDS) {
            const sid = this.board.pcSocket(kind)
            if (!sid) continue
            this.audio.blip()
            await this.board.ping(sid)
            if (!on()) return false
        }
        await FX.wait(this, 400)
        if (!on()) return false
        this.touch.stop()
        await this.gear.retract(id)
        return on()
    }

    /**
     * A primeira vez que um aparelho sem cabo (pendrive, memória, cartão) está
     * na mesa, a mãozinha mostra que é ele inteiro que se leva até a tomada.
     */
    private async teachCarry(gen: number) {
        const id = this.current().needs.find(d => this.gear.def(d).dock && this.gear.visible(d) && !this.net.socketOf(d))
        if (!id || !this.firstTime('carry')) return
        this.demoing = true
        this.skip = false
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        this.touch.stop()
        this.gear.hint(null)
        const on = () => gen === this.gen && !this.skip
        try {
            await FX.all(this.focusIn(this.gear.at(id), this.spotOf(id)), this.view.zoomTo(HOME, 1, TIMING.zoom / 2))
            if (!on()) return
            if (!(await this.showCarry(id, on))) return
            this.audio.wake()
            this.caption.say(CAPTION.yourTurn, C.yes)
            await FX.all(this.focusOut(), this.view.zoomTo(HOME, 1, TIMING.zoom / 2), FX.wait(this, TIMING.caption))
        } finally {
            if (gen === this.gen) await this.endDemo()
        }
    }

    private async endDemo() {
        this.touch.stop()
        this.board.think(false)
        this.flow.clear()
        this.gear.ids().forEach(id => {
            if (this.gear.visible(id) && !this.net.socketOf(id)) void this.gear.retract(id)
        })
        await FX.all(this.caption.fade(), this.focusOut(), this.view.zoomTo(HOME, 1, TIMING.zoom / 2))
        this.updatePower()
        this.demoing = false
        this.skip = false
    }

    private awayFrom(kind: Kind, s: Vec): Vec {
        if (kind === 'entrada') return { x: s.x - 200, y: s.y }
        if (kind === 'saida') return { x: s.x + 200, y: s.y }
        return { x: s.x, y: s.y + 85 }
    }

    /** Muda o aparelho de lugar, e as tomadas dele vão junto. */
    private placeDevice(id: DeviceId, at: Vec) {
        this.gear.place(id, at)
        this.board.moveOwner(id, at)
    }

    /** Em frente ao computador, do lado de onde o plugue vem, sem escolher tomada. */
    private frontOf(from: Vec): Vec {
        return { x: PC.x + (from.x < PC.x ? -240 : 240), y: PC.y + 90 }
    }

    /** As tomadas dos aparelhos só valem no pedido do aninhamento. */
    private nestOn(): boolean {
        return this.level.nested && Boolean(this.current().nested)
    }

    /** Uma tomada livre e acesa desta família num aparelho (não no computador). */
    private ownSocket(kind: Kind, except: DeviceId) {
        if (!this.nestOn()) return undefined
        return [...this.net.sockets.values()].find(
            s => s.owner !== 'pc' && s.owner !== except && s.kind === kind && this.net.open(s.id) && !this.net.occupant(s.id),
        )
    }

    /**
     * O aninhamento chegando: com os primeiros aparelhos ligados, a câmera vai até
     * a tomada própria do monitor, ela pula, e o aparelho que vai nela entra na mesa.
     * Devolve `true` quando assumiu a vez (e já devolveu o jogo à criança).
     */
    private async reveal(gen: number): Promise<boolean> {
        const m = this.current()
        const waiting = (m.later ?? []).filter(id => !this.gear.visible(id))
        if (!waiting.length) return false
        if (!m.needs.filter(id => !m.later?.includes(id)).every(id => this.net.powered(id))) return false
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.touch.stop()
        let last: Vec = HOME
        for (const id of waiting) {
            const own = this.ownSocket(DEVICES[id].kind, id)
            if (own && own.owner !== 'pc') {
                if (m.teach && this.firstTime(m.teach)) {
                    await this.teachNest(gen, own.owner, own.id, own.kind)
                    if (gen !== this.gen) return true
                }
                const at = this.board.socketAt(own.id)
                await FX.all(this.focusIn(at, SPOT.socket), this.view.zoomTo(at, ZOOM.socket, TIMING.zoom))
                if (gen !== this.gen) return true
                this.caption.say(CAPTION.nest(DEVICES[own.owner]), KIND_COLOR[own.kind])
                this.audio.blip()
                await this.board.ping(own.id)
                await this.board.ping(own.id)
                if (gen !== this.gen) return true
            }
            // Primeiro a câmera abre o lugar onde o aparelho vai entrar (perto da tomada
            // dele), e só então ele pula para dentro do círculo claro.
            const place = m.place[id]
            if (place) this.placeDevice(id, place)
            const device = this.gear.at(id)
            const socket = own ? this.board.socketAt(own.id) : device
            const pad = this.spotOf(id)
            const around = this.spotAround(socket, device, pad)
            last = around.at
            const r = this.view.rect()
            const dx = Math.abs(socket.x - device.x) + pad * 2
            const dy = Math.abs(socket.y - device.y) + pad * 2
            // Embaixo da legenda, que fica no alto da tela.
            const zoom = Phaser.Math.Clamp(Math.min(r.w / (dx + 120), (r.h - 120) / (dy + 100)), 0.9, ZOOM.socket)
            this.focus.aim(around.at, around.spot)
            await FX.all(this.focusIn(), this.view.zoomTo({ x: last.x, y: last.y - 50 / zoom }, zoom, TIMING.zoom))
            if (gen !== this.gen) return true
            this.audio.wake()
            await this.gear.show(id)
            if (gen !== this.gen) return true
            this.updatePower()
            await FX.wait(this, TIMING.caption)
            if (gen !== this.gen) return true
        }
        await FX.all(this.caption.fade(), this.focusOut(), this.view.zoomTo(last, 1, TIMING.zoom))
        if (gen !== this.gen) return true
        this.play()
        return true
    }

    /** A criança parou: a mãozinha mostra de novo o gesto de puxar o cabo (ou de levar o aparelho sem cabo). */
    private async nudge() {
        const id = this.current().needs.find(d => this.gear.visible(d) && !this.net.socketOf(d))
        if (!id) return
        const from = this.gear.grabAt(id)
        // No aninhamento, o aparelho que entrou depois vai para o lado do dono
        // da tomada (o monitor). A mãozinha para no caminho, sem encaixar.
        const own = this.current().later?.includes(id) ? this.ownSocket(DEVICES[id].kind, id) : undefined
        const to = own ? Phaser.Math.LinearXY(new Phaser.Math.Vector2(from.x, from.y), new Phaser.Math.Vector2(this.board.socketAt(own.id)), 0.6) : this.frontOf(from)
        await this.touch.drag(from, { x: to.x, y: to.y }, TIMING.demoDrag)
        await FX.wait(this, 300)
        if (this.state === 'play' && !this.hinted) this.touch.stop()
    }

    /**
     * Monta a mesa do pedido: com `reset`, os cabos se soltam e os aparelhos do
     * pedido anterior saem; os deste pedido aparecem no lugar deles.
     */
    private async setTable(gen: number, index: number) {
        this.mission = index
        const m = this.current()
        this.header.setPhase(index)
        this.header.ask(m.ask)
        const jobs: Promise<void>[] = []
        if (this.level.reset) {
            this.gear.ids().forEach(id => {
                if (this.net.socketOf(id)) {
                    this.net.unplug(id)
                    jobs.push(this.gear.retract(id))
                }
            })
            this.updatePower()
        }
        await FX.all(...jobs, this.view.panTo(HOME, TIMING.pan))
        if (gen !== this.gen) return
        const table = onTable(m)
        const leaving = this.gear.ids().filter(id => this.gear.visible(id) && !table.includes(id) && (this.level.reset || !this.net.socketOf(id)))
        await FX.all(...leaving.map(id => this.gear.hide(id)))
        if (gen !== this.gen) return
        for (const id of table) {
            const at = m.place[id]
            if (m.later?.includes(id)) {
                if (this.gear.visible(id)) await this.gear.hide(id)
                continue
            }
            if (!this.gear.visible(id)) {
                if (at) this.placeDevice(id, at)
                this.audio.pop()
                await this.gear.show(id)
            } else if (at && !this.net.socketOf(id) && (this.gear.at(id).x !== at.x || this.gear.at(id).y !== at.y)) {
                await this.gear.hide(id)
                this.placeDevice(id, at)
                await this.gear.show(id)
            }
            if (gen !== this.gen) return
        }
        this.updatePower()
    }

    private play() {
        this.state = 'play'
        this.idleSince = this.time.now
        this.header.setHelpEnabled(true)
        this.checkReady()
    }

    /**
     * Pedido cumprido. Ainda no foco, o destino solta faíscas e o resumo do
     * caminho acende uma peça por palavra; depois a luz volta, a bolinha do
     * cabeçalho fica verde e a mesa troca.
     */
    private async finishMission(gen: number, source: DeviceId) {
        const m = this.current()
        this.state = 'flow'
        this.hinted = null
        this.gear.hint(null)
        this.done += 1
        this.audio.good()
        this.emitCheckpoint()
        const goal = this.view.toScreen(this.gear.at(m.goal.at))
        void FX.sparks(this, goal.x, goal.y, { color: C.spark, count: 20, spread: 160, depth: DEPTH.bubble - 1 })
        await FX.wait(this, TIMING.done)
        if (gen !== this.gen) return
        await this.recap(gen, m, source)
        if (gen !== this.gen) return
        // O cabeçalho volta sem o "toque no..." deste pedido: o próximo pedido entra limpo.
        this.header.ask('')
        await FX.all(this.caption.fade(), this.focusOut(), this.view.zoomTo(HOME, 1, TIMING.zoom))
        if (gen !== this.gen) return
        await this.header.celebrate(this.mission)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        if (this.mission + 1 >= this.level.missions.length) {
            void this.endLevel()
            return
        }
        this.state = 'intro'
        await this.setTable(gen, this.mission + 1)
        if (gen !== this.gen) return
        await this.teachMemory(gen)
        if (gen !== this.gen) return
        await this.teachCarry(gen)
        if (gen !== this.gen) return
        this.play()
    }

    /**
     * O resumo do caminho em letras grandes, uma palavra por vez, e cada
     * palavra acende a peça que ela nomeia: ENTRA (o aparelho tocado) →
     * PROCESSA (o processador) → MOSTRA (o destino). No fim o círculo abre e
     * pega o caminho inteiro.
     */
    private async recap(gen: number, m: MissionDef, source: DeviceId) {
        const parts = m.done.split(' → ')
        const stops = parts.map((part, i) => this.stopOf(part, i === 0 ? source : i === parts.length - 1 ? m.goal.at : null))
        const left = Math.min(...stops.map(s => s.at.x - s.r))
        const right = Math.max(...stops.map(s => s.at.x + s.r))
        const top = Math.min(...stops.map(s => s.at.y - s.r))
        const bottom = Math.max(...stops.map(s => s.at.y + s.r))
        const all = { x: (left + right) / 2, y: (top + bottom) / 2 }
        const r = this.view.rect()
        // Embaixo da legenda: o caminho inteiro na tela, sem passar do zoom da bolinha.
        const zoom = Phaser.Math.Clamp(Math.min(r.w / (right - left + 80), (r.h - 120) / (bottom - top + 60)), ZOOM.recapMin, ZOOM.recapMax)
        await this.view.zoomTo({ x: all.x, y: all.y - 50 / zoom }, zoom, TIMING.zoom)
        if (gen !== this.gen) return
        for (let i = 0; i < stops.length; i++) {
            this.focus.aim(stops[i].at, stops[i].r)
            this.caption.say(parts.slice(0, i + 1).join(' → '), C.yes, i > 0)
            stops[i].poke()
            this.audio.step(i)
            await FX.wait(this, TIMING.step)
            if (gen !== this.gen) return
        }
        this.focus.aim(all, { rx: (right - left) / 2 + 60, ry: (bottom - top) / 2 + 60 })
        await FX.wait(this, TIMING.recap)
    }

    /** A peça que uma palavra do resumo nomeia: o processador, o aparelho dado ou o de mesmo nome. */
    private stopOf(part: string, device: DeviceId | null): { at: Vec; r: number; poke: () => void } {
        const named = device ?? this.gear.ids().find(id => this.gear.visible(id) && DEVICES[id].name === part) ?? null
        if (part === CAPTION.chip || !named) {
            return {
                at: this.board.chip(),
                r: SPOT.chip,
                poke: () => {
                    this.board.blink()
                    this.board.think(true)
                    this.time.delayedCall(FX.ms(this, 360), () => this.board.think(false))
                },
            }
        }
        return { at: this.gear.at(named), r: this.spotOf(named), poke: () => this.gear.press(named) }
    }

    private think(text: string, worldAt: Vec, ms: number) {
        const s = this.view.toScreen(worldAt)
        const r = this.view.rect()
        this.bubble.think(text, { x: s.x, y: Phaser.Math.Clamp(s.y, r.y + 120, r.y + r.h) }, ms)
    }

    // ───────────────────────────────────────────── erro

    private async wrong(gen: number, id: DeviceId, socket: string) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        this.touch.stop()
        this.hinted = null
        this.gear.hint(null)
        const at = this.board.socketAt(socket)
        await this.gear.snap(id, at)
        if (gen !== this.gen) return
        // O choque na hora do encaixe; depois a câmera chega perto e a luz cai em volta.
        this.audio.zap()
        const s = this.view.toScreen(at)
        void FX.sparks(this, s.x, s.y, { color: C.coral, count: 22, spread: 120, depth: DEPTH.bubble - 1 })
        FX.shakeCam(this, 'leve')
        await FX.all(this.focusIn(at, SPOT.socket), this.view.zoomTo(at, ZOOM.error, TIMING.focus))
        if (gen !== this.gen) return
        this.gear.nope(id)
        // O plugue (ou o aparelho sem cabo) volta, e a frase fala do aparelho: o foco vai junto até ele.
        this.focus.track(() => this.gear.grabAt(id), this.gear.def(id).dock ? this.spotOf(id) : SPOT.socket)
        await this.gear.retract(id)
        if (gen !== this.gen) return
        const device = this.gear.at(id)
        const around = this.spotAround(device, this.gear.plugAt(id), this.spotOf(id))
        this.focus.aim(around.at, around.spot)
        void this.view.panTo(around.at, TIMING.pan)
        this.banner.say(`${LABEL.oops} ${DEVICES[id].why}`)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    /** O "?" passa a demonstração de novo. */
    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.touch.stop()
        await this.demo(gen)
        if (gen !== this.gen) return
        this.play()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
        this.header.ask('')
        this.touch.stop()
        this.audio.win()
        void FX.confetti(this, { colors: [C.entrada, C.saida, C.armazenamento, C.accentYellow, C.accentBlue] })
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
            progress: { total: this.level.missions.length, current: this.level.missions.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.missions.length) * 100)),
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
