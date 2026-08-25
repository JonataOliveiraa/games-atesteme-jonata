import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/casos'
import { PRINCIPIOS } from '../data/principios'
import { C } from '../data/theme'
import { HUD, SITUACAO, FICHA, ACOES, IMPACTO, PAINEL } from '../data/layout'
import type { Caso, CaseState, Marca, Passo, Principio } from '../types'

import {
    createSala, createHud, createSituacao, createFicha, createAcoes,
    createImpacto, createPainel, createBigButton, ACCENT,
    type Acoes, type BigButton, type Ficha, type Hud, type Impacto,
    type Painel, type Situacao,
} from './effects'

const GAME_ID = 'missao-etica-digital'

const POINTS = {
    /** Decisão certa. */
    certa: 20,
    /** Decisão certa DEPOIS de conferir a etiqueta. */
    conferiu: 10,
    /** Alerta de risco. */
    alerta: -5,
} as const

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'lendo'
    private locked = false
    private ended = false

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── a missão em andamento ─────────────────────────────────────── */

    /** Qual decisão do caso está aberta: 0, ou 1 no Nível 3. */
    private passoIdx = 0
    /** Quantas vezes a criança agiu sem ter virado a ficha. */
    private noEscuro = 0

    /**
     * O painel: o que cada princípio acumulou na partida inteira.
     *
     * Ele é o placar E o relatório final. Nada aparece no fim que a criança já
     * não estivesse vendo crescer no rodapé o tempo todo.
     */
    private marcas: Record<Principio, Marca> = {
        autoria: { respeitado: false, alertas: 0 },
        permissao: { respeitado: false, alertas: 0 },
        privacidade: { respeitado: false, alertas: 0 },
        guarda: { respeitado: false, alertas: 0 },
    }

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private situacao!: Situacao
    private painel!: Painel

    /* ── o que nasce e morre a cada decisão ────────────────────────── */

    private ficha?: Ficha
    private acoes?: Acoes
    private impacto?: Impacto
    private continuar?: BigButton

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
        this.state = 'lendo'
        this.locked = false
        this.ended = false
        this.gen = 0
        this.passoIdx = 0
        this.noEscuro = 0
        this.marcas = {
            autoria: { respeitado: false, alertas: 0 },
            permissao: { respeitado: false, alertas: 0 },
            privacidade: { respeitado: false, alertas: 0 },
            guarda: { respeitado: false, alertas: 0 },
        }
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createSala(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)
        this.hud.setHint(this.level.tip)

        this.situacao = createSituacao(this)

        this.painel = createPainel(this)
        this.painel.set(this.marcas)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de uma missão qualquer.
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

    private get level() { return LEVELS[this.levelIdx] }
    private get caso(): Caso { return this.level.cases[this.caseIdx] }
    private get passo(): Passo { return this.caso.passos[this.passoIdx] }
    private get tom(): number { return ACCENT[this.passo.principio] }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearPalco() {
        this.ficha?.destroy(); this.ficha = undefined
        this.acoes?.destroy(); this.acoes = undefined
        this.impacto?.destroy(); this.impacto = undefined
        this.continuar?.destroy(); this.continuar = undefined
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen

        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, a missão
         * que termina bem deixa a trava ligada e a seguinte monta a tela
         * inteira sem aceitar um toque.
         */
        this.locked = false
        this.passoIdx = 0
        this.clearPalco()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(this.level.tip)
        this.emitCheckpoint()

        /*
         * A FICHA ENTRA ANTES DO TUTORIAL.
         *
         * O tutorial recorta a tela e aponta o balão para o recorte. Rodando
         * primeiro, ele recortaria tela vazia e falaria de uma ficha que ainda
         * não existe.
         */
        this.abrirPasso(0)
        if (withTutorial) this.locked = true

        await this.situacao.show(this.passo.situacao)
        if (gen !== this.gen) return

        if (!withTutorial) return

        const steps = this.buildTutorialSteps()
        if (!steps.length) { this.locked = false; return }

        this.runTutorial(steps, false, () => { })
    }

    /**
     * Abre uma decisão.
     *
     * A ficha é reconstruída a cada passo de propósito: no Nível 3 o segundo
     * passo é sobre o MESMO arquivo, e a criança precisa poder virar a etiqueta
     * de novo — quem já esqueceu que tem sete rostos naquela foto tem o direito
     * de conferir outra vez antes de decidir para quem manda.
     */
    private abrirPasso(i: number) {
        this.passoIdx = i
        this.state = 'lendo'
        this.clearPalco()

        const passo = this.passo
        const tom = this.tom

        this.ficha = createFicha(this, {
            arquivo: this.caso.arquivo,
            tone: tom,
            onVirar: () => this.playVirar(),
        })

        this.acoes = createAcoes(this, {
            pergunta: passo.pergunta,
            acoes: passo.acoes,
            tone: tom,
            onPick: j => void this.onEscolher(j),
        })
    }

    /* ═══════════════════════════════════════════════════ a decisão */

    private async onEscolher(j: number) {
        if (this.state !== 'lendo' || this.locked || this.ended) return

        const gen = this.gen
        const passo = this.passo
        const acao = passo.acoes[j]
        if (!acao) return

        const conferiu = this.ficha?.conferida() ?? false
        if (!conferiu) this.noEscuro += 1

        this.state = 'impacto'
        this.locked = true
        this.acoes?.setEnabled(false)
        this.ficha?.setEnabled(false)

        /*
         * O texto do impacto muda quando a criança decidiu de olho fechado.
         *
         * É a frase mais importante do jogo: não basta ter errado, é preciso
         * ver que a resposta estava escrita e que ela não olhou. Quando acerta
         * sem conferir, o jogo também diz — foi sorte, e sorte não é método.
         */
        let texto = acao.impacto
        if (!conferiu && !acao.certa) {
            texto = `Você não virou a ficha. A etiqueta dizia: "${this.caso.arquivo.etiqueta.permissao}".  ${texto}`
        } else if (!conferiu && acao.certa) {
            texto = `${texto}  ·  Só que você decidiu sem virar a ficha: desta vez deu certo por sorte.`
        }

        this.acoes?.destroy()
        this.acoes = undefined

        this.impacto = createImpacto(this, { certa: acao.certa, texto })

        // ── o painel reage ────────────────────────────────────────────
        const marca = this.marcas[passo.principio]
        if (acao.certa) {
            marca.respeitado = true
            this.hits += 1
            this.points += POINTS.certa + (conferiu ? POINTS.conferiu : 0)
            this.playCerta()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.certa + (conferiu ? POINTS.conferiu : 0),
                stage: this.level.level,
            })
        } else {
            marca.alertas += 1
            this.errors += 1
            this.points += POINTS.alerta
            this.playAlerta()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.alerta, stage: this.level.level,
            })
        }
        this.painel.set(this.marcas)
        this.painel.destacar(passo.principio)
        this.emitCheckpoint()

        await FX.wait(this, 400)
        if (gen !== this.gen) return

        const ultimo = this.passoIdx >= this.caso.passos.length - 1
        this.continuar = createBigButton(this, {
            x: IMPACTO.cx, y: IMPACTO.botaoY, w: IMPACTO.botaoW, h: IMPACTO.botaoH,
            label: acao.certa
                ? (ultimo ? 'CONTINUAR' : 'PRÓXIMA ETAPA')
                : 'TENTAR DE NOVO',
            tone: acao.certa ? C.ok : C.alerta,
            onClick: () => this.onContinuar(acao.certa, ultimo),
        })
        this.locked = false
    }

    private onContinuar(certa: boolean, ultimo: boolean) {
        if (this.state !== 'impacto' || this.locked || this.ended) return
        this.playToque()

        /*
         * Errar não empurra a missão para frente.
         *
         * A criança volta para a MESMA decisão, agora sabendo o que aconteceu —
         * e com a ficha ali para virar. Avançar depois de um alerta ensinaria
         * que a consequência não muda nada.
         */
        if (!certa) {
            this.abrirPasso(this.passoIdx)
            void this.situacao.show(this.passo.situacao)
            return
        }

        if (!ultimo) {
            this.abrirPasso(this.passoIdx + 1)
            void this.situacao.show(this.passo.situacao)
            return
        }

        void this.fecharCaso()
    }

    /* ═══════════════════════════════════════════════════ fim da missão */

    private async fecharCaso() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.clearPalco()

        void FX.sparks(this, FICHA.cx, FICHA.cy, { color: C.ok, count: 26, spread: 280 })
        void FX.flash(this, C.white, { duration: 240, peak: 0.16 })

        await this.situacao.show(this.caso.successLine)
        if (gen !== this.gen) return

        await FX.wait(this, 1400)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    /** O relatório: é só ler o painel, que a criança já estava vendo. */
    private relatorio(): string {
        const partes = PRINCIPIOS.map(p => {
            const m = this.marcas[p.key]
            if (!m.respeitado) return `${p.nome}: ainda não`
            return m.alertas > 0
                ? `${p.nome}: ok, com ${m.alertas} alerta${m.alertas > 1 ? 's' : ''}`
                : `${p.nome}: ok`
        })
        return partes.join('  ·  ')
    }

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
            showLevelComplete(this, {
                title: 'Missão cumprida!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: ACCENT[this.level.cases[0].passos[0].principio],
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Abrindo as próximas missões...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.autoria, C.permissao, C.privacidade, C.guarda] })
        showLevelComplete(this, {
            title: 'Painel completo!',
            subtitle: this.relatorio(),
            message: this.noEscuro > 0
                ? `Você decidiu ${this.noEscuro} vez${this.noEscuro > 1 ? 'es' : ''} sem virar a ficha. Conferir antes é o que separa acerto de sorte.`
                : 'E você conferiu a etiqueta antes de todas as decisões. É exatamente isso.',
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
                    color: C.permissao,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`, e nunca abaixo de 540: o botão "Próximo"
     * nasce 46px ABAIXO do balão, e mais do que isso o joga para fora da tela.
     *
     * E o balão nunca cai sobre o próprio recorte — a ficha fica à esquerda,
     * então o balão dela vai para a direita, e vice-versa.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const fichaSpot = {
            x: FICHA.cx, y: FICHA.cy,
            w: FICHA.w + 40, h: FICHA.h + 60,
        }
        const acoesSpot = {
            x: ACOES.cx, y: ACOES.primeiroCY + ACOES.h + ACOES.gap,
            w: ACOES.w + 40, h: 3 * ACOES.h + 2 * ACOES.gap + 40,
        }
        const painelSpot = {
            x: 640, y: PAINEL.y + PAINEL.h / 2,
            w: PAINEL.w + 20, h: PAINEL.h + 20,
        }
        const situacaoSpot = {
            x: 640, y: SITUACAO.y + SITUACAO.h / 2,
            w: SITUACAO.w + 20, h: SITUACAO.h + 20,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora as etiquetas discordam entre si. Uma proíbe, outra libera tudo — e tem foto com o rosto de gente. Vire antes de escolher.',
                shape: 'rect', ...fichaSpot, balloonX: 850, balloonY: 400,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Aqui cada arquivo tem DUAS decisões: primeiro onde guardar, depois para quem mandar. A segunda vem só quando a primeira estiver certa.',
                shape: 'rect', ...situacaoSpot, balloonX: 640, balloonY: 400,
            }]
        }

        return [
            {
                text: 'Este é o arquivo. Toque nele e a ficha vira: atrás estão quem fez, o que a etiqueta libera e o aviso, quando tem.',
                shape: 'rect', ...fichaSpot, balloonX: 850, balloonY: 400,
            },
            {
                text: 'Depois escolha o que fazer. Dá para escolher sem virar a ficha — mas aí você está decidindo no escuro, e o jogo percebe.',
                shape: 'rect', ...acoesSpot, balloonX: 300, balloonY: 400,
            },
            {
                text: 'Aqui embaixo ficam os quatro cuidados. Cada escolha boa acende um deles; um deslize deixa uma marca laranja.',
                shape: 'rect', ...painelSpot, balloonX: 640, balloonY: 330,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co07-l${this.level.level}`,
            once: !force,
            accent: this.tom,
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
        if (this.state !== 'lendo') return

        const steps = this.buildTutorialSteps()
        if (!steps.length) return
        this.runTutorial(steps, true, () => { })
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

    /** O som do papel virando: curto e seco. */
    private playVirar() { this.playTone(880, 0.05, 'triangle', 0.05) }
    private playToque() { this.playTone(620, 0.05, 'sine', 0.05) }
    private playAlerta() { this.playTone(210, 0.22, 'square', 0.07) }
    private playCerta() {
        [523, 784].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.16, 'sine', 0.11)))
    }
}
