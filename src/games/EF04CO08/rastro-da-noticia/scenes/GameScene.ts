import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { HERO_CELL, HERO_SHEET, LIA_CELL, UI_CELL, UI_SHEET } from '../data/files'
import { CAMERA, DEPTH, GROUND, HERO, LOOK, PACE, REAL, W } from '../data/layout'
import { LEVELS, POINTS, guideKey, isOrigin, pagesOf, trusts } from '../data/levels'
import { SITES } from '../data/sites'
import { C, CSS } from '../data/theme'
import { HELP, LABEL, LIA_SAYS, TEACH } from '../data/words'
import type { CaseDef, LevelDef, Page, Rect, SiteId, State, Verdict, Vec } from '../types'

import { fit } from './art'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { createControls, type Controls } from './controls'
import { createEdgeHint, type EdgeHint } from './edge'
import { spot, teach, type Step } from './guide'
import { createHeader, type Header } from './header'
import { createOrder, type Order } from './order'
import { createPhone, type PhoneCard } from './phone'
import { createRealWorld, type RealWorld } from './realworld'
import { createStreet, type Street } from './street'
import { createView, type View } from './view'
import { createWalker, type Walker } from './walkers'

const GAME_ID = 'rastro-da-noticia'
const ERROR_MS = 2400
const THINK_MS = 1500
const FINALE_MS = 1400

