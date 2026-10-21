import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { blows, fits } from '../data/cutting'
import { FRUITS, WIND_MIN } from '../data/fruits'
import { ANT, CUT, FRUIT_AT, HOLE, JOY, LENS, MAP, PHERO, QUEEN, WALL, WIND } from '../data/layout'
import { GAUGE_KEY, LEVELS, OPENING_KEY, POINTS, STUCK_KEY, guideKey } from '../data/levels'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { BLOWN, HELP, SAY } from '../data/words'
import type { CutKind, LevelDef, PhaseDef, State, Vec } from '../types'

import { createAnt, type Ant } from './ant'
import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createCaption, type Caption } from './caption'
import { createCutter, type Cutter } from './cutter'
import { createGarden, type Garden } from './garden'
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

    /** A fruta já passou pelo modo de corte sob o arbusto. */
    private treeDone = false
    private carried: Piece | null = null
    private cutKind: CutKind = 'tree'
    /** Os pedaços da sessão de corte aberta (a fruta, ou o pedaço entalado e o que saiu dele). */
    private group: Piece[] = []
    private cutsHere = 0
    private walked = 0
    private finishing = false

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0
    private stucks = 0

    private view!: View
    private garden!: Garden
    private queen!: Queen
    private pieces!: Pieces
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
        this.opening = !this.registry.get(OPENING_KEY)
        this.registry.set(OPENING_KEY, true)
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

    private checkSpots() {
        const gen = this.gen
        const x = this.ant.x
        const y = this.ant.y
        const p = this.carried
        if (p) {
            if (this.garden.inWind(x) && blows(p.area, this.pieces.whole())) {
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
            const def = FRUITS[this.pieces.kind()]
            const reach = Math.max(def.a, def.b) * MAP.scale + ANT.r
            if (Math.hypot(x - FRUIT_AT.x, y - ANT.body - FRUIT_AT.y) < reach) void this.openCut(gen, 'tree', this.pieces.live(), false)
            return
        }
        // o corpo da formiga fica acima do pé: é com ele que ela "passa por cima" do pedaço
        const near = this.pieces.nearest(x, y - ANT.body)
        if (near) this.pick(near)
    }

    private pick(p: Piece) {
        this.pieces.carry(p)
        this.carried = p
        this.ant.setCarrying(true)
        this.audio.pick()
        this.follow()
    }

    // ───────────────────────────────────────────── fase

    private async startPhase(gen: number, index: number) {
        this.phaseIndex = index
        const phase = this.phase
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
        this.ant.setCarrying(false)
        if (index === 0) {
            this.ant.place(ANT.start.x, ANT.start.y)
            this.ant.face(-1)
        }

        this.garden.setWind(phase.wind)
        this.pieces.start(phase.fruit, FRUIT_AT)
        const fruit = this.pieces.live()[0]
        if (fruit) {
            fruit.img.setAlpha(0).setY(fruit.pos.y - 160)
            void FX.to(this, fruit.img, { y: fruit.pos.y, alpha: 1 }, { duration: TIMING.drop, ease: 'Bounce.easeOut' })
        }
        this.queen.outline(phase.fruit)
        this.header.order(phase.fruit)

        const opened = index === 0 && this.opening
        if (opened) {
            this.header.visible(false)
            this.joystick.visible(false)
            await this.playOpening(gen)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            this.audio.order()
            await this.queen.ask(phase.fruit)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.order)
            if (gen !== this.gen) return
        }

        const teachIt = this.introduce ? phase.teach : undefined
        if (teachIt === 'all' && phase.demo) {
            await this.demoAll(gen)
            if (gen !== this.gen) return
            this.caption.say(SAY.you, C.butter, TIMING.caption)
        } else if (teachIt === 'cut') {
            this.caption.say(SAY.youCut, C.butter, TIMING.caption)
        } else if (teachIt === 'wind') {
            await this.windDemo(gen)
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
        const kind = this.phase.fruit
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
        this.pieces.raise(this.group, true)
        this.audio.whoosh()
        this.cutter.open({
            at,
            windMin: this.phase.wind ? this.pieces.whole() * WIND_MIN : 0,
            done: kind === 'tree',
            onSwipe: (a, b) => this.swipe(a, b),
            onDone: () => void this.closeCut(this.gen),
        })
        await this.view.focus(at, CUT.zoom, CUT.at, TIMING.cutIn)
        if (gen !== this.gen || demo) return
        // o corte vale desde já; as dicas correm junto, sem segurar o dedo da criança
        if (this.state === 'cut') this.cutter.setInput(true)

        if (kind === 'tree' && !this.registry.get(GAUGE_KEY)) {
            this.registry.set(GAUGE_KEY, true)
            this.caption.say(SAY.gauge, C.white, TIMING.caption + 400)
            void this.cutter.pulseGauge()
        }
        if (kind === 'stuck') {
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
            if (this.cutKind === 'stuck') {
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

    // ───────────────────────────────────────────── a fresta, o vento, a entrega

    private async onStuck(gen: number, p: Piece) {
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
        await this.ant.walkTo([{ x: at.x - 6, y: Phaser.Math.Clamp(y + 104, MAP.top + 30, MAP.bottom - 30) }])
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.stuck - 600)
        if (gen !== this.gen) return
        await this.openCut(gen, 'stuck', [p], false)
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

    private async demoAll(gen: number) {
        const phase = this.phase
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
        for (const s of phase.demo) {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            const wa = this.pieces.worldOf(s.from)
            const wb = this.pieces.worldOf(s.to)
            const a = this.view.toScreen(wa.x, wa.y)
            const b = this.view.toScreen(wb.x, wb.y)
            await this.hand.swipe(a, b, TIMING.swipe * 1.4, at => this.cutter.drawTrail(a, at))
            if (gen !== this.gen) return
            this.cutter.clearTrail()
            this.swipe(wa, wb)
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.hand.press(this.cutter.doneAt())
        if (gen !== this.gen) return
        await this.closeCut(gen)
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

    private async windDemo(gen: number) {
        this.audio.whoosh()
        const center = { x: (WIND.left + WIND.right) / 2, y: 330 }
        await this.view.focus(center, LENS.zoom, LENS.at)
        if (gen !== this.gen) return
        const def = FRUITS[this.phase.fruit]
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

    private async explain() {
        if (this.state !== 'walk') return
        const gen = this.gen
        this.state = 'help'
        this.joystick.setEnabled(false)
        this.joystick.release()
        this.header.setHelpEnabled(false)
        const fruitRect = this.treeDone
            ? this.pieces.rectOf(this.pieces.live().filter(p => p.state === 'ground'))
            : this.pieces.rectOf(this.pieces.live())
        const steps: TutorialStep[] = [
            { text: HELP.walk, ...spot(this.joystick.rect(), 4), balloonY: 300, buttonLabel: 'Próximo' },
        ]
        if (fruitRect.w > 0) steps.push({ text: HELP.cut, ...spot(fruitRect, 16), balloonY: 560, buttonLabel: 'Próximo' })
        steps.push({ text: HELP.gap, ...spot(this.garden.gapRect(), 0), balloonY: 600, buttonLabel: 'Próximo' })
        if (this.garden.windOn()) steps.push({ text: HELP.wind, ...spot(this.garden.windRect(), 0), balloonY: 300, buttonLabel: 'Próximo' })
        const q = this.queen.rect()
        const plate = this.queen.plateRect()
        const left = Math.min(q.x - q.w / 2, plate.x - plate.w / 2)
        const right = Math.max(q.x + q.w / 2, plate.x + plate.w / 2)
        const topY = Math.min(q.y - q.h / 2, plate.y - plate.h / 2)
        const bottom = Math.max(q.y + q.h / 2, HOLE.y + 40)
        steps.push({
            text: HELP.queen,
            ...spot({ x: (left + right) / 2, y: (topY + bottom) / 2, w: right - left, h: bottom - topY }, 6),
            balloonY: 600,
            buttonLabel: 'Continuar',
        })
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
        this.header.setHelpEnabled(false)
        this.joystick.setEnabled(false)
        this.audio.win()
        void FX.confetti(this, { colors: [C.butter, C.sky, C.lilac, FRUITS.morango.skin, FRUITS.laranja.skin, FRUITS.maca.skin] })
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
        const stars = this.stucks === 0 ? 3 : this.stucks <= 2 ? 2 : 1
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
