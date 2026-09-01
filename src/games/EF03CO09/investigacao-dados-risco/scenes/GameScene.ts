import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES, riskyOf } from '../data/levels'
import { C, SIZE, hex } from '../data/theme'
import { HUD, MSG, WATCH, OPT } from '../data/layout'
import type { Caso, CaseState, Chunk, Level } from '../types'

import {
    createScene, createHud, createQuestionLine, createPost, createImpactCard,
    createWatchers, createIcon, showToast,
    type Hud, type QuestionLine, type PostView, type ImpactCard, type Watchers,
} from './effects'

const GAME_ID = 'investigacao-dados-risco'

const POINTS = {
    find: 20,
    choose: 20,
    miss: -5,
} as const

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'briefing'
    private locked = false
    private ended = false

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private question!: QuestionLine
    private impact!: ImpactCard
    private watchers!: Watchers
    private modal?: LevelCompleteHandle

    /* ── tabuleiro do caso ─────────────────────────────────────────── */

    private post?: PostView
    private options: PostView[] = []
    private optionZones: Phaser.GameObjects.Zone[] = []
    private optionSeals: Phaser.GameObjects.Container[] = []
    private found = new Set<string>()

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * `level` é 1-based e `phase` é 0-based. Os dois são grampeados ao que
     * existe de verdade: um `phase: 7` num nível de três casos faria
     * `this.caso` devolver `undefined`, e o estouro apareceria três telas
     * adiante sem nenhuma pista de que veio daqui.
     */
    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.caseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].cases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'briefing'
        this.locked = false
        this.ended = false
        this.gen = 0
        this.found = new Set()
        this.options = []
        this.optionZones = []
        this.optionSeals = []
        this.modal = undefined
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createScene(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.question = createQuestionLine(this)
        this.impact = createImpactCard(this)
        this.watchers = createWatchers(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer.
        void this.playCase(this.caseIdx === 0)
    }

    private shutdownScene() {
        this.gen += 1
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════ atalhos de estado */

    private get level(): Level { return LEVELS[this.levelIdx] }
    private get caso(): Caso { return this.level.cases[this.caseIdx] }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearBoard() {
        this.post?.destroy()
        this.post = undefined
        this.options.forEach(o => o.destroy())
        this.options = []
        this.optionZones.forEach(z => z.destroy())
        this.optionZones = []
        this.optionSeals.forEach(s => s.destroy())
        this.optionSeals = []
        this.impact.hide()
        this.watchers.clear()
        this.found.clear()
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen
        const caso = this.caso

        this.state = 'briefing'
        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, o caso que
         * termina bem deixa a trava ligada e o seguinte monta a tela inteira
         * sem aceitar um toque.
         */
        this.locked = false
        this.clearBoard()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.emitCheckpoint()

        if (caso.kind === 'achar') this.buildPost()
        else this.buildOptions()

        await this.question.show(caso.question)
        if (gen !== this.gen) return

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'investigando'
                })
                return
            }
        }

        this.state = 'investigando'
    }

    /* ─────────────────────────────────────────── montagem: achar */

    private buildPost() {
        const message = this.caso.message
        if (!message) return

        this.post = createPost(this, message, {
            cx: MSG.cx, cy: MSG.cy, w: MSG.w, h: MSG.h,
            wrap: MSG.wrap, lineH: MSG.lineH, textCY: MSG.textCY,
            fromDY: MSG.fromDY, avatarX: MSG.avatarX, fromX: MSG.fromX,
            avatarSize: MSG.avatarSize,
            fontSize: SIZE.msg, tone: C.probe,
            onTap: chunk => void this.onChunkTap(chunk),
        })

        FX.popIn(this, this.post.container, { from: 0.9, duration: 380 })
    }

    /* ─────────────────────────────────────── montagem: escolher */

    private buildOptions() {
        const list = this.caso.options ?? []
        const startX = 640 - ((list.length - 1) * (OPT.w + OPT.gap)) / 2

        list.forEach((message, i) => {
            const x = startX + i * (OPT.w + OPT.gap)

            const view = createPost(this, message, {
                cx: x, cy: OPT.cy, w: OPT.w, h: OPT.h,
                wrap: OPT.wrap, lineH: OPT.lineH, textCY: OPT.textCY,
                fromDY: OPT.fromDY, avatarX: OPT.avatarX, fromX: OPT.fromX,
                avatarSize: OPT.avatarSize,
                fontSize: SIZE.optMsg, tone: C.probe,
            })
            this.options.push(view)

            // No N3 quem se toca é o cartão inteiro, e não um pedaço: a
            // pergunta é sobre a mensagem toda, não sobre uma palavra dela.
            const zone = this.add.zone(x, OPT.cy, OPT.w, OPT.h).setOrigin(0.5).setDepth(32)
            zone.setInteractive({ useHandCursor: true })
            zone.on('pointerover', () => {
                if (this.state !== 'investigando' || this.locked) return
                FX.to(this, view.container, { scale: 1.03 }, { duration: 130 })
            })
            zone.on('pointerout', () => {
                if (this.state !== 'investigando' || this.locked) return
                FX.to(this, view.container, { scale: 1 }, { duration: 130 })
            })
            zone.on('pointerup', () => {
                if (this.state !== 'investigando' || this.locked) return
                FX.press(this, view.container)
                void this.onOptionTap(i)
            })
            this.optionZones.push(zone)

            const seal = this.add.container(x, OPT.cy + OPT.sealDY).setDepth(45).setVisible(false)
            this.optionSeals.push(seal)

            FX.popIn(this, view.container, { from: 0.88, delay: 120 + i * 110, duration: 400 })
        })
    }

    /* ═══════════════════════════════════════════ tocar num pedaço */

    private async onChunkTap(chunk: Chunk) {
        if (this.state !== 'investigando' || this.locked || this.ended) return
        if (this.found.has(chunk.id)) return

        const gen = this.gen

        // ── pedaço que pode ser postado ────────────────────────────────
        if (!chunk.risky) {
            this.errors += 1
            this.points += POINTS.miss
            this.playSoft()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
            this.emitCheckpoint()

            void this.post?.nudge(chunk.id)
            showToast(this, chunk.safe ?? 'Esse pedaço pode ser postado.', C.safe, 2400)
            return
        }

        // ── dado exposto ───────────────────────────────────────────────
        this.found.add(chunk.id)
        this.hits += 1
        this.points += POINTS.find
        this.state = 'revelando'
        this.locked = true
        this.post?.setEnabled(false)
        this.playFound()

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.find, stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.post?.markFound(chunk.id)
        if (gen !== this.gen) return

        FX.popText(this, MSG.cx + 420, MSG.cy - 100, `+${POINTS.find}`, {
            color: hex(C.safe), size: '32px',
        })

        await this.impact.show(chunk.impact ?? '')
        if (gen !== this.gen) return

        // o impacto virado em quantidade: a criança não lê que foi grave,
        // ela vê seis pessoas que não conhece aparecerem
        await this.watchers.add(chunk.watchers ?? 4)
        if (gen !== this.gen) return

        const total = riskyOf(this.caso).length
        if (this.found.size >= total) {
            await FX.wait(this, 700)
            if (gen !== this.gen) return
            void this.solve()
            return
        }

        showToast(this, `Achou ${this.found.size} de ${total}. Tem mais neste post.`,
            C.probe, 2000)

        this.state = 'investigando'
        this.locked = false
        this.post?.setEnabled(true)
    }

    /* ═══════════════════════════════════════════ escolher a versão */

    private async onOptionTap(index: number) {
        const caso = this.caso
        const list = caso.options ?? []
        const message = list[index]
        if (!message) return

        const gen = this.gen
        const right = index === caso.safeIndex
        this.locked = true

        const seal = this.optionSeals[index]
        seal.removeAll(true)
        seal.add(createIcon(this, right ? 'chave' : 'alerta', OPT.sealSize))
        seal.setVisible(true)
        void FX.popIn(this, seal, { from: 0.3, duration: 320 })

        if (right) {
            this.hits += 1
            this.points += POINTS.choose
            this.playFound()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.choose, stage: this.level.level,
            })
            this.emitCheckpoint()

            this.state = 'revelando'
            void FX.sparks(this, this.optionZones[index].x, OPT.cy, {
                color: C.safe, count: 20, spread: 190,
            })
            showToast(this, message.why ?? '', C.safe, 2400)

            await FX.wait(this, 1900)
            if (gen !== this.gen) return
            void this.solve()
            return
        }

        this.errors += 1
        this.points += POINTS.miss
        this.playSoft()
        FX.shakeCam(this, 'leve')
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.miss, stage: this.level.level,
        })
        this.emitCheckpoint()

        void FX.shake(this, this.options[index].container, { amount: 9, times: 3 })
        showToast(this, message.why ?? '', C.risk, 2600)

        // errar não repete o caso nem trava: o selo some e a criança tenta a
        // outra versão, que é justamente a comparação que o nível pede
        await FX.wait(this, 1700)
        if (gen !== this.gen) return
        await FX.to(this, seal, { alpha: 0, scale: 0.6 }, { duration: 220 })
        if (gen !== this.gen) return
        seal.setVisible(false).setAlpha(1).setScale(1)
        this.locked = false
    }

    /* ═══════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.playSolved()

        showToast(this, this.caso.successLine, C.safe, 3000)
        await FX.wait(this, 2600)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setProgress(this.level.cases.length, this.level.cases.length)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        // o selo de investigador digital, que é a recompensa que a ficha pede
        const badge = this.add.container(640, 360).setDepth(430)
        badge.add(createIcon(this, 'lupa', 190))
        await FX.all(
            FX.popIn(this, badge, { from: 0.2, duration: 460 }),
            FX.sparks(this, 640, 360, { color: C.probe, count: 24, spread: 220 }),
            FX.stars(this, 640, 360, { color: C.risk, count: 12, rise: 170 }),
        )
        await FX.wait(this, 500)
        await FX.to(this, badge, { alpha: 0, scale: 0.7 }, { duration: 260 })
        badge.destroy()

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Investigação concluída!',
                subtitle: `Nível ${lvl} — selo de investigador`,
                message: this.level.objective,
                accent: C.probe,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Preparando o próximo caso...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.probe, C.safe, C.risk, C.paper] })
        this.modal = showLevelComplete(this, {
            title: 'Investigador digital!',
            subtitle: 'Você sabe reconhecer o que não se posta',
            message: `Dados achados: ${this.hits}  ·  Enganos: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.safe,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.safe,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.probe,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`. A heurística automática do `createTutorial`
     * mede a altura do texto e escolhe acima/abaixo; com o holofote no post,
     * que ocupa o meio da tela, a conta cai em cima dele.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const postSpot = { x: MSG.cx, y: MSG.cy, w: MSG.w + 28, h: MSG.h + 28 }
        const watchSpot = { x: WATCH.cx, y: WATCH.y - 20, w: 1140, h: 150 }
        const optSpot = { x: 640, y: OPT.cy, w: OPT.w * 2 + OPT.gap + 30, h: OPT.h + 28 }

        if (this.level.level === 2) {
            return [{
                text: 'Agora são três pedaços expostos no mesmo post. Ache os três.',
                shape: 'rect', ...postSpot, balloonY: 540,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Duas versões da mesma novidade. Toque na que pode ir para a internet.',
                shape: 'rect', ...optSpot, balloonY: 540,
            }]
        }

        return [
            {
                text: 'Este post já foi publicado. Toque no pedaço que conta demais.',
                shape: 'rect', ...postSpot, balloonY: 540,
            },
            {
                text: 'Aqui embaixo aparece quem passou a saber aquilo.',
                shape: 'rect', ...watchSpot, balloonY: 300,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef03co09-l${this.level.level}`,
            once: !force,
            accent: C.probe,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.locked = false
                this.hud.setHelpEnabled(true)
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.locked) return
        if (this.state !== 'investigando') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'investigando'
        })
    }

    /* ═══════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((s, l) => s + l.cases.length, 0)
        const done = before + this.caseIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CASES) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio = (muted: boolean) => { this.isMuted = muted }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
        const ctx = this.getAudioCtx()
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start()
        osc.stop(ctx.currentTime + dur)
    }

    /**
     * O som do engano é MACIO, não é buzina.
     *
     * Tocar num pedaço que pode ser postado não é fazer coisa errada — é
     * testar. Som de erro duro aqui ensinaria a criança a não tocar em nada,
     * que é o oposto de investigar.
     */
    private playSoft() { this.playTone(300, 0.12, 'sine', 0.07) }
    private playFound() {
        this.playTone(620, 0.08, 'sine', 0.11)
        this.time.delayedCall(85, () => this.playTone(820, 0.1, 'sine', 0.09))
    }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
