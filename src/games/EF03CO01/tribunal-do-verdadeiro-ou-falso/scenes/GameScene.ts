import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS } from '../data/sentences'
import { C } from '../data/theme'
import { HUD, CARD, BADGE, ANSWER, TIMER, JUDGE } from '../data/layout'
import type { LevelConfig, LogicSentence, RoundPhase } from '../types'
import {
    createHud, createSentenceCard, createAnswerButton, createTimerBar, createGavel,
    createJudge, paintCourtroom, showExplanation, showToast, stampVerdict,
    type Hud, type SentenceCard, type AnswerButton, type TimerBar, type Gavel,
    type ExplanationPanel,
} from './effects'

const GAME_ID = 'tribunal-do-verdadeiro-ou-falso'
const MAX_CONSECUTIVE_ERRORS = 3

/**
 * Economia de pontos.
 *
 * A versão anterior emitia `WRONG_ANSWER` mas NUNCA `CORRECT_ANSWER` — a
 * plataforma recebia todos os erros e nenhum acerto, e o `score` do checkpoint
 * ficava congelado no valor que veio no START_GAME. O acerto agora vale
 * `hit`, espelhando o `miss` que já existia.
 */
const POINTS = { hit: 5, miss: -2 } as const

/** Quanto tempo a explicação fica na tela antes de a próxima frase entrar. */
const HOLD = {
    correct: 2600,
    correctWithNegation: 3400,
    wrong: 2200,
    beforeGameOver: 1800,
} as const

const SUCCESS_MESSAGE: Record<number, string> = {
    1: 'Você julgou corretamente as sentenças simples!',
    2: 'Você aprendeu a prestar atenção na palavra NÃO!',
    3: 'Você julgou rápido e bem mesmo com o tempo correndo!',
}

export class GameScene extends Phaser.Scene {

    /* ── estado da partida ─────────────────────────────────────────── */

    private levelConfig!: LevelConfig
    private sentenceIdx = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private points = 0
    private lives = 1
    private isMuted = false
    private phase: RoundPhase = 'intro'
    private ended = false
    private showLevelStartOnEnter = false

    /**
     * Geração da rodada.
     *
     * Todo callback atrasado captura o valor de `gen` no momento em que é
     * agendado e desiste se ele já mudou. Sem isso, um `await FX.wait(2600)`
     * pendente da frase anterior volta a mexer em cartão, botões e painel que
     * a troca de tela já destruiu — a classe de bug mais cara de reproduzir,
     * porque só aparece quando a criança responde perto do fim do tempo.
     *
     * Incrementa em: nova sentença, fim de nível, game over e reinício.
     */
    private gen = 0

    /* ── interface ─────────────────────────────────────────────────── */

    private hud!: Hud
    private card!: SentenceCard
    private buttons: AnswerButton[] = []
    private gavel!: Gavel
    private timerBar?: TimerBar
    private explanation?: ExplanationPanel
    private modal?: LevelCompleteHandle

    /* ── cronômetro (só Nível 3) ───────────────────────────────────── */

