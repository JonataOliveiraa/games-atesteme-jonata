import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { BG_OF, PIPA_CELL, TRAIL_KEY } from '../data/files'
import { BANNER, DEPTH, H, W, WEB } from '../data/layout'
import { LEVELS, OPENING_KEY, POINTS, guideKey } from '../data/levels'
import { colFits, edgeFits, firstMismatch, fits, homeOf, homeOfPiece, isNext, nestOf, rowFits } from '../data/logic'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { OPENING, TEACH, WHY } from '../data/words'
import type { Bug, Cell, FichaPhase, Flower, GridPhase, Home, LevelDef, PhaseDef, RedemoinhoPhase, State, TeiaPhase } from '../types'

import { createAudio, type Audio } from './audio'
import { createBanner, type Banner } from './banner'
import { createBubble, type Bubble } from './bubble'
import { createGarden, type Garden } from './garden'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createLine, type AntView, type Line } from './line'
import { createNests, type Nests } from './nests'
import { createPipa, type Pipa } from './pipa'
import { createTouch, type Touch } from './touch'
import { createWeb, type Web } from './web'
import { createWhirl, type Whirl } from './whirl'
import { createWind, type Wind } from './wind'

const GAME_ID = 'ventania-na-floresta'
const GRID_BALLOON_X = 1056
const GRID_BALLOON_W = 420
const NEST_BALLOON = { x: 980, y: 590 }
const WEB_BALLOON = { x: 640, y: 420 }
const WHIRL_BALLOON = { x: 640, y: 330 }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private state: State = 'intro'
    private gen = 0
    private brought = 0
    private opening = false

    private score = 0
    private hits = 0
    private errors = 0
    private solved = 0

    private bg!: Phaser.GameObjects.Image
    private line!: Line
    private garden!: Garden
    private nests!: Nests
    private web!: Web
    private whirl!: Whirl
    private pipa!: Pipa
    private wind!: Wind
    private touch!: Touch
    private header!: Header
    private bubble!: Bubble
    private banner!: Banner
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
        this.brought = 0
        this.opening = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.solved = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.bg = this.add.image(0, 0, TRAIL_KEY).setOrigin(0, 0).setDisplaySize(W, H).setDepth(DEPTH.bg)
        this.add.rectangle(0, 0, W, H, C.grassLight, 0.12).setOrigin(0, 0).setDepth(DEPTH.veil)
        this.line = createLine(this)
        this.garden = createGarden(this)
        this.pipa = createPipa(this)
        this.nests = createNests(this, this.pipa)
        this.web = createWeb(this)
        this.whirl = createWhirl(this)
        this.wind = createWind(this)
        this.touch = createTouch(this)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.header.setHelpEnabled(false)

        this.game.canvas.addEventListener('pointerdown', this.focusGame)
        this.focusGame()
        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.opening = this.level.level === 1 && !this.registry.get(OPENING_KEY)
        if (this.level.level === 1) this.registry.set(OPENING_KEY, true)
        void this.startPhase(++this.gen, 0)
    }

    private focusGame = () => window.focus()

    private shutdownScene() {
        this.gen++
        this.game.canvas?.removeEventListener('pointerdown', this.focusGame)
        this.banner?.destroy()
        this.bubble?.destroy()
        this.header?.destroy()
        this.touch?.destroy()
        this.wind?.destroy()
        this.whirl?.destroy()
        this.web?.destroy()
        this.nests?.destroy()
        this.pipa?.destroy()
        this.garden?.destroy()
        this.line?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update(time: number) {
        this.garden?.update(time)
    }

    // ───────────────────────────────────────────── fase

    private async startPhase(gen: number, index: number) {
        this.phaseIndex = index
        const phase = this.phase
        this.state = 'intro'
        this.brought = 0
        this.header.setHelpEnabled(false)
        this.header.setPhase(index)
        this.header.setRequest(phase.type)
        this.banner.clear()
        this.bg.setTexture(BG_OF[phase.type]).setDisplaySize(W, H)
        this.line.hide()
        this.garden.hide()
        this.nests.hide()
        this.web.hide()
        this.whirl.hide()
        this.pipa.hide()
        if (phase.type === 'fila') this.line.build(phase)
        else if (phase.type === 'grade') this.garden.build(phase)
        else if (phase.type === 'ficha') this.nests.build(phase)
        else if (phase.type === 'teia') this.web.build(phase)
        else this.whirl.build(phase)

        if (index > 0) {
            await this.fade(false)
            if (gen !== this.gen) return
        }

        const teaching = !!phase.teach && !this.registry.get(guideKey(phase.type))
        if (index === 0 && this.opening) {
            await this.playOpening(gen)
        } else {
            await this.blowAway(gen)
        }
        if (gen !== this.gen) return

        if (teaching) {
            this.registry.set(guideKey(phase.type), true)
            if (phase.type === 'fila') await this.teachLine(gen)
            else if (phase.type === 'grade') await this.teachGrid(gen, phase)
            else if (phase.type === 'ficha') await this.teachFicha(gen, phase)
            else if (phase.type === 'teia') await this.teachTeia(gen, phase)
            else await this.teachWhirl(gen, phase)
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        await this.play(gen)
    }

    private async blowAway(gen: number) {
        const phase = this.phase
        if (phase.type === 'redemoinho') {
            this.audio.whirl()
            void this.wind.gust(TIMING.gust)
            await this.whirl.spin()
            return
        }
        if (phase.type === 'fila') await this.line.march(TIMING.march)
        else await FX.wait(this, TIMING.march * 0.7)
        if (gen !== this.gen) return
        this.audio.wind()
        void this.wind.gust(TIMING.gust)
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        if (phase.type === 'teia') this.audio.snap()
        else this.audio.tumble()
        if (phase.type === 'fila') await this.line.scatter()
        else if (phase.type === 'grade') await this.garden.scatter()
        else if (phase.type === 'ficha') await this.nests.scatter()
        else await this.web.scatter()
    }

    private async playOpening(gen: number) {
        const marching = this.line.march(TIMING.march + 600)
        await this.pipa.enter()
        if (gen !== this.gen) return
        await marching
        if (gen !== this.gen) return
        await this.pipaSays(OPENING.hello, 'Próximo', 'above')
        if (gen !== this.gen) return
        this.pipa.brace(true)
        this.audio.wind()
        void this.wind.gust(TIMING.gust)
        await FX.wait(this, 260)
        if (gen !== this.gen) return
        this.audio.tumble()
        await this.line.scatter()
        if (gen !== this.gen) return
        this.pipa.brace(false)
        this.pipa.pose(PIPA_CELL.surprised)
        await this.pipaSays(OPENING.wind, 'Próximo', 'left')
        if (gen !== this.gen) return
        this.pipa.pose(PIPA_CELL.point)
        await this.pipaSays(OPENING.go, 'Vamos!', 'left')
        if (gen !== this.gen) return
        await this.pipa.leave()
    }

    private pipaSays(text: string, button: string, side: 'above' | 'left') {
        const head = this.pipa.head()
        if (side === 'above') return this.bubble.say(text, { x: head.x - 120, y: head.y + 10 }, button)
        return this.bubble.say(text, { x: head.x - 70, y: head.y + 70 }, button, 'left')
    }

    private async teachLine(gen: number) {
        await teach(this, guideKey('fila-rule'), [
            { text: TEACH.line, ...spot(this.header.requestRect(), 6), balloonY: 470, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return
        this.state = 'demo'
        const ant = this.line.biggestLoose()
        if (!ant) return
        this.line.showNext(true)
        const r = this.line.antRect(ant)
        await this.touch.tap({ x: r.x, y: r.y })
        if (gen !== this.gen) return
        await this.placeAnt(gen, ant)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, guideKey('fila-go'), [
            { text: TEACH.go, ...spot(this.line.looseRect(), 10), balloonX: 900, balloonY: 470, buttonLabel: 'Vamos!' },
        ])
    }

    private async teachGrid(gen: number, phase: GridPhase) {
        await teach(this, guideKey('grade-rule'), this.gridRuleSteps('Ver'), GRID_BALLOON_W)
        if (gen !== this.gen) return
        this.state = 'demo'
        await this.garden.bring(this.brought)
        if (gen !== this.gen) return
        const f = phase.bring[this.brought]
        await this.garden.showCross(f)
        if (gen !== this.gen) return
        const home = homeOf(phase, f)
        await this.touch.tap(this.garden.cellCenter(home))
        if (gen !== this.gen) return
        this.audio.buzz()
        await this.garden.plant(home)
        if (gen !== this.gen) return
        this.audio.plant()
        await this.garden.bloom(home)
        if (gen !== this.gen) return
        this.brought += 1
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(
            this,
            guideKey('grade-go'),
            [{ text: TEACH.go, ...spot(this.garden.gridRect(), 6), balloonX: GRID_BALLOON_X, balloonY: 480, buttonLabel: 'Vamos!' }],
            GRID_BALLOON_W,
        )
    }

    private async play(gen: number) {
        const phase = this.phase
        if (phase.type === 'fila') {
            this.line.showNext(true)
            this.waitAnt()
            return
        }
        this.state = 'busy'
        if (phase.type === 'grade' && !this.garden.holding()) {
            await this.garden.bring(this.brought)
            if (gen !== this.gen) return
        }
        if (phase.type === 'ficha' && !this.nests.holding()) {
            this.audio.flap()
            await this.nests.bring(this.brought)
            if (gen !== this.gen) return
        }
        if (phase.type === 'teia') {
            const edge = phase.edges[this.brought]
            this.header.setPair(edge)
            if (this.web.from() !== edge[0]) {
                await this.web.start(edge)
                if (gen !== this.gen) return
            }
        }
        if (phase.type === 'redemoinho' && !this.whirl.current()) {
            this.audio.spit()
            await this.whirl.spit(this.brought)
            if (gen !== this.gen) return
            this.header.setPiece(phase.pieces[this.brought])
        }
        this.waitPick()
    }

    private waitPick() {
        const type = this.phase.type
        if (type === 'fila') {
            this.waitAnt()
            return
        }
        if (type === 'grade') {
            this.waitCell()
            return
        }
        this.state = 'play'
        this.header.setHelpEnabled(true)
        if (type === 'ficha') this.nests.activate(i => void this.onNest(i))
        else if (type === 'teia') this.web.activate(b => void this.onBug(b))
        else this.whirl.activate(h => void this.onHome(h))
    }

    private waitAnt() {
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.line.activate(a => void this.onAnt(a))
    }

    private waitCell() {
        this.state = 'play'
        this.header.setHelpEnabled(true)
        this.garden.activate(c => void this.onCell(c))
    }

    private deactivateAll() {
        this.line.deactivate()
        this.garden.deactivate()
        this.nests.deactivate()
        this.web.deactivate()
        this.whirl.deactivate()
    }

    // ───────────────────────────────────────────── fila

    private async placeAnt(gen: number, ant: AntView) {
        const k = this.line.placedCount()
        this.audio.pop()
        await this.line.join(ant, () => this.audio.step())
        if (gen !== this.gen) return
        this.audio.join(k)
    }

    private async onAnt(ant: AntView) {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'busy'
        this.line.deactivate()
        this.header.setHelpEnabled(false)
        const ok = isNext(ant.rank, this.line.ranksLeft())
        const right = this.line.biggestLoose()
        await this.placeAnt(gen, ant)
        if (gen !== this.gen) return
        if (!ok && right) {
            await this.antError(gen, ant, right)
            return
        }
        if (this.line.loose().length === 0) {
            await this.lineDone(gen)
            return
        }
        this.line.showNext(true)
        this.waitAnt()
    }

    private async antError(gen: number, wrong: AntView, right: AntView) {
        this.state = 'busy'
        this.banner.say(WHY.line, BANNER.lineY)
        this.audio.trip()
        await this.line.stumble(wrong, right)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private async lineDone(gen: number) {
        await FX.wait(this, TIMING.settle)
        if (gen !== this.gen) return
        this.audio.good()
        void this.header.bounceRequest()
        await this.line.enter(() => this.audio.step())
        if (gen !== this.gen) return
        await this.phaseSolved(gen)
    }

    // ───────────────────────────────────────────── grade

    private async onCell(cell: Cell) {
        if (this.state !== 'play') return
        const gen = this.gen
        const phase = this.phase as GridPhase
        const f = this.garden.holding()
        if (!f) return
        this.state = 'busy'
        this.garden.deactivate()
        this.header.setHelpEnabled(false)
        this.audio.buzz()
        await this.garden.plant(cell)
        if (gen !== this.gen) return
        if (!fits(phase, cell, f)) {
            await this.cellError(gen, cell, f)
            return
        }
        this.audio.plant()
        await this.garden.bloom(cell)
        if (gen !== this.gen) return
        this.brought += 1
        if (this.brought >= phase.bring.length) {
            await this.gridDone(gen)
            return
        }
        await this.play(gen)
    }

    private async cellError(gen: number, cell: Cell, f: Flower) {
        const phase = this.phase as GridPhase
        this.state = 'busy'
        const rowBad = !rowFits(phase, cell, f)
        const colBad = !colFits(phase, cell, f)
        this.banner.say(rowBad ? WHY.row(phase.rows[cell.r]) : WHY.col(phase.cols[cell.c]), BANNER.gridY)
        this.audio.wilt()
        await this.garden.wilt(cell, rowBad, colBad)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private async gridDone(gen: number) {
        await FX.wait(this, TIMING.settle)
        if (gen !== this.gen) return
        this.audio.good()
        void this.header.bounceRequest()
        await this.garden.celebrate()
        if (gen !== this.gen) return
        await this.phaseSolved(gen)
    }

    // ───────────────────────────────────────────── ficha

    private async teachFicha(gen: number, phase: FichaPhase) {
        const bird = phase.bring[this.brought]
        const home = nestOf(phase.nests, bird, phase.fields)
        await teach(this, guideKey('ficha-rule'), this.fichaRuleSteps(home, 'Ver'))
        if (gen !== this.gen) return
        this.state = 'demo'
        this.audio.flap()
        await this.nests.bring(this.brought)
        if (gen !== this.gen) return
        await this.nests.showMatch(bird)
        if (gen !== this.gen) return
        await this.touch.tap(this.nests.nestCenter(home))
        if (gen !== this.gen) return
        this.audio.flap()
        await this.nests.fly(home)
        if (gen !== this.gen) return
        this.audio.chirp()
        await this.nests.settle(home)
        if (gen !== this.gen) return
        this.brought += 1
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, guideKey('ficha-go'), [
            { text: TEACH.go, ...spot(this.nests.nestsRect(), 4), balloonX: NEST_BALLOON.x, balloonY: NEST_BALLOON.y, buttonLabel: 'Vamos!' },
        ])
    }

    private fichaRuleSteps(index: number, last: string): TutorialStep[] {
        return [
            { text: TEACH.card, ...spot(this.nests.cardRect(index), 8), balloonX: NEST_BALLOON.x, balloonY: NEST_BALLOON.y, buttonLabel: 'Próximo' },
            { text: TEACH.labels, ...spot(this.nests.labelsRect(index), 6), balloonX: NEST_BALLOON.x, balloonY: NEST_BALLOON.y, buttonLabel: last },
        ]
    }

    private async onNest(index: number) {
        if (this.state !== 'play') return
        const gen = this.gen
        const phase = this.phase as FichaPhase
        const bird = this.nests.holding()
        if (!bird) return
        this.state = 'busy'
        this.deactivateAll()
        this.header.setHelpEnabled(false)
        this.audio.flap()
        await this.nests.fly(index)
        if (gen !== this.gen) return
        const nest = phase.nests[index]
        const field = firstMismatch(nest, bird, phase.fields)
        if (field) {
            this.banner.say(WHY.field(field, nest), BANNER.nestY)
            this.audio.wilt()
            await this.nests.mismatch(index, field)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.error)
            if (gen !== this.gen) return
            this.lose()
            return
        }
        this.audio.chirp()
        await this.nests.settle(index)
        if (gen !== this.gen) return
        this.brought += 1
        if (this.brought >= phase.bring.length) {
            await this.structureDone(gen, () => this.nests.celebrate())
            return
        }
        await this.play(gen)
    }

    // ───────────────────────────────────────────── teia

    private async teachTeia(gen: number, phase: TeiaPhase) {
        const edge = phase.edges[this.brought]
        this.header.setPair(edge)
        await this.web.start(edge)
        if (gen !== this.gen) return
        await teach(this, guideKey('teia-rule'), this.teiaRuleSteps('Ver'))
        if (gen !== this.gen) return
        this.state = 'demo'
        await this.touch.tap(this.web.bugCenter(edge[1]))
        if (gen !== this.gen) return
        this.audio.stretch()
        await this.web.stretch(edge[1])
        if (gen !== this.gen) return
        this.audio.join(this.brought)
        await this.web.shine(edge[1])
        if (gen !== this.gen) return
        this.brought += 1
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, guideKey('teia-go'), [
            {
                text: TEACH.go,
                shape: 'rect',
                x: WEB.center.x,
                y: WEB.center.y,
                w: WEB.rx * 2 + WEB.hit + 20,
                h: WEB.ry * 2 + WEB.hit + 20,
                balloonX: WEB_BALLOON.x,
                balloonY: WEB_BALLOON.y,
                buttonLabel: 'Vamos!',
            },
        ])
    }

    private teiaRuleSteps(last: string): TutorialStep[] {
        return [{ text: TEACH.web, ...spot(this.header.iconRect(), 6), balloonX: WEB_BALLOON.x, balloonY: WEB_BALLOON.y - 120, buttonLabel: last }]
    }

    private async onBug(bug: Bug) {
        if (this.state !== 'play') return
        const gen = this.gen
        const phase = this.phase as TeiaPhase
        const from = this.web.from()
        if (!from) return
        const edge = phase.edges[this.brought]
        this.state = 'busy'
        this.deactivateAll()
        this.header.setHelpEnabled(false)
        this.audio.stretch()
        await this.web.stretch(bug)
        if (gen !== this.gen) return
        if (!edgeFits(edge, from, bug)) {
            this.audio.snap()
            this.banner.say(WHY.edge(edge[0], edge[1]), BANNER.webY)
            await this.web.snap(bug, edge[1])
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.error)
            if (gen !== this.gen) return
            this.lose()
            return
        }
        this.audio.join(this.brought)
        await this.web.shine(bug)
        if (gen !== this.gen) return
        this.brought += 1
        if (this.brought >= phase.edges.length) {
            await this.structureDone(gen, () => this.web.celebrate())
            return
        }
        await this.play(gen)
    }

    // ───────────────────────────────────────────── redemoinho

    private async teachWhirl(gen: number, phase: RedemoinhoPhase) {
        await teach(this, guideKey('redemoinho-rule'), this.whirlRuleSteps('Ver'))
        if (gen !== this.gen) return
        this.state = 'demo'
        this.audio.spit()
        await this.whirl.spit(this.brought)
        if (gen !== this.gen) return
        const piece = phase.pieces[this.brought]
        this.header.setPiece(piece)
        const home = homeOfPiece(piece)
        await this.whirl.pulse(home)
        if (gen !== this.gen) return
        await this.touch.tap(this.whirl.houseCenter(home))
        if (gen !== this.gen) return
        await this.whirl.send(home)
        if (gen !== this.gen) return
        await this.acceptPiece(home)
        if (gen !== this.gen) return
        this.brought += 1
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await teach(this, guideKey('redemoinho-go'), [
            { text: TEACH.go, ...spot(this.whirl.housesRect(), 4), balloonX: WHIRL_BALLOON.x, balloonY: WHIRL_BALLOON.y, buttonLabel: 'Vamos!' },
        ])
    }

    private whirlRuleSteps(last: string): TutorialStep[] {
        return [{ text: TEACH.homes, ...spot(this.whirl.housesRect(), 4), balloonX: WHIRL_BALLOON.x, balloonY: WHIRL_BALLOON.y, buttonLabel: last }]
    }

    private acceptPiece(home: Home) {
        this.audio.join(this.brought)
        void this.header.lightHome(home)
        return this.whirl.accept(home)
    }

    private async onHome(home: Home) {
        if (this.state !== 'play') return
        const gen = this.gen
        const phase = this.phase as RedemoinhoPhase
        const piece = this.whirl.current()
        if (!piece) return
        this.state = 'busy'
        this.deactivateAll()
        this.header.setHelpEnabled(false)
        await this.whirl.send(home)
        if (gen !== this.gen) return
        const right = homeOfPiece(piece)
        if (home !== right) {
            this.audio.bonk()
            this.banner.say(WHY.home(right), BANNER.whirlY)
            await this.whirl.reject(home, right)
            if (gen !== this.gen) return
            await FX.wait(this, TIMING.error)
            if (gen !== this.gen) return
            this.lose()
            return
        }
        await this.acceptPiece(home)
        if (gen !== this.gen) return
        this.brought += 1
        if (this.brought >= phase.pieces.length) {
            await this.structureDone(gen, () => this.whirl.celebrate())
            return
        }
        await this.play(gen)
    }

    private async structureDone(gen: number, celebrate: () => Promise<void>) {
        await FX.wait(this, TIMING.settle)
        if (gen !== this.gen) return
        this.audio.good()
        void this.header.bounceRequest()
        await celebrate()
        if (gen !== this.gen) return
        await this.phaseSolved(gen)
    }

    // ───────────────────────────────────────────── fim de fase

    private async phaseSolved(gen: number) {
        this.state = 'busy'
        this.score += POINTS
        this.hits += 1
        this.solved += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        this.audio.ding()
        void FX.sparks(this, W / 2, H / 2, { color: C.butter, count: 22, spread: 220, size: 12, depth: DEPTH.fx })
        await this.header.celebrate(this.phaseIndex)
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.done)
        if (gen !== this.gen) return
        if (this.phaseIndex >= this.level.phases.length - 1) {
            void this.endLevel()
            return
        }
        await this.fade(true)
        if (gen !== this.gen) return
        await this.startPhase(gen, this.phaseIndex + 1)
    }

    private fade(out: boolean) {
        const cam = this.cameras.main
        return new Promise<void>(resolve => {
            const event = out ? Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE : Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE
            cam.once(event, () => resolve())
            if (out) cam.fadeOut(TIMING.fade, 0x1f2b22)
            else cam.fadeIn(TIMING.fade, 0x1f2b22)
        })
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.deactivateAll()
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private helpSteps(): TutorialStep[] {
        const type = this.phase.type
        if (type === 'fila') return [{ text: TEACH.line, ...spot(this.header.requestRect(), 6), balloonY: 470, buttonLabel: 'Continuar' }]
        if (type === 'grade') return this.gridRuleSteps('Continuar')
        if (type === 'ficha') return this.fichaRuleSteps(0, 'Continuar')
        if (type === 'teia') return this.teiaRuleSteps('Continuar')
        return this.whirlRuleSteps('Continuar')
    }

    private gridRuleSteps(last: string): TutorialStep[] {
        return [
            { text: TEACH.row, ...spot(this.garden.rowsRect(), 6), balloonX: GRID_BALLOON_X, balloonY: 470, buttonLabel: 'Próximo' },
            { text: TEACH.col, ...spot(this.garden.colsRect(), 6), balloonX: GRID_BALLOON_X, balloonY: 470, buttonLabel: last },
        ]
    }

    private async explain() {
        if (this.state !== 'play') return
        const gen = this.gen
        this.state = 'help'
        this.deactivateAll()
        this.header.setHelpEnabled(false)
        await teach(this, guideKey('help'), this.helpSteps(), this.phase.type === 'grade' ? GRID_BALLOON_W : undefined)
        if (gen !== this.gen) return
        this.waitPick()
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
        void FX.confetti(this, { colors: [C.butter, C.sky, C.lilac, C.amarela, C.azul, C.rosa, C.leaf] })
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
            progress: Math.min(100, Math.round((this.solved / this.level.phases.length) * 100)),
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
