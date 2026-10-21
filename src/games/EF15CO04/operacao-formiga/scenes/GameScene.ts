import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { blows, fits, lifts } from '../data/cutting'
import { ITEMS, LIFT, WIND_AREA } from '../data/fruits'
import { ANT, BANNER, CUT, FRIEND, FRUIT_AT, GIANT, HOLE, JOY, LENS, MAP, PHERO, QUEEN, WALL, WIDE, WIND } from '../data/layout'
import { GAUGE_KEY, LEVELS, OPENING_KEY, POINTS, STUCK_KEY, guideKey } from '../data/levels'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { BLOWN, DIRTY, HELP, SAY } from '../data/words'
import type { CutKind, CutPhase, GiantPhase, LevelDef, PhaseDef, Rect, State, Vec } from '../types'

import { createAnt, type Ant } from './ant'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createCaption, type Caption } from './caption'
import { createCutter, type Cutter } from './cutter'
import { createFriends, type Friends } from './friends'
import { createGarden, type Garden } from './garden'
import { createGiant, type Giant } from './giant'
import { spot, teach } from './guide'
import { createHand, type Hand } from './hand'
import { createHeader, type Header } from './header'
import { createJoystick, type Joystick } from './joystick'
import { createPieces, type Piece, type Pieces } from './pieces'
import { createQueen, type Queen } from './queen'
import { createView, type View } from './view'

