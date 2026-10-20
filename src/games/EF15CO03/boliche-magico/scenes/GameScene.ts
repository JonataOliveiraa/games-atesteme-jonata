import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'
import type { TutorialStep } from '../../../../shared/tutorial/createTutorial'

import { BALL } from '../data/layout'
import { LEVELS, OPENING_KEY, POINTS, guideKey } from '../data/levels'
import { has, holds, sameTerm } from '../data/logic'
import { C, CSS } from '../data/theme'
import { TIMING } from '../data/timing'
import { OPENING, TEACH, why } from '../data/words'
import type { Demo, LevelDef, Miss, PhaseDef, Rack, Rect, Sentence, State, Teach } from '../types'

import { createAudio, type Audio } from './audio'
import { createBall, type Ball } from './ball'
import { createBanner, type Banner } from './banner'
import { createBench, type Bench } from './bench'
import { createBubble, type Bubble } from './bubble'
import { spot, teach } from './guide'
import { createHeader, type Header } from './header'
import { createLane, type Lane } from './lane'
import { createPins, type Pins } from './pins'
import { createSign, type Sign } from './sign'
import { createTouch, type Touch } from './touch'
import { createView, type View } from './view'

const GAME_ID = 'boliche-magico'

type Outcome = { ok: true } | { ok: false; index: number; miss: Miss }

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private phaseIndex = 0
    private state: State = 'intro'
    private gen = 0
    private introduce = false
    private opening = false
    private busy = false

    private rack!: Rack
    private pick: number | null = null
    private notOn = false

    private score = 0
    private hits = 0
    private errors = 0
    private cleared = 0

    private view!: View
    private lane!: Lane
    private pins!: Pins
    private ball!: Ball
    private bench!: Bench
    private header!: Header
    private sign!: Sign
    private bubble!: Bubble
    private banner!: Banner
    private touch!: Touch
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
        this.busy = false
        this.pick = null
        this.notOn = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cleared = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.audio = createAudio()
        this.view = createView(this)
        this.lane = createLane(this, this.view)
        this.pins = createPins(this, this.view, () => this.audio.drop())
        this.ball = createBall(this, this.view, ms => this.audio.roll(ms))
        this.bench = createBench(this)
        this.header = createHeader(this, {
            level: this.level.level,
            phases: this.level.phases.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.sign = createSign(this)
        this.bubble = createBubble(this)
        this.banner = createBanner(this)
        this.touch = createTouch(this)
        this.header.setHelpEnabled(false)

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
        this.touch?.destroy()
        this.banner?.destroy()
        this.bubble?.destroy()
        this.sign?.destroy()
        this.header?.destroy()
        this.bench?.destroy()
        this.ball?.destroy()
        this.pins?.destroy()
        this.lane?.destroy()
        this.view?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    update() {
        this.view?.sort()
    }

    // ───────────────────────────────────────────── fase

    private async setRack(rack: Rack) {
        this.rack = rack
        this.pick = null
        this.notOn = false
        this.sign.reset()
        this.bench.build(rack)
        this.bench.disable()
        await this.pins.set(rack.pins)
    }

    private async startPhase(gen: number, index: number) {
        this.phaseIndex = index
        const phase = this.phase
        this.state = 'intro'
        this.header.setHelpEnabled(false)
        this.header.setPhase(index)
        this.banner.clear()
        this.ball.place(BALL.x)
        this.ball.setFace('normal')
        const demo = this.introduce ? phase.demo : undefined
        const opened = index === 0 && this.opening

        if (opened) {
            this.header.visible(false)
            this.sign.visible(false)
            void this.bench.hide()
        }
        await this.setRack(demo ? demo.rack : phase.rack)
        if (gen !== this.gen) return
        if (opened) {
            await this.playOpening(gen)
            if (gen !== this.gen) return
        }

        if (demo && phase.teach) {
            await teach(this, guideKey(this.level.level), this.teachSteps(phase.teach, 'Ver'))
            if (gen !== this.gen) return
            await this.demo(gen, demo)
            if (gen !== this.gen) return
            await this.sweep(gen)
            if (gen !== this.gen) return
            await this.setRack(phase.rack)
            if (gen !== this.gen) return
            await this.bench.show()
            if (gen !== this.gen) return
            await teach(this, guideKey(this.level.level), [
                { text: TEACH.go, ...spot(this.bench.rect(), 6), balloonY: 300, buttonLabel: 'Vamos!' },
            ])
            if (gen !== this.gen) return
        } else {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
        }
        this.play()
    }

    private teachSteps(topic: Teach, last: string): TutorialStep[] {
        const steps: TutorialStep[] = []
        if (topic === 'build') {
            steps.push({ text: TEACH.goal, ...spot(this.pins.sleepyRect(), 10), balloonY: 568, buttonLabel: 'Próximo' })
            steps.push({ text: TEACH.build, ...spot(this.bench.rect(), 6), balloonY: 300, buttonLabel: last })
        } else {
            steps.push({ text: TEACH.not, ...spot(this.bench.notRect() ?? this.bench.rect(), 6), balloonY: 300, buttonLabel: last })
        }
        return steps
    }

    private async playOpening(gen: number) {
        await FX.wait(this, 500)
        if (gen !== this.gen) return
        this.audio.whoosh()
        await this.view.close({ x: 430, y: 420 })
        if (gen !== this.gen) return
        await this.ballSays(OPENING.hello)
        if (gen !== this.gen) return
        const sleepy = this.pins.list().flatMap((v, i) => (v.def.sleepy ? [i] : []))
        void FX.all(...sleepy.map(i => this.pins.bounce(i)))
        await this.ballSays(OPENING.sleepy)
        if (gen !== this.gen) return
        void this.ball.cheer()
        this.ball.setFace('happy')
        await this.ballSays(OPENING.rule)
        if (gen !== this.gen) return
        this.ball.setFace('normal')
        await this.view.open()
        if (gen !== this.gen) return
        this.header.visible(true)
        this.sign.visible(true)
        await this.bench.show()
    }

    private ballSays(text: string) {
        const head = this.ball.head()
        return this.bubble.say(text, { x: head.x + 40, y: head.y - 6 }, 'Próximo')
    }

    private play() {
        this.state = 'build'
        this.busy = false
        this.header.setHelpEnabled(true)
        void this.bench.show()
        this.bench.paint(this.pick, this.notOn)
        this.bench.enable({
            onCard: i => void this.onCard(i),
            onNot: () => void this.onNot(),
            onPlay: () => void this.onPlay(),
        })
    }

    // ───────────────────────────────────────────── montar a frase

    private sentence(): Sentence | null {
        if (this.pick === null) return null
        return { left: { not: this.notOn, term: this.rack.cards[this.pick] } }
    }

    private async pickCard(index: number) {
        if (this.pick === index) return
        this.pick = index
        this.bench.paint(this.pick, this.notOn)
        this.audio.pick()
        await this.sign.setTerm(this.rack.cards[index], this.bench.cardPos(index))
    }

    private async toggleNot() {
        this.notOn = !this.notOn
        this.bench.paint(this.pick, this.notOn)
        if (this.notOn) this.audio.pick()
        else this.audio.unpick()
        await this.sign.setNot(this.notOn, this.bench.notPos())
    }

    private async onCard(index: number) {
        if (this.state !== 'build' || this.busy) return
        this.busy = true
        this.bench.press('card', index)
        await this.pickCard(index)
        this.busy = false
    }

    private async onNot() {
        if (this.state !== 'build' || this.busy) return
        this.busy = true
        this.bench.press('not')
        await this.toggleNot()
        this.busy = false
    }

    private async onPlay() {
        if (this.state !== 'build' || this.busy || this.pick === null) return
        const gen = this.gen
        this.state = 'roll'
        this.bench.press('play')
        this.bench.disable()
        this.header.setHelpEnabled(false)
        this.audio.play()
        const outcome = await this.roll(gen)
        if (gen !== this.gen) return
        if (outcome.ok) await this.finishPhase(gen)
        else await this.miss(gen, outcome.index, outcome.miss)
    }

    // ───────────────────────────────────────────── a jogada

    private async roll(gen: number): Promise<Outcome> {
        const s = this.sentence()
        if (!s) return { ok: true }
        const lit = s.left
        await this.bench.hide()
        if (gen !== this.gen) return { ok: true }
        this.ball.setFace('rolling')
        const list = this.pins.list()
        for (let i = 0; i < list.length; i++) {
            const v = list[i]
            await this.ball.rollTo(v.x - BALL.stopGap, i === 0 ? TIMING.approach * 1.4 : TIMING.approach)
            if (gen !== this.gen) return { ok: true }
            await FX.wait(this, TIMING.pause)
            if (gen !== this.gen) return { ok: true }
            await FX.all(this.sign.bounce(), this.pins.bounce(i))
            if (gen !== this.gen) return { ok: true }
            const value = has(v.def, lit.term)
            if (value) this.audio.yes()
            else this.audio.no()
            await this.sign.mark(value)
            if (gen !== this.gen) return { ok: true }
            await FX.wait(this, TIMING.mark)
            if (gen !== this.gen) return { ok: true }
            if (lit.not) {
                this.audio.flip()
                await this.sign.flip(!value)
                if (gen !== this.gen) return { ok: true }
                await FX.wait(this, TIMING.mark)
                if (gen !== this.gen) return { ok: true }
            }
            if (holds(s, v.def)) {
                await this.ball.rollTo(v.x - BALL.r - 18, TIMING.hit, 'Quad.easeIn')
                if (gen !== this.gen) return { ok: true }
                this.audio.knock()
                const knocked = this.pins.knock(i)
                if (!v.def.sleepy) {
                    await knocked
                    this.audio.dizzy()
                    return { ok: false, index: i, miss: 'knocked' }
                }
                await FX.wait(this, 140)
                if (gen !== this.gen) return { ok: true }
                void knocked.then(() => this.audio.snore())
            } else {
                this.audio.hop()
                const hop = this.pins.hop(i, TIMING.hop)
                await FX.wait(this, TIMING.hop * 0.15)
                if (gen !== this.gen) return { ok: true }
                await this.ball.rollTo(v.x + BALL.r + 34, TIMING.pass * 0.7, 'Linear')
                if (gen !== this.gen) return { ok: true }
                await hop
                if (gen !== this.gen) return { ok: true }
                this.audio.land()
                if (v.def.sleepy) {
                    await this.pins.sulk(i)
                    return { ok: false, index: i, miss: 'stayed' }
                }
            }
            this.sign.clearMarks()
        }
        await this.ball.exit()
        if (gen !== this.gen) return { ok: true }
        this.audio.pit()
        return { ok: true }
    }

    private async demo(gen: number, demo: Demo) {
        this.state = 'demo'
        const lit = demo.script.left
        const index = this.rack.cards.findIndex(t => sameTerm(t, lit.term))
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.touch.tap(this.bench.cardPos(index))
        if (gen !== this.gen) return
        this.bench.press('card', index)
        await this.pickCard(index)
        if (gen !== this.gen) return
        if (lit.not) {
            await FX.wait(this, TIMING.beat)
            if (gen !== this.gen) return
            await this.touch.tap(this.bench.notPos())
            if (gen !== this.gen) return
            this.bench.press('not')
            await this.toggleNot()
            if (gen !== this.gen) return
        }
        await FX.wait(this, TIMING.beat)
        if (gen !== this.gen) return
        await this.touch.tap(this.bench.playPos())
        if (gen !== this.gen) return
        this.bench.press('play')
        this.audio.play()
        this.touch.stop()
        const outcome = await this.roll(gen)
        if (gen !== this.gen || !outcome.ok) return
        await this.party(gen)
    }

    private async party(gen: number) {
        this.audio.good()
        this.sign.clearMarks()
        await FX.all(this.pins.celebrate(), this.ball.comeBack())
        if (gen !== this.gen) return
        this.ball.setFace('happy')
        await this.ball.cheer()
        if (gen !== this.gen) return
        await FX.wait(this, TIMING.party)
        if (gen !== this.gen) return
        this.ball.setFace('normal')
    }

    private async sweep(gen: number) {
        this.audio.sweep()
        await this.lane.sweep(x => this.pins.push(x))
        if (gen !== this.gen) return
        this.pins.clear()
        this.sign.reset()
    }

    private async finishPhase(gen: number) {
        this.state = 'done'
        const at = this.view.toScreen(760, 300)
        void FX.sparks(this, at.x, at.y, { color: C.yes, count: 18, spread: 200, size: 10, depth: 80 })
        this.score += POINTS
        this.hits += 1
        this.cleared += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS, stage: this.level.level })
        this.emitCheckpoint()
        void this.header.celebrate(this.phaseIndex)
        await this.party(gen)
        if (gen !== this.gen) return
        if (this.phaseIndex >= this.level.phases.length - 1) {
            void this.endLevel()
            return
        }
        await this.sweep(gen)
        if (gen !== this.gen) return
        await this.startPhase(gen, this.phaseIndex + 1)
    }

    // ───────────────────────────────────────────── erro

    private async miss(gen: number, index: number, miss: Miss) {
        this.state = 'error'
        const lit = this.sentence()?.left
        const v = this.pins.list()[index]
        if (!lit || !v) return
        this.sign.blame(lit.not)
        this.ball.setFace('oops')
        this.banner.say(why(v.def, lit, miss))
        await FX.wait(this, TIMING.error)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.state = 'done'
        this.header.setHelpEnabled(false)
        this.bench.disable()
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.header.lives.lose()
        this.livesLeft = this.header.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if (this.state !== 'build' || this.busy) return
        const gen = this.gen
        this.state = 'help'
        this.bench.disable()
        this.header.setHelpEnabled(false)
        const steps: TutorialStep[] = [
            { text: TEACH.goal, ...spot(this.pins.sleepyRect(), 10), balloonY: 568, buttonLabel: 'Próximo' },
            { text: TEACH.build, ...spot(this.bench.rect(), 6), balloonY: 300, buttonLabel: 'Próximo' },
        ]
        const notRect: Rect | null = this.bench.notRect()
        if (notRect) steps.push({ text: TEACH.not, ...spot(notRect, 6), balloonY: 300, buttonLabel: 'Próximo' })
        steps[steps.length - 1].buttonLabel = 'Continuar'
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
        this.audio.win()
        void FX.confetti(this, { colors: [C.butter, C.sky, C.lilac, C.azul, C.verde, C.vermelho] })
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
