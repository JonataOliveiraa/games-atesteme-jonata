import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { SCENERY } from '../data/files'
import { CAMERA, CATAPULT, DEMO, DEPTH, H, HEADER, OVERVIEW, W } from '../data/layout'
import { LEVELS, PLACE, POINTS, classOf, deviceAt, fits, guideKey, rightTargets, targetsOf } from '../data/levels'
import { C, CSS } from '../data/theme'
import { SAY, TEACH } from '../data/words'
import type { LevelDef, Mode, Round, TargetId } from '../types'

import { createAudio, type Audio } from './audio'
import { launch, preview, step, type BallState } from './ball'
import { showBanner } from './banner'
import { createCatapult, type Catapult } from './catapult'
import { tutorialDone } from '../../../../shared/tutorial/createTutorial'
import { spot, teach, union } from './guide'
import { createHud, type Hud } from './hud'
import { createMinimap, type Minimap } from './minimap'
import { createOrder, type Order } from './order'
import { createStage, type Stage } from './stage'
import { createTap, type Tap } from './tap'
import { createTargets, type Rect, type Targets } from './targets'
import { createWorld, type World } from './world'

const GAME_ID = 'catapulta-do-arquivo'
const ERROR_MS = 1700
const FINALE_MS = 1600
const MIN_PULL = 28
/** a física anda em passos fixos: o mesmo puxão cai no mesmo lugar em qualquer aparelho */
const FIXED_DT = 1 / 180
const MAX_FRAME = 0.05
const BALLOON_HALF = 300
/** px/s do arquivo dentro do túnel */
const TUNNEL_SPEED = 900

