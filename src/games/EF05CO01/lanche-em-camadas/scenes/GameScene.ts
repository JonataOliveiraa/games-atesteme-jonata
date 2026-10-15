import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CHEF_CELL, CUSTOMER_COL, HELPER_CELL, KITCHEN_KEY, UI_CELL, UI_SHEET } from '../data/files'
import { INGREDIENTS } from '../data/ingredients'
import { COUNTER, DEPTH, H, HELPER, LANES, TRAY, W } from '../data/layout'
import { LEVELS, POINTS, guideKey } from '../data/levels'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { HELP, LABEL, TEACH } from '../data/words'
import type { IngredientId, LevelDef, OrderDef, State, Vec } from '../types'

import { fit } from './art'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { createControls, type Controls } from './controls'
import { createDrops, type Drop, type Drops } from './drops'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createHelper, type Helper } from './helper'
import { createChef, createCustomer, type Chef, type Customer } from './people'
import { createRecipe, type Recipe } from './recipe'
import { createView, type View } from './view'

const GAME_ID = 'lanche-em-camadas'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private orderIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private vx = 0
    private auto: { x: number; resolve: () => void } | null = null
    private stepAcc = 0
    private spawnAcc = 0
    private sinceExpected = 1
    private lastLane = -1

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private backdrop!: Phaser.GameObjects.Image
    private chef!: Chef
    private customer!: Customer
    private helper!: Helper
    private drops!: Drops
    private header!: Header
    private recipe!: Recipe
    private controls!: Controls
    private bubble!: Bubble
    private banner!: Banner
    private flyers: Phaser.GameObjects.GameObject[] = []

    private unsubPlatform?: () => void

    private get order(): OrderDef {
        return this.level.orders[this.orderIndex]
    }

    private get expected(): IngredientId | null {
        return this.order.recipe[this.helper.count] ?? null
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.orderIndex = 0
        this.state = 'intro'
        this.introduce = false
        this.vx = 0
        this.auto = null
        this.stepAcc = 0
        this.spawnAcc = 0
        this.sinceExpected = 1
        this.lastLane = -1
        this.flyers = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, W, 1, H / 2)
        this.audio = createAudio()
        this.backdrop = this.view.world(this.add.image(0, 0, KITCHEN_KEY).setOrigin(0, 0).setDisplaySize(W, H).setDepth(DEPTH.backdrop))
        this.chef = createChef(this, this.view)
        this.customer = createCustomer(this, this.view)
        this.helper = createHelper(this, this.view)
        this.drops = createDrops(this, this.view)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.orders.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.recipe = createRecipe(this)
        this.controls = createControls(this)
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.controlsOff()

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
        this.auto = null
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.flyers.forEach(f => f.destroy())
        this.flyers = []
        this.banner?.destroy()
        this.bubble?.destroy()
        this.controls?.destroy()
        this.recipe?.destroy()
        this.header?.destroy()
        this.drops?.destroy()
        this.helper?.destroy()
        this.customer?.destroy()
        this.chef?.destroy()
        this.backdrop?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(_time: number, deltaMs: number) {
        if (!this.helper) return
        const delta = Math.min(deltaMs, 50)
        const dt = delta / 1000
        if (this.auto) {
            const dx = this.auto.x - this.helper.x
            if (Math.abs(dx) < 4) {
                const done = this.auto.resolve
                this.auto = null
                this.vx = 0
                this.controls.hold(0)
                done()
            } else this.vx = Math.sign(dx) * Math.min(HELPER.speed * 0.7, Math.abs(dx) * 5 + 40)
        } else {
            const want = this.state === 'play' ? this.controls.dir() * HELPER.speed : 0
            const a = HELPER.accel * dt
            this.vx = this.vx < want ? Math.min(want, this.vx + a) : Math.max(want, this.vx - a)
        }
        const before = this.helper.x
        const next = Phaser.Math.Clamp(before + this.vx * dt, HELPER.minX, HELPER.maxX)
        if (next === before) this.vx = 0
        this.helper.move(next - before, delta)
        this.stepAcc += Math.abs(next - before)
        if (this.stepAcc > 70) {
            this.stepAcc = 0
            this.audio.step()
        }
        this.view.update(delta, W / 2)
        if (this.state === 'play' || this.state === 'demo') {
            const { caught, missed } = this.drops.update(delta, { x: this.helper.x, top: this.helper.top(), half: TRAY.catchHalf })
            caught.forEach(d => this.onCatch(d))
            missed.forEach(d => {
                this.audio.miss()
                void this.drops.miss(d)
            })
        }
        if (this.state === 'play') this.spawn(delta)
    }

    private spawn(delta: number) {
        this.spawnAcc += delta
        if (this.spawnAcc < this.level.spawnMs) return
        const air = this.drops.list()
        if (air.length >= this.level.maxAir) return
        const want = this.expected
        if (!want) return
        this.spawnAcc = 0
        const wanted = air.some(d => d.id === want)
        let id: IngredientId
        if (!wanted && (this.sinceExpected >= 1 || Math.random() < 0.5)) {
            id = want
            this.sinceExpected = 0
        } else {
            const others = this.level.pool.filter(p => p !== want && !air.some(d => d.id === p))
            id = Phaser.Utils.Array.GetRandom(others.length ? others : this.level.pool.filter(p => p !== want))
            this.sinceExpected += 1
        }
        this.toss(id, this.pickLane(id === want), this.order.fall)
    }

    private pickLane(wanted: boolean) {
        const busy = new Set(this.drops.list().map(d => d.lane))
        const all = LANES.map((_, i) => i)
        let lanes = all.filter(l => !busy.has(l) && l !== this.lastLane)
        if (!lanes.length) lanes = all.filter(l => !busy.has(l))
        if (!wanted) {
            const far = lanes.filter(l => Math.abs(LANES[l] - this.helper.x) >= 260)
            if (far.length) lanes = far
        }
        const lane = Phaser.Utils.Array.GetRandom(lanes.length ? lanes : all)
        this.lastLane = lane
        return lane
    }

    private toss(id: IngredientId, lane: number, speed: number) {
        this.chef.toss()
        this.audio.toss()
        return this.drops.spawn(id, lane, speed)
    }

    private onCatch(drop: Drop) {
        const want = this.expected
        const index = this.helper.count
        const fromX = drop.img.x
        this.drops.take(drop)
        void this.helper.add(drop.id, fromX)
        if (drop.id === want) {
            this.audio.catch()
            void this.recipe.mark(index)
            if (this.helper.count >= this.order.recipe.length) void this.serve(this.gen)
            return
        }
        if (want) void this.jam(this.gen, want, index)
    }

    // ───────────────────────────────────────────── estados

    private controlsOff() {
        this.controls.setWalk(false)
        this.header.setHelpEnabled(false)
    }

    private ui(on: boolean) {
        this.header.visible(on)
        this.recipe.visible(on)
        this.controls.visible(on)
    }

    private play() {
        this.state = 'play'
        this.helper.pose(null)
        this.controls.setWalk(true)
        this.header.setHelpEnabled(true)
    }

    private screenOf(at: Vec): Vec {
        return this.view.toScreen(at.x, at.y)
    }

    private customerSays(text: string, button?: string) {
        const head = this.customer.head()
        return this.bubble.say(text, this.screenOf({ x: head.x - 210, y: head.y + 150 }), button)
    }

    private walkTo(gen: number, x: number): Promise<boolean> {
        return new Promise(resolve => {
            this.controls.hold(x > this.helper.x ? 1 : -1)
            this.auto = { x, resolve: () => resolve(gen === this.gen) }
        })
    }

    private async until(gen: number, done: () => boolean, ms = 9000) {
        for (let waited = 0; !done(); waited += 100) {
            await FX.wait(this, 100)
            if (gen !== this.gen || waited > ms) return false
        }
        return true
    }

    // ───────────────────────────────────────────── nível e pedidos

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.controlsOff()
        this.header.setPhase(0)
        this.helper.place(HELPER.start)
        await this.startOrder(gen, this.introduce)
    }

    private async startOrder(gen: number, tutorial: boolean) {
        const o = this.order
        this.state = 'intro'
        this.controlsOff()
        this.drops.clear()
        this.helper.clear()
        this.helper.pose(null)
        this.recipe.clear()
        this.spawnAcc = 0
        this.sinceExpected = 1
        this.chef.pose(CHEF_CELL.idle)
        if (tutorial) this.ui(false)
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.audio.ding()
        await this.customer.enter(o.customer)
        if (gen !== this.gen) return
        if (tutorial) {
            await this.view.lean(true, { x: (this.helper.x + COUNTER.customerX) / 2, y: 420 })
            if (gen !== this.gen) return
        }
        await this.customerSays(o.ask, 'Próximo')
        if (gen !== this.gen) return
        if (tutorial) {
            await this.view.lean(false, { x: W / 2, y: 0 })
            if (gen !== this.gen) return
            this.header.visible(true)
            this.recipe.visible(true)
        }
        this.audio.pop()
        await this.recipe.show(o.recipe, tutorial)
        if (gen !== this.gen) return
        if (tutorial) {
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.list, ...spot(this.recipe.rect()), balloonY: 560, buttonLabel: 'Próximo' },
                { text: TEACH.turn, ...spot(this.recipe.rect()), balloonY: 560, buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
            await this.recipe.dock()
            if (gen !== this.gen) return
            this.ui(true)
            await this.demo(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        this.play()
    }

    private async demo(gen: number) {
        this.state = 'demo'
        const far = LANES.map((x, i) => ({ i, d: Math.abs(x - this.helper.x) })).sort((a, b) => b.d - a.d)[0].i
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        this.toss('queijo', far, 150)
        if (!(await this.until(gen, () => this.drops.list().length === 0))) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        const near = LANES.map((x, i) => ({ i, d: Math.abs(Math.abs(x - this.helper.x) - 200) })).sort((a, b) => a.d - b.d)[0].i
        this.toss('paoBaixo', near, 150)
        await FX.wait(this, 500)
        if (!(await this.walkTo(gen, LANES[near]))) return
        if (!(await this.until(gen, () => this.helper.count >= 1))) return
        await FX.wait(this, 700)
        if (gen !== this.gen) return
        const stack = this.view.toScreenRect(this.helper.stackRect())
        await teach(this, guideKey(this.level.level), [
            { text: TEACH.first, ...spot(stack, 6), balloonY: 200, buttonLabel: 'Próximo' },
            { text: TEACH.order, ...spot(this.recipe.rect()), buttonLabel: 'Próximo' },
            { text: TEACH.go, buttonLabel: 'Vamos!' },
        ])
    }

    // ───────────────────────────────────────────── servir

    private async serve(gen: number) {
        this.state = 'serve'
        this.controlsOff()
        this.drops.clear()
        await FX.wait(this, 450)
        if (gen !== this.gen) return
        if (!(await this.walkTo(gen, COUNTER.serveX))) return
        this.helper.pose(HELPER_CELL.deliver)
        const flight = this.helper.takeStack()
        this.flyers.push(flight)
        this.audio.whoosh()
        await FX.arcTo(this, flight, { x: COUNTER.customerX - 50, y: COUNTER.top - 30 }, { height: 90, duration: TIMING.serveFly })
        if (gen !== this.gen) return
        await FX.to(this, flight, { scale: 0.4, alpha: 0 }, { duration: 260 })
        this.flyers = this.flyers.filter(f => f !== flight)
        flight.destroy()
        this.customer.pose(CUSTOMER_COL.eat)
        this.audio.bite()
        this.hearts(this.customer.head())
        void this.customer.hop()
        this.helper.pose(HELPER_CELL.cheer)
        this.audio.good()
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await FX.wait(this, TIMING.bite)
        if (gen !== this.gen) return
        await this.customerSays(this.order.yum, 'Próximo')
        if (gen !== this.gen) return
        this.helper.pose(null)
        this.audio.pop()
        await this.header.celebrate(this.orderIndex)
        if (gen !== this.gen) return
        await this.customer.leave()
        if (gen !== this.gen) return
        this.orderIndex += 1
        if (this.orderIndex >= this.level.orders.length) {
            void this.endLevel()
            return
        }
        this.header.setPhase(this.orderIndex)
        await this.startOrder(gen, false)
    }

    private hearts(at: Vec) {
        for (let i = 0; i < 3; i++) {
            const heart = this.view.world(fit(this, UI_SHEET, UI_CELL.heart, 40).setPosition(at.x - 30 + i * 30, at.y + 20).setDepth(DEPTH.fx))
            this.flyers.push(heart)
            void FX.to(this, heart, { y: at.y - 50 - i * 10, alpha: 0 }, { duration: 1100, delay: i * 140 }).then(() => {
                this.flyers = this.flyers.filter(f => f !== heart)
                heart.destroy()
            })
        }
    }

    // ───────────────────────────────────────────── erro

    private async jam(gen: number, want: IngredientId, index: number) {
        this.state = 'error'
        this.controlsOff()
        this.drops.clear()
        this.audio.blom()
        this.customer.pose(CUSTOMER_COL.yuck)
        this.chef.pose(CHEF_CELL.surprised)
        void this.recipe.shake(index)
        void this.customerSays(this.order.yuck)
        this.banner.say(LABEL.why(INGREDIENTS[want].of))
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.controlsOff()
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
        this.controlsOff()
        const stack = this.view.toScreenRect(this.helper.stackRect())
        await teach(this, `${guideKey(this.level.level)}-help`, [
            { text: HELP.next, ...spot(this.recipe.rect()), buttonLabel: 'Próximo' },
            { text: HELP.first, ...spot(stack, 6), balloonY: 200, buttonLabel: 'Continuar' },
        ])
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
        this.controlsOff()
        this.audio.win()
        this.helper.pose(HELPER_CELL.cheer)
        this.chef.pose(CHEF_CELL.happy)
        void FX.confetti(this, { colors: [C.butter, C.mint, C.lilac, C.coral, C.pink] })
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
            progress: { total: this.level.orders.length, current: this.level.orders.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.orders.length) * 100)),
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
