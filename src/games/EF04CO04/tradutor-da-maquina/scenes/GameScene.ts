import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/casos'
import { codeOf, charOf, bitsOf, valueOf, wrongIndex } from '../data/tabela'
import { C } from '../data/theme'
import { HUD, MACHINE, PANEL, TABLE_UI } from '../data/layout'
import { BITS, type Caso, type CaseState, type Level } from '../types'

import {
    createRoom, createHud, createQuestionLine, createRobot, createScreen,
    createWire, createReadout, createSwitchBank, createTableStrip,
    createBigButton, showToast,
    type BigButton, type Hud, type QuestionLine, type Robot, type Screen,
    type Wire, type Readout, type SwitchBank, type TableStrip,
} from './effects'

const GAME_ID = 'tradutor-da-maquina'

const POINTS = {
    solve: 25,
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

    /* ── progresso dentro do caso ──────────────────────────────────── */

    /** Níveis 1 e 2: quantas letras já chegaram na máquina. */
    private sent = 0
    /** Nível 3: qual fileira está aberta no painel. −1 = nenhuma. */
    private picked = -1

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private question!: QuestionLine
    private robot!: Robot
    private screen!: Screen
    private wire!: Wire
    private readout!: Readout
    private bank!: SwitchBank
    private table!: TableStrip
    private send!: BigButton

    /** A última leitura das chaves, só para saber QUAL delas acabou de virar. */
    private lastBits: boolean[] = BITS.map(() => false)

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
        this.sent = 0
        this.picked = -1
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createRoom(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.question = createQuestionLine(this)

        /*
         * A máquina, o painel e a tabela nascem UMA vez e vivem o nível
         * inteiro. Só o conteúdo deles troca a cada caso: reconstruir sete
         * chaves e doze fichas a cada letra seria piscar a tela inteira na
         * cara da criança por nada.
         */
        this.robot = createRobot(this)
        this.screen = createScreen(this)
        this.wire = createWire(this)
        this.readout = createReadout(this)

        this.bank = createSwitchBank(this, {
            onChange: bits => this.onBits(bits),
        })

        this.table = createTableStrip(this, {
            onPick: entry => this.onTablePick(entry.char),
        })

        this.send = createBigButton(this, {
            x: PANEL.cx, y: PANEL.runY, w: PANEL.runW, h: PANEL.runH,
            label: 'ENVIAR', tone: C.ok, onClick: () => void this.onSend(),
        })

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

    /** A letra que a máquina espera agora. */
    private get target(): string {
        const caso = this.caso
        if (caso.mode === 'conserto') {
            return this.picked >= 0 ? caso.word[this.picked] : ''
        }
        return caso.word[this.sent] ?? ''
    }

    /**
     * Se o botão ENVIAR aceita toque agora.
     *
     * Uma pergunta, uma resposta, um lugar. Quando isso morava espalhado pelos
     * callbacks, bastava um caminho esquecer de reabilitar para o botão ficar
     * morto até o fim da fase.
     */
    private canSend(): boolean {
        if (this.state !== 'montando' || this.locked || this.ended) return false
        if (this.caso.mode === 'conserto') return this.picked >= 0
        return true
    }

    private refreshSend() {
        this.send.setEnabled(this.canSend())
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

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
        this.sent = 0
        this.picked = -1

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.emitCheckpoint()

        this.bank.clear()
        this.readout.setMade(0)
        this.robot.setHappy(false)

        if (caso.mode === 'conserto') {
            this.screen.setLabel('A MÁQUINA LEU')
            this.screen.openRows(caso.received ?? '', i => this.onPickRow(i))
            this.readout.setTargetLabel('DEVERIA SER')
            this.readout.setTarget('–')
            this.table.highlight(null)
        } else {
            this.screen.setLabel('A MÁQUINA RECEBEU')
            this.screen.openSlots(caso.word.length)
            this.readout.setTargetLabel('ENVIE')
            this.readout.setTarget(caso.word[0])
            // No Nível 1 a tabela aponta sozinha; do Nível 2 em diante, não.
            this.table.highlight(caso.mode === 'letra' ? caso.word[0] : null)
        }

        FX.popIn(this, this.screen.container, { from: 0.96, duration: 340 })

        this.refreshSend()

        await this.question.show(caso.question)
        if (gen !== this.gen) return

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'montando'
                    this.refreshSend()
                })
                return
            }
        }

        this.state = 'montando'
        this.refreshSend()
    }

    /* ═══════════════════════════════════════════════════════ interação */

    private onBits(bits: boolean[]) {
        this.readout.setMade(valueOf(bits))
        this.playBlip(bits)
    }

    /**
     * Tocar numa ficha da tabela é CONSULTAR, e nada mais.
     *
     * Ela acende e mostra o número — não preenche as chaves. Se preenchesse, a
     * criança atravessaria o jogo inteiro sem somar uma vez, que é justamente
     * o que ela veio fazer aqui.
     */
    private onTablePick(char: string) {
        if (this.state !== 'montando' || this.locked) return
        this.table.highlight(char)
        this.playLookup()
    }

    private onPickRow(i: number) {
        if (this.caso.mode !== 'conserto') return
        if (this.state !== 'montando' || this.locked || this.ended) return

        const caso = this.caso
        const bad = wrongIndex(caso.word, caso.received ?? '')

        if (i !== bad) {
            const ch = (caso.received ?? '')[i] ?? ''
            showToast(this, `Essa chegou certa: ${ch}. Procure a que não bate.`, C.numeroDark, 2200)
            this.playLookup()
            return
        }

        this.picked = i
        this.screen.markRow(i, 'selected')
        /*
         * As chaves abrem COMO A MENSAGEM CHEGOU, não zeradas.
         *
         * É o que transforma o nível em conserto e não em "digite de novo": a
         * criança vê a fileira errada de perto, mexe numa lâmpada só, e a
         * letra muda na frente dela.
         */
        this.bank.set(bitsOf(codeOf((caso.received ?? '')[i])))
        this.readout.setMade(this.bank.value())
        this.readout.setTarget(caso.word[i])
        this.table.highlight(null)
        this.playLookup()
        this.refreshSend()
    }

    /* ═══════════════════════════════════════════════════════════ envio */

    private async onSend() {
        if (!this.canSend()) return

        const gen = this.gen
        const caso = this.caso
        const want = this.target
        const wantCode = codeOf(want)
        const made = this.bank.value()

        this.state = 'enviando'
        this.locked = true
        this.bank.setEnabled(false)
        this.table.setEnabled(false)
        this.screen.setRowsEnabled(false)
        this.refreshSend()

        if (made !== wantCode) {
            await this.wire.fail()
            if (gen !== this.gen) return
            await this.bank.shake()
            if (gen !== this.gen) return

            this.errors += 1
            this.points += POINTS.miss
            this.playError()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
            this.emitCheckpoint()

            showToast(this, this.explain(made, want, wantCode), C.warn, 3200)

            await FX.wait(this, 500)
            if (gen !== this.gen) return

            this.state = 'montando'
            this.locked = false
            this.bank.setEnabled(true)
            this.table.setEnabled(true)
            this.screen.setRowsEnabled(true)
            this.refreshSend()
            return
        }

        // ── acertou: o pulso percorre o fio e a letra aterrissa ────────
        this.playSendTone()
        await this.wire.send(C.ok)
        if (gen !== this.gen) return

        this.screen.flash(C.ok)
        this.robot.react()
        this.robot.setHappy(true)

        if (caso.mode === 'conserto') {
            this.screen.setRowChar(this.picked, want, bitsOf(wantCode))
            this.screen.markRow(this.picked, 'fixed')
        } else {
            this.screen.fillSlot(this.sent, want, wantCode)
            this.sent += 1
        }

        this.playLanded()
        await FX.wait(this, 420)
        if (gen !== this.gen) return

        const done = caso.mode === 'conserto' || this.sent >= caso.word.length
        if (!done) {
            // próxima letra da palavra
            this.bank.clear()
            this.readout.setMade(0)
            this.readout.setTarget(caso.word[this.sent])
            this.table.highlight(caso.mode === 'letra' ? caso.word[this.sent] : null)
            this.robot.setHappy(false)

            this.state = 'montando'
            this.locked = false
            this.bank.setEnabled(true)
            this.table.setEnabled(true)
            this.refreshSend()
            return
        }

        this.hits += 1
        this.points += POINTS.solve
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.solve, stage: this.level.level,
        })
        this.emitCheckpoint()

        this.playSolved()
        void FX.sparks(this, MACHINE.screenCX, MACHINE.screenCY,
            { color: C.ok, count: 24, spread: 260 })
        void FX.flash(this, C.white, { duration: 260, peak: 0.2 })

        this.state = 'solved'
        void this.solve()
    }

    /**
     * Por que não chegou.
     *
     * Diz o número que a soma deu e o número que a letra pede — "errou" seco
     * obrigaria a criança a recomeçar no chute. E quando a soma cai fora da
     * tabela, diz isso com todas as letras: nem todo número é caractere.
     */
    private explain(made: number, want: string, wantCode: number): string {
        if (made === 0) {
            return `Nenhuma chave acesa: a soma deu 0. ${want} é ${wantCode}.`
        }
        const got = charOf(made)
        if (!got) {
            return `Sua soma deu ${made}, e ${made} não é letra nenhuma da tabela. ${want} é ${wantCode}.`
        }
        const diff = made - wantCode
        const side = diff > 0 ? `passou ${diff}` : `faltam ${-diff}`
        return `Sua soma deu ${made} — isso é ${got}. ${want} é ${wantCode}: ${side}.`
    }

    /* ═══════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.locked = true
        this.bank.setEnabled(false)
        this.table.setEnabled(false)
        this.screen.setRowsEnabled(false)
        this.refreshSend()

        showToast(this, this.caso.successLine, C.ok, 3000)
        await FX.wait(this, 2700)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }

        this.bank.setEnabled(true)
        this.table.setEnabled(true)
        this.screen.setRowsEnabled(true)
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setProgress(this.level.cases.length, this.level.cases.length)
        this.hud.setHelpEnabled(false)
        this.refreshSend()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Mensagem entregue!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.bit,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Ligando o próximo circuito...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.bit, C.letra, C.numero, C.ok] })
        showLevelComplete(this, {
            title: 'Tradutor da máquina!',
            subtitle: 'Letra, número e lâmpada: você já sabe atravessar os três',
            message: `Mensagens: ${this.hits}  ·  Ajustes: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
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
                    color: C.bit,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`, e nunca abaixo de 540: o botão "Próximo"
     * nasce 46px ABAIXO do balão, e mais do que isso o joga para fora da tela.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const bank = {
            x: PANEL.cx, y: PANEL.colCY,
            w: PANEL.right - PANEL.left + 40, h: PANEL.colH + 40,
        }
        const strip = {
            x: 640, y: TABLE_UI.cy,
            w: TABLE_UI.barW, h: TABLE_UI.barH + 10,
        }
        const screen = {
            x: MACHINE.screenCX, y: MACHINE.screenCY,
            w: MACHINE.screenW + 30, h: MACHINE.screenH + 30,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora é uma palavra inteira, uma letra de cada vez. A tabela parou de apontar: procure cada letra você mesmo.',
                shape: 'rect', ...screen, balloonX: 940, balloonY: 470,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'A mensagem chegou torta. Toque na fileira que não bate com a palavra — e conserte: falta ou sobra uma lâmpada só.',
                shape: 'rect', ...screen, balloonX: 940, balloonY: 470,
            }]
        }

        return [
            {
                text: 'Cada chave vale um número. Acenda as que somam o número da letra.',
                shape: 'rect', ...bank, balloonX: 340, balloonY: 380,
            },
            {
                text: 'A tabela diz qual número é cada letra. É o combinado entre você e a máquina.',
                shape: 'rect', ...strip, balloonX: 640, balloonY: 380,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)
        this.refreshSend()

        createTutorial(this, {
            key: `ef04co04-l${this.level.level}`,
            once: !force,
            accent: C.bit,
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
        if (this.state !== 'montando') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'montando'
            this.refreshSend()
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
     * A chave canta mais agudo quanto mais ela vale.
     *
     * O ouvido pega a ordem de grandeza antes dos olhos: a criança escuta que
     * a chave do 64 é a mais grave e a do 1 a mais fina, e isso é a mesma
     * informação que está escrita embaixo de cada uma.
     */
    private playBlip(bits: boolean[]) {
        const i = bits.findIndex((on, k) => on !== this.lastBits[k])
        this.lastBits = [...bits]
        if (i < 0) return
        const base = 280 + i * 78
        this.playTone(bits[i] ? base : base * 0.62, 0.06, 'triangle', 0.06)
    }

    private playLookup() { this.playTone(660, 0.05, 'sine', 0.05) }
    private playSendTone() { this.playTone(420, 0.1, 'sawtooth', 0.05) }
    private playLanded() { this.playTone(880, 0.12, 'sine', 0.09) }
    private playError() { this.playTone(200, 0.18, 'square', 0.07) }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