    private timerTween?: Phaser.Tweens.Tween
    private timerState = { progress: 1 }
    private timerRunning = false

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number; showLevelStart?: boolean }) {
        const lvl = Phaser.Math.Clamp(data?.level ?? 1, 1, 3) as 1 | 2 | 3

        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.sentenceIdx = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.lives = data?.lives ?? 1
        this.isMuted = false
        this.phase = 'intro'
        this.ended = false
        this.showLevelStartOnEnter = data?.showLevelStart ?? false
        this.gen = 0
        this.buttons = []
        this.explanation = undefined
        this.modal = undefined
        this.timerBar = undefined
        this.timerTween = undefined
        this.timerRunning = false
        this.timerState.progress = 1
    }

    create() {
        // O Phaser emite o evento 'shutdown' mas nunca chama um método
        // shutdown() da classe: sem este bind os listeners do EventBus se
        // acumulariam a cada scene.restart() da troca de nível.
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        paintCourtroom(this)
        createJudge(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.levelConfig.level)
        this.hud.setTitle(this.levelConfig.title)
        this.hud.setHint(this.levelConfig.tip)
        this.hud.setProgress(0, this.total)
        this.hud.setHelpVisible(true)

        this.card = createSentenceCard(this)
        this.gavel = createGavel(this)
        if (this.levelConfig.perSentenceTimer) this.timerBar = createTimerBar(this)

        this.buildAnswerButtons()

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.showLevelStartOnEnter && this.levelConfig.level > 1) {
            this.showLevelStartScreen()
        } else {
            void this.playSentence(true)
        }
    }

    private shutdownScene() {
        this.gen += 1
        this.stopTimer()
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════════ atalhos de estado */

    private get total() {
        return this.levelConfig.sentences.length
    }

    private get currentSentence(): LogicSentence | undefined {
        return this.levelConfig.sentences[this.sentenceIdx]
    }

    /* ═══════════════════════════════════════════════════════════ botões */

    private buildAnswerButtons() {
        const make = (value: boolean) => createAnswerButton(this, {
            x: CARD.cx + (value ? -ANSWER.dx : ANSWER.dx),
            y: ANSWER.y,
            value,
            label: value ? 'Verdadeiro' : 'Falso',
            caption: value ? 'a notícia é real' : 'a notícia é inventada',
            onClick: v => void this.handleAnswer(v),
            onFocus: (x, y) => this.gavel.point(x, y),
            onBlur: () => this.gavel.hide(),
        })

        this.buttons = [make(true), make(false)]
        this.buttons.forEach(b => b.setEnabled(false))
    }

    /**
     * Fonte única do estado dos botões.
     *
     * Antes cada ponto de mutação decidia sozinho se habilitava ou não
     * (`handleAnswer`, `activate`, `replayTutorial`, o fim do tutorial…), e
     * bastava um deles ficar para trás numa borda do fluxo para o jogo travar
     * com o cartão na tela e nenhum botão respondendo.
     */
    private syncButtons() {
        const live = this.phase === 'waiting-answer' && !this.ended
        this.buttons.forEach(b => b.setEnabled(live))
        if (!live) this.gavel.hide()
    }

    /* ═══════════════════════════════════════════════════════ ciclo da frase */

    /** Apresenta a frase atual. `withTutorial` só na entrada do nível. */
    private async playSentence(withTutorial: boolean) {
        const gen = ++this.gen

        this.phase = 'intro'
        this.syncButtons()

        this.explanation?.destroy()
        this.explanation = undefined

        const sentence = this.currentSentence
        if (!sentence) return

        this.hud.setProgress(this.sentenceIdx, this.total)
        this.emitCheckpoint()

        // Cartão e botões entram juntos: a criança vê a pergunta e a resposta
        // chegarem no mesmo gesto, em vez de esperar o texto para descobrir
        // que existem botões.
        await Promise.all([
            this.card.show(sentence),
            ...this.buttons.map(b => b.restore()),
        ])
        if (gen !== this.gen) return

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.activate()
                })
                return
            }
        }

        this.activate()
    }

    /** Libera o toque e, no Nível 3, dispara o cronômetro. */
    private activate() {
        if (this.ended) return
        this.phase = 'waiting-answer'
        this.syncButtons()
        this.startTimer()
    }

    private async handleAnswer(value: boolean | null) {
        if (this.ended || this.phase !== 'waiting-answer') return

        const gen = this.gen
        const sentence = this.currentSentence
        if (!sentence) return

        this.phase = 'feedback'
        this.stopTimer()
        this.card.skipTyping()
        this.syncButtons()

        const correct = value !== null && value === sentence.correctValue

        // Os botões recuam e o painel de explicação ocupa a faixa deles. Antes
        // o painel era desenhado POR CIMA dos botões: sobrava a silhueta verde
        // e vermelha vazando pelos cantos arredondados, que lia como falha de
        // renderização em vez de escolha.
        await Promise.all(this.buttons.map(b => b.retract()))
        if (gen !== this.gen) return

        if (correct) {
            this.hits += 1
            this.consecutiveErrors = 0
            this.points += POINTS.hit
            this.playCorrect()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: POINTS.hit,
                stage: this.levelConfig.level,
            })
        } else {
            this.errors += 1
            this.consecutiveErrors += 1
            this.points += POINTS.miss
            this.playError()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: POINTS.miss,
                stage: this.levelConfig.level,
            })
        }
        this.emitCheckpoint()

        // Celebração e carimbo rodam soltos: se fossem aguardados, o tempo de
        // leitura da explicação encolheria pelo tamanho da animação.
        // Carimbo na BORDA DE BAIXO do cartão, não no centro: no centro ele
        // cobria justamente a frase que a criança precisa reler para entender
        // o veredicto. Meio para dentro, meio para fora, como carimbo em
        // documento — e a altura vem do cartão, que muda com o tamanho da frase.
        void stampVerdict(this, CARD.cx, CARD.cy + this.card.height() / 2 - 26, correct)
        void this.card.flash(correct ? C.green : C.red)
        if (correct) {
            void FX.stars(this, CARD.cx, CARD.cy, { color: C.gold, count: 12, rise: 150 })
        } else {
            this.buttons.forEach(b => void b.reject())
        }

        if (value === null) {
            showToast(this, 'O tempo acabou nesta frase!', C.red, 1500)
        }

        this.explanation = showExplanation(this, sentence)

        const tooManyErrors = !correct && this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS
        const hold = tooManyErrors
            ? HOLD.beforeGameOver
            : correct
                ? (sentence.hasNegation ? HOLD.correctWithNegation : HOLD.correct)
                : HOLD.wrong

        await FX.wait(this, hold)
        if (gen !== this.gen) return

        await this.explanation?.close()
        this.explanation = undefined
        if (gen !== this.gen) return

        if (tooManyErrors) {
            this.showGameOver('wrong-answer')
            return
        }
        this.advance()
    }

    private advance() {
        this.sentenceIdx += 1

        if (this.sentenceIdx >= this.total) {
            this.endLevel()
            return
        }
        void this.playSentence(false)
    }

    /* ═══════════════════════════════════════════════════════ cronômetro */

    private startTimer() {
        const seconds = this.levelConfig.perSentenceTimer
        if (!seconds || !this.timerBar) return

        const gen = this.gen

        this.timerTween?.stop()
        this.timerState.progress = 1
        this.timerRunning = true
        this.timerBar.set(1)

        this.timerTween = this.tweens.add({
            targets: this.timerState,
            progress: 0,
            duration: seconds * 1000,
            ease: 'Linear',
            onUpdate: () => this.timerBar?.set(this.timerState.progress),
            onComplete: () => {
                if (!this.timerRunning || gen !== this.gen) return
                this.timerRunning = false
                this.timerBar?.set(0)
                void this.handleAnswer(null)
            },
        })
    }

    private stopTimer() {
        this.timerRunning = false
        this.timerTween?.stop()
        this.timerTween = undefined
    }

    /* ═══════════════════════════════════════════════════ telas de nível */

    /** Abertura dos níveis 2 e 3, reaproveitando o modal compartilhado. */
    private showLevelStartScreen() {
        const lvl = this.levelConfig.level
        let handle: LevelCompleteHandle | undefined

        handle = showLevelComplete(this, {
            title: `Nível ${lvl}`,
            subtitle: this.levelConfig.objective,
            message: this.levelConfig.tip,
            accent: C.green,
            panelColor: C.panel,
            overlayColor: C.overlay,
            titleColor: `#${C.navy.toString(16).padStart(6, '0')}`,
            progress: { total: 3, current: lvl - 1 },
            buttons: [{
                label: 'Iniciar nível',
                color: C.amber,
                onClick: () => {
                    this.playTick()
                    handle?.destroy()
                    this.modal = undefined
                    void this.playSentence(true)
                },
            }],
        })
        this.modal = handle
    }

    private endLevel() {
        this.phase = 'level-complete'
        this.ended = true
        this.gen += 1
        this.stopTimer()
        this.syncButtons()
        this.playFanfare()

        this.hud.setProgress(this.total, this.total)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelConfig.level,
        })
        this.emitCheckpoint()

        const lvl = this.levelConfig.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Parabéns!',
                subtitle: `Nível ${lvl} concluído`,
                message: SUCCESS_MESSAGE[lvl],
                accent: C.amber,
                panelColor: C.panel,
                overlayColor: C.overlay,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Preparando o próximo nível...',
                    onComplete: () => this.scene.restart({
                        level: next,
                        points: this.points,
                        lives: this.lives,
                        showLevelStart: true,
                    }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.brass, C.green, C.amber, C.gold] })
        this.modal = showLevelComplete(this, {
            title: 'Jogo concluído!',
            subtitle: 'Você julgou todas as sentenças do tribunal',
            message: `Acertos: ${this.hits}  ·  Erros: ${this.errors}  ·  Pontos: ${this.points}`,
            accent: C.green,
            panelColor: C.panel,
            overlayColor: C.overlay,
            progress: { total: 3, current: 3 },
            // Rótulos explícitos: "Voltar" não dizia para onde. A largura do
            // botão em showLevelComplete cresce com o texto, e os dois somados
            // precisam caber nos 604px do painel.
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.green,
                    onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.lives }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.amber,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private showGameOver(reason: 'timeout' | 'wrong-answer') {
        if (this.ended) return

        this.ended = true
        this.gen += 1
        this.stopTimer()
        this.syncButtons()
        this.hud.setHelpEnabled(false)

        // A versão anterior nunca emitia GAME_OVER: a plataforma via a criança
        // sumir no meio do nível sem nenhum evento explicando por quê.
        runtimeGameBridge.emit({
            type: 'GAME_OVER',
            gameId: GAME_ID,
            stage: this.levelConfig.level,
        })
        this.emitCheckpoint()

        this.playGameOverSting()

        this.modal = showLevelComplete(this, {
            title: 'Que pena!',
            subtitle: reason === 'timeout'
                ? 'O tempo acabou!'
                : '3 julgamentos errados seguidos',
            message: `${this.sentenceIdx} de ${this.total} sentenças julgadas`,
            accent: C.red,
            panelColor: C.panel,
            overlayColor: C.overlay,
            progress: { total: this.total, current: this.sentenceIdx },
            buttons: [
                {
                    label: 'Tentar de novo',
                    color: C.green,
                    onClick: () => this.scene.restart({
                        level: this.levelConfig.level,
                        points: this.points,
                        lives: this.lives,
                    }),
                },
                {
                    label: 'Sair',
                    color: C.amber,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════════ tutorial */

    /**
     * Áreas destacáveis, em coordenadas absolutas de 1280x720.
     *
     * Calculadas na hora do uso, não guardadas num campo: a altura do cartão
     * muda com o tamanho da frase, e um holofote de altura fixa deixava
     * sobrar madeira embaixo nas frases curtas.
     */
    private spots() {
        const cardH = this.card.height()
        const headerCY = CARD.cy - cardH / 2 + CARD.headerH / 2

        return {
            card: { x: CARD.cx, y: CARD.cy, w: CARD.w + 32, h: cardH + 32 },
            badge: {
                x: CARD.cx + CARD.w / 2 - BADGE.inset - BADGE.w / 2,
                y: headerCY,
                w: BADGE.w + 40,
                h: BADGE.h + 34,
            },
            trueBtn: { x: CARD.cx - ANSWER.dx, y: ANSWER.y, w: ANSWER.w + 26, h: ANSWER.h + 26 },
            bothBtns: {
                x: CARD.cx,
                y: ANSWER.y,
                w: ANSWER.dx * 2 + ANSWER.w + 26,
                h: ANSWER.h + 26,
            },
            timer: {
                x: TIMER.cx,
                y: TIMER.y + TIMER.h / 2,
                w: TIMER.w + 34,
                h: TIMER.h + 40,
            },
            judge: { x: JUDGE.x, y: JUDGE.y, w: 300, h: 300 },
        }
    }

    /**
     * Toda etapa fixa `balloonY` (e `balloonX` quando o alvo é lateral).
     *
     * `createTutorial` sabe posicionar o balão sozinho, mas a heurística dele
     * mede a altura do texto e escolhe acima/abaixo — com o holofote no juiz,
     * que é baixo e à esquerda, a conta caía em cima do cartão de sentença e o
     * botão "Próximo" pousava sobre a frase que a etapa anterior mandou ler.
     * Fixar custa duas linhas e o resultado deixa de depender do comprimento
     * da frase de cada nível.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const spot = this.spots()

        // Abaixo do cartão e acima dos botões; acima do cartão, sob o HUD.
        const BELOW_CARD = 556
        const ABOVE_CARD = 196

        if (this.levelConfig.level === 2) {
            return [
                {
                    text: 'Agora as frases têm a palavra NÃO. Quando ela aparecer, este aviso acende no cartão.',
                    shape: 'rect', ...spot.badge, balloonY: BELOW_CARD,
                },
                {
                    text: 'Leia a frase sem o NÃO e pense: essa parte é verdade?',
                    shape: 'rect', ...spot.card, balloonY: BELOW_CARD,
                },
                {
                    text: 'Depois é só inverter: se a frase sem o NÃO era verdade, com o NÃO ela fica falsa.',
                    shape: 'rect', ...spot.bothBtns, balloonY: ABOVE_CARD,
                },
            ]
        }

        if (this.levelConfig.level === 3) {
            return [
                {
                    text: 'Esta barra mostra o tempo que você tem para julgar cada frase.',
                    shape: 'rect', ...spot.timer, balloonY: BELOW_CARD,
                },
                {
                    text: 'Leia rápido, mas não esqueça de procurar a palavra NÃO antes de decidir.',
                    shape: 'rect', ...spot.card, balloonY: BELOW_CARD,
                },
                {
                    text: 'Se o tempo acabar sem resposta, a frase conta como erro. Bom julgamento!',
                    shape: 'rect', ...spot.bothBtns, balloonY: ABOVE_CARD,
                },
            ]
        }

        return [
            {
                text: 'Este é o cartão do julgamento. Leia a frase com calma antes de responder.',
                shape: 'rect', ...spot.card, balloonY: BELOW_CARD,
            },
            {
                text: 'Se a frase estiver certa, toque em VERDADEIRO. Se estiver errada, toque em FALSO.',
                shape: 'rect', ...spot.bothBtns, balloonY: ABOVE_CARD,
                pointer: {
                    fromX: CARD.cx,
                    fromY: CARD.cy + 150,
                    toX: spot.trueBtn.x,
                    toY: ANSWER.y,
                    textureKey: 'hammer',
                },
            },
            {
                // Balão à direita: o holofote fica na coluna do juiz, à esquerda.
                text: 'O juiz explica cada resposta — inclusive quando você erra. Assim dá para aprender.',
                shape: 'circle', ...spot.judge, balloonX: 860, balloonY: BELOW_CARD,
            },
            {
                text: 'Cuidado: errar 3 frases seguidas encerra o julgamento.',
                shape: 'none', balloonY: 340,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef03co01-l${this.levelConfig.level}`,
            once: !force,
            accent: C.amber,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.hud.setHelpEnabled(true)
                onFinish()
            },
        })
    }

    /** Reexibição pelo botão "?" do HUD, sem penalizar o cronômetro. */
    private replayTutorial = () => {
        if (this.ended || this.phase !== 'waiting-answer') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.phase = 'intro'
        this.syncButtons()
        this.timerTween?.pause()

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.phase = 'waiting-answer'
            this.syncButtons()
            this.timerTween?.resume()
        })
    }

    /* ═══════════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.sentenceIdx / this.total) * 100),
            score: this.points,
            stage: this.levelConfig.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
            this.lives = cmd.lives ?? this.lives
        })
    }

    private onMuteAudio = (muted: boolean) => {
        this.isMuted = muted
    }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.2) {
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

    private playTick() { this.playTone(520, 0.04, 'sine', 0.08) }

    private playCorrect() {
        this.playTone(660, 0.08, 'sine', 0.15)
        this.time.delayedCall(100, () => this.playTone(880, 0.08, 'sine', 0.12))
    }

    private playError() { this.playTone(330, 0.2, 'square', 0.15) }

    private playFanfare() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 125, () => this.playTone(f, 0.22, 'sine', 0.3)))
    }

    private playGameOverSting() {
        this.playTone(330, 0.3, 'square', 0.18)
        this.time.delayedCall(100, () => this.playTone(220, 0.4, 'square', 0.16))
    }
}