type Step = Parameters<typeof teach>[2][number]

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private round!: Round
    private roundIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private introduce = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private audio!: Audio
    private catapult!: Catapult
    private order!: Order
    private hud!: Hud
    private world?: World
    private stage?: Stage
    private targets?: Targets
    private minimap?: Minimap
    private banner?: Phaser.GameObjects.Container
    private flight?: BallState
    private acc = 0
    private down?: { x: number; y: number }
    private drag?: { kind: 'screen' | 'minimap'; x: number; scroll: number }
    private focus = false
    private focusTimer?: Phaser.Time.TimerEvent
    private tap!: Tap
    private sky!: Phaser.GameObjects.Image
    /** a interface fica numa câmera própria, que não acompanha o zoom do mapa */
    private uiCam!: Phaser.Cameras.Scene2D.Camera
    private routed = new WeakSet<Phaser.GameObjects.GameObject>()
    /** 0 = câmera normal; 1 = o mapa inteiro na tela, enquanto puxa e voa */
    private view = { k: 0, left: 0 }
    /** a jogada da demonstração: quando ela cai, ninguém julga, e a estreia continua */
    private demoDone?: () => void

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    private get cam() {
        return this.cameras.main
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.round = this.level.rounds[0]
        this.roundIndex = 0
        this.mode = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.world = undefined
        this.stage = undefined
        this.targets = undefined
        this.minimap = undefined
        this.banner = undefined
        this.flight = undefined
        this.down = undefined
        this.drag = undefined
        this.focus = false
        this.focusTimer = undefined
        this.demoDone = undefined
        this.routed = new WeakSet()
        this.view = { k: 0, left: 0 }
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.sky = this.add.image(W / 2, H / 2, SCENERY[this.level.scenery].sky).setDisplaySize(W, H).setDepth(DEPTH.sky).setScrollFactor(0)
        this.uiCam = this.cameras.add(0, 0, W, H)
        this.game.events.on(Phaser.Core.Events.PRE_RENDER, this.route, this)
        this.audio = createAudio()
        this.catapult = createCatapult(this)
        this.catapult.ball.setVisible(false)
        this.order = createOrder(this)
        this.tap = createTap(this)
        this.hud = createHud(this, {
            rounds: this.level.rounds.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

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
        this.introduce = !this.registry.get(key)
        this.registry.set(key, true)
        void this.startRound(0)
    }

    private shutdownScene() {
        this.gen++
        this.input.off('pointerdown', this.onDown, this)
        this.input.off('pointermove', this.onMove, this)
        this.input.off('pointerup', this.onUp, this)
        this.input.off('pointerupoutside', this.onUp, this)
        this.game.events.off(Phaser.Core.Events.PRE_RENDER, this.route, this)
        this.clearMap()
        this.banner?.destroy()
        this.hud?.destroy()
        this.order?.destroy()
        this.tap?.destroy()
        this.catapult?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number, deltaMs: number) {
        if (!this.targets || !this.world) return
        this.targets.update(time)
        this.minimap?.update(this.cam.scrollX)
        if (this.mode !== 'flight' || !this.flight) return
        this.acc += Math.min(deltaMs / 1000, MAX_FRAME)
        while (this.acc >= FIXED_DT) {
            this.acc -= FIXED_DT
            const event = step(this.flight, FIXED_DT, this.world, this.targets.clouds())
            this.catapult.ball.setPosition(this.flight.x, this.flight.y).setRotation(this.flight.spin)
            if (event.type === 'bounce') this.audio.thud()
            if (event.type === 'spring') {
                this.audio.spring()
                this.stage?.bounce(event.spring)
            }
            if (event.type === 'tunnel') return void this.travel(event.tunnel)
            if (event.type === 'device') return void this.capture(`d${event.device}`)
            if (event.type === 'cloud') return void this.capture(`c${event.cloud}`)
            if (event.type === 'miss') return void this.miss()
        }
    }

    // ───────────────────────────────────────────── câmera

    /** o que é fixo na tela vai para a câmera da interface; o resto, para a do mundo (o céu fica no mundo, atrás) */
    private route() {
        this.children.list.forEach(obj => {
            if (this.routed.has(obj)) return
            this.routed.add(obj)
            const fixed = (obj as unknown as { scrollFactorX?: number }).scrollFactorX === 0
            if (fixed && obj !== this.sky) this.cam.ignore(obj)
            else this.uiCam.ignore(obj)
        })
    }

    private fitZoom() {
        return Math.max(OVERVIEW.minZoom, Math.min(1, W / this.round.map.width))
    }

    private applyView() {
        const z = Phaser.Math.Linear(1, this.fitZoom(), this.view.k)
        const left = Phaser.Math.Linear(this.view.left, 0, this.view.k)
        this.cam.setZoom(z)
        this.cam.setScroll(left - (W - W / z) / 2, H / 2 - H / (2 * z))
        this.sky.setDisplaySize(W / z, H / z)
    }

    /** puxando e voando, a câmera se afasta até caber o mapa inteiro; depois volta perto de `x` */
    private overview(on: boolean, x = 0): Promise<void> {
        this.tweens.killTweensOf(this.view)
        this.tweens.killTweensOf(this.cam)
        this.cam.stopFollow()
        if (on) {
            if (this.view.k === 0) this.view.left = this.cam.scrollX
            this.cam.removeBounds()
        } else {
            this.view.left = Phaser.Math.Clamp(x - W / 2, 0, this.maxScroll())
        }
        const k = on ? 1 : 0
        const done = () => {
            if (on) return
            this.cam.setZoom(1)
            this.sky.setDisplaySize(W, H)
            this.cam.setBounds(0, 0, this.round.map.width, H)
            this.cam.setScroll(this.view.left, 0)
        }
        if (this.view.k === k) {
            this.applyView()
            done()
            return Promise.resolve()
        }
        return new Promise(resolve => {
            this.tweens.add({
                targets: this.view,
                k,
                duration: FX.ms(this, on ? OVERVIEW.outMs : OVERVIEW.inMs),
                ease: 'Sine.easeInOut',
                onUpdate: () => this.applyView(),
                onComplete: () => {
                    done()
                    resolve()
                },
                onStop: () => resolve(),
            })
        })
    }

    private toScreen(x: number, y: number) {
        const z = this.cam.zoom
        return { x: (x - this.cam.scrollX - (W - W / z) / 2) * z, y: (y - this.cam.scrollY - (H - H / z) / 2) * z }
    }

    private aimLine(at: { x: number; y: number }) {
        if (!this.world) return
        const v = this.catapult.velocity()
        const path = this.catapult.pullLength() >= MIN_PULL ? preview(this.world, at.x, at.y, v.vx, v.vy, this.targets?.clouds()) : []
        this.catapult.drawPreview(path, this.cam.zoom)
        this.audio.stretch(this.catapult.pullLength() / CATAPULT.maxPull)
    }

    private maxScroll() {
        return Math.max(0, this.round.map.width - W)
    }

    private panTo(scrollX: number, ms: number): Promise<void> {
        const target = Phaser.Math.Clamp(scrollX, 0, this.maxScroll())
        this.tweens.killTweensOf(this.cam)
        if (ms <= 0 || Math.abs(target - this.cam.scrollX) < 2) {
            this.cam.setScroll(target, 0)
            return Promise.resolve()
        }
        return new Promise(resolve => {
            this.tweens.add({
                targets: this.cam,
                scrollX: target,
                duration: FX.ms(this, ms),
                ease: 'Sine.easeInOut',
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
        })
    }

    private lookAt(x: number, ms = 600) {
        return this.panTo(x - W / 2, ms)
    }

    private onScreen(r: Rect): Rect {
        return { ...r, x: r.x - this.cam.scrollX }
    }

    /** arrastando o mapa, puxando ou voando: a faixa sobe e só o pedido fica, menor; o mapinha só fica no arrasto */
    private setFocus(on: boolean, delay = 0) {
        this.focusTimer?.remove()
        this.focusTimer = undefined
        if (delay > 0) {
            this.focusTimer = this.time.delayedCall(delay, () => this.setFocus(on))
            return
        }
        this.minimap?.setShown(!on || this.mode === 'pan')
        if (on === this.focus) return
        this.focus = on
        this.hud.setShown(!on)
        this.order.setCompact(on)
    }

    // ───────────────────────────────────────────── rodada

    private clearMap() {
        this.stage?.destroy()
        this.targets?.destroy()
        this.minimap?.destroy()
        this.stage = undefined
        this.targets = undefined
        this.minimap = undefined
    }

    private async startRound(index: number) {
        const gen = ++this.gen
        this.mode = 'intro'
        this.roundIndex = index
        this.round = this.level.rounds[index]
        this.hud.setRound(index)
        this.hud.setHelpEnabled(false)
        this.cam.stopFollow()
        this.setFocus(false)
        this.tweens.killTweensOf(this.view)
        this.view = { k: 0, left: 0 }
        this.cam.setZoom(1)
        this.sky.setDisplaySize(W, H)

        this.clearMap()
        const world = createWorld(this.round.map)
        this.world = world
        this.cam.setBounds(0, 0, this.round.map.width, 720)
        this.cam.setScroll(this.maxScroll(), 0)
        this.stage = createStage(this, this.round.map, world, this.level.scenery)
        this.targets = createTargets(this, this.round, world)
        this.minimap = createMinimap(this, this.round, world, this.level.scenery)
        this.catapult.ball.setVisible(false)

        this.mode = 'tour'
        await this.order.set(this.round)
        if (gen !== this.gen) return
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        await this.panTo(0, CAMERA.tourMs)
        if (gen !== this.gen) return
        await this.catapult.load(this.round.file)
        if (gen !== this.gen) return
        this.emitCheckpoint()

        if (this.introduce) {
            this.introduce = false
            await this.lessons(gen, guideKey(this.level.level), true)
            if (gen !== this.gen) return
        }
        this.aim()
    }

    private aim() {
        tutorialDone(this)
        this.mode = 'aim'
        this.hud.setHelpEnabled(true)
        this.order.pulse()
    }

    /**
     * Os balões da estreia de cada nível e do `?`, levando a câmera até cada coisa que eles citam.
     * N1: local × remoto, o jogo arrasta o mapa e faz uma jogada; N2: o remoto se abre em dois; N3: ler a situação.
     */
    private async lessons(gen: number, key: string, first: boolean) {
        const targets = this.targets
        if (!targets) return
        const all = targetsOf(this.round)
        const deviceOf = (want: 'local' | 'removivel') => all.find(t => t.startsWith('d') && PLACE[deviceAt(this.round, t)] === want)
        const local = deviceOf('local')
        const removable = deviceOf('removivel')
        const cloud = all.find(t => t.startsWith('c'))

        const one = async (s: Step) => {
            this.mode = 'guide'
            await teach(this, key, [s])
            return gen === this.gen
        }
        const side = (r: Rect) =>
            Phaser.Math.Clamp(r.x > W / 2 ? r.x - r.w / 2 - BALLOON_HALF : r.x + r.w / 2 + BALLOON_HALF, BALLOON_HALF, W - BALLOON_HALF)
        const show = async (id: TargetId | undefined, text: string, also?: TargetId) => {
            if (!id) return true
            const rect = also ? union(targets.rect(id), targets.rect(also)) : targets.rect(id)
            await this.lookAt(rect.x)
            if (gen !== this.gen) return false
            const r = this.onScreen(rect)
            return one({ text, ...spot(r), balloonX: side(r), balloonY: 300, buttonLabel: 'Próximo' })
        }
        const atOrder = (text: string) => one({ text, ...spot(this.order.rect()), balloonX: 640, balloonY: 330, buttonLabel: 'Próximo' })
        const go = async () => {
            await this.panTo(0, 700)
            if (gen !== this.gen) return
            await one({ text: TEACH.go, ...spot(this.catapult.rect()), balloonX: 700, balloonY: 300, buttonLabel: first ? 'Vamos!' : 'Continuar' })
        }

        const level = this.level.level
        if (level === 3) {
            if (!(await atOrder(TEACH.read))) return
            if (!(await atOrder(TEACH.where))) return
            return go()
        }
        if (!(await atOrder(TEACH.order(this.round.file, this.round.want)))) return
        if (level === 2) {
            if (!(await atOrder(TEACH.split))) return
            if (!(await show(removable, TEACH.removable))) return
            if (!(await show(cloud, TEACH.internet))) return
            if (!(await show(local, TEACH.local))) return
            return go()
        }
        if (!(await show(local, TEACH.local))) return
        const remote = removable ?? cloud
        if (!(await show(remote, remote ? TEACH.remote(deviceAt(this.round, remote), !!cloud && remote !== cloud) : '', remote === cloud ? undefined : cloud))) return
        if (first) {
            await this.panTo(0, 600)
            if (gen !== this.gen) return
            if (!(await one({ text: TEACH.look, shape: 'none', balloonX: 640, balloonY: 300, buttonLabel: 'Ver' }))) return
            await this.demoPan(gen)
            if (gen !== this.gen) return
            await this.demoShot(gen)
            if (gen !== this.gen) return
        }
        return go()
    }

    /** a bolinha arrasta a tela e o mapa anda junto, ida e volta */
    private async demoPan(gen: number) {
        this.mode = 'guide'
        const { fromX, toX, y, ms } = DEMO.pan
        const scroll = { x: 0 }
        const span = Math.min(this.maxScroll(), (fromX - toX) * 2.2)
        await this.tap.press(fromX, y)
        if (gen !== this.gen) return
        this.setFocus(true)
        void this.drive(scroll, { x: span }, ms, () => this.cam.setScroll(scroll.x, 0))
        await this.tap.moveTo(toX, y, ms)
        if (gen !== this.gen) return
        await this.tap.lift()
        this.setFocus(false, HEADER.showAfter)
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        await this.panTo(0, 900)
    }

    private drive(target: object, props: Record<string, number>, ms: number, onUpdate: () => void): Promise<void> {
        return new Promise(resolve => {
            this.tweens.add({
                targets: target,
                ...props,
                duration: FX.ms(this, ms),
                ease: 'Sine.easeInOut',
                onUpdate,
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
        })
    }

    /** o próprio jogo puxa e solta: o arquivo para no chão e volta, sem julgamento */
    private async demoShot(gen: number) {
        this.mode = 'guide'
        const ball = this.catapult.ball
        const start = this.toScreen(ball.x, ball.y)
        await this.tap.press(start.x, start.y)
        if (gen !== this.gen || !this.world) return
        this.setFocus(true)
        void this.overview(true)
        const pull = { t: 0 }
        await this.drive(pull, { t: 1 }, DEMO.pullMs, () => {
            const at = this.catapult.pull(DEMO.pull.x * pull.t, DEMO.pull.y * pull.t)
            const p = this.toScreen(at.x, at.y)
            this.tap.place(p.x, p.y)
            this.aimLine(at)
        })
        if (gen !== this.gen) return
        await FX.wait(this, DEMO.holdMs)
        if (gen !== this.gen) return
        void this.tap.lift()
        await new Promise<void>(resolve => {
            this.demoDone = resolve
            this.shoot()
        })
    }

    // ───────────────────────────────────────────── mirar, soltar e arrastar o mapa

    private onDown(pointer: Phaser.Input.Pointer) {
        if (this.mode !== 'aim') return
        if (this.minimap?.contains(pointer.x, pointer.y)) {
            this.mode = 'pan'
            this.drag = { kind: 'minimap', x: pointer.x, scroll: this.cam.scrollX }
            this.tweens.killTweensOf(this.cam)
            this.cam.setScroll(this.minimap.scrollFor(pointer.x), 0)
            return
        }
        if (pointer.y < HEADER.height) return
        const ball = this.catapult.ball
        const at = this.cam.getWorldPoint(pointer.x, pointer.y)
        if (Phaser.Math.Distance.Between(at.x, at.y, ball.x, ball.y) <= CATAPULT.grab) {
            this.mode = 'pull'
            this.down = { x: pointer.x, y: pointer.y }
            this.hud.setHelpEnabled(false)
            return
        }
        this.mode = 'pan'
        this.tweens.killTweensOf(this.cam)
        this.drag = { kind: 'screen', x: pointer.x, scroll: this.cam.scrollX }
    }

    private onMove(pointer: Phaser.Input.Pointer) {
        if (!pointer.isDown) return
        if (this.mode === 'pan' && this.drag) {
            const scroll =
                this.drag.kind === 'minimap'
                    ? (this.minimap?.scrollFor(pointer.x) ?? 0)
                    : this.drag.scroll - (pointer.x - this.drag.x) * CAMERA.panDrag
            this.cam.setScroll(Phaser.Math.Clamp(scroll, 0, this.maxScroll()), 0)
            if (Math.abs(pointer.x - this.drag.x) > CAMERA.slack) this.setFocus(true)
            return
        }
        if (this.mode !== 'pull' || !this.down || !this.world) return
        const at = this.catapult.pull(pointer.x - this.down.x, pointer.y - this.down.y)
        if (this.catapult.pullLength() > CAMERA.slack && !this.focus) {
            this.setFocus(true)
            void this.overview(true)
        }
        this.aimLine(at)
    }

    private onUp() {
        if (this.mode === 'pan') {
            this.drag = undefined
            this.mode = 'aim'
            if (this.focus) this.setFocus(false, HEADER.showAfter)
            return
        }
        if (this.mode !== 'pull') return
        this.down = undefined
        if (this.catapult.pullLength() < MIN_PULL) {
            this.catapult.drawPreview([])
            this.catapult.rest()
            this.aim()
            void this.overview(false, this.view.left + W / 2)
            if (this.focus) this.setFocus(false, HEADER.showAfter)
            return
        }
        this.shoot()
    }

    private shoot() {
        this.setFocus(true)
        const ball = this.catapult.ball
        const v = this.catapult.velocity()
        this.flight = launch(ball.x, ball.y, v.vx, v.vy)
        this.acc = 0
        this.catapult.fire()
        this.audio.twang()
        this.mode = 'flight'
        void this.overview(true)
    }

    // ───────────────────────────────────────────── onde caiu

    /** caiu na boca de um túnel: anda por baixo da terra e sai rolando do outro lado (não é alvo nem erro) */
    private async travel(i: number) {
        const world = this.world
        if (!world) return
        this.mode = 'tunnel'
        this.flight = undefined
        const gen = this.gen
        const ball = this.catapult.ball
        const path = world.tunnelPath(i)
        const lengths = [0]
        for (let k = 1; k < path.length; k++) lengths.push(lengths[k - 1] + Math.hypot(path[k].x - path[k - 1].x, path[k].y - path[k - 1].y))
        const total = lengths[lengths.length - 1] || 1
        const at = (d: number) => {
            let k = 1
            while (k < path.length - 1 && lengths[k] < d) k++
            const a = path[k - 1]
            const b = path[k]
            const t = (d - lengths[k - 1]) / Math.max(1, lengths[k] - lengths[k - 1])
            return { x: a.x + (b.x - a.x) * Phaser.Math.Clamp(t, 0, 1), y: a.y + (b.y - a.y) * Phaser.Math.Clamp(t, 0, 1) }
        }
        this.audio.plop()
        const run = { d: 0 }
        ball.setScale(0.8)
        await this.drive(run, { d: total }, (total / TUNNEL_SPEED) * 1000, () => {
            const p = at(run.d)
            ball.setPosition(p.x, p.y).setRotation(ball.rotation + 0.25)
        })
        if (gen !== this.gen) return
        ball.setScale(1)
        this.audio.spring()
        const out = world.exitLaunch(i)
        this.flight = launch(out.x, out.y, out.vx, out.vy)
        this.acc = 0
        this.mode = 'flight'
    }

    private async capture(where: TargetId) {
        if (this.demoDone) return this.miss()
        const gen = ++this.gen
        this.mode = 'judge'
        this.flight = undefined
        this.cam.stopFollow()
        this.hud.setHelpEnabled(false)
        this.setFocus(false)
        const ball = this.catapult.ball
        const p = this.targets?.pos(where) ?? { x: ball.x, y: ball.y }
        await this.overview(false, p.x)
        if (gen !== this.gen) return
        if (where.startsWith('c')) this.audio.ploc()
        else this.audio.plop()
        await FX.to(this, ball, { x: p.x, y: p.y, scale: 0.2, alpha: 0 }, { duration: 300, ease: 'Quad.easeIn' })
        if (gen !== this.gen) return
        ball.setVisible(false)
        if (fits(deviceAt(this.round, where), this.round.want)) return this.success(where, gen)
        return this.wrong(where, gen)
    }

    private async success(where: TargetId, gen: number) {
        const id = deviceAt(this.round, where)
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.audio.cheer()
        this.targets?.glow(where, C.yes)
        const p = this.targets?.pos(where)
        if (p) void FX.sparks(this, p.x, p.y, { color: C.star, count: 18, spread: 130, depth: DEPTH.fx })
        this.targets?.tag(where, SAY.is(id, classOf(id, this.level.level)), CSS.yes)
        await this.hud.celebrate(this.roundIndex)
        if (gen !== this.gen) return
        await FX.wait(this, 1000)
        if (gen !== this.gen) return
        if (this.roundIndex + 1 < this.level.rounds.length) {
            void this.startRound(this.roundIndex + 1)
            return
        }
        void this.endLevel()
    }

    private async wrong(where: TargetId, gen: number) {
        const id = deviceAt(this.round, where)
        this.mode = 'error'
        this.audio.fail()
        this.targets?.tag(where, SAY.is(id, classOf(id, this.level.level)), CSS.no)
        await this.targets?.shake(where)
        if (gen !== this.gen) return
        this.banner = showBanner(this, this.round.why ?? SAY.wanted(this.round.want), 0xffe1dc)
        rightTargets(this.round).forEach(t => this.targets?.glow(t, C.yes))
        await FX.wait(this, ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    /** não caiu em lugar nenhum: é mira, não é erro */
    private async miss() {
        const demo = this.demoDone
        const gen = demo ? this.gen : ++this.gen
        this.mode = 'judge'
        this.flight = undefined
        this.cam.stopFollow()
        this.setFocus(false)
        const ball = this.catapult.ball
        await this.overview(false, ball.x)
        if (gen !== this.gen) return
        this.audio.poof()
        void FX.sparks(this, ball.x, ball.y, { color: C.white, count: 12, spread: 70, depth: DEPTH.fx })
        void FX.popText(this, ball.x, Math.min(ball.y, 520) - 40, SAY.miss, { color: CSS.white, size: '34px' })
        await FX.to(this, ball, { alpha: 0, scale: 0.5 }, { duration: 220 })
        if (gen !== this.gen) return
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        await this.panTo(0, 800)
        if (gen !== this.gen) return
        await this.catapult.load(this.round.file)
        if (gen !== this.gen) return
        if (demo) {
            this.demoDone = undefined
            demo()
            return
        }
        this.aim()
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

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.mode !== 'aim') return
        const gen = this.gen
        this.mode = 'help'
        this.hud.setHelpEnabled(false)
        this.setFocus(false)
        await this.lessons(gen, `${guideKey(this.level.level)}-help`, false)
        if (gen !== this.gen) return
        this.aim()
    }

    private onShowTutorial() {
        void this.explain()
    }

    // ───────────────────────────────────────────── fim do nível

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
        this.emitCheckpoint()
        this.audio.win()
        await this.panTo(0, 600)
        if (gen !== this.gen) return
        void FX.confetti(this, { colors: [C.star, C.remote, C.local, C.mint, C.lilac] })
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
            title: `Nível ${this.level.level} completo!`,
            subtitle: this.level.title,
            message: this.level.message,
            stars: 3,
            progress: { total: this.level.rounds.length, current: this.level.rounds.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.rounds.length) * 100)),
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
