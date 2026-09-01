import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/levels'
import { PRINCIPIOS } from '../data/principios'
import { C } from '../data/theme'
import { HUD, SELOS, SITUACAO, FICHA, ACOES, IMPACTO } from '../data/layout'
import type { Caso, CaseState, Efeito, Marca, Passo, Principio } from '../types'

import {
    createSala, createHud, createSituacao, createFicha, createAcoes,
    createImpacto, createBigButton, showToast, ACCENT,
    type Acoes, type BigButton, type Ficha, type Hud, type Impacto,
    type Situacao,
} from './effects'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

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

    /* ── a missão em andamento ─────────────────────────────────────── */

    /** Qual decisão do caso está aberta: 0, ou 1 no Nível 3. */
    private passoIdx = 0
    /** Quantas vezes a criança agiu sem ter virado a ficha. */
    private noEscuro = 0

    /**
     * O painel: o que cada princípio acumulou na partida inteira.
     *
     * Ele é o placar E o relatório final. Nada aparece no fim que a criança já
     * não estivesse vendo acender nos selos do HUD.
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
        this.hud.setSelos(this.marcas)

        this.situacao = createSituacao(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de uma missão qualquer.
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
        this.emitCheckpoint()

        /*
         * A FICHA ENTRA ANTES DO TUTORIAL.
         *
         * O tutorial recorta a tela e aponta o balão para o recorte. Rodando
         * primeiro, ele recortaria tela vazia e falaria de uma ficha que ainda
         * não existe.
         */
        this.abrirPasso(0, true)
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
     * A ficha é reconstruída a cada passo de propósito, e por dois motivos. No
     * Nível 3 o segundo passo é sobre o MESMO arquivo, e quem já esqueceu que
     * tem sete rostos naquela foto tem o direito de conferir outra vez antes de
     * decidir para quem manda. E depois de um alerta, a ficha precisa voltar
     * limpa: o carimbo torto, o cadeado quebrado e os olhos espiando são a
     * consequência da tentativa anterior, não o novo estado do arquivo.
     *
     * `entrando` separa os dois casos: missão nova, a ficha desliza da direita;
     * mesma missão, ela só reaparece no lugar.
     */
    private abrirPasso(i: number, entrando: boolean) {
        this.passoIdx = i
        this.state = 'lendo'
        this.clearPalco()

        const passo = this.passo
        const tom = this.tom

        this.ficha = createFicha(this, {
            arquivo: this.caso.arquivo,
            tone: tom,
            entrando,
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

    /**
     * A ordem importa, e é ela que faz o jogo deixar de ser estático:
     *
     *   1. o cartão escolhido VOA da coluna até a ficha
     *   2. a consequência ACONTECE com o arquivo
     *   3. o selo do princípio carimba lá em cima
     *   4. e só então a frase explica o que os olhos já viram
     *
     * Antes o passo 4 era o único que existia, e por isso "escolher" e "o que
     * aconteceu" pareciam duas coisas sem relação: um cartão sumia aqui e um
     * painel de texto aparecia acolá.
     */
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

        // ── 1. o cartão voa ───────────────────────────────────────────
        this.playVoo()
        await this.acoes?.escolher(j)
        if (gen !== this.gen) return
        this.acoes?.destroy()
        this.acoes = undefined

        // ── 2. a consequência acontece com o arquivo ──────────────────
        this.playEfeito(acao.efeito, acao.certa)
        if (!acao.certa) void FX.flash(this, C.alerta, { duration: 420, peak: 0.16 })
        await this.ficha?.reagir(acao.efeito, acao.certa)
        if (gen !== this.gen) return

        // ── 3. o selo carimba ─────────────────────────────────────────
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
                this.lives.lose(); this.livesLeft = this.lives.remaining
        }
        this.hud.setSelos(this.marcas)
        void this.hud.carimbarSelo(passo.principio, acao.certa)
        this.emitCheckpoint()

        await FX.wait(this, 260)
        if (gen !== this.gen) return

        /*
         * ── 4. a frase ────────────────────────────────────────────────
         *
         * O texto muda quando a criança decidiu de olho fechado. É a linha
         * mais importante do jogo: não basta ter errado, é preciso ver que a
         * resposta estava escrita e que ela não olhou. Quando acerta sem
         * conferir, o jogo também diz — foi sorte, e sorte não é método.
         */
        let texto = acao.impacto
        if (!conferiu && !acao.certa) {
            texto = `Você não virou a ficha. A etiqueta dizia: "${this.caso.arquivo.etiqueta.permissao}".  ${texto}`
        } else if (!conferiu && acao.certa) {
            texto = `${texto}  ·  Só que você decidiu sem virar a ficha: desta vez deu certo por sorte.`
        }

        this.impacto = createImpacto(this, { certa: acao.certa, texto })

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
         * e com a ficha limpa ali para virar. Avançar depois de um alerta
         * ensinaria que a consequência não muda nada.
         *
         * E a situação volta SEM ser datilografada de novo: é a mesma frase, e
         * dois segundos de máquina de escrever entre a criança e a segunda
         * tentativa é tempo que ela não tem paciência de esperar.
         */
        if (!certa) {
            this.abrirPasso(this.passoIdx, false)
            this.situacao.set(this.passo.situacao)
            return
        }

        if (!ultimo) {
            this.abrirPasso(this.passoIdx + 1, false)
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
        this.impacto?.destroy(); this.impacto = undefined
        this.continuar?.destroy(); this.continuar = undefined

        void FX.sparks(this, FICHA.cx, FICHA.cy, { color: C.ok, count: 26, spread: 280 })
        void FX.flash(this, C.white, { duration: 240, peak: 0.16 })

        /*
         * ── A FRASE DE FECHO NÃO ENTRA NA FAIXA DO ENUNCIADO ─────────────
         *
         * Ela entrava, e era esse o motivo de o enunciado "sumir rápido demais
         * para a criança ler": na virada de missão a mesma faixa era reescrita
         * TRÊS vezes em pouco mais de um segundo — o enunciado, a frase de
         * fecho por cima dele, e o enunciado da missão seguinte por cima dos
         * dois. Quem ainda estava lendo via a faixa piscando texto.
         *
         * Agora a faixa muda uma vez por missão, e só. O fecho é um recado que
         * sobe no meio da tela, no espaço que a ficha acabou de deixar vago.
         */
        showToast(this, this.caso.successLine, C.ok, 2600)

        // a ficha resolvida sai de cena, e a próxima entra pela direita
        await this.ficha?.sair()
        if (gen !== this.gen) return
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

    /**
     * O relatório.
     *
     * É aqui que os resumos dos quatro princípios aparecem — eles saíram do
     * rodapé, onde ficavam parados o jogo inteiro, e voltam no único momento em
     * que a criança tem tempo de lê-los. O briefing da habilidade pede um
     * relatório final de princípios respeitados; é este.
     */
    private relatorio(): string {
        return PRINCIPIOS.map(p => {
            const m = this.marcas[p.key]
            const estado = !m.respeitado
                ? 'ainda não'
                : m.alertas > 0
                    ? `ok, com ${m.alertas} alerta${m.alertas > 1 ? 's' : ''}`
                    : 'ok'
            return `${p.nome} — ${p.resumo}: ${estado}`
        }).join('\n')
    }

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
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.autoria, C.permissao, C.privacidade, C.guarda] })
        showLevelComplete(this, {
            title: 'Painel completo!',
            subtitle: this.noEscuro > 0
                ? `Você decidiu ${this.noEscuro} vez${this.noEscuro > 1 ? 'es' : ''} sem virar a ficha`
                : 'Você conferiu a etiqueta antes de todas as decisões',
            message: this.relatorio(),
            accent: C.ok,
            panelColor: C.paper,
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
                    color: C.permissao,
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
     * E o balão nunca cai sobre o próprio recorte. Por isso o passo das ações
     * recorta só o PRIMEIRO cartão em vez dos três: a coluna inteira ocupa de
     * 226 a 642, e não sobraria faixa nenhuma para o balão caber longe dela.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const fichaSpot = {
            x: FICHA.cx, y: FICHA.cy,
            w: FICHA.w + 40, h: FICHA.h + 40,
        }
        const acoesSpot = {
            x: ACOES.cx, y: ACOES.primeiroCY,
            w: ACOES.w + 40, h: ACOES.h + 40,
        }
        const selosSpot = {
            x: SELOS.cx, y: SELOS.cy,
            w: 4 * SELOS.w + 3 * SELOS.gap + 24, h: SELOS.h + 22,
        }
        const situacaoSpot = {
            x: 640, y: SITUACAO.y + SITUACAO.h / 2,
            w: SITUACAO.w + 20, h: SITUACAO.h + 20,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora as etiquetas discordam entre si. Uma proíbe, outra libera tudo — e tem foto com o rosto de gente. Vire antes de escolher.',
                shape: 'rect', ...fichaSpot, balloonX: 880, balloonY: 400,
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
                shape: 'rect', ...fichaSpot, balloonX: 880, balloonY: 400,
            },
            {
                text: 'Depois escolha o que fazer. Dá para escolher sem virar a ficha — mas aí você está decidindo no escuro, e o jogo percebe.',
                shape: 'rect', ...acoesSpot, balloonX: 872, balloonY: 540,
            },
            {
                text: 'Aqui em cima ficam os quatro cuidados. Cada escolha boa acende um deles; um deslize deixa uma marca laranja.',
                shape: 'rect', ...selosSpot, balloonX: 640, balloonY: 300,
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
    private playVoo() { this.playTone(440, 0.12, 'sine', 0.05) }
    private playAlerta() { this.playTone(210, 0.22, 'square', 0.07) }
    private playCerta() {
        [523, 784].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.16, 'sine', 0.11)))
    }

    /**
     * O som do gesto, antes do som do resultado.
     *
     * Cada consequência soa como a coisa que ela é: o carimbo bate grave, o
     * cadeado estala, as cópias escapam agudas, o arquivo apagado desce. É a
     * mesma informação que está na tela, chegando pelo ouvido — que aos nove
     * anos costuma chegar primeiro.
     */
    private playEfeito(efeito: Efeito, ok: boolean) {
        switch (efeito) {
            case 'credito':
            case 'cofre':
                // o baque do carimbo e o do cadeado: graves e curtos
                this.playTone(140, 0.14, 'square', 0.08)
                return
            case 'semCredito':
                this.playTone(300, 0.2, 'triangle', 0.06)
                return
            case 'pergunta':
                this.playTone(ok ? 660 : 380, 0.12, 'sine', 0.06)
                return
            case 'trava':
                this.playTone(180, 0.3, 'sine', 0.06)
                return
            case 'protege':
            case 'libera':
                this.playTone(700, 0.14, 'triangle', 0.07)
                return
            case 'vaza':
                [900, 1100, 1300].forEach((f, i) =>
                    this.time.delayedCall(i * 70, () => this.playTone(f, 0.07, 'sawtooth', 0.04)))
                return
            case 'link':
                this.playTone(560, 0.16, 'sine', 0.06)
                return
            case 'copia':
                this.playTone(420, 0.1, 'square', 0.05)
                return
            case 'solto':
                this.playTone(240, 0.18, 'sawtooth', 0.05)
                return
            case 'apaga':
                [700, 520, 360].forEach((f, i) =>
                    this.time.delayedCall(i * 80, () => this.playTone(f, 0.1, 'triangle', 0.06)))
                return
        }
    }
}
