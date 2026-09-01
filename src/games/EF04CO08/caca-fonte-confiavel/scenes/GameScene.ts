import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/levels'
import { C } from '../data/theme'
import { W, HUD, CARTAO, ESCOLHER } from '../data/layout'
import { CRITERIOS, linhaDe, type Caso, type CaseState, type Criterio, type Level } from '../types'

import {
    createSala, createHud, createPergunta, createCartao, createExplicacao,
    createBigButton, showToast,
    type BigButton, type Cartao, type Explicacao, type Hud, type Pergunta,
} from './effects'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'caca-fonte-confiavel'

const LETRAS = ['A', 'B', 'C']

const POINTS = {
    /** Escolheu a fonte certa. */
    certa: 20,
    /**
     * E tinha grifado a pista que decide o caso.
     *
     * É o "recompensa decisões justificadas, não apenas intuitivas" do
     * briefing virando número. Sem este bônus, chutar a página mais bonita
     * valeria o mesmo que ler as quatro linhas — e o jogo estaria ensinando
     * justamente o contrário do que a habilidade pede.
     */
    justificada: 10,
    /** Confiou na página errada. */
    errada: -5,
} as const

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

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

    /** Quantas vezes escolheu certo sem ter grifado a pista decisiva. */
    private noOlho = 0
    /** Quantas vezes escolheu certo E justificou. */
    private justificadas = 0

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private pergunta!: Pergunta

    /* ── o que nasce e morre a cada caso ───────────────────────────── */

    private cartoes: Cartao[] = []
    private botoes: BigButton[] = []
    private explicacao?: Explicacao

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
    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
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
        this.noOlho = 0
        this.justificadas = 0
        this.cartoes = []
        this.botoes = []
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createSala(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.pergunta = createPergunta(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer.
        void this.playCase(this.caseIdx === 0)

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
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

    /**
     * Onde cada cartão fica.
     *
     * Uma pergunta, uma resposta, um lugar: os cartões, os botões e os recortes
     * do tutorial leem todos daqui. Se cada um calculasse por conta própria,
     * bastaria um deles somar diferente para o botão nascer fora do cartão.
     */
    private grade(): { w: number; xs: number[] } {
        const n = this.caso.paginas.length
        const w = n === 2 ? CARTAO.w2 : CARTAO.w3
        const gap = n === 2 ? CARTAO.gap2 : CARTAO.gap3
        const total = n * w + (n - 1) * gap
        const x0 = (W - total) / 2 + w / 2
        return { w, xs: Array.from({ length: n }, (_, i) => x0 + i * (w + gap)) }
    }

    /** As linhas que decidem o caso: em qual página, e qual critério. */
    private decisivas(): Array<{ p: number; c: Criterio }> {
        const achadas: Array<{ p: number; c: Criterio }> = []
        this.caso.paginas.forEach((pag, p) => {
            CRITERIOS.forEach(c => {
                if (linhaDe(pag, c).decisiva) achadas.push({ p, c })
            })
        })
        return achadas
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearPalco() {
        this.cartoes.forEach(c => c.destroy())
        this.cartoes = []
        this.botoes.forEach(b => b.destroy())
        this.botoes = []
        this.explicacao?.destroy()
        this.explicacao = undefined
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen

        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, o caso que
         * termina bem deixa a trava ligada e o seguinte monta a tela inteira
         * sem aceitar um toque.
         */
        this.locked = false
        this.clearPalco()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.emitCheckpoint()

        /*
         * OS CARTÕES ENTRAM ANTES DO TUTORIAL.
         *
         * O tutorial recorta a tela e aponta o balão para o recorte. Rodando
         * primeiro, ele recortaria tela vazia e falaria de páginas que ainda
         * não existem.
         */
        this.abrirCaso(true)
        if (withTutorial) this.locked = true

        await this.pergunta.show(this.caso.pergunta)
        if (gen !== this.gen) return

        if (!withTutorial) return

        const steps = this.buildTutorialSteps()
        if (!steps.length) { this.locked = false; return }

        this.runTutorial(steps, false, () => { })
    }

    /**
     * Monta as páginas do caso.
     *
     * Reconstruídas do zero a cada tentativa de propósito: depois de um erro os
     * carimbos já caíram e os grifos da tentativa anterior estão na tela, e a
     * criança precisa poder ler tudo de novo com a cabeça limpa. `entrando`
     * separa caso novo (os cartões sobem do rodapé) de retomada (só reaparecem).
     */
    private abrirCaso(entrando: boolean) {
        this.state = 'lendo'
        this.clearPalco()

        const { w, xs } = this.grade()

        this.cartoes = this.caso.paginas.map((pagina, i) => createCartao(this, {
            pagina,
            letra: LETRAS[i] ?? '?',
            cx: xs[i],
            w,
            tema: this.level.tema,
            entrando,
            onMarcar: (_c, ligada) => this.playGrifo(ligada),
        }))

        this.botoes = xs.map((x, i) => createBigButton(this, {
            x, y: ESCOLHER.y, w: w - ESCOLHER.pad, h: ESCOLHER.h,
            label: 'CONFIO NESTA', tone: C.acao, breathe: false,
            onClick: () => void this.onEscolher(i),
        }))
    }

    /* ═══════════════════════════════════════════════════ a revelação */

    /**
     * A ordem importa:
     *
     *   1. a página escolhida CRESCE e as outras recuam
     *   2. os carimbos caem, um a um
     *   3. a pista decisiva se acende — e, se a criança não a tinha grifado,
     *      ela aparece sozinha, para ficar claro o que estava ali o tempo todo
     *   4. e só então o painel explica
     *
     * Sem o passo 3 o jogo diria "errou" sem nunca mostrar ONDE estava escrito
     * que era para desconfiar — que é a única coisa que a criança leva daqui.
     */
    private async onEscolher(i: number) {
        if (this.state !== 'lendo' || this.locked || this.ended) return

        const gen = this.gen
        const caso = this.caso
        const acertou = i === caso.certa

        /*
         * Os grifos são fotografados ANTES da revelação.
         *
         * O `acender` do passo 3 liga a marca da linha decisiva, e se a leitura
         * fosse feita depois, quem não grifou nada apareceria como tendo
         * grifado tudo — e o bônus por decisão justificada iria para quem
         * chutou.
         */
        const grifos = this.cartoes.map(c => c.marcadas())
        const decisivas = this.decisivas()
        const justificou = decisivas.some(({ p, c }) => grifos[p]?.includes(c))

        this.state = 'revelando'
        this.locked = true
        this.cartoes.forEach(c => c.setEnabled(false))
        this.botoes.forEach(b => b.destroy())
        this.botoes = []

        // ── 1. a escolhida vem à frente ───────────────────────────────
        this.playEscolha()
        await this.cartoes[i]?.escolher()
        if (gen !== this.gen) return
        await FX.all(...this.cartoes.filter((_, k) => k !== i).map(c => c.recuar()))
        if (gen !== this.gen) return

        // ── 2. os carimbos caem ───────────────────────────────────────
        for (const cartao of this.cartoes) {
            this.playCarimbo()
            await cartao.revelar()
            if (gen !== this.gen) return
            await FX.wait(this, 150)
            if (gen !== this.gen) return
        }

        // ── 3. a pista decisiva se acende ─────────────────────────────
        for (const { p, c } of decisivas) {
            this.playAcende()
            await this.cartoes[p]?.acender(c, grifos[p]?.includes(c) ?? false)
            if (gen !== this.gen) return
        }

        // ── placar ────────────────────────────────────────────────────
        let ganho = 0
        if (acertou) {
            ganho = POINTS.certa + (justificou ? POINTS.justificada : 0)
            this.hits += 1
            if (justificou) this.justificadas += 1
            else this.noOlho += 1
            this.points += ganho
            this.playCerta()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: ganho, stage: this.level.level,
            })
        } else {
            ganho = POINTS.errada
            this.errors += 1
            this.points += ganho
            this.playErro()
            void FX.flash(this, C.alerta, { duration: 420, peak: 0.16 })
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: ganho, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
        }
        this.emitCheckpoint()

        await FX.wait(this, 260)
        if (gen !== this.gen) return

        // ── 4. o porquê ───────────────────────────────────────────────
        this.explicacao = createExplicacao(this, {
            texto: this.explicar(acertou, justificou, i),
            tone: acertou ? C.ok : C.alerta,
            label: acertou ? 'CONTINUAR' : 'TENTAR DE NOVO',
            onClick: () => this.onContinuar(acertou),
        })
        this.locked = false
    }

    /**
     * O que dizer.
     *
     * Acertar sem ter grifado a pista é dito com todas as letras. Não é
     * repreensão: é a diferença entre ter verificado e ter chutado bonito, e é
     * exatamente essa diferença que a habilidade quer que a criança aprenda a
     * enxergar em si mesma.
     */
    private explicar(acertou: boolean, justificou: boolean, escolhida: number): string {
        const porque = this.caso.porque
        if (!acertou) {
            return `A página ${LETRAS[escolhida] ?? '?'} não era a mais confiável. ${porque}`
        }
        return justificou
            ? `${porque}  ·  E você já tinha grifado essa pista antes de escolher.`
            : `${porque}  ·  Só que você não grifou essa pista: desta vez foi no olho.`
    }

    private onContinuar(acertou: boolean) {
        if (this.state !== 'revelando' || this.locked || this.ended) return
        this.playToque()

        /*
         * Errar não empurra o caso para frente.
         *
         * A criança volta para as MESMAS páginas, agora sabendo em qual era
         * para confiar — e refaz a escolha com a própria mão. Avançar depois de
         * um erro ensinaria que a consequência não muda nada. E a pergunta
         * volta SEM ser datilografada de novo: é a mesma frase, e dois segundos
         * de máquina de escrever entre a criança e a segunda tentativa é tempo
         * que ela não espera.
         */
        if (!acertou) {
            this.abrirCaso(false)
            this.pergunta.set(this.caso.pergunta)
            return
        }

        void this.fecharCaso()
    }

    /* ═══════════════════════════════════════════════════ fim do caso */

    private async fecharCaso() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.explicacao?.destroy()
        this.explicacao = undefined

        void FX.flash(this, C.white, { duration: 240, peak: 0.14 })
        showToast(this, this.caso.successLine, C.ok, 2600)

        /*
         * As páginas resolvidas saem pela esquerda, uma atrás da outra.
         *
         * O escalonamento é feito à mão em vez de com `FX.stagger` porque
         * `stagger` só aceita objetos do Phaser, e o que está aqui é a interface
         * `Cartao` — que não é um GameObject, é quem manda num punhado deles.
         */
        await FX.all(...this.cartoes.map((c, i) =>
            FX.wait(this, i * 90).then(() => c.sair(-(W + 240)))))
        if (gen !== this.gen) return
        await FX.wait(this, 2200)
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

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Caso encerrado!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.marca,
                panelColor: C.papel,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Abrindo o próximo dossiê...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.marca, C.ok, C.papel, C.edge] })
        showLevelComplete(this, {
            title: 'Caçador de fontes!',
            subtitle: this.noOlho > 0
                ? `${this.justificadas} decisões justificadas · ${this.noOlho} no olho`
                : 'Todas as decisões justificadas com uma pista grifada',
            message: this.noOlho > 0
                ? 'Acertar sem grifar a pista é acertar sem saber por quê — e da próxima vez pode não dar certo. Grifar é o que separa verificar de chutar.'
                : 'Você não escolheu nenhuma página no chute: em todas, grifou antes a linha que decidia. É isso que é verificar uma fonte.',
            accent: C.ok,
            panelColor: C.papel,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.edge,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonX` e `balloonY`, e nunca abaixo de 545: o botão
     * "Próximo" nasce 46px ABAIXO do balão, e mais do que isso o joga para fora
     * da tela.
     *
     * E o balão sempre vai para o LADO oposto ao recorte: os cartões ocupam a
     * altura toda da área jogável, então não existe faixa horizontal livre —
     * o jeito de não cobrir o que está sendo apontado é sair de lado.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const { w, xs } = this.grade()
        const cx = xs[0]

        const cartaoSpot = { x: cx, y: CARTAO.cy, w: w + 30, h: CARTAO.h + 30 }
        const linhaSpot = {
            x: cx, y: CARTAO.cy + CARTAO.linha1Y + 2 * CARTAO.linhaGap,
            w, h: CARTAO.linhaH + 16,
        }
        const botaoSpot = {
            x: cx, y: ESCOLHER.y,
            w: w - ESCOLHER.pad + 40, h: ESCOLHER.h + 28,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora as duas páginas têm endereço sério e gente que assina. O que separa uma da outra é a data e de onde cada uma tirou o que diz.',
                shape: 'rect', ...cartaoSpot, balloonX: 900, balloonY: 380,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Três páginas, e duas dizem a mesma coisa. Cuidado: às vezes elas concordam só porque copiaram a mesma fonte velha.',
                shape: 'rect', ...cartaoSpot, balloonX: 860, balloonY: 380,
            }]
        }

        return [
            {
                text: 'Toda página tem sempre as mesmas quatro coisas: o endereço lá em cima, quem escreveu, de quando é, e de onde ela tirou o que diz.',
                shape: 'rect', ...cartaoSpot, balloonX: 900, balloonY: 380,
            },
            {
                text: 'Toque numa linha para grifar com o marca-texto. Grife o que te fizer confiar — ou desconfiar.',
                shape: 'rect', ...linhaSpot, balloonX: 900, balloonY: 300,
            },
            {
                text: 'Depois escolha a página em que você confia. Se tiver grifado a pista que decide o caso, ganha mais pontos.',
                shape: 'rect', ...botaoSpot, balloonX: 900, balloonY: 320,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co08-l${this.level.level}`,
            once: !force,
            accent: C.marca,
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

    /** O grifo sobe quando marca e desce quando desmarca: o gesto tem direção. */
    private playGrifo(ligada: boolean) {
        this.playTone(ligada ? 520 : 380, 0.07, 'triangle', 0.05)
    }
    private playToque() { this.playTone(620, 0.05, 'sine', 0.05) }
    private playEscolha() { this.playTone(700, 0.1, 'sine', 0.06) }
    /** O baque do carimbo: grave e curto, como madeira na mesa. */
    private playCarimbo() { this.playTone(130, 0.13, 'square', 0.09) }
    private playAcende() { this.playTone(880, 0.09, 'triangle', 0.06) }
    private playErro() { this.playTone(200, 0.22, 'square', 0.07) }
    private playCerta() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.12)))
    }
}
