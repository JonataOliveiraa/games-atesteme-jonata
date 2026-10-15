import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { BG } from '../data/files'
import { LEVELS, POINTS, answerOf, guideKey, isLoop, trace } from '../data/levels'
import { BALLOON, H, STAMPS, W } from '../data/layout'
import { C, CSS } from '../data/theme'
import { HELP, TEACH, WRONG_STAMP, wrongAnswer } from '../data/words'
import type { Fig, LevelDef, Mode, Order, Step } from '../types'

import { createAnswers, type Answers } from './answers'
import { createAudio, type Audio } from './audio'
import { showBanner } from './banner'
import { createClothesline, type Clothesline } from './clothesline'
import { createFabric, type Fabric } from './fabric'
import { spot, teach } from './guide'
import { createHud, type Hud } from './hud'
import { drawLink, drawLoopBack } from './link'
import { createOrderCard, type OrderCard } from './order'
import { createStamps, type Stamps } from './stamps'
import { createVeil, type Veil } from './veil'
import { createWorker, type Worker } from './worker'

const GAME_ID = 'fabrica-de-estampas'
const STAMP_ERROR_MS = 1500
const ANSWER_ERROR_MS = 1500
const RIGHT_MS = 700
const FINALE_MS = 1500

export class GameScene extends Phaser.Scene {
    private livesTotal = 1
    private livesLeft = 1

    private level!: LevelDef
    private index = 0
    private mode: Mode = 'intro'
    private gen = 0
    private guiding = false
    private introduce = false

    private current?: Order
    private steps: Step[] = []
    private cursor = 0
    /** quantas voltas de cada laço já fecharam (os botões costurados) */
    private filled = new Map<string, number>()
    private bundle?: Phaser.GameObjects.Image

    private score = 0
    private hits = 0
    private errors = 0

