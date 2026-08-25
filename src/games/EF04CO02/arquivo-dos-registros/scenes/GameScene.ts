import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import {
    LEVELS, TOTAL_CASES, fichaOf, passes, firstMiss, matchCount,
} from '../data/casos'
import { C, hex, FIELD_LABEL } from '../data/theme'
import { HUD, BIG, CARD, FORM } from '../data/layout'
import type { Caso, CaseState, FieldId, Level } from '../types'

import {
    createScene, createHud, createQuestionLine, createBigFicha, createCard,
    cardSpots, createFormStrip, showToast,
    type Hud, type QuestionLine, type BigFicha, type CardView, type FormStrip,
} from './effects'

const GAME_ID = 'arquivo-dos-registros'

const POINTS = {
    campo: 15,
    filtro: 15,
    identificar: 25,
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
    private modal?: LevelCompleteHandle

    /* ── tabuleiro do caso ─────────────────────────────────────────── */

    private big?: BigFicha
    private cards: CardView[] = []
    private form?: FormStrip
    /** `campo`: qual pergunta da sequência está valendo. */
    private askIdx = 0
    /** `filtrar`: quantas fichas já foram achadas. */
    private found = 0

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
        this.askIdx = 0
        this.found = 0
        this.cards = []
        this.modal = undefined
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createScene(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.question = createQuestionLine(this)

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
        this.big?.destroy()
        this.big = undefined
        this.cards.forEach(c => c.destroy())
        this.cards = []
        this.form?.destroy()
        this.form = undefined
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
        this.askIdx = 0
        this.found = 0
        this.clearBoard()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.emitCheckpoint()

        if (caso.kind === 'campo') this.buildBig()
        else this.buildCards()

        if (caso.kind === 'identificar' && caso.form) {
            this.form = createFormStrip(this, caso.form)
            await this.form.show()
            if (gen !== this.gen) return
        }

        await this.question.show(this.promptNow())
        if (gen !== this.gen) return
        this.refreshCounter()

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'jogando'
                })
                return
            }
        }

        this.state = 'jogando'
    }

    /** A frase que está valendo agora. No N1 ela troca a cada pergunta. */
    private promptNow(): string {
        const caso = this.caso
        if (caso.kind === 'campo') return caso.asks?.[this.askIdx]?.prompt ?? caso.question
        return caso.question
    }

    private refreshCounter() {
        const caso = this.caso
        if (caso.kind === 'campo') {
            this.question.setCount(`${this.askIdx} de ${caso.asks?.length ?? 0}`)
        } else if (caso.kind === 'filtrar') {
            this.question.setCount(`${this.found} de ${matchCount(caso)}`)
        } else {
            this.question.setCount('')
        }
    }

    private buildBig() {
        const ficha = fichaOf(this.caso.fichaId ?? '')
        if (!ficha) return
        this.big = createBigFicha(this, ficha, field => void this.onField(field))
        FX.popIn(this, this.big.container, { from: 0.92, duration: 380 })
    }

    private buildCards() {
        const ids = this.caso.fichaIds ?? []
        const show = this.caso.show ?? ['cidade', 'ano', 'esporte']
        const spots = cardSpots(ids.length)

        ids.forEach((id, i) => {
            const ficha = fichaOf(id)
            const spot = spots[i]
            if (!ficha || !spot) return
            const card = createCard(this, ficha, show, {
                x: spot.x, y: spot.y,
                onTap: target => void this.onCard(target),
            })
            this.cards.push(card)
            FX.popIn(this, card.container, { from: 0.85, delay: 90 + i * 70, duration: 360 })
        })
    }

    /* ═══════════════════════════════════════════ nível 1: qual campo */

    private async onField(field: FieldId) {
        if (this.state !== 'jogando' || this.locked || this.ended) return

        const caso = this.caso
        const ask = caso.asks?.[this.askIdx]
        if (!ask) return

        const gen = this.gen

        // ── campo errado ───────────────────────────────────────────────
        if (field !== ask.field) {
            this.errors += 1
            this.points += POINTS.miss
            this.playSoft()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
            this.emitCheckpoint()

            this.big?.setRowState(field, 'no')
            showToast(this, `Esse campo se chama ${FIELD_LABEL[field]}. A pergunta é sobre outro.`,
                C.no, 2400)

            await FX.wait(this, 900)
            if (gen !== this.gen) return
            this.big?.resetRows()
            return
        }

        // ── acertou o campo ────────────────────────────────────────────
        this.hits += 1
        this.points += POINTS.campo
        this.locked = true
        this.big?.setEnabled(false)
        this.big?.setRowState(field, 'ok')
        this.playFound()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.campo, stage: this.level.level,
        })
        this.emitCheckpoint()

        const y = BIG.cy + BIG.rowTop + this.fieldIndex(field) * (BIG.rowH + BIG.rowGap)
        FX.popText(this, BIG.cx + BIG.rowX + 210, y, `+${POINTS.campo}`, {
            color: hex(C.ok), size: '28px',
        })
        showToast(this, `Esse campo se chama ${FIELD_LABEL[field]}.`, C.ok, 1900)

        this.askIdx += 1
        this.refreshCounter()

        const total = caso.asks?.length ?? 0
        if (this.askIdx >= total) {
            await FX.wait(this, 900)
            if (gen !== this.gen) return
            void this.solve()
            return
        }

        await FX.wait(this, 1100)
        if (gen !== this.gen) return
        this.big?.resetRows()
        await this.question.show(this.promptNow())
        if (gen !== this.gen) return

        this.locked = false
        this.big?.setEnabled(true)
    }

    private fieldIndex(field: FieldId): number {
        return ['cidade', 'ano', 'esporte', 'comida', 'bicho'].indexOf(field)
    }

    /* ═══════════════════════════ níveis 2 e 3: tocar numa ficha */

    private async onCard(id: string) {
        if (this.state !== 'jogando' || this.locked || this.ended) return

        const caso = this.caso
        const ficha = fichaOf(id)
        const card = this.cards.find(c => c.id === id)
        if (!ficha || !card) return

        const criterios = caso.kind === 'filtrar' ? (caso.filters ?? []) : (caso.form ?? [])
        const right = caso.kind === 'filtrar'
            ? passes(ficha, criterios)
            : id === caso.answerId

        const gen = this.gen

        // ── não passa ──────────────────────────────────────────────────
        if (!right) {
            this.errors += 1
            this.points += POINTS.miss
            this.playSoft()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
            this.emitCheckpoint()

            card.setState('no')
            // a trilha do raciocínio: acende o campo que reprovou a ficha
            const miss = firstMiss(ficha, criterios)
            if (miss) {
                card.lightField(miss.field, C.no)
                showToast(this,
                    `Aqui ${FIELD_LABEL[miss.field]} é ${ficha[miss.field]}, e o pedido é ${miss.value}.`,
                    C.no, 2600)
            }
            await card.shake()
            if (gen !== this.gen) return

            await FX.wait(this, 700)
            if (gen !== this.gen) return
            card.clearLights()
            card.setState('idle')
            return
        }

        // ── passa ──────────────────────────────────────────────────────
        this.hits += 1
        const value = caso.kind === 'filtrar' ? POINTS.filtro : POINTS.identificar
        this.points += value
        this.locked = true
        this.cards.forEach(c => c.setEnabled(false))
        this.playFound()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: value, stage: this.level.level,
        })
        this.emitCheckpoint()

        card.setState('ok')
        criterios.forEach(c => card.lightField(c.field, C.ok))
        FX.popText(this, card.x, card.y - CARD.h / 2 - 10, `+${value}`, {
            color: hex(C.ok), size: '28px',
        })
        void FX.sparks(this, card.x, card.y, { color: C.ok, count: 16, spread: 150 })
        await card.pin()
        if (gen !== this.gen) return

        if (caso.kind === 'identificar') {
            void this.solve()
            return
        }

        this.found += 1
        this.refreshCounter()

        if (this.found >= matchCount(caso)) {
            await FX.wait(this, 500)
            if (gen !== this.gen) return
            void this.solve()
            return
        }

        this.locked = false
        this.cards.forEach(c => c.setEnabled(true))
    }

    /* ═══════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.big?.setEnabled(false)
        this.cards.forEach(c => c.setEnabled(false))
        this.playSolved()

        showToast(this, this.caso.successLine, C.ok, 3000)
        await FX.wait(this, 2700)
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
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Arquivo em ordem!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.stamp,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Separando as próximas fichas...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.stamp, C.ok, C.pin, C.paper] })
        this.modal = showLevelComplete(this, {
            title: 'Arquivista-chefe!',
            subtitle: 'Você lê, filtra e cruza registros',
            message: `Acertos: ${this.hits}  ·  Enganos: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.stamp,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`. A heurística automática do `createTutorial`
     * mede a altura do texto e escolhe acima/abaixo; com o holofote nas fichas,
     * que ocupam quase a tela inteira, a conta cai em cima delas.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const bigSpot = { x: BIG.cx, y: BIG.cy, w: BIG.w + 30, h: BIG.h + 30 }
        const cardsSpot = { x: 640, y: 460, w: 1120, h: 430 }
        const formSpot = { x: FORM.cx, y: FORM.cy, w: FORM.w + 30, h: FORM.h + 30 }

        if (this.level.level === 2) {
            return [{
                text: 'Toque em TODAS as fichas que passam no filtro. O contador diz quantas faltam.',
                shape: 'rect', ...cardsSpot, balloonY: 180,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Este formulário chegou sem nome. Ache a ficha que bate em todos os campos.',
                shape: 'rect', ...formSpot, balloonY: 480,
            }]
        }

        return [{
            text: 'Cada linha da ficha tem um NOME à esquerda. Toque na linha que responde a pergunta.',
            shape: 'rect', ...bigSpot, balloonY: 180,
        }]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co02-l${this.level.level}`,
            once: !force,
            accent: C.stamp,
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
        if (this.state !== 'jogando') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'jogando'
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

    /** Tocar no campo errado é conferir, não falhar. Som macio. */
    private playSoft() { this.playTone(300, 0.12, 'sine', 0.07) }
    private playFound() {
        this.playTone(640, 0.08, 'sine', 0.11)
        this.time.delayedCall(85, () => this.playTone(860, 0.1, 'sine', 0.09))
    }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