type Found = 'next' | 'origin' | 'again' | 'nothing'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private caseIndex = 0
    private step = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private vx = 0
    private focusX: number | null = null
    private auto: { x: number; resolve: () => void } | null = null
    private stepAcc = 0
    private stillMs = 0
    private lookedAt = 0
    private taughtCopy = false
    private taughtEdge = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private view!: View
    private audio!: Audio
    private street!: Street
    private hero!: Walker
    private controls!: Controls
    private header!: Header
    private order!: Order
    private edge!: EdgeHint
    private phone!: PhoneCard
    private bubble!: Bubble
    private banner!: Banner
    private real!: RealWorld
    private flyers: Phaser.GameObjects.Image[] = []

    private unsubPlatform?: () => void

    private get current(): CaseDef {
        return this.level.cases[this.caseIndex]
    }

    private get pages(): Page[] {
        return pagesOf(this.current)
    }

    private get target(): SiteId | null {
        return this.pages[this.step]?.site ?? null
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.caseIndex = 0
        this.step = 0
        this.state = 'intro'
        this.introduce = false
        this.vx = 0
        this.focusX = null
        this.auto = null
        this.stepAcc = 0
        this.stillMs = 0
        this.lookedAt = 0
        this.taughtCopy = false
        this.taughtEdge = false
        this.flyers = []
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.view = createView(this, this.level.width, this.level.zoom, this.level.viewY)
        this.audio = createAudio()
        this.street = createStreet(this, this.view, this.level)
        this.hero = createWalker(this, this.view, HERO_SHEET, HERO.height, HERO_CELL.idle, DEPTH.hero, this.level.start, 1)
        this.controls = createControls(this, { onLook: () => undefined, onDecide: v => this.onDecide(v) })
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.cases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.order = createOrder(this)
        this.edge = createEdgeHint(this)
        this.real = createRealWorld(this)
        this.phone = createPhone(this)
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
        this.view.snap(this.hero.x)
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
        this.phone?.destroy()
        this.real?.destroy()
        this.edge?.destroy()
        this.order?.destroy()
        this.header?.destroy()
        this.controls?.destroy()
        this.hero?.destroy()
        this.street?.destroy()
        this.audio?.destroy()
        this.view?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o quadro a quadro

    update(_time: number, deltaMs: number) {
        if (!this.hero) return
        const delta = Math.min(deltaMs, 50)
        const dt = delta / 1000
        if (this.auto) {
            const dx = this.auto.x - this.hero.x
            if (Math.abs(dx) < 4) {
                const done = this.auto.resolve
                this.auto = null
                this.vx = 0
                this.controls.hold(0)
                done()
            } else this.vx = Math.sign(dx) * Math.min(HERO.speed, Math.abs(dx) * 5 + 30)
        } else {
            const want = this.state === 'play' ? this.controls.dir() * HERO.speed : 0
            const a = HERO.accel * dt
            this.vx = this.vx < want ? Math.min(want, this.vx + a) : Math.max(want, this.vx - a)
        }
        const before = this.hero.x
        const next = Phaser.Math.Clamp(before + this.vx * dt, HERO.minX, this.level.width - HERO.minX)
        if (next === before) this.vx = 0
        this.hero.move(next - before, delta)
        this.stepAcc += Math.abs(next - before)
        if (this.stepAcc > 64) {
            this.stepAcc = 0
            this.audio.step()
        }
        this.view.update(delta, this.focusX ?? this.hero.x)
        this.watchStop(delta)
        this.pointEdge()
    }

    private watchStop(delta: number) {
        if (this.state !== 'play') {
            this.stillMs = 0
            return
        }
        const site = this.street.near(this.hero.x)
        const armed = Math.abs(this.hero.x - this.lookedAt) > LOOK.armAfter
        if (!site || !armed || Math.abs(this.vx) > 8 || this.controls.dir() !== 0) {
            this.stillMs = 0
            return
        }
        this.stillMs += delta
        if (this.stillMs < LOOK.stillMs) return
        this.stillMs = 0
        this.lookedAt = this.hero.x
        const gen = this.gen
        void this.inspect(gen, site).then(found => {
            if (gen !== this.gen) return
            if (found === 'origin') void this.decide(gen, site)
            else if (found === 'next') void this.resume(gen)
            else this.play()
        })
    }

    private edgeSide(): -1 | 0 | 1 {
        const target = this.target
        if (!target) return 0
        const x = this.view.toScreen(this.street.xOf(target), 0).x
        return x < 0 ? -1 : x > W ? 1 : 0
    }

    private pointEdge() {
        const target = this.state === 'play' || this.state === 'help' ? this.target : null
        if (!target) {
            this.edge.update(0, null)
            return
        }
        this.edge.update(this.edgeSide(), SITES[target].logo)
    }

    // ───────────────────────────────────────────── estados

    private controlsOff() {
        this.controls.setWalk(false)
        this.controls.setLook(false)
        void this.controls.setDecide(false)
        this.header.setHelpEnabled(false)
    }

    private ui(on: boolean) {
        this.order.visible(on)
        this.controls.visible(on)
    }

    private play() {
        this.state = 'play'
        this.focusX = null
        this.hero.pose(null)
        this.controls.setWalk(true)
        this.header.setHelpEnabled(true)
    }

    private debut(has: (level: LevelDef) => boolean) {
        return this.introduce && LEVELS.find(has)?.level === this.level.level
    }

    private async resume(gen: number) {
        if (!this.taughtEdge && this.edgeSide() !== 0 && this.debut(l => l.width > W)) {
            this.taughtEdge = true
            this.state = 'help'
            this.controls.setWalk(false)
            this.header.setHelpEnabled(false)
            await FX.wait(this, 420)
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [{ text: TEACH.edge, ...spot(this.edge.rect(), 4), buttonLabel: 'Ok' }])
            if (gen !== this.gen) return
        }
        this.play()
    }

    private liaSays(text: string, button?: string) {
        return this.bubble.say(text, this.real.liaHead(), button)
    }

    private streetRect(): Rect {
        const b = this.street.bounds()
        const top = b.y - b.h / 2
        const screens = this.street.lots.map(l => this.street.screenRect(l.site))
        const bottom = Math.max(...screens.map(r => r.y + r.h / 2)) + 24
        return this.view.toScreenRect({ x: b.x, y: (top + bottom) / 2, w: b.w, h: bottom - top })
    }

    private walkTo(gen: number, x: number): Promise<boolean> {
        return new Promise(resolve => {
            this.controls.hold(x > this.hero.x ? 1 : -1)
            this.auto = { x, resolve: () => resolve(gen === this.gen) }
        })
    }

    // ───────────────────────────────────────────── nível e casos

    private async openLevel() {
        const gen = ++this.gen
        this.state = 'intro'
        this.controlsOff()
        this.header.setPhase(0)
        this.header.visible(!this.introduce)
        this.ui(false)
        this.real.show()
        await this.startCase(gen)
    }

    private async startCase(gen: number) {
        const c = this.current
        const first = this.introduce && this.caseIndex === 0
        this.state = 'intro'
        this.step = 0
        this.order.clear()
        this.ui(false)
        void this.street.resetAll()
        this.hero.place(this.level.start, 1)
        this.hero.pose(null)
        this.lookedAt = this.hero.x
        this.focusX = null
        this.view.snap(this.hero.x)
        if (!this.real.shown) this.real.show()
        this.real.liaPose(LIA_CELL.idle)
        this.real.heroPose(HERO_CELL.idle)
        await FX.wait(this, PACE.beat)
        if (gen !== this.gen) return
        this.audio.ding()
        this.real.liaPose(LIA_CELL.phone)
        await this.liaSays(first ? LIA_SAYS.first : LIA_SAYS.again, 'Próximo')
        if (gen !== this.gen) return
        this.audio.pop()
        await this.phone.show(c, { x: REAL.phoneX, y: REAL.phoneY })
        if (gen !== this.gen) return
        await this.phone.revealFrom()
        if (gen !== this.gen) return
        await this.liaSays(c.ask, 'Próximo')
        if (gen !== this.gen) return
        if (first && this.level.level === 1) {
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.detective, ...spot(this.real.heroRect()), buttonLabel: 'Próximo' },
                { text: TEACH.site, ...spot(this.phone.rowRect(), 6), buttonLabel: 'Próximo' },
                { text: TEACH.enter, ...spot(this.phone.rect()), buttonLabel: 'Ver' },
            ])
        } else await FX.wait(this, PACE.beat)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await FX.all(this.phone.diveIn(), this.real.diveIn(this.phone.screenCenter()))
        if (gen !== this.gen) return
        this.header.visible(true)
        this.ui(true)
        this.audio.chip()
        await this.order.go(c.phone.from)
        if (gen !== this.gen) return
        await this.order.bounce()
        if (gen !== this.gen) return
        if (first && this.level.level === 1) {
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.sites, ...spot(this.streetRect(), 8), balloonY: 500, buttonLabel: 'Próximo' },
                { text: TEACH.find, ...spot(this.order.rect()), buttonLabel: 'Próximo' },
            ])
            if (gen !== this.gen) return
            this.controls.setWalk(true)
            if (!(await this.walkTo(gen, this.hero.x + 80))) return
            await FX.wait(this, 300)
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [{ text: TEACH.go, buttonLabel: 'Vamos!' }])
            if (gen !== this.gen) return
        } else if (first) {
            await teach(this, guideKey(this.level.level), [{ text: TEACH.find, ...spot(this.order.rect()), buttonLabel: 'Vamos!' }])
            if (gen !== this.gen) return
        }
        this.lookedAt = this.hero.x
        await this.resume(gen)
    }

    // ───────────────────────────────────────────── olhar

    private async inspect(gen: number, site: SiteId): Promise<Found> {
        this.state = 'look'
        this.controls.setWalk(false)
        this.header.setHelpEnabled(false)
        this.vx = 0
        this.hero.pose(HERO_CELL.look)
        this.audio.look()
        const sr = this.street.screenRect(site)
        await this.view.lean(true, { x: sr.x, y: sr.y + CAMERA.lookLift }, this.street.lookZoom(site))
        if (gen !== this.gen) return 'nothing'
        const back = async () => {
            await this.view.lean(false, { x: this.hero.x, y: 0 })
        }
        const seen = this.pages.findIndex(p => p.site === site)
        if (seen >= 0 && seen < this.step) {
            await this.street.showPage(site, this.pages[seen], false)
            this.audio.page()
            await FX.wait(this, 900)
            await back()
            return 'again'
        }
        if (site !== this.target) {
            await this.street.showHome(site)
            this.audio.nothing()
            this.bubble.think(LABEL.notHere, this.view.toScreen(this.hero.x, GROUND - HERO.height), THINK_MS)
            await FX.wait(this, THINK_MS)
            if (gen !== this.gen) return 'nothing'
            await back()
            return 'nothing'
        }
        const page = this.pages[this.step]
        this.audio.page()
        await this.street.showPage(site, page, true)
        if (gen !== this.gen) return 'nothing'
        this.step += 1
        await FX.wait(this, 400)
        if (gen !== this.gen) return 'nothing'
        this.audio.chip()
        if (isOrigin(page)) {
            await this.order.origin(this.level.rule === 'date' ? LABEL.whoWhen : LABEL.who)
            return 'origin'
        }
        const key = guideKey(this.level.level)
        const teachCopy = !this.taughtCopy && this.debut(l => l.trail > 0)
        if (teachCopy) {
            this.taughtCopy = true
            const row = this.view.toScreenRect(this.street.rowRect(site))
            await teach(this, key, [{ text: TEACH.copied, ...spot(row, 8), buttonLabel: 'Próximo' }])
            if (gen !== this.gen) return 'nothing'
        }
        await this.order.go(page.from)
        if (gen !== this.gen) return 'nothing'
        await FX.all(this.street.bounceRow(site), this.order.bounce())
        if (gen !== this.gen) return 'nothing'
        if (teachCopy) {
            await teach(this, key, [{ text: TEACH.follow, ...spot(this.order.rect()), buttonLabel: 'Ok' }])
            if (gen !== this.gen) return 'nothing'
        }
        await FX.wait(this, 600)
        await back()
        return 'next'
    }

    // ───────────────────────────────────────────── decidir

    private async decide(gen: number, site: SiteId) {
        this.state = 'decide'
        this.street.focus(site)
        const first = this.introduce && this.caseIndex === 0
        await FX.wait(this, 400)
        if (gen !== this.gen) return
        if (first) {
            const row = spot(this.view.toScreenRect(this.street.rowRect(site)), 8)
            const steps: Step[] = []
            if (this.level.level === 1) {
                steps.push({ text: TEACH.who, ...row }, { text: TEACH.yes, ...row }, { text: TEACH.no, ...row })
            } else {
                if (this.level.trail > 0) steps.push({ text: TEACH.start, ...spot(this.view.toScreenRect(this.street.screenRect(site)), 6) })
                steps.push({ text: TEACH.who, ...row })
                if (this.level.rule === 'date') {
                    const when = spot(this.view.toScreenRect(this.street.whenRect(site)), 8)
                    steps.push({ text: TEACH.when, ...when }, { text: TEACH.old, ...when })
                }
            }
            await teach(this, guideKey(this.level.level), steps.map(st => ({ ...st, buttonLabel: 'Próximo' })))
            if (gen !== this.gen) return
        }
        await this.controls.setDecide(true)
        if (gen !== this.gen) return
        if (first) {
            await teach(this, guideKey(this.level.level), [{ text: TEACH.decide, ...spot(this.controls.decideRect()), balloonY: 440, buttonLabel: 'Ok' }])
        }
    }

    private onDecide(verdict: Verdict) {
        if (this.state !== 'decide') return
        this.state = 'react'
        void this.react(this.gen, verdict)
    }

    private async react(gen: number, verdict: Verdict) {
        const c = this.current
        await this.controls.setDecide(false)
        this.street.focus(null)
        const right = (verdict === 'trust') === trusts(c.origin, this.level.rule)
        this.ui(false)
        this.order.clear()
        this.hero.pose(null)
        await this.view.lean(false, { x: this.hero.x, y: 0 })
        if (gen !== this.gen) return
        this.audio.whoosh()
        this.real.liaPose(LIA_CELL.phone)
        this.real.heroPose(HERO_CELL.idle)
        await this.real.diveOut(this.real.liaHand())
        if (gen !== this.gen) return
        if (!right) {
            void this.jam(gen, verdict)
            return
        }
        if (verdict === 'trust') await FX.wait(this, 700)
        else await this.crumple(gen)
        if (gen !== this.gen) return
        this.audio.good()
        this.real.liaPose(LIA_CELL.happy)
        this.real.heroPose(HERO_CELL.cheer)
        void this.real.hop()
        this.score += POINTS
        this.hits += 1
        this.done += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await this.liaSays(c.lia.right, 'Próximo')
        if (gen !== this.gen) return
        this.real.liaPose(LIA_CELL.idle)
        this.real.heroPose(HERO_CELL.idle)
        this.audio.pop()
        await this.header.celebrate(this.caseIndex)
        if (gen !== this.gen) return
        this.caseIndex += 1
        if (this.caseIndex >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        this.header.setPhase(this.caseIndex)
        await this.startCase(gen)
    }

    private flyer(cell: number, at: Vec, size: number) {
        const img = fit(this, UI_SHEET, cell, size).setPosition(at.x, at.y).setDepth(DEPTH.phone)
        this.flyers.push(img)
        return img
    }

    private drop(img: Phaser.GameObjects.Image) {
        this.flyers = this.flyers.filter(f => f !== img)
        img.destroy()
    }

    private async crumple(gen: number) {
        const hand = this.real.liaHand()
        const ball = this.flyer(UI_CELL.ball, hand, 70)
        ball.setScale(ball.scale * 0.3)
        this.audio.crumple()
        await FX.to(this, ball, { scale: ball.scale / 0.3 }, { duration: 300, ease: 'Back.easeOut' })
        if (gen !== this.gen) return
        await FX.arcTo(this, ball, { x: hand.x - 160, y: REAL.ground - 20 }, { height: 80, duration: 700 })
        await FX.to(this, ball, { alpha: 0 }, { duration: 300 })
        this.drop(ball)
    }

    private async spread() {
        const from = this.real.liaHand()
        const targets = [
            { x: -60, y: 180 },
            { x: 300, y: -40 },
            { x: 700, y: -60 },
            { x: W + 60, y: 160 },
            { x: W + 60, y: 420 },
        ]
        this.audio.spread()
        await FX.all(
            ...targets.map((to, i) => {
                const plane = this.flyer(UI_CELL.plane, from, 80).setFlipX(to.x < from.x)
                return FX.wait(this, i * 140)
                    .then(() => FX.arcTo(this, plane, to, { height: 90, duration: 860 }))
                    .then(() => this.drop(plane))
            }),
        )
    }

    // ───────────────────────────────────────────── erro

    private async jam(gen: number, verdict: Verdict) {
        this.state = 'react'
        const c = this.current
        if (verdict === 'trust') {
            await this.spread()
            if (gen !== this.gen) return
        }
        this.audio.blom()
        this.real.liaPose(LIA_CELL.oops)
        this.real.heroPose(HERO_CELL.oops)
        void this.liaSays(c.lia.wrong)
        this.banner.say(c.why)
        await FX.wait(this, ERROR_MS)
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
        const steps: Step[] = [{ text: HELP.find, ...spot(this.order.rect()), buttonLabel: 'Próximo' }]
        if (this.level.trail > 0) steps.push({ text: HELP.copied, buttonLabel: 'Próximo' })
        steps.push({ text: this.level.rule === 'date' ? HELP.whoWhen : HELP.who, buttonLabel: 'Continuar' })
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
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
        this.order.clear()
        this.audio.win()
        this.real.heroPose(HERO_CELL.cheer)
        this.real.liaPose(LIA_CELL.happy)
        void this.real.hop()
        void FX.confetti(this, { colors: [C.butter, C.mint, C.lilac, C.coral, C.sky2] })
        await FX.wait(this, FINALE_MS)
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
            progress: { total: this.level.cases.length, current: this.level.cases.length },
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
            progress: Math.min(100, Math.round((this.done / this.level.cases.length) * 100)),
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