    private audio!: Audio
    private order!: OrderCard
    private fabric!: Fabric
    private stamps!: Stamps
    private answers!: Answers
    private line!: Clothesline
    private worker!: Worker
    private veil!: Veil
    private hud!: Hud
    private banner?: Phaser.GameObjects.Container
    private link?: Phaser.GameObjects.Graphics

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]
        this.index = 0
        this.mode = 'intro'
        this.guiding = false
        this.introduce = false
        this.current = undefined
        this.steps = []
        this.cursor = 0
        this.filled = new Map()
        this.bundle = undefined
        this.banner = undefined
        this.link = undefined
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.unsubPlatform = undefined
    }

    create() {
        this.input.topOnly = true
        this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H)
        this.audio = createAudio()
        this.fabric = createFabric(this, () => this.audio.belt())
        this.order = createOrderCard(this)
        this.line = createClothesline(this, () => this.audio.roll())
        this.answers = createAnswers(this)
        this.stamps = createStamps(this)
        this.worker = createWorker(this)
        this.veil = createVeil(this)
        this.stamps.onPick(fig => void this.onStamp(fig))
        this.answers.onPick(i => void this.onAnswer(i))
        this.hud = createHud(this, {
            phases: this.level.orders.length,
            level: this.level.level,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.hud.setHelpEnabled(false)

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

    private shutdownScene() {
        this.gen++
        this.hud?.destroy()
        this.banner?.destroy()
        this.link?.destroy()
        this.answers?.destroy()
        this.stamps?.destroy()
        this.line?.destroy()
        this.order?.destroy()
        this.fabric?.destroy()
        this.worker?.destroy()
        this.veil?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    // ───────────────────────────────────────────── nível e pedidos

    private async openLevel() {
        const gen = ++this.gen
        this.mode = 'intro'
        await FX.wait(this, 300)
        if (gen !== this.gen) return
        this.worker.pose('wave')
        if (this.introduce && this.level.demo) {
            await this.tutorial(gen, this.level.demo)
            if (gen !== this.gen) return
        }
        void this.startOrder(0)
    }

    /** o papel do pedido entra, o tecido sai do rolo e os carimbos ficam à mão */
    private async loadOrder(order: Order) {
        this.current = order
        this.steps = trace(order.loop)
        this.cursor = 0
        this.filled = new Map()
        this.audio.paper()
        await FX.all(this.order.set(order.loop), this.stamps.show())
        await this.fabric.start(this.steps.length)
    }

    private async startOrder(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'busy'
        this.hud.setPhase(index)
        this.hud.setHelpEnabled(false)
        this.stamps.setEnabled(false)
        this.emitCheckpoint()
        await this.loadOrder(this.level.orders[index])
        if (gen !== this.gen) return
        if (this.introduce && index === 0) {
            if (!this.level.demo) await this.firstTurn(gen)
            if (gen !== this.gen) return
            await this.lesson(gen, [{ text: TEACH.yourTurn, ...spot(this.order.rect()), ...BALLOON.low, buttonLabel: 'Vamos lá!' }])
            if (gen !== this.gen) return
        }
        this.ready()
    }

    private ready() {
        this.mode = 'stamp'
        this.stamps.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private async lesson(gen: number, steps: Parameters<typeof teach>[2]) {
        const before = this.mode
        this.mode = 'guide'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, guideKey(this.level.level), steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
    }

    // ───────────────────────────────────────────── tutorial do N1: um ciclo inteiro com a ordem de treino

    private async tutorial(gen: number, demo: Order) {
        this.mode = 'guide'
        await this.loadOrder(demo)
        if (gen !== this.gen) return
        await this.lesson(gen, [{ text: TEACH.start, ...spot(this.order.rect()), ...BALLOON.low, buttonLabel: 'Ver' }])
        if (gen !== this.gen) return

        for (const step of this.steps) {
            await this.stamps.ring(step.fig)
            if (gen !== this.gen) return
            await this.stampOnce(step.fig, step)
            await this.closeTurns(step)
            if (gen !== this.gen) return
            if (this.cursor + 1 < this.steps.length) {
                this.cursor += 1
                await this.fabric.advance()
            }
            if (gen !== this.gen) return
        }
        await FX.wait(this, 300)
        const fig = this.steps[0].fig
        await this.lesson(gen, [
            { text: TEACH.times(demo.loop.times, fig), ...spot(this.order.tabRect('')), ...BALLOON.low, buttonLabel: 'Ver' },
        ])
        if (gen !== this.gen) return

        await this.rollAndAsk(gen)
        if (gen !== this.gen) return
        await FX.wait(this, 600)
        const right = answerOf(demo.question, this.steps)
        await this.answers.ring(right)
        this.audio.tap()
        this.answers.press(right)
        await this.check()
        if (gen !== this.gen) return
        this.audio.cheer()
        this.worker.pose('cheer')
        void this.veil.hide()
        await this.answers.mark(right, true)
        await FX.wait(this, RIGHT_MS)
        if (gen !== this.gen) return
        await this.clearOrder()
    }

    /** o laço de dentro do pedido atual (N3), pelo caminho */
    private innerPath() {
        const i = this.current?.loop.body.findIndex(isLoop) ?? -1
        return i < 0 ? undefined : `${i}`
    }

    /**
     * A estreia do N2 e do N3: o próprio jogo carimba a 1ª volta do 1º pedido, e a criança
     * continua dali. No N2, a seta mostra o bloco voltando ao começo; no N3, os botões do
     * laço de dentro saltam fora quando a volta de fora fecha.
     */
    private async firstTurn(gen: number) {
        const inner = this.innerPath()
        const first = inner
            ? { text: TEACH.nested, ...spot(this.order.loopRect(inner)), ...BALLOON.low, buttonLabel: 'Ver' }
            : { text: TEACH.block, ...spot(this.order.rect()), ...BALLOON.low, buttonLabel: 'Ver' }
        await this.lesson(gen, [first])
        if (gen !== this.gen) return
        for (;;) {
            const step = this.steps[this.cursor]
            await this.stamps.ring(step.fig)
            if (gen !== this.gen) return
            await this.stampOnce(step.fig, step)
            const closesTurn = step.closes.includes('')
            const arc =
                closesTurn && !inner
                    ? drawLoopBack(this, this.order.figPos(step.at), this.order.figPos('0'), 56)
                    : undefined
            await this.closeTurns(step)
            if (gen !== this.gen) return
            if (arc) {
                const g = await arc
                await FX.wait(this, 600)
                void FX.to(this, g, { alpha: 0 }, { duration: 300 }).then(() => g.destroy())
            }
            this.cursor += 1
            await this.fabric.advance()
            if (gen !== this.gen || closesTurn) break
        }
        if (gen !== this.gen || !inner) return
        await FX.wait(this, 300)
        await this.lesson(gen, [{ text: TEACH.restart, ...spot(this.order.tabRect(inner)), ...BALLOON.low, buttonLabel: 'Próximo' }])
    }

    // ───────────────────────────────────────────── carimbar

    private async onStamp(fig: Fig) {
        if (this.mode !== 'stamp' || this.guiding) return
        const gen = this.gen
        this.mode = 'busy'
        this.stamps.setEnabled(false)
        this.hud.setHelpEnabled(false)
        const step = this.steps[this.cursor]
        const ok = await this.stampOnce(fig, step)
        if (gen !== this.gen) return
        if (!ok) {
            void this.jamStamp(step)
            return
        }
        this.score += POINTS.stamp
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS.stamp, stage: this.level.level })
        await this.closeTurns(step)
        if (gen !== this.gen) return
        if (this.cursor + 1 < this.steps.length) {
            this.cursor += 1
            await this.fabric.advance()
            if (gen !== this.gen) return
            this.ready()
            return
        }
        await this.rollAndAsk(gen)
        if (gen !== this.gen) return
        this.mode = 'ask'
        this.answers.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    /** o carimbo voa até a janela e bate: certo deixa a estampa, errado deixa o borrão */
    private async stampOnce(fig: Fig, step: Step) {
        const at = this.cursor
        const p = this.fabric.squarePos(at)
        const ok = fig === step.fig
        await this.stamps.strike(
            fig,
            { x: p.x, y: p.y + STAMPS.strikeDy },
            () => {
                this.audio.tum()
                if (ok) this.fabric.print(at, fig)
                else this.fabric.smudge(at, fig)
            },
            () => this.audio.plic(),
        )
        return ok
    }

    /** a volta fechou: botão na aba, emenda no tecido, e o laço de dentro recomeça */
    private async closeTurns(step: Step) {
        const jobs: Array<Promise<unknown>> = []
        step.closes.forEach(path => {
            const n = (this.filled.get(path) ?? 0) + 1
            this.filled.set(path, n)
            jobs.push(this.order.sew(path, n - 1))
            this.audio.plim()
            if (path !== '') return
            if (this.cursor < this.steps.length - 1) {
                this.audio.zip()
                jobs.push(this.fabric.seam(this.cursor))
            }
            ;[...this.filled.keys()]
                .filter(p => p !== '' && this.filled.get(p))
                .forEach(p => {
                    this.filled.set(p, 0)
                    jobs.push(
                        FX.wait(this, 320).then(() => {
                            this.audio.pops()
                            return this.order.unsew(p)
                        }),
                    )
                })
        })
        await FX.all(...jobs)
    }

    // ───────────────────────────────────────────── a pergunta e o varal

    private async rollAndAsk(gen: number) {
        this.mode = 'busy'
        await FX.wait(this, 250)
        await this.stamps.hide()
        if (gen !== this.gen) return
        this.audio.roll()
        this.bundle = await this.fabric.rollUp()
        if (gen !== this.gen || !this.current) return
        void this.veil.show()
        this.audio.bell()
        this.worker.pose('think')
        await this.answers.ask(this.current.question)
    }

    /** o rolo abre no varal e o jogo conta, figura por figura */
    private async check() {
        const q = this.current?.question
        if (!q || !this.bundle) return []
        const figs = this.steps.map(s => s.fig)
        const ends = this.steps.flatMap((s, k) => (s.closes.includes('') ? [k] : []))
        await this.answers.fold()
        await this.line.hang(figs, ends, this.bundle)
        const counts: number[] = []
        for (const fig of q.kind === 'count' ? [q.fig] : [q.a, q.b]) {
            counts.push(await this.line.count(fig, n => this.audio.note(n - 1)))
            await FX.wait(this, 220)
        }
        return counts
    }

    private async onAnswer(i: number) {
        if (this.mode !== 'ask' || this.guiding || !this.current) return
        const gen = this.gen
        const q = this.current.question
        this.mode = 'check'
        this.answers.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.tap()
        this.answers.press(i)
        const counts = await this.check()
        if (gen !== this.gen) return
        if (i !== answerOf(q, this.steps)) {
            void this.jamAnswer(i, wrongAnswer(q, counts))
            return
        }
        this.score += POINTS.answer
        this.hits += 1
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: POINTS.answer, stage: this.level.level })
        this.audio.cheer()
        this.worker.pose('cheer')
        void this.veil.hide()
        await this.answers.mark(i, true)
        await FX.wait(this, RIGHT_MS)
        if (gen !== this.gen) return
        await this.hud.celebrate(this.index)
        if (gen !== this.gen) return
        if (this.index + 1 < this.level.orders.length) {
            await this.clearOrder()
            if (gen !== this.gen) return
            void this.startOrder(this.index + 1)
            return
        }
        this.index += 1
        this.emitCheckpoint()
        void this.endLevel()
    }

    private async clearOrder() {
        await FX.all(this.answers.hide(), this.line.leave(), this.order.leave(), this.veil.hide())
        this.fabric.clear()
        this.bundle = undefined
        this.worker.pose('wave')
    }

    // ───────────────────────────────────────────── erro

    private async jamStamp(step: Step) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.audio.blom()
        this.worker.pose('oops')
        void this.fabric.shake(this.cursor)
        await FX.wait(this, 250)
        if (gen !== this.gen) return
        const from = this.order.light(step.at)
        const to = this.fabric.squarePos(this.cursor)
        this.link = drawLink(this, { x: from.x, y: from.y + 44 }, { x: to.x, y: to.y - 52 })
        this.banner = showBanner(this, WRONG_STAMP[step.why](step.fig))
        await FX.wait(this, STAMP_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private async jamAnswer(i: number, text: string) {
        const gen = ++this.gen
        this.mode = 'jam'
        this.audio.blom()
        this.worker.pose('oops')
        void this.answers.mark(i, false)
        this.banner = showBanner(this, text)
        await FX.wait(this, ANSWER_ERROR_MS)
        if (gen !== this.gen) return
        this.lose()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.hud.setHelpEnabled(false)
        this.stamps.setEnabled(false)
        this.answers.setEnabled(false)
        this.audio.lose()
        this.errors += 1
        runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -5, stage: this.level.level })
        this.hud.lives.lose()
        this.livesLeft = this.hud.lives.remaining
    }

    // ───────────────────────────────────────────── ajuda

    private async explain() {
        if ((this.mode !== 'stamp' && this.mode !== 'ask') || this.guiding) return
        const gen = this.gen
        const before = this.mode
        this.stamps.setEnabled(false)
        this.answers.setEnabled(false)
        const steps: Parameters<typeof teach>[2] =
            before === 'ask'
                ? [{ text: HELP.ask, ...spot(this.order.rect()), ...BALLOON.low, buttonLabel: 'Continuar' }]
                : this.helpSteps()
        this.mode = 'panel'
        this.guiding = true
        this.hud.setHelpEnabled(false)
        await teach(this, `${guideKey(this.level.level)}-help`, steps)
        this.guiding = false
        if (gen !== this.gen) return
        this.mode = before
        if (before === 'stamp') this.stamps.setEnabled(true)
        else this.answers.setEnabled(true)
        this.hud.setHelpEnabled(true)
    }

    private helpSteps(): Parameters<typeof teach>[2] {
        const inner = this.innerPath()
        const steps: Parameters<typeof teach>[2] = [
            { text: HELP.order, ...spot(this.order.rect()), ...BALLOON.low, buttonLabel: 'Próximo' },
            { text: HELP.tab, ...spot(this.order.tabRect('')), ...BALLOON.low, buttonLabel: 'Próximo' },
        ]
        if (inner) steps.push({ text: HELP.inner, ...spot(this.order.loopRect(inner)), ...BALLOON.low, buttonLabel: 'Próximo' })
        else if (this.level.level > 1) steps.push({ text: HELP.block, ...spot(this.order.loopRect('')), ...BALLOON.low, buttonLabel: 'Próximo' })
        steps[steps.length - 1].buttonLabel = 'Continuar'
        return steps
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
        await this.answers.hide()
        if (gen !== this.gen) return
        this.audio.win()
        void FX.confetti(this, { colors: [C.flower, C.star, C.heart, C.outer, C.mint, 0xffffff] })
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
            progress: Math.min(100, Math.round((this.index / this.level.orders.length) * 100)),
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
