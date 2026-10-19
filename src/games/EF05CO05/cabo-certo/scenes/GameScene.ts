import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { DEVICES, MISSING } from '../data/devices'
import { DEPTH, PC, SOCKET, VIEW } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { Net, type Hop, type Route } from '../data/route'
import { C, CSS, KIND_COLOR } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, LABEL, SAY, TEACH } from '../data/words'
import type { DeviceId, LevelDef, MissionDef, State, Vec } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBoard, type Board } from './board'
import { createBubble, type Bubble } from './bubble'
import { createFlow, type Flow } from './flow'
import { createGear, type Gear } from './gear'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createMarkers, type Markers } from './markers'
import { createView, type View } from './view'

const GAME_ID = 'cabo-certo'

/** Quanto o dedo anda antes de um toque virar arraste. */
const DRAG_START = 14

/** Margem da tela dentro da qual a bolinha pode andar sem a câmera ir atrás. */
const FOLLOW_PAD = 150

type Press =
    | { kind: 'pan'; last: Vec }
    | { kind: 'device'; id: DeviceId; start: Vec; last: Vec }
    | { kind: 'cable'; id: DeviceId; last: Vec }

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
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        const defs = this.level.devices.map(id => DEVICES[id])
        this.view = createView(this, { x: PC.x, y: PC.y - 10 })
        this.audio = createAudio()
        this.net = new Net(this.level.pc, defs)
        this.board = createBoard(this, this.view, this.net)
        this.gear = createGear(this, this.view, defs, this.level.asleep)
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

        const key = guideKey(this.level.level)
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
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

    update(_time: number, deltaMs: number) {
        if (!this.gear) return
        const delta = Math.min(deltaMs, 50)
        if (this.state === 'play' && this.keys) {
            const k = this.keys
            const step = VIEW.keySpeed * delta
            const dx = (k.left.isDown || k.a.isDown ? 1 : 0) - (k.right.isDown || k.d.isDown ? 1 : 0)
            const dy = (k.up.isDown || k.w.isDown ? 1 : 0) - (k.down.isDown || k.s.isDown ? 1 : 0)
            if (dx || dy) this.view.pan(dx * step, dy * step)
        }
        if (this.state === 'drag' && this.press?.kind === 'cable') this.edgePan(delta)
        if (this.state === 'flow') this.follow(delta)
        const loose = this.gear
            .ids()
            .filter(id => id === this.hinted || (this.gear.awake(id) && !this.net.socketOf(id) && this.press?.kind !== 'cable'))
            .map(id => ({ id, at: DEVICES[id].at }))
        this.markers.update(this.state === 'intro' ? [] : loose)
    }

    /** A bolinha saiu da vista: a câmera vai atrás, devagar. */
    private follow(delta: number) {
        const lead = this.flow.lead()
        if (!lead || this.view.inView(lead, FOLLOW_PAD)) return
        const center = this.view.center()
        const k = 1 - Math.exp(-delta / 260)
        this.view.pan((center.x - lead.x) * k, (center.y - lead.y) * k)
    }

    /** Arrastando o cabo perto da borda, o mapa anda sozinho. */
    private edgePan(delta: number) {
        if (this.press?.kind !== 'cable') return
        const p = this.press.last
        const speed = VIEW.edgeSpeed * delta
        const push = (v: number, lo: number, hi: number) =>
            v < lo + VIEW.edge ? ((lo + VIEW.edge - v) / VIEW.edge) * speed : v > hi - VIEW.edge ? -((v - (hi - VIEW.edge)) / VIEW.edge) * speed : 0
        const dx = push(p.x, VIEW.x, VIEW.x + VIEW.w)
        const dy = push(p.y, VIEW.y, VIEW.y + VIEW.h)
        if (!dx && !dy) return
        this.view.pan(dx, dy)
        this.holdCable(this.press.id, p)
    }

    // ───────────────────────────────────────────── o dedo

    private onDown(pointer: Phaser.Input.Pointer) {
        if (this.state !== 'play' || this.press) return
        if (!this.view.onMap(pointer.x, pointer.y)) return
        const here = { x: pointer.x, y: pointer.y }
        const at = this.view.toWorld(here.x, here.y)
        const plug = this.gear.plugUnder(at)
        if (plug) {
            this.startCable(plug, here)
            return
        }
        const device = this.gear.deviceUnder(at)
        if (device) {
            this.press = { kind: 'device', id: device, start: here, last: here }
            return
        }
        this.press = { kind: 'pan', last: here }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
        const press = this.press
        if (!press || !pointer.isDown) return
        const here = { x: pointer.x, y: pointer.y }
        if (press.kind === 'pan') {
            this.view.pan(here.x - press.last.x, here.y - press.last.y)
            press.last = here
            return
        }
        if (press.kind === 'device') {
            if (Phaser.Math.Distance.BetweenPoints(here, press.start) < DRAG_START) return
            if (this.gear.awake(press.id) && !this.net.socketOf(press.id)) this.startCable(press.id, here)
            else this.press = { kind: 'pan', last: press.last }
            return
        }
        press.last = here
        this.holdCable(press.id, here)
    }

    private onUp() {
        const press = this.press
        this.press = null
        if (!press) return
        if (press.kind === 'device') void this.tap(press.id)
        if (press.kind === 'cable') void this.drop(press.id)
    }

    // ───────────────────────────────────────────── o cabo

    private startCable(id: DeviceId, here: Vec) {
        if (this.net.socketOf(id)) {
            this.net.unplug(id)
            this.updatePower()
            this.audio.pop()
            this.checkReady()
        }
        this.state = 'drag'
        this.press = { kind: 'cable', id, last: here }
        this.bubble.hide()
        this.board.dragging(this.net)
        this.audio.grab()
        this.holdCable(id, here)
    }

    private holdCable(id: DeviceId, screen: Vec) {
        const at = this.view.toWorld(screen.x, screen.y)
        this.gear.hold(id, at)
        this.board.hover(this.nearest(id, at)?.socket ?? null)
    }

    /** A tomada mais perto do plugue: livre primeiro, ocupada só se não houver livre. */
    private nearest(id: DeviceId, at: Vec): { socket: string; busy: boolean } | null {
        let free: { socket: string; d: number } | null = null
        let busy: { socket: string; d: number } | null = null
        this.net.sockets.forEach(info => {
            if (info.owner === id || !this.net.open(info.id)) return
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
        const other = [...this.net.sockets.values()].find(
            s => s.owner !== 'pc' && s.owner !== id && s.kind === kind && this.net.open(s.id) && !this.net.occupant(s.id),
        )
        if (other && this.net.kindOf(socket) === kind) {
            this.board.point(other.id)
            this.think(TEACH.nest, this.board.socketAt(socket), 3600)
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
        this.state = 'play'
        this.checkReady()
    }

    private updatePower() {
        this.gear.ids().forEach(id => this.gear.setPowered(id, this.net.powered(id)))
        this.board.refresh(this.net)
        this.board.point(null)
    }

    // ───────────────────────────────────────────── o aparelho funcionando

    private async tap(id: DeviceId) {
        if (this.state !== 'play') return
        const def = DEVICES[id]
        const above = { x: def.at.x, y: def.at.y - (def.size ?? 170) * 0.42 }
        if (!this.gear.awake(id)) {
            this.gear.nope(id)
            return
        }
        if (!this.net.socketOf(id)) {
            this.gear.nope(id)
            this.audio.blip()
            this.think(SAY.noCable, above, TIMING.hint)
            return
        }
        if (!this.net.powered(id)) {
            const owner = this.net.sockets.get(this.net.socketOf(id) ?? '')?.owner
            this.gear.nope(id)
            this.think(SAY.noPower(owner && owner !== 'pc' ? DEVICES[owner].name : 'computador'), above, TIMING.hint)
            return
        }
        const route = this.net.route(id)
        if (!route) {
            this.gear.press(id)
            this.audio.blip()
            return
        }
        await this.run(id, route)
    }

    private async run(id: DeviceId, route: Route) {
        const gen = this.gen
        const mission = this.current()
        this.state = 'flow'
        this.bubble.hide()
        this.hinted = null
        this.gear.hint(null)
        this.gear.send(id)
        this.sendSound(id)

        await this.flow.travel(this.upPath(id, route.up), route.payload)
        if (gen !== this.gen) return
        this.board.think(true)
        this.board.blink()
        this.audio.think()
        await FX.wait(this, TIMING.think)
        if (gen !== this.gen) return
        this.board.think(false)

        const goal = mission.goal
        const reached = route.down.some(d => d.to === goal.at)
        if (!route.down.length || (route.payload === goal.payload && !reached)) {
            this.think(MISSING[route.payload], this.board.chip(), 2600)
        }
        await Promise.all(
            route.down.map(async d => {
                await this.flow.travel(this.downPath(d.hops, d.to), route.payload)
                if (gen !== this.gen) return
                this.takeSound(d.to)
                await this.gear.take(d.to, route.payload)
            }),
        )
        if (gen !== this.gen) return
        if (route.payload === goal.payload && reached) {
            await this.finishMission(gen)
            return
        }
        this.state = 'play'
        this.checkReady()
    }

    private center(id: DeviceId): Vec {
        return DEVICES[id].at
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
        if (this.hinted) this.header.ask(LABEL.tapNow(DEVICES[m.use].name), true)
        else this.header.ask(m.ask)
    }

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.header.setPhase(0)
        this.header.ask(this.level.missions[0].ask)
        if (this.introduce) {
            await this.intro(gen)
            if (gen !== this.gen) return
        }
        await this.startMission(gen, 0)
    }

    private async intro(gen: number) {
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.bubble.say(SAY.hello, this.chipTail(), 'Próximo')
        if (gen !== this.gen) return
        const r = (rect: { x: number; y: number; w: number; h: number }) => spot(this.view.toScreenRect(rect))
        const teclado = this.view.toScreen(this.gear.plugAt('teclado'))
        const pc = this.view.toScreen({ x: PC.x, y: PC.y })
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.pc, ...r(this.board.pcRect()), balloonY: 190, buttonLabel: 'Próximo' },
            { text: TEACH.entrada, ...r(this.board.groupRect('entrada')), balloonY: 190, buttonLabel: 'Próximo' },
            { text: TEACH.saida, ...r(this.board.groupRect('saida')), balloonY: 190, buttonLabel: 'Próximo' },
            { text: TEACH.armazenamento, ...r(this.board.groupRect('armazenamento')), balloonY: 200, buttonLabel: 'Próximo' },
            {
                text: TEACH.drag,
                shape: 'none',
                balloonY: 190,
                buttonLabel: 'Próximo',
                pointer: { fromX: teclado.x, fromY: teclado.y, toX: pc.x - 60, toY: pc.y },
            },
            { text: TEACH.pan, shape: 'none', balloonY: 190, buttonLabel: 'Vamos!' },
        ])
    }

    private async startMission(gen: number, index: number) {
        this.mission = index
        const m = this.current()
        this.header.setPhase(index)
        this.header.ask(m.ask)
        for (const id of m.wake ?? []) {
            if (this.gear.awake(id)) continue
            this.state = 'intro'
            await this.view.panTo(this.center(id), TIMING.pan)
            if (gen !== this.gen) return
            this.audio.wake()
            await this.gear.wake(id)
            if (gen !== this.gen) return
            const def = DEVICES[id]
            this.think(SAY.welcome, { x: def.at.x, y: def.at.y - (def.size ?? 170) * 0.45 }, TIMING.hint)
            await FX.wait(this, TIMING.hint)
            if (gen !== this.gen) return
        }
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.checkReady()
    }

    private async finishMission(gen: number) {
        const m = this.current()
        this.state = 'flow'
        this.hinted = null
        this.gear.hint(null)
        this.done += 1
        this.audio.good()
        this.emitCheckpoint()
        const chip = this.view.toScreen(this.board.chip())
        void FX.sparks(this, chip.x, chip.y, { color: C.spark, count: 20, spread: 160, depth: DEPTH.bubble - 1 })
        await this.header.celebrate(this.mission)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.done)
        if (gen !== this.gen) return
        await this.view.panTo({ x: PC.x, y: PC.y - 10 }, TIMING.pan)
        if (gen !== this.gen) return
        await this.bubble.say(m.done, this.chipTail(), 'Próximo')
        if (gen !== this.gen) return
        if (this.mission + 1 >= this.level.missions.length) {
            void this.endLevel()
            return
        }
        await this.startMission(gen, this.mission + 1)
    }

    private chipTail(): Vec {
        const s = this.view.toScreen(this.board.chip())
        return { x: s.x, y: s.y - 70 }
    }

    private think(text: string, worldAt: Vec, ms: number) {
        const s = this.view.toScreen(worldAt)
        this.bubble.think(text, { x: s.x, y: Phaser.Math.Clamp(s.y, VIEW.y + 120, VIEW.y + VIEW.h) }, ms)
    }

    // ───────────────────────────────────────────── erro

    private async wrong(gen: number, id: DeviceId, socket: string) {
        this.state = 'error'
        this.header.setHelpEnabled(false)
        this.hinted = null
        this.gear.hint(null)
        const at = this.board.socketAt(socket)
        await this.gear.snap(id, at)
        if (gen !== this.gen) return
        this.audio.zap()
        const s = this.view.toScreen(at)
        void FX.sparks(this, s.x, s.y, { color: C.coral, count: 22, spread: 120, depth: DEPTH.bubble - 1 })
        FX.shakeCam(this, 'leve')
        this.gear.nope(id)
        await this.gear.retract(id)
        if (gen !== this.gen) return
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

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.header.setHelpEnabled(false)
        this.bubble.hide()
        await this.view.panTo({ x: PC.x, y: PC.y - 10 }, TIMING.pan)
        if (gen !== this.gen) return
        const r = (rect: { x: number; y: number; w: number; h: number }) => spot(this.view.toScreenRect(rect))
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP[0], ...r(this.board.groupRect('entrada')), balloonY: 190, buttonLabel: 'Próximo' },
            { text: HELP[1], ...r(this.board.groupRect('saida')), balloonY: 190, buttonLabel: 'Próximo' },
            { text: HELP[2], ...r(this.board.groupRect('armazenamento')), balloonY: 200, buttonLabel: 'Próximo' },
            { text: HELP[3], shape: 'none', balloonY: 190, buttonLabel: 'Continuar' },
        ])
        if (gen !== this.gen) return
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.checkReady()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'finale'
        this.header.setHelpEnabled(false)
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