const GAME_ID = 'operacao-formiga'

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private opening = false

    /** O item já passou pelo modo de corte sob o arbusto. */
    private treeDone = false
    private carried: Piece | null = null
    private cutKind: CutKind = 'tree'
    /** Os pedaços da sessão de corte aberta (o item, ou o pedaço entalado/pesado e o que saiu dele). */
    private group: Piece[] = []
    private cutFrom: Vec = { x: 0, y: 0 }
    private cutsHere = 0
    private walked = 0
    private finishing = false
    /** Depois de um empurrão (PESADA!), a formiga precisa se afastar antes de empurrar de novo. */
    private lock: { at: Vec; r: number } | null = null

    /** N3: a folha gigante está erguida pelo grupo. */
    private lifted = false
    private leafLock = false
    private narrowLock = false
    private scrubTold = false
    private rubSound = 0
    private groupDir: 1 | -1 = -1

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0
    private stucks = 0

    private view!: View
    private garden!: Garden
    private queen!: Queen
    private pieces!: Pieces
    private giant!: Giant
    private friends!: Friends
    private ant!: Ant
    private joystick!: Joystick
    private cutter!: Cutter
    private header!: Header
    private caption!: Caption
    private banner!: Banner
    private hand!: Hand
    private audio!: Audio

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get cutPhase(): CutPhase {
        const p = this.phase
        if (p.type !== 'cut') throw new Error('not a cut phase')
        return p
    }

    private get giantPhase(): GiantPhase {
        const p = this.phase
        if (p.type !== 'giant') throw new Error('not a giant phase')
        return p
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
        this.state = 'intro'
        this.introduce = false
        this.opening = false
        this.treeDone = false
        this.carried = null
        this.group = []
        this.cutsHere = 0
        this.walked = 0
        this.finishing = false
        this.lock = null
        this.lifted = false
        this.leafLock = false
        this.narrowLock = false
        this.scrubTold = false
        this.rubSound = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.stucks = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.view = createView(this)
        this.garden = createGarden(this, this.view)
        this.queen = createQueen(this, this.view)
        this.pieces = createPieces(this, this.view)
        this.giant = createGiant(this, this.view)
        this.friends = createFriends(this, this.view)
        this.ant = createAnt(this, this.view, this.garden, () => this.audio.step())
        this.cutter = createCutter(this, this.view)
        this.joystick = createJoystick(this)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.caption = createCaption(this)
        this.banner = createBanner(this)
        this.hand = createHand(this)
        this.header.setHelpEnabled(false)
        this.joystick.setEnabled(false)

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
        this.opening = this.level.level === 1 && !this.registry.get(OPENING_KEY)
        if (this.level.level === 1) this.registry.set(OPENING_KEY, true)
        void this.startPhase(++this.gen, 0)
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.hand?.destroy()
        this.banner?.destroy()
        this.caption?.destroy()
        this.header?.destroy()
        this.joystick?.destroy()
        this.cutter?.destroy()
        this.ant?.destroy()
        this.friends?.destroy()
        this.giant?.destroy()
        this.pieces?.destroy()
        this.queen?.destroy()
        this.garden?.destroy()
        this.view?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── o laço de andar

    update(_time: number, delta: number) {
        this.view?.sort()
        if (this.state !== 'walk') return
        const dt = Math.min(delta, 50) / 1000
        if (this.phase.type === 'giant') {
            this.walkGiant(dt)
            return
        }
        const v = this.joystick.vector()
        const gate = !!this.carried && !fits(this.carried.area)
        const before = { x: this.ant.x, y: this.ant.y }
        const step = this.ant.step(v.x, v.y, dt, gate)
        this.follow()
        this.dropTrail(before)
        if (step.gate && this.carried) {
            void this.onStuck(this.gen, this.carried)
            return
        }
        this.checkSpots()
    }

    private follow() {
        if (!this.carried) return
        const h = this.ant.hold()
        this.pieces.follow(this.carried, h.x, h.y, this.ant.depth())
    }

    private dropTrail(before: Vec) {
        this.walked += Math.hypot(this.ant.x - before.x, this.ant.y - before.y)
        if (this.walked < PHERO.every) return
        this.walked = 0
        this.garden.trail(this.ant.x, this.ant.y - 2)
    }

    private reachesItem(x: number, y: number) {
        const def = this.pieces.def()
        const s = MAP.scale
        const dy = y - ANT.body - FRUIT_AT.y
        if (def.form === 'leaf') return ((x - FRUIT_AT.x) / (def.a * s + ANT.r)) ** 2 + (dy / (def.b * s + ANT.r)) ** 2 < 1
        return Math.hypot(x - FRUIT_AT.x, dy) < Math.max(def.a, def.b) * s + ANT.r
    }

    private checkSpots() {
        const gen = this.gen
        const x = this.ant.x
        const y = this.ant.y
        const p = this.carried
        if (p) {
            if (this.garden.inWind(x) && blows(p.area)) {
                void this.onBlown(gen, p)
                return
            }
            if (Math.hypot(x - HOLE.x, y - HOLE.y) < HOLE.r) {
                void this.deliver(gen, p)
                return
            }
            return
        }
        if (!this.treeDone) {
            if (this.reachesItem(x, y)) void this.openTree(gen)
            return
        }
        if (this.lock && Math.hypot(x - this.lock.at.x, y - ANT.body - this.lock.at.y) > this.lock.r) this.lock = null
        const heavy = (q: Piece) => this.cutPhase.lift && !lifts(q.area)
        // o corpo da formiga fica acima do pé: é com ele que ela "passa por cima" do pedaço
        const near = this.pieces.nearest(x, y - ANT.body, q => !this.lock || !heavy(q))
        if (!near) return
        if (heavy(near)) void this.onHeavy(gen, near)
        else this.pick(near)
    }

    /** Embaixo da folha: no corte, a formiga não fica na frente dela. */
    private leafStop(): Vec {
        const def = this.pieces.def()
        return { x: Phaser.Math.Clamp(this.ant.x, FRUIT_AT.x - 60, FRUIT_AT.x + 60), y: FRUIT_AT.y + def.b * MAP.scale * 1.12 + 64 }
    }

    private async openTree(gen: number) {
        if (this.pieces.def().form === 'leaf') {
            this.state = 'intro'
            this.joystick.setEnabled(false)
            this.joystick.release()
            await this.ant.walkTo([this.leafStop()])
            if (gen !== this.gen) return
        }
        await this.openCut(gen, 'tree', this.pieces.live(), false)
    }

    private pick(p: Piece) {
        this.pieces.carry(p, this.phase.type === 'cut' && this.cutPhase.lift ? ANT.carryMax : undefined)
        this.carried = p
        this.ant.setCarrying(true)
        this.audio.pick()
        this.follow()
    }

    // ───────────────────────────────────────────── fase

    private resetPhase(index: number) {
        this.phaseIndex = index
        this.state = 'intro'
        this.finishing = false
        this.header.setHelpEnabled(false)
        this.header.setPhase(index)
        this.joystick.setEnabled(false)
        this.banner.clear()
        this.caption.hide()
        this.treeDone = false
        this.carried = null
        this.group = []
        this.lock = null
        this.lifted = false
        this.leafLock = false
        this.narrowLock = false
        this.ant.setCarrying(false)
        this.ant.setPace(1)
        if (index === 0) {
            this.ant.place(ANT.start.x, ANT.start.y)
            this.ant.face(-1)
        }
    }

    private async startPhase(gen: number, index: number) {
        this.resetPhase(index)
        const phase = this.phase
        const kind = phase.type === 'giant' ? 'gigante' : phase.item
        this.garden.setWind(phase.type === 'cut' && phase.wind)
        this.garden.setWide(phase.type === 'giant')
        if (phase.type === 'giant') {
            this.pieces.clear()
            this.giant.build(phase.dirt)
            this.friends.spawn(phase.friends)
            void this.giant.drop()
        } else {
            this.giant.clear()
            this.friends.clear()
            this.pieces.start(phase.item, FRUIT_AT)
            const fruit = this.pieces.live()[0]
            if (fruit) {
                fruit.img.setAlpha(0).setY(fruit.pos.y - 160)
                void FX.to(this, fruit.img, { y: fruit.pos.y, alpha: 1 }, { duration: TIMING.drop, ease: 'Bounce.easeOut' })
            }
        }
        this.queen.outline(kind)
        this.header.order(kind, phase.type === 'cut' && phase.lift)

        const teachIt = this.introduce ? phase.teach : undefined
        if (this.opening && index === 0) {
            this.header.visible(false)
            this.joystick.visible(false)
            await this.playOpening(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            this.audio.order()
            await this.queen.ask(kind)
            if (gen !== this.gen) return
            if (teachIt === 'leaf' || teachIt === 'giant') this.caption.say(SAY.order(kind), C.butter, TIMING.caption)
            await FX.wait(this, TIMING.order)
            if (gen !== this.gen) return
        }

        if (teachIt === 'all') {
            await this.demoAll(gen)
            if (gen !== this.gen) return
            this.caption.say(SAY.you, C.butter, TIMING.caption)
        } else if (teachIt === 'cut') {
            this.caption.say(SAY.youCut, C.butter, TIMING.caption)
        } else if (teachIt === 'wind') {
            await this.windDemo(gen)
            if (gen !== this.gen) return
        } else if (teachIt === 'leaf') {
            await this.demoLeaf(gen)
            if (gen !== this.gen) return
            this.caption.say(SAY.you, C.butter, TIMING.caption)
        } else if (teachIt === 'giant') {
            await this.giantOpening(gen)
            if (gen !== this.gen) return
            this.caption.say(SAY.you, C.butter, TIMING.caption)
        } else if (phase.type === 'giant') {
            this.audio.snap()
            await this.header.tasks(phase.friends.length)
            if (gen !== this.gen) return
        }
        this.play()
    }

    private play() {
        this.state = 'walk'
        this.joystick.visible(true)
        this.joystick.setEnabled(true)
        this.header.setHelpEnabled(true)
    }

    private async playOpening(gen: number) {
        const kind = this.cutPhase.item
        await FX.wait(this, 450)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.view.focus({ x: QUEEN.x - 60, y: QUEEN.y - 110 }, LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        this.audio.order()
        await this.queen.ask(kind)
        if (gen !== this.gen) return
        this.caption.say(SAY.order(kind), C.butter)
        await FX.wait(this, 2100)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.view.focus(this.garden.gapCenter(), LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        this.caption.say(SAY.small, C.white)
        await FX.wait(this, 2100)
        if (gen !== this.gen) return
        this.caption.hide()
        await this.view.open()
        if (gen !== this.gen) return
        this.header.visible(true)
        this.joystick.visible(true)
    }

    // ───────────────────────────────────────────── o modo de corte

    private async openCut(gen: number, kind: CutKind, group: Piece[], demo: boolean) {
        this.state = 'cut'
        this.cutKind = kind
        this.group = [...group]
        this.cutsHere = 0
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.joystick.visible(false)
        this.header.setHelpEnabled(false)
        this.ant.setPose(this.carried ? 'carry' : 'idle')
        const at = kind === 'tree' ? { ...FRUIT_AT } : { ...group[0].pos }
        this.cutFrom = { ...at }
        const box = this.pieces.rectOf(group)
        const halfW = Math.max(box.x + box.w / 2 - at.x, at.x - (box.x - box.w / 2))
        const zoom = Math.min(CUT.zoom, 640 / box.w)
        this.pieces.raise(this.group, true)
        this.audio.whoosh()
        const phase = this.cutPhase
        this.cutter.open({
            at,
            windMin: phase.wind ? WIND_AREA : 0,
            lift: phase.lift ? LIFT : 0,
            halfW,
            done: kind === 'tree',
            onSwipe: (a, b) => this.swipe(a, b),
            onDone: () => void this.closeCut(this.gen),
        })
        await this.view.focus(at, zoom, CUT.at, TIMING.cutIn)
        if (gen !== this.gen || demo) return
        // o corte vale desde já; as dicas correm junto, sem segurar o dedo da criança
        if (this.state === 'cut') this.cutter.setInput(true)

        if (kind === 'tree' && !this.registry.get(GAUGE_KEY)) {
            this.registry.set(GAUGE_KEY, true)
            this.caption.say(SAY.gauge, C.white, TIMING.caption + 400)
            void this.cutter.pulseGauge()
        }
        if (kind !== 'tree') {
            const h = this.pieces.hintFor(group[0])
            this.cutter.hint(h.a, h.b)
            this.caption.say(SAY.cutAgain, C.butter, TIMING.caption)
            if (!this.registry.get(STUCK_KEY)) {
                this.registry.set(STUCK_KEY, true)
                const a = this.view.toScreen(h.a.x, h.a.y)
                const b = this.view.toScreen(h.b.x, h.b.y)
                void this.hand.swipe(a, b, TIMING.swipe * 1.6)
            }
        }
    }

    private swipe(a: Vec, b: Vec) {
        if (this.state !== 'cut' && this.state !== 'demo') return
        const live = this.group.filter(p => p.state !== 'gone')
        const res = this.pieces.cut(live, a, b)
        if (res.kind === 'cut') {
            this.audio.crunch()
            this.cutsHere += 1
            const cut = new Set(res.pairs.map(p => p.from))
            this.group = [...this.group.filter(p => !cut.has(p.id)), ...res.made]
            this.pieces.raise(this.group, true)
            if (this.cutKind !== 'tree') {
                this.cutter.clearHint()
                this.cutter.setDone(true)
                res.pairs.forEach(pair => void this.header.replace(pair.from, pair.kids))
            }
            return
        }
        if (res.kind === 'miss') {
            this.audio.swish()
            return
        }
        this.audio.crumb()
        this.group.forEach(p => void FX.to(this, p.img, { x: p.pos.x + 3 }, { duration: 50, yoyo: true, repeat: 2 }))
    }

    private async closeCut(gen: number) {
        if (this.state !== 'cut' && this.state !== 'demo') return
        const demo = this.state === 'demo'
        this.state = 'intro'
        this.audio.press()
        this.cutter.close()
        this.caption.hide()
        this.hand.hide()
        const group = this.group.filter(p => p.state !== 'gone')
        await this.view.open(TIMING.cutOut)
        if (gen !== this.gen) return
        this.pieces.raise(group, false)
        if (this.cutKind === 'tree') {
            this.treeDone = true
            await FX.all(this.pieces.spread(group, FRUIT_AT), this.header.split(group.map(p => ({ id: p.id, poly: p.poly }))))
        } else if (this.cutKind === 'heavy') {
            await this.pieces.spread(group, this.cutFrom)
        } else {
            const first = group[0]
            const from = { x: first ? first.pos.x + 40 : WALL.x, y: (WALL.gapTop + WALL.gapBottom) / 2 }
            await this.pieces.spread(group, from)
        }
        if (gen !== this.gen) return
        this.group = []
        if (demo) {
            this.state = 'demo'
            return
        }
        this.play()
    }

    // ───────────────────────────────────────────── a fresta, o peso, o vento, a entrega

    private async onStuck(gen: number, p: Piece, demo = false) {
        this.state = 'stuck'
        this.stucks += 1
        p.stuck = true
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.audio.bonk()
        this.caption.say(SAY.stuck, C.oops, TIMING.caption)
        await this.ant.strain()
        if (gen !== this.gen) return
        this.carried = null
        this.ant.setCarrying(false)
        const y = Phaser.Math.Clamp(this.ant.y, WALL.gapTop + 24, WALL.gapBottom - 24)
        const at = { x: WALL.x - WALL.half - CUT.stuckDX, y }
        await this.pieces.drop(p, at)
        if (gen !== this.gen) return
        // a formiga recua para baixo do pedaço, para não ficar na frente dele no corte
        const below = this.cutPhase.lift ? Math.max(104, this.pieces.rectOf([p]).h / 2 + ANT.body + 60) : 104
        await this.ant.walkTo([{ x: at.x - 6, y: Phaser.Math.Clamp(y + below, MAP.top + 30, MAP.bottom - 30) }])
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.stuck - 600)
        if (gen !== this.gen) return
        await this.openCut(gen, 'stuck', [p], demo)
    }

    /** PESADA!: a formiga empurra, o pedaço não sai do chão, e o corte abre ali mesmo. Não é erro. */
    private async onHeavy(gen: number, p: Piece) {
        this.state = 'stuck'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.audio.heavy()
        this.caption.say(SAY.heavy, C.oops, TIMING.caption)
        this.ant.face(p.pos.x >= this.ant.x ? 1 : -1)
        void FX.to(this, p.img, { x: p.pos.x + 4 * (p.pos.x >= this.ant.x ? 1 : -1) }, { duration: 70, yoyo: true, repeat: 4 })
        await this.ant.strain()
        if (gen !== this.gen) return
        const r = Math.sqrt(p.area / Math.PI) * MAP.scale
        this.lock = { at: { ...p.pos }, r: r + 60 }
        const dx = this.ant.x - p.pos.x
        const dy = this.ant.y - ANT.body - p.pos.y
        const len = Math.hypot(dx, dy) || 1
        const back = r + 46
        const left = p.pos.x < WALL.x
        const x = Phaser.Math.Clamp(p.pos.x + (dx / len) * back, MAP.left + ANT.r, left ? WALL.x - WALL.half - ANT.r - 2 : MAP.right - ANT.r)
        const y = Phaser.Math.Clamp(p.pos.y + ANT.body + (dy / len) * back, MAP.top + ANT.r + 10, MAP.bottom - ANT.r)
        await this.ant.walkTo([{ x, y }])
        if (gen !== this.gen) return
        await this.openCut(gen, 'heavy', [p], false)
    }

    private async onBlown(gen: number, p: Piece) {
        this.state = 'error'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        this.carried = null
        this.ant.setCarrying(false)
        this.ant.setPose('push')
        this.audio.blow()
        void this.pieces.blow(p)
        this.banner.say(BLOWN)
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private async deliver(gen: number, p: Piece) {
        this.carried = null
        this.ant.setCarrying(false)
        this.hits += 1
        await this.pieces.place(p)
        if (gen !== this.gen) return
        this.audio.snap()
        void this.header.fill(p.id)
        this.emitCheckpoint()
        if (this.allPlaced()) await this.finishPhase(gen)
    }

    private allPlaced() {
        return this.treeDone && !this.carried && this.pieces.live().every(p => p.state === 'placed')
    }

    private async finishPhase(gen: number) {
        if (this.finishing) return
        this.finishing = true
        this.state = 'done'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        this.queen.hush()
        await FX.wait(this, 240)
        if (gen !== this.gen) return
        this.audio.whole()
        await this.pieces.join()
        if (gen !== this.gen) return
        this.caption.say(SAY.whole, C.yes, TIMING.caption)
        void this.queen.glow()
        void this.ant.cheer()
        await FX.all(this.queen.cheer(), this.header.join())
        if (gen !== this.gen) return
        await this.completePhase(gen)
    }

    private async completePhase(gen: number) {
        this.queen.setPose('calm')
        this.score += POINTS
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        await this.header.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        if (this.phaseIndex >= this.level.phases.length - 1) {
            void this.endLevel()
            return
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.startPhase(gen, this.phaseIndex + 1)
    }

    // ───────────────────────────────────────────── N3: a folha gigante

    private walkGiant(dt: number) {
        const v = this.joystick.vector()
        const before = { x: this.ant.x, y: this.ant.y }
        const step = this.ant.step(v.x, v.y, dt, this.lifted)
        if (step.moved) this.friends.record(this.ant.x, this.ant.y)
        this.dropTrail(before)
        const x = this.ant.x
        const y = this.ant.y
        if (this.narrowLock && Math.hypot(x - WALL.x, y - (WALL.gapTop + WALL.gapBottom) / 2) > 150) this.narrowLock = false

        if (this.lifted) {
            if (Math.abs(v.x) > 0.05) this.groupDir = v.x > 0 ? 1 : -1
            this.friends.carry(x, y, this.groupDir, step.moved, dt)
            this.giant.follow(x, y - GIANT.lift, this.ant.depth() + FRIEND.ring[2].y + 10)
            if (step.gate && !this.narrowLock) void this.onNarrow()
            if (Math.hypot(x - HOLE.x, y - HOLE.y) < HOLE.r) void this.deliverGiant(this.gen)
            return
        }
        this.friends.follow(dt)
        const sleeper = this.friends.nearSleeping(x, y)
        if (sleeper >= 0) void this.onWake(this.gen, sleeper)
        const body = y - ANT.body
        if (this.leafLock && !this.giant.touches(x, body, GIANT.touch + GIANT.rearm)) this.leafLock = false
        if (!this.leafLock && this.giant.touches(x, body)) void this.onLeaf(this.gen)
    }

    private async onWake(gen: number, index: number) {
        this.audio.wake()
        this.header.lightFriend(index)
        await this.friends.wake(index)
        if (gen !== this.gen) return
        if (this.friends.allAwake()) {
            this.hits += 1
            this.emitCheckpoint()
        }
    }

    private async onLeaf(gen: number) {
        this.leafLock = true
        if (this.giant.dirty() > 0) {
            await this.openScrub(gen)
            return
        }
        if (this.friends.allAwake()) {
            await this.liftLeaf(gen)
            return
        }
        this.state = 'stuck'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.audio.heavy()
        this.caption.say(SAY.heavy, C.oops, TIMING.caption)
        this.ant.face(GIANT.at.x >= this.ant.x ? 1 : -1)
        this.header.blinkFriends(this.friends.sleeping())
        await this.ant.strain()
        if (gen !== this.gen) return
        this.play()
    }

    private async liftLeaf(gen: number) {
        this.state = 'intro'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        this.audio.pick()
        await this.friends.gather(this.ant.x, this.ant.y)
        if (gen !== this.gen) return
        this.ant.setCarrying(true)
        this.ant.setPace(FRIEND.pace)
        this.friends.carry(this.ant.x, this.ant.y, this.groupDir, false, 0)
        await this.giant.lift(this.ant.x, this.ant.y - GIANT.lift, this.ant.depth() + FRIEND.ring[2].y + 10)
        if (gen !== this.gen) return
        this.lifted = true
        this.play()
    }

    private async onNarrow() {
        this.narrowLock = true
        this.audio.bonk()
        this.caption.say(SAY.narrow, C.oops, TIMING.caption)
        await this.garden.lightPath()
    }

    private async openScrub(gen: number) {
        this.state = 'scrub'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.joystick.visible(false)
        this.header.setHelpEnabled(false)
        this.giant.raise(true)
        this.audio.whoosh()
        const at = this.giant.center()
        this.cutter.open({
            at,
            windMin: 0,
            lift: 0,
            halfW: 0,
            done: true,
            scrub: true,
            onSwipe: () => undefined,
            onDone: () => void this.closeScrub(this.gen, false),
        })
        await this.view.focus(at, Math.min(GIANT.zoom, 640 / GIANT.w), CUT.at, TIMING.cutIn)
        if (gen !== this.gen || this.state !== 'scrub') return
        this.cutter.setInput(true)
        this.giant.startScrub(
            left => {
                this.audio.snap()
                if (left === 0) void this.closeScrub(this.gen, true)
            },
            () => {
                const now = this.time.now
                if (now - this.rubSound < 90) return
                this.rubSound = now
                this.audio.scrub()
            },
        )
        if (!this.scrubTold) {
            this.scrubTold = true
            this.caption.say(SAY.clean, C.butter, TIMING.caption)
        }
    }

    private async closeScrub(gen: number, clean: boolean) {
        if (this.state !== 'scrub') return
        this.state = 'intro'
        this.giant.stopScrub()
        this.cutter.close()
        if (!clean) this.audio.press()
        if (clean) {
            this.caption.say(SAY.shiny, C.yes, TIMING.caption)
            this.audio.whole()
            this.header.light('clean')
            this.hits += 1
            this.emitCheckpoint()
            await this.giant.shine()
            if (gen !== this.gen) return
        }
        await this.view.open(TIMING.cutOut)
        if (gen !== this.gen) return
        this.giant.raise(false)
        // pronto sem terminar: com todas as amigas, o grupo ergue a folha suja ali mesmo
        if (!clean && this.giant.dirty() > 0 && this.friends.allAwake()) {
            await this.liftLeaf(gen)
            return
        }
        this.play()
    }

    private async deliverGiant(gen: number) {
        if (this.state !== 'walk') return
        this.state = 'done'
        this.lifted = false
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        this.ant.setCarrying(false)
        this.ant.setPace(1)
        this.queen.hush()
        await this.giant.place()
        if (gen !== this.gen) return
        this.audio.snap()
        if (this.giant.dirty() > 0) {
            await this.onDirty(gen)
            return
        }
        this.hits += 1
        this.header.light('carry')
        this.emitCheckpoint()
        this.audio.whole()
        this.caption.say(SAY.whole, C.yes, TIMING.caption)
        void this.queen.glow()
        void this.ant.cheer()
        await FX.all(this.queen.cheer(), this.friends.cheer())
        if (gen !== this.gen) return
        await this.header.join()
        if (gen !== this.gen) return
        await this.friends.away()
        if (gen !== this.gen) return
        await this.completePhase(gen)
    }

    private async onDirty(gen: number) {
        this.state = 'error'
        this.audio.yuck()
        this.banner.say(DIRTY, BANNER.lowY)
        await FX.all(this.queen.yuck(), this.giant.showDirt())
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    // ───────────────────────────────────────────── demonstrações

    /** Leva a formiga pelo caminho com a mãozinha no joystick. */
    private async autoWalk(gen: number, path: Vec[]) {
        await this.hand.press({ x: JOY.x, y: JOY.y }, true)
        for (const p of path) {
            if (gen !== this.gen) return
            const dir = { x: p.x - this.ant.x, y: p.y - this.ant.y }
            const len = Math.hypot(dir.x, dir.y) || 1
            this.joystick.nudge(dir)
            void this.hand.moveTo({ x: JOY.x + (dir.x / len) * JOY.r, y: JOY.y + (dir.y / len) * JOY.r }, 160)
            const before = { x: this.ant.x, y: this.ant.y }
            await this.ant.walkTo([p], () => {
                this.follow()
                this.dropTrail(before)
                before.x = this.ant.x
                before.y = this.ant.y
            })
        }
        this.joystick.release()
        await this.hand.lift()
    }

    /** A mãozinha corta pelos traços de roteiro (px de arte do item) e aperta o ✓. */
    private async demoCuts(gen: number, cuts: { a: Vec; b: Vec }[]) {
        for (const s of cuts) {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            const a = this.view.toScreen(s.a.x, s.a.y)
            const b = this.view.toScreen(s.b.x, s.b.y)
            await this.hand.swipe(a, b, TIMING.swipe * 1.4, at => this.cutter.drawTrail(a, at))
            if (gen !== this.gen) return
            this.cutter.clearTrail()
            this.swipe(s.a, s.b)
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.hand.press(this.cutter.doneAt())
        if (gen !== this.gen) return
        await this.closeCut(gen)
    }

    private async demoAll(gen: number) {
        const phase = this.cutPhase
        if (!phase.demo) return
        this.state = 'demo'
        this.joystick.visible(true)
        const gapY = (WALL.gapTop + WALL.gapBottom) / 2

        // 1. andar até a fruta
        this.caption.say(SAY.walk, C.white)
        const fruitStop = { x: FRUIT_AT.x + 96, y: FRUIT_AT.y + 40 }
        await this.autoWalk(gen, [
            { x: WALL.x + 80, y: gapY },
            { x: WALL.x - 80, y: gapY },
            fruitStop,
        ])
        if (gen !== this.gen) return
        this.caption.hide()

        // 2. cortar
        await this.openCut(gen, 'tree', this.pieces.live(), true)
        if (gen !== this.gen) return
        this.state = 'demo'
        this.caption.say(SAY.cut, C.white)
        await this.demoCuts(
            gen,
            phase.demo.map(s => ({ a: this.pieces.worldOf(s.from), b: this.pieces.worldOf(s.to) })),
        )
        if (gen !== this.gen) return

        // 3. levar um pedaço até a rainha
        this.state = 'demo'
        this.caption.say(SAY.carry, C.white)
        const target = this.pieces.live().reduce((a, b) => (b.pos.x > a.pos.x ? b : a))
        await this.autoWalk(gen, [{ x: target.pos.x + 10, y: target.pos.y + 30 }])
        if (gen !== this.gen) return
        this.pick(target)
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        await this.autoWalk(gen, [
            { x: WALL.x - 90, y: gapY },
            { x: WALL.x + 90, y: gapY },
            { x: HOLE.x - 30, y: HOLE.y - 10 },
        ])
        if (gen !== this.gen) return
        this.caption.hide()
        await this.deliver(gen, target)
    }

    /** N2: corta a folha em 3, o terço entala, é cortado de novo, e uma metade vai à rainha. */
    private async demoLeaf(gen: number) {
        const phase = this.cutPhase
        if (!phase.demo) return
        this.state = 'demo'
        this.joystick.visible(true)
        const gapY = (WALL.gapTop + WALL.gapBottom) / 2

        this.caption.say(SAY.walk, C.white)
        await this.autoWalk(gen, [
            { x: WALL.x + 80, y: gapY },
            { x: WALL.x - 80, y: gapY },
            this.leafStop(),
        ])
        if (gen !== this.gen) return
        this.caption.hide()

        await this.openCut(gen, 'tree', this.pieces.live(), true)
        if (gen !== this.gen) return
        this.state = 'demo'
        this.caption.say(SAY.cut, C.white)
        await this.demoCuts(
            gen,
            phase.demo.map(s => ({ a: this.pieces.worldOf(s.from), b: this.pieces.worldOf(s.to) })),
        )
        if (gen !== this.gen) return

        // o terço da direita levanta, mas entala na fresta
        this.state = 'demo'
        const third = this.pieces.live().reduce((a, b) => (b.pos.x > a.pos.x ? b : a))
        await this.autoWalk(gen, [{ x: third.pos.x + 10, y: third.pos.y + 30 }])
        if (gen !== this.gen) return
        this.pick(third)
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        await this.autoWalk(gen, [{ x: WALL.x - WALL.half - ANT.r - 6, y: gapY }])
        if (gen !== this.gen) return
        this.registry.set(STUCK_KEY, true)
        await this.onStuck(gen, third, true)
        if (gen !== this.gen) return

        this.state = 'demo'
        const h = this.pieces.hintFor(third)
        this.cutter.hint(h.a, h.b)
        this.caption.say(SAY.cutAgain, C.butter)
        await this.demoCuts(gen, [h])
        if (gen !== this.gen) return

        // uma das metades atravessa e vai para o prato
        this.state = 'demo'
        this.caption.say(SAY.carry, C.white)
        const half = this.pieces
            .live()
            .filter(p => p.state === 'ground' && p.stuck)
            .reduce((a, b) => (b.pos.y < a.pos.y ? b : a))
        await this.autoWalk(gen, [{ x: half.pos.x, y: half.pos.y + 30 }])
        if (gen !== this.gen) return
        this.pick(half)
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        await this.autoWalk(gen, [
            { x: WALL.x - 90, y: gapY },
            { x: WALL.x + 90, y: gapY },
            { x: HOLE.x - 30, y: HOLE.y - 10 },
        ])
        if (gen !== this.gen) return
        this.caption.hide()
        await this.deliver(gen, half)
    }

    private async windDemo(gen: number) {
        this.audio.whoosh()
        const center = { x: (WIND.left + WIND.right) / 2, y: 330 }
        await this.view.focus(center, LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        const def = ITEMS[this.cutPhase.item]
        const crumb = this.add.graphics()
        crumb.fillStyle(def.pulp, 1)
        crumb.fillCircle(0, 0, 9)
        crumb.lineStyle(3, def.skin, 1)
        crumb.strokeCircle(0, 0, 9)
        crumb.setPosition(center.x, 230)
        this.view.add(crumb, 950)
        await FX.wait(this, 400)
        if (gen !== this.gen) {
            crumb.destroy()
            return
        }
        this.audio.blow()
        this.caption.say(SAY.wind, C.sky)
        await FX.to(this, crumb, { y: 620, x: center.x + 30, angle: 720, scale: 0.6 }, { duration: TIMING.blow, ease: 'Quad.easeIn' })
        crumb.destroy()
        if (gen !== this.gen) return
        await FX.wait(this, 900)
        if (gen !== this.gen) return
        this.caption.hide()
        await this.view.open()
    }

    /** N3: o pedido se parte em 3 tarefas, e a câmera passa por cada uma. */
    private async giantOpening(gen: number) {
        this.state = 'demo'
        this.joystick.visible(false)
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        this.audio.snap()
        await this.header.tasks(this.giantPhase.friends.length)
        if (gen !== this.gen) return

        // limpar: a mãozinha esfrega uma sujeira, que some (conta)
        const dirt = this.giant.dirtAt()
        if (dirt) {
            void this.header.pulse('clean')
            this.audio.whoosh()
            await this.view.focus(dirt, LENS.zoom, LENS.at)
            if (gen !== this.gen) return
            this.caption.say(SAY.clean, C.butter)
            const c = this.view.toScreen(dirt.x, dirt.y)
            for (const side of [1, -1, 1]) {
                let last = { x: c.x - 46 * side, y: c.y - 8 }
                await this.hand.swipe(last, { x: c.x + 46 * side, y: c.y + 8 }, 360, at => {
                    if (this.giant.rub(last, at).touched) this.audio.scrub()
                    last = at
                })
                if (gen !== this.gen) return
            }
            await FX.wait(this, 700)
            if (gen !== this.gen) return
        }

        // chamar: zoom numa amiga dormindo
        void this.header.pulse('friends')
        this.audio.whoosh()
        await this.view.focus(this.friends.pos(0), LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        this.caption.say(SAY.wake, C.butter)
        await FX.wait(this, 2000)
        if (gen !== this.gen) return

        // levar: o caminho largo
        void this.header.pulse('carry')
        this.audio.whoosh()
        await this.view.focus({ x: WALL.x, y: (MAP.top + WIDE.bottom) / 2 + 60 }, LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        this.caption.say(SAY.together, C.butter)
        await this.garden.lightPath()
        if (gen !== this.gen) return
        this.caption.hide()
        await this.view.open()
    }

    // ───────────────────────────────────────────── erro

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.joystick.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.emitCheckpoint()
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private queenSpot(): Rect {
        const q = this.queen.rect()
        const plate = this.queen.plateRect()
        const left = Math.min(q.x - q.w / 2, plate.x - plate.w / 2)
        const right = Math.max(q.x + q.w / 2, plate.x + plate.w / 2)
        const topY = Math.min(q.y - q.h / 2, plate.y - plate.h / 2)
        const bottom = Math.max(q.y + q.h / 2, HOLE.y + 40)
        return { x: (left + right) / 2, y: (topY + bottom) / 2, w: right - left, h: bottom - topY }
    }

    private helpSteps(): TutorialStep[] {
        const next = (text: string, r: Rect, pad: number, balloonY: number): TutorialStep => ({ text, ...spot(r, pad), balloonY, buttonLabel: 'Próximo' })
        const steps: TutorialStep[] = [next(HELP.walk, this.joystick.rect(), 4, 300)]
        const phase = this.phase
        if (phase.type === 'giant') {
            const leaf = this.giant.rect()
            if (!this.lifted) steps.push(next(HELP.scrub, leaf, 16, 560))
            const sleeping = this.friends.sleeping()
            if (sleeping.length) steps.push(next(HELP.wake, this.friends.rect(sleeping[0]), 6, 560))
            steps.push(next(HELP.wide, this.garden.wideRect(), 0, 560))
            steps.push({ text: HELP.giantQueen, ...spot(this.queenSpot(), 6), balloonY: 600, buttonLabel: 'Continuar' })
            return steps
        }
        const fruitRect = this.treeDone
            ? this.pieces.rectOf(this.pieces.live().filter(p => p.state === 'ground'))
            : this.pieces.rectOf(this.pieces.live())
        if (fruitRect.w > 0) steps.push(next(phase.lift ? HELP.leafCut : HELP.cut, fruitRect, 16, 560))
        if (phase.lift) steps.push(next(HELP.heavy, this.ant.rect(), 10, 560))
        steps.push(next(HELP.gap, this.garden.gapRect(), 0, 600))
        if (this.garden.windOn()) steps.push(next(HELP.wind, this.garden.windRect(), 0, 300))
        steps.push({ text: HELP.queen, ...spot(this.queenSpot(), 6), balloonY: 600, buttonLabel: 'Continuar' })
        return steps
    }

    private async explain() {
        if (this.state !== 'walk') return
        const gen = this.gen
        this.state = 'help'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, this.helpSteps())
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
        this.joystick.setEnabled(false)
        this.audio.win()
        void FX.confetti(this, { colors: [C.butter, C.sky, C.lilac, ITEMS.morango.skin, ITEMS.laranja.skin, ITEMS.folha.skin] })
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
        // no N2 o entalo é o caminho natural; no N2 e no N3, quem completa ganha 3
        const stars = this.level.level > 1 || this.stucks === 0 ? 3 : this.stucks <= 2 ? 2 : 1
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
            stars,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
            progress: Math.min(100, Math.round((this.cleared / this.level.phases.length) * 100)),
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
